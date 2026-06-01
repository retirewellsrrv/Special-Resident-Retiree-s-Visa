"use client";

import {
  HeroSection,
  ServicesSection,
  EligibilitySection,
  WhyChooseSection,
  ContactSection,
  Footer,
} from "@/components/public";

export default function Page() {
  return (
    <main className="min-h-screen bg-background font-body">
      <HeroSection />
      <ServicesSection />
      <EligibilitySection />
      <WhyChooseSection />
      {/* <ContactSection /> */}
      <Footer />
    </main>
  );
}
