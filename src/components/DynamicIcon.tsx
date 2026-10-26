import { Handshake, Settings, Truck, Users, Factory, Globe2, LucideIcon, Package, CheckCircle2, Sprout, Sun, ListChecks, Ship } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Handshake,
  Settings,
  Truck,
  Users,
  Factory,
  Globe2,
  Package,
  CheckCircle2,
  Sprout,
  Sun,
  ListChecks,
  Ship,
};

export function DynamicIcon({ name, className }: { name: string | null; className?: string }) {
  if (!name) return null;
  const Icon = iconMap[name] || Settings; // Fallback
  return <Icon className={className} />;
}
