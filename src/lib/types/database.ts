// Database types matching the Supabase schema
// These are used throughout the app for type safety

export type UserRole = 'owner' | 'freelancer' | 'client';
export type ClientStatus = 'active' | 'onboarding' | 'paused' | 'churned';
export type FreelancerStatus = 'active' | 'on-deck' | 'inactive' | 'pending';
export type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'pending';
export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
export type RequestStatus = 'incoming' | 'in_progress' | 'done';
export type SOPStatusDb = 'draft' | 'active' | 'under_review' | 'archived';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
export type ClientRequestStatus = 'pending' | 'in_progress' | 'completed';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  tenant_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  owner_id: string;
  agency_name: string;
  agency_logo_url: string | null;
  owner_name: string;
  owner_email: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_subscription_status: string;
  google_pagespeed_api_key: string | null;
  resend_api_key: string | null;
  notification_preferences: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  tenant_id: string;
  business_name: string;
  contact_name: string;
  contact_email: string;
  phone: string | null;
  website_url: string | null;
  platform: string;
  services: string[];
  status: ClientStatus;
  retainer_amount: number;
  billing_day: number;
  contract_url: string | null;
  notes: string | null;
  portal_user_id: string | null;
  portal_invite_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface OnboardingItem {
  id: string;
  client_id: string;
  tenant_id: string;
  title: string;
  is_completed: boolean;
  completed_at: string | null;
  sort_order: number;
  created_at: string;
}

export interface FreelancerProfile {
  id: string;
  tenant_id: string;
  role_title: string;
  hourly_rate: number | null;
  flat_rate: number | null;
  skills: string[];
  status: FreelancerStatus;
  bio: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  profile?: Profile;
}

export interface Project {
  id: string;
  tenant_id: string;
  client_id: string;
  name: string;
  service: string;
  status: ProjectStatus;
  platform: string;
  hosting_location: string | null;
  start_date: string;
  end_date: string;
  description: string | null;
  budget: number | null;
  contract_url: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  client?: Client;
}

export type TaskPriority = 1 | 2 | 3 | 4; // 1=urgent, 2=high, 3=medium, 4=low

export interface Task {
  id: string;
  tenant_id: string;
  client_id: string | null;
  project_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  assigned_to: string | null;
  completed_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Joined
  client?: Client;
  project?: Project;
  assignee?: Profile;
}

export interface ClientRequest {
  id: string;
  tenant_id: string;
  client_id: string;
  submitted_by: string | null;
  title: string;
  description: string | null;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
}

export interface SiteHealth {
  id: string;
  tenant_id: string;
  client_id: string;
  url: string;
  performance_score: number | null;
  accessibility_score: number | null;
  seo_score: number | null;
  best_practices_score: number | null;
  is_up: boolean;
  last_checked_at: string | null;
  raw_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface MonthlyReport {
  id: string;
  tenant_id: string;
  client_id: string;
  month: number;
  year: number;
  site_health_snapshot: Record<string, unknown> | null;
  tasks_completed: Record<string, unknown>[] | null;
  open_requests: number;
  owner_notes: string | null;
  share_token: string;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: string;
  tenant_id: string;
  client_id: string;
  created_by: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  // Joined
  client?: { id: string; business_name: string };
  creator?: Profile;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  is_internal: boolean;
  created_at: string;
  // Joined
  sender?: Profile;
}

export interface ClientRequestRecord {
  id: string;
  tenant_id: string;
  client_id: string;
  title: string;
  description: string | null;
  status: ClientRequestStatus;
  attachment_url: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  client?: { id: string; business_name: string };
}

export interface ActivityLog {
  id: string;
  tenant_id: string;
  actor_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  // Joined
  actor?: Profile;
}
