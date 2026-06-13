"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Users, Loader2, Edit, Snowflake, Minus, CalendarClock, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import type { Member, SupabaseMembershipPlan } from "@/types";

const PAGE_SIZE = 20;

const emptyForm = {
  name: "", phone: "", email: "", plan_id: "",
  start_date: "", end_date: "", date_of_birth: "",
  invitations_left: "0", pt_sessions_left: "0",
  body_assessments_left: "0", kickboxing_sessions_left: "0",
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<SupabaseMembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [frozenCount, setFrozenCount] = useState(0);
  const [searchResultCount, setSearchResultCount] = useState<number | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const supabase = createClient();

  // Fetch stats counts (lightweight, no full data fetch)
  const fetchCounts = useCallback(async () => {
    const now = new Date().toISOString().split("T")[0];
    const [{ count: total }, { count: active }, { count: frozen }] = await Promise.all([
      supabase.from("members").select("*", { count: "exact", head: true }),
      supabase.from("members").select("*", { count: "exact", head: true }).eq("is_frozen", false).gt("end_date", now),
      supabase.from("members").select("*", { count: "exact", head: true }).eq("is_frozen", true),
    ]);
    setTotalCount(total || 0);
    setActiveCount(active || 0);
    setFrozenCount(frozen || 0);
  }, [supabase]);

  // Fetch members with server-side pagination & search
  const fetchMembers = useCallback(async (offset = 0, append = false) => {
    const isLoadingMore = offset > 0;
    if (isLoadingMore) setLoadingMore(true);
    else setLoading(true);

    let query = supabase
      .from("members")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      query = query.or(
        `name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%,member_id.ilike.%${q}%`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      toast.error("Failed to load members");
    } else {
      const newMembers = data || [];
      setMembers((prev) => (append ? [...prev, ...newMembers] : newMembers));
      setHasMore((offset + PAGE_SIZE) < (count || 0));
      setSearchResultCount(searchQuery.trim() ? count || 0 : null);
    }

    if (isLoadingMore) setLoadingMore(false);
    else setLoading(false);
  }, [supabase, searchQuery]);

  const fetchPlans = async () => {
    const { data } = await supabase.from("membership_plans").select("*").order("price", { ascending: true });
    if (data) setPlans(data);
  };

  // Initial load
  useEffect(() => {
    fetchCounts();
    fetchMembers(0, false);
    fetchPlans();
  }, [fetchCounts, fetchMembers]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          fetchMembers(members.length, true);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, members.length, fetchMembers]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => setSearchQuery(value), 400);
  };

  const loadMore = () => {
    if (hasMore && !loadingMore && !loading) fetchMembers(members.length, true);
  };

  const handlePlanChange = (planId: string) => {
    const selected = plans.find((p) => p.id === planId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        plan_id: planId,
        invitations_left: (selected.invitations ?? 0).toString(),
        pt_sessions_left: (selected.pt_sessions ?? 0).toString(),
        body_assessments_left: (selected.body_assessments ?? 0).toString(),
        kickboxing_sessions_left: (selected.kickboxing_sessions ?? 0).toString(),
      }));
    } else {
      setFormData((prev) => ({ ...prev, plan_id: planId }));
    }
  };

  const generateMemberId = () => `PG-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;

  const handleAddSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.start_date || !formData.end_date) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.from("members").insert([{
      member_id: generateMemberId(),
      name: formData.name, phone: formData.phone,
      email: formData.email || null,
      plan_id: formData.plan_id || null,
      start_date: formData.start_date, end_date: formData.end_date,
      date_of_birth: formData.date_of_birth || null,
      is_frozen: false,
      invitations_left: parseInt(formData.invitations_left) || 0,
      pt_sessions_left: parseInt(formData.pt_sessions_left) || 0,
      body_assessments_left: parseInt(formData.body_assessments_left) || 0,
      kickboxing_sessions_left: parseInt(formData.kickboxing_sessions_left) || 0,
    }]).select().single();

    if (error) toast.error(`Failed to add member: ${error.message}`);
    else {
      setMembers((prev) => [data, ...prev]);
      toast.success(`${data.name} added successfully`);
      setFormData(emptyForm);
      setIsAddDialogOpen(false);
      fetchCounts();
    }
    setSubmitting(false);
  };

  const openEdit = (m: Member) => {
    setEditingMember(m);
    setFormData({
      name: m.name,
      phone: m.phone,
      email: m.email || "",
      plan_id: m.plan_id || "",
      start_date: m.start_date,
      end_date: m.end_date,
      date_of_birth: m.date_of_birth || "",
      invitations_left: m.invitations_left.toString(),
      pt_sessions_left: m.pt_sessions_left.toString(),
      body_assessments_left: m.body_assessments_left.toString(),
      kickboxing_sessions_left: m.kickboxing_sessions_left.toString(),
    });
  };

  const handleEditSubmit = async () => {
    if (!editingMember) return;
    setSubmitting(true);
    const { data, error } = await supabase.from("members").update({
      name: formData.name,
      phone: formData.phone,
      email: formData.email || null,
      plan_id: formData.plan_id || null,
      start_date: formData.start_date,
      end_date: formData.end_date,
      date_of_birth: formData.date_of_birth || null,
      invitations_left: parseInt(formData.invitations_left) || 0,
      pt_sessions_left: parseInt(formData.pt_sessions_left) || 0,
      body_assessments_left: parseInt(formData.body_assessments_left) || 0,
      kickboxing_sessions_left: parseInt(formData.kickboxing_sessions_left) || 0,
    }).eq("id", editingMember.id).select().single();

    if (error) toast.error(`Failed to update: ${error.message}`);
    else {
      setMembers((prev) => prev.map((m) => m.id === editingMember.id ? data : m));
      toast.success("Member updated");
      setEditingMember(null);
    }
    setSubmitting(false);
  };

  const handleDeductSession = async (member: Member, field: "invitations_left" | "pt_sessions_left" | "body_assessments_left" | "kickboxing_sessions_left") => {
    const current = member[field];
    if (current <= 0) { toast.error("No sessions remaining to deduct"); return; }
    const updated = { [field]: current - 1 };
    const { data, error } = await supabase.from("members").update(updated).eq("id", member.id).select().single();
    if (error) toast.error("Failed to deduct session");
    else {
      setMembers((prev) => prev.map((m) => m.id === member.id ? data : m));
      const labels: Record<string, string> = {
        invitations_left: "invitation",
        pt_sessions_left: "orientation session",
        body_assessments_left: "body assessment",
        kickboxing_sessions_left: "kickboxing session",
      };
      toast.success(`1 ${labels[field]} deducted from ${member.name}`);
    }
  };

  const handleToggleFreeze = async (member: Member) => {
    const { data, error } = await supabase.from("members").update({ is_frozen: !member.is_frozen }).eq("id", member.id).select().single();
    if (error) toast.error("Failed to update freeze status");
    else {
      setMembers((prev) => prev.map((m) => m.id === member.id ? data : m));
      toast.success(data.is_frozen ? `${member.name}'s membership frozen` : `${member.name}'s membership unfrozen`);
      fetchCounts();
    }
  };

  const handleRenew = async (member: Member) => {
    const plan = plans.find((p) => p.id === member.plan_id);
    if (!plan) { toast.error("No plan assigned to this member"); return; }

    const months: Record<string, number> = { "Monthly": 1, "Quarter": 3, "Semi-Annual": 6, "Annual": 12 };
    const addMonths = months[plan.name] || 1;
    const newEnd = new Date(member.end_date > new Date().toISOString().split("T")[0] ? member.end_date : new Date().toISOString().split("T")[0]);
    newEnd.setMonth(newEnd.getMonth() + addMonths);

    const renewData = {
      end_date: newEnd.toISOString().split("T")[0],
      invitations_left: plan.invitations,
      pt_sessions_left: plan.pt_sessions,
      body_assessments_left: plan.body_assessments,
      kickboxing_sessions_left: plan.kickboxing_sessions,
      is_frozen: false,
    };
    const { data, error } = await supabase.from("members").update(renewData).eq("id", member.id).select().single();
    if (error) toast.error("Failed to renew membership");
    else {
      setMembers((prev) => prev.map((m) => m.id === member.id ? data : m));
      toast.success(`${member.name}'s membership renewed until ${newEnd.toLocaleDateString()}`);
      fetchCounts();
    }
  };

  const getDaysRemaining = (endDate: string) =>
    Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const getPlanName = (planId: string | null) =>
    planId ? (plans.find((p) => p.id === planId)?.name || "Unknown") : "—";

  const sessionField = (
    label: string,
    key: "invitations_left" | "pt_sessions_left" | "body_assessments_left" | "kickboxing_sessions_left"
  ) => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Input type="number" min="0" value={formData[key]}
        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} />
    </div>
  );

  const MemberFormFields = () => (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <label className="text-sm font-medium">Full Name *</label>
        <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter member name" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Phone *</label>
          <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="01012345678" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Optional" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Date of Birth</label>
        <Input type="date" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Membership Plan</label>
        <Select value={formData.plan_id} onValueChange={handlePlanChange}>
          <SelectTrigger><SelectValue placeholder="Select a plan" /></SelectTrigger>
          <SelectContent>
            {plans.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>{plan.name} — {plan.price.toLocaleString()} L.E</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Start Date *</label>
          <Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">End Date *</label>
          <Input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
        </div>
      </div>
      <div className="border-t pt-4">
        <p className="text-sm font-semibold mb-3">Remaining Benefits</p>
        <div className="grid grid-cols-2 gap-3">
          {sessionField("Guest Invitations (18+)", "invitations_left")}
          {sessionField("Orientation Sessions", "pt_sessions_left")}
          {sessionField("Body Assessments", "body_assessments_left")}
          {sessionField("Kickboxing Sessions", "kickboxing_sessions_left")}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-muted-foreground mt-1">Manage gym members and subscriptions.</p>
        </div>
        <Button onClick={() => { setFormData(emptyForm); setIsAddDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />Add Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Members", value: totalCount },
          { label: "Active Members", value: activeCount },
          { label: "Frozen Members", value: frozenCount },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{loading ? "—" : value}</div></CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name, ID, email or phone..." value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)} className="pl-10 max-w-sm" />
            </div>
            {!loading && (
              <span className="text-sm text-muted-foreground shrink-0">
                Showing {members.length}
                {searchResultCount !== null ? ` of ${searchResultCount}` : ` of ${totalCount}`}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full rounded" />)}</div>
          ) : members.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Days Left</TableHead>
                      <TableHead>Benefits</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => {
                      const daysLeft = getDaysRemaining(member.end_date);
                      const isActive = daysLeft > 0 && !member.is_frozen;
                      const isExpired = daysLeft <= 0 && !member.is_frozen;
                      return (
                        <TableRow key={member.id}>
                          <TableCell className="font-mono text-xs">{member.member_id}</TableCell>
                          <TableCell className="font-medium whitespace-nowrap">{member.name}</TableCell>
                          <TableCell className="whitespace-nowrap">{member.phone}</TableCell>
                          <TableCell className="whitespace-nowrap">{getPlanName(member.plan_id)}</TableCell>
                          <TableCell>
                            <Badge variant={isActive ? "default" : member.is_frozen ? "secondary" : "destructive"}>
                              {member.is_frozen ? "Frozen" : isActive ? "Active" : "Expired"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={daysLeft <= 7 && daysLeft > 0 ? "text-red-500 font-medium" : ""}>
                              {daysLeft > 0 ? `${daysLeft}d` : "Expired"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 min-w-[140px]">
                              {[
                                { label: "Inv", value: member.invitations_left, field: "invitations_left" as const },
                                { label: "Ori", value: member.pt_sessions_left, field: "pt_sessions_left" as const },
                                { label: "Body", value: member.body_assessments_left, field: "body_assessments_left" as const },
                                { label: "KB", value: member.kickboxing_sessions_left, field: "kickboxing_sessions_left" as const },
                              ].map(({ label, value, field }) => {
                                const canDeduct = value > 0 && !isExpired;
                                return (
                                  <button
                                    key={field}
                                    onClick={() => !isExpired && handleDeductSession(member, field)}
                                    title={isExpired ? "Member expired — renew first" : `Deduct 1 ${label} (${value} remaining)`}
                                    disabled={isExpired}
                                    className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border transition-colors ${
                                      canDeduct
                                        ? "border-border hover:border-primary hover:text-primary cursor-pointer"
                                        : "border-transparent text-muted-foreground/40 cursor-default"
                                    }`}
                                  >
                                    {canDeduct && <Minus className="h-2.5 w-2.5" />}
                                    {label}: {value}
                                  </button>
                                );
                              })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost" size="icon"
                                title={isExpired ? "Cannot edit expired member — renew first" : "Edit member"}
                                onClick={() => !isExpired && openEdit(member)}
                                disabled={isExpired}
                                className={isExpired ? "opacity-30 cursor-not-allowed" : ""}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost" size="icon"
                                title={isExpired ? "Cannot freeze expired member — renew first" : member.is_frozen ? "Unfreeze" : "Freeze"}
                                onClick={() => !isExpired && handleToggleFreeze(member)}
                                disabled={isExpired}
                                className={isExpired ? "opacity-30 cursor-not-allowed" : member.is_frozen ? "text-blue-500" : "text-muted-foreground"}
                              >
                                <Snowflake className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost" size="icon"
                                title="Renew membership"
                                onClick={() => handleRenew(member)}
                                className="text-green-500"
                              >
                                <CalendarClock className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Load More Section */}
              <div ref={sentinelRef} className="flex flex-col items-center gap-2 pt-4">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading more members...
                  </div>
                )}
                {hasMore && !loadingMore && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadMore}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Load more members
                  </Button>
                )}
                {!hasMore && members.length > 0 && (
                  <p className="text-sm text-muted-foreground py-2">
                    All members loaded
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{searchQuery ? "No members match your search." : "No members yet."}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
            <DialogDescription>Fill in the member details. Benefits will auto-fill when you select a plan.</DialogDescription>
          </DialogHeader>
          <MemberFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSubmit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={!!editingMember} onOpenChange={(open) => { if (!open) setEditingMember(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>Update {editingMember?.name}&apos;s membership details and remaining benefits.</DialogDescription>
          </DialogHeader>
          {editingMember && (
            <>
              <MemberFormFields />
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Freeze Membership</p>
                    <p className="text-xs text-muted-foreground">Pauses membership countdown</p>
                  </div>
                  <Switch
                    checked={editingMember.is_frozen}
                    onCheckedChange={async (checked) => {
                      const { data, error } = await supabase.from("members").update({ is_frozen: checked }).eq("id", editingMember.id).select().single();
                      if (!error) {
                        setEditingMember(data);
                        setMembers((prev) => prev.map((m) => m.id === editingMember.id ? data : m));
                        fetchCounts();
                      }
                    }}
                  />
                </div>
              </div>
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMember(null)}>Cancel</Button>
            <Button onClick={handleEditSubmit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
