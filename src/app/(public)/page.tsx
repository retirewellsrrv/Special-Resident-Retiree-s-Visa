import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  HeroSection,
  ServicesSection,
  EligibilitySection,
  WhyChooseSection,
} from "@/components/public";
import { Footer } from "@/components/layout/Footer";

export default async function Page() {
  const user = await getSession();

  if (user) {
    let role = user.user_metadata?.role as string | undefined;

    // Check super_admin_profiles — overrides metadata role
    const supabase = await createClient();
    const { data: superAdminProfile } = await supabase
      .from("super_admin_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (superAdminProfile) {
      role = "super_admin";
    }

    if (role === "super_admin") redirect("/super-admin/dashboard");
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
