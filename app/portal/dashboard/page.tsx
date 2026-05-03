"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Calendar,
  Clock,
  CreditCard,
  Snowflake,
  AlertTriangle,
  LogOut,
  Home,
  Users,
  Dumbbell,
  ClipboardList,
  Swords,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { Member, SupabaseMembershipPlan } from "@/types";

export default function PortalDashboard() {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [plan, setPlan] = useState<SupabaseMembershipPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const memberId = sessionStorage.getItem("portalMemberId");
    if (!memberId) {
      router.push("/portal");
      return;
    }

    const fetchMember = async () => {
      const supabase = createClient();

      const { data, error: err } = await supabase
        .from("members")
        .select("*")
        .eq("member_id", memberId)
        .single();

      if (err || !data) {
        setError("Could not load your membership data.");
        setLoading(false);
        return;
      }

      setMember(data);

      if (data.plan_id) {
        const { data: planData } = await supabase
          .from("membership_plans")
          .select("id,name,price,duration,features,is_featured,invitations,pt_sessions,body_assessments,kickboxing_sessions,freeze_weeks")
          .eq("id", data.plan_id)
          .single();
        if (planData) setPlan(planData);
      }

      setLoading(false);
    };

    fetchMember();
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("portalMemberId");
    sessionStorage.removeItem("portalDbId");
    router.push("/portal");
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    return Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading your membership data...</p>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <p className="text-destructive font-medium">{error || "Member not found."}</p>
          <Button onClick={handleLogout}>Back to Login</Button>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(member.end_date);
  const totalDays = Math.max(
    1,
    Math.ceil(
      (new Date(member.end_date).getTime() - new Date(member.start_date).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );
  const progressPercent = Math.max(
    0,
    Math.min(100, Math.round(((totalDays - daysRemaining) / totalDays) * 100))
  );

  const isActive = daysRemaining > 0 && !member.is_frozen;

  const benefitCards = [
    {
      label: "Guest Invitations",
      subLabel: "For anyone 18+ years",
      value: member.invitations_left,
      icon: Users,
    },
    {
      label: "Orientation Sessions",
      subLabel: "Machine guidance with trainer",
      value: member.pt_sessions_left,
      icon: Dumbbell,
    },
    {
      label: "Body Assessments",
      subLabel: "Full fitness evaluation",
      value: member.body_assessments_left,
      icon: ClipboardList,
    },
    {
      label: "Kickboxing Sessions",
      subLabel: "Group kickboxing classes",
      value: member.kickboxing_sessions_left,
      icon: Swords,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/portal/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
              <Image src="/logo.png" alt="Performance Gym" width={36} height={36} className="object-contain" />
            </div>
            <span className="font-bold">Member Portal</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Website
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold">Welcome back, {member.name}!</h1>
          <p className="text-muted-foreground mt-1">Member ID: {member.member_id}</p>
        </motion.div>

        {daysRemaining <= 7 && isActive && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="rounded-xl border border-destructive bg-destructive/10 p-5">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-destructive/20 rounded-lg shrink-0">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-destructive text-base">
                    Membership Expiring {daysRemaining === 0 ? "Today!" : `in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}!`}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Don&apos;t lose your progress — renew now to keep your gym access, spa benefits, and all sessions without interruption.
                  </p>
                  <a
                    href={`https://wa.me/201116973238?text=${encodeURIComponent(
                      `Hi! I'm ${member.name} (Member ID: ${member.member_id}). My ${plan?.name || "membership"} expires in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}. I'd like to renew. Please help me with the renewal process.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Renew via WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {!isActive && !member.is_frozen && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="rounded-xl border border-destructive bg-destructive/10 p-5">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-destructive/20 rounded-lg shrink-0">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-destructive text-base">Membership Expired</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your membership has ended. Contact us on WhatsApp to renew and get back to training.
                  </p>
                  <a
                    href={`https://wa.me/201116973238?text=${encodeURIComponent(
                      `Hi! I'm ${member.name} (Member ID: ${member.member_id}). My ${plan?.name || "membership"} has expired. I'd like to renew my membership. Please help me.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Renew via WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Membership Status Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Membership Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="text-xl font-bold">{plan?.name || "—"}</p>
                  {plan?.duration && (
                    <p className="text-sm text-muted-foreground">{plan.duration}</p>
                  )}
                </div>
                <Badge
                  className={
                    isActive
                      ? "bg-green-500 text-white"
                      : member.is_frozen
                      ? "bg-blue-500 text-white"
                      : "bg-red-500 text-white"
                  }
                >
                  {member.is_frozen ? "Frozen" : isActive ? "Active" : "Expired"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    Start Date
                  </div>
                  <p className="font-semibold">
                    {new Date(member.start_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    End Date
                  </div>
                  <p className="font-semibold">
                    {new Date(member.end_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Membership Progress</span>
                  <span className="text-sm font-medium">
                    {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Expired"}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Benefits Grid */}
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg font-semibold mb-4"
          >
            Your Remaining Benefits
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {benefitCards.map((benefit, index) => (
              <motion.div
                key={benefit.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + index * 0.08 }}
              >
                <Card className={benefit.value === 0 ? "opacity-50" : ""}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <benefit.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-2xl font-bold">{benefit.value}</span>
                    </div>
                    <p className="font-semibold text-sm leading-tight">{benefit.label}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-tight">
                      {benefit.subLabel}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Freeze status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Snowflake className="h-5 w-5 text-primary" />
                Freeze Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold mt-1">
                    {member.is_frozen ? "Currently Frozen" : "Not Frozen"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {member.is_frozen
                      ? "Your membership is paused. Visit us to unfreeze."
                      : "Your membership is active and running normally."}
                  </p>
                </div>
                <Badge variant={member.is_frozen ? "default" : "secondary"}>
                  {member.is_frozen ? "Frozen" : "Active"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Spa Access Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="bg-gradient-to-r from-primary/20 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-primary rounded-xl shrink-0">
                  <Clock className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Unlimited Spa Access</h3>
                  <p className="text-muted-foreground">
                    Sauna, Steam Room, Ice Pool, and Jacuzzi — all included with your membership.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <footer className="border-t border-border py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Performance Gym. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
