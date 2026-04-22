"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import WaitlistModal from "@/components/ui/WaitlistModal";

export default function CTA() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="bg-cta-bg py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl font-semibold text-white tracking-tight mb-4">
          Ready to source smarter?
        </h2>
        <p className="text-base text-white/70 max-w-md mx-auto leading-relaxed mb-10">
          Join the waitlist today and be the first to know when Invora launches.
          No credit card required.
        </p>

        <Button
          variant="outline"
          size="lg"
          onClick={() => setIsModalOpen(true)}
        >
          Join the waitlist
        </Button>
      </div>
      <WaitlistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
