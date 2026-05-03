"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Send,
  Phone,
  Clock,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    details: ["+20 111 697 3238"],
  },
  {
    icon: Clock,
    title: "Working Hours",
    details: ["All Week", "5:00 AM - 3:00 AM"],
  },
  {
    icon: MapPin,
    title: "Location",
    details: ["Performance Gym", "Egypt"],
  },
];

export function ContactSection() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (data: ContactFormData) => {
    // Create WhatsApp message for contact
    const message = `Contact Message

Name: ${data.name}
Email: ${data.email}
Subject: ${data.subject}
Message: ${data.message}`;

    const whatsappUrl = `https://wa.me/201116973238?text=${encodeURIComponent(
      message
    )}`;

    setIsSubmitted(true);

    setTimeout(() => {
      window.open(whatsappUrl, "_blank");
    }, 1500);

    setTimeout(() => {
      form.reset();
      setIsSubmitted(false);
    }, 5000);
  };

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold mb-2 block">
            Get in Touch
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Contact Us
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Have questions? We&apos;d love to hear from you. Send us a message
            and we&apos;ll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardContent className="p-6">
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-8"
                  >
                    <Alert className="border-primary/50 bg-primary/10">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <AlertTitle className="text-primary">
                        Message Sent!
                      </AlertTitle>
                      <AlertDescription>
                        Thank you for reaching out. Redirecting to WhatsApp...
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                ) : (
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="your@email.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                              <Input placeholder="How can we help?" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Your message..."
                                className="min-h-32"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full" size="lg">
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Info & Map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Contact Info Cards */}
            <div className="grid gap-4">
              {contactInfo.map((info, index) => (
                <Card key={info.title} className="bg-secondary">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <info.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{info.title}</h4>
                      {info.details.map((detail, i) => (
                        <p key={i} className="text-muted-foreground text-sm">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/Performance.gym1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Card className="bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <span className="font-semibold text-primary">Facebook</span>
                  </CardContent>
                </Card>
              </a>
              <a
                href="https://www.instagram.com/performance_gym__"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Card className="bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <span className="font-semibold text-primary">Instagram</span>
                  </CardContent>
                </Card>
              </a>
            </div>

            {/* Map Placeholder */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <a
                  href="https://maps.app.goo.gl/MU8dpoJ3yE9tg5TWA"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="h-64 bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors cursor-pointer">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        Click to view on Google Maps
                      </p>
                    </div>
                  </div>
                </a>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
