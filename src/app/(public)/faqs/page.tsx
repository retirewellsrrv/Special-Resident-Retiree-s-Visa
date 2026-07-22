'use client';

import React, { useState, useMemo } from 'react';
import { Search, Shield, AlertTriangle, ChevronRight, Check } from 'lucide-react';
import { Field } from '@/components/ui/field';
import AccordionCard from '@/components/faqs/accordion-card';
import SideButton from '@/components/faqs/side-button';
import ConsultationModal from '@/components/faqs/consultation-modal';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';

const FAQ_CATEGORIES = [
  { id: 'trust-safety', label: 'Trust, Safety & Our Fees' },
  { id: 'eligibility', label: 'Eligibility & Family Dependents' },
  { id: 'money-tax', label: 'Money, Taxation & The Deposit' },
  { id: 'healthcare-living', label: 'Healthcare & Living Privileges' },
  { id: 'exit-logistics', label: 'Exiting & Emergency Logistics' },
];

const FAQ_DATA: Record<string, { value: string; trigger: string; content: string }[]> = {
  'trust-safety': [
    {
      value: 'ts-1',
      trigger: 'Do I send my visa deposit funds to Retire Well SRRV Marketing and Consulting?',
      content: 'Absolutely not. For your complete security, Retire Well never holds, touches, or acts as an intermediary for your visa deposit. All deposit funds must be remitted directly from your international account to an officially approved, government-partnered depository bank in the Philippines (such as the Development Bank of the Philippines). Our job is strictly to consult, guide, and handle the administrative legwork—your retirement savings remain securely inside the regulated banking system at all times.',
    },
    {
      value: 'ts-2',
      trigger: 'How do your company fees work, and what is the difference between the $50 and $300 services?',
      content: 'We split our services into two distinct phases so you only pay for the level of support you need:\n\nThe $50 Consultation Fee: Covers all remote preparation. We pre-vet your documents from your home country, guide your Apostille process, and track your secure bank remittance before you travel.\n\nThe $300 Concierge Service Fee: Covers premium, on-the-ground physical support once you arrive in Manila. We handle your local immigration clearances, NBI tracking (if required), visa extensions, document translations, and physically escort you to your medical exams, ID biometrics, and the final PRA induction ceremony.\n\nNote: These fees do not include official government-mandated PRA processing fees ($1,500) or your actual visa bank deposit.',
    },
    {
      value: 'ts-3',
      trigger: 'Can I complete the medical exam and PRA processing on my own?',
      content: 'Yes, the PRA does allow independent walk-ins. However, doing so means navigating busy Manila transit, managing multiple appointments at separate diagnostic clinics and government offices, and handling complex paperwork entirely on your own. For just $300, our VIP Concierge service turns a stressful, multi-day logistical puzzle into a seamless, fully escorted experience. We handle the stress, so you can enjoy the arrival.',
    },
  ],
  eligibility: [
    {
      value: 'el-1',
      trigger: 'Can I bring my family with me on my SRRV, and how much does it cost?',
      content: 'Yes, you can include your legal spouse and unmarried children under 21 years old. Your core deposit (e.g., $15,000 or $20,000) covers the principal applicant and up to two (2) dependents. If you wish to bring a third dependent or more, an additional visa deposit of $15,000 per dependent is required by the PRA (except for former Filipinos or diplomats).',
    },
    {
      value: 'el-2',
      trigger: 'Do my dependents have to travel to Manila with me to get the visa?',
      content: 'Yes. Every dependent included in the application must physically go through the same medical examination, biometrics capture, and PRA processing steps as the principal applicant. The Retire Well Concierge Service covers your family\'s local scheduling and escort needs as well.',
    },
    {
      value: 'el-3',
      trigger: 'What happens to my children\'s SRRV status when they turn 21?',
      content: 'Once a dependent child turns 21, they are no longer legally considered dependents under the principal\'s visa. They will either need to transition to their own independent SRRV (if they are 40 or older), secure a different visa category (like a student or work visa), or exit the program. Retire Well provides transition consulting to help your family navigate this milestone smoothly.',
    },
  ],
  'money-tax': [
    {
      value: 'mt-1',
      trigger: 'Will my deposit earn interest while it is held in the PRA bank?',
      content: 'Yes, but it depends on the bank and the account type. The funds are placed into a time deposit account under your name, locked for the PRA. Interest rates are subject to standard Philippine banking terms and are taxable locally.',
    },
    {
      value: 'mt-2',
      trigger: 'Do I have to pay Philippine income tax on my foreign pension or savings?',
      content: 'No. One of the greatest financial benefits of the SRRV is that the Philippine government exempts all foreign-sourced income, social security, and pensions from local taxation. You only pay taxes on income actively earned inside the Philippines (such as local business profits or local employment).',
    },
    {
      value: 'mt-3',
      trigger: 'What happens to my SRRV deposit if I pass away?',
      content: 'In the event of the principal applicant\'s passing, the visa deposit does not automatically default to the government. If your spouse is also an SRRV holder, they can apply to become the new principal applicant and inherit the deposit. Alternatively, the funds can be legally transferred to your designated heirs via standard estate and inheritance procedures.',
    },
  ],
  'healthcare-living': [
    {
      value: 'hl-1',
      trigger: 'Can I use my foreign health insurance in the Philippines, or do I need local coverage?',
      content: 'While some premium international insurance plans offer global coverage that includes top-tier hospitals in Manila, many local clinics require upfront cash payments or local insurance. As an SRRV resident, you are legally eligible to enroll in PhilHealth (the Philippine national health insurance program) as an informal/expat member, giving you subsidized medical care across the country.',
    },
    {
      value: 'hl-2',
      trigger: 'Am I allowed to buy land or a house with an SRRV?',
      content: 'Under Philippine law, foreign nationals cannot legally own land in their own name, regardless of their visa status. However, your SRRV gives you two highly secure legal alternatives: you can buy and hold the absolute freehold title to a condominium unit, or you can enter into a long-term, PRA-protected lease agreement on a house and lot for up to 50 years.',
    },
    {
      value: 'hl-3',
      trigger: 'Can I use my driver\'s license from my home country, or do I need a Philippine license?',
      content: 'You can legally drive using your valid foreign license for up to 90 days after your arrival in the Philippines. After that, you must convert it to a Land Transportation Office (LTO) Philippine Driver\'s License. Because this requires navigating local government offices, the Retire Well Concierge team can assist you with the scheduling and document translation required for this conversion.',
    },
    {
      value: 'hl-4',
      trigger: 'Can I use my SRRV deposit to buy real estate?',
      content: 'Yes, but only under the SRRV Classic track. Once your visa is approved, you can request the PRA to release your funds to purchase a ready-for-occupancy (RFO) condominium unit or to fund a long-term lease on land/housing. The investment value must be at least $50,000. Retire Well can assist you in navigating the property conversion request with the PRA.',
    },
  ],
  'exit-logistics': [
    {
      value: 'ex-1',
      trigger: 'Can I temporarily withdraw my money if I have a financial emergency?',
      content: 'No. The visa deposit must remain untouched and locked in the accredited bank to maintain your permanent residency status. If you withdraw or drop the deposit below the mandatory threshold, your SRRV will be automatically canceled by the PRA, and you will be reverted to tourist status.',
    },
    {
      value: 'ex-2',
      trigger: 'How long does it take to cancel the SRRV and get my deposit money back?',
      content: 'If you choose to permanently exit the program, the visa downgrading and fund repatriation process typically takes 30 to 60 working days. The PRA must formally approve the cancellation before the bank is authorized to release and wire your funds back to your international account. Retire Well offers dedicated exit-processing services to manage this securely on your behalf.',
    },
    {
      value: 'ex-3',
      trigger: 'How often do I have to renew my SRRV card, and can I do it from abroad?',
      content: 'Your physical PRA ID card must be renewed either annually or every three years. While the renewal fee is standard ($360 for a family of three), the renewal must be processed inside the Philippines. If you are traveling abroad when your card expires, Retire Well can assist you in filing for a specialized renewal clearance so you can re-enter the country smoothly without paying tourist penalties.',
    },
    {
      value: 'ex-4',
      trigger: 'Is my passport held during the application process?',
      content: 'Yes. The PRA will hold your physical passport while processing and stamping the permanent residency visa. Because this takes 30 to 45 working days, you should not plan any international travel during this window. Retire Well monitors your tourist visa status during this time and files extensions if necessary.',
    },
    {
      value: 'ex-5',
      trigger: 'Can I work or start a business in the Philippines with an SRRV?',
      content: 'The SRRV allows you to live and invest in the country indefinitely. However, if you plan to be actively employed by a Philippine company, you must apply for an Alien Employment Permit (AEP) from the Department of Labor and Employment (DOLE).',
    },
  ],
};

const principalChecklist = [
  'Valid Passport: Minimum 6 months validity remaining with a valid Philippine tourist visa.',
  'PRA Application Form: Completed and typewritten (Retire Well will assist in filling this out perfectly).',
  'Medical Certificate: Issued within 6 months using the official PRA form.',
  'Police Clearance: From your home country (Apostilled/Authenticated).',
  'NBI Clearance: Required only if you have stayed in the Philippines for more than 30 consecutive days prior to filing.',
  'Proof of Pension (If applicable): Official documentation showing a lifetime monthly payout of at least $800.',
  'Bank Certificate: Showing successful inward remittance directly to the PRA-approved bank.',
  'Photos: 8 pieces of recent 2x2 passport-style photos with a white background.',
];

const dependentChecklist = [
  { label: 'Spouse: Apostilled Marriage Certificate.', forSpouse: true },
  { label: 'Children: Apostilled Birth Certificates.', forChild: true },
  { label: 'Police Clearance: For any dependent aged 18 or older.', forAdult: true },
];

function CheckboxItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div
        className={`mt-0.5 w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
          checked
            ? 'bg-[#9E1B32] border-[#9E1B32]'
            : 'border-gray-300 group-hover:border-[#9E1B32]'
        }`}
        onClick={onChange}
      >
        {checked && <Check className="w-3.5 h-3.5 text-white" />}
      </div>
      <span className={`text-sm leading-relaxed ${checked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
        {label}
      </span>
    </label>
  );
}

export default function Faq() {
  const [activeCategory, setActiveCategory] = useState<string>('trust-safety');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [principalChecks, setPrincipalChecks] = useState<boolean[]>(new Array(principalChecklist.length).fill(false));
  const [dependentChecks, setDependentChecks] = useState<boolean[]>(new Array(dependentChecklist.length).fill(false));
  const router = useRouter();

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    setSearchQuery('');
  };

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

  const currentCategoryLabel =
    searchQuery.trim() !== ''
      ? `Search Results for "${searchQuery}"`
      : FAQ_CATEGORIES.find((cat) => cat.id === activeCategory)?.label || '';

  const handleClick = () => {
    router.push('/register');
  };

  const phases = [
    { num: 1, title: 'Pre-Arrival & Remittance', fee: '$50 Consultation', color: 'bg-[#9E1B32]' },
    { num: 2, title: 'VIP Concierge & Clearances', fee: '$300 Concierge', color: 'bg-[#7A1527]' },
    { num: 3, title: 'ID & PRA Ceremony', fee: 'Included', color: 'bg-[#5C101E]' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800">
      {/* Hero Section */}
      <section className="bg-[#F6F5F2] pt-20 pb-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">Frequently Asked Questions</h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8 text-lg">
          Everything you need to know about navigating the Philippine Retirement Authority&rsquo;s SRRV program.
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
      <section className="bg-white border-y border-gray-100 max-w-full px-6 py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Categories</h3>
          <ul className="space-y-2">
            {FAQ_CATEGORIES.map((category) => {
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

        <div className="md:col-span-9">
          <h2 className="text-2xl font-serif text-gray-900 mb-6">{currentCategoryLabel}</h2>
          <div className="space-y-4">
            {filteredQuestions.length > 0 ? (
              <AccordionCard items={filteredQuestions} />
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center">
                <p className="text-gray-500 text-lg">
                  No results found for <span className="font-semibold text-gray-900">&ldquo;{searchQuery}&rdquo;</span>.
                </p>
                <p className="text-gray-400 mt-2 text-sm">
                  Please try adjusting your search terms or browse the categories on the left.
                </p>
              </div>
            )}
          </div>
        </div>
        </div>
      </section>

      {/* Timeline Overview */}
      <section className="bg-[#F6F5F2] py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif text-[#0F172A] mb-4">Your 3-Phase SRRV Journey</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              From document preparation in your home country to your official PRA induction ceremony in Manila.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-0">
            {phases.map((phase, i) => (
              <React.Fragment key={phase.num}>
                <div className="flex-1 w-full md:w-auto">
                  <div className={`${phase.color} rounded-xl p-5 text-white text-center`}>
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white font-bold text-sm mb-2">
                      {phase.num}
                    </div>
                    <h3 className="font-semibold text-sm md:text-base">{phase.title}</h3>
                    <p className="text-white/70 text-xs mt-1">{phase.fee}</p>
                  </div>
                </div>
                {i < phases.length - 1 && (
                  <div className="hidden md:flex items-center justify-center shrink-0 px-2">
                    <ChevronRight className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Phase 1: Consultation & Document Pre-Vetting */}
      <section className="bg-white border-y border-gray-100 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#9E1B32] text-white font-bold text-xs">1</span>
            <span className="text-xs font-bold text-[#9E1B32] uppercase tracking-wider">Phase 1 — Remote</span>
          </div>
          <h2 className="text-3xl font-serif text-[#0F172A] mb-1">Consultation &amp; Document Pre-Vetting</h2>
          <p className="text-gray-500 font-medium mb-8">$50 USD — One-Time Consultation Fee</p>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex gap-4 md:gap-6">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border-2 border-[#9E1B32] bg-white flex items-center justify-center shrink-0">
                  <span className="text-[#9E1B32] font-bold text-sm">1</span>
                </div>
                <div className="w-0.5 bg-gray-200 flex-grow my-2" />
              </div>
              <div className="pb-8 pt-1">
                <h3 className="text-xl font-bold text-[#0F172A] mb-2">Document Pre-Vetting &amp; Checklist (Home Country)</h3>
                <p className="text-gray-600 mb-3">
                  We review your background checks and pension documents before you travel. We provide an exact, customized document checklist and guide you through the Apostille process in your home country.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 md:gap-6">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border-2 border-[#9E1B32] bg-white flex items-center justify-center shrink-0">
                  <span className="text-[#9E1B32] font-bold text-sm">2</span>
                </div>
              </div>
              <div className="pb-4 pt-1">
                <h3 className="text-xl font-bold text-[#0F172A] mb-2">Coordinating Your Inward Bank Remittance</h3>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-start gap-3">
                  <span className="text-lg shrink-0 mt-0.5">🔒</span>
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A] mb-1">Absolute Financial Security</p>
                    <p className="text-sm text-gray-700">
                      At Retire Well, we never handle your money. Your required visa deposit is wired directly by you,
                      from your overseas bank account, straight into an official, PRA-accredited bank (such as DBP, PNB, BDO, or UnionBank).
                    </p>
                  </div>
                </div>
                <p className="text-gray-600">
                  We coordinate directly with the depository bank to track your transfer, ensure it is properly tagged as an &ldquo;inward remittance,&rdquo; and secure your official Bank Certificate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Phase 2: VIP Arrival & Local Processing */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#7A1527] text-white font-bold text-xs">2</span>
            <span className="text-xs font-bold text-[#7A1527] uppercase tracking-wider">Phase 2 — On-Site</span>
          </div>
          <h2 className="text-3xl font-serif text-[#0F172A] mb-1">VIP Arrival &amp; Local Processing</h2>
          <p className="text-gray-500 font-medium mb-8">$300 USD — Concierge Service Fee</p>

          <div className="space-y-8">
            {/* Step 3 */}
            <div className="flex gap-4 md:gap-6">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border-2 border-[#7A1527] bg-white flex items-center justify-center shrink-0">
                  <span className="text-[#7A1527] font-bold text-sm">3</span>
                </div>
                <div className="w-0.5 bg-gray-200 flex-grow my-2" />
              </div>
              <div className="pb-8 pt-1">
                <h3 className="text-xl font-bold text-[#0F172A] mb-2">Accompanied Medical Examination</h3>
                <p className="text-gray-600">
                  Your Retire Well Concierge takes the stress out of your health screening&mdash;escorting you to a Department of Health (DOH) accredited medical clinic in Manila, navigating the lines, and ensuring your Medical Examination Clearance is accurately compiled.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4 md:gap-6">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border-2 border-[#7A1527] bg-white flex items-center justify-center shrink-0">
                  <span className="text-[#7A1527] font-bold text-sm">4</span>
                </div>
                <div className="w-0.5 bg-gray-200 flex-grow my-2" />
              </div>
              <div className="pb-8 pt-1">
                <h3 className="text-xl font-bold text-[#0F172A] mb-2">Bureau of Immigration, NBI &amp; Visa Extensions</h3>
                <p className="text-gray-600 mb-3">
                  Our team handles the local legwork to secure your Bureau of Immigration Clearance Certificate (BICC).
                </p>
                <div className="bg-[#FAFAFA] rounded-xl border border-gray-200 p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">
                      <strong>Extended Stay Rule:</strong> If you have already been in the Philippines for more than 30 days prior to filing, a local NBI Clearance is required. We handle the local biometric scheduling and fingerprinting navigation for you.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-[#9E1B32] shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">
                      <strong>Visa Buffer:</strong> We actively monitor and process your tourist visa extensions so your legal status never lapses while the PRA holds your physical passport (typically 30&ndash;45 working days).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-4 md:gap-6">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border-2 border-[#7A1527] bg-white flex items-center justify-center shrink-0">
                  <span className="text-[#7A1527] font-bold text-sm">5</span>
                </div>
              </div>
              <div className="pb-4 pt-1">
                <h3 className="text-xl font-bold text-[#0F172A] mb-2">Philippine ID Processing &amp; The PRA Ceremony</h3>
                <p className="text-gray-600">
                  We manage your paperwork, certified document translations, and secure hand-carried passport transport. We walk you through the biometrics and photo capture needed for your official Philippine PRA ID Card (your local pass for banking and re-entry). Finally, your concierge personally escorts you to the official PRA induction ceremony to receive your stamped passport and ID card.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Document Checklist */}
      <section className="bg-white border-y border-gray-100 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif text-[#0F172A] mb-4">Document Checklist</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Use the checkboxes below to visually audit your documents before submission.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Principal */}
            <div className="bg-[#FAFAFA] rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-[#0F172A] mb-4">For the Principal Applicant</h3>
              <div className="space-y-3">
                {principalChecklist.map((item, i) => (
                  <CheckboxItem
                    key={i}
                    label={item}
                    checked={principalChecks[i]}
                    onChange={() => {
                      const next = [...principalChecks];
                      next[i] = !next[i];
                      setPrincipalChecks(next);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Dependents */}
            <div className="bg-[#FAFAFA] rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-[#0F172A] mb-4">For Dependents (Spouse / Children under 21)</h3>
              <div className="space-y-3">
                {dependentChecklist.map((item, i) => (
                  <CheckboxItem
                    key={i}
                    label={item.label}
                    checked={dependentChecks[i]}
                    onChange={() => {
                      const next = [...dependentChecks];
                      next[i] = !next[i];
                      setDependentChecks(next);
                    }}
                  />
                ))}
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
              If you still have questions or are ready to begin the process, schedule a consultation with our experts.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <button
              onClick={handleClick}
              className="px-8 py-4 bg-white text-[#9E1B32] text-sm font-bold rounded-xl shadow-sm hover:bg-gray-50 transition whitespace-nowrap"
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
