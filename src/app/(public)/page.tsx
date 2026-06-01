"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Phone,
  Mail,
  Star,
  Shield,
  Clock,
  Users,
  Award,
} from "lucide-react";

// ─── Hero ────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative w-full min-h-[520px] flex items-end overflow-hidden bg-brand-secondary-900">
      {/* Background overlay image placeholder — replace src with real photo */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1400&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-white/20" />
      </div>

      {/* Content */}
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
            <Button size="lg" className="bg-brand-primary-500 hover:bg-brand-primary-600 text-white font-bold px-7 h-12 rounded">
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-brand-secondary-500 text-brand-secondary-500 hover:bg-brand-secondary-500/5 font-semibold px-7 h-12 rounded"
            >
              Explore Visa Options
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Services ────────────────────────────────────────────────────────────────
const services = [
  {
    icon: FileText,
    title: "SRRV Application Support",
    description:
      "Expert guidance through the entire visa process, ensuring all documentation meets PRA standards for a hassle-free experience.",
  },
  {
    icon: TrendingUp,
    title: "Marketing Consulting",
    description:
      "Strategic growth solutions for retirement-focused businesses looking to reach the expat and retiree demographic effectively.",
  },
  {
    icon: MapPin,
    title: "Relocation Concierge",
    description:
      "Personalized assistance in finding your perfect home and community, navigating local real estate, and setting up utilities.",
  },
];

function ServicesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-ht-content mx-auto px-ht-margin-mobile md:px-ht-margin-desktop">
        <div className="text-center mb-12">
          <h2 className="text-ht-headline-lg font-display text-brand-secondary-500 mb-3">
            Our Specialized Services
          </h2>
          <p className="text-ht-body-md text-brand-neutral-500 max-w-md mx-auto">
            Providing the expertise and support you need for every step of your
            retirement journey in the Philippines.
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
                  <CardTitle className="text-ht-headline-md font-display text-brand-secondary-500">
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

// ─── Eligibility ─────────────────────────────────────────────────────────────
const generalReqs = [
  "Age 50 years and above (Active/Retirees)",
  "Time Deposit investment of US$10,000 to US$20,000",
  "Valid Passport and Medical Clearance",
  "Police Clearance from country of origin",
];

const requiredDocs = [
  "Original Valid Passport",
  "PRA Application Forms (Completed)",
  "Medical Certificate (DOH Form)",
  "12 photos (2\" x 2\")",
];

function EligibilitySection() {
  return (
    <section className="py-20 bg-brand-tertiary-500">
      <div className="max-w-ht-content mx-auto px-ht-margin-mobile md:px-ht-margin-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Left copy */}
          <div>
            <h2 className="text-ht-headline-lg font-display text-brand-secondary-500 mb-4">
              SRRV Eligibility At A Glance
            </h2>
            <p className="text-ht-body-md text-brand-neutral-600 mb-6">
              Understanding the requirements is the first step toward your new
              life. Our team ensures you meet all criteria before submission.
            </p>
            <blockquote className="border-l-4 border-brand-primary-500 pl-4 text-brand-neutral-600 italic text-ht-body-md bg-brand-primary-50 py-3 pr-3 rounded-r">
              "We simplify the complex bureaucratic requirements into a clear,
              manageable checklist."
            </blockquote>
          </div>

          {/* General Requirements card */}
          <Card className="rounded-lg border border-ht-outline-variant shadow-ht-card">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-brand-primary-500 mb-1">
                <Shield className="w-4 h-4" />
                <span className="text-ht-label-md font-semibold uppercase tracking-wide">
                  General Requirements
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {generalReqs.map((req) => (
                  <li key={req} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-primary-500 mt-0.5 shrink-0" />
                    <span className="text-ht-body-md text-brand-secondary-500">
                      {req}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Required Documents card */}
          <Card className="rounded-lg border border-ht-outline-variant shadow-ht-card">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-brand-primary-500 mb-1">
                <FileText className="w-4 h-4" />
                <span className="text-ht-label-md font-semibold uppercase tracking-wide">
                  Required Documents
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {requiredDocs.map((doc) => (
                  <li key={doc} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-primary-500 mt-0.5 shrink-0" />
                    <span className="text-ht-body-md text-brand-secondary-500">
                      {doc}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

// ─── Why Choose Us ───────────────────────────────────────────────────────────
const stats = [
  { value: "99%", label: "Visa Approval Rate", icon: Award },
  { value: "10+", label: "Years of Expertise", icon: Clock },
  { value: "500+", label: "Retirees Assisted", icon: Users },
  { value: "24/7", label: "Support Access", icon: Phone },
];

function WhyChooseSection() {
  return (
    <section className="py-20 bg-brand-primary-500">
      <div className="max-w-ht-content mx-auto px-ht-margin-mobile md:px-ht-margin-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Stats grid */}
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

          {/* Testimonial card */}
          <Card className="bg-brand-primary-600 border-0 rounded-xl shadow-ht-elevated">
            <CardContent className="pt-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
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

// ─── Contact / CTA ───────────────────────────────────────────────────────────
function ContactSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-ht-content mx-auto px-ht-margin-mobile md:px-ht-margin-desktop">
        <Card className="rounded-2xl border border-ht-outline-variant shadow-ht-elevated overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left copy */}
            <div className="p-10 lg:p-14 flex flex-col justify-center">
              <h2 className="text-ht-headline-lg font-display text-brand-secondary-500 mb-4">
                Ready to start your journey?
              </h2>
              <p className="text-ht-body-md text-brand-neutral-600 mb-8">
                Schedule your free, no-obligation consultation with our visa
                experts today. Let's make your Philippine retirement dreams a
                reality.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-primary-50 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-brand-primary-500" />
                  </div>
                  <span className="text-ht-body-md text-brand-secondary-500">
                    +63 2 888 1234
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-primary-50 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-brand-primary-500" />
                  </div>
                  <span className="text-ht-body-md text-brand-secondary-500">
                    consult@retirewell.ph
                  </span>
                </div>
              </div>
            </div>

            {/* Right form */}
            <div className="bg-brand-tertiary-400 p-10 lg:p-14">
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-ht-label-md text-brand-secondary-500 font-medium">
                      Full Name
                    </label>
                    <Input
                      placeholder="Your name"
                      className="bg-white border-ht-outline-variant focus-visible:ring-brand-primary-500 rounded"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-ht-label-md text-brand-secondary-500 font-medium">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      className="bg-white border-ht-outline-variant focus-visible:ring-brand-primary-500 rounded"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-ht-label-md text-brand-secondary-500 font-medium">
                    Interested Service
                  </label>
                  <Select>
                    <SelectTrigger className="bg-white border-ht-outline-variant rounded">
                      <SelectValue placeholder="SRRV Application" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="srrv">SRRV Application</SelectItem>
                      <SelectItem value="marketing">
                        Marketing Consulting
                      </SelectItem>
                      <SelectItem value="relocation">
                        Relocation Concierge
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-ht-label-md text-brand-secondary-500 font-medium">
                    Message (Optional)
                  </label>
                  <Textarea
                    placeholder="Tell us how we can help..."
                    className="bg-white border-ht-outline-variant focus-visible:ring-brand-primary-500 min-h-[100px] rounded"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-brand-primary-500 hover:bg-brand-primary-600 text-white font-bold h-12 rounded"
                >
                  Send Request
                </Button>
              </form>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-brand-tertiary-400 border-t border-ht-outline-variant py-12">
      <div className="max-w-ht-content mx-auto px-ht-margin-mobile md:px-ht-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="text-brand-primary-500 font-display font-bold text-xl mb-3">
              RetireWell
            </div>
            <p className="text-ht-caption text-brand-neutral-500 max-w-xs">
              Expert visa consulting services for foreign retirees and
              businesses in the Philippines. Certified and professional.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-ht-label-md font-semibold text-brand-secondary-500 mb-3 uppercase tracking-wider">
              Navigation
            </p>
            <ul className="space-y-2 text-ht-body-md text-brand-neutral-600">
              <li>
                <a href="#" className="hover:text-brand-primary-500 transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-primary-500 transition-colors">
                  Eligibility
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-ht-label-md font-semibold text-brand-secondary-500 mb-3 uppercase tracking-wider">
              Legal
            </p>
            <ul className="space-y-2 text-ht-body-md text-brand-neutral-600">
              <li>
                <a href="#" className="hover:text-brand-primary-500 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-primary-500 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-primary-500 transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-ht-outline-variant pt-6 text-center">
          <p className="text-ht-caption text-brand-neutral-400">
            © 2024 Retire Well SRRV. All rights reserved. Professional Visa
            Consultation Services.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function Page() {
  return (
    <main className="min-h-screen bg-background font-body">
      <HeroSection />
      <ServicesSection />
      <EligibilitySection />
      <WhyChooseSection />
      <ContactSection />
      <Footer />
    </main>
  );
}