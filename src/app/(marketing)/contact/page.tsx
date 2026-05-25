import ContactForm from "@/components/sections/ContactForm";
import Footer from "@/components/layout/Footer";

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
