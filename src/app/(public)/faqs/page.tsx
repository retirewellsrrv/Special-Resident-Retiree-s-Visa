'use client';

import React, { useState } from 'react';
import { Search, FileText, Calculator, Calendar, ArrowRight } from 'lucide-react';
import { Field } from '@/components/ui/field';
import AccordionCard from '@/components/faqs/accordion-card';
import SideButton from '@/components/faqs/side-button';
import ConsultationModal from '@/components/faqs/consultation-modal';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';

// Configuration for your navigation sidebar
const FAQ_CATEGORIES = [
  { id: 'general', label: 'General Information' },
  { id: 'eligibility', label: 'Eligibility Requirements' },
  { id: 'financials', label: 'Financials & Deposits' },
  { id: 'after-approval', label: 'After Approval' },
];

const FAQ_DATA: Record<string, any[]> = {
  general: [
    {
      value: 'gen-1',
      trigger: "What is SRRV?",
      content: "The Special Resident Retiree's Visa is a non-immigrant visa for foreign nationals who want to retire in the Philippines. It is issued by the Philippines Retirement Authority (PRA) and offers multiple-entry privileges with the right to stay permanently in the country."
    },
    {
      value: 'gen-2',
      trigger: "Can I work or study with an SRRV?",
      content: "Yes, SRRV holders can study or work in the Philippines. However, to work, you must obtain an Alien Employment Permit (AEP) from the Department of Labor and Employment."
    }
  ],
  eligibility: [
    {
      value: 'elig-1',
      trigger: "Am I eligible at 50?",
      content: "The SRRV is open to foreign nationals aged 50 and above who meet the financial and health requirements."
    }
  ],
  financials: [
    {
      value: 'fin-1',
      trigger: "What is the required deposit?",
      content: "Deposits vary by program, typically ranging from US$10,000 to US$20,000."
    }
  ],
  'after-approval': [
    {
      value: 'after-1',
      trigger: "Can I convert my deposit?",
      content: "Yes, under the SRRV Classic program, deposits can be converted into active investments such as condominium purchase or long-term lease."
    }
  ]
};

export default function Faq() {
  // Single source of truth for the active sidebar category
  const [activeCategory, setActiveCategory] = useState<string>('general');

  // Get the display name of the currently selected category
  const currentCategoryLabel = FAQ_CATEGORIES.find(cat => cat.id === activeCategory)?.label || '';

  // Dynamic fallback: extract only the array that matches the current category state
  const currentQuestions = FAQ_DATA[activeCategory] || [];

  // Establish state to track visibility
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);

  const router = useRouter();

  const handleClick = () => {router.push('/register')};

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800">
      {/* Hero Section */}
      <section className="bg-[#F6F5F2] pt-20 pb-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-8">Frequently Asked Questions</h1>
        <Field className="max-w-2xl mx-auto relative">
          <div className="group relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="search"
              type="text"
              placeholder="Search for answers (e.g., eligibility, visa fees, timeline)..."
              className="w-full pl-12 pr-4 py-4 rounded-lg border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A6192E] focus:border-transparent"
            />
          </div>
        </Field>
      </section>

      {/* FAQ Content Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Sidebar */}
        <div className="md:col-span-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Categories</h3>
          <ul className="space-y-2">
            {FAQ_CATEGORIES.map((category) => {
              const isActive = activeCategory === category.id;

              return (
                <li key={category.id}>
                  <SideButton
                    label={category.label}
                    isClicked={isActive}
                    onClick={() => setActiveCategory(category.id)}
                  />
                </li>
              );
            })}
          </ul>
        </div>

        {/* Accordion Content */}
        <div className="md:col-span-9">
          <h2 className="text-2xl font-serif text-gray-900 mb-6">{currentCategoryLabel}</h2>
          <div className="space-y-4">
            {/* ✅ Passing down just the filtered array hook slice */}
            <AccordionCard items={currentQuestions} />
          </div>

          {/* CTA Banner */}
          <div className="mt-12 bg-[#9E1B32] rounded-xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div className="text-white max-w-lg">
              <h3 className="text-2xl font-serif mb-2">Still have questions?</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                If you still have questions, we're here to help! Send us an email at consult@retirewell.ph.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {/* 2. Bind action trigger to both CTA click options */}
              <button
                onClick={handleClick}
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
          <ConsultationModal
            isOpen={isConsultModalOpen}
            onClose={() => setIsConsultModalOpen(false)}
          />
        </div>
      </section>
      <Footer/>
    </div>
  );
}