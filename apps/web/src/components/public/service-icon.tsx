import {
  ChartColumnIncreasing,
  Droplets,
  FileStack,
  FlaskConical,
  GraduationCap,
  MonitorSmartphone,
  Scale,
  ShieldCheck,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { ServiceItem } from "@/data/content";

const icons: Record<ServiceItem["icon"], LucideIcon> = {
  droplets: Droplets,
  monitor: MonitorSmartphone,
  graduation: GraduationCap,
  wrench: Wrench,
  chart: ChartColumnIncreasing,
  users: Users,
  shield: ShieldCheck,
  file: FileStack,
  flask: FlaskConical,
  scale: Scale,
};

export function ServiceIcon({
  name,
  className,
}: {
  name: ServiceItem["icon"];
  className?: string;
}) {
  const Icon = icons[name];
  return <Icon className={className} aria-hidden="true" />;
}
