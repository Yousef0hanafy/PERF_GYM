"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const message = "Hello! I'm interested in joining Performance Gym. Can you provide more information?";
  const url = `https://wa.me/201116973238?text=${encodeURIComponent(message)}`;

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2, type: "spring", stiffness: 200, damping: 15 }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] text-white rounded-full shadow-lg shadow-[#25D366]/30 overflow-hidden group"
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <MessageCircle className="h-6 w-6 shrink-0 fill-white" />
        <motion.span
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "auto", opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.3 }}
          className="text-sm font-semibold whitespace-nowrap overflow-hidden"
        >
          Chat with us
        </motion.span>
      </div>
    </motion.a>
  );
}
