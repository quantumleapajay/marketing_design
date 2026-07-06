/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import { cn } from './lib/utils';
import { Login } from './components/Login';
import { TeamManagement } from './components/TeamManagement';
import { SettingsPage } from './components/Settings';
import { Webinars } from './components/Webinars';
import { BBSEvents } from './components/BBSEvents';
import { CreateBBSEvent, NewBBSEventPayload } from './components/CreateBBSEvent';
import { BBSEventDetail } from './components/BBSEventDetail';
import { BSWStartNew } from './components/BSWStartNew';
import { WebinarDetail } from './components/WebinarDetail';
import { CreateWebinar } from './components/CreateWebinar';
import { CreateReinviteBatch } from './components/CreateReinviteBatch';
import { PaymentLinks } from './components/PaymentLinks';
import { CreatePaymentLink } from './components/CreatePaymentLink';
import { Contacts } from './components/Contacts';
import { DigitalProducts } from './components/DigitalProducts';
import { Transactions } from './components/Transactions';
import { PACEPaymentLinks } from './components/PACEPaymentLinks';
import { CreatePACEPaymentLink } from './components/CreatePACEPaymentLink';
import { PACEBatches } from './components/PACEBatches';
import { CreatePACEBatch } from './components/CreatePACEBatch';
import { PACEPayments } from './components/PACEPayments';
import { PACESalesDashboard } from './components/PACESalesDashboard';
import { PACEOverflow } from './components/PACEOverflow';
import { UnifiedMarketingDashboard } from './components/UnifiedMarketingDashboard';
import { MarketingReports } from './components/MarketingReports';
import { Campaigns, CampaignPrefillContext, Campaign } from './components/Campaigns';
import { AuditLog } from './pages/AuditLog';
import { SessionExpiredModal } from './components/SessionExpiredModal';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  Megaphone, 
  Settings, 
  LogOut,
  Menu,
  X,
  Video,
  CalendarDays,
  TrendingUp,
  Inbox,
  Link2,
  BarChart2,
  Package,
  Receipt,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Bell,
  User as UserIcon,
  CircleUser,
  Clock,
  FileSearch,
  UserCog,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Badge } from "./components/ui/badge";
import { TooltipProvider } from "./components/ui/tooltip";

function TopBar({
  title,
  onMenuClick,
  onQuickAction,
}: {
  title: string;
  onMenuClick: () => void;
  onQuickAction?: (action: 'payment-link' | 'bsw-event' | 'bbs-event' | 'pace-batch') => void;
}) {
  const { user, logout } = useAuth();

  return (
    <header className="h-[56px] bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-slate-900 truncate max-w-[150px] md:max-w-none">{title}</h1>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <button
          type="button"
          className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors text-white shadow-sm shadow-blue-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Quick actions"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Quick Actions:</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onQuickAction?.('pace-batch')}
              >
                <TrendingUp className="mr-2 h-4 w-4 text-amber-600" />
                <span>Add PACE batch</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onQuickAction?.('bbs-event')}
              >
                <CalendarDays className="mr-2 h-4 w-4 text-emerald-600" />
                <span>BBS Event</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onQuickAction?.('bsw-event')}
              >
                <Video className="mr-2 h-4 w-4 text-blue-600" />
                <span>BSW Event</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onQuickAction?.('payment-link')}
              >
                <Link2 className="mr-2 h-4 w-4 text-violet-600" />
                <span>Add Payment link</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center space-x-2 p-1 hover:bg-slate-100 rounded-lg transition-colors">
            <Avatar className="h-8 w-8 border border-slate-200">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {user?.firstName?.[0] ?? '?'}{user?.lastName?.[0] ?? '?'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function Dashboard() {
  const { user, logout, setSessionExpired } = useAuth();
  const teamAuditAccess =
    typeof window !== 'undefined' && window.localStorage.getItem('audit_log_access_marketing_team') === 'true';
  const hasAuditAccess = user?.role === 'Marketing Head' || teamAuditAccess;
  const [activeTab, setActiveTab] = useState('unified-dashboard');
  const [paceTab, setPaceTab] = useState('batches');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingPaymentLink, setEditingPaymentLink] = useState<any>(null);
  const [editingPaceLink, setEditingPaceLink] = useState<any>(null);
  const [selectedWebinar, setSelectedWebinar] = useState<any>(null);
  const [selectedBBSEvent, setSelectedBBSEvent] = useState<NewBBSEventPayload | null>(null);
  const [campaignPrefill, setCampaignPrefill] = useState<CampaignPrefillContext | null>(null);
  const [eventLinkedCampaigns, setEventLinkedCampaigns] = useState<Campaign[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    window.localStorage.setItem('sidebar_collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  const openPrefilledCampaign = (context: { programName: string; sourceEventId?: string; sourceEventName?: string }) => {
    setCampaignPrefill({
      programName: context.programName,
      sourceEventId: context.sourceEventId,
      sourceEventName: context.sourceEventName,
      token: Date.now(),
    });
    setActiveTab('campaigns');
  };

  const navItems = [
    { id: 'unified-dashboard', label: 'Unified Dashboard', icon: LayoutDashboard, roles: ['Marketing Head', 'Marketing Team Member'] },
    { id: 'bsw', label: 'BSW (Webinars)', icon: Video, roles: ['Marketing Head', 'Marketing Team Member'], badge: '3', badgeColor: 'bg-orange-100 text-orange-600' },
    { id: 'bsw-new', label: 'BSW Webinars - start new', icon: Video, roles: ['Marketing Head', 'Marketing Team Member'] },
    { id: 'bbs', label: 'BBS (Events)', icon: CalendarDays, roles: ['Marketing Head', 'Marketing Team Member'] },
    { id: 'pace', label: 'PACE', icon: TrendingUp, roles: ['Marketing Head', 'Marketing Team Member'], badge: '8', badgeColor: 'bg-amber-100 text-amber-600' },
    { id: 'contacts', label: 'Clients', icon: Users, roles: ['Marketing Head', 'Marketing Team Member'] },
    { id: 'payments', label: 'Payment Links', icon: Link2, roles: ['Marketing Head', 'Marketing Team Member'] },
    { id: 'products', label: 'Digital Products', icon: Package, roles: ['Marketing Head', 'Marketing Team Member'] },
    { id: 'transactions', label: 'Transactions', icon: Receipt, roles: ['Marketing Head', 'Marketing Team Member'] },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone, roles: ['Marketing Head', 'Marketing Team Member'] },
    { id: 'reports', label: 'Reports', icon: BarChart2, roles: ['Marketing Head', 'Marketing Team Member'] },
    { id: 'team', label: 'Team Management', icon: UserCog, roles: ['Marketing Head'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['Marketing Head'] },
    { id: 'audit-log', label: 'Audit Log', icon: FileSearch, roles: ['Marketing Head', 'Marketing Team Member'] },
  ];

  const navGroups = [
    { id: 'dashboard-group', items: ['unified-dashboard'] },
    { id: 'programs', label: 'PROGRAMS', items: ['bsw', 'bsw-new', 'bbs', 'pace'] },
    { id: 'misc', label: 'RECORDS', items: ['contacts', 'payments', 'products', 'transactions'] },
    { id: 'campaigns-group', items: ['campaigns'] },
    { id: 'reports-group', items: ['reports'] },
    { id: 'admin', label: 'ADMIN', items: ['team', 'settings'], roles: ['Marketing Head'] },
    { id: 'audit-group', items: ['audit-log'] },
  ];

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initialOpen: Record<string, boolean> = {};
    navGroups.forEach(group => {
      if (group.items.includes('dashboard')) {
        initialOpen[group.id] = true;
      }
      if (group.items.includes('unified-dashboard')) {
        initialOpen[group.id] = true;
      }
    });
    return initialOpen;
  });

  // Inactivity tracking is now handled in AuthProvider

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => {
      const isOpen = prev[groupId];
      // If we are opening a group, close all others. If we are closing, just close it.
      return isOpen ? {} : { [groupId]: true };
    });
  };

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };
  const visibleNavItems = navItems.filter((item) => {
    if (!item.roles.includes(user?.role || '')) return false;
    if (item.id === 'audit-log' && !hasAuditAccess) return false;
    return true;
  });
  const renderCollapsedNavItems = (isMobile = false) => (
    visibleNavItems.map((item) => {
      const isActive = activeTab === item.id;
      const showBadgeDot = item.badge && (item.id !== 'pace' || (activeTab !== 'pace' && activeTab !== 'create-pace-batch' && activeTab !== 'create-pace-link'));
      return (
        <button
          key={item.id}
          onClick={() => handleNavClick(item.id)}
          title={item.label}
          aria-label={item.label}
          className={cn('group relative flex w-full justify-center py-1.5', isMobile && 'py-2.5')}
        >
          <span
            className={cn(
              'relative flex h-8 w-8 items-center justify-center rounded-full transition-colors',
              isActive ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'
            )}
          >
            <item.icon className="h-4.5 w-4.5" />
            {showBadgeDot && (
              <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500" />
            )}
          </span>
          {!isMobile && (
            <span className="pointer-events-none absolute left-[calc(100%+4px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-[10px] py-1 text-[12px] text-white opacity-0 group-hover:opacity-100 z-50">
              {item.label}
            </span>
          )}
        </button>
      );
    })
  );

  const renderNavGroup = (group: any, isMobile = false) => {
    // Check if group is visible for current user
    if (group.roles && !group.roles.includes(user?.role)) return null;

    const groupItems = navItems.filter(item => group.items.includes(item.id));
    const isStandalone = !group.label;

    if (isStandalone) {
      return groupItems.map(item => (
        <button
          key={item.id}
          onClick={() => handleNavClick(item.id)}
          className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
            activeTab === item.id 
              ? 'bg-white text-slate-900 shadow-sm border border-slate-100' 
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
          }`}
        >
          <item.icon className={`mr-3 h-5 w-5 ${activeTab === item.id ? 'text-slate-900' : 'text-slate-400'}`} />
          <span className={activeTab === item.id ? 'font-bold' : ''}>{item.label}</span>
        </button>
      ));
    }

    const isOpen = openGroups[group.id];
    const isGroupActive = group.items.includes(activeTab);

    return (
      <div key={group.id} className="space-y-1">
        <button
          onClick={() => toggleGroup(group.id)}
          className={`flex items-center justify-between w-full px-3 py-2.5 text-sm transition-all rounded-xl ${
            isGroupActive 
              ? 'text-slate-900' 
              : 'font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
          }`}
        >
          <div className="flex items-center">
            <div className="mr-3 h-5 w-5 flex items-center justify-center">
              {(() => {
                const Icon = groupItems[0]?.icon;
                return Icon ? (
                  <Icon className={`h-5 w-5 transition-colors ${isGroupActive ? 'text-slate-600' : 'text-slate-400'}`} />
                ) : null;
              })()}
            </div>
            <span className={isGroupActive ? 'font-bold text-slate-900' : ''}>{group.label}</span>
          </div>
          {isOpen ? (
            <ChevronDown className={`h-4 w-4 transition-colors ${isGroupActive ? 'text-slate-600' : 'text-slate-400'}`} />
          ) : (
            <ChevronRight className={`h-4 w-4 transition-colors ${isGroupActive ? 'text-slate-600' : 'text-slate-400'}`} />
          )}
        </button>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="relative ml-5 pl-4 border-l border-slate-200 space-y-1 mt-1"
            >
              {groupItems.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center justify-between w-full px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                    activeTab === item.id 
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-100' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
                  }`}
                >
                  {/* Curved branch line */}
                  <div className="absolute -left-4 top-0 w-4 h-1/2 border-l border-b border-slate-200 rounded-bl-xl" />
                  
                  <span className={activeTab === item.id ? 'font-bold' : ''}>{item.label}</span>
                  
                  {item.badge && (item.id !== 'pace' || (activeTab !== 'pace' && activeTab !== 'create-pace-batch' && activeTab !== 'create-pace-link')) && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const activeItemLabel = navItems.find(item => item.id === activeTab)?.label || 'Dashboard';

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden font-sans">
      {/* Sidebar for Desktop */}
      <aside
        className="hidden md:flex flex-col bg-[#F3F4F6] border-r border-[#E5E7EB] transition-[width] duration-200 ease-in-out relative"
        style={{ width: isSidebarCollapsed ? 56 : 248 }}
      >
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute top-6 right-0 translate-x-1/2 h-7 w-7 rounded-md border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center shadow-sm z-20"
        >
          {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
        <div className={cn('pt-5 pb-4', isSidebarCollapsed ? 'px-2' : 'px-6')}>
          <div className={cn('mt-3 w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100', isSidebarCollapsed ? 'mx-auto' : '')}>
            <div className="w-6 h-6 border-2 border-slate-900 rounded-full flex items-center justify-center">
              <div className="w-px h-6 bg-slate-900 absolute" />
              <div className="w-6 h-px bg-slate-900 absolute" />
            </div>
          </div>
        </div>
        
        {isSidebarCollapsed ? (
          <nav className="flex-1 px-2 space-y-1.5 overflow-y-auto pb-4 custom-scrollbar">
            {renderCollapsedNavItems(false)}
          </nav>
        ) : (
          <nav className="flex-1 px-4 space-y-2 overflow-y-auto pb-4 custom-scrollbar">
            {navGroups.map(group => renderNavGroup(group))}
          </nav>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          title={activeItemLabel}
          onMenuClick={() => setIsMobileMenuOpen(true)}
          onQuickAction={(action) => {
            if (action === 'payment-link') {
              setEditingPaymentLink(null);
              setActiveTab('create-bsw-link');
            } else if (action === 'bsw-event') {
              setSelectedWebinar(null);
              setActiveTab('create-webinar');
            } else if (action === 'bbs-event') {
              setActiveTab('create-bbs-event');
            } else if (action === 'pace-batch') {
              setActiveTab('create-pace-batch');
            }
          }}
        />
        
        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed inset-0 bg-white z-50 flex flex-col"
            >
              <div className="h-[56px] border-b border-slate-200 flex items-center justify-between px-4">
                <h2 className="text-lg font-bold text-primary">QL One</h2>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                    title={isSidebarCollapsed ? 'Expand menu' : 'Compact menu'}
                    aria-label={isSidebarCollapsed ? 'Expand menu' : 'Compact menu'}
                    className="h-8 w-8 border border-slate-200 rounded-md"
                  >
                    {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <nav className={cn("flex-1 py-6 overflow-y-auto", isSidebarCollapsed ? "px-3 space-y-2" : "px-4 space-y-4")}>
                {isSidebarCollapsed ? renderCollapsedNavItems(true) : navGroups.map(group => renderNavGroup(group, true))}
              </nav>
              <div className="p-4 border-t border-slate-100">
                <Button variant="ghost" className="w-full justify-start text-slate-600" onClick={logout}>
                  <LogOut className="mr-3 h-5 w-5" />
                  Logout
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto bg-white relative">
          {activeTab === 'team' ? (
            <TeamManagement />
          ) : activeTab === 'settings' ? (
            <SettingsPage onOpenAuditLog={() => setActiveTab('audit-log')} />
          ) : activeTab === 'unified-dashboard' ? (
            <UnifiedMarketingDashboard />
          ) : activeTab === 'bsw' ? (
            <Webinars 
              onViewDetails={(webinar) => {
                setSelectedWebinar(webinar);
                setActiveTab('webinar-detail');
              }} 
              onCreateCampaign={(event) =>
                openPrefilledCampaign({
                  programName: event.name,
                  sourceEventId: event.id,
                  sourceEventName: event.name,
                })
              }
              onCreateWebinar={() => {
                setSelectedWebinar(null);
                setActiveTab('create-webinar');
              }}
            />
          ) : activeTab === 'bbs' ? (
            <BBSEvents
              onCreateEvent={() => setActiveTab('create-bbs-event')}
              onViewDetails={(event) => {
                setSelectedBBSEvent({
                  id: event.id,
                  name: event.name,
                  code: event.code,
                  date: event.date,
                  slot: event.slot === 'Morning' ? 'Morning' : 'Evening',
                  city: event.city,
                  venue: 'Venue to be confirmed',
                  trainer: event.speaker,
                  targetCapacity: event.capacity,
                  registrationsCloseDate: event.date,
                  status: event.status === 'Upcoming' ? 'Upcoming' : event.status === 'Cancelled' ? 'Cancelled' : 'Completed',
                  registrations: event.registrations,
                  attended: event.attended,
                  rsvpConfirmed: 178,
                  edgeCaseType: event.edgeCaseType,
                  regClosesInDays: event.regClosesInDays,
                });
                setActiveTab('bbs-event-detail');
              }}
              onCreateCampaign={(event) =>
                openPrefilledCampaign({
                  programName: event.name,
                  sourceEventId: event.id,
                  sourceEventName: event.name,
                })
              }
            />
          ) : activeTab === 'create-bbs-event' ? (
            <CreateBBSEvent
              onBack={() => setActiveTab('bbs')}
              onCreated={(event) => {
                setSelectedBBSEvent(event);
                setActiveTab('bbs-event-detail');
              }}
            />
          ) : activeTab === 'bbs-event-detail' ? (
            <BBSEventDetail
              event={selectedBBSEvent}
              onBack={() => setActiveTab('bbs')}
              linkedCampaigns={eventLinkedCampaigns}
              onCreateCampaignForEvent={(event) =>
                openPrefilledCampaign({
                  programName: event.name,
                  sourceEventId: event.id,
                  sourceEventName: event.name,
                })
              }
              onAddTrackedLink={() => {
                setEditingPaymentLink(null);
                setActiveTab('create-bsw-link');
              }}
            />
          ) : activeTab === 'webinar-detail' ? (
            <WebinarDetail 
              webinar={selectedWebinar}
              onBack={() => setActiveTab('bsw')} 
              onCreateReinviteBatch={() => setActiveTab('create-reinvite')}
              onNavigate={(tab) => setActiveTab(tab)}
              linkedCampaigns={eventLinkedCampaigns}
              onCreateCampaignForEvent={(event) =>
                openPrefilledCampaign({
                  programName: event.name,
                  sourceEventId: event.id,
                  sourceEventName: event.name,
                })
              }
            />
          ) : activeTab === 'create-reinvite' ? (
            <CreateReinviteBatch onBack={() => setActiveTab('webinar-detail')} />
          ) : activeTab === 'create-webinar' ? (
            <CreateWebinar onBack={() => setActiveTab('bsw')} />
          ) : activeTab === 'create-bsw-link' ? (
            <CreatePaymentLink
              onBack={() => {
                setEditingPaymentLink(null);
                setActiveTab('bbs-event-detail');
              }}
              initialData={editingPaymentLink}
            />
          ) : activeTab === 'bsw-new' ? (
            <BSWStartNew />
          ) : activeTab === 'contacts' ? (
            <Contacts />
          ) : activeTab === 'transactions' ? (
            <Transactions />
          ) : activeTab === 'payments' ? (
            <PaymentLinks />
          ) : activeTab === 'products' ? (
            <DigitalProducts />
          ) : activeTab === 'pace' ? (
            <div className="flex flex-col h-full">
              {/* Internal Tab Row */}
              <div className="px-8 pt-4 border-b border-slate-100 bg-white sticky top-0 z-20">
                <div className="flex items-center gap-8">
                  {[
                    { id: 'batches', label: 'Batches' },
                    { id: 'payments', label: 'Payments' },
                    { id: 'payment-links', label: 'Payment Links' },
                    { id: 'sales-dashboard', label: 'Sales Dashboard' },
                    { id: 'overflow', label: 'Overflow', badge: '8' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setPaceTab(tab.id)}
                      className={cn(
                        "pb-4 text-sm font-bold capitalize transition-all relative flex items-center",
                        paceTab === tab.id ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {tab.label}
                      {tab.badge && (
                        <span className="ml-2 bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded text-[10px] font-black">
                          {tab.badge}
                        </span>
                      )}
                      {paceTab === tab.id && (
                        <motion.div 
                          layoutId="pace-active-tab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" 
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1">
                {paceTab === 'batches' ? (
                  <PACEBatches
                    onCreateClick={() => setActiveTab('create-pace-batch')}
                    linkedCampaigns={eventLinkedCampaigns}
                    onCreateCampaign={(batch) =>
                      openPrefilledCampaign({
                        programName: batch.name,
                        sourceEventId: batch.id,
                        sourceEventName: batch.name,
                      })
                    }
                  />
                ) : paceTab === 'payments' ? (
                  <PACEPayments />
                ) : paceTab === 'payment-links' ? (
                  <PACEPaymentLinks 
                    onCreateClick={() => {
                      setEditingPaceLink(null);
                      setActiveTab('create-pace-link');
                    }}
                    onEditClick={(link) => {
                      setEditingPaceLink(link);
                      setActiveTab('create-pace-link');
                    }}
                  />
                ) : paceTab === 'sales-dashboard' ? (
                  <PACESalesDashboard onViewOverflow={() => setPaceTab('overflow')} />
                ) : paceTab === 'overflow' ? (
                  <PACEOverflow />
                ) : null}
              </div>
            </div>
          ) : activeTab === 'create-pace-batch' ? (
            <CreatePACEBatch onBack={() => setActiveTab('pace')} />
          ) : activeTab === 'create-pace-link' ? (
            <CreatePACEPaymentLink 
              onBack={() => {
                setActiveTab('pace');
                setPaceTab('payment-links');
              }} 
              initialData={editingPaceLink}
            />
          ) : activeTab === 'reports' ? (
            <MarketingReports />
          ) : activeTab === 'campaigns' ? (
            <Campaigns
              prefillContext={campaignPrefill}
              onCampaignCreated={(campaign) => {
                if (campaign.sourceEventId) {
                  setEventLinkedCampaigns((prev) => [campaign, ...prev]);
                }
              }}
            />
          ) : activeTab === 'audit-log' ? (
            <AuditLog />
          ) : (
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-slate-900 capitalize">{activeTab.replace('-', ' ')}</h1>
              </div>
              <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed bg-slate-50/50">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
                  <LayoutDashboard className="h-12 w-12 text-primary/40" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Module Under Construction</h2>
                <p className="text-slate-500 max-w-sm">
                  The {activeTab} module is currently being built. Check back soon for updates!
                </p>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, sessionExpired, logout } = useAuth();
  return (
    <>
      {user ? <Dashboard /> : <Login />}
      <SessionExpiredModal 
        open={sessionExpired} 
        onReLogin={() => {
          logout();
        }} 
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <AppContent />
        <Toaster position="top-right" richColors />
      </TooltipProvider>
    </AuthProvider>
  );
}
