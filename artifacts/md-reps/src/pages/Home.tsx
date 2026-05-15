import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  useGetRepresentativesByAddress,
  getGetRepresentativesByAddressQueryKey,
  useGetFederalStateMembers,
  getGetFederalStateMembersQueryKey,
  useSearchFederalBills,
  getSearchFederalBillsQueryKey,
  useSearchStateBills,
  getSearchStateBillsQueryKey,
  useSearchFederalMembers,
  getSearchFederalMembersQueryKey,
  useSearchStateMembers,
  getSearchStateMembersQueryKey,
} from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, AlertTriangle, FileText } from "lucide-react";
import { useAppState } from "@/lib/app-state";
import { US_STATES, getStateName, getStateFlagUrl } from "@/lib/states";
import { partyColor } from "@/lib/rep-utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Representative } from "@workspace/api-client-react";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function Home() {
  const isMobile = useIsMobile();
  const { selectedState, setSelectedState, lastSearchedAddress, setLastSearchedAddress } = useAppState();
  const [homeDropdownState, setHomeDropdownState] = useState(lastSearchedAddress ? "" : (selectedState ?? ""));
  const [addressInput, setAddressInput] = useState(lastSearchedAddress ?? "");
  const [searchAddress, setSearchAddress] = useState(lastSearchedAddress ?? "");
  const [textQuery, setTextQuery] = useState("");
  const [activeTextQuery, setActiveTextQuery] = useState("");
  const [mobileQuery, setMobileQuery] = useState("");
  const [mobileFallbackQuery, setMobileFallbackQuery] = useState<string | null>(null);
  const [mobileAddressAttemptPending, setMobileAddressAttemptPending] = useState(false);
  const [textInputFocused, setTextInputFocused] = useState(false);
  const debouncedTextQuery = useDebounce(textQuery.trim(), 250);

  const acLimit = 5;
  const acEnabled = !!debouncedTextQuery && textInputFocused;
  const acQuery = { q: debouncedTextQuery, limit: acLimit };
  const { data: acFederalBills } = useSearchFederalBills(acQuery, {
    query: { enabled: acEnabled, queryKey: ["autocomplete", "federalBills", acQuery] as const },
  });
  const { data: acStateBills } = useSearchStateBills(acQuery, {
    query: { enabled: acEnabled, queryKey: ["autocomplete", "stateBills", acQuery] as const },
  });
  const { data: acFederalMembers } = useSearchFederalMembers(acQuery, {
    query: { enabled: acEnabled, queryKey: ["autocomplete", "federalMembers", acQuery] as const },
  });
  const { data: acStateMembers } = useSearchStateMembers(acQuery, {
    query: { enabled: acEnabled, queryKey: ["autocomplete", "stateMembers", acQuery] as const },
  });

  const hasAcResults =
    (acFederalBills?.bills?.length ?? 0) > 0 ||
    (acStateBills?.bills?.length ?? 0) > 0 ||
    (acFederalMembers?.members?.length ?? 0) > 0 ||
    (acStateMembers?.members?.length ?? 0) > 0;

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
      setActiveTextQuery("");
    } else {
      setSearchAddress("");
      setLastSearchedAddress(null);
      setActiveTextQuery("");
    }
  };

  const handleTextSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = textQuery.trim();
    if (trimmed) {
      setActiveTextQuery(trimmed);
      setSearchAddress("");
      setLastSearchedAddress(null);
    } else {
      setActiveTextQuery("");
    }
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = mobileQuery.trim();
    if (!trimmed) return;

    // Address-first path
    setSearchAddress(trimmed);
    setLastSearchedAddress(trimmed);
    setHomeDropdownState("");
    setSelectedState(null);
    setActiveTextQuery("");
    setTextQuery(trimmed);

    // Keep pending fallback until address query resolves
    setMobileFallbackQuery(trimmed);
    setMobileAddressAttemptPending(true);
  };

  const textSearchLimit = 5;
  const textSearchParams = { q: activeTextQuery, limit: textSearchLimit };
  const { data: federalBillsSearch, isLoading: fbLoading } = useSearchFederalBills(textSearchParams, {
    query: { enabled: !!activeTextQuery, queryKey: getSearchFederalBillsQueryKey(textSearchParams) },
  });
  const { data: stateBillsSearch, isLoading: sbLoading } = useSearchStateBills(textSearchParams, {
    query: { enabled: !!activeTextQuery, queryKey: getSearchStateBillsQueryKey(textSearchParams) },
  });
  const { data: federalMembersSearch, isLoading: fmLoading } = useSearchFederalMembers(textSearchParams, {
    query: { enabled: !!activeTextQuery, queryKey: getSearchFederalMembersQueryKey(textSearchParams) },
  });
  const { data: stateMembersSearch, isLoading: smLoading } = useSearchStateMembers(textSearchParams, {
    query: { enabled: !!activeTextQuery, queryKey: getSearchStateMembersQueryKey(textSearchParams) },
  });

  const textSearchLoading = fbLoading || sbLoading || fmLoading || smLoading;
  const hasTextResults =
    (federalBillsSearch?.bills?.length ?? 0) > 0 ||
    (stateBillsSearch?.bills?.length ?? 0) > 0 ||
    (federalMembersSearch?.members?.length ?? 0) > 0 ||
    (stateMembersSearch?.members?.length ?? 0) > 0;

  const activeStateCode = data?.stateCode?.toUpperCase() ?? selectedState ?? null;
  const activeStateName = getStateName(activeStateCode) ?? "your area";
  const flagUrl = getStateFlagUrl(activeStateCode) ?? getStateFlagUrl("US");

  useEffect(() => {
    if (!isMobile || !mobileAddressAttemptPending) return;
    if (!searchAddress) return;
    if (isLoading) return;

    const repsCount = data?.representatives?.length ?? 0;
    const hasAddressSignal = !!(data?.normalizedAddress || data?.stateCode || repsCount > 0);
    const addressFailed = !!error || !hasAddressSignal;

    if (addressFailed && mobileFallbackQuery) {
      // Fallback to bills/representatives text search if address lookup failed
      setSearchAddress("");
      setLastSearchedAddress(null);
      setActiveTextQuery(mobileFallbackQuery);
    }

    setMobileAddressAttemptPending(false);
    setMobileFallbackQuery(null);
  }, [
    isMobile,
    mobileAddressAttemptPending,
    searchAddress,
    isLoading,
    error,
    data,
    mobileFallbackQuery,
    setLastSearchedAddress,
  ]);

  function renderTextSearchResults() {
    if (textSearchLoading) {
      return (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Searching bills and representatives...</p>
        </div>
      );
    }

    if (!hasTextResults) {
      return (
        <div className="text-center py-20 text-muted-foreground">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="h-10 w-10 opacity-50" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">No results found</h2>
          <p className="max-w-md mx-auto">Try a different search term.</p>
        </div>
      );
    }

    return (
      <div className="space-y-12">
        {(federalMembersSearch?.members?.length ?? 0) > 0 && (
          <section>
            <div className="flex items-center justify-between border-b pb-2 mb-4 sticky top-0 bg-muted z-10">
              <h2 className="text-2xl font-black">Federal Representatives</h2>
              <Badge variant="secondary">{federalMembersSearch?.totalCount}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {federalMembersSearch?.members?.map((member) => (
                <Link key={member.bioguideId} href={`/rep/federal/${member.bioguideId}`} className="block group">
                  <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-accent">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                      <Avatar className="h-14 w-14 border-2 border-muted">
                        <AvatarImage src={member.photoUrl} alt={member.name} className="object-cover object-top" />
                        <AvatarFallback>{member.name?.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <h3 className="font-bold text-base group-hover:text-accent transition-colors">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.chamber}{member.district ? `, District ${member.district}` : ""}</p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {member.party && <Badge className={`${partyColor(member.party)} hover:${partyColor(member.party)} font-medium text-xs`}>{member.party}</Badge>}
                        {member.state && <Badge variant="outline" className="text-xs">{member.state}</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {(stateMembersSearch?.members?.length ?? 0) > 0 && (
          <section>
            <div className="flex items-center justify-between border-b pb-2 mb-4 sticky top-0 bg-muted z-10">
              <h2 className="text-2xl font-black">State Representatives</h2>
              <Badge variant="secondary">{stateMembersSearch?.totalCount}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stateMembersSearch?.members?.map((member) => (
                <Link key={member.id} href={`/rep/state/${encodeURIComponent(member.id)}`} className="block group">
                  <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-accent">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                      <Avatar className="h-14 w-14 border-2 border-muted">
                        <AvatarImage src={member.photoUrl} alt={member.name} className="object-cover object-top" />
                        <AvatarFallback>{member.name?.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <h3 className="font-bold text-base group-hover:text-accent transition-colors">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.chamber}{member.district ? `, District ${member.district}` : ""}</p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {member.party && <Badge className={`${partyColor(member.party)} hover:${partyColor(member.party)} font-medium text-xs`}>{member.party}</Badge>}
                        {member.jurisdiction && <Badge variant="outline" className="text-xs">{member.jurisdiction}</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {(federalBillsSearch?.bills?.length ?? 0) > 0 && (
          <section>
            <div className="flex items-center justify-between border-b pb-2 mb-4 sticky top-0 bg-muted z-10">
              <h2 className="text-2xl font-black">Federal Bills</h2>
              <Badge variant="secondary">{federalBillsSearch?.totalCount}</Badge>
            </div>
            <div className="space-y-3">
              {federalBillsSearch?.bills?.map((bill) => (
                <Link key={bill.id} href={(bill.number && bill.congress)
                  ? `/bills/federal/${bill.congress}/${bill.number.split(" ")[0]?.toLowerCase()}/${bill.number.split(" ")[1]}`
                  : "#"}
                  className="block group"
                >
                  <Card className="hover:border-primary transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {bill.number && <Badge variant="outline" className="text-xs font-mono shrink-0">{bill.number}</Badge>}
                            {bill.chamber && <Badge variant="secondary" className="text-xs">{bill.chamber}</Badge>}
                          </div>
                          <p className="font-medium text-sm line-clamp-2">{bill.title}</p>
                          {bill.latestAction && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{bill.latestAction}</p>}
                        </div>
                        {bill.introducedDate && <span className="text-xs text-muted-foreground shrink-0">{bill.introducedDate}</span>}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {(stateBillsSearch?.bills?.length ?? 0) > 0 && (
          <section>
            <div className="flex items-center justify-between border-b pb-2 mb-4 sticky top-0 bg-muted z-10">
              <h2 className="text-2xl font-black">State Bills</h2>
              <Badge variant="secondary">{stateBillsSearch?.totalCount}</Badge>
            </div>
            <div className="space-y-3">
              {stateBillsSearch?.bills?.map((bill) => (
                <Link key={bill.id} href={`/bills/state/${encodeURIComponent(bill.id)}`} className="block group">
                  <Card className="hover:border-primary transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {bill.identifier && <Badge variant="outline" className="text-xs font-mono shrink-0">{bill.identifier}</Badge>}
                            {bill.chamber && <Badge variant="secondary" className="text-xs">{bill.chamber}</Badge>}
                          </div>
                          <p className="font-medium text-sm line-clamp-2">{bill.title}</p>
                          {bill.latestAction && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{bill.latestAction}</p>}
                        </div>
                        {bill.introducedDate && <span className="text-xs text-muted-foreground shrink-0">{bill.introducedDate}</span>}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  const groupReps = (reps?: Representative[]) => {
    const safeReps = Array.isArray(reps) ? reps : [];
    const federal = safeReps.filter((r) => r.level === "federal");
    const state = safeReps.filter((r) => r.level === "state");
    const local = safeReps.filter((r) => r.level === "local");
    return { federal, state, local };
  };

  const renderRepCard = (rep: Representative) => {
    const partyCls = partyColor(rep.party);

    let linkHref = "#";
    if (rep.level === "federal" && rep.bioguideId) {
      linkHref = `/rep/federal/${rep.bioguideId}`;
    } else if (rep.level === "state" && (rep.openstatesId || rep.name)) {
      const slug = rep.openstatesId || rep.name.toLowerCase().replace(/\s+/g, '-');
      linkHref = `/rep/state/${encodeURIComponent(slug)}`;
    }

    return (
      <Link key={rep.bioguideId || rep.openstatesId || `${rep.name}-${rep.office}`} href={linkHref} className="block group">
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
                <Badge className={`${partyCls} hover:${partyCls} font-medium`}>
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
    <div className="h-[calc(100dvh-4rem)] flex flex-col overflow-hidden">
      {/* Hero Section */}
      <div
        data-testid="home-hero"
        className="bg-primary text-primary-foreground py-20 px-4 relative overflow-visible shrink-0 z-20"
      >
        <div data-testid="home-hero-background" className="absolute inset-0 overflow-hidden pointer-events-none">
          {flagUrl && (
            <div
              className="absolute inset-0 opacity-10 bg-cover bg-center"
              style={{ backgroundImage: `url('${flagUrl}')` }}
            />
          )}
        </div>
        <div className="container mx-auto max-w-3xl relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
            Know Your Representatives
          </h1>
          <p className="hidden sm:block text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Discover who represents you at the federal, state, and local levels. Track their bills, votes, and campaign finance.
          </p>

          <div className="flex flex-col gap-4 max-w-xl mx-auto">
            {isMobile ? (
              <form onSubmit={handleMobileSearch} className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Enter address, bill, or representative... then hit <return>"
                      className="pl-10 h-14 text-lg bg-background text-foreground border-0 shadow-lg rounded-xl focus-visible:ring-accent"
                      value={mobileQuery}
                      onChange={(e) => setMobileQuery(e.target.value)}
                    />
                  </div>
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
                      setActiveTextQuery("");
                      setMobileQuery("");
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
            ) : (
            <form onSubmit={handleSearch} className="flex flex-col gap-4">
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
                    setActiveTextQuery("");
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
            )}
            {!isMobile && (
              <>
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-primary-foreground/20" />
                  </div>
                  <span className="relative px-2 text-xs text-primary-foreground/60 uppercase tracking-wide mx-auto bg-primary">or</span>
                </div>
                <form
                  data-testid="global-search-form"
                  onSubmit={handleTextSearch}
                  className="relative flex flex-col sm:flex-row gap-3 z-30"
                >
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                    <Input
                      type="text"
                      placeholder="Search bills & representatives..."
                      className="pl-10 h-12 text-lg bg-background text-foreground border-0 shadow-lg rounded-xl focus-visible:ring-accent relative z-10"
                      value={textQuery}
                      onChange={(e) => setTextQuery(e.target.value)}
                      onFocus={() => setTextInputFocused(true)}
                      onBlur={(e) => {
                        // Only blur if focus moves outside the search form container
                        const related = e.relatedTarget as HTMLElement | null;
                        const form = related?.closest('[data-testid="global-search-form"]');
                        if (!form) setTextInputFocused(false);
                      }}
                    />
                    {textInputFocused && hasAcResults && (
                      <div
                        data-testid="global-search-autocomplete"
                        className="absolute left-0 right-0 top-full mt-1 bg-popover border rounded-xl shadow-xl z-[100] max-h-[min(28rem,60vh)] overflow-y-auto text-left"
                      >
                        {(acFederalMembers?.members?.length ?? 0) > 0 && (
                          <div className="py-2">
                            <p className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Federal Representatives</p>
                            {acFederalMembers?.members?.map((m) => (
                              <Link key={m.bioguideId} href={`/rep/federal/${m.bioguideId}`} className="flex items-center gap-3 px-4 py-2 hover:bg-accent/10 transition-colors"
                                onMouseDown={(e) => e.preventDefault()}
                              >
                                <Avatar className="h-8 w-8 border">
                                  <AvatarImage src={m.photoUrl} alt={m.name} />
                                  <AvatarFallback className="text-xs">{m.name?.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{m.name}</p>
                                  <p className="text-xs text-muted-foreground">{m.chamber}{m.district ? `, District ${m.district}` : ""} · {m.state}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                        {(acStateMembers?.members?.length ?? 0) > 0 && (
                          <div className="py-2 border-t">
                            <p className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">State Representatives</p>
                            {acStateMembers?.members?.map((m) => (
                              <Link key={m.id} href={`/rep/state/${encodeURIComponent(m.id)}`} className="flex items-center gap-3 px-4 py-2 hover:bg-accent/10 transition-colors"
                                onMouseDown={(e) => e.preventDefault()}
                              >
                                <Avatar className="h-8 w-8 border">
                                  <AvatarImage src={m.photoUrl} alt={m.name} />
                                  <AvatarFallback className="text-xs">{m.name?.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{m.name}</p>
                                  <p className="text-xs text-muted-foreground">{m.chamber}{m.district ? `, District ${m.district}` : ""} · {m.jurisdiction}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                        {(acFederalBills?.bills?.length ?? 0) > 0 && (
                          <div className="py-2 border-t">
                            <p className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Federal Bills</p>
                            {acFederalBills?.bills?.map((b) => (
                              <Link key={b.id} href={(b.number && b.congress)
                                ? `/bills/federal/${b.congress}/${b.number.split(" ")[0]?.toLowerCase()}/${b.number.split(" ")[1]}`
                                : "#"}
                                className="flex items-start gap-3 px-4 py-2 hover:bg-accent/10 transition-colors"
                                onMouseDown={(e) => e.preventDefault()}
                              >
                                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{b.title}</p>
                                  <p className="text-xs text-muted-foreground">{b.number ?? b.id}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                        {(acStateBills?.bills?.length ?? 0) > 0 && (
                          <div className="py-2 border-t">
                            <p className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">State Bills</p>
                            {acStateBills?.bills?.map((b) => (
                              <Link key={b.id} href={`/bills/state/${encodeURIComponent(b.id)}`} className="flex items-start gap-3 px-4 py-2 hover:bg-accent/10 transition-colors"
                                onMouseDown={(e) => e.preventDefault()}
                              >
                                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{b.title}</p>
                                  <p className="text-xs text-muted-foreground">{b.identifier ?? b.id}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                        <div className="border-t px-4 py-2">
                          <button
                            type="submit"
                            className="text-sm text-accent font-medium hover:underline"
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            Search for "{debouncedTextQuery}"
                          </button>
                        </div>
                      </div>
                    )}
                </div>
                </form>
              </>
            )}
          </div>
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
      <div className="flex-1 min-h-0 overflow-y-auto bg-muted/30">
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

          {activeTextQuery && renderTextSearchResults()}

          {!activeTextQuery && !isLoading && !stateMembersLoading && !error && !data && !stateMembersData && (
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
