"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, GripVertical, Loader2 } from "lucide-react";
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

interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
  display_order: number;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ url: "", alt: "" });

  const supabase = createClient();

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) {
      toast.error("Failed to load gallery images");
    } else {
      setImages(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleSubmit = async () => {
    if (!formData.url.trim()) {
      toast.error("Image URL is required");
      return;
    }
    setSubmitting(true);

    const maxOrder = images.length > 0 ? Math.max(...images.map((i) => i.display_order)) : 0;

    const { data, error } = await supabase
      .from("gallery_images")
      .insert([{ url: formData.url.trim(), alt: formData.alt.trim() || null, display_order: maxOrder + 1 }])
      .select()
      .single();

    if (error) {
      toast.error(`Failed to add image: ${error.message}`);
    } else {
      setImages((prev) => [...prev, data]);
      toast.success("Image added to gallery");
      setFormData({ url: "", alt: "" });
      setIsDialogOpen(false);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this image from the gallery?")) return;

    const { error } = await supabase.from("gallery_images").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete image");
    } else {
      setImages((prev) => prev.filter((img) => img.id !== id));
      toast.success("Image deleted");
    }
  };

  const moveImage = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updated = [...images];
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    const reordered = updated.map((img, i) => ({ ...img, display_order: i + 1 }));
    setImages(reordered);

    await Promise.all(
      reordered.map((img) =>
        supabase.from("gallery_images").update({ display_order: img.display_order }).eq("id", img.id)
      )
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gallery Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage gym photos displayed on the landing page.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Image
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gallery Images ({images.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
            </div>
          ) : images.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No images in gallery. Add some to display on the landing page.
            </p>
          ) : (
            <div className="space-y-4">
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-secondary rounded-lg"
                >
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => moveImage(index, "up")}
                      disabled={index === 0}
                      className="p-1 hover:bg-background rounded disabled:opacity-30"
                    >
                      <GripVertical className="h-4 w-4 rotate-180" />
                    </button>
                    <button
                      onClick={() => moveImage(index, "down")}
                      disabled={index === images.length - 1}
                      className="p-1 hover:bg-background rounded disabled:opacity-30"
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                    <img
                      src={image.url}
                      alt={image.alt || "Gallery image"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/80x80?text=Error";
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{image.alt || "(no description)"}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">#{image.display_order}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(image.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Gallery Image</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL *</label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            {formData.url && (
              <div className="rounded-lg overflow-hidden bg-muted h-40">
                <img
                  src={formData.url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/400x160?text=Invalid+URL";
                  }}
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description / Alt Text</label>
              <Input
                value={formData.alt}
                onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                placeholder="e.g., Main gym floor with equipment"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
