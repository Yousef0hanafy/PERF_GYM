"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { StatsBanner } from "@/components/landing/stats-banner";
import { ServicesSection } from "@/components/landing/services-section";
import { GallerySection } from "@/components/landing/gallery-section";
import { TransformationsSection } from "@/components/landing/transformations-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { BookingSection } from "@/components/landing/booking-section";
import { Footer } from "@/components/landing/footer";
import { WhatsAppButton } from "@/components/landing/whatsapp-button";

export default function HomePage() {
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <StatsBanner />
      <ServicesSection />
      <GallerySection />
      <TransformationsSection />
      <TestimonialsSection />
      <PricingSection onSelectPlan={setSelectedPlanId} />
      <BookingSection selectedPlanId={selectedPlanId} />
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
