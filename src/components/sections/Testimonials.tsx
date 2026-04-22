import Card from "@/components/ui/Card";

interface Testimonial {
  text: string;
  name: string;
  role: string;
  avatarBg: string;
  avatarColor: string;
  initials: string;
}

const testimonials: Testimonial[] = [
  {
    text: "Invora cut my product research time in half. I found my first winning product within a week of signing up.",
    name: "James M.",
    role: "Amazon FBA Seller",
    avatarBg: "bg-primary-light",
    avatarColor: "text-body",
    initials: "JM",
  },
  {
    text: "The supplier sourcing tools are a game changer. I manage all my POs in one place now — no more spreadsheets.",
    name: "Sarah R.",
    role: "Private Label Seller",
    avatarBg: "bg-mint-bg",
    avatarColor: "text-green-800",
    initials: "SR",
  },
  {
    text: "Finally a tool that actually shows real profit margins. Worth every penny of the Pro plan.",
    name: "David K.",
    role: "7-Figure Amazon Seller",
    avatarBg: "bg-peach-bg",
    avatarColor: "text-orange-800",
    initials: "DK",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-section-bg py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-medium text-primary uppercase tracking-widest mb-3">
            Testimonials
          </p>
          <h2 className="text-4xl font-semibold text-heading tracking-tight mb-4">
            Loved by Amazon sellers
          </h2>
          <p className="text-base text-muted max-w-lg mx-auto leading-relaxed">
            See what sellers are saying about Invora.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name}>
              <p className="text-sm text-body leading-relaxed italic mb-6">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full ${testimonial.avatarBg} ${testimonial.avatarColor} text-xs font-semibold flex items-center justify-center shrink-0`}
                >
                  {testimonial.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-heading">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-muted">{testimonial.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
