'use client';

import React, { useState } from 'react';
import { Search, ChevronDown, FileText, Calculator, Calendar, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar'
import {
  Field,

} from '@/components/ui/field'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import AccordionCard from '@/components/faqs/accordion-card';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800">
      {/* Navigation */}
      <Navbar></Navbar>
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
              className="w-full pl-12 pr-4 py-4 rounded-lg border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A6192E] focus:border-transparent w-full"
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
            <li>
              <button className="w-full text-left px-4 py-3 bg-[#A6192E] text-white rounded-md flex justify-between items-center text-sm font-medium shadow-sm">
                General Information
                <ChevronDown className="w-4 h-4 -rotate-90" />
              </button>
            </li>
            <li>
              <button className="w-full text-left px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-md text-sm font-medium transition">
                Eligibility
              </button>
            </li>
            <li>
              <button className="w-full text-left px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-md text-sm font-medium transition">
                Financials
              </button>
            </li>
            <li>
              <button className="w-full text-left px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-md text-sm font-medium transition">
                After Approval
              </button>
            </li>
          </ul>
        </div>

        {/* Accordion Content */}
        <div className="md:col-span-9">
          <h2 className="text-2xl font-serif text-gray-900 mb-6">General Information</h2>
          <div className="space-y-4">
            {/* Question 1 */}
            <AccordionCard />

            {/* Question 2 */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <button
                onClick={() => toggleAccordion(1)}
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
              >
                <span className="font-serif text-lg text-gray-800">Can I work or study with an SRRV?</span>
                <ChevronDown className={`w-5 h-5 text-[#A6192E] transition-transform duration-200 ${openIndex === 1 ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === 1 && (
                <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                  Yes, SRRV holders can work, study, or invest in the Philippines. However, to work legally, you will need to secure an Alien Employment Permit (AEP) from the Department of Labor and Employment (DOLE).
                </div>
              )}
            </div>
          </div>

          {/* CTA Banner */}
          <div className="mt-12 bg-[#9E1B32] rounded-xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div className="text-white max-w-lg">
              <h3 className="text-2xl font-serif mb-2">Still have questions?</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                Our expert consultants are available for a one-on-one session to clarify your specific needs and eligibility.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <button className="px-6 py-3 bg-white text-[#9E1B32] text-sm font-semibold rounded shadow-sm hover:bg-gray-50 transition whitespace-nowrap">
                Chat with an Expert
              </button>
              <button className="px-6 py-3 border border-white/40 text-white text-sm font-semibold rounded hover:bg-white/10 transition whitespace-nowrap">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Resource Cards */}
      <section className="bg-[#F6F5F2] py-16 px-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="w-12 h-12 bg-rose-50 text-[#A6192E] rounded-lg flex items-center justify-center mb-6">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-serif text-gray-900 mb-3">Document Guide</h4>
            <p className="text-gray-500 text-sm mb-8 flex-grow">
              Download our comprehensive checklist of required documents for all visa types.
            </p>
            <a href="#" className="inline-flex items-center gap-2 text-[#A6192E] text-sm font-semibold hover:underline">
              Download PDF <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="w-12 h-12 bg-rose-50 text-[#A6192E] rounded-lg flex items-center justify-center mb-6">
              <Calculator className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-serif text-gray-900 mb-3">Fee Calculator</h4>
            <p className="text-gray-500 text-sm mb-8 flex-grow">
              Estimate your total investment including PRA fees, deposits, and service costs.
            </p>
            <a href="#" className="inline-flex items-center gap-2 text-[#A6192E] text-sm font-semibold hover:underline">
              Estimate Costs <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="w-12 h-12 bg-rose-50 text-[#A6192E] rounded-lg flex items-center justify-center mb-6">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-serif text-gray-900 mb-3">Free Webinar</h4>
            <p className="text-gray-500 text-sm mb-8 flex-grow">
              Join our monthly living-in-the-Philippines sessions for visa insights and life tips.
            </p>
            <a href="#" className="inline-flex items-center gap-2 text-[#A6192E] text-sm font-semibold hover:underline">
              Register Now <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#FAFAFA] border-t border-gray-200 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1">
            <div className="text-[#A6192E] font-bold text-xl tracking-tighter mb-4">
              SRRV <span className="text-xs font-normal text-gray-500 uppercase block leading-none">Global Consulting</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed pr-4">
              Leading consultancy for Philippine retirement visas, serving clients globally with integrity.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-gray-900 text-sm mb-4">Company</h5>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-[#A6192E]">About Us</a></li>
              <li><a href="#" className="hover:text-[#A6192E]">Services</a></li>
              <li><a href="#" className="hover:text-[#A6192E]">Careers</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-gray-900 text-sm mb-4">Resources</h5>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-[#A6192E]">FAQ</a></li>
              <li><a href="#" className="hover:text-[#A6192E]">Blog</a></li>
              <li><a href="#" className="hover:text-[#A6192E]">Guides</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-gray-900 text-sm mb-4">Support</h5>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-[#A6192E]">Contact</a></li>
              <li><a href="#" className="hover:text-[#A6192E]">Help Center</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2024 SRRV Global Consulting. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-900">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900">Terms of Service</a>
            <a href="#" className="hover:text-gray-900">Cookie Policy</a>
            <a href="#" className="hover:text-gray-900">Regulatory Disclosure</a>
          </div>
        </div>
      </footer>
    </div>
  );
}