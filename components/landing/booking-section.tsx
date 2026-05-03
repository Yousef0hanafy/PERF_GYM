"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { SupabaseMembershipPlan } from "@/types";

const bookingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  membershipPlanId: z.string().min(1, "Please select a membership plan"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingSectionProps {
  selectedPlanId?: string;
}

export function BookingSection({ selectedPlanId }: BookingSectionProps) {
  const [plans, setPlans] = useState<SupabaseMembershipPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("membership_plans")
        .select("id, name, price, duration")
        .order("price", { ascending: true });
      if (data) setPlans(data as SupabaseMembershipPlan[]);
      setPlansLoading(false);
    };
    fetchPlans();
  }, []);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { name: "", phone: "", email: "", membershipPlanId: selectedPlanId || "" },
  });

  useEffect(() => {
    if (selectedPlanId) form.setValue("membershipPlanId", selectedPlanId);
  }, [selectedPlanId, form]);

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("booking_requests").insert([{
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        plan_id: data.membershipPlanId,
        status: "pending",
      }]);

      if (error) {
        toast.error("Failed to submit request. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const selectedPlan = plans.find((m) => m.id === data.membershipPlanId);
      const message = `New Membership Request\n\nName: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email || "N/A"}\nSelected Plan: ${selectedPlan?.name || "N/A"} (${selectedPlan?.price?.toLocaleString()} L.E)`;
      const whatsappUrl = `https://wa.me/201116973238?text=${encodeURIComponent(message)}`;

      setIsSubmitted(true);
      setIsSubmitting(false);

      setTimeout(() => { window.open(whatsappUrl, "_blank"); }, 1500);
      setTimeout(() => { form.reset(); setIsSubmitted(false); }, 5000);
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <section id="booking" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold mb-2 block tracking-widest uppercase text-sm">
            Your Move
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Secure Your Spot Today
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            One form. One step. Our team will reach out within hours to lock in
            your plan. The only thing standing between you and results is this form.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto"
        >
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-center">Join the Elite</CardTitle>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8"
                >
                  <Alert className="border-primary/50 bg-primary/10">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <AlertTitle className="text-primary">You&apos;re In!</AlertTitle>
                    <AlertDescription>
                      Your request is confirmed. Our team will reach out shortly to get you started. Opening WhatsApp now...
                    </AlertDescription>
                  </Alert>
                </motion.div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="Enter your full name" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl><Input type="tel" placeholder="Enter your phone number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                        <FormControl><Input type="email" placeholder="Enter your email address" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="membershipPlanId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Membership Plan</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={plansLoading ? "Loading plans..." : "Select a membership plan"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {plansLoading ? (
                              <div className="p-2 space-y-2">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                              </div>
                            ) : (
                              plans.map((plan) => (
                                <SelectItem key={plan.id} value={plan.id}>
                                  {plan.name} — {plan.price.toLocaleString()} L.E
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Reserve My Spot via WhatsApp
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
