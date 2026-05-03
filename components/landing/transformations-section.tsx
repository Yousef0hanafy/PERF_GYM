"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface SupabaseTransformation {
  id: string;
  name: string;
  duration: string;
  before_image: string;
  after_image: string;
}

function TransformationSlider({
  name,
  duration,
  beforeImage,
  afterImage,
}: {
  name: string;
  duration: string;
  beforeImage: string;
  afterImage: string;
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  return (
    <div className="space-y-4">
      <div
        className="relative aspect-[4/3] rounded-xl overflow-hidden cursor-ew-resize select-none"
        onMouseMove={handleMouseMove}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
      >
        {/* After Image (background) */}
        <img
          src={afterImage}
          alt={`${name} after`}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Before Image (clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={beforeImage}
            alt={`${name} before`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize shadow-lg"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            <div className="flex gap-0.5">
              <div className="w-0.5 h-4 bg-primary-foreground rounded-full" />
              <div className="w-0.5 h-4 bg-primary-foreground rounded-full" />
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute bottom-4 left-4 px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-sm font-medium">
          Before
        </div>
        <div className="absolute bottom-4 right-4 px-3 py-1 bg-primary/80 backdrop-blur-sm rounded-full text-sm font-medium text-primary-foreground">
          After
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-xl font-semibold mb-1">{name}</h3>
        <p className="text-muted-foreground">{duration}</p>
      </div>
    </div>
  );
}

export function TransformationsSection() {
  const [transformations, setTransformations] = useState<SupabaseTransformation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransformations = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("transformations")
        .select("*")
        .order("created_at", { ascending: true });
      if (data) setTransformations(data);
      setLoading(false);
    };
    fetchTransformations();
  }, []);

  return (
    <section id="transformations" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold mb-2 block tracking-widest uppercase text-sm">
            Proof of Work
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            The Results Speak for Themselves
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Drag the slider and witness what happens when commitment meets
            world-class coaching. Every transformation is 100% real.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="w-full aspect-[4/3] rounded-xl" />
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {transformations.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <TransformationSlider
                  name={item.name}
                  duration={item.duration}
                  beforeImage={item.before_image}
                  afterImage={item.after_image}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
