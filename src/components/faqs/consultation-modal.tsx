// components/consultation-modal.tsx
import React, { useState } from 'react';
import { Phone, Mail, X } from 'lucide-react'; // Added X icon to close the modal

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConsultationModal({ isOpen, onClose }: ConsultationModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    service: 'SRRV Application',
    message: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
    onClose(); // Close modal after successful action
  };

  return (
    // Backdrop overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Container Box */}
      <div className="relative bg-[#EEF2F6] rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Close Button (Top Right) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-500 hover:bg-slate-200 transition"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Left Column: Info Text */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#0F172A]">
            Ready to start your journey?
          </h2>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            Schedule your free, no-obligation consultation with our visa experts today.
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

        {/* Right Column: Card Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 w-full">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A1527]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A1527]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Interested Service</label>
                <div className="relative">
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#7A1527] appearance-none cursor-pointer"
                  >
                    <option value="SRRV Application">SRRV Application</option>
                    <option value="Visa Consultation">Visa Consultation</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Message (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Tell us how we can help..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A1527] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#7A1527] text-white font-bold text-sm py-3 px-6 rounded-xl shadow-md hover:bg-[#63101E] transition"
              >
                Send Request
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}