import { Link } from "wouter";

interface RepNameLinkProps {
  name: string;
  bioguideId?: string;
  openstatesId?: string;
  className?: string;
}

export function RepNameLink({ name, bioguideId, openstatesId, className = "" }: RepNameLinkProps) {
  const href = bioguideId
    ? `/rep/federal/${bioguideId}`
    : openstatesId
      ? `/rep/state/${encodeURIComponent(openstatesId)}`
      : undefined;

  if (!href) {
    return <span className={`text-sm font-medium ${className}`}>{name}</span>;
  }

  return (
    <Link
      href={href}
      className={`text-sm font-medium cursor-pointer hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent rounded-sm ${className}`}
    >
      {name}
    </Link>
  );
}
