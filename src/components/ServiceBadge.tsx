import { ServiceType } from '@/lib/types';

const serviceStyles: Record<ServiceType, string> = {
  'Web Design': 'bg-violet-50 text-violet-700 ring-violet-600/20',
  SEO: 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
  'Social Media Marketing': 'bg-pink-50 text-pink-700 ring-pink-600/20',
  Branding: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  'Content Marketing': 'bg-teal-50 text-teal-700 ring-teal-600/20',
  'PPC Advertising': 'bg-red-50 text-red-700 ring-red-600/20',
};

export default function ServiceBadge({ service }: { service: ServiceType }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${serviceStyles[service]}`}>
      {service}
    </span>
  );
}
