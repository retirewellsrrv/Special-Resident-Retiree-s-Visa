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
  { name: 'General Information', questionIds: ['what-is-srrv', 'options', 'age-reqs'] },
  { name: 'Eligibility & Requirements', questionIds: ['age-reqs', 'deposit', 'documents', 'family'] },
  { name: 'Life After Approval', questionIds: ['work-study', 'processing', 'options'] },
];

const questions: QAPair[] = [
  {
    id: 'what-is-srrv',
    question: 'What is SRRV?',
    answer:
      "The Special Resident Retiree's Visa (SRRV) is a non-immigrant visa for foreign nationals who want to retire in the Philippines. Issued by the Philippines Retirement Authority (PRA), it offers multiple-entry privileges with the right to stay permanently in the country.",
    relatedIds: ['age-reqs', 'options'],
    cta: { label: 'View Services', href: '/services' },
  },
  {
    id: 'age-reqs',
    question: 'What are the age requirements?',
    answer:
      'The SRRV has two age categories: (1) Main applicants aged 50 and above require a US$10,000 deposit. (2) Applicants aged 35 to 49 require a US$50,000 deposit. There is no upper age limit.',
    relatedIds: ['deposit', 'documents'],
    cta: { label: 'See Pricing', href: '/pricing' },
  },
  {
    id: 'deposit',
    question: 'What is the minimum deposit?',
    answer:
      "For the Classic SRRV (age 50+), the deposit is US$10,000. For those aged 35-49, it's US$50,000. The Smile SRRV (age 50+) with a 1-year validity requires a lower deposit structure. Dependents require an additional US$3,000 each if the main applicant made the minimum deposit.",
    relatedIds: ['age-reqs', 'options'],
    cta: { label: 'Calculate Costs', href: '/pricing' },
  },
  {
    id: 'work-study',
    question: 'Can I work or study with an SRRV?',
    answer:
      'Yes, SRRV holders can study or work in the Philippines. However, to work legally, you need to secure an Alien Employment Permit (AEP) from the Department of Labor and Employment (DOLE).',
    relatedIds: ['what-is-srrv', 'family'],
  },
  {
    id: 'documents',
    question: 'What documents are required?',
    answer:
      'Required documents include: (1) Valid passport with at least 6 months validity, (2) Birth certificate, (3) Marriage certificate (if applicable), (4) NBI or police clearance, (5) Medical certificate, (6) Bank certificate showing the deposit, and (7) 12 passport-sized photos.',
    relatedIds: ['processing', 'age-reqs'],
    cta: { label: 'Get Document Help', href: '/contact' },
  },
  {
    id: 'processing',
    question: 'How long does processing take?',
    answer:
      'SRRV processing typically takes 3 to 6 weeks after submission of complete and correct documents. The timeline may vary depending on the completeness of your application and the volume being processed by PRA.',
    relatedIds: ['documents', 'options'],
  },
  {
    id: 'family',
    question: 'Can I bring my family?',
    answer:
      'Yes! Your spouse and unmarried children under 21 years old can be included as dependents. An additional deposit of US$3,000 per dependent is required if the main applicant made the minimum deposit of US$10,000.',
    relatedIds: ['age-reqs', 'deposit'],
  },
  {
    id: 'options',
    question: 'What SRRV options are available?',
    answer:
      'PRA offers two main programs: (1) SRRV Classic — indefinite stay with a US$10,000 deposit (age 50+) or US$50,000 (age 35-49). (2) SRRV Smile — a 1-year renewable visa with reduced requirements for applicants aged 50+.',
    relatedIds: ['deposit', 'what-is-srrv'],
    cta: { label: 'Compare Plans', href: '/services' },
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
      <style>{`
        @keyframes budji-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(166,25,46,0.4); }
          50% { box-shadow: 0 0 0 14px rgba(166,25,46,0); }
        }
      `}</style>

      <button
        onClick={handleToggle}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300',
          isOpen
            ? 'bg-[#81001C] rotate-45 scale-110'
            : 'bg-[#A6192E] hover:bg-[#81001C] hover:scale-105',
          !isOpen &&
            showNotification &&
            'animate-[budji-pulse_2.5s_ease-in-out_infinite]',
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
