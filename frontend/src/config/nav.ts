import type { Role } from '@/types';
import {
  LayoutDashboard, Truck, Users, Route, Wrench, Fuel, Receipt,
  BarChart3, Settings, type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  roles: Role[];
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'] },
  { label: 'Vehicles', path: '/vehicles', icon: Truck, roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer'] },
  { label: 'Drivers', path: '/drivers', icon: Users, roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer'] },
  { label: 'Trips', path: '/trips', icon: Route, roles: ['Fleet Manager', 'Dispatcher'] },
  { label: 'Maintenance', path: '/maintenance', icon: Wrench, roles: ['Fleet Manager', 'Safety Officer'] },
  { label: 'Fuel Logs', path: '/fuel', icon: Fuel, roles: ['Fleet Manager', 'Financial Analyst'] },
  { label: 'Expenses', path: '/expenses', icon: Receipt, roles: ['Fleet Manager', 'Financial Analyst'] },
  { label: 'Reports & Analytics', path: '/reports', icon: BarChart3, roles: ['Fleet Manager', 'Financial Analyst'] },
  { label: 'Settings', path: '/settings', icon: Settings, roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'] },
];

export function navForRole(role: Role): NavItem[] {
  return navItems.filter((n) => n.roles.includes(role));
}
