import { Router } from "express";
import { GetRepresentativesByAddressQueryParams } from "@workspace/api-zod";

const router = Router();

const OPENSTATES_API_KEY = process.env.OPENSTATES_API_KEY;
const CONGRESS_API_KEY = process.env.CONGRESS_API_KEY;

async function geocodeAddress(address: string): Promise<{
  lat: number;
  lng: number;
  district: string | null;
  stateSenateDistrict: string | null;
  stateHouseDistrict: string | null;
  normalizedAddress: string | null;
}> {
  const url = new URL("https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress");
  url.searchParams.set("address", address);
  url.searchParams.set("benchmark", "Public_AR_Current");
  url.searchParams.set("vintage", "Current_Current");
  url.searchParams.set("layers", "all");
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Census geocoder error ${res.status}`);
  const data = await res.json() as any;

  const match = data.result?.addressMatches?.[0];
  if (!match) throw new Error("Address not found");

  const lat = match.coordinates?.y;
  const lng = match.coordinates?.x;
  const geos = match.geographies ?? {};

  const congressionalKey = Object.keys(geos).find((k) => k.includes("Congressional Districts"));
  const congressional = congressionalKey ? geos[congressionalKey]?.[0] : null;
  const district = congressional?.BASENAME ?? null;

  // Census returns year-prefixed keys like "2024 State Legislative Districts - Upper"
  // and district numbers with leading zeros like "046" — normalize to plain integer strings
  const upperKey = Object.keys(geos).find((k) => k.includes("State Legislative Districts - Upper"));
  const lowerKey = Object.keys(geos).find((k) => k.includes("State Legislative Districts - Lower"));
  const upperRaw = upperKey ? (geos[upperKey]?.[0]?.SLDU ?? geos[upperKey]?.[0]?.BASENAME ?? null) : null;
  const lowerRaw = lowerKey ? (geos[lowerKey]?.[0]?.SLDL ?? geos[lowerKey]?.[0]?.BASENAME ?? null) : null;
  const upperDistrict = upperRaw ? String(parseInt(upperRaw, 10)) : null;
  const lowerDistrict = lowerRaw ? String(parseInt(lowerRaw, 10)) : null;

  const addr = match.addressComponents;
  const normalizedAddress = addr
    ? `${addr.fromAddress ?? ""} ${addr.preDirection ?? ""} ${addr.streetName ?? ""} ${addr.suffixType ?? ""}, ${addr.city ?? ""}, ${addr.state ?? ""} ${addr.zip ?? ""}`.replace(/\s+/g, " ").trim()
    : null;

  return { lat, lng, district, stateSenateDistrict: upperDistrict, stateHouseDistrict: lowerDistrict, normalizedAddress };
}

async function fetchCongressMDMembers(district: string): Promise<any[]> {
  if (!CONGRESS_API_KEY) return [];
  try {
    // Senators (statewide)
    const senatorsUrl = new URL("https://api.congress.gov/v3/member/MD");
    senatorsUrl.searchParams.set("currentMember", "true");
    senatorsUrl.searchParams.set("limit", "20");
    senatorsUrl.searchParams.set("api_key", CONGRESS_API_KEY);
    senatorsUrl.searchParams.set("format", "json");

    const senatorsRes = await fetch(senatorsUrl.toString());
    const senatorsData = senatorsRes.ok ? (await senatorsRes.json() as any) : { members: [] };
    const senators = (senatorsData.members ?? []).filter((m: any) =>
      !m.district && m.terms?.item?.some((t: any) => t.chamber === "Senate" && !t.endYear)
    );

    // House member for the specific district
    let houseMember: any[] = [];
    if (district) {
      const districtNum = parseInt(district, 10);
      const houseUrl = new URL(`https://api.congress.gov/v3/member/MD/${districtNum}`);
      houseUrl.searchParams.set("currentMember", "true");
      houseUrl.searchParams.set("api_key", CONGRESS_API_KEY);
      houseUrl.searchParams.set("format", "json");
      const houseRes = await fetch(houseUrl.toString());
      if (houseRes.ok) {
        const houseData = await houseRes.json() as any;
        houseMember = houseData.members ?? [];
      }
    }

    const allFederal = [...senators, ...houseMember];
    return allFederal.map((m: any) => {
      const latestTerm = m.terms?.item?.slice(-1)[0];
      const chamber = latestTerm?.chamber;
      const isSenate = chamber === "Senate";
      return {
        name: formatCongressName(m.name),
        office: isSenate ? `U.S. Senator for Maryland` : `U.S. Representative, MD-${district}`,
        party: m.partyName,
        photoUrl: m.depiction?.imageUrl,
        level: "federal" as const,
        chamber: isSenate ? "Senate" : "House",
        bioguideId: m.bioguideId,
        district: m.district ? String(m.district) : undefined,
      };
    });
  } catch (e) {
    return [];
  }
}

function formatCongressName(name: string): string {
  // Congress returns "Last, First" format
  const parts = name.split(", ");
  if (parts.length === 2) return `${parts[1]} ${parts[0]}`;
  return name;
}

async function fetchOpenStatesPeople(district: string, orgClass: "upper" | "lower"): Promise<any[]> {
  if (!OPENSTATES_API_KEY) return [];
  const url = new URL("https://v3.openstates.org/people");
  url.searchParams.set("jurisdiction", "md");
  url.searchParams.set("district", district);
  url.searchParams.set("org_classification", orgClass);
  url.searchParams.set("per_page", "10");
  const res = await fetch(url.toString(), { headers: { "X-API-KEY": OPENSTATES_API_KEY } });
  if (!res.ok) return [];
  const data = await res.json() as any;
  return data.results ?? [];
}

function mapOsPerson(person: any): any {
  const role = person.current_role ?? {};
  return {
    name: person.name ?? "",
    office: role.title ?? (role.org_classification === "upper" ? "State Senator" : "State Delegate"),
    party: person.party,
    photoUrl: person.image,
    level: "state" as const,
    chamber: role.org_classification === "upper" ? "Senate" : "House of Delegates",
    openstatesId: person.id,
    district: role.district ? String(role.district) : undefined,
  };
}

async function fetchStateLegislators(stateSenateDistrict: string | null, stateHouseDistrict: string | null): Promise<any[]> {
  if (!OPENSTATES_API_KEY) return [];
  try {
    const queries: Promise<any[]>[] = [];
    if (stateSenateDistrict) queries.push(fetchOpenStatesPeople(stateSenateDistrict, "upper"));
    if (stateHouseDistrict) queries.push(fetchOpenStatesPeople(stateHouseDistrict, "lower"));
    const results = await Promise.all(queries);
    return results.flat().map(mapOsPerson);
  } catch (e) {
    return [];
  }
}

router.get("/representatives", async (req, res) => {
  const parsed = GetRepresentativesByAddressQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "address is required" });
  }

  const { address } = parsed.data;

  try {
    const geo = await geocodeAddress(address);

    const [federalReps, stateReps] = await Promise.all([
      fetchCongressMDMembers(geo.district ?? ""),
      fetchStateLegislators(geo.stateSenateDistrict, geo.stateHouseDistrict),
    ]);

    const representatives = [...federalReps, ...stateReps];

    return res.json({
      address,
      normalizedAddress: geo.normalizedAddress,
      representatives,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching representatives");
    return res.status(500).json({ error: String(err) });
  }
});

export default router;
