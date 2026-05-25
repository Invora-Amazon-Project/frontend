// src/components/layout/Footer.tsx

import Link from "next/link";

const footerLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-card-bg border-border border-t">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-brand text-base font-semibold">
          MarginLane
        </Link>

        <p className="text-muted text-xs">
          © {new Date().getFullYear()} Invora. All rights reserved.
        </p>

        <ul className="flex items-center gap-5">
          {footerLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-muted hover:text-heading text-xs transition-colors duration-150"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
