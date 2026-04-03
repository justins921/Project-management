export type ServiceType = 'Web Design' | 'SEO' | 'Social Media Marketing' | 'Branding' | 'Content Marketing' | 'PPC Advertising';

export type ProjectStatus = 'Active' | 'Completed' | 'On Hold' | 'Pending';

export type Platform = 'WordPress' | 'Shopify' | 'Webflow' | 'Squarespace' | 'Custom' | 'Wix' | 'Other';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
}

export interface Client {
  id: string;
  name: string;
  contactName: string;
  contactEmail: string;
  phone?: string;
  company?: string;
  notes?: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  service: ServiceType;
  status: ProjectStatus;
  platform: Platform;
  hostingLocation: string;
  startDate: string;
  endDate: string;
  teamMemberIds: string[];
  contractUrl?: string;
  description?: string;
  budget?: number;
}
