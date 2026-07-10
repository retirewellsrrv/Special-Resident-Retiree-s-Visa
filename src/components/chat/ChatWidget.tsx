'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, ChevronLeft, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface QAPair {
  id: string;
  question: string;
  answer: string;
  relatedIds: string[];
  cta?: { label: string; href: string };
}

interface Category {
  name: string;
  questionIds: string[];
}

const categories: Category[] = [
  { name: 'General Information', questionIds: ['what-is-srrv', 'who-qualifies', 'benefits', 'company-info', 'trust-signals'] },
  { name: 'Financials & Deposits', questionIds: ['options-deposit', 'bank-deposit', 'deposit-refund', 'family', 'pra-fees'] },
  { name: 'Services & Support', questionIds: ['services-offered', 'registration-process', 'contact-info', 'concierge'] },
  { name: 'Logistics & Paperwork', questionIds: ['documents', 'document-expiry', 'nbi-clearance', 'apostille', 'travel-during', 'own-land'] },
  { name: 'Application Process', questionIds: ['processing', 'full-process', 'application-stages', 'application-form', 'oath-affirmation'] },
];

const questions: QAPair[] = [
  {
    id: 'what-is-srrv',
    question: 'What is the SRRV?',
    answer:
      "The Special Resident Retiree's Visa (SRRV) is a special non-immigrant visa issued by the Philippine Bureau of Immigration through the Philippine Retirement Authority (PRA). It entitles the holder to multiple-entry privileges with the right to stay permanently or indefinitely in the Philippines.",
    relatedIds: ['who-qualifies', 'benefits'],
    cta: { label: 'View Services', href: '/services' },
  },
  {
    id: 'who-qualifies',
    question: 'Who qualifies for the SRRV?',
    answer:
      'Foreign nationals and former Filipino citizens who are at least 50 years of age, meet the character requirements, and can fulfill the required financial time deposit in a PRA-accredited bank qualify for the program. For the SRRV Classic reduced deposit option, you need a monthly pension of at least $800 (individual) or $1,000 (couple).',
    relatedIds: ['what-is-srrv', 'options-deposit'],
    cta: { label: 'Check Eligibility', href: '/services' },
  },
  {
    id: 'benefits',
    question: 'What benefits do I get with an SRRV?',
    answer:
      'Beyond permanent residency, SRRV holders enjoy:\n\n\u2022 Exemption from Travel Tax (if not out of PH for over 1 year)\n\u2022 Streamlined BI compliance \u2014 no regular exit/re-entry clearances\n\u2022 One-time tax-free importation of household goods worth up to $7,000\n\u2022 Children can study without a Special Study Permit\n\u2022 You can work or start a business with an Alien Employment Permit (AEP)',
    relatedIds: ['what-is-srrv', 'own-land'],
  },
  {
    id: 'company-info',
    question: 'Is Retire Well SRRV a government agency?',
    answer:
      'No. Retire Well SRRV is an independent marketing and consulting firm specializing in the SRRV program. We provide private concierge services \u2014 preparing your application and escorting you through official government channels to ensure a smooth, error-free process.\n\nOur mission is to simplify your path to SRRV retirement in the Philippines. We are guided by four core values: Integrity (no hidden costs), Excellence (up-to-date on PRA regulations), Client-Centric approach, and Efficiency in every step.',
    relatedIds: ['what-is-srrv', 'services-offered'],
    cta: { label: 'About Us', href: '/about' },
  },
  {
    id: 'trust-signals',
    question: 'What is Retire Well\u2019s track record?',
    answer:
      'Retire Well SRRV has:\n\n\u2022 99% visa approval rate\n\u2022 10+ years of expertise in SRRV processing\n\u2022 500+ retirees successfully assisted\n\u2022 24/7 support access for clients\n\u2022 Dedicated concierge service from start to finish',
    relatedIds: ['company-info', 'services-offered'],
  },
  {
    id: 'options-deposit',
    question: 'What are the SRRV options and deposit amounts?',
    answer:
      'For retirees aged 50+, PRA offers:\n\n\u2022 SRRV Smile: $20,000 deposit \u2014 kept untouched in a PRA-accredited bank.\n\u2022 SRRV Classic: $10,000 deposit (with pension of $800+/mo individual or $1,000+/mo couple) or $20,000 (without pension). This deposit can be converted into approved investments like a condominium or long-term lease.\n\nAdditional service plans include SRRV Human Touch and SRRV Courtesy, with varying deposit structures.',
    relatedIds: ['bank-deposit', 'deposit-refund'],
    cta: { label: 'Compare Plans', href: '/pricing' },
  },
  {
    id: 'bank-deposit',
    question: 'How does the bank deposit work?',
    answer:
      'The money remains entirely yours. The deposit must be sent via bank-to-bank inward remittance directly into a PRA-accredited bank account under your name. The funds are held as a time deposit. With SRRV Classic, you can later convert the deposit into approved investments like purchasing a condominium or funding a long-term housing lease.',
    relatedIds: ['options-deposit', 'deposit-refund'],
  },
  {
    id: 'deposit-refund',
    question: 'Can I get my deposit back if I leave the program?',
    answer:
      'Yes. The SRRV program guarantees full repatriation of your dollar time deposit if you cancel your visa and withdraw, provided all local administrative obligations and clearances are cleared.',
    relatedIds: ['bank-deposit', 'options-deposit'],
  },
  {
    id: 'family',
    question: 'Can I bring my family?',
    answer:
      'Yes. The base visa deposit covers the principal retiree and up to two dependents (spouse or unmarried children under 21). An additional deposit of $15,000 is required for each extra dependent beyond the first two (except for former Filipinos).',
    relatedIds: ['options-deposit', 'documents'],
  },
  {
    id: 'pra-fees',
    question: 'What are the PRA government fees?',
    answer:
      'The PRA government fees are:\n\n\u2022 Principal applicant: $1,400\n\u2022 Each dependent: $300\n\nThese fees are paid directly at the PRA office when you submit your application in person.',
    relatedIds: ['options-deposit', 'processing'],
    cta: { label: 'Start Application', href: '/register' },
  },
  {
    id: 'services-offered',
    question: 'What services does Retire Well offer?',
    answer:
      'Retire Well SRRV provides three core services:\n\n\u2022 SRRV Application Support \u2014 expert guidance through the entire visa process, ensuring all documentation meets PRA standards.\n\u2022 Marketing Consulting \u2014 strategic growth solutions for retirement-focused businesses.\n\u2022 Relocation Concierge \u2014 personalized assistance finding your home, navigating local real estate, and setting up utilities.\n\nService plans include SRRV Smile, Classic, Human Touch, and Courtesy \u2014 each designed for different retiree needs.',
    relatedIds: ['company-info', 'contact-info'],
    cta: { label: 'View Services', href: '/services' },
  },
  {
    id: 'registration-process',
    question: 'How do I register for the SRRV portal?',
    answer:
      'Registering is a 4-step process:\n\n1. Register & verify your email\n2. Submit your application details\n3. Upload the required documents\n4. Track your application status\n\nOnce registered, you can monitor your progress through your personal dashboard.',
    relatedIds: ['application-form', 'application-stages'],
    cta: { label: 'Register Now', href: '/register' },
  },
  {
    id: 'contact-info',
    question: 'How can I contact Retire Well?',
    answer:
      'You can reach us through:\n\n\u2022 Phone: +63 2 888 1234\n\u2022 Email: consult@retirewell.ph\n\u2022 Office: 123 Ayala Avenue, Makati City, Metro Manila, Philippines 1226\n\u2022 Hours: Monday \u2013 Friday, 9:00 AM \u2013 6:00 PM (PST)\n\nAlternatively, fill out the contact form on our website and we will get back to you promptly.',
    relatedIds: ['services-offered', 'concierge'],
    cta: { label: 'Contact Us', href: '/contact' },
  },
  {
    id: 'concierge',
    question: 'Who will assist me with my application?',
    answer:
      'Each applicant is assigned a dedicated Senior Concierge Officer who guides you from start to finish. For example:\n\n\u2022 Maria Santos, Senior Concierge Officer\n\u2022 Email: maria.santos@pra.gov.ph\n\u2022 Phone: +63 (2) 8888-1234\n\u2022 Location: PRA Main Office, Makati City\n\nYour concierge coordinates appointments, escorts you to PRA and local clinics, and ensures your application moves smoothly through every stage.',
    relatedIds: ['contact-info', 'services-offered'],
    cta: { label: 'Get Started', href: '/register' },
  },
  {
    id: 'documents',
    question: 'What documents are required?',
    answer:
      'Required documents include:\n\n1. Valid passport (at least 6 months validity)\n2. PRA Application Forms (completed and signed)\n3. Birth certificate (Apostilled)\n4. Marriage certificate if applicable (Apostilled)\n5. NBI or police clearance from country of origin (Apostilled)\n6. Medical certificate (DOH Medical Form)\n7. Bank certificate showing the time deposit\n8. 12 passport-sized photos (2" x 2")\n\nThe 5 document types in our system are: Passport, Visa, NBI, Pension, and Medical.',
    relatedIds: ['document-expiry', 'apostille'],
    cta: { label: 'Get Document Help', href: '/contact' },
  },
  {
    id: 'document-expiry',
    question: 'How long are my documents valid?',
    answer:
      'Police clearances (e.g., FBI background check for US citizens) and medical certificates must be issued within 6 months of your formal application submission to the PRA. If your documents are older than 6 months, you will need to obtain updated versions before applying.',
    relatedIds: ['documents', 'nbi-clearance'],
  },
  {
    id: 'nbi-clearance',
    question: 'When do I need an NBI clearance?',
    answer:
      'An NBI clearance is required if you have stayed in the Philippines for more than 30 days prior to submitting your application. Otherwise, a police clearance from your home country (Apostilled) is sufficient.',
    relatedIds: ['documents', 'document-expiry'],
  },
  {
    id: 'apostille',
    question: 'What does Apostille mean for my documents?',
    answer:
      'All official documents issued abroad must be legally authenticated for the Philippine government to accept them. If your country is a member of the Apostille Convention, get them "Apostilled" by your government. If not, they must be authenticated by the Philippine Embassy or Consulate in your country of origin.',
    relatedIds: ['documents', 'processing'],
  },
  {
    id: 'travel-during',
    question: 'Can I travel while my application is being processed?',
    answer:
      'No. During the final processing stage, your original physical passport is surrendered to the PRA and the Bureau of Immigration for visa stamping. Because you will not have your passport, you cannot clear international borders until the visa is finalized and returned to you.',
    relatedIds: ['processing', 'full-process'],
  },
  {
    id: 'own-land',
    question: 'Can I own land as an SRRV holder?',
    answer:
      'Under Philippine law, foreign nationals cannot own land outright. However, as an SRRV holder, you can legally purchase and fully own a condominium unit in your name, or enter into a secure, long-term lease agreement for land or a house.',
    relatedIds: ['benefits', 'what-is-srrv'],
  },
  {
    id: 'processing',
    question: 'How long does processing take?',
    answer:
      'Final PRA processing takes about 7 to 10 working days once all original documents are submitted and the inward bank remittance is confirmed. Documents like police clearances and medical certificates must be issued within 6 months of your application submission.',
    relatedIds: ['documents', 'full-process'],
    cta: { label: 'Start Your Application', href: '/register' },
  },
  {
    id: 'full-process',
    question: 'What is the step-by-step application process?',
    answer:
      'The SRRV application has two phases:\n\nPhase 1 \u2014 Pre-Arrival (Home Country):\n1. Choose your SRRV track (Smile or Classic)\n2. Gather & legalize documents (1\u20132 months)\n3. Wire your visa deposit to a PRA-accredited bank\n\nPhase 2 \u2014 On-the-Ground (Philippines):\n4. Arrive on tourist visa & pre-evaluation at PRA\n5. Complete medical clearances at DOH-accredited clinics\n6. Submit application, pay government fees ($1,400/$300), and capture biometrics at PRA\n7. Immigration endorsement & stamping (7\u201310 working days)\n8. Attend Oath of Affirmation ceremony \u2014 receive your stamped passport, PRA ID, and SRRV Certification',
    relatedIds: ['processing', 'application-stages'],
    cta: { label: 'Start Your Journey', href: '/register' },
  },
  {
    id: 'application-stages',
    question: 'What happens after I submit my application?',
    answer:
      'After submission, your application progresses through 4 stages in your dashboard:\n\n1. Initiation \u2014 documents received and under initial review\n2. Deposit \u2014 payment confirmed and verified\n3. Verification \u2014 PRA processing your application\n4. Issuance \u2014 visa approved and ready for release\n\nYou can track your current stage through your personal applicant portal at any time.',
    relatedIds: ['full-process', 'application-form'],
  },
  {
    id: 'application-form',
    question: 'What does the application form include?',
    answer:
      'The online application form has 6 steps:\n\n1. Personal Details \u2014 name, DOB, sex, nationality, marital status\n2. Contact Information \u2014 email, phone, address, PH address, emergency contact\n3. Service Selection \u2014 choose your SRRV plan\n4. Document Checklist \u2014 upload passport, visa, NBI, pension, medical\n5. Review Application \u2014 confirm all details\n6. Under Review \u2014 application submitted\n\nYour application reference code will be in the format: SRRV-[timestamp]-[random].',
    relatedIds: ['registration-process', 'application-stages'],
    cta: { label: 'Apply Now', href: '/register' },
  },
  {
    id: 'oath-affirmation',
    question: 'What is the Oath of Affirmation?',
    answer:
      'The Oath of Affirmation is the final step of the SRRV process. You attend a brief official ceremony at the PRA where you take your oath as a permanent resident. You are then handed:\n\n\u2022 Your stamped passport\n\u2022 Your official PRA Membership ID card\n\u2022 Your SRRV Certification\n\nYou are now officially a permanent resident of the Philippines!',
    relatedIds: ['full-process', 'application-stages'],
  },
];

const questionMap = new Map(questions.map((q) => [q.id, q]));

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(
    () => new Set(categories.map((c) => c.name)),
  );
  const [typing, setTyping] = useState(false);
  const [answerCount, setAnswerCount] = useState(0);
  const [showNotification, setShowNotification] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const currentView = history.length === 0 ? 'questions' : history.at(-1)!;
  const currentQ = currentView !== 'questions' ? questionMap.get(currentView) : null;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 480);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        reset();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !panelRef.current) return;
    const panel = panelRef.current;
    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    panel.addEventListener('keydown', handler);
    return () => panel.removeEventListener('keydown', handler);
  }, [isOpen, currentView, typing]);

  const reset = () => {
    setHistory([]);
    setTyping(false);
    setAnswerCount(0);
  };

  const handleToggle = () => {
    setShowNotification(false);
    if (isOpen) reset();
    setIsOpen((prev) => !prev);
  };

  const handleQuestionClick = (id: string) => {
    setTyping(true);
    setHistory((prev) => [...prev, id]);
    setTimeout(() => {
      setTyping(false);
      setAnswerCount((prev) => prev + 1);
    }, 600);
  };

  const handleBack = () => {
    if (typing) return;
    setHistory((prev) => prev.slice(0, -1));
  };

  const handleBackToQuestions = () => {
    if (typing) return;
    setHistory([]);
  };

  const toggleCategory = (name: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const getRelated = (ids: string[]) =>
    ids.map((id) => questionMap.get(id)).filter(Boolean) as QAPair[];

  return (
    <>
      <button
        onClick={handleToggle}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300',
          isOpen
            ? 'bg-[#81001C] rotate-45 scale-110'
            : 'bg-[#A6192E] hover:bg-[#81001C] hover:scale-105',
          !isOpen &&
            showNotification &&
            'animate-budji-pulse',
        )}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6 text-white" />
            {showNotification && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-bold text-[#81001C]">
                1
              </span>
            )}
          </>
        )}
      </button>

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Budji SRRV Assistant"
        className={cn(
          'fixed z-50 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl transition-all duration-300 origin-bottom-right',
          isMobile
            ? 'inset-0 rounded-none border-0'
            : 'bottom-24 right-6 w-[360px] max-w-[calc(100vw-40px)]',
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none',
        )}
        style={{ maxHeight: isMobile ? '100dvh' : '580px' }}
      >
        <div className="flex items-center gap-3 bg-[#A6192E] px-5 py-4 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
            B
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Budji</p>
            <p className="text-xs text-white/70">SRRV Assistant</p>
          </div>
          {isMobile && (
            <button
              onClick={handleToggle}
              className="flex items-center justify-center rounded-full p-1 hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div
          className="overflow-y-auto p-4"
          style={{
            maxHeight: isMobile ? 'calc(100dvh - 68px)' : '500px',
          }}
        >
          {currentView === 'questions' ? (
            <div className="space-y-4">
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#F6F5F2] px-4 py-3 text-sm text-gray-700 leading-relaxed">
                  Hi! I'm{' '}
                  <span className="font-semibold text-gray-900">Budji</span> — your
                  SRRV assistant. Pick a topic below to get started.
                </div>
              </div>

              {categories.map((cat) => {
                const isExpanded = expandedCats.has(cat.name);
                const catQuestions = cat.questionIds
                  .map((id) => questionMap.get(id))
                  .filter(Boolean) as QAPair[];
                return (
                  <div key={cat.name} className="overflow-hidden rounded-xl border border-gray-200">
                    <button
                      onClick={() => toggleCategory(cat.name)}
                      className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-100"
                    >
                      {cat.name}
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 text-gray-500 transition-transform duration-200',
                          isExpanded && 'rotate-180',
                        )}
                      />
                    </button>
                    {isExpanded && (
                      <div className="divide-y divide-gray-100">
                        {catQuestions.map((qa) => (
                          <button
                            key={qa.id}
                            onClick={() => handleQuestionClick(qa.id)}
                            className="w-full px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:bg-[#FFF5F5] hover:text-[#A6192E]"
                          >
                            {qa.question}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : typing ? (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-tl-sm bg-[#F6F5F2] px-4 py-3 text-sm text-gray-500">
                <span className="inline-flex gap-1">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce [animation-delay:0.12s]">.</span>
                  <span className="animate-bounce [animation-delay:0.24s]">.</span>
                </span>
              </div>
            </div>
          ) : currentQ ? (
            <div className="space-y-4">
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#A6192E] px-4 py-3 text-sm text-white">
                  {currentQ.question}
                </div>
              </div>

              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#F6F5F2] px-4 py-3 text-sm text-gray-700 leading-relaxed">
                  {currentQ.answer}
                </div>
              </div>

              {currentQ.cta && (
                <div className="flex justify-start pl-2">
                  <Link
                    href={currentQ.cta.href}
                    onClick={handleToggle}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#A6192E] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#81001C]"
                  >
                    {currentQ.cta.label}
                  </Link>
                </div>
              )}

              {answerCount >= 2 && (
                <div className="rounded-xl border border-[#A6192E]/20 bg-[#FFF5F5] p-4 text-center">
                  <p className="mb-2 text-sm font-medium text-[#A6192E]">
                    Still have questions?
                  </p>
                  <Link
                    href="/contact"
                    onClick={handleToggle}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#A6192E] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#81001C]"
                  >
                    Chat with an Expert
                  </Link>
                </div>
              )}

              {getRelated(currentQ.relatedIds).length > 0 && (
                <div className="space-y-2 pt-1">
                  <p className="pl-1 text-xs font-medium text-gray-500">
                    Related questions:
                  </p>
                  {getRelated(currentQ.relatedIds).map((qa) => (
                    <button
                      key={qa.id}
                      onClick={() => handleQuestionClick(qa.id)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-700 shadow-sm transition-all hover:border-[#A6192E] hover:bg-[#FFF5F5] hover:text-[#A6192E] active:scale-[0.98]"
                    >
                      {qa.question}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-[#A6192E] transition-all hover:bg-[#FFF5F5] active:scale-[0.98]"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  onClick={handleBackToQuestions}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition-all hover:bg-gray-100 active:scale-[0.98]"
                >
                  All questions
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
