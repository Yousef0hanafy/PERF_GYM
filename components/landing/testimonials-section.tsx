"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface Testimonial {
  id: string;
  name: string;
  plan: string;
  rating: number;
  review: string;
  avatar: string | null;
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: true });
      if (data && data.length > 0) setTestimonials(data);
      setLoading(false);
    };
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (!autoPlay || testimonials.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [autoPlay, testimonials.length]);

  const goToPrevious = () => {
    setAutoPlay(false);
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setAutoPlay(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const current = testimonials[currentIndex];

  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold mb-2 block tracking-widest uppercase text-sm">Real Voices</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Trusted by Hundreds. Loved by All.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Don&apos;t take our word for it — hear directly from the people who
            show up every day and refuse to stop.
          </p>
        </motion.div>

        {loading ? (
          <div className="max-w-4xl mx-auto">
            <Skeleton className="w-full h-64 rounded-2xl" />
          </div>
        ) : testimonials.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No testimonials yet.
          </p>
        ) : (
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card rounded-2xl p-8 md:p-12 text-center"
                >
                  <Quote className="h-12 w-12 text-primary/20 mx-auto mb-6" />

                  <p className="text-lg md:text-xl text-foreground mb-8 text-pretty">
                    &quot;{current?.review}&quot;
                  </p>

                  <div className="flex justify-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < (current?.rating || 0)
                            ? "text-primary fill-primary"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>

                  <Avatar className="h-16 w-16 mx-auto mb-4 border-2 border-primary">
                    {current?.avatar ? (
                      <img
                        src={current.avatar}
                        alt={current.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                        {current?.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <h4 className="text-lg font-semibold">{current?.name}</h4>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrevious}
                className="rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setAutoPlay(false);
                      setCurrentIndex(index);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? "w-8 bg-primary"
                        : "w-2 bg-muted-foreground/30"
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={goToNext}
                className="rounded-full"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
