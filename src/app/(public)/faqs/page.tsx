'use client';

import React, { useState, useMemo } from 'react';
import { Search, Shield, AlertTriangle } from 'lucide-react';
import { Field } from '@/components/ui/field';
import AccordionCard from '@/components/faqs/accordion-card';
import SideButton from '@/components/faqs/side-button';
import ConsultationModal from '@/components/faqs/consultation-modal';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';

// Configuration for navigation sidebar
const FAQ_CATEGORIES = [
  { id: 'visa-benefits', label: 'Visa Benefits & General' },
  { id: 'financials', label: 'Financials & Deposits' },
  { id: 'logistics', label: 'Logistics & Paperwork' },
];

const FAQ_DATA: Record<string, any[]> = {
  'visa-benefits': [
    {
      value: 'vb-1',
      trigger: "What is the SRRV?",
      content: "The Special Resident Retiree’s Visa (SRRV) is a special non-immigrant visa issued by the Philippine Bureau of Immigration through the Philippine Retirement Authority (PRA). It entitles the holder to multiple-entry privileges with the right to stay permanently or indefinitely in the Philippines."
    },
    {
      value: 'vb-2',
      trigger: "Who qualifies for the SRRV?",
      content: "Foreign nationals and former Filipino citizens who are at least 50 years of age, meet the character requirements, and can fulfill the required financial time deposit in a PRA-accredited bank qualify for the program."
    },
    {
      value: 'vb-3',
      trigger: "What major benefits do I get with an SRRV besides permanent residency?",
      content: "Beyond the right to live indefinitely in the Philippines, SRRV holders enjoy significant privileges:\n\n• Exemption from Travel Tax: Provided you have not stayed in the country for more than one year since your last entry.\n• Streamlined Bureau of Immigration Compliance: You are exempt from securing regular Exit and Re-entry Clearances.\n• Tax-Free Moving: A one-time tax-free importation of household goods and personal effects worth up to $7,000.\n• Study & Work Privileges: Children can study without needing a separate Special Study Permit. You are also permitted to work or start a local business, provided you obtain an Alien Employment Permit (AEP)."
    },
    {
      value: 'vb-4',
      trigger: "Can I bring my family?",
      content: "Yes. The base visa deposit covers the principal retiree and up to two dependents (spouse or unmarried children under 21 years old). An additional deposit of $15,000 is required for each extra dependent beyond the first two (except for former Filipinos)."
    },
    {
      value: 'vb-5',
      trigger: "Is Retire Well SRRV a government agency?",
      content: "No. Retire Well SRRV is an independent marketing and consulting firm specializing in marketing the SRRV program and providing private concierge services. We assist you in preparing your application perfectly and escorting you through the official government channels to ensure a smooth, error-free process."
    }
  ],
  financials: [
    {
      value: 'fin-1',
      trigger: "What are the main variants of the SRRV, and how much is the deposit?",
      content: "The two most common options for retirees aged 50 and above are:\n\n• SRRV Smile: For retirees who prefer to keep their visa deposit untouched in a PRA-accredited bank. It requires a visa deposit of $20,000.\n• SRRV Classic: For retirees who want to convert their visa deposit into active investments, such as purchasing a condominium unit or long-term lease of land/housing. It requires a deposit of $10,000 (if you have a pension of at least $800/month for individuals or $1,000/month for couples) or $20,000 (without a pension)."
    },
    {
      value: 'fin-2',
      trigger: "How does the bank deposit requirement work? Does the money belong to the government?",
      content: "No, the money remains entirely yours. The financial deposit must be sent via bank-to-bank inward remittance directly into a PRA-accredited bank account under your name. The funds are held as a time deposit. If you choose the SRRV Classic track, you can later apply to convert that deposit into active, approved investments, such as purchasing a condominium or funding a long-term housing lease."
    },
    {
      value: 'fin-3',
      trigger: "What happens if I decide to leave the program? Can I get my money back?",
      content: "Yes. The SRRV program guarantees the full repatriation of your dollar time deposit should you choose to cancel your visa and withdraw from the program, provided all local administrative obligations and clearances are cleared."
    }
  ],
  logistics: [
    {
      value: 'log-1',
      trigger: "How long do I need to be in the Philippines for the final steps?",
      content: "Generally, the final processing at the PRA takes about 7 to 10 working days once all original documents are submitted and the required inward bank remittance is confirmed. Our Concierge Service is designed to optimize this timeline so you aren't stuck waiting on administrative delays."
    },
    {
      value: 'log-2',
      trigger: "Can I travel outside the Philippines while my SRRV application is being processed?",
      content: "It is highly recommended that you remain in the country during the final processing stage. When you submit your application, your original physical passport must be surrendered to the PRA and the Bureau of Immigration for the visa stamping process. Because you will not have your physical passport, you will not be able to clear international borders until the visa is finalized and returned to you."
    },
    {
      value: 'log-3',
      trigger: "What exactly does \"Apostille\" mean for my documentation?",
      content: "To be accepted by the Philippine government, all official documents issued abroad (such as your police clearances, background checks, or marriage certificates) must be legally authenticated. If your home country is a member of the Apostille Convention, you simply need to get the documents \"Apostilled\" by the designated government authority in your country. If your country is not a member, your documents must be authenticated by the Philippine Embassy or Consulate in your place of origin."
    },
    {
      value: 'log-4',
      trigger: "Do my foreign documents have an expiration date for the application?",
      content: "Yes. Documents like your home-country police clearance (such as an FBI background check for US citizens) and medical certificates generally must be valid and issued within 6 months of your formal application submission to the PRA. Part of our digital advisory service is mapping out a strict timeline so none of your paperwork expires before you land."
    },
    {
      value: 'log-5',
      trigger: "Does the SRRV grant me the right to own land in the Philippines?",
      content: "Under Philippine law, foreign nationals cannot own land outright. However, as an SRRV holder, you can legally purchase and fully own a condominium unit in your name, or enter into a secure, long-term lease agreement for a parcel of land or a house."
    }
  ]
};

export default function Faq() {
  const [activeCategory, setActiveCategory] = useState<string>('visa-benefits');
  const [searchQuery, setSearchQuery] = useState<string>(''); // Track search input
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const router = useRouter();

  // Handle sidebar clicks (resets search when switching categories manually)
  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    setSearchQuery('');
  };

  // Filter questions dynamically based on search query or active category
  const filteredQuestions = useMemo(() => {
    if (searchQuery.trim() === '') {
      return FAQ_DATA[activeCategory] || [];
    }

    const query = searchQuery.toLowerCase();
    const allQuestions = Object.values(FAQ_DATA).flat();

    return allQuestions.filter(
      (q) =>
        q.trigger.toLowerCase().includes(query) ||
        q.content.toLowerCase().includes(query)
    );
  }, [searchQuery, activeCategory]);

  // Determine dynamic heading text
  const currentCategoryLabel =
    searchQuery.trim() !== ''
      ? `Search Results for "${searchQuery}"`
      : FAQ_CATEGORIES.find((cat) => cat.id === activeCategory)?.label || '';

  const handleClick = () => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800">
      {/* Hero Section */}
      <section className="bg-[#F6F5F2] pt-20 pb-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">Frequently Asked Questions</h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8 text-lg">
          Everything you need to know about navigating the Philippine Retirement Authority’s SRRV program.
        </p>
        <Field className="max-w-2xl mx-auto relative">
          <div className="group relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              // Highlight sidebar button only if it's the active category AND we aren't currently searching
              const isActive = activeCategory === category.id && searchQuery.trim() === '';
              
              return (
                <li key={category.id}>
                  <SideButton
                    label={category.label}
                    isClicked={isActive}
                    onClick={() => handleCategoryClick(category.id)}
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
            {filteredQuestions.length > 0 ? (
              <AccordionCard items={filteredQuestions} />
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center">
                <p className="text-gray-500 text-lg">
                  No results found for <span className="font-semibold text-gray-900">"{searchQuery}"</span>.
                </p>
                <p className="text-gray-400 mt-2 text-sm">
                  Please try adjusting your search terms or browse the categories on the left.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

            {/* Process Timeline Section */}
      <section className="bg-white border-y border-gray-100 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-[#0F172A] mb-4">The Step-by-Step Application Process</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Applying for the Special Resident Retiree’s Visa (SRRV) involves two distinct phases: Pre-Arrival Preparation in your home country and On-the-Ground Finalization in the Philippines.
            </p>
          </div>

          <div className="space-y-16">
            {/* Phase 1 */}
            <div>
              <div className="inline-block bg-[#E2E8F0] text-[#0F172A] px-5 py-2 rounded-lg text-sm font-bold tracking-wider uppercase mb-8">
                Phase 1: Pre-Arrival Preparation (Home Country)
              </div>
              
              <div className="flex flex-col">
                {/* Step 1 */}
                <div className="flex gap-5 md:gap-6">
                  {/* Number & Line Column */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border-2 border-[#9E1B32] bg-white flex items-center justify-center flex-shrink-0 z-10">
                      <span className="text-[#9E1B32] font-bold text-sm">1</span>
                    </div>
                    {/* Vertical Line */}
                    <div className="w-0.5 bg-gray-200 flex-grow my-2"></div>
                  </div>
                  
                  {/* Content Column */}
                  <div className="pb-12 pt-1">
                    <h4 className="text-xl font-bold text-[#0F172A] mb-2">Choose Your SRRV Track & Verify Eligibility</h4>
                    <p className="text-gray-600 mb-4">
                      <strong className="text-gray-800">What Happens:</strong> You select the specific visa option that fits your financial profile (e.g., SRRV Smile with a fixed $20,000 deposit, or SRRV Classic if you plan to convert your deposit into a condominium investment or have a lifetime pension).
                    </p>
                    <div className="bg-[#FAFAFA] p-4 rounded-xl border border-gray-100 flex gap-3">
                      <Shield className="w-5 h-5 text-[#9E1B32] flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">
                        <strong className="text-[#9E1B32]">How Retire Well SRRV Helps:</strong> We pre-screen your qualifications and pension documents to ensure you choose the absolute best, most cost-effective visa track before you spend a single dollar.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-5 md:gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border-2 border-[#9E1B32] bg-white flex items-center justify-center flex-shrink-0 z-10">
                      <span className="text-[#9E1B32] font-bold text-sm">2</span>
                    </div>
                    <div className="w-0.5 bg-gray-200 flex-grow my-2"></div>
                  </div>
                  <div className="pb-12 pt-1">
                    <h4 className="text-xl font-bold text-[#0F172A] mb-2">Document Gathering & Legalization (1 to 2 Months)</h4>
                    <p className="text-gray-600 mb-4">
                      <strong className="text-gray-800">What Happens:</strong> You must collect essential documentation (background checks, medical certificates, marriage/birth certificates). Because these originate outside the Philippines, they must be Apostilled by your home country’s competent authority or authenticated by the Philippine Embassy/Consulate.
                    </p>
                    <div className="bg-[#FAFAFA] p-4 rounded-xl border border-gray-100 flex gap-3">
                      <Shield className="w-5 h-5 text-[#9E1B32] flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">
                        <strong className="text-[#9E1B32]">How Retire Well SRRV Helps:</strong> We provide an exact, customized checklist based on your country of origin and run a comprehensive Digital Document Review on your paperwork. We catch errors before you travel, preventing delays or denials.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-5 md:gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border-2 border-[#9E1B32] bg-white flex items-center justify-center flex-shrink-0 z-10">
                      <span className="text-[#9E1B32] font-bold text-sm">3</span>
                    </div>
                    {/* No line extending below the last step of Phase 1 */}
                  </div>
                  <div className="pb-4 pt-1">
                    <h4 className="text-xl font-bold text-[#0F172A] mb-2">Wire Your Visa Deposit (Inward Remittance)</h4>
                    <p className="text-gray-600 mb-4">
                      <strong className="text-gray-800">What Happens:</strong> You arrange an international wire transfer of your required visa deposit directly into a PRA-accredited bank account. The bank will issue a formal Certificate of Dollar Time Deposit once it arrives.
                    </p>
                    <div className="bg-[#FAFAFA] p-4 rounded-xl border border-gray-100 flex gap-3">
                      <Shield className="w-5 h-5 text-[#9E1B32] flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">
                        <strong className="text-[#9E1B32]">How Retire Well SRRV Helps:</strong> We provide precise, verified routing and remittance instructions to ensure your funds land safely in the correct, PRA-sanctioned account, avoiding costly wire errors.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 2 */}
            <div>
              <div className="inline-block bg-[#E2E8F0] text-[#0F172A] px-5 py-2 rounded-lg text-sm font-bold tracking-wider uppercase mb-8">
                Phase 2: On-the-Ground Finalization (In the Philippines)
              </div>
              
              <div className="flex flex-col">
                {/* Step 4 */}
                <div className="flex gap-5 md:gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border-2 border-[#9E1B32] bg-white flex items-center justify-center flex-shrink-0 z-10">
                      <span className="text-[#9E1B32] font-bold text-sm">4</span>
                    </div>
                    <div className="w-0.5 bg-gray-200 flex-grow my-2"></div>
                  </div>
                  <div className="pb-12 pt-1">
                    <h4 className="text-xl font-bold text-[#0F172A] mb-2">Arrive in the Philippines & Pre-Evaluation (Days 1–2)</h4>
                    <p className="text-gray-600 mb-4">
                      <strong className="text-gray-800">What Happens:</strong> You land in the Philippines on a standard tourist visa or Balikbayan status. Your complete hard-copy application and physical passport are submitted to the PRA for initial evaluation.
                    </p>
                    <div className="bg-[#FAFAFA] p-4 rounded-xl border border-gray-100 flex gap-3">
                      <Shield className="w-5 h-5 text-[#9E1B32] flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">
                        <strong className="text-[#9E1B32]">How Retire Well SRRV Helps:</strong> Our Concierge Service begins the moment you touch down. We arrange your airport transfer to your accommodation and handle the immediate logistical handover of your documents.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex gap-5 md:gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border-2 border-[#9E1B32] bg-white flex items-center justify-center flex-shrink-0 z-10">
                      <span className="text-[#9E1B32] font-bold text-sm">5</span>
                    </div>
                    <div className="w-0.5 bg-gray-200 flex-grow my-2"></div>
                  </div>
                  <div className="pb-12 pt-1">
                    <h4 className="text-xl font-bold text-[#0F172A] mb-2">Medical Clearances & Local Bureaucracy (Days 3–5)</h4>
                    <p className="text-gray-600 mb-4">
                      <strong className="text-gray-800">What Happens:</strong> You must pass a physical medical examination via a local, PRA-accredited or Department of Health (DOH) facility. (If you have been in the PH for &gt;30 days prior, an NBI clearance is also required).
                    </p>
                    <div className="bg-[#FAFAFA] p-4 rounded-xl border border-gray-100 flex gap-3">
                      <Shield className="w-5 h-5 text-[#9E1B32] flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">
                        <strong className="text-[#9E1B32]">How Retire Well SRRV Helps:</strong> Navigating local clinics can be exhausting. Our concierge team coordinates appointments, physically escorts you to facilities, and ensures fast local clearance processing.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 6 */}
                <div className="flex gap-5 md:gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border-2 border-[#9E1B32] bg-white flex items-center justify-center flex-shrink-0 z-10">
                      <span className="text-[#9E1B32] font-bold text-sm">6</span>
                    </div>
                    <div className="w-0.5 bg-gray-200 flex-grow my-2"></div>
                  </div>
                  <div className="pb-12 pt-1">
                    <h4 className="text-xl font-bold text-[#0F172A] mb-2">Application Submission & Biometrics at the PRA</h4>
                    <p className="text-gray-600 mb-4">
                      <strong className="text-gray-800">What Happens:</strong> You visit the PRA Head Office to submit all original documents, your bank certificate, and passport. You pay the government fees ($1,400 principal / $300 per dependent) and capture biometrics.
                    </p>
                    <div className="bg-[#FAFAFA] p-4 rounded-xl border border-gray-100 flex gap-3">
                      <Shield className="w-5 h-5 text-[#9E1B32] flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">
                        <strong className="text-[#9E1B32]">How Retire Well SRRV Helps:</strong> We escort you directly to the PRA office, manage the physical presentation of your folder, and ensure your application moves smoothly into the approval queue.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 7 */}
                <div className="flex gap-5 md:gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border-2 border-[#9E1B32] bg-white flex items-center justify-center flex-shrink-0 z-10">
                      <span className="text-[#9E1B32] font-bold text-sm">7</span>
                    </div>
                    <div className="w-0.5 bg-gray-200 flex-grow my-2"></div>
                  </div>
                  <div className="pb-12 pt-1">
                    <h4 className="text-xl font-bold text-[#0F172A] mb-2">Immigration Endorsement & Stamping (7 to 10 Working Days)</h4>
                    <p className="text-gray-600 mb-4">
                      <strong className="text-gray-800">What Happens:</strong> Once approved, the PRA endorses your application to the Bureau of Immigration. Your physical passport is held securely while the indefinite multiple-entry SRRV is stamped.
                    </p>
                    <div className="bg-[#FFF8E6] p-4 rounded-xl border border-[#F5D06A] flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-[#B8860B] flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-800">
                        <strong>Note:</strong> You cannot travel internationally during this brief window while your passport is being processed.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 8 */}
                <div className="flex gap-5 md:gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border-2 border-[#9E1B32] bg-white flex items-center justify-center flex-shrink-0 z-10">
                      <span className="text-[#9E1B32] font-bold text-sm">8</span>
                    </div>
                    {/* No line extending below the final step */}
                  </div>
                  <div className="pb-0 pt-1">
                    <h4 className="text-xl font-bold text-[#0F172A] mb-2">Oath of Affirmation & Welcome to the Philippines!</h4>
                    <p className="text-gray-600">
                      <strong className="text-gray-800">What Happens:</strong> You attend a brief official orientation and Oath of Affirmation ceremony. You are handed your stamped passport, your official PRA Membership ID card, and your SRRV Certification. You are now officially a permanent resident of the Philippines!
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-[#9E1B32] rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-lg">
          <div className="text-white max-w-xl text-center md:text-left">
            <h3 className="text-3xl font-serif mb-4">Ready to Start Your Assessment?</h3>
            <p className="text-white/90 text-lg leading-relaxed">
              If you still have questions or are ready to begin the process, schedule a consultation with our experts. We're here to help!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <button
              onClick={handleClick}
              className="px-8 py-4 bg-white text-[#9E1B32] text-sm font-bold rounded-xl shadow-sm hover:bg-gray-50 transition whitespace-nowrap transform hover:-translate-y-0.5"
            >
              Get Started Now
            </button>
            <button
              onClick={() => setIsConsultModalOpen(true)}
              className="px-8 py-4 border-2 border-white/40 text-white text-sm font-bold rounded-xl hover:bg-white/10 transition whitespace-nowrap"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      <ConsultationModal
        isOpen={isConsultModalOpen}
        onClose={() => setIsConsultModalOpen(false)}
      />
      <Footer />
    </div>
  );
}