// src/components/layout/Navbar.tsx

import Link from "next/link";
import Button from "../ui/Button";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Support", href: "#support" },
];

export default function Navbar() {
  return (
    <header className="bg-card-bg border-border border-b">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-brand text-lg font-semibold">
          invora
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-muted hover:text-heading text-sm transition-colors duration-150"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            Sign in
          </Button>
          <Button variant="primary" size="sm">
            Get started
          </Button>
        </div>
      </nav>
    </header>
  );
}
