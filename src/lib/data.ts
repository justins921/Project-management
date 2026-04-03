import { Client, Project, TeamMember, Channel, DirectMessage, Message, Email, Task, TaskProject, Tool } from './types';

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

// ============ Messages Data ============

export const channels: Channel[] = [
  { id: 'ch-1', name: 'general', description: 'Company-wide announcements and updates', isPrivate: false, memberIds: ['tm-1', 'tm-2', 'tm-3', 'tm-4', 'tm-5', 'tm-6'] },
  { id: 'ch-2', name: 'design', description: 'Design team discussions', isPrivate: false, memberIds: ['tm-1', 'tm-4', 'tm-5'] },
  { id: 'ch-3', name: 'seo-team', description: 'SEO strategy and updates', isPrivate: false, memberIds: ['tm-2', 'tm-5', 'tm-6'] },
  { id: 'ch-4', name: 'social-media', description: 'Social media campaigns', isPrivate: false, memberIds: ['tm-3', 'tm-6'] },
  { id: 'ch-5', name: 'oakwood-dental', description: 'Oakwood Dental project channel', isPrivate: true, memberIds: ['tm-1', 'tm-4', 'tm-5'] },
  { id: 'ch-6', name: 'random', description: 'Non-work banter and fun', isPrivate: false, memberIds: ['tm-1', 'tm-2', 'tm-3', 'tm-4', 'tm-5', 'tm-6'] },
];

export const directMessages: DirectMessage[] = [
  { id: 'dm-1', participantIds: ['tm-5', 'tm-1'] },
  { id: 'dm-2', participantIds: ['tm-5', 'tm-2'] },
  { id: 'dm-3', participantIds: ['tm-5', 'tm-3'] },
];

export const messages: Message[] = [
  { id: 'msg-1', channelId: 'ch-1', senderId: 'tm-5', content: 'Good morning team! Quick reminder: client presentations are this Thursday. Make sure your decks are ready by Wednesday EOD.', timestamp: '2026-04-03T09:00:00Z' },
  { id: 'msg-2', channelId: 'ch-1', senderId: 'tm-1', content: 'Got it, Lisa. The Oakwood Dental mockups are finalized. I\'ll have the deck ready tomorrow.', timestamp: '2026-04-03T09:05:00Z' },
  { id: 'msg-3', channelId: 'ch-1', senderId: 'tm-2', content: 'SEO reports for Bloom & Barrel are looking great this month. Rankings up 15% across the board.', timestamp: '2026-04-03T09:12:00Z' },
  { id: 'msg-4', channelId: 'ch-1', senderId: 'tm-3', content: 'Nice work Marcus! The social campaigns are driving solid traffic too. Let\'s sync on the combined report.', timestamp: '2026-04-03T09:15:00Z' },
  { id: 'msg-5', channelId: 'ch-1', senderId: 'tm-6', content: 'I\'ve finished the Pinnacle Law blog posts for this month. Ready for review whenever.', timestamp: '2026-04-03T09:30:00Z' },
  { id: 'msg-6', channelId: 'ch-1', senderId: 'tm-4', content: 'Heads up — I\'m pushing the Oakwood Dental staging site update today. Should be live by 3pm.', timestamp: '2026-04-03T10:00:00Z' },
  { id: 'msg-7', channelId: 'ch-2', senderId: 'tm-1', content: 'Just uploaded the new Ironclad Fitness brand kit to Figma. Check it out and let me know your thoughts.', timestamp: '2026-04-03T08:30:00Z' },
  { id: 'msg-8', channelId: 'ch-2', senderId: 'tm-4', content: 'Looking clean! Love the color palette. I\'ll start building the Shopify theme based on these.', timestamp: '2026-04-03T08:45:00Z' },
  { id: 'msg-9', channelId: 'ch-2', senderId: 'tm-1', content: 'Perfect. I\'ll also send over the icon set later today. Want to make sure everything\'s consistent.', timestamp: '2026-04-03T08:50:00Z' },
  { id: 'msg-10', channelId: 'ch-3', senderId: 'tm-2', content: 'Found some new keyword opportunities for Oakwood Dental. Adding them to the content brief.', timestamp: '2026-04-03T11:00:00Z' },
  { id: 'msg-11', channelId: 'ch-3', senderId: 'tm-6', content: 'Great, I can work those into the next batch of blog posts. Send me the list when ready.', timestamp: '2026-04-03T11:15:00Z' },
  { id: 'msg-12', channelId: 'ch-4', senderId: 'tm-3', content: 'The Summit Realty Instagram reel hit 12K views! Best performing content this quarter.', timestamp: '2026-04-03T10:30:00Z', reactions: [{ emoji: '🎉', userIds: ['tm-5', 'tm-6'] }, { emoji: '🔥', userIds: ['tm-1'] }] },
  { id: 'msg-13', channelId: 'ch-5', senderId: 'tm-5', content: 'Dr. Hayes approved the homepage design! Moving to development phase. David, you\'re up.', timestamp: '2026-04-03T14:00:00Z' },
  { id: 'msg-14', channelId: 'ch-5', senderId: 'tm-4', content: 'Awesome! I\'ll start the WordPress build tomorrow. Should have a working prototype by Friday.', timestamp: '2026-04-03T14:10:00Z' },
  { id: 'msg-15', channelId: 'ch-5', senderId: 'tm-1', content: 'I\'ll be available for any design QA. Just tag me when you need a review.', timestamp: '2026-04-03T14:15:00Z' },
  { id: 'msg-16', channelId: 'ch-6', senderId: 'tm-3', content: 'Anyone want to grab lunch? That new ramen place opened up down the street.', timestamp: '2026-04-03T11:45:00Z' },
  { id: 'msg-17', channelId: 'ch-6', senderId: 'tm-4', content: 'I\'m in! Let me finish this commit first.', timestamp: '2026-04-03T11:48:00Z', reactions: [{ emoji: '👍', userIds: ['tm-3'] }] },
  // DMs
  { id: 'msg-18', dmId: 'dm-1', senderId: 'tm-5', content: 'Hey Sarah, can you prioritize the Ironclad Fitness mockups this week? Amanda is eager to see progress.', timestamp: '2026-04-03T09:20:00Z' },
  { id: 'msg-19', dmId: 'dm-1', senderId: 'tm-1', content: 'Absolutely! I\'m wrapping up Verde today, so I can start on Ironclad first thing tomorrow.', timestamp: '2026-04-03T09:25:00Z' },
  { id: 'msg-20', dmId: 'dm-1', senderId: 'tm-5', content: 'Perfect. Let me know if you need anything from the client. I have a call with Amanda on Monday.', timestamp: '2026-04-03T09:28:00Z' },
  { id: 'msg-21', dmId: 'dm-2', senderId: 'tm-5', content: 'Marcus, the Bloom & Barrel report is due Friday. Are we on track?', timestamp: '2026-04-03T10:00:00Z' },
  { id: 'msg-22', dmId: 'dm-2', senderId: 'tm-2', content: 'Yep! All the data is pulled. Just need to format it and add commentary. Will have it by Thursday.', timestamp: '2026-04-03T10:05:00Z' },
  { id: 'msg-23', dmId: 'dm-3', senderId: 'tm-3', content: 'Hey Lisa, I need approval on the Summit Realty ad spend increase. Can you take a look at the proposal?', timestamp: '2026-04-03T13:00:00Z' },
  { id: 'msg-24', dmId: 'dm-3', senderId: 'tm-5', content: 'Sure, send it over. I\'ll review it this afternoon.', timestamp: '2026-04-03T13:05:00Z' },
];

// ============ Email Data ============

export const emails: Email[] = [
  {
    id: 'em-1', from: 'Dr. Robert Hayes', fromEmail: 'robert@oakwooddental.com', to: 'team@agency.com',
    subject: 'Re: Homepage Design Approval', preview: 'The design looks fantastic! We\'re ready to move forward with development...',
    body: 'Hi Lisa,\n\nThe design looks fantastic! We\'re ready to move forward with development. A couple of minor tweaks:\n\n1. Can we make the booking button more prominent?\n2. The patient testimonials section needs updated quotes — I\'ll send those over today.\n\nOtherwise, everything is approved. Great work to the team!\n\nBest,\nDr. Hayes',
    timestamp: '2026-04-03T08:30:00Z', status: 'in-progress', isRead: true, labels: ['client'], assigneeId: 'tm-1', clientId: 'cl-1',
  },
  {
    id: 'em-2', from: 'Jessica Torres', fromEmail: 'jessica@bloombarrel.com', to: 'team@agency.com',
    subject: 'New Menu Launch — Social Media Push', preview: 'We\'re launching our spring menu next week and would love a big social push...',
    body: 'Hi Emily,\n\nWe\'re launching our spring menu next week and would love a big social media push around it. Can we schedule a call to discuss the campaign? I have some ideas for reels and stories.\n\nAlso, the SEO work has been paying off — we\'re seeing more reservations coming through Google. Great job!\n\nThanks,\nJessica',
    timestamp: '2026-04-03T07:45:00Z', status: 'inbox', isRead: false, labels: ['client', 'urgent'], assigneeId: 'tm-3', clientId: 'cl-2',
  },
  {
    id: 'em-3', from: 'Michael Chang', fromEmail: 'mchang@summitrealty.com', to: 'team@agency.com',
    subject: 'Monthly Analytics Report Request', preview: 'Can you send over the March analytics report for our social channels...',
    body: 'Hi team,\n\nCan you send over the March analytics report for our social media channels? We have a board meeting next week and I\'d like to include the social media ROI numbers.\n\nAlso, the Instagram reel you posted last week did really well — our agents are getting more inquiries. Keep it up!\n\nBest,\nMichael',
    timestamp: '2026-04-02T16:20:00Z', status: 'inbox', isRead: true, labels: ['client'], assigneeId: 'tm-3', clientId: 'cl-3',
  },
  {
    id: 'em-4', from: 'Amanda Brooks', fromEmail: 'amanda@ironcladfitness.com', to: 'team@agency.com',
    subject: 'E-Commerce Store — Product Photos', preview: 'I have the product photos ready for the Shopify store. Where should I send them...',
    body: 'Hey team,\n\nI have the product photos ready for the Shopify store. Where should I send them? We have about 150 products to upload initially.\n\nAlso, I wanted to discuss the subscription model for our protein line. Can we set up a call?\n\nThanks,\nAmanda',
    timestamp: '2026-04-02T14:00:00Z', status: 'waiting', isRead: true, labels: ['client'], assigneeId: 'tm-4', clientId: 'cl-4',
  },
  {
    id: 'em-5', from: 'Rachel Foster', fromEmail: 'rfoster@pinnaclelaw.com', to: 'team@agency.com',
    subject: 'Blog Post Review — Employment Law Guide', preview: 'I reviewed the latest blog post draft. A few legal accuracy corrections needed...',
    body: 'Hi James,\n\nI reviewed the latest blog post draft on employment law. A few corrections needed for legal accuracy:\n\n1. Section 3 needs to reference the updated 2026 regulations\n2. The disclaimer at the bottom should be updated per our legal team\'s template\n3. Great job on the structure and readability!\n\nPlease make the changes and send back for final approval.\n\nRegards,\nRachel Foster',
    timestamp: '2026-04-02T11:30:00Z', status: 'in-progress', isRead: true, labels: ['client', 'review'], assigneeId: 'tm-6', clientId: 'cl-6',
  },
  {
    id: 'em-6', from: 'Google Search Console', fromEmail: 'noreply@google.com', to: 'marcus@agency.com',
    subject: 'Search performance report — bloombarrel.com', preview: 'Your monthly search performance report is ready. Clicks: 2,847 (+23%)...',
    body: 'Search Performance Report for bloombarrel.com\n\nPeriod: March 2026\n\nClicks: 2,847 (+23% vs Feb)\nImpressions: 45,230 (+18%)\nAverage Position: 8.3 (improved from 11.2)\nTop Query: "best restaurants downtown"\n\nView full report in Search Console.',
    timestamp: '2026-04-01T06:00:00Z', status: 'done', isRead: true, labels: ['automated'],
  },
  {
    id: 'em-7', from: 'Carlos Mendez', fromEmail: 'carlos@verdelandscaping.com', to: 'team@agency.com',
    subject: 'Website Feedback — Love It!', preview: 'Just wanted to say the website looks amazing. Our leads have increased by 40%...',
    body: 'Hi team,\n\nJust wanted to drop a note saying the website looks amazing! Since launch, our leads have increased by 40% and we\'re getting great feedback from customers about how easy it is to request quotes.\n\nWe\'d love to discuss adding a blog section in the future. Let me know when you\'re available.\n\nThanks for the great work!\nCarlos',
    timestamp: '2026-04-01T10:15:00Z', status: 'done', isRead: true, labels: ['client'], clientId: 'cl-5',
  },
  {
    id: 'em-8', from: 'Shopify Partners', fromEmail: 'partners@shopify.com', to: 'david@agency.com',
    subject: 'New Shopify API Updates — April 2026', preview: 'Important changes to the Shopify API that may affect your integrations...',
    body: 'Hi David,\n\nWe\'re writing to inform you about upcoming changes to the Shopify API:\n\n- New checkout extensibility features\n- Updated product variant limits\n- Deprecated endpoints being removed June 2026\n\nPlease review the changelog and update your integrations accordingly.\n\nBest,\nShopify Partners Team',
    timestamp: '2026-03-31T09:00:00Z', status: 'archived', isRead: true, labels: ['platform'],
  },
];

// ============ Tasks Data ============

export const taskProjects: TaskProject[] = [
  { id: 'tp-1', name: 'Oakwood Dental', color: '#8b5cf6' },
  { id: 'tp-2', name: 'Bloom & Barrel', color: '#06b6d4' },
  { id: 'tp-3', name: 'Summit Realty', color: '#ec4899' },
  { id: 'tp-4', name: 'Ironclad Fitness', color: '#f59e0b' },
  { id: 'tp-5', name: 'Pinnacle Law', color: '#14b8a6' },
  { id: 'tp-6', name: 'Internal', color: '#6366f1' },
];

export const tasks: Task[] = [
  // Today / high priority
  { id: 'tk-1', title: 'Finalize Oakwood Dental homepage wireframes', completed: false, priority: 1, dueDate: '2026-04-03', projectId: 'tp-1', assigneeId: 'tm-1', labels: ['design'], createdAt: '2026-03-28T10:00:00Z' },
  { id: 'tk-2', title: 'Review Bloom & Barrel SEO monthly report', completed: false, priority: 1, dueDate: '2026-04-03', projectId: 'tp-2', assigneeId: 'tm-2', labels: ['seo', 'report'], createdAt: '2026-03-30T09:00:00Z' },
  { id: 'tk-3', title: 'Schedule Summit Realty ad campaign for April', completed: false, priority: 2, dueDate: '2026-04-03', projectId: 'tp-3', assigneeId: 'tm-3', labels: ['social'], createdAt: '2026-04-01T08:00:00Z' },
  { id: 'tk-4', title: 'Push Oakwood Dental staging site update', completed: true, priority: 1, dueDate: '2026-04-03', projectId: 'tp-1', assigneeId: 'tm-4', labels: ['dev'], createdAt: '2026-04-02T10:00:00Z' },

  // This week
  { id: 'tk-5', title: 'Build Ironclad Fitness Shopify product templates', completed: false, priority: 2, dueDate: '2026-04-05', projectId: 'tp-4', assigneeId: 'tm-4', labels: ['dev'], createdAt: '2026-04-01T10:00:00Z' },
  { id: 'tk-6', title: 'Write 3 blog posts for Pinnacle Law', description: 'Topics: employment law update, contract basics, business formation guide', completed: false, priority: 2, dueDate: '2026-04-04', projectId: 'tp-5', assigneeId: 'tm-6', labels: ['content'], createdAt: '2026-03-29T10:00:00Z' },
  { id: 'tk-7', title: 'Create social media calendar for May', completed: false, priority: 3, dueDate: '2026-04-07', projectId: 'tp-3', assigneeId: 'tm-3', labels: ['social', 'planning'], createdAt: '2026-04-01T10:00:00Z' },
  { id: 'tk-8', title: 'Client presentation deck — all projects', description: 'Compile results and next steps for Thursday client meetings', completed: false, priority: 1, dueDate: '2026-04-04', projectId: 'tp-6', assigneeId: 'tm-5', labels: ['presentation'], createdAt: '2026-04-01T08:00:00Z' },
  { id: 'tk-9', title: 'Set up Google Analytics 4 for Oakwood Dental', completed: false, priority: 3, dueDate: '2026-04-06', projectId: 'tp-1', assigneeId: 'tm-2', labels: ['analytics'], createdAt: '2026-04-02T10:00:00Z' },

  // Next week
  { id: 'tk-10', title: 'Ironclad Fitness brand guidelines PDF', completed: false, priority: 2, dueDate: '2026-04-10', projectId: 'tp-4', assigneeId: 'tm-1', labels: ['design'], createdAt: '2026-04-03T10:00:00Z' },
  { id: 'tk-11', title: 'Bloom & Barrel spring menu photo shoot coordination', completed: false, priority: 3, dueDate: '2026-04-09', projectId: 'tp-2', assigneeId: 'tm-3', labels: ['social'], createdAt: '2026-04-02T10:00:00Z' },
  { id: 'tk-12', title: 'Optimize Oakwood Dental site speed', description: 'Target: LCP under 2.5s, CLS under 0.1', completed: false, priority: 2, dueDate: '2026-04-11', projectId: 'tp-1', assigneeId: 'tm-4', labels: ['dev', 'performance'], createdAt: '2026-04-03T10:00:00Z' },

  // Completed recently
  { id: 'tk-13', title: 'Verde Landscaping site launch QA', completed: true, priority: 1, dueDate: '2026-04-01', projectId: 'tp-6', assigneeId: 'tm-4', labels: ['dev', 'qa'], createdAt: '2026-03-25T10:00:00Z' },
  { id: 'tk-14', title: 'Bloom & Barrel keyword research update', completed: true, priority: 2, dueDate: '2026-04-02', projectId: 'tp-2', assigneeId: 'tm-2', labels: ['seo'], createdAt: '2026-03-28T10:00:00Z' },
  { id: 'tk-15', title: 'Summit Realty Instagram reel — spring listings', completed: true, priority: 2, dueDate: '2026-04-02', projectId: 'tp-3', assigneeId: 'tm-3', labels: ['social'], createdAt: '2026-03-30T10:00:00Z' },
];

// ============ Tools & Expenses Data ============

export const tools: Tool[] = [
  { id: 'tl-1', name: 'Figma', description: 'UI/UX design and prototyping for all client projects', category: 'Design', loginInfo: '1Password → Design vault', cost: 45, billingCycle: 'monthly', icon: '🎨' },
  { id: 'tl-2', name: 'Adobe Creative Cloud', description: 'Photoshop, Illustrator, After Effects for graphics and video', category: 'Design', loginInfo: '1Password → Design vault', cost: 89.99, billingCycle: 'monthly', icon: '🖌️' },
  { id: 'tl-3', name: 'GitHub', description: 'Code repositories and version control for all dev projects', category: 'Development', loginInfo: '1Password → Dev vault', cost: 25, billingCycle: 'monthly', icon: '💻' },
  { id: 'tl-4', name: 'Vercel', description: 'Hosting and deployment for Next.js projects', category: 'Hosting', loginInfo: '1Password → Dev vault', cost: 20, billingCycle: 'monthly', icon: '▲' },
  { id: 'tl-5', name: 'SiteGround', description: 'WordPress hosting for Oakwood Dental and other WP sites', category: 'Hosting', loginInfo: '1Password → Hosting vault', cost: 29.99, billingCycle: 'monthly', icon: '🌐' },
  { id: 'tl-6', name: 'WP Engine', description: 'Managed WordPress hosting for Pinnacle Law', category: 'Hosting', loginInfo: '1Password → Hosting vault', cost: 30, billingCycle: 'monthly', icon: '🌐' },
  { id: 'tl-7', name: 'Ahrefs', description: 'SEO research, keyword tracking, and competitor analysis', category: 'SEO', loginInfo: '1Password → SEO vault', cost: 199, billingCycle: 'monthly', icon: '🔍' },
  { id: 'tl-8', name: 'Google Search Console', description: 'Search performance monitoring for all client sites', category: 'SEO', loginInfo: 'Google Workspace SSO', cost: 0, billingCycle: 'free', icon: '📊' },
  { id: 'tl-9', name: 'Semrush', description: 'SEO audits, position tracking, and content optimization', category: 'SEO', loginInfo: '1Password → SEO vault', cost: 129.95, billingCycle: 'monthly', icon: '📈' },
  { id: 'tl-10', name: 'Buffer', description: 'Social media scheduling and analytics for all client accounts', category: 'Social Media', loginInfo: '1Password → Social vault', cost: 60, billingCycle: 'monthly', icon: '📱' },
  { id: 'tl-11', name: 'Canva Pro', description: 'Quick social media graphics and story templates', category: 'Social Media', loginInfo: '1Password → Social vault', cost: 12.99, billingCycle: 'monthly', icon: '✨' },
  { id: 'tl-12', name: 'Google Analytics 4', description: 'Website analytics and conversion tracking for all clients', category: 'Analytics', loginInfo: 'Google Workspace SSO', cost: 0, billingCycle: 'free', icon: '📊' },
  { id: 'tl-13', name: 'Hotjar', description: 'Heatmaps and session recordings for UX insights', category: 'Analytics', loginInfo: '1Password → Analytics vault', cost: 39, billingCycle: 'monthly', icon: '🔥' },
  { id: 'tl-14', name: 'Slack', description: 'Internal team communication and client channels', category: 'Communication', loginInfo: 'Google Workspace SSO', cost: 8.75, billingCycle: 'monthly', icon: '💬' },
  { id: 'tl-15', name: 'Google Workspace', description: 'Email, Drive, Docs, and Sheets for the whole team', category: 'Communication', loginInfo: 'admin@agency.com — IT vault', cost: 72, billingCycle: 'monthly', icon: '📧' },
  { id: 'tl-16', name: 'Notion', description: 'Internal wiki, SOPs, and knowledge base', category: 'Project Management', loginInfo: '1Password → PM vault', cost: 10, billingCycle: 'monthly', icon: '📝' },
  { id: 'tl-17', name: 'Loom', description: 'Video walkthroughs for client presentations and internal docs', category: 'Communication', loginInfo: '1Password → PM vault', cost: 12.50, billingCycle: 'monthly', icon: '🎥' },
  { id: 'tl-18', name: 'Shopify Partners', description: 'Development store access for e-commerce projects', category: 'Development', loginInfo: '1Password → Dev vault', cost: 0, billingCycle: 'free', icon: '🛒' },
];

// ============ Helper Functions ============

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

export function getTaskProject(id: string): TaskProject | undefined {
  return taskProjects.find(tp => tp.id === id);
}

export function getChannel(id: string): Channel | undefined {
  return channels.find(c => c.id === id);
}

export function getMessagesByChannel(channelId: string): Message[] {
  return messages.filter(m => m.channelId === channelId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function getMessagesByDm(dmId: string): Message[] {
  return messages.filter(m => m.dmId === dmId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}
