import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import {
  HeroSection,
  ServicesSection,
  EligibilitySection,
  WhyChooseSection,
  ContactSection,
} from "@/components/public";
import { Footer } from "@/components/layout/Footer";

export default async function Page() {
  const user = await getSession();

  if (user) {
    const role = user.user_metadata?.role as string | undefined;
    if (role === "admin") redirect("/admin/dashboard");
    if (role === "applicant") redirect("/applicant/dashboard");
    redirect("/");
  }

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
