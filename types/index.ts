export interface MembershipPlan {
  id: string;
  name: string;
  duration: string;
  price: number;
  currency: string;
  features: string[];
  featured: boolean;
  invitations: number;
  freezeWeeks: number;
  ptSessions: number;
  bodyAssessments: number;
  kickboxingSessions: number;
  spaAccess: boolean;
  physiotherapy: boolean;
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  membershipPlan: string;
  rating: number;
  review: string;
}

export interface Transformation {
  id: string;
  title: string;
  description: string;
  beforeImage: string;
  afterImage: string;
}

export interface Member {
  id: string;
  member_id: string;
  name: string;
  phone: string;
  email: string | null;
  plan_id: string | null;
  start_date: string;
  end_date: string;
  is_frozen: boolean;
  date_of_birth: string | null;
  invitations_left: number;
  pt_sessions_left: number;
  body_assessments_left: number;
  kickboxing_sessions_left: number;
}

export interface SupabaseMembershipPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  is_featured: boolean;
  invitations: number;
  pt_sessions: number;
  body_assessments: number;
  kickboxing_sessions: number;
  freeze_weeks: number;
}

export interface BookingRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  membershipPlanId: string;
  createdAt: string;
  status: 'pending' | 'contacted' | 'converted';
}

export interface Stats {
  activeMembers: number;
  expertTrainers: number;
  spaceSize: number;
}
