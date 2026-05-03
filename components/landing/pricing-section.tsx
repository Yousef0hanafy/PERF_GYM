"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { SupabaseMembershipPlan } from "@/types";

interface PricingSectionProps {
  onSelectPlan?: (planId: string) => void;
}

export function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const [plans, setPlans] = useState<SupabaseMembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("membership_plans")
        .select("*")
        .order("price", { ascending: true });
      if (data) setPlans(data);
      setLoading(false);
    };
    fetchPlans();
  }, []);

  const handleSelectPlan = (planId: string) => {
    if (onSelectPlan) onSelectPlan(planId);
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold mb-2 block tracking-widest uppercase text-sm">
            Membership Plans
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Choose Your Perfect Plan
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Flexible membership options designed to fit your lifestyle and
            fitness goals. All plans include unlimited gym access.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-80 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="h-full"
              >
                <Card
                  className={cn(
                    "h-full relative overflow-hidden transition-all hover:shadow-xl",
                    plan.is_featured
                      ? "border-primary shadow-lg shadow-primary/20"
                      : "hover:border-primary/50"
                  )}
                >
                  {plan.is_featured && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-primary text-primary-foreground">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.duration}</p>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">
                        {plan.price.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground ml-1">L.E</span>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <ul className="space-y-3 mb-6">
                      {(plan.features || []).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={cn(
                        "w-full",
                        plan.is_featured
                          ? "bg-primary hover:bg-primary/90"
                          : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                      )}
                      onClick={() => handleSelectPlan(plan.id)}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
