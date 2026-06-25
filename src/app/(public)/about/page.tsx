'use client';

import React from 'react';
import { Shield, Target, Users, Award, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import Hero from '@/components/public/Hero';


export default function About() {
  const router = useRouter();

  const handleContactClick = () => {
    router.push('/contact');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 flex flex-col">
      {/* Hero Section */}
      <Hero title={"About RetireWell"} description={"We are your dedicated partners in navigating the Special Resident Retiree's Visa (SRRV) process[cite: 1]. Our mission is to make your transition to the Philippines as seamless, transparent, and welcoming as possible."} />

      {/* Our Story / Mission Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Our Story</h2>
          <h3 className="text-3xl font-serif text-[#0F172A] leading-tight">
            Simplifying the path to your dream retirement.
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Founded with the vision of becoming the premier agency for SRRV processing[cite: 1], RetireWell was built by a team of legal and lifestyle experts who recognized the complexities foreign nationals face when relocating.
          </p>
          <p className="text-gray-600 leading-relaxed">
            We don't just process paperwork; we provide end-to-end support. From initial eligibility checks and financial deposits to finding your perfect home in the Philippines, we are with you every step of the way.
          </p>
        </div>
        
        {/* Image Placeholder / Graphic */}
        <div className="relative h-96 bg-gray-200 rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex items-center justify-center group">
          <div className="absolute inset-0 bg-[#0F172A]/5 group-hover:bg-transparent transition-colors duration-500"></div>
          {/* Replace this div with a Next/Image component in your actual project */}
          <span className="text-gray-400 font-medium tracking-wide">Image: Team or Philippine Landscape</span>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="bg-white border-y border-gray-100 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif text-[#0F172A] mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do, ensuring that you receive the highest standard of service during your SRRV application.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Value 1 */}
            <div className="bg-[#FAFAFA] p-8 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#E2E8F0] rounded-xl flex items-center justify-center text-[#9E1B32] mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-[#0F172A] mb-3">Integrity</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                We operate with complete transparency regarding fees, timelines, and requirements. No hidden costs, no surprises.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-[#FAFAFA] p-8 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#E2E8F0] rounded-xl flex items-center justify-center text-[#9E1B32] mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-[#0F172A] mb-3">Excellence</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Our team stays up-to-date with the latest Philippine Retirement Authority (PRA) regulations to ensure flawless processing.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-[#FAFAFA] p-8 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#E2E8F0] rounded-xl flex items-center justify-center text-[#9E1B32] mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-[#0F172A] mb-3">Client-Centric</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Every retiree has a unique situation. We tailor our consultations and services to meet your specific financial and lifestyle goals.
              </p>
            </div>

            {/* Value 4 */}
            <div className="bg-[#FAFAFA] p-8 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#E2E8F0] rounded-xl flex items-center justify-center text-[#9E1B32] mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-[#0F172A] mb-3">Efficiency</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                We respect your time. Our streamlined processes are designed to secure your SRRV as quickly and efficiently as possible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-10 py-24 text-center">
        <h2 className="text-3xl font-serif text-[#0F172A] mb-6">Ready to make the move?</h2>
        <p className="text-gray-600 mb-10 max-w-2xl mx-auto text-lg">
          Let our experts handle the bureaucracy while you plan your next chapter in the beautiful Philippines.
        </p>
        <button
          onClick={handleContactClick}
          className="inline-flex items-center justify-center gap-2 bg-[#7A1527] text-white font-bold text-sm py-4 px-8 rounded-xl shadow-lg hover:bg-[#63101E] hover:shadow-xl transition-all transform hover:-translate-y-0.5"
        >
          <span>Speak with an Expert</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      <Footer />
    </div>
  );
}