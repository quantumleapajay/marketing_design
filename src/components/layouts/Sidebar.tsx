import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Video,
  CalendarDays,
  GraduationCap,
  Users,
  Link,
  Package,
  Receipt,
  Megaphone,
  BarChart2,
  UserCog,
  Settings,
  ChevronRight,
} from 'lucide-react';

type NavItem = {
  path: string;
  label: string;
  icon: React.ElementType;
};

type NavGroup = {
  type: 'group';
  label: string;
  adminOnly?: boolean;
  items: NavItem[];
};

type NavSingle = {
  type: 'single';
  path: string;
  label: string;
  icon: React.ElementType;
};

type NavEntry = NavGroup | NavSingle;

const navStructure: NavEntry[] = [
  {
    type: 'single',
    path: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    type: 'group',
    label: 'PROGRAMS',
    items: [
      { path: '/bsw', label: 'BSW (Webinars)', icon: Video },
      { path: '/bbs', label: 'BBS (Events)', icon: CalendarDays },
      { path: '/pace', label: 'PACE', icon: GraduationCap },
    ],
  },
  {
    type: 'group',
    label: 'RECORDS',
    items: [
      { path: '/contacts', label: 'Contacts', icon: Users },
      { path: '/payment-links', label: 'Payment Links', icon: Link },
      { path: '/digital-products', label: 'Digital Products', icon: Package },
      { path: '/transactions', label: 'Transactions', icon: Receipt },
    ],
  },
  {
    type: 'single',
    path: '/campaigns',
    label: 'Campaigns',
    icon: Megaphone,
  },
  {
    type: 'single',
    path: '/reports',
    label: 'Reports',
    icon: BarChart2,
  },
  {
    type: 'group',
    label: 'ADMIN',
    adminOnly: true,
    items: [
      { path: '/team-management', label: 'Team Management', icon: UserCog },
      { path: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

// Replace this with your actual role check
const isMarketingHead = true;

export function Sidebar() {
  const location = useLocation();

  // Determine which group contains the active route
  const getActiveGroup = () => {
    for (const entry of navStructure) {
      if (entry.type === 'group') {
        if (entry.items.some((item) => location.pathname.startsWith(item.path) && item.path !== '/')) {
          return entry.label;
        }
      }
    }
    return 'PROGRAMS'; // default open group
  };

  const [openGroup, setOpenGroup] = useState<string>(getActiveGroup());

  const toggleGroup = (label: string) => {
    setOpenGroup((prev) => (prev === label ? '' : label));
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      style={{
        width: '240px',
        minHeight: '100vh',
        borderRight: '1px solid var(--sidebar-border, #E5E7EB)',
        background: 'var(--sidebar, #FAFAFA)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
      }}
    >
      {/* Logo / App name */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--sidebar-border, #E5E7EB)' }}>
        <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--sidebar-primary, #111827)' }}>
          Marketing
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {navStructure.map((entry) => {
          // Hide admin group for non-admin
          if (entry.type === 'group' && entry.adminOnly && !isMarketingHead) {
            return null;
          }

          if (entry.type === 'single') {
            const Icon = entry.icon;
            const active = isActive(entry.path);
            return (
              <NavLink
                key={entry.path}
                to={entry.path}
                end={entry.path === '/'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  marginBottom: '2px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: active
                    ? 'var(--sidebar-accent-foreground, #1D4ED8)'
                    : 'var(--sidebar-foreground, #374151)',
                  background: active ? 'var(--sidebar-accent, #EFF6FF)' : 'transparent',
                }}
              >
                <Icon size={18} />
                {entry.label}
              </NavLink>
            );
          }

          // Group
          const isOpen = openGroup === entry.label;
          return (
            <div key={entry.label} style={{ marginBottom: '4px' }}>
              {/* Group header — clickable to toggle */}
              <button
                type="button"
                onClick={() => toggleGroup(entry.label)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '6px 10px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '6px',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--muted-foreground, #9CA3AF)',
                  }}
                >
                  {entry.label}
                </span>
                <ChevronRight
                  size={14}
                  style={{
                    color: 'var(--muted-foreground, #9CA3AF)',
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 150ms ease',
                  }}
                />
              </button>

              {/* Group items — only render when open */}
              {isOpen && (
                <div style={{ marginTop: '2px' }}>
                  {entry.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 10px 8px 22px',
                          borderRadius: '6px',
                          marginBottom: '2px',
                          textDecoration: 'none',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: active
                            ? 'var(--sidebar-accent-foreground, #1D4ED8)'
                            : 'var(--sidebar-foreground, #374151)',
                          background: active ? 'var(--sidebar-accent, #EFF6FF)' : 'transparent',
                        }}
                      >
                        <Icon size={18} />
                        {item.label}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
