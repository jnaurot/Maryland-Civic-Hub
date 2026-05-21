import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RepProfileCardProps {
  photoUrl?: string;
  name?: string;
  belowPhoto?: ReactNode;
  children: ReactNode;
}

export function RepProfileCard({ photoUrl, name, belowPhoto, children }: RepProfileCardProps) {
  return (
    <Card className="mb-6 shrink-0">
      <CardContent className="p-6">
        <div className="sm:flex sm:flex-row sm:items-start sm:gap-6 max-sm:grid max-sm:grid-cols-[96px_1fr] max-sm:gap-x-4">
          <Avatar className="h-24 w-24 border-2 border-muted shrink-0">
            <AvatarImage src={photoUrl} alt={name} className="object-cover object-top" />
            <AvatarFallback className="text-2xl">{name?.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 max-sm:row-span-2">{children}</div>
          {belowPhoto && <div className="sm:hidden self-start mt-4">{belowPhoto}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
