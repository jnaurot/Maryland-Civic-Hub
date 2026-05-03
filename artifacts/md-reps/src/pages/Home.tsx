import { useState } from "react";
import { Link } from "wouter";
import { useGetRepresentativesByAddress, getGetRepresentativesByAddressQueryKey } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import type { Representative } from "@workspace/api-client-react";

export function Home() {
  const [addressInput, setAddressInput] = useState("");
  const [searchAddress, setSearchAddress] = useState("");

  const { data, isLoading, error } = useGetRepresentativesByAddress(
    { address: searchAddress },
    { query: { enabled: !!searchAddress, queryKey: getGetRepresentativesByAddressQueryKey({ address: searchAddress }) } }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (addressInput.trim()) {
      setSearchAddress(addressInput.trim());
    }
  };

  const getPartyColor = (party?: string) => {
    if (!party) return "bg-gray-100 text-gray-800";
    if (party.toLowerCase().includes("democrat")) return "bg-[#1E40AF] text-white";
    if (party.toLowerCase().includes("republican")) return "bg-[#DC2626] text-white";
    return "bg-gray-200 text-gray-800";
  };

  const groupReps = (reps: Representative[] = []) => {
    const federal = reps.filter((r) => r.level === "federal");
    const state = reps.filter((r) => r.level === "state");
    const local = reps.filter((r) => r.level === "local");
    return { federal, state, local };
  };

  const renderRepCard = (rep: Representative) => {
    const partyColor = getPartyColor(rep.party);
    
    let linkHref = "#";
    if (rep.level === "federal" && rep.bioguideId) {
      linkHref = `/rep/federal/${rep.bioguideId}`;
    } else if (rep.level === "state" && (rep.openstatesId || rep.name)) {
      const slug = rep.openstatesId || rep.name.toLowerCase().replace(/\s+/g, '-');
      linkHref = `/rep/state/${slug}`;
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
    <div className="min-h-[100dvh] flex flex-col">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/a/a0/Flag_of_Maryland.svg')] bg-cover bg-center"></div>
        <div className="container mx-auto max-w-3xl relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
            Know Your Representatives
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Discover who represents you in Maryland at the federal, state, and local levels. Track their bills, votes, and campaign finance.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter your Maryland address..."
                className="pl-10 h-14 text-lg bg-background text-foreground border-0 shadow-lg rounded-xl focus-visible:ring-accent"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="h-14 px-8 text-lg font-bold bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl shadow-lg">
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div className="flex-grow bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          {isLoading && (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg text-muted-foreground">Finding your representatives...</p>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-lg text-center max-w-2xl mx-auto">
              <h3 className="font-bold text-lg mb-2">Error finding representatives</h3>
              <p>Please check your address and try again. Make sure it's a valid Maryland address.</p>
            </div>
          )}

          {!isLoading && !error && data && (
            <div className="space-y-16">
              {data.normalizedAddress && (
                <div className="mb-8">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Showing results for</p>
                  <h2 className="text-2xl font-semibold">{data.normalizedAddress}</h2>
                </div>
              )}

              {(() => {
                const { federal, state, local } = groupReps(data.representatives);
                return (
                  <>
                    {federal.length > 0 && (
                      <section>
                        <h2 className="text-3xl font-black mb-6 border-b pb-2">Federal Representatives</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {federal.map(renderRepCard)}
                        </div>
                      </section>
                    )}

                    {state.length > 0 && (
                      <section>
                        <h2 className="text-3xl font-black mb-6 border-b pb-2">State Representatives</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {state.map(renderRepCard)}
                        </div>
                      </section>
                    )}

                    {local.length > 0 && (
                      <section>
                        <h2 className="text-3xl font-black mb-6 border-b pb-2">Local Representatives</h2>
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

          {!isLoading && !error && !data && (
            <div className="text-center py-20 text-muted-foreground">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 opacity-50" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Ready to search</h2>
              <p className="max-w-md mx-auto">Enter your full address above to find out who represents you in Congress, the State House, and locally.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
