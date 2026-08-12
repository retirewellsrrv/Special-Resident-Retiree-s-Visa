'use client';

import { useState } from 'react';
import { Phone, Mail, X, Send, CalendarDays } from 'lucide-react';
import { Modal } from '@/components/ui/modal';

const CONSULTATION_TYPES = [
  { value: 'face-to-face', label: 'Face to Face Meeting (30 mins)' },
  { value: 'phone-call', label: 'Phone Call (15 minutes)' },
  { value: 'whatsapp-call', label: 'WhatsApp Call (15 mins)' },
  { value: 'zoom-meeting', label: 'Zoom Meeting (15 mins)' },
];

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [formData, setFormData] = useState({
    consultationDate: '',
    consultationType: '',
    purpose: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Consultation Request:', formData);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ consultationDate: '', consultationType: '', purpose: '' });
      onClose();
    }, 3000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-5xl">
      <div className="relative bg-[#EEF2F6] rounded-3xl max-h-[90vh] overflow-y-auto p-6 md:p-10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full text-slate-500 hover:bg-slate-200 transition"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Success Overlay */}
        {isSubmitted && (
          <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
            <CalendarDays className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-2xl font-serif text-gray-900 mb-2">Consultation Request Sent!</h3>
            <p className="text-gray-600">
              We&apos;ll confirm your schedule shortly. One of our visa experts will be in touch.
            </p>
          </div>
        )}

        {/* Left Column: Info */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#0F172A]">
            Schedule a Consultation
          </h2>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            Pick a date and time that works for you, and let us know how you&apos;d like to connect.
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E2E8F0] rounded-xl flex items-center justify-center text-[#9E1B32]">
                <Phone className="w-4 h-4" />
              </div>
              <span className="font-bold text-[#0F172A] text-sm">+63 2 888 1234</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E2E8F0] rounded-xl flex items-center justify-center text-[#9E1B32]">
                <Mail className="w-4 h-4" />
              </div>
              <span className="font-bold text-[#0F172A] text-sm">consult@retirewell.ph</span>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-7 w-full">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-serif text-[#0F172A] mb-6">Book Your Consultation</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Preferred Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.consultationDate}
                  onChange={(e) => setFormData({ ...formData, consultationDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A1527] bg-gray-50/50 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Consultation Type
                </label>
                <div className="relative">
                  <select
                    required
                    value={formData.consultationType}
                    onChange={(e) => setFormData({ ...formData, consultationType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A1527] bg-gray-50/50 focus:bg-white appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select a consultation type</option>
                    {CONSULTATION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Purpose / Message
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us about your situation or what you'd like to discuss..."
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A1527] bg-gray-50/50 focus:bg-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#7A1527] text-white font-bold text-sm py-3 px-6 rounded-xl shadow-md hover:bg-[#63101E] transition-colors"
              >
                <span>Send Request</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </Modal>
  );
}
