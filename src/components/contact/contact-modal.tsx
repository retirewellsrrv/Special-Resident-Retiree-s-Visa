import { CheckCircle2, Send } from "lucide-react";
import { useState } from "react";

export default function ContactModal() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        service: 'SRRV Application',
        message: ''
      });
    
      const [isSubmitted, setIsSubmitted] = useState(false);
    
      const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        // In a real app, you would handle the API request here
        console.log('Form Submitted:', formData);
        setIsSubmitted(true);
        
        // Reset form or handle redirect
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({ fullName: '', email: '', phone: '', service: 'SRRV Application', message: '' });
        }, 5000);
      };
      
    return  <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl p-8 md:p-10 shadow-md border border-gray-100 w-full relative overflow-hidden">
            
            {/* Success Overlay */}
            {isSubmitted && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-2xl font-serif text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-600">
                  Thank you for reaching out. One of our visa experts will get back to you shortly.
                </p>
              </div>
            )}

            <h3 className="text-2xl font-serif text-[#0F172A] mb-6">Send us a Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Juan Dela Cruz"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A1527] transition-shadow bg-gray-50/50 focus:bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="juan@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A1527] transition-shadow bg-gray-50/50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+63 917 123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A1527] transition-shadow bg-gray-50/50 focus:bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Interested Service</label>
                  <div className="relative">
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A1527] transition-shadow bg-gray-50/50 focus:bg-white appearance-none cursor-pointer"
                    >
                      <option value="SRRV Application">SRRV Application</option>
                      <option value="Visa Consultation">Visa Consultation</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Partnership">Partnership</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Message</label>
                <textarea
                  required
                  rows={5}
                  placeholder="How can we help you today?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A1527] transition-shadow bg-gray-50/50 focus:bg-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#7A1527] text-white font-bold text-sm py-3.5 px-8 rounded-xl shadow-md hover:bg-[#63101E] transition-colors mt-2"
              >
                <span>Send Message</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
}