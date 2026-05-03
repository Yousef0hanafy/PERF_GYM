"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Star, Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import type { SupabaseMembershipPlan } from "@/types";

const emptyForm = {
  name: "",
  duration: "",
  price: "",
  features: "",
  invitations: "0",
  pt_sessions: "0",
  body_assessments: "0",
  kickboxing_sessions: "0",
  freeze_weeks: "0",
};

export default function MembershipsPage() {
  const [plans, setPlans] = useState<SupabaseMembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SupabaseMembershipPlan | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const supabase = createClient();

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from("membership_plans")
      .select("*")
      .order("price", { ascending: true });
    if (error) toast.error("Failed to load plans");
    else setPlans(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPlans(); }, []);

  const openCreateDialog = () => {
    setEditingPlan(null);
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  const openEditDialog = (plan: SupabaseMembershipPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      duration: plan.duration,
      price: plan.price.toString(),
      features: (plan.features || []).join("\n"),
      invitations: (plan.invitations ?? 0).toString(),
      pt_sessions: (plan.pt_sessions ?? 0).toString(),
      body_assessments: (plan.body_assessments ?? 0).toString(),
      kickboxing_sessions: (plan.kickboxing_sessions ?? 0).toString(),
      freeze_weeks: (plan.freeze_weeks ?? 0).toString(),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.duration.trim() || !formData.price) {
      toast.error("Name, duration, and price are required");
      return;
    }
    setSubmitting(true);
    const payload = {
      name: formData.name.trim(),
      duration: formData.duration.trim(),
      price: parseFloat(formData.price),
      features: formData.features.split("\n").map((f) => f.trim()).filter(Boolean),
      invitations: parseInt(formData.invitations) || 0,
      pt_sessions: parseInt(formData.pt_sessions) || 0,
      body_assessments: parseInt(formData.body_assessments) || 0,
      kickboxing_sessions: parseInt(formData.kickboxing_sessions) || 0,
      freeze_weeks: parseInt(formData.freeze_weeks) || 0,
    };

    if (editingPlan) {
      const { data, error } = await supabase.from("membership_plans").update(payload).eq("id", editingPlan.id).select().single();
      if (error) { toast.error(`Failed to update: ${error.message}`); setSubmitting(false); return; }

      // Sync all members on this plan to the new benefit values
      const syncPayload = {
        invitations_left: payload.invitations,
        pt_sessions_left: payload.pt_sessions,
        body_assessments_left: payload.body_assessments,
        kickboxing_sessions_left: payload.kickboxing_sessions,
      };
      const { data: synced } = await supabase
        .from("members")
        .update(syncPayload)
        .eq("plan_id", editingPlan.id)
        .select("id");

      const syncedCount = synced?.length ?? 0;
      setPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? data : p)));
      toast.success(
        syncedCount > 0
          ? `Plan updated — ${syncedCount} member${syncedCount > 1 ? "s" : ""} synced automatically`
          : "Plan updated"
      );
      setIsDialogOpen(false);
    } else {
      const { data, error } = await supabase.from("membership_plans").insert([{ ...payload, is_featured: false }]).select().single();
      if (error) toast.error(`Failed to create: ${error.message}`);
      else { setPlans((prev) => [...prev, data]); toast.success("Plan created"); setIsDialogOpen(false); }
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this membership plan?")) return;
    const { error } = await supabase.from("membership_plans").delete().eq("id", id);
    if (error) toast.error("Failed to delete plan");
    else { setPlans((prev) => prev.filter((p) => p.id !== id)); toast.success("Plan deleted"); }
  };

  const toggleFeatured = async (plan: SupabaseMembershipPlan) => {
    const { data, error } = await supabase.from("membership_plans").update({ is_featured: !plan.is_featured }).eq("id", plan.id).select().single();
    if (error) toast.error("Failed to update featured status");
    else setPlans((prev) => prev.map((p) => (p.id === plan.id ? data : p)));
  };

  const numField = (label: string, key: keyof typeof emptyForm) => (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <Input type="number" min="0" value={formData[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Membership Plans</h1>
          <p className="text-muted-foreground mt-1">Changes are saved directly to the database.</p>
        </div>
        <Button onClick={openCreateDialog}><Plus className="h-4 w-4 mr-2" />Add Plan</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map((i) => <Skeleton key={i} className="h-56 w-full rounded-xl" />)}
        </div>
      ) : plans.length === 0 ? (
        <p className="text-center py-20 text-muted-foreground">No plans yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan, index) => (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className={plan.is_featured ? "border-primary" : ""}>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {plan.name}
                      {plan.is_featured && <Badge className="bg-primary"><Star className="h-3 w-3 mr-1 fill-current" />Featured</Badge>}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{plan.duration}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => openEditDialog(plan)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(plan.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-3">{plan.price.toLocaleString()} L.E</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-3 text-muted-foreground">
                    <span>Invitations: <strong className="text-foreground">{plan.invitations ?? 0}</strong></span>
                    <span>Orientation: <strong className="text-foreground">{plan.pt_sessions ?? 0}</strong></span>
                    <span>Body Assessments: <strong className="text-foreground">{plan.body_assessments ?? 0}</strong></span>
                    <span>Kickboxing: <strong className="text-foreground">{plan.kickboxing_sessions ?? 0}</strong></span>
                    <span>Freeze Weeks: <strong className="text-foreground">{plan.freeze_weeks ?? 0}</strong></span>
                  </div>
                  <div className="space-y-1 mb-4">
                    {(plan.features || []).slice(0, 3).map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{f}</span>
                      </div>
                    ))}
                    {(plan.features || []).length > 3 && <p className="text-sm text-muted-foreground pl-6">+{plan.features.length - 3} more</p>}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-sm text-muted-foreground">Featured Plan</span>
                    <Switch checked={!!plan.is_featured} onCheckedChange={() => toggleFeatured(plan)} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingPlan ? "Edit Plan" : "Create New Plan"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Plan Name *</label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Monthly" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Duration *</label>
                <Input value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g., 1 Month" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Price (L.E) *</label>
                <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="1600" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Features (one per line)</label>
              <Textarea value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} rows={4} placeholder="Full gym access&#10;Locker room&#10;Free parking" />
            </div>
            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-1">Member Benefits</p>
              <p className="text-xs text-muted-foreground mb-3">Auto-filled when a member is added with this plan.</p>
              <div className="grid grid-cols-2 gap-3">
                {numField("Guest Invitations (18+)", "invitations")}
                {numField("Orientation Sessions", "pt_sessions")}
                {numField("Body Assessments", "body_assessments")}
                {numField("Kickboxing Sessions", "kickboxing_sessions")}
                {numField("Freeze Weeks", "freeze_weeks")}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingPlan ? "Save Changes" : "Create Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
