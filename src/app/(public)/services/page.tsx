'use client';

import React, { useState } from 'react';
import { getServicePlans } from "@/actions/admin/service"
import { 
  ShieldCheck, 
  Smile, 
  HeartHandshake, 
  Award, 
  Compass
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import ConsultationModal from '@/components/faqs/consultation-modal';
import ServiceCard from '@/components/services/service-card'; // Imported correctly

// Data array representing wireframe blocks 1 to 5
const SERVICES_DATA = [
  {
    id: 1,
    title: "SRRV Classic",
    tagline: "For active retirees looking to invest in property.",
    icon: <ShieldCheck className="w-6 h-6 text-[#9E1B32]" />,
    deposit: "US$ 10,000 to US$ 20,000",
    description: "The most flexible visa track. This program allows you to convert your required visa deposit into active investments, such as purchasing a ready-for-occupancy condominium unit or funding a long-term house lease.",
    features: ["Convertible deposit options", "Permanent residency status", "Multiple-entry privileges"]
  },
  {
    id: 2,
    title: "SRRV Smile",
    tagline: "For active retirees who prefer simple bank deposits.",
    icon: <Smile className="w-6 h-6 text-[#9E1B32]" />,
    deposit: "US$ 20,000 locked deposit",
    description: "Designed for individuals who want a straightforward, low-maintenance pathway. The visa deposit must be kept intact in an authorized PRA accredited bank account and remains locked for the duration of the visa.",
    features: ["Simplified documentation", "Fast-track processing", "Maintain capital in bank accounts"]
  },
  {
    id: 3,
    title: "SRRV Human Touch",
    tagline: "For retirees requiring specialized medical care.",
    icon: <HeartHandshake className="w-6 h-6 text-[#9E1B32]" />,
    deposit: "US$ 10,000 bank deposit",
    description: "Tailored for retirees who require medical setup or living assistance in the Philippines. Combines lower deposit requirements with proof of a recurring monthly pension and local medical insurance.",
    features: ["Lower financial barrier", "Aide and caregiver visa support", "Dedicated medical route support"]
  },
  {
    id: 4,
    title: "SRRV Courtesy",
    tagline: "For former Filipino citizens and diplomats.",
    icon: <Award className="w-6 h-6 text-[#9E1B32]" />,
    deposit: "US$ 1,500 bank deposit",
    description: "An exclusive, highly subsidized rate for former citizens of the Philippines or retired diplomats and international organization officers who wish to spend their retirement years back home.",
    features: ["Deeply subsidized deposit fees", "Honors specialized historical status", "Includes family extension options"]
  },
  {
    id: 5,
    title: "Concierge & Post-Approval Support",
    tagline: "Complete end-to-end relocation management.",
    icon: <Compass className="w-6 h-6 text-[#9E1B32]" />,
    deposit: "Custom service pricing",
    description: "We don't stop when your visa is approved. Our expert team assists with critical settlement tasks, including local bank account setups, obtaining a Philippine driver's license, securing ACR identity cards, and real estate checks.",
    features: ["Driver's License transition", "Local banking integrations", "Alien Employment Permit (AEP) guidance"]
  }
];

export default function Services() {
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 flex flex-col">
      
      {/* Hero Section */}
      <section className="bg-[#F6F5F2] pt-24 pb-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">Our Retirement Services</h1>
        <p className="max-w-2xl mx-auto text-gray-600 text-lg leading-relaxed">
          Explore our tailored visa pathways and concierge programs designed to make your transition to retiring in the Philippines entirely seamless.
        </p>
      </section>

      {/* Services Grid & CTA */}
      <section className="max-w-6xl mx-auto w-full px-6 py-16 flex-grow">
        
        {/* The mapped grid of Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {SERVICES_DATA.map((service) => (
            <ServiceCard 
              key={service.id}
              // You can use the spread operator {...service} since the keys in 
              // SERVICES_DATA perfectly match the props ServiceCard expects
              {...service} 
              onConsultClick={() => setIsConsultModalOpen(true)} 
            />
          ))}
        </div>

        {/* Dynamic CTA Banner */}
        <div className="mt-16 bg-[#9E1B32] rounded-xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="text-white max-w-lg">
            <h3 className="text-2xl font-serif mb-2">Unsure which track fits your needs?</h3>
            <p className="text-white/90 text-sm leading-relaxed">
              Our relocation consultants will evaluate your eligibility profiles and match you with the optimal program strategy.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <button
              onClick={handleGetStarted}
              className="px-6 py-3 bg-white text-[#9E1B32] text-sm font-semibold rounded shadow-sm hover:bg-gray-50 transition whitespace-nowrap"
            >
              Get Started
            </button>
            <button
              onClick={() => setIsConsultModalOpen(true)}
              className="px-6 py-3 border border-white/40 text-white text-sm font-semibold rounded hover:bg-white/10 transition whitespace-nowrap"
            >
              Contact Us
            </button>
          </div>
        </div>

      </section>

      {/* Global Interactive Elements */}
      <ConsultationModal
        isOpen={isConsultModalOpen}
        onClose={() => setIsConsultModalOpen(false)}
      />

      <Footer />
    </div>
  );
}