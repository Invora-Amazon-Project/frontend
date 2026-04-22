"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import WaitlistModal from "@/components/ui/WaitlistModal";

const pills = ["Product Research", "Supplier Sourcing", "Profit Analytics"];

export default function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <section className="bg-page-bg py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-primary-light text-body text-xs font-medium px-4 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Built exclusively for Amazon Sellers
        </div>

        <h1 className="text-5xl font-semibold text-heading leading-tight tracking-tight mb-6">
          Stop guessing. <br />
          Start sourcing <span className="text-primary">smarter</span>
        </h1>

        <p className="text-base text-muted leading-relaxed max-w-xl mx-auto mb-10">
          Invora helps Amazon sellers find profitable products, manage
          suppliers, and track real margins — all in one place.
        </p>

        <div className="flex items-center justify-center gap-3 mb-14">
          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsModalOpen(true)}
          >
            Join the waitlist
          </Button>
          <a href="#how-it-works">
            <Button variant="outline" size="lg">
              See how it works
            </Button>
          </a>
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          {pills.map((pill) => (
            <span
              key={pill}
              className="flex items-center gap-2 bg-card-bg border border-border text-muted text-xs font-medium px-4 py-2 rounded-full"
            >
              <span className="w-1 h-1 rounded-full bg-primary" />
              {pill}
            </span>
          ))}
        </div>
      </div>
      <WaitlistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
