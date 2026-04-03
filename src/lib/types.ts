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

// Messages (Slack-like)
export interface Channel {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  memberIds: string[];
}

export interface DirectMessage {
  id: string;
  participantIds: string[];
}

export interface Message {
  id: string;
  channelId?: string;
  dmId?: string;
  senderId: string;
  content: string;
  timestamp: string;
  reactions?: { emoji: string; userIds: string[] }[];
  threadId?: string;
  isThreadReply?: boolean;
}

// Email (Missive-like)
export type EmailStatus = 'inbox' | 'in-progress' | 'waiting' | 'done' | 'archived';

export interface Email {
  id: string;
  from: string;
  fromEmail: string;
  to: string;
  subject: string;
  preview: string;
  body: string;
  timestamp: string;
  status: EmailStatus;
  isRead: boolean;
  labels?: string[];
  assigneeId?: string;
  clientId?: string;
}

// Tasks (Todoist-like)
export type TaskPriority = 1 | 2 | 3 | 4;

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate?: string;
  projectId?: string;
  assigneeId?: string;
  labels?: string[];
  parentId?: string;
  createdAt: string;
}

export interface TaskProject {
  id: string;
  name: string;
  color: string;
}
