"use client";

import { motion } from "framer-motion";
import {
  Dumbbell,
  Swords,
  Sparkles,
  UserCheck,
  Stethoscope,
  Activity,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    icon: Dumbbell,
    title: "Elite Equipment",
    description:
      "Train on industry-leading machines and free weights. Our multi-zone facility covers cardio, strength, and functional movement — all meticulously maintained.",
  },
  {
    icon: Swords,
    title: "Kickboxing",
    description:
      "Develop explosive power and mental discipline under the guidance of professional instructors. Suitable for all levels — from beginners to competitive athletes.",
  },
  {
    icon: Sparkles,
    title: "Luxury Spa",
    description:
      "Recover and restore in our premium wellness suite — featuring a sauna, steam room, ice plunge pool, and jacuzzi. Engineered for peak recovery.",
  },
  {
    icon: UserCheck,
    title: "Personal Coaching",
    description:
      "Achieve accelerated results with bespoke one-on-one sessions. Our certified coaches craft precise programs built around your goals, schedule, and physiology.",
  },
  {
    icon: Stethoscope,
    title: "Physiotherapy",
    description:
      "Prevent injury and optimise performance with expert physiotherapy. Evidence-based treatment plans for rehabilitation, mobility, and long-term athletic health.",
  },
  {
    icon: Activity,
    title: "Body Assessment",
    description:
      "Track every metric that matters with InBody composition analysis. Gain precise insights into muscle mass, body fat percentage, hydration, and metabolic rate.",
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold mb-2 block tracking-widest uppercase text-sm">
            Built to Perform
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Everything You Need. Nothing You Don&apos;t.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            Six world-class disciplines under one roof — because real results
            demand more than just a treadmill.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full group hover:border-primary/50 transition-all duration-300 bg-card hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="p-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="inline-flex p-3 bg-primary/10 rounded-xl mb-4 transition-colors group-hover:bg-primary/20"
                  >
                    <service.icon className="h-6 w-6 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-200">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
