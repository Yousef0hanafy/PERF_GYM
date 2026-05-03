"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users, CreditCard, Cake, AlertTriangle, Trash2, Loader2,
  CheckCircle2, PhoneCall,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardMember {
  id: string;
  name: string;
  end_date: string;
  date_of_birth: string | null;
}

interface BookingRequest {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  status: string;
  plan_id: string | null;
  created_at: string;
}

interface PlanMap {
  [id: string]: string;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [totalMembers, setTotalMembers] = useState(0);
  const [todayBirthdays, setTodayBirthdays] = useState<DashboardMember[]>([]);
  const [expiringSoon, setExpiringSoon] = useState<DashboardMember[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [planMap, setPlanMap] = useState<PlanMap>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const pendingCount = bookingRequests.filter((r) => r.status === "pending").length;

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const today = new Date();
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);
    const todayStr = today.toISOString().split("T")[0];
    const sevenDaysStr = sevenDaysLater.toISOString().split("T")[0];

    const [membersRes, bookingsRes, plansRes] = await Promise.all([
      supabase.from("members").select("id, name, end_date, date_of_birth"),
      supabase.from("booking_requests").select("id, name, email, phone, status, plan_id, created_at").order("created_at", { ascending: false }),
      supabase.from("membership_plans").select("id, name"),
    ]);

    const allMembers: DashboardMember[] = membersRes.data || [];
    setTotalMembers(allMembers.length);
    setExpiringSoon(allMembers.filter((m) => m.end_date >= todayStr && m.end_date <= sevenDaysStr));

    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();
    setTodayBirthdays(
      allMembers.filter((m) => {
        if (!m.date_of_birth) return false;
        const dob = new Date(m.date_of_birth);
        return dob.getMonth() + 1 === todayMonth && dob.getDate() === todayDay;
      })
    );

    setBookingRequests(bookingsRes.data || []);

    const map: PlanMap = {};
    for (const p of plansRes.data || []) map[p.id] = p.name;
    setPlanMap(map);

    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDeleteRequest = async (id: string) => {
    setDeletingId(id);
    setBookingRequests((prev) => prev.filter((r) => r.id !== id));
    const supabase = createClient();
    const { error } = await supabase.from("booking_requests").delete().eq("id", id);
    if (error) { toast.error("Failed to delete request"); fetchData(); }
    else toast.success("Booking request removed");
    setDeletingId(null);
  };

  const handleUpdateStatus = async (id: string, status: "pending" | "contacted" | "converted") => {
    setUpdatingId(id);
    const supabase = createClient();
    const { data, error } = await supabase.from("booking_requests").update({ status }).eq("id", id).select().single();
    if (error) toast.error("Failed to update status");
    else {
      setBookingRequests((prev) => prev.map((r) => r.id === id ? data : r));
      const labels = { pending: "Pending", contacted: "Contacted", converted: "Converted" };
      toast.success(`Marked as ${labels[status]}`);
    }
    setUpdatingId(null);
  };

  const getDaysLeft = (endDate: string) =>
    Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const statCards = [
    { title: "Total Members", value: totalMembers, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Pending Requests", value: pendingCount, icon: CreditCard, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { title: "Today's Birthdays", value: todayBirthdays.length, icon: Cake, color: "text-pink-500", bg: "bg-pink-500/10" },
    { title: "Expiring in 7 Days", value: expiringSoon.length, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  const statusStyles: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-500",
    contacted: "bg-blue-500/20 text-blue-500",
    converted: "bg-green-500/20 text-green-500",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here&apos;s what&apos;s happening at Performance Gym.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 ${stat.bg} rounded-lg`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stat.value}</div>}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cake className="h-5 w-5 text-pink-500" />
                Today&apos;s Birthdays
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}</div>
              ) : todayBirthdays.length === 0 ? (
                <p className="text-muted-foreground text-center py-6 text-sm">No birthdays today 🎂</p>
              ) : (
                <div className="space-y-3">
                  {todayBirthdays.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-pink-500/10 rounded-lg">
                      <p className="font-medium">{m.name}</p>
                      <span className="text-2xl">🎂</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Expiring Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}</div>
              ) : expiringSoon.length === 0 ? (
                <p className="text-muted-foreground text-center py-6 text-sm">No subscriptions expiring in 7 days</p>
              ) : (
                <div className="space-y-3">
                  {expiringSoon.map((m) => {
                    const daysLeft = getDaysLeft(m.end_date);
                    return (
                      <div key={m.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div>
                          <p className="font-medium">{m.name}</p>
                          <p className="text-xs text-muted-foreground">Expires {new Date(m.end_date).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${daysLeft <= 3 ? "bg-red-500/20 text-red-500" : "bg-yellow-500/20 text-yellow-500"}`}>
                          {daysLeft}d left
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Booking Requests</span>
              {!loading && (
                <span className="text-sm font-normal text-muted-foreground">
                  {bookingRequests.length} total · {pendingCount} pending
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
            ) : bookingRequests.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No booking requests yet. They will appear here when visitors submit the form.</p>
            ) : (
              <div className="space-y-3">
                {bookingRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{req.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {req.phone}{req.email ? ` · ${req.email}` : ""}
                      </p>
                      {req.plan_id && planMap[req.plan_id] && (
                        <p className="text-xs text-primary font-medium mt-0.5">{planMap[req.plan_id]}</p>
                      )}
                      <p className="text-xs text-muted-foreground/60 mt-0.5">
                        {new Date(req.created_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            disabled={updatingId === req.id}
                            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer ${statusStyles[req.status] || statusStyles.pending}`}
                          >
                            {updatingId === req.id ? (
                              <Loader2 className="h-3 w-3 animate-spin inline" />
                            ) : req.status}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUpdateStatus(req.id, "pending")}>
                            <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2 inline-block" />Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(req.id, "contacted")}>
                            <PhoneCall className="h-4 w-4 mr-2 text-blue-500" />Contacted
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(req.id, "converted")}>
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />Converted
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button
                        variant="ghost" size="icon"
                        onClick={() => handleDeleteRequest(req.id)}
                        disabled={deletingId === req.id}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      >
                        {deletingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
