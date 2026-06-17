"use client";

import {
  HeroSection,
  ServicesSection,
  EligibilitySection,
  WhyChooseSection,
  ContactSection,
} from "@/components/public";
import { Footer } from "@/components/layout/Footer";

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
