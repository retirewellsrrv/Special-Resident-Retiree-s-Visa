'use client';

import { Footer } from '@/components/layout/Footer';
import Hero from '@/components/public/Hero';

const sections = [
  {
    title: 'What Are Cookies',
    items: [
      'Cookies are small text files stored on your device by your web browser when you visit a website',
      'They help websites remember your preferences, understand how you interact with the site, and improve your browsing experience',
      'Cookies may be set by the website you visit (&ldquo;first-party cookies&rdquo;) or by third-party services integrated into the site (&ldquo;third-party cookies&rdquo;)',
    ],
  },
  {
    title: 'How We Use Cookies',
    items: [
      'Essential cookies — required for the proper functioning of our website and applicant portal, including authentication and session management',
      'Analytics cookies — help us understand how visitors interact with our site, which pages are most visited, and how users navigate through our content',
      'Preference cookies — remember your choices such as language preferences and display settings for a personalized experience',
      'Security cookies — help detect and prevent fraudulent activity and unauthorized access to user accounts',
    ],
  },
  {
    title: 'Cookies We Set',
    items: [
      'Session cookies — temporary cookies that expire when you close your browser, used to maintain your login session',
      'Authentication cookies — remember your logged-in status so you don\'t need to re-enter credentials on every page',
      'CSRF tokens — security cookies that protect against cross-site request forgery attacks on our forms',
    ],
  },
  {
    title: 'Third-Party Cookies',
    items: [
      'Supabase — authentication provider that may set session cookies when you log in to our portal',
      'Vercel — our hosting platform may set analytics cookies to monitor site performance and availability',
      'We do not use advertising or marketing cookies from third-party ad networks',
      'Third-party cookies are governed by the respective provider\'s privacy policies',
    ],
  },
  {
    title: 'Managing Cookies',
    items: [
      'You can control and manage cookies through your browser settings at any time',
      'Most browsers allow you to block all cookies, accept all cookies, or delete cookies after each session',
      'Disabling essential cookies may prevent our website and portal from functioning correctly',
      'For instructions on managing cookies, refer to your browser\'s help documentation',
    ],
  },
  {
    title: 'Your Consent',
    items: [
      'By continuing to use our website, you consent to the use of cookies as described in this policy',
      'You can withdraw your consent at any time by adjusting your browser settings to delete or block cookies',
      'We do not use cookies to collect personally identifiable information without your explicit consent',
    ],
  },
  {
    title: 'Updates to This Policy',
    items: [
      'We may update this Cookie Policy from time to time to reflect changes in our practices or legal requirements',
      'Changes will be posted on this page with an updated effective date',
      'This policy was last updated on July 14, 2026',
    ],
  },
  {
    title: 'Contact Us',
    items: [
      'If you have questions about our use of cookies, please contact us at privacy@retirewell.ph',
      'Phone: +63 2 888 1234',
      'Retire Well SRRV, Manila, Philippines',
    ],
  },
];

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 flex flex-col">
      <Hero
        title="Cookie Policy"
        description="How and why we use cookies on the Retire Well SRRV website and applicant portal."
      />

      <section className="flex-grow max-w-4xl mx-auto w-full px-6 py-16">
        <div className="space-y-12">
          <div className="prose prose-slate max-w-none">
            <p className="text-gray-600 leading-relaxed text-lg">
              This Cookie Policy explains what cookies are, how we use them on our website
              and applicant portal, and how you can manage your cookie preferences.
            </p>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-2xl font-serif text-[#0F172A] mb-4">{section.title}</h2>
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-600 leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#9E1B32]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
