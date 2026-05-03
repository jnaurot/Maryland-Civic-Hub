import { useState } from "react";
import { Link } from "wouter";
import {
  useGetStateBills,
  getGetStateBillsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, ChevronRight } from "lucide-react";

type Chamber = "upper" | "lower" | "all";

export function StateBills() {
  const [chamber, setChamber] = useState<Chamber>("all");
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const params = chamber === "all"
    ? { offset, limit }
    : { chamber: chamber as "upper" | "lower", offset, limit };

  const { data, isLoading } = useGetStateBills(params, {
    query: { queryKey: getGetStateBillsQueryKey(params) }
  });

  const handleChamberChange = (v: string) => {
    setChamber(v as Chamber);
    setOffset(0);
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">Maryland State Bills</h1>
          <p className="text-muted-foreground">Bills being considered in the Maryland General Assembly</p>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Select value={chamber} onValueChange={handleChamberChange}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Filter by chamber" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chambers</SelectItem>
              <SelectItem value="upper">Senate</SelectItem>
              <SelectItem value="lower">House of Delegates</SelectItem>
            </SelectContent>
          </Select>
          {data?.totalCount !== undefined && (
            <span className="text-sm text-muted-foreground">{data.totalCount.toLocaleString()} bills</span>
          )}
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        )}

        {!isLoading && data?.bills?.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No bills found.</p>
          </div>
        )}

        <div className="space-y-3">
          {!isLoading && data?.bills?.map((bill) => (
            <Link key={bill.id} href={`/bills/state/${encodeURIComponent(bill.id)}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {bill.identifier && <Badge variant="outline" className="font-mono text-xs shrink-0">{bill.identifier}</Badge>}
                        {bill.chamber && (
                          <Badge variant="secondary" className="text-xs">
                            {bill.chamber === "upper" ? "Senate" : bill.chamber === "lower" ? "House of Delegates" : bill.chamber}
                          </Badge>
                        )}
                        {bill.session && <span className="text-xs text-muted-foreground">Session {bill.session}</span>}
                        {bill.introducedDate && <span className="text-xs text-muted-foreground">Introduced {bill.introducedDate}</span>}
                      </div>
                      <p className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">{bill.title}</p>
                      {bill.latestAction && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">Latest: {bill.latestAction}</p>
                      )}
                      {bill.sponsors && bill.sponsors.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Sponsor{bill.sponsors.length > 1 ? "s" : ""}: {bill.sponsors.slice(0, 2).join(", ")}
                          {bill.sponsors.length > 2 && ` +${bill.sponsors.length - 2} more`}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {data && (data.totalCount ?? 0) > limit && (
          <div className="flex justify-between items-center pt-6">
            <Button variant="outline" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}>Previous</Button>
            <span className="text-sm text-muted-foreground">
              {offset + 1}–{Math.min(offset + limit, data.totalCount ?? 0)} of {data.totalCount?.toLocaleString()}
            </span>
            <Button variant="outline" disabled={offset + limit >= (data.totalCount ?? 0)} onClick={() => setOffset(offset + limit)}>Next</Button>
          </div>
        )}
      </div>
    </div>
  );
}
