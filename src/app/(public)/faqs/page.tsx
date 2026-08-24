'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, FileText, Users, UserCheck, Clock, DollarSign, AlertTriangle } from 'lucide-react';
import { Field } from '@/components/ui/field';
import AccordionCard from '@/components/faqs/accordion-card';
import ConsultationModal from '@/components/faqs/consultation-modal';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';

const FAQ_CATEGORIES = [
  { id: 'eligibility', label: 'SRRV Eligibility & Family Dependents' },
  { id: 'financial', label: 'Financial & Deposit: Trust, Safety & Our Fees' },
  { id: 'money-taxation', label: 'Money, Taxation, & The Deposit' },
  { id: 'healthcare', label: 'Healthcare & Living Privileges' },
  { id: 'exiting', label: 'Exiting the Program & Emergency Logistics' },
  { id: 'retire-well', label: 'Retire Well SRRV Consulting Services' },
];

const FAQ_DATA: Record<string, { value: string; trigger: string; content: string }[]> = {
  'eligibility': [
    {
      value: 'elig-1',
      trigger: 'Who is eligible to apply for the SRRV?',
      content: 'The Special Resident Retiree\u2019s Visa (SRRV) is available to qualified foreign nationals who meet the retirement age, financial, and documentary requirements set by the Philippine Retirement Authority (PRA).',
    },
    {
      value: 'elig-2',
      trigger: 'What is the minimum age requirement for SRRV applicants?',
      content: 'Foreign nationals who are 40-50 years old and above may apply for the SRRV, subject to meeting the required qualifications and financial requirements.',
    },
    {
      value: 'elig-3',
      trigger: 'Can my spouse and dependents be included in my SRRV application?',
      content: 'Yes. Qualified dependents may be included, such as a legal spouse and unmarried children below the required age limit, subject to PRA requirements.',
    },
    {
      value: 'elig-4',
      trigger: 'Do I need to deposit money to apply for SRRV?',
      content: 'Yes. SRRV applicants are required to comply with the financial requirements set by the PRA, which may vary depending on the applicant\u2019s profile and chosen SRRV option.',
    },
    {
      value: 'elig-5',
      trigger: 'Can I apply for SRRV while I am outside the Philippines?',
      content: 'Yes. Foreign nationals may begin the SRRV application process with proper guidance and preparation of the required documents before completing the necessary procedures in the Philippines.',
    },
    {
      value: 'elig-6',
      trigger: 'What documents are usually required for SRRV application?',
      content: 'Requirements may include a valid passport, medical clearance, police clearance (if applicable), proof of financial capability, and other supporting documents required by the PRA.',
    },
    {
      value: 'elig-7',
      trigger: 'How long does the SRRV application process take?',
      content: 'Processing time may vary depending on document completeness, government processing timelines, and individual circumstances. Retire Well helps ensure your application is properly prepared to avoid unnecessary delays.',
    },
    {
      value: 'elig-8',
      trigger: 'Can I work or invest in the Philippines with an SRRV?',
      content: 'The SRRV provides residency privileges, but specific activities such as employment or business participation may have additional requirements and regulations.',
    },
    {
      value: 'elig-9',
      trigger: 'Why should I get professional SRRV assistance?',
      content: 'The SRRV process involves important requirements and documentation. Retire Well provides personalized guidance to help make your retirement visa journey more organized, convenient, and stress-free.',
    },
    {
      value: 'elig-10',
      trigger: 'Can I bring my family with me on my SRRV, and how much does it cost?',
      content: 'Yes, you can include your legal spouse and unmarried children under 21 years old. Your core deposit (e.g., $15,000 or $20,000) covers the principal applicant and up to two (2) dependents. If you wish to bring a third dependent or more, an additional visa deposit of $15,000 per dependent is required by the PRA (except for former Filipinos or diplomats).',
    },
    {
      value: 'elig-11',
      trigger: 'Do my dependents have to travel to Manila with me to get the visa?',
      content: 'Yes. Every dependent included in the application must physically go through the same medical examination, biometrics capture, and PRA processing steps as the principal applicant. The Retire Well Concierge Service covers your family\u2019s local scheduling and escort needs as well.',
    },
    {
      value: 'elig-12',
      trigger: 'What happens to my children\u2019s SRRV status when they turn 21?',
      content: 'Once a dependent child turns 21, they are no longer legally considered dependents under the principal\u2019s visa. They will either need to transition to their own independent SRRV (if they are 40 or older), secure a different visa category (like a student or work visa), or exit the program. Retire Well provides transition consulting to help your family navigate this milestone smoothly.',
    },
  ],
  'financial': [
    {
      value: 'fin-1',
      trigger: 'Do I send my visa deposit funds to Retire Well SRRV Marketing and Consulting?',
      content: 'Absolutely not. For your complete security, Retire Well never holds, touches, or acts as an intermediary for your visa deposit. All deposit funds must be remitted directly from your international account to an officially approved, government-partnered depository bank in the Philippines (such as the Development Bank of the Philippines). Our job is strictly to consult, guide, and handle the administrative legwork\u2014your retirement savings remain securely inside the regulated banking system at all times.',
    },
    {
      value: 'fin-2',
      trigger: 'How do your company fees work, and what is the difference between the $50 and $350 services?',
      content: 'We split our services into two distinct phases so you only pay for the level of support you need:\n\nThe $50 Consultation Fee: Covers all remote preparation. We pre-vet your documents from your home country, guide your Apostille process, and track your secure bank remittance before you travel.\n\nThe $350 Concierge Service Fee: Covers premium, on-the-ground physical support once you arrive in Manila. We handle your local immigration clearances, NBI tracking (if required), visa extensions, document translations, and physically escort you to your medical exams, ID biometrics, and the final PRA induction ceremony.\n\nNote: These fees do not include official government-mandated PRA processing fees ($1,500) or your actual visa bank deposit.',
    },
    {
      value: 'fin-3',
      trigger: 'Can I complete the medical exam and PRA processing on my own?',
      content: 'Yes, the PRA does allow independent walk-ins. However, doing so means navigating busy Manila transit, managing multiple appointments at separate diagnostic clinics and government offices, and handling complex paperwork entirely on your own. For just $300, our VIP Concierge service turns a stressful, multi-day logistical puzzle into a seamless, fully escorted experience. We handle the stress, so you can enjoy the arrival.',
    },
  ],
  'money-taxation': [
    {
      value: 'tax-1',
      trigger: 'Will my deposit earn interest while it is held in the PRA bank?',
      content: 'Yes, but it depends on the bank and the account type. The funds are placed into a time deposit account under your name, locked for the PRA. Interest rates are subject to standard Philippine banking terms and are taxable locally.',
    },
    {
      value: 'tax-2',
      trigger: 'Do I have to pay Philippine income tax on my foreign pension or savings?',
      content: 'No. One of the greatest financial benefits of the SRRV is that the Philippine government exempts all foreign-sourced income, social security, and pensions from local taxation. You only pay taxes on income actively earned inside the Philippines (such as local business profits or local employment).',
    },
    {
      value: 'tax-3',
      trigger: 'What happens to my SRRV deposit if I pass away?',
      content: 'In the event of the principal applicant\u2019s passing, the visa deposit does not automatically default to the government. If your spouse is also an SRRV holder, they can apply to become the new principal applicant and inherit the deposit. Alternatively, the funds can be legally transferred to your designated heirs via standard estate and inheritance procedures.',
    },
  ],
  'healthcare': [
    {
      value: 'health-1',
      trigger: 'Can I use my foreign health insurance in the Philippines, or do I need local coverage?',
      content: 'While some premium international insurance plans offer global coverage that includes top-tier hospitals in Manila, many local clinics require upfront cash payments or local insurance. As an SRRV resident, you are legally eligible to enroll in PhilHealth (the Philippine national health insurance program) as an informal/expat member, giving you subsidized medical care across the country.',
    },
    {
      value: 'health-2',
      trigger: 'Am I allowed to buy land or a house with an SRRV?',
      content: 'Under Philippine law, foreign nationals cannot legally own land in their own name, regardless of their visa status. However, your SRRV gives you two highly secure legal alternatives: you can buy and hold the absolute freehold title to a condominium unit, or you can enter into a long-term, PRA-protected lease agreement on a house and lot for up to 50 years.',
    },
    {
      value: 'health-3',
      trigger: 'Can I use my driver\u2019s license from my home country, or do I need a Philippine license?',
      content: 'You can legally drive using your valid foreign license for up to 90 days after your arrival in the Philippines. After that, you must convert it to a Land Transportation Office (LTO) Philippine Driver\u2019s License. Because this requires navigating local government offices, the Retire Well Concierge team can assist you with the scheduling and document translation required for this conversion.',
    },
    {
      value: 'health-4',
      trigger: 'Can I use my SRRV deposit to buy real estate?',
      content: 'Yes, but only under the SRRV Classic track. Once your visa is approved, you can request the PRA to release your funds to purchase a ready-for-occupancy (RFO) condominium unit or to fund a long-term lease on land/housing. The investment value must be at least $50,000. Retire Well can assist you in navigating the property conversion request with the PRA.',
    },
  ],
  'exiting': [
    {
      value: 'exit-1',
      trigger: 'Can I temporarily withdraw my money if I have a financial emergency?',
      content: 'No. The visa deposit must remain untouched and locked in the accredited bank to maintain your permanent residency status. If you withdraw or drop the deposit below the mandatory threshold, your SRRV will be automatically canceled by the PRA, and you will be reverted to tourist status.',
    },
    {
      value: 'exit-2',
      trigger: 'How long does it take to cancel the SRRV and get my deposit money back?',
      content: 'If you choose to permanently exit the program, the visa downgrading and fund repatriation process typically takes 30 to 60 working days. The PRA must formally approve the cancellation before the bank is authorized to release and wire your funds back to your international account. Retire Well offers dedicated exit-processing services to manage this securely on your behalf.',
    },
    {
      value: 'exit-3',
      trigger: 'How often do I have to renew my SRRV card, and can I do it from abroad?',
      content: 'Your physical PRA ID card must be renewed either annually or every three years. While the renewal fee is standard ($360 for a family of three), the renewal must be processed inside the Philippines. If you are traveling abroad when your card expires, Retire Well can assist you in filing for a specialized renewal clearance so you can re-enter the country smoothly without paying tourist penalties.',
    },
    {
      value: 'exit-4',
      trigger: 'Is my passport held during the application process?',
      content: 'Yes. The PRA will hold your physical passport while processing and stamping the permanent residency visa. Because this takes 30 to 45 working days, you should not plan any international travel during this window. Retire Well monitors your tourist visa status during this time and files extensions if necessary.',
    },
    {
      value: 'exit-5',
      trigger: 'Can I work or start a business in the Philippines with an SRRV?',
      content: 'The SRRV allows you to live and invest in the country indefinitely. However, if you plan to be actively employed by a Philippine company, you must apply for an Alien Employment Permit (AEP) from the Department of Labor and Employment (DOLE).',
    },
  ],
  'retire-well': [
    {
      value: 'rw-1',
      trigger: 'Is the US$50 consultation fee waivable?',
      content: 'Yes. Your US$50 consultation fee is fully credited toward our Full VIP SRRV Concierge Service. If you proceed with our concierge package, you will only pay the remaining balance.',
    },
    {
      value: 'rw-2',
      trigger: 'What does the US$50 consultation include?',
      content: 'Your consultation includes a one-on-one assessment with an SRRV consultant, eligibility evaluation, visa pathway recommendation, document checklist, estimated government costs, timeline discussion, and an opportunity to ask questions before deciding to proceed.',
    },
    {
      value: 'rw-3',
      trigger: 'Is the consultation fee refundable?',
      content: 'The consultation fee is non-refundable, as it covers professional consultation services. However, it is fully credited toward your Full VIP SRRV Concierge Service if you continue with us.',
    },
    {
      value: 'rw-4',
      trigger: 'What is included in the Full VIP SRRV Concierge Service?',
      content: 'Our concierge service includes end-to-end guidance throughout your SRRV journey, including eligibility assessment, personalized document preparation, application coordination, appointment scheduling, government liaison assistance, status updates, and dedicated support until your SRRV is successfully processed.',
    },
    {
      value: 'rw-5',
      trigger: 'Do you guarantee SRRV approval?',
      content: 'We provide expert guidance and thorough document review to maximize your chances of approval. While no consultancy can legally guarantee visa approval, we maintain a 99% approval success rate for qualified applicants who submit complete and accurate documentation.',
    },
    {
      value: 'rw-6',
      trigger: 'Can you assist applicants who are still outside the Philippines?',
      content: 'Yes. We assist clients worldwide through online consultations and pre-arrival planning, ensuring you understand the requirements before traveling to the Philippines for your SRRV application.',
    },
    {
      value: 'rw-7',
      trigger: 'Who can apply for an SRRV?',
      content: 'Eligibility depends on your age, nationality, pension status (where applicable), and your chosen SRRV program. During your consultation, we\u2019ll determine the most suitable option based on your individual circumstances.',
    },
    {
      value: 'rw-8',
      trigger: 'Do you help with document preparation?',
      content: 'Yes. We provide a personalized checklist, review your documents, identify missing requirements, and guide you through every step to help avoid delays.',
    },
    {
      value: 'rw-9',
      trigger: 'Are government fees included in your service fee?',
      content: 'No. Our consulting and concierge fees are separate from Philippine government fees, visa deposits, medical examinations, bank charges, and other third-party expenses. We provide a transparent cost breakdown before you proceed.',
    },
    {
      value: 'rw-10',
      trigger: 'How long does the SRRV process usually take?',
      content: 'Processing times vary depending on your eligibility, document readiness, and government processing schedules. During your consultation, we\u2019ll provide a realistic timeline based on your situation.',
    },
    {
      value: 'rw-11',
      trigger: 'Can my spouse and children be included in my application?',
      content: 'Yes. Eligible spouses and unmarried children who meet the SRRV requirements may be included as dependents. We will explain the applicable requirements during your consultation.',
    },
    {
      value: 'rw-12',
      trigger: 'Why choose Retire Well SRRV Consulting?',
      content: 'We offer personalized, transparent, and professional guidance with a 99% approval success rate for qualified applicants. Our dedicated team provides responsive support, clear communication, and end-to-end assistance to make your retirement journey to the Philippines as smooth and stress-free as possible.',
    },
  ],
};

const documentsData = [
  {
    icon: FileText,
    title: 'What documents are required for the Principal Applicant?',
    content: [
      'To apply for the Special Resident Retiree\u2019s Visa (SRRV), the principal applicant must prepare the following:',
    ],
    sections: [
      {
        heading: 'Completed SRRV Application Form',
        details: 'The application form must be fully completed using typed information. All required fields should be accurately filled out.',
      },
      {
        heading: 'Valid Passport',
        details: 'Applicants (both principal and dependents) must be physically present in the Philippines during the SRRV application process. Your passport must contain a valid Temporary Visitor Visa (9A Tourist Visa) with at least 20 working days of remaining validity. If your visa has fewer than 20 working days remaining, it must first be extended through the Bureau of Immigration before your application can proceed. Applicants holding visa types other than a Temporary Visitor Visa (except Balikbayan Visa holders) must convert or downgrade their visa before applying.',
      },
      {
        heading: 'Passport Photos',
        details: 'Provide twelve (12) recent 2\u00d72 passport-sized photos with a white background. Eyeglasses should not be worn in the photos.',
      },
      {
        heading: 'Police Clearance',
        details: 'Submit a Police Clearance issued by your country of citizenship or country of legal residence. Must be translated into English if issued in another language. Must be Apostilled or legalized in the country where it was issued. The document must have been issued within the last six (6) months.',
      },
      {
        heading: 'Medical Certificate',
        details: 'A Medical Certificate may be obtained either: From your home country (must be translated into English if necessary and Apostilled); or From a licensed physician, clinic, or hospital in the Philippines (no Apostille required). The certificate must be issued within six (6) months before submission.',
      },
      {
        heading: 'Bank Certification for Time Deposit',
        details: 'A bank certification confirming your SRRV time deposit is required. The required deposit amount depends on the SRRV program selected. If more than two (2) dependents will be included, an additional US$15,000 time deposit is required for each extra dependent, except for eligible Former Filipinos applying under the SRRV Courtesy Program.',
      },
      {
        heading: 'NBI Clearance (When Applicable)',
        details: 'Applicants who have stayed in the Philippines for more than 30 days from their most recent arrival before applying must obtain an NBI Clearance. Valid for one (1) year from the date of issuance. This does not replace the required Police Clearance from abroad.',
      },
      {
        heading: 'Bureau of Immigration Clearance Certificate',
        details: 'Applicants must also secure a Bureau of Immigration Clearance Certificate, which is now part of the SRRV documentary requirements.',
      },
    ],
    note: 'Important: Applicants from China may be required to submit additional supporting documents. Please contact our team for country-specific requirements.',
  },
  {
    icon: Users,
    title: 'What documents are required for a Dependent Spouse?',
    content: [
      'A dependent spouse must generally submit the same documents required of the principal applicant, except for the Bank Certification.',
    ],
    sections: [
      {
        heading: 'Additional Requirement',
        details: 'Marriage Certificate or Marriage Contract proving the marital relationship. If issued overseas, it must be translated into English (if necessary) and Apostilled.',
      },
    ],
  },
  {
    icon: UserCheck,
    title: 'What documents are required for Dependent Children?',
    content: [
      'Dependent children must submit the same documentary requirements as the principal applicant, except:',
      '\u2022 Bank Certification',
      '\u2022 NBI Clearance (not required for children below 18 years old)',
    ],
    sections: [
      {
        heading: 'Additional Requirement',
        details: 'Birth Certificate or other official document establishing the relationship with the principal applicant. Documents issued abroad must be translated into English (if necessary) and Apostilled.',
      },
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Are there additional requirements for certain SRRV categories?',
    content: [
      'Yes. Some SRRV programs require extra documentation.',
    ],
    sections: [
      {
        heading: 'SRRV Classic (With Pension)',
        details: 'Applicants must submit proof of retirement income showing: At least US$800 per month for a single applicant. At least US$1,000 per month for married applicants. The certificate must be issued by the appropriate government agency, pension provider, or private institution.',
      },
      {
        heading: 'SRRV Courtesy (Former Filipino Citizens)',
        details: 'Applicants may submit one of the following: Philippine Birth Certificate, Previous Philippine Passport, or Naturalization documents issued by the current country of citizenship.',
      },
      {
        heading: 'SRRV Courtesy (Foreign Nationals)',
        details: 'Additional documents depend on eligibility: Former diplomats: Certification from the relevant international organization confirming employment and position held. Former military personnel: Proof of military service. Outstanding achievers in business, education, arts, culture, music, or sports: Certification of recognition or achievement from the appropriate organization. Applicants aged 40\u201349: Proof of a monthly pension or similar recurring income of at least US$1,000, which must be remitted to the Philippines.',
      },
    ],
    note: 'Please note: All documents issued outside the Philippines must be translated into English (if applicable) and Apostilled. Applicants must submit the original documents together with two (2) complete sets of photocopies.',
  },
  {
    icon: Clock,
    title: 'How long does the SRRV application process take?',
    content: [
      'Processing times vary depending on where the application is submitted.',
      '\u2022 Manila: Approximately 20 working days from complete document submission.',
      '\u2022 Cebu, Angeles, Davao, or Baguio: Approximately 30\u201345 working days, as documents are forwarded to Manila for processing.',
      'Working days exclude weekends and public holidays.',
    ],
  },
  {
    icon: DollarSign,
    title: 'What are the government fees?',
    content: [
      'Government fees generally include:',
    ],
    sections: [
      {
        heading: 'Application Fee',
        details: 'Principal Applicant: Starting from US$1,500. Each Dependent: US$300.',
      },
      {
        heading: 'Annual PRA Fee',
        details: 'SRRV Classic: US$360. SRRV Courtesy (Foreign Nationals): US$100. SRRV Courtesy (Former Filipinos): US$50. Additional annual fees may apply when more than two dependents are included.',
      },
    ],
    note: 'All fees above are government-prescribed charges.',
  },
];

export default function Faq() {
  const [activeCategory, setActiveCategory] = useState<string>('eligibility');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
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

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans text-slate-800">

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-10">Frequently Asked Questions</h1>
        <Field className="max-w-2xl mx-auto relative">
          <div className="group relative shadow-sm rounded-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers (e.g., eligibility, visa fees, timeline)..."
              className="w-full pl-12 pr-4 py-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#9E1B32] focus:border-transparent bg-white"
            />
          </div>
        </Field>
      </section>

      {/* FAQ Content Section */}
      <section className="bg-[#F4F4F4] px-6 py-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">

          {/* Categories Sidebar */}
          <div className="md:col-span-4 lg:col-span-3">
            <ul className="space-y-2">
              {FAQ_CATEGORIES.map((category) => {
                const isActive = activeCategory === category.id && searchQuery.trim() === '';
                return (
                  <li key={category.id}>
                    <button
                      onClick={() => handleCategoryClick(category.id)}
                      className={`w-full text-left px-6 py-4 rounded-md flex items-center justify-between transition-colors text-sm ${
                        isActive
                          ? 'bg-[#9E1B32] text-white font-medium shadow-md'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {category.label}
                      {isActive && <ChevronRight className="w-4 h-4 text-white shrink-0" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Accordion Content */}
          <div className="md:col-span-8 lg:col-span-9">
            <h2 className="text-2xl font-serif text-gray-900 mb-6">{currentCategoryLabel}</h2>
            <div className="space-y-4">
              {filteredQuestions.length > 0 ? (
                <AccordionCard items={filteredQuestions} />
              ) : (
                <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
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

      {/* Document Requirements Section */}
      <section className="bg-white px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif text-center text-gray-900 mb-4">SRRV Document Requirements</h2>
          <p className="text-gray-500 text-center max-w-2xl mx-auto mb-16 text-sm">
            Everything you need to prepare for a smooth and successful SRRV application
          </p>

          <div className="space-y-10">
            {documentsData.map((doc, idx) => (
              <div key={idx} className="bg-[#FAF9F6] rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 md:p-10">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-[#9E1B32]/10 flex items-center justify-center shrink-0 mt-1">
                      <doc.icon className="w-5 h-5 text-[#9E1B32]" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-serif text-gray-900">{doc.title}</h3>
                  </div>

                  <div className="space-y-4 text-gray-600 text-sm leading-relaxed ml-14">
                    {doc.content.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}

                    {doc.sections?.map((section, si) => (
                      <div key={si} className="mt-4">
                        <h4 className="font-semibold text-gray-800 text-sm mb-1">{section.heading}</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{section.details}</p>
                      </div>
                    ))}

                    {doc.note && (
                      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-amber-800 text-sm font-medium">{doc.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="bg-[#F4F4F4] px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-serif text-center text-gray-900 mb-12">Key Benefits of the SRRV</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col">
              <div className="text-3xl mb-4">🌴</div>
              <h3 className="text-[#9E1B32] font-serif text-xl mb-3">Permanent Residency</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Enjoy long-term residency in the Philippines with multiple-entry privileges and no need for frequent visa renewals.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-[#9E1B32] font-serif text-xl mb-3">Tax &amp; Immigration Exemptions</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Benefit from exemptions on annual exit and re-entry permits, ACR I-Card renewal requirements, and certain travel-related immigration clearances.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col">
              <div className="text-3xl mb-4">👨‍👩‍👧‍👦</div>
              <h3 className="text-[#9E1B32] font-serif text-xl mb-3">Family Inclusion</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Qualified spouses and unmarried dependent children may be included under your SRRV, making it easier to retire together in the Philippines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-white px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#9E1B32] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
            <div className="text-white max-w-xl text-center md:text-left">
              <h3 className="text-3xl font-serif mb-3">Still have questions?</h3>
              <p className="text-white/90 text-[15px] leading-relaxed max-w-md">
                Our expert consultants are available for a one-on-one session to clarify your specific needs and eligibility.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <button
                onClick={() => setIsConsultModalOpen(true)}
                className="px-6 py-3 bg-white text-[#9E1B32] text-sm font-semibold rounded-md shadow-sm hover:bg-gray-50 transition whitespace-nowrap"
              >
                Chat with an Expert
              </button>
              <button
                onClick={() => setIsConsultModalOpen(true)}
                className="px-6 py-3 border border-white text-white text-sm font-semibold rounded-md hover:bg-white/10 transition whitespace-nowrap"
              >
                Contact Us
              </button>
            </div>
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