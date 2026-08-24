import { FileText, TrendingUp, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface Service {
  icon: LucideIcon;
  title: string;
  description: string;
}

const services: Service[] = [
  {
    icon: FileText,
    title: "SRRV Visa Application Support",
    description:
"Expert guidance through the entire visa process, ensuring all documentation meets PRA standards for a hassle-free experience."
  },
  {
    icon: TrendingUp,
    title: "VIP On-the-Ground Concierge",
    description:
"Strategic marketing solutions designed to help retirement-focused businesses connect with expats, retirees, and international clients through targeted campaigns and effective growth strategies."
  },
    {
    icon: MapPin,
    title: "Relocation Concierge",
    description:
"Personalized assistance in finding your ideal home, exploring retirement-friendly communities, navigating local services, and settling into your new life in the Philippines."
  },
];

export function ServicesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-ht-content mx-auto px-ht-margin-mobile md:px-ht-margin-desktop">
        <div className="text-center mb-12">
          <h2 className="text-ht-headline-lg font-display text-brand-secondary-500 mb-3">
            Our Specialized Services
          </h2>
          <p className="text-ht-body-md text-brand-neutral-500 max-w-md mx-auto">
            Indefinite Free Stay: Live, travel, and invest in the Philippines permanently with zero visa renewal hassle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((svc) => {
            const Icon = svc.icon;
            return (
              <Card
                key={svc.title}
                className="rounded-lg border border-ht-outline-variant shadow-ht-card hover:shadow-ht-hover transition-shadow duration-ht-base"
              >
                <CardHeader className="pb-2">
                  <div className="w-10 h-10 rounded bg-brand-primary-50 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-brand-primary-500" />
                  </div>
                  <CardTitle className="text-ht-headline-md font-display font-semibold text-brand-secondary-500">
                    {svc.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-ht-body-md text-brand-neutral-500">
                    {svc.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}