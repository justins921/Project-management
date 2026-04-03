import { Client, Project, TeamMember, Channel, DirectMessage, Message, Email, SharedInbox, Task, TaskProject, Tool, Note, NoteFolder, SOP } from './types';

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

export const sharedInboxes: SharedInbox[] = [
  { id: 'si-1', name: 'Team', email: 'team@agency.com', memberIds: ['tm-1', 'tm-2', 'tm-3', 'tm-4', 'tm-5', 'tm-6'], color: '#3b82f6' },
  { id: 'si-2', name: 'Sales', email: 'sales@agency.com', memberIds: ['tm-5', 'tm-6'], color: '#8b5cf6' },
  { id: 'si-3', name: 'Support', email: 'support@agency.com', memberIds: ['tm-4', 'tm-5'], color: '#06b6d4' },
];

export const emails: Email[] = [
  {
    id: 'em-1', from: 'Dr. Robert Hayes', fromEmail: 'robert@oakwooddental.com', to: 'team@agency.com',
    subject: 'Re: Homepage Design Approval', preview: 'The design looks fantastic! We\'re ready to move forward with development...',
    body: 'Hi Lisa,\n\nThe design looks fantastic! We\'re ready to move forward with development. A couple of minor tweaks:\n\n1. Can we make the booking button more prominent?\n2. The patient testimonials section needs updated quotes — I\'ll send those over today.\n\nOtherwise, everything is approved. Great work to the team!\n\nBest,\nDr. Hayes',
    timestamp: '2026-04-03T08:30:00Z', status: 'in-progress', isRead: true, labels: ['client'], assigneeId: 'tm-1', clientId: 'cl-1', sharedInboxId: 'si-1',
  },
  {
    id: 'em-2', from: 'Jessica Torres', fromEmail: 'jessica@bloombarrel.com', to: 'team@agency.com',
    subject: 'New Menu Launch — Social Media Push', preview: 'We\'re launching our spring menu next week and would love a big social push...',
    body: 'Hi Emily,\n\nWe\'re launching our spring menu next week and would love a big social media push around it. Can we schedule a call to discuss the campaign? I have some ideas for reels and stories.\n\nAlso, the SEO work has been paying off — we\'re seeing more reservations coming through Google. Great job!\n\nThanks,\nJessica',
    timestamp: '2026-04-03T07:45:00Z', status: 'inbox', isRead: false, labels: ['client', 'urgent'], assigneeId: 'tm-3', clientId: 'cl-2', sharedInboxId: 'si-1',
  },
  {
    id: 'em-3', from: 'Michael Chang', fromEmail: 'mchang@summitrealty.com', to: 'team@agency.com',
    subject: 'Monthly Analytics Report Request', preview: 'Can you send over the March analytics report for our social channels...',
    body: 'Hi team,\n\nCan you send over the March analytics report for our social media channels? We have a board meeting next week and I\'d like to include the social media ROI numbers.\n\nAlso, the Instagram reel you posted last week did really well — our agents are getting more inquiries. Keep it up!\n\nBest,\nMichael',
    timestamp: '2026-04-02T16:20:00Z', status: 'inbox', isRead: true, labels: ['client'], assigneeId: 'tm-3', clientId: 'cl-3', sharedInboxId: 'si-1',
  },
  {
    id: 'em-4', from: 'Amanda Brooks', fromEmail: 'amanda@ironcladfitness.com', to: 'team@agency.com',
    subject: 'E-Commerce Store — Product Photos', preview: 'I have the product photos ready for the Shopify store. Where should I send them...',
    body: 'Hey team,\n\nI have the product photos ready for the Shopify store. Where should I send them? We have about 150 products to upload initially.\n\nAlso, I wanted to discuss the subscription model for our protein line. Can we set up a call?\n\nThanks,\nAmanda',
    timestamp: '2026-04-02T14:00:00Z', status: 'waiting', isRead: true, labels: ['client'], assigneeId: 'tm-4', clientId: 'cl-4', sharedInboxId: 'si-1',
  },
  {
    id: 'em-5', from: 'Rachel Foster', fromEmail: 'rfoster@pinnaclelaw.com', to: 'team@agency.com',
    subject: 'Blog Post Review — Employment Law Guide', preview: 'I reviewed the latest blog post draft. A few legal accuracy corrections needed...',
    body: 'Hi James,\n\nI reviewed the latest blog post draft on employment law. A few corrections needed for legal accuracy:\n\n1. Section 3 needs to reference the updated 2026 regulations\n2. The disclaimer at the bottom should be updated per our legal team\'s template\n3. Great job on the structure and readability!\n\nPlease make the changes and send back for final approval.\n\nRegards,\nRachel Foster',
    timestamp: '2026-04-02T11:30:00Z', status: 'in-progress', isRead: true, labels: ['client', 'review'], assigneeId: 'tm-6', clientId: 'cl-6', sharedInboxId: 'si-1',
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
    timestamp: '2026-04-01T10:15:00Z', status: 'done', isRead: true, labels: ['client'], clientId: 'cl-5', sharedInboxId: 'si-1',
  },
  {
    id: 'em-8', from: 'Shopify Partners', fromEmail: 'partners@shopify.com', to: 'david@agency.com',
    subject: 'New Shopify API Updates — April 2026', preview: 'Important changes to the Shopify API that may affect your integrations...',
    body: 'Hi David,\n\nWe\'re writing to inform you about upcoming changes to the Shopify API:\n\n- New checkout extensibility features\n- Updated product variant limits\n- Deprecated endpoints being removed June 2026\n\nPlease review the changelog and update your integrations accordingly.\n\nBest,\nShopify Partners Team',
    timestamp: '2026-03-31T09:00:00Z', status: 'archived', isRead: true, labels: ['platform'],
  },
  {
    id: 'em-9', from: 'Tom Richards', fromEmail: 'tom@greenfieldbrewing.com', to: 'sales@agency.com',
    subject: 'Website Inquiry — Brewery & Taproom', preview: 'We\'re looking for an agency to redesign our website and handle social media...',
    body: 'Hi there,\n\nI found your agency through a Google search and I\'m impressed by your portfolio. We\'re a craft brewery with a taproom and we need:\n\n1. A full website redesign (currently on an old WordPress theme)\n2. Social media management for Instagram and TikTok\n3. Local SEO to drive foot traffic\n\nOur budget is around $15-20k for the website and $2-3k/month for ongoing services. Could we set up a call this week?\n\nThanks,\nTom Richards\nGreenfield Brewing Co.',
    timestamp: '2026-04-03T10:30:00Z', status: 'inbox', isRead: false, labels: ['lead'], sharedInboxId: 'si-2',
  },
  {
    id: 'em-10', from: 'Sarah Mitchell', fromEmail: 'sarah.m@luxerealestate.com', to: 'sales@agency.com',
    subject: 'Re: Digital Marketing Proposal', preview: 'Thank you for the proposal. We\'d like to move forward with the SEO package...',
    body: 'Hi Lisa,\n\nThank you for the detailed proposal. After discussing with our team, we\'d like to move forward with the SEO + Content Marketing package.\n\nA few questions:\n1. Can we start with a 3-month trial period?\n2. Do you offer any volume discounts for multiple properties?\n3. What\'s the typical timeline to see SEO results?\n\nLooking forward to working together.\n\nBest,\nSarah Mitchell\nLuxe Real Estate Group',
    timestamp: '2026-04-02T15:45:00Z', status: 'in-progress', isRead: true, labels: ['lead'], assigneeId: 'tm-5', sharedInboxId: 'si-2',
  },
  {
    id: 'em-11', from: 'Carlos Mendez', fromEmail: 'carlos@verdelandscaping.com', to: 'support@agency.com',
    subject: 'Contact Form Not Working', preview: 'Our website contact form stopped sending email notifications yesterday...',
    body: 'Hi support team,\n\nOur website contact form stopped sending email notifications yesterday. We\'ve had a few customers call in saying they submitted a form but we never received it.\n\nCan someone look into this ASAP? We don\'t want to lose any leads.\n\nThanks,\nCarlos',
    timestamp: '2026-04-03T08:15:00Z', status: 'inbox', isRead: false, labels: ['urgent', 'bug'], clientId: 'cl-5', sharedInboxId: 'si-3',
  },
  {
    id: 'em-12', from: 'Amanda Brooks', fromEmail: 'amanda@ironcladfitness.com', to: 'support@agency.com',
    subject: 'Shopify Store — Payment Gateway Question', preview: 'Quick question about the payment gateway options for the new store...',
    body: 'Hi team,\n\nQuick question about the Shopify store we\'re building. Which payment gateway do you recommend?\n\n- Shopify Payments (simple but higher fees)\n- Stripe (more flexibility)\n- PayPal as an additional option?\n\nAlso, do we need a separate gateway for the subscription products?\n\nThanks,\nAmanda',
    timestamp: '2026-04-02T09:00:00Z', status: 'waiting', isRead: true, labels: ['client'], assigneeId: 'tm-4', clientId: 'cl-4', sharedInboxId: 'si-3',
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

// ============ Notes Data ============

export const noteFolders: NoteFolder[] = [
  { id: 'nf-1', name: 'Meeting Notes', icon: '📋' },
  { id: 'nf-2', name: 'Client Info', icon: '👥' },
  { id: 'nf-3', name: 'Ideas', icon: '💡' },
  { id: 'nf-4', name: 'Resources', icon: '📚' },
];

export const notes: Note[] = [
  {
    id: 'nt-1', title: 'Weekly Team Standup — April 3', folderId: 'nf-1', isPinned: true, color: 'default', authorId: 'tm-5',
    content: `## Attendees\nSarah, Marcus, Emily, David, Lisa, James\n\n## Updates\n- **Sarah**: Oakwood Dental homepage approved, starting Ironclad Fitness mockups tomorrow\n- **Marcus**: Bloom & Barrel SEO report nearly done, rankings up 15%\n- **David**: Pushing staging site update for Oakwood Dental today\n- **Emily**: Summit Realty reel hit 12K views, planning spring menu campaign for Bloom & Barrel\n- **James**: Pinnacle Law blog posts ready for review\n\n## Action Items\n- Lisa: Send client presentation reminder\n- David: Share staging link by 3pm\n- Emily: Schedule call with Jessica Torres re: spring menu`,
    createdAt: '2026-04-03T09:00:00Z', updatedAt: '2026-04-03T09:45:00Z',
  },
  {
    id: 'nt-2', title: 'Oakwood Dental — Project Notes', folderId: 'nf-2', isPinned: true, color: 'blue', authorId: 'tm-1',
    content: `## Project Overview\nFull website redesign with online booking and patient portal.\n\n## Key Decisions\n- WordPress + Elementor Pro\n- Hosted on SiteGround (existing hosting)\n- Online booking via Calendly embed\n- Patient portal through third-party integration (TBD)\n\n## Design Direction\n- Clean, modern, trustworthy\n- Primary color: teal (#0d9488)\n- Photography style: warm, friendly, professional\n- Mobile-first approach\n\n## Client Preferences\n- Dr. Hayes prefers minimal animations\n- Wants prominent booking CTA on every page\n- Testimonials section is high priority`,
    createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-04-03T14:00:00Z',
  },
  {
    id: 'nt-3', title: 'Ironclad Fitness — Brand Research', folderId: 'nf-2', isPinned: false, color: 'yellow', authorId: 'tm-1',
    content: `## Competitor Analysis\n- GymShark: Bold, dark themes, heavy influencer marketing\n- Alo Yoga: Clean, minimal, lifestyle-focused\n- Rogue Fitness: Industrial, bold typography\n\n## Brand Keywords\nStrong, empowering, inclusive, premium, gritty\n\n## Color Palette Ideas\n- Charcoal + Electric Orange\n- Matte Black + Gold\n- Dark Navy + Neon Green\n\n## Typography\n- Headers: Knockout or Bebas Neue\n- Body: Inter or DM Sans\n\n## Notes from Amanda\n- Wants to appeal to both serious lifters AND beginners\n- Subscription model for supplements is key differentiator\n- Lifestyle photography > studio shots`,
    createdAt: '2026-04-01T10:00:00Z', updatedAt: '2026-04-02T16:00:00Z',
  },
  {
    id: 'nt-4', title: 'SEO Strategy Template', folderId: 'nf-4', isPinned: false, color: 'green', authorId: 'tm-2',
    content: `## Phase 1: Audit (Week 1-2)\n- Technical SEO audit (Screaming Frog)\n- Content audit and gap analysis\n- Competitor keyword analysis\n- Backlink profile review\n\n## Phase 2: On-Page (Week 3-6)\n- Title tag and meta description optimization\n- Header structure (H1-H6)\n- Internal linking strategy\n- Schema markup implementation\n- Image optimization (alt tags, compression)\n\n## Phase 3: Content (Ongoing)\n- Blog content calendar (2-4 posts/month)\n- Service page optimization\n- Location pages (if applicable)\n- FAQ schema\n\n## Phase 4: Off-Page (Ongoing)\n- Local citation building\n- Guest post outreach\n- Digital PR campaigns\n- Review generation strategy\n\n## KPIs to Track\n- Organic traffic (GA4)\n- Keyword rankings (Ahrefs)\n- Domain authority\n- Conversion rate from organic`,
    createdAt: '2026-02-10T10:00:00Z', updatedAt: '2026-03-15T10:00:00Z',
  },
  {
    id: 'nt-5', title: 'Content Ideas — Q2 2026', folderId: 'nf-3', isPinned: false, color: 'purple', authorId: 'tm-6',
    content: `## Blog Post Ideas\n- "5 Web Design Trends for Small Businesses in 2026"\n- "How Local SEO Can Double Your Restaurant Reservations"\n- "Social Media ROI: What Actually Matters"\n- "Why Your Law Firm Needs a Content Strategy"\n\n## Case Studies to Write\n- Verde Landscaping: 40% lead increase post-launch\n- Bloom & Barrel: SEO success story (rankings + reservations)\n- Summit Realty: Instagram reel viral moment\n\n## Video Content\n- Client testimonial series\n- "Day in the Life" at the agency\n- Tool tutorials for clients\n- Monthly industry news roundup`,
    createdAt: '2026-03-20T10:00:00Z', updatedAt: '2026-04-01T10:00:00Z',
  },
  {
    id: 'nt-6', title: 'Social Media Playbook', folderId: 'nf-4', isPinned: false, color: 'pink', authorId: 'tm-3',
    content: `## Posting Schedule\n- **Instagram**: 4-5x/week (mix of reels, carousels, stories)\n- **Facebook**: 3x/week (link posts, events, community engagement)\n- **LinkedIn**: 2-3x/week (thought leadership, case studies)\n- **TikTok**: 3x/week (short-form, trending audio)\n\n## Content Pillars\n1. Educational (tips, how-tos)\n2. Behind the scenes\n3. Client spotlights\n4. Industry trends\n5. Engagement (polls, questions, memes)\n\n## Best Practices\n- Hook in first 3 seconds for video\n- Use 3-5 hashtags (relevant, not spammy)\n- Respond to comments within 2 hours\n- Cross-promote across platforms with native formatting\n- Track top performers weekly and replicate`,
    createdAt: '2026-02-01T10:00:00Z', updatedAt: '2026-03-25T10:00:00Z',
  },
  {
    id: 'nt-7', title: 'Client Meeting — Bloom & Barrel', folderId: 'nf-1', isPinned: false, color: 'default', authorId: 'tm-5',
    content: `## Date: March 28, 2026\n\n## Attendees\nJessica Torres (client), Emily, Marcus, Lisa\n\n## Discussion\n- Spring menu launch planned for April 10\n- Want a big social push — reels, stories, maybe influencer collab\n- SEO results are strong, Jessica very happy with reservation numbers\n- Discussed adding TikTok to the social strategy\n\n## Decisions\n- Increase ad spend by 20% for spring campaign\n- Emily to coordinate influencer outreach\n- Marcus to optimize new menu pages for SEO\n\n## Follow-up\n- Jessica sending menu photos by April 2\n- Emily to draft campaign timeline\n- Next check-in: April 10`,
    createdAt: '2026-03-28T15:00:00Z', updatedAt: '2026-03-28T15:30:00Z',
  },
  {
    id: 'nt-8', title: 'Dev Environment Setup Guide', folderId: 'nf-4', isPinned: false, color: 'blue', authorId: 'tm-4',
    content: `## Required Software\n- Node.js 20+ (via nvm)\n- VS Code with extensions: ESLint, Prettier, Tailwind IntelliSense\n- Git + GitHub Desktop (optional)\n- Docker Desktop (for local WP development)\n\n## Project Setup\n1. Clone repo from GitHub\n2. Copy .env.example to .env.local\n3. Run npm install\n4. Run npm run dev\n\n## WordPress Local Dev\n- Use Local by Flywheel for WP projects\n- Import client site backup via All-in-One WP Migration\n- Always test on staging before pushing to production\n\n## Deployment\n- Next.js projects: Push to main → auto-deploys on Vercel\n- WordPress: Push via WP Engine Git Push or SFTP\n- Shopify: Use Shopify CLI for theme development`,
    createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-03-10T10:00:00Z',
  },
];

// ============ SOPs Data ============

export const sops: SOP[] = [
  {
    id: 'sop-1',
    title: 'New Client Onboarding',
    description: 'Standard process for onboarding a new client from signed contract to project kickoff.',
    category: 'Client Onboarding',
    status: 'Active',
    authorId: 'tm-5',
    lastReviewedBy: 'tm-5',
    version: '2.1',
    steps: [
      { title: 'Contract & Payment Setup', description: 'Confirm signed contract received. Set up invoicing in QuickBooks. Send welcome email with next steps.' },
      { title: 'Client Intake Form', description: 'Send client intake questionnaire via Google Forms. Collect brand assets, logins, goals, and preferences.' },
      { title: 'Internal Setup', description: 'Create project in ProjectHub. Create Slack channel (#client-name). Add team members. Create Google Drive folder.' },
      { title: 'Kickoff Meeting', description: 'Schedule 60-min kickoff call. Review goals, timeline, deliverables. Introduce the team. Set communication expectations.' },
      { title: 'Project Plan', description: 'Create detailed project timeline with milestones. Share with client for approval. Set up recurring check-in meetings.' },
      { title: 'Access & Credentials', description: 'Collect all necessary logins (hosting, CMS, analytics, social accounts). Store in 1Password client vault.' },
    ],
    createdAt: '2025-06-15T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'sop-2',
    title: 'Website Launch Checklist',
    description: 'Pre-launch and launch day checklist for all website projects.',
    category: 'Web Design',
    status: 'Active',
    authorId: 'tm-4',
    lastReviewedBy: 'tm-1',
    version: '3.0',
    steps: [
      { title: 'Content Review', description: 'Verify all pages have final content. Check for placeholder text, broken links, and missing images. Proofread all copy.' },
      { title: 'Cross-Browser Testing', description: 'Test on Chrome, Firefox, Safari, and Edge. Test on iOS Safari and Android Chrome. Fix any rendering issues.' },
      { title: 'Performance Optimization', description: 'Run Lighthouse audit (target 90+ on all metrics). Optimize images (WebP format). Enable caching and CDN. Minify CSS/JS.' },
      { title: 'SEO Pre-Launch', description: 'Verify meta titles and descriptions. Check XML sitemap. Confirm robots.txt. Set up 301 redirects from old URLs. Install analytics.' },
      { title: 'Security Check', description: 'Install SSL certificate. Update all plugins/dependencies. Remove default admin accounts. Set up automated backups.' },
      { title: 'Client Approval', description: 'Walk through final site with client. Get written approval to launch. Document any known issues or follow-up items.' },
      { title: 'Launch Day', description: 'Point DNS to new hosting. Verify SSL is active. Test all forms and CTAs. Submit sitemap to Google Search Console. Monitor for errors.' },
      { title: 'Post-Launch', description: 'Send launch announcement to client. Monitor site for 48 hours. Check analytics tracking. Send follow-up report after 1 week.' },
    ],
    createdAt: '2025-08-01T10:00:00Z',
    updatedAt: '2026-02-15T10:00:00Z',
  },
  {
    id: 'sop-3',
    title: 'Monthly SEO Reporting',
    description: 'Process for generating and delivering monthly SEO performance reports to clients.',
    category: 'SEO',
    status: 'Active',
    authorId: 'tm-2',
    version: '1.3',
    steps: [
      { title: 'Pull Data', description: 'Export data from Google Analytics 4, Search Console, and Ahrefs. Pull ranking data for tracked keywords. Note any algorithm updates during the period.' },
      { title: 'Analyze Performance', description: 'Compare metrics to previous month and baseline. Identify top-performing pages and keywords. Note any significant ranking changes (up or down).' },
      { title: 'Compile Report', description: 'Use the Google Slides report template. Include: traffic overview, keyword rankings, top pages, backlink summary, and competitor comparison.' },
      { title: 'Add Insights & Recommendations', description: 'Write 3-5 key takeaways. Provide specific next-step recommendations. Highlight wins and opportunities.' },
      { title: 'Internal Review', description: 'Have a team member peer-review the report for accuracy. Check all data points and charts.', isOptional: true },
      { title: 'Client Delivery', description: 'Send report via email by the 5th of each month. Offer a 30-min call to walk through results. Archive in client Google Drive folder.' },
    ],
    createdAt: '2025-09-10T10:00:00Z',
    updatedAt: '2026-03-05T10:00:00Z',
  },
  {
    id: 'sop-4',
    title: 'Social Media Content Workflow',
    description: 'End-to-end process for planning, creating, and publishing social media content.',
    category: 'Social Media',
    status: 'Active',
    authorId: 'tm-3',
    version: '2.0',
    steps: [
      { title: 'Monthly Planning', description: 'Review client goals and upcoming events. Plan content themes and post types for the month. Create content calendar in Buffer.' },
      { title: 'Content Creation', description: 'Design graphics in Canva or Figma. Write captions with relevant hashtags. Create video content (reels, TikToks). Get client approval on branded content.' },
      { title: 'Scheduling', description: 'Schedule posts in Buffer at optimal times. Set up Instagram Stories for the week. Queue engagement posts (polls, questions).' },
      { title: 'Community Management', description: 'Monitor comments and DMs daily. Respond within 2 hours during business hours. Flag any negative comments or PR issues to the team.' },
      { title: 'Weekly Analytics Check', description: 'Review post performance every Friday. Identify top performers. Adjust next week\'s content based on engagement data.' },
      { title: 'Monthly Report', description: 'Compile monthly analytics report. Compare to KPIs. Include growth metrics, engagement rates, and top content. Present insights at client check-in.' },
    ],
    createdAt: '2025-10-01T10:00:00Z',
    updatedAt: '2026-03-20T10:00:00Z',
  },
  {
    id: 'sop-5',
    title: 'Content Writing & Publishing',
    description: 'Standard workflow for blog posts and long-form content from ideation to publication.',
    category: 'Content',
    status: 'Active',
    authorId: 'tm-6',
    version: '1.5',
    steps: [
      { title: 'Topic Research', description: 'Review keyword research for content opportunities. Check competitor content. Align with client\'s content strategy and goals.' },
      { title: 'Outline & Brief', description: 'Create detailed content outline with H2/H3 structure. Include target keyword, word count, and CTA. Get client approval if needed.' },
      { title: 'Draft Writing', description: 'Write first draft following the outline. Include internal and external links. Add image suggestions or placeholders. Aim for SEO-optimized but natural writing.' },
      { title: 'Editing & Review', description: 'Self-edit for grammar and flow. Run through Grammarly. Have a team member review for accuracy. Check SEO optimization (Semrush Writing Assistant).' },
      { title: 'Client Approval', description: 'Send draft to client for review. Allow 48 hours for feedback. Make revisions as needed. Get written approval to publish.' },
      { title: 'Publishing', description: 'Format post in CMS with proper headings, images, and meta data. Add featured image. Set up internal links. Publish and share on social channels.' },
    ],
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2026-02-28T10:00:00Z',
  },
  {
    id: 'sop-6',
    title: 'WordPress Development Standards',
    description: 'Coding standards and best practices for all WordPress development projects.',
    category: 'Development',
    status: 'Active',
    authorId: 'tm-4',
    version: '2.2',
    steps: [
      { title: 'Local Development Setup', description: 'Use Local by Flywheel for local WordPress development. Clone the production site for an accurate environment. Never develop directly on production.' },
      { title: 'Theme Development', description: 'Use a starter theme (Underscores or custom). Follow WordPress coding standards. Use Sass for stylesheets. Keep functions.php organized with includes.' },
      { title: 'Plugin Management', description: 'Minimize plugin usage — only install what\'s necessary. Vet plugins for security, updates, and reviews. Document all installed plugins and their purpose.' },
      { title: 'Version Control', description: 'Track theme files in Git. Use .gitignore for wp-core, uploads, and plugins. Commit with descriptive messages. Use feature branches for new work.' },
      { title: 'Testing & QA', description: 'Test on staging environment before production. Verify on mobile devices. Run accessibility checks (WAVE). Test all forms and interactive elements.' },
      { title: 'Deployment', description: 'Deploy via WP Engine Git Push or SFTP. Clear all caches after deployment. Verify changes on production. Monitor for errors in the first 24 hours.' },
    ],
    createdAt: '2025-07-15T10:00:00Z',
    updatedAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'sop-7',
    title: 'Client Offboarding',
    description: 'Process for wrapping up a project or ending a client relationship professionally.',
    category: 'Client Onboarding',
    status: 'Draft',
    authorId: 'tm-5',
    version: '0.9',
    steps: [
      { title: 'Final Deliverables', description: 'Ensure all deliverables are complete and approved. Package final files (PSDs, source code, assets). Transfer to client Google Drive.' },
      { title: 'Knowledge Transfer', description: 'Create handoff documentation. Record Loom training videos for CMS usage. Provide login credentials and hosting info.' },
      { title: 'Account Cleanup', description: 'Transfer domain ownership if applicable. Update DNS records. Remove agency access to client accounts (if project-based). Archive Slack channel.' },
      { title: 'Final Invoice & Review', description: 'Send final invoice. Request a testimonial or case study approval. Send satisfaction survey. Schedule a 30-day follow-up.' },
    ],
    createdAt: '2026-03-15T10:00:00Z',
    updatedAt: '2026-03-28T10:00:00Z',
  },
  {
    id: 'sop-8',
    title: 'Sales Discovery Call',
    description: 'Framework for conducting effective discovery calls with prospective clients.',
    category: 'Sales',
    status: 'Under Review',
    authorId: 'tm-5',
    version: '1.0',
    steps: [
      { title: 'Pre-Call Research', description: 'Review the prospect\'s website and social media. Note strengths and improvement areas. Research their industry and competitors.' },
      { title: 'Introduction (5 min)', description: 'Brief agency intro. Set the agenda for the call. Ask about their role and the company.' },
      { title: 'Discovery Questions (20 min)', description: 'What are your business goals? What marketing are you currently doing? What\'s working and what\'s not? What does success look like? What\'s your timeline and budget range?' },
      { title: 'Solution Overview (10 min)', description: 'Present relevant services based on their needs. Share a similar case study. Explain our process at a high level.' },
      { title: 'Next Steps (5 min)', description: 'Summarize key points. Outline the proposal process and timeline. Schedule follow-up. Send a thank-you email within 2 hours.' },
    ],
    createdAt: '2026-02-20T10:00:00Z',
    updatedAt: '2026-03-30T10:00:00Z',
  },
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
