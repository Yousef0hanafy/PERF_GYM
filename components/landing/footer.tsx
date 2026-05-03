"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Clock, MapPin, Facebook, Instagram } from "lucide-react";

const footerLinks = [
  { href: "#services", label: "Services" },
  { href: "#gallery", label: "Gallery" },
  { href: "#pricing", label: "Pricing" },
];

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                <Image
                  src="/logo.png"
                  alt="Performance Gym Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-bold text-foreground">
                Performance <span className="text-primary">Gym</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Where ambition becomes achievement. 1,800m² of elite equipment,
              luxury spa recovery, and world-class coaching — all under one roof since 2022.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground tracking-wide">Explore</h4>
            <nav className="flex flex-col gap-2">
              {footerLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/portal"
                className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
              >
                Member Access
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground tracking-wide">Contact</h4>
            <div className="space-y-3">
              <a
                href="tel:+201116973238"
                className="flex items-start gap-3 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                <Phone className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span>+20 111 697 3238</span>
              </a>
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <div>
                  <p>Open All Week</p>
                  <p className="font-medium">5:00 AM – 3:00 AM</p>
                </div>
              </div>
              <a
                href="https://maps.app.goo.gl/MU8dpoJ3yE9tg5TWA"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span>Performance Gym, Egypt</span>
              </a>
            </div>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground tracking-wide">Follow Us</h4>
            <div className="flex flex-col gap-3">
              <a
                href="https://www.facebook.com/Performance.gym1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                <Facebook className="h-5 w-5 text-primary" />
                <span>Performance.gym1</span>
              </a>
              <a
                href="https://www.instagram.com/performance_gym__"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                <Instagram className="h-5 w-5 text-primary" />
                <span>@performance_gym__</span>
              </a>
            </div>

            <a
              href="https://maps.app.goo.gl/MU8dpoJ3yE9tg5TWA"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-primary hover:underline mt-4"
            >
              <MapPin className="h-4 w-4" />
              Open in Google Maps
            </a>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Performance Gym. Built for champions. All rights reserved.
          </p>
          <p className="text-muted-foreground/50 text-xs">
            Developed by{" "}
            <a
              href="https://www.linkedin.com/in/youssef-hanafy-7986342a8"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground/70 font-medium hover:text-primary transition-colors duration-300 hover:underline underline-offset-4"
            >
              Youssef Hanafy
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
