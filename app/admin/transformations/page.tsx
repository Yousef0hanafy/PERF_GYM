"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface Transformation {
  id: string;
  name: string;
  duration: string;
  before_image: string;
  after_image: string;
}

const emptyForm = { name: "", duration: "", before_image: "", after_image: "" };

export default function TransformationsPage() {
  const [items, setItems] = useState<Transformation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Transformation | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const supabase = createClient();

  const fetchTransformations = async () => {
    const { data, error } = await supabase
      .from("transformations")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      toast.error("Failed to load transformations");
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransformations();
  }, []);

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: Transformation) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      duration: item.duration,
      before_image: item.before_image,
      after_image: item.after_image,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.duration || !formData.before_image || !formData.after_image) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);

    if (editingItem) {
      const { data, error } = await supabase
        .from("transformations")
        .update(formData)
        .eq("id", editingItem.id)
        .select()
        .single();

      if (error) {
        toast.error(`Failed to update: ${error.message}`);
      } else {
        setItems((prev) => prev.map((t) => (t.id === editingItem.id ? data : t)));
        toast.success("Transformation updated");
        setIsDialogOpen(false);
      }
    } else {
      const { data, error } = await supabase
        .from("transformations")
        .insert([formData])
        .select()
        .single();

      if (error) {
        toast.error(`Failed to add: ${error.message}`);
      } else {
        setItems((prev) => [...prev, data]);
        toast.success("Transformation added");
        setFormData(emptyForm);
        setIsDialogOpen(false);
      }
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transformation?")) return;

    const { error } = await supabase.from("transformations").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      setItems((prev) => prev.filter((t) => t.id !== id));
      toast.success("Transformation deleted");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transformations</h1>
          <p className="text-muted-foreground mt-1">
            Manage before/after transformation stories.
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Transformation
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No transformations yet. Add your first member transformation story.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>{item.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{item.duration}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => openEditDialog(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Before</p>
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={item.before_image}
                          alt={`${item.name} before`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/200x200?text=Before";
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-primary font-medium uppercase tracking-wide">After</p>
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={item.after_image}
                          alt={`${item.name} after`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/200x200?text=After";
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Transformation" : "Add Transformation"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Member Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Ahmed M."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration *</label>
                <Input
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 6 Months"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Before Image URL *</label>
              <Input
                value={formData.before_image}
                onChange={(e) => setFormData({ ...formData, before_image: e.target.value })}
                placeholder="https://example.com/before.jpg"
              />
              {formData.before_image && (
                <div className="h-24 rounded-lg overflow-hidden bg-muted">
                  <img src={formData.before_image} alt="Before preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">After Image URL *</label>
              <Input
                value={formData.after_image}
                onChange={(e) => setFormData({ ...formData, after_image: e.target.value })}
                placeholder="https://example.com/after.jpg"
              />
              {formData.after_image && (
                <div className="h-24 rounded-lg overflow-hidden bg-muted">
                  <img src={formData.after_image} alt="After preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingItem ? "Save Changes" : "Add Transformation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
