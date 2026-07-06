
import { AccessLevel } from './types';

export const MODULE_SECTIONS = [
  {
    title: 'Programs',
    modules: [
      { id: 'bsw', label: 'BSW (Webinars)' },
      { id: 'bbs', label: 'BBS (Events)' },
      { id: 'pace', label: 'PACE' },
    ],
  },
  {
    title: 'Outreach',
    modules: [
      { id: 'campaigns', label: 'Campaigns' },
      { id: 'calls', label: 'Call Campaigns' },
    ],
  },
  {
    title: 'Records',
    modules: [
      { id: 'contacts', label: 'Contacts' },
      { id: 'payments', label: 'Payment Links' },
      { id: 'products', label: 'Digital Products' },
      { id: 'transactions', label: 'Transactions' },
      { id: 'export', label: 'Export data' },
    ],
  },
  {
    title: 'Admin',
    modules: [
      { id: 'team', label: 'Team Management' },
      { id: 'settings', label: 'Settings' },
    ],
  },
];

export const getPillStyles = (level: AccessLevel) => {
  switch (level) {
    case 'Full': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Edit': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'View': return 'bg-sky-100 text-sky-700 border-sky-200';
    case 'None': return 'bg-slate-100 text-slate-500 border-slate-200';
    case 'Admin': return 'bg-purple-100 text-purple-700 border-purple-200';
    default: return 'bg-slate-100 text-slate-500';
  }
};

export const getDotColor = (level: AccessLevel) => {
  switch (level) {
    case 'Full': return 'bg-emerald-500';
    case 'Edit': return 'bg-blue-500';
    case 'View': return 'bg-sky-500';
    case 'None': return 'bg-slate-400';
    case 'Admin': return 'bg-purple-500';
    default: return 'bg-slate-400';
  }
};
