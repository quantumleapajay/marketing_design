export type UserRole = 'Marketing Head' | 'Marketing Team Member' | 'Campaign Manager' | string;

export type AccessLevel = 'Full' | 'Edit' | 'View' | 'None' | 'Admin';

export interface UserPermissions {
  [key: string]: AccessLevel;
}

export interface Role {
  id: string;
  name: string;
  memberCount: number;
  isDeletable: boolean;
  permissions: UserPermissions;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  role: string | Role;
  status: 'Active' | 'Inactive';
}

export type AppState = 'loading' | 'ready' | 'error';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  utmSource?: string;
  paymentStatus?: string;
  amount?: string;
  attendance?: string;
  duration?: string;
  batch?: string;
}

export interface Trainer {
  id: string;
  name: string;
  email: string;
  mobile: string;
  status: 'Active' | 'Inactive';
}

export interface DigitalProduct {
  id: string;
  name: string;
  type: 'Free' | 'Paid';
  status: 'Active' | 'Inactive';
  createdDate: string;
  sent: number;
  failed: number;
}
