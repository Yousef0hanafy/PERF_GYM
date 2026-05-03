"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToServices = () => {
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://soayokjfafifhmhjuavf.supabase.co/storage/v1/object/sign/Gallary/Hero_Second.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wYzMwNWVlYi03NzViLTQ4ZWMtYjczNS1iYTU0YTJhNTJlNDkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYWxsYXJ5L0hlcm9fU2Vjb25kLnBuZyIsImlhdCI6MTc3Nzc3MTQ2OCwiZXhwIjoxOTM1NDUxNDY4fQ._rUU8h27VWTDgHyGCF1rfV-yyKXvkNMyN33QU1YOB8A"
          alt="Performance Gym interior"
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-background/75" />
        {/* Gradient fade at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        {/* Primary color tint */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-2 mb-6 text-sm font-semibold tracking-widest uppercase text-primary bg-primary/10 rounded-full border border-primary/20"
          >
            Cairo&apos;s Elite Training Destination
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance leading-tight"
          >
            Where Champions{" "}
            <span className="text-primary">Are Forged</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-pretty leading-relaxed"
          >
            No excuses. No limits. Just results. Train in 1,800m² built for
            serious athletes — elite equipment, expert coaches, and a luxury spa
            to keep you performing at your absolute best.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              size="lg"
              onClick={scrollToBooking}
              className="text-base px-10 py-6 font-semibold tracking-wide"
            >
              Begin Your Transformation
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToServices}
              className="text-base px-10 py-6 font-semibold tracking-wide"
            >
              Discover Our Services
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative rings */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute -top-40 -right-40 w-80 h-80 rounded-full border border-primary/10"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full border border-primary/10"
      />
    </section>
  );
}
