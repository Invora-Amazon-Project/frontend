interface Step {
  number: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: "1",
    title: "Create your account",
    description:
      "Sign up free, no credit card required. Your dashboard is ready instantly.",
  },
  {
    number: "2",
    title: "Connect your store",
    description: "Link your Amazon Seller Central account with one click.",
  },
  {
    number: "3",
    title: "Research products",
    description:
      "Use our tools to find winning products and build your sourcing list.",
  },
  {
    number: "4",
    title: "Scale your business",
    description: "Track orders, analyze profits, and grow with confidence.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-section-bg py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-medium text-primary uppercase tracking-widest mb-3">
            How it works
          </p>
          <h2 className="text-4xl font-semibold text-heading tracking-tight mb-4">
            Up and running in minutes
          </h2>
          <p className="text-base text-muted max-w-lg mx-auto leading-relaxed">
            Getting started with MarginLane is simple. No technical setup, no
            learning curve.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="flex flex-col items-center text-center relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-5 left-[calc(50%+28px)] right-[calc(-50%+28px)] h-px bg-border" />
              )}

              <div className="w-10 h-10 rounded-full bg-primary text-white text-sm font-semibold flex items-center justify-center mb-5 relative z-10">
                {step.number}
              </div>

              <h3 className="text-sm font-semibold text-heading mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
