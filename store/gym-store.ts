"use client";

import { create } from "zustand";
import type {
  MembershipPlan,
  GalleryImage,
  Testimonial,
  Transformation,
  Member,
  BookingRequest,
  Stats,
} from "@/types";

interface GymStore {
  // Data
  memberships: MembershipPlan[];
  gallery: GalleryImage[];
  testimonials: Testimonial[];
  transformations: Transformation[];
  members: Member[];
  bookingRequests: BookingRequest[];
  stats: Stats;

  // Membership Actions
  addMembership: (plan: MembershipPlan) => void;
  updateMembership: (id: string, plan: Partial<MembershipPlan>) => void;
  deleteMembership: (id: string) => void;
  toggleFeatured: (id: string) => void;

  // Gallery Actions
  addGalleryImage: (image: GalleryImage) => void;
  deleteGalleryImage: (id: string) => void;
  reorderGallery: (images: GalleryImage[]) => void;

  // Transformation Actions
  addTransformation: (transformation: Transformation) => void;
  updateTransformation: (
    id: string,
    transformation: Partial<Transformation>
  ) => void;
  deleteTransformation: (id: string) => void;

  // Testimonial Actions
  addTestimonial: (testimonial: Testimonial) => void;
  updateTestimonial: (id: string, testimonial: Partial<Testimonial>) => void;
  deleteTestimonial: (id: string) => void;

  // Member Actions
  addMember: (member: Member) => void;
  updateMember: (id: string, member: Partial<Member>) => void;

  // Booking Actions
  addBookingRequest: (request: BookingRequest) => void;
  updateBookingStatus: (
    id: string,
    status: BookingRequest["status"]
  ) => void;

  // Stats Actions
  updateStats: (stats: Partial<Stats>) => void;
}

const initialMemberships: MembershipPlan[] = [
  {
    id: "monthly",
    name: "Monthly Package",
    duration: "1 Month",
    price: 1600,
    currency: "L.E",
    features: [
      "5 Invitations to anybody over 18 years",
      "1 Orientation session on machines",
      "1 Kickboxing Session",
      "Unlimited access to spa (Sauna, Steam, Ice pool and Jacuzzi)",
    ],
    featured: false,
    invitations: 5,
    freezeWeeks: 0,
    ptSessions: 0,
    bodyAssessments: 0,
    kickboxingSessions: 1,
    spaAccess: true,
    physiotherapy: false,
  },
  {
    id: "quarter",
    name: "Quarter Package",
    duration: "3 Months",
    price: 3200,
    currency: "L.E",
    features: [
      "10 Invitations to anybody over 18 years",
      "2 Weeks Freeze",
      "1 Physiotherapy oral session",
      "2 Sessions PT",
      "1 Body Assessment",
      "2 Kickboxing Sessions",
      "Unlimited access to spa (Sauna, Steam, Ice pool and Jacuzzi)",
    ],
    featured: false,
    invitations: 10,
    freezeWeeks: 2,
    ptSessions: 2,
    bodyAssessments: 1,
    kickboxingSessions: 2,
    spaAccess: true,
    physiotherapy: true,
  },
  {
    id: "semi-annual",
    name: "Semi Annual Membership",
    duration: "6 Months",
    price: 4500,
    currency: "L.E",
    features: [
      "18 Invitations to anybody over 18 years",
      "5 Weeks Freeze (month and a week)",
      "1 Physiotherapy oral session",
      "3 Sessions Personal Trainer",
      "2 Body Assessment",
      "2 Kickboxing Sessions",
      "Unlimited access to spa (Sauna, Steam, Ice pool and Jacuzzi)",
    ],
    featured: true,
    invitations: 18,
    freezeWeeks: 5,
    ptSessions: 3,
    bodyAssessments: 2,
    kickboxingSessions: 2,
    spaAccess: true,
    physiotherapy: true,
  },
  {
    id: "annual",
    name: "Annual Membership Package",
    duration: "12 Months",
    price: 6600,
    currency: "L.E",
    features: [
      "28 Invitations to anybody over 18 years",
      "1 Physiotherapy oral session",
      "12 Weeks Freeze (3 months)",
      "5 Sessions Personal Trainer",
      "4 Body Assessment (InBody)",
      "2 Kickboxing Sessions",
      "Unlimited access to spa (Sauna, Steam, Ice pool and Jacuzzi)",
    ],
    featured: false,
    invitations: 28,
    freezeWeeks: 12,
    ptSessions: 5,
    bodyAssessments: 4,
    kickboxingSessions: 2,
    spaAccess: true,
    physiotherapy: true,
  },
];

const initialGallery: GalleryImage[] = [
  {
    id: "1",
    url: "/images/gallery/gym-1.jpg",
    alt: "Main gym floor with equipment",
    order: 1,
  },
  {
    id: "2",
    url: "/images/gallery/gym-2.jpg",
    alt: "Weight training area",
    order: 2,
  },
  {
    id: "3",
    url: "/images/gallery/gym-3.jpg",
    alt: "Cardio section",
    order: 3,
  },
  {
    id: "4",
    url: "/images/gallery/gym-4.jpg",
    alt: "Spa and wellness area",
    order: 4,
  },
  {
    id: "5",
    url: "/images/gallery/gym-5.jpg",
    alt: "Kickboxing studio",
    order: 5,
  },
  {
    id: "6",
    url: "/images/gallery/gym-6.jpg",
    alt: "Personal training area",
    order: 6,
  },
];

const initialTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Ahmed Hassan",
    avatar: "/images/testimonials/avatar-1.jpg",
    membershipPlan: "Annual Membership",
    rating: 5,
    review:
      "Best gym in the area! The trainers are incredibly knowledgeable and the facilities are top-notch. I've seen amazing results in just 6 months.",
  },
  {
    id: "2",
    name: "Sara Mohamed",
    avatar: "/images/testimonials/avatar-2.jpg",
    membershipPlan: "Semi Annual",
    rating: 5,
    review:
      "The spa facilities are amazing! After every workout, I love relaxing in the sauna. The staff is friendly and always helpful.",
  },
  {
    id: "3",
    name: "Omar Khaled",
    avatar: "/images/testimonials/avatar-3.jpg",
    membershipPlan: "Quarter Package",
    rating: 4,
    review:
      "Great equipment and clean facilities. The kickboxing sessions are intense and fun. Highly recommend for anyone looking to get fit!",
  },
];

const initialTransformations: Transformation[] = [
  {
    id: "1",
    title: "12 Week Transformation",
    description: "Lost 15kg and gained muscle definition",
    beforeImage: "/images/transformations/before-1.jpg",
    afterImage: "/images/transformations/after-1.jpg",
  },
  {
    id: "2",
    title: "6 Month Journey",
    description: "Complete body recomposition",
    beforeImage: "/images/transformations/before-2.jpg",
    afterImage: "/images/transformations/after-2.jpg",
  },
];

const initialStats: Stats = {
  activeMembers: 1500,
  expertTrainers: 25,
  spaceSize: 1800,
};

export const useGymStore = create<GymStore>((set) => ({
  memberships: initialMemberships,
  gallery: initialGallery,
  testimonials: initialTestimonials,
  transformations: initialTransformations,
  members: [],
  bookingRequests: [],
  stats: initialStats,

  // Membership Actions
  addMembership: (plan) =>
    set((state) => ({ memberships: [...state.memberships, plan] })),
  updateMembership: (id, plan) =>
    set((state) => ({
      memberships: state.memberships.map((m) =>
        m.id === id ? { ...m, ...plan } : m
      ),
    })),
  deleteMembership: (id) =>
    set((state) => ({
      memberships: state.memberships.filter((m) => m.id !== id),
    })),
  toggleFeatured: (id) =>
    set((state) => ({
      memberships: state.memberships.map((m) =>
        m.id === id ? { ...m, featured: !m.featured } : m
      ),
    })),

  // Gallery Actions
  addGalleryImage: (image) =>
    set((state) => ({ gallery: [...state.gallery, image] })),
  deleteGalleryImage: (id) =>
    set((state) => ({
      gallery: state.gallery.filter((g) => g.id !== id),
    })),
  reorderGallery: (images) => set({ gallery: images }),

  // Transformation Actions
  addTransformation: (transformation) =>
    set((state) => ({
      transformations: [...state.transformations, transformation],
    })),
  updateTransformation: (id, transformation) =>
    set((state) => ({
      transformations: state.transformations.map((t) =>
        t.id === id ? { ...t, ...transformation } : t
      ),
    })),
  deleteTransformation: (id) =>
    set((state) => ({
      transformations: state.transformations.filter((t) => t.id !== id),
    })),

  // Testimonial Actions
  addTestimonial: (testimonial) =>
    set((state) => ({
      testimonials: [...state.testimonials, testimonial],
    })),
  updateTestimonial: (id, testimonial) =>
    set((state) => ({
      testimonials: state.testimonials.map((t) =>
        t.id === id ? { ...t, ...testimonial } : t
      ),
    })),
  deleteTestimonial: (id) =>
    set((state) => ({
      testimonials: state.testimonials.filter((t) => t.id !== id),
    })),

  // Member Actions
  addMember: (member) =>
    set((state) => ({ members: [...state.members, member] })),
  updateMember: (id, member) =>
    set((state) => ({
      members: state.members.map((m) =>
        m.id === id ? { ...m, ...member } : m
      ),
    })),

  // Booking Actions
  addBookingRequest: (request) =>
    set((state) => ({
      bookingRequests: [...state.bookingRequests, request],
    })),
  updateBookingStatus: (id, status) =>
    set((state) => ({
      bookingRequests: state.bookingRequests.map((r) =>
        r.id === id ? { ...r, status } : r
      ),
    })),

  // Stats Actions
  updateStats: (stats) =>
    set((state) => ({ stats: { ...state.stats, ...stats } })),
}));
