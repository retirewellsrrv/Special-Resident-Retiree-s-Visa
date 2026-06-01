import retireWellLogo from "@/assets/images/logo.png";

const navLinks = [
  { label: "Services", href: "#" },
  { label: "Eligibility", href: "#" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Cookie Policy", href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-brand-tertiary-400 border-t border-ht-outline-variant py-12">
      <div className="max-w-ht-content mx-auto px-ht-margin-mobile md:px-ht-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <img
              src={retireWellLogo.src}
              alt="RetireWell"
              className="h-12 mb-3"
            />
            <p className="text-ht-caption text-brand-neutral-500 max-w-xs">
              Expert visa consulting services for foreign retirees and
              businesses in the Philippines. Certified and professional.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-ht-label-md font-semibold text-brand-secondary-500 mb-3 uppercase tracking-wider">
              Navigation
            </p>
            <ul className="space-y-2 text-ht-body-md text-brand-neutral-600">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="hover:text-brand-primary-500 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-ht-label-md font-semibold text-brand-secondary-500 mb-3 uppercase tracking-wider">
              Legal
            </p>
            <ul className="space-y-2 text-ht-body-md text-brand-neutral-600">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="hover:text-brand-primary-500 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-ht-outline-variant pt-6 text-center">
          <p className="text-ht-caption text-brand-neutral-400">
            © 2024 Retire Well SRRV. All rights reserved. Professional Visa
            Consultation Services.
          </p>
        </div>
      </div>
    </footer>
  );
}