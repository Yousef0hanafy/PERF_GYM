"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogIn, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  phoneLastFour: z.string().length(4, "Please enter the last 4 digits of your phone"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function PortalLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { memberId: "", phoneLastFour: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const { data: member, error: fetchError } = await supabase
        .from("members")
        .select("id, member_id, phone")
        .eq("member_id", data.memberId.trim().toUpperCase())
        .single();

      if (fetchError || !member) {
        setError("Member ID not found. Please check your credentials.");
        setLoading(false);
        return;
      }

      const phoneClean = member.phone.replace(/\D/g, "");
      const inputClean = data.phoneLastFour.replace(/\D/g, "");

      if (!phoneClean.endsWith(inputClean)) {
        setError("Phone digits don't match. Please try again.");
        setLoading(false);
        return;
      }

      sessionStorage.setItem("portalMemberId", member.member_id);
      sessionStorage.setItem("portalDbId", member.id);
      router.push("/portal/dashboard");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center">
              <Image src="/logo.png" alt="Performance Gym" width={64} height={64} className="object-contain" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold">Performance Gym</h1>
          <p className="text-muted-foreground">Member Portal</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your Member ID and the last 4 digits of your phone number.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="memberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Member ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., PG-2024-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneLastFour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last 4 Digits of Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" maxLength={4} placeholder="e.g., 5678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <LogIn className="h-4 w-4 mr-2" />
                  )}
                  Sign In
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Not a member yet?{" "}
                <Link href="/#booking" className="text-primary hover:underline">
                  Join Now
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            Back to Website
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
