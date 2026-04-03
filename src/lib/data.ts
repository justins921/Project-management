import { Client, Project, TeamMember } from './types';

export const teamMembers: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'Sarah Chen',
    role: 'Lead Designer',
    email: 'sarah@agency.com',
    avatar: 'SC',
  },
  {
    id: 'tm-2',
    name: 'Marcus Johnson',
    role: 'SEO Specialist',
    email: 'marcus@agency.com',
    avatar: 'MJ',
  },
  {
    id: 'tm-3',
    name: 'Emily Rodriguez',
    role: 'Social Media Manager',
    email: 'emily@agency.com',
    avatar: 'ER',
  },
  {
    id: 'tm-4',
    name: 'David Kim',
    role: 'Full Stack Developer',
    email: 'david@agency.com',
    avatar: 'DK',
  },
  {
    id: 'tm-5',
    name: 'Lisa Patel',
    role: 'Project Manager',
    email: 'lisa@agency.com',
    avatar: 'LP',
  },
  {
    id: 'tm-6',
    name: 'James Wright',
    role: 'Content Strategist',
    email: 'james@agency.com',
    avatar: 'JW',
  },
];

export const clients: Client[] = [
  {
    id: 'cl-1',
    name: 'Oakwood Dental',
    contactName: 'Dr. Robert Hayes',
    contactEmail: 'robert@oakwooddental.com',
    phone: '(555) 234-5678',
    company: 'Oakwood Dental Group',
  },
  {
    id: 'cl-2',
    name: 'Bloom & Barrel',
    contactName: 'Jessica Torres',
    contactEmail: 'jessica@bloombarrel.com',
    phone: '(555) 345-6789',
    company: 'Bloom & Barrel Restaurant Group',
  },
  {
    id: 'cl-3',
    name: 'Summit Realty',
    contactName: 'Michael Chang',
    contactEmail: 'mchang@summitrealty.com',
    phone: '(555) 456-7890',
    company: 'Summit Realty Partners',
  },
  {
    id: 'cl-4',
    name: 'Ironclad Fitness',
    contactName: 'Amanda Brooks',
    contactEmail: 'amanda@ironcladfitness.com',
    phone: '(555) 567-8901',
    company: 'Ironclad Fitness LLC',
  },
  {
    id: 'cl-5',
    name: 'Verde Landscaping',
    contactName: 'Carlos Mendez',
    contactEmail: 'carlos@verdelandscaping.com',
    phone: '(555) 678-9012',
    company: 'Verde Landscaping Co.',
  },
  {
    id: 'cl-6',
    name: 'Pinnacle Law',
    contactName: 'Rachel Foster',
    contactEmail: 'rfoster@pinnaclelaw.com',
    phone: '(555) 789-0123',
    company: 'Pinnacle Law Group',
  },
];

export const projects: Project[] = [
  {
    id: 'pr-1',
    name: 'Oakwood Dental Website Redesign',
    clientId: 'cl-1',
    service: 'Web Design',
    status: 'Active',
    platform: 'WordPress',
    hostingLocation: 'SiteGround',
    startDate: '2026-01-15',
    endDate: '2026-04-30',
    teamMemberIds: ['tm-1', 'tm-4', 'tm-5'],
    description: 'Complete website redesign with online booking integration and patient portal.',
    budget: 12000,
  },
  {
    id: 'pr-2',
    name: 'Bloom & Barrel SEO Campaign',
    clientId: 'cl-2',
    service: 'SEO',
    status: 'Active',
    platform: 'Squarespace',
    hostingLocation: 'Squarespace',
    startDate: '2026-02-01',
    endDate: '2026-07-31',
    teamMemberIds: ['tm-2', 'tm-5'],
    description: 'Local SEO optimization for 3 restaurant locations. Target: top 3 rankings for key terms.',
    budget: 8000,
  },
  {
    id: 'pr-3',
    name: 'Summit Realty Social Media',
    clientId: 'cl-3',
    service: 'Social Media Marketing',
    status: 'Active',
    platform: 'Custom',
    hostingLocation: 'AWS',
    startDate: '2026-03-01',
    endDate: '2026-08-31',
    teamMemberIds: ['tm-3', 'tm-6', 'tm-5'],
    description: 'Full social media management across Instagram, Facebook, and LinkedIn for property listings.',
    budget: 15000,
  },
  {
    id: 'pr-4',
    name: 'Ironclad Fitness E-Commerce',
    clientId: 'cl-4',
    service: 'Web Design',
    status: 'Pending',
    platform: 'Shopify',
    hostingLocation: 'Shopify',
    startDate: '2026-04-15',
    endDate: '2026-07-15',
    teamMemberIds: ['tm-1', 'tm-4'],
    description: 'New Shopify store for merchandise and supplement sales with subscription model.',
    budget: 18000,
  },
  {
    id: 'pr-5',
    name: 'Verde Landscaping Website',
    clientId: 'cl-5',
    service: 'Web Design',
    status: 'Completed',
    platform: 'Webflow',
    hostingLocation: 'Webflow',
    startDate: '2025-10-01',
    endDate: '2026-01-31',
    teamMemberIds: ['tm-1', 'tm-4', 'tm-5'],
    description: 'Portfolio website with service area maps and quote request system.',
    budget: 9500,
  },
  {
    id: 'pr-6',
    name: 'Pinnacle Law Content Marketing',
    clientId: 'cl-6',
    service: 'Content Marketing',
    status: 'Active',
    platform: 'WordPress',
    hostingLocation: 'WP Engine',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    teamMemberIds: ['tm-2', 'tm-6'],
    description: 'Blog content strategy, legal guides, and thought leadership articles.',
    budget: 7500,
  },
  {
    id: 'pr-7',
    name: 'Oakwood Dental SEO',
    clientId: 'cl-1',
    service: 'SEO',
    status: 'On Hold',
    platform: 'WordPress',
    hostingLocation: 'SiteGround',
    startDate: '2026-03-01',
    endDate: '2026-09-30',
    teamMemberIds: ['tm-2'],
    description: 'Local SEO campaign to complement the new website launch.',
    budget: 6000,
  },
  {
    id: 'pr-8',
    name: 'Bloom & Barrel Social Media',
    clientId: 'cl-2',
    service: 'Social Media Marketing',
    status: 'Active',
    platform: 'Squarespace',
    hostingLocation: 'Squarespace',
    startDate: '2026-02-15',
    endDate: '2026-08-15',
    teamMemberIds: ['tm-3', 'tm-6'],
    description: 'Instagram and TikTok content for seasonal menus and events.',
    budget: 5500,
  },
];

// Helper functions
export function getClient(id: string): Client | undefined {
  return clients.find(c => c.id === id);
}

export function getProject(id: string): Project | undefined {
  return projects.find(p => p.id === id);
}

export function getTeamMember(id: string): TeamMember | undefined {
  return teamMembers.find(t => t.id === id);
}

export function getProjectsByClient(clientId: string): Project[] {
  return projects.filter(p => p.clientId === clientId);
}

export function getProjectsByTeamMember(teamMemberId: string): Project[] {
  return projects.filter(p => p.teamMemberIds.includes(teamMemberId));
}
