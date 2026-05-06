import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  useGetRepresentativesByAddress,
  getGetRepresentativesByAddressQueryKey,
  useGetFederalStateMembers,
  getGetFederalStateMembersQueryKey,
} from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, AlertTriangle } from "lucide-react";
import { useAppState } from "@/lib/app-state";
import { US_STATES, getStateName, getStateFlagUrl } from "@/lib/states";
import type { Representative } from "@workspace/api-client-react";

export function Home() {
  const { selectedState, setSelectedState, lastSearchedAddress, setLastSearchedAddress } = useAppState();
  const [homeDropdownState, setHomeDropdownState] = useState(lastSearchedAddress ? "" : (selectedState ?? ""));
  const [addressInput, setAddressInput] = useState(lastSearchedAddress ?? "");
  const [searchAddress, setSearchAddress] = useState(lastSearchedAddress ?? "");

  const { data, isLoading, error } = useGetRepresentativesByAddress(
    { address: searchAddress },
    {
      query: {
        enabled: !!searchAddress,
        queryKey: getGetRepresentativesByAddressQueryKey({ address: searchAddress }),
      },
    },
  );

  // When address search results arrive, update global selected state to match
  useEffect(() => {
    if (data?.stateCode) {
      setSelectedState(data.stateCode.toUpperCase());
    }
  }, [data?.stateCode, setSelectedState]);

  const showStateMembers = !lastSearchedAddress && !!selectedState;
  const { data: stateMembersData, isLoading: stateMembersLoading } = useGetFederalStateMembers(
    { state: selectedState || "" },
    {
      query: {
        enabled: showStateMembers,
        queryKey: getGetFederalStateMembersQueryKey({ state: selectedState || "" }),
      },
    },
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = addressInput.trim();
    if (trimmed) {
      setSearchAddress(trimmed);
      setLastSearchedAddress(trimmed);
      setHomeDropdownState("");
      setSelectedState(null);
    } else {
      setSearchAddress("");
      setLastSearchedAddress(null);
    }
  };

  const activeStateCode = data?.stateCode?.toUpperCase() ?? selectedState ?? null;
  const activeStateName = getStateName(activeStateCode) ?? "your area";
  const flagUrl = getStateFlagUrl(activeStateCode) ?? getStateFlagUrl("US");

  const getPartyColor = (party?: string) => {
    if (!party) return "bg-gray-100 text-gray-800";
    if (party.toLowerCase().includes("democrat")) return "bg-[#1E40AF] text-white";
    if (party.toLowerCase().includes("republican")) return "bg-[#DC2626] text-white";
    return "bg-gray-200 text-gray-800";
  };

  const groupReps = (reps?: Representative[]) => {
    const safeReps = Array.isArray(reps) ? reps : [];
    const federal = safeReps.filter((r) => r.level === "federal");
    const state = safeReps.filter((r) => r.level === "state");
    const local = safeReps.filter((r) => r.level === "local");
    return { federal, state, local };
  };

  const renderRepCard = (rep: Representative) => {
    const partyColor = getPartyColor(rep.party);

    let linkHref = "#";
    if (rep.level === "federal" && rep.bioguideId) {
      linkHref = `/rep/federal/${rep.bioguideId}`;
    } else if (rep.level === "state" && (rep.openstatesId || rep.name)) {
      const slug = rep.openstatesId || rep.name.toLowerCase().replace(/\s+/g, '-');
      linkHref = `/rep/state/${encodeURIComponent(slug)}`;
    }

    return (
      <Link key={`${rep.name}-${rep.office}`} href={linkHref} className="block group">
        <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-accent">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <Avatar className="h-16 w-16 border-2 border-muted">
              <AvatarImage src={rep.photoUrl} alt={rep.name} className="object-cover object-top" />
              <AvatarFallback>{rep.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h3 className="font-bold text-lg group-hover:text-accent transition-colors">{rep.name}</h3>
              <p className="text-sm text-muted-foreground">{rep.office}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mt-2">
              {rep.party && (
                <Badge className={`${partyColor} hover:${partyColor} font-medium`}>
                  {rep.party}
                </Badge>
              )}
              {rep.chamber && (
                <Badge variant="outline">{rep.chamber}</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <div className="h-[calc(100dvh-4rem)] flex flex-col">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground py-20 px-4 relative overflow-hidden shrink-0">
        {flagUrl && (
          <div
            className="absolute inset-0 opacity-10 bg-cover bg-center"
            style={{ backgroundImage: `url('${flagUrl}')` }}
          />
        )}
        <div className="container mx-auto max-w-3xl relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
            Know Your Representatives
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Discover who represents you at the federal, state, and local levels. Track their bills, votes, and campaign finance.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col gap-4 max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter your address..."
                  className="pl-10 h-14 text-lg bg-background text-foreground border-0 shadow-lg rounded-xl focus-visible:ring-accent"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="h-14 px-8 text-lg font-bold bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl shadow-lg">
                Search
              </Button>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-primary-foreground/70">Or select a state:</span>
              <Select
                value={homeDropdownState}
                onValueChange={(v) => {
                  setHomeDropdownState(v);
                  setSelectedState(v || null);
                  setAddressInput("");
                  setSearchAddress("");
                  setLastSearchedAddress(null);
                }}
              >
                <SelectTrigger className="w-56 bg-background text-foreground border-0 shadow-lg rounded-xl">
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((s) => (
                    <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>
      </div>

      {/* Results header - address search */}
      {!isLoading && !error && data && (data.normalizedAddress || data.stateName) && (
        <div className="shrink-0 bg-muted/30">
          <div className="container mx-auto px-4 pt-6">
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Showing results for</p>
            <h2 className="text-2xl font-semibold">{data.normalizedAddress ?? activeStateName}</h2>
          </div>
        </div>
      )}

      {/* Results header - state members */}
      {!isLoading && !stateMembersLoading && !error && showStateMembers && stateMembersData && (
        <div className="shrink-0 bg-muted/30">
          <div className="container mx-auto px-4 pt-6">
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Showing federal representatives for</p>
            <h2 className="text-2xl font-semibold">{stateMembersData.stateName ?? activeStateName}</h2>
          </div>
        </div>
      )}

      {/* Scrollable results */}
      <div className="flex-1 overflow-y-auto bg-muted/30">
        <div className="container mx-auto px-4 pt-6 pb-12">
          {(isLoading || stateMembersLoading) && (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg text-muted-foreground">
                {isLoading ? "Finding your representatives..." : `Loading federal representatives for ${activeStateName}...`}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-lg text-center max-w-2xl mx-auto">
              <h3 className="font-bold text-lg mb-2">Error finding representatives</h3>
              <p>Please check your address and try again. Make sure it&apos;s a valid US address.</p>
            </div>
          )}

          {!isLoading && !error && data && (
            <div className="space-y-16">
              {(() => {
                const { federal, state, local } = groupReps(data.representatives ?? []);
                return (
                  <>
                    {federal.length > 0 && (
                      <section>
                        <h2 className="text-3xl font-black mb-6 border-b pb-2 sticky top-0 bg-muted z-10">Federal Representatives</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {federal.map(renderRepCard)}
                        </div>
                      </section>
                    )}

                    {state.length > 0 && (
                      <section>
                        <div className="flex items-center justify-between border-b pb-2 mb-6 sticky top-0 bg-muted z-10">
                          <h2 className="text-3xl font-black">State Representatives</h2>
                          {data?.stateRepCache?.stale && (
                            <div className="flex items-center gap-1.5 text-sm text-amber-700">
                              <AlertTriangle className="h-4 w-4" />
                              <span>Data may be outdated</span>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {state.map(renderRepCard)}
                        </div>
                      </section>
                    )}

                    {local.length > 0 && (
                      <section>
                        <h2 className="text-3xl font-black mb-6 border-b pb-2 sticky top-0 bg-muted z-10">Local Representatives</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {local.map(renderRepCard)}
                        </div>
                      </section>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {!isLoading && !stateMembersLoading && !error && showStateMembers && stateMembersData && (
            <div className="space-y-16">
              {stateMembersData.representatives && stateMembersData.representatives.length > 0 && (
                <section>
                  <h2 className="text-3xl font-black mb-6 border-b pb-2 sticky top-0 bg-muted z-10">Federal Representatives</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stateMembersData.representatives.map(renderRepCard)}
                  </div>
                </section>
              )}
            </div>
          )}

          {!isLoading && !stateMembersLoading && !error && !data && !stateMembersData && (
            <div className="text-center py-20 text-muted-foreground">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 opacity-50" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Ready to search</h2>
              <p className="max-w-md mx-auto">Enter your full address above or select a state to find out who represents you in Congress, the State House, and locally.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
