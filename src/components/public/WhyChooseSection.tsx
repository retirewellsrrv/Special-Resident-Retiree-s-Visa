import { Star, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  "99% Visa Approval Rate",
  "Dedicated Client Care",
  "PRA-Accredited SRRV Marketing Partner",
  "24/7 Support Access",
];

export function WhyChooseSection() {
  return (
    <section className="py-20 bg-brand-primary-500">
      <div className="max-w-ht-content mx-auto px-ht-margin-mobile md:px-ht-margin-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Features List */}
          <div>
            <h2 className="text-ht-headline-lg font-display text-white mb-8">
              Why Choose Retire Well?
            </h2>
            <ul className="space-y-4">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="text-white text-ht-body-lg">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Testimonial */}
          <Card className="bg-brand-primary-600 border-0 rounded-xl shadow-ht-elevated">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 fill-brand-goldAccent-1 text-brand-goldAccent-1 shrink-0" />
                <h4 className="text-white font-display text-xl">A Trusted Partner for Your Retirement Dreams</h4>
              </div>
              <blockquote className="text-ht-body-lg text-white italic mb-6 leading-relaxed">
&ldquo;With our commitment, knowledge, and dedication, Retire Well aims to become your reliable partner in building a comfortable retirement life in the Philippines.&rdquo;
              </blockquote>
              <p className="text-white text-ht-body-lg leading-relaxed">
                Retire Well &mdash; guiding you toward a peaceful, secure, and fulfilling retirement experience.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
