'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import Hero from '@/components/public/Hero';

export default function About() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 flex flex-col">
      {/* Hero Section */}
      <Hero 
        title={"About RetireWell"} 
        description={"We are your dedicated partners in navigating the Special Resident Retiree's Visa (SRRV) process. Our mission is to make your transition to the Philippines as seamless, transparent, and welcoming as possible."} 
      />

      {/* About Us Section */}
      <section className="bg-white py-20 flex-grow border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-4 mb-10">
            <h2 className="text-3xl md:text-4xl font-serif text-[#0F172A] leading-tight">
              About Us
            </h2>
          </div>
          
          <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
            <p>
              <strong>Retire Well SRRV Marketing Consulting</strong> is dedicated to providing professional guidance and personalized support for individuals seeking to explore retirement opportunities in the Philippines through the <strong>Special Resident Retiree&apos;s Visa (SRRV)</strong> program.
            </p>
            <p>
              As <strong>PRA-accredited marketers</strong>, we assist clients by providing accurate information, helping them understand SRRV requirements, and guiding them throughout their application journey with professionalism and care.
            </p>
            <p>
              Our mission is to make the SRRV process simpler, clearer, and more accessible by offering reliable consultation and dedicated support tailored to each client&apos;s retirement goals.
            </p>
            <p>
              With our expertise and commitment to client service, <strong>Retire Well SRRV Marketing Consulting</strong> helps future retirees confidently take the next step toward a fulfilling retirement experience in the Philippines.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}