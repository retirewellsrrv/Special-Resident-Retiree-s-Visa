import { Star, Phone, Clock, Users, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface Stat {
  value: string;
  label: string;
  icon: LucideIcon;
}

const stats: Stat[] = [
  { value: "99%", label: "Visa Approval Rate", icon: Award },
  { value: "10+", label: "Years of Expertise", icon: Clock },
  { value: "500+", label: "Retirees Assisted", icon: Users },
  { value: "24/7", label: "Support Access", icon: Phone },
];

export function WhyChooseSection() {
  return (
    <section className="py-20 bg-brand-primary-500">
      <div className="max-w-ht-content mx-auto px-ht-margin-mobile md:px-ht-margin-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Stats */}
          <div>
            <h2 className="text-ht-headline-lg font-display text-white mb-8">
              Why Choose Retire Well?
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-5xl font-display font-bold text-white leading-none mb-1">
                    {stat.value}
                  </p>
                  <p className="text-ht-label-md text-brand-primary-100 uppercase tracking-wide">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <Card className="bg-brand-primary-600 border-0 rounded-xl shadow-ht-elevated">
            <CardContent className="pt-6">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-brand-goldAccent-1 text-brand-goldAccent-1"
                  />
                ))}
              </div>
              <blockquote className="text-ht-body-lg text-white italic mb-6 leading-relaxed">
                "The team at Retire Well made the entire SRRV application
                process incredibly simple. I was worried about the paperwork,
                but they handled everything with such professionalism and care.
                I'm now enjoying my retirement in Cebu thanks to their
                expertise."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-primary-400 flex items-center justify-center text-white font-bold text-sm">
                  JW
                </div>
                <div>
                  <p className="text-white font-semibold text-ht-body-md">
                    James Wilson
                  </p>
                  <p className="text-brand-primary-200 text-ht-caption uppercase tracking-widest">
                    British Expat, Retiree
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}