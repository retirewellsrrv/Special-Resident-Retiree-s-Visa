import bgBeach from "@/assets/images/bg-beach.png";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative w-full min-h-[520px] flex items-end overflow-hidden bg-brand-secondary-900">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgBeach.src})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-white/20" />
      </div>

      <div className="relative z-10 max-w-ht-content mx-auto px-ht-margin-mobile md:px-ht-margin-desktop w-full pb-16 pt-28">
        <div className="max-w-lg">
          <Badge
            variant="outline"
            className="mb-4 text-brand-primary-500 border-brand-primary-500 font-semibold tracking-widest text-xs uppercase"
          >
            Premier SRRV Consulting
          </Badge>

          <h1 className="text-ht-display font-display text-brand-secondary-500 mb-4 leading-tight">
            Retire with Peace of Mind in the Philippines
          </h1>

          <p className="text-ht-body-md text-brand-neutral-600 mb-8 max-w-sm">
            Navigate the Special Resident Retiree's Visa (SRRV) process with
            expert guidance. We provide end-to-end consulting for a seamless
            transition to your new tropical home.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="bg-brand-primary-500 hover:bg-brand-primary-600 text-white font-bold px-7 h-12 rounded"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="font-semibold px-7 h-12 rounded"
            >
              Explore Visa Options
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}