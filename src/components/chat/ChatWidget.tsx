'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  ChevronLeft,
  ChevronDown,
  Search,
  Newspaper,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { categories, questionMap, type QAPair } from '@/data/chat-content';

const PULSE_DISMISS_KEY = 'budji-pulse-dismissed';

export default function ChatWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(
    () => new Set(categories.map((c) => c.name)),
  );
  const [typing, setTyping] = useState(false);
  const [answerCount, setAnswerCount] = useState(0);
  const [query, setQuery] = useState('');
  const [showNotification, setShowNotification] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !sessionStorage.getItem(PULSE_DISMISS_KEY);
  });
  const [isMobile, setIsMobile] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const currentView = history.length === 0 ? 'questions' : history.at(-1)!;
  const currentQ = currentView !== 'questions' ? questionMap.get(currentView) : null;

  const isSearching = currentView === 'questions' && query.trim().length > 0;
  const searchResults = useSearchResults(query);

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
  }, [isOpen, currentView, typing, query]);

  const reset = () => {
    setHistory([]);
    setTyping(false);
    setAnswerCount(0);
    setQuery('');
  };

  const handleToggle = () => {
    setShowNotification(false);
    if (!isOpen && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(PULSE_DISMISS_KEY, '1');
    }
    if (isOpen) reset();
    setIsOpen((prev) => !prev);
  };

  // Close the widget, then navigate. Since reset() clears the search query and
  // remounts the panel, navigating inside the same click would cancel the soft
  // navigation — so we push on the next tick instead.
  const navigateTo = (href: string) => {
    reset();
    setIsOpen(false);
    setTimeout(() => router.push(href), 0);
  };

  const handleQuestionClick = (id: string) => {
    setQuery('');
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
            'animate-pulse motion-reduce:animate-none',
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
          'fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl transition-all duration-300 origin-bottom-right',
          isMobile
            ? 'inset-0 rounded-none border-0'
            : 'bottom-24 right-6 w-[360px] max-w-[calc(100vw-40px)]',
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none',
        )}
        style={{ height: isMobile ? '100dvh' : '580px' }}
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
          className="flex-1 overflow-y-auto p-4"
          aria-live="polite"
        >
          {currentView === 'questions' ? (
            <div className="space-y-4">
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#F6F5F2] px-4 py-3 text-sm text-gray-700 leading-relaxed">
                  Hi! I'm{' '}
                  <span className="font-semibold text-gray-900">Budji</span> — your
                  SRRV assistant. Ask a question or pick a topic below.
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search questions…"
                  aria-label="Search questions"
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#A6192E] focus:outline-none focus:ring-2 focus:ring-[#A6192E]/20"
                />
              </div>

              {searchResults.active ? (
                searchResults.items.length > 0 ? (
                  <div className="space-y-2">
                    <p className="pl-1 text-xs font-medium text-gray-500">
                      {searchResults.items.length} result{searchResults.items.length === 1 ? '' : 's'}
                    </p>
                    {searchResults.items.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => handleQuestionClick(q.id)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-700 shadow-sm transition-all hover:border-[#A6192E] hover:bg-[#FFF5F5] hover:text-[#A6192E]"
                      >
                        {q.question}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
                    <Newspaper className="h-7 w-7 text-gray-300" />
                    <p className="text-sm text-gray-500">
                      Sorry, I couldn't find an answer for{' '}
                      <span className="font-medium text-gray-700">"{query.trim()}"</span>.
                    </p>
                    <button
                      onClick={() => navigateTo('/contact')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#A6192E] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#81001C]"
                    >
                      <Sparkles className="h-4 w-4" />
                      Talk to an expert
                    </button>
                  </div>
                )
              ) : (
                categories.map((cat) => {
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
                })
              )}
            </div>
          ) : typing ? (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-tl-sm bg-[#F6F5F2] px-4 py-3 text-sm text-gray-500">
                <span className="inline-flex gap-1">
                  <span className="animate-bounce motion-reduce:animate-none">.</span>
                  <span className="animate-bounce [animation-delay:0.12s] motion-reduce:animate-none">.</span>
                  <span className="animate-bounce [animation-delay:0.24s] motion-reduce:animate-none">.</span>
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
                <div className="max-w-[85%] whitespace-pre-line rounded-2xl rounded-tl-sm bg-[#F6F5F2] px-4 py-3 text-sm text-gray-700 leading-relaxed">
                  {currentQ.answer}
                </div>
              </div>

              {currentQ.cta && (
                <div className="flex justify-start pl-2">
                  <button
                    onClick={() => navigateTo(currentQ.cta!.href)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#A6192E] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#81001C]"
                  >
                    {currentQ.cta.label}
                  </button>
                </div>
              )}

              {answerCount >= 2 && (
                <div className="rounded-xl border border-[#A6192E]/20 bg-[#FFF5F5] p-4 text-center">
                  <p className="mb-2 text-sm font-medium text-[#A6192E]">
                    Still have questions?
                  </p>
                  <button
                    onClick={() => navigateTo('/contact')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#A6192E] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#81001C]"
                  >
                    Chat with an Expert
                  </button>
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

        <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-center">
          <p className="text-[10px] leading-snug text-gray-400">
            For general information only — not an official statement of the Philippine
            Retirement Authority.
          </p>
        </div>
      </div>
    </>
  );
}

// ── Search: finds matching questions across categories by question text, answer, or category name ──
function useSearchResults(rawQuery: string) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return { active: false, items: [] as QAPair[] };

  const matchedCategoryIds = new Set(
    categories
      .filter((c) => c.name.toLowerCase().includes(query))
      .flatMap((c) => c.questionIds),
  );

  const seen = new Set<string>();
  const items: QAPair[] = [];
  for (const cat of categories) {
    for (const id of cat.questionIds) {
      const q = questionMap.get(id);
      if (!q || seen.has(id)) continue;
      const hitsCategory = matchedCategoryIds.has(id);
      const hitsText =
        q.question.toLowerCase().includes(query) ||
        q.answer.toLowerCase().includes(query);
      if (hitsCategory || hitsText) {
        items.push(q);
        seen.add(id);
      }
    }
  }

  return { active: true, items };
}