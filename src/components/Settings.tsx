
import React, { useState, useMemo } from 'react';
import { useAuth } from '../lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Video, 
  Link as LinkIcon, 
  Bell, 
  ShieldAlert,
  ChevronRight,
  Plus,
  Search,
  X,
  Filter,
  AlertCircle,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  XCircle,
  Users,
  Loader2,
  Save,
  Pencil,
  Copy
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { cn, getAvatarColors } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Trainer } from '../types';
import AuditTrail from './AuditTrail';

type SettingsSection = 'zoom' | 'utm' | 'notifications' | 'security' | 'trainers' | 'sketchnotes';

interface ZoomAccount {
  id: string;
  email: string;
  status: 'Active' | 'Inactive';
  webinarsScheduled: number;
  linkedPrograms?: { name: string; date: string }[];
}

type UTMType = 'Source' | 'Medium' | 'Term' | 'Content';

interface UTMTag {
  id: string;
  type: UTMType;
  name: string;
  platformSource: string;
  createdBy: string;
  date: string;
  status: 'Active' | 'Inactive';
}

const MOCK_UTMS: UTMTag[] = [
  { id: '1', type: 'Source', name: 'Google', platformSource: 'Google Ads', createdBy: 'Ria Sharma', date: '1 Mar 2026', status: 'Active' },
  { id: '2', type: 'Source', name: 'Facebook', platformSource: 'Meta Ads', createdBy: 'Ria Sharma', date: '1 Mar 2026', status: 'Active' },
  { id: '3', type: 'Source', name: 'Organic', platformSource: 'Direct', createdBy: 'Amit Patel', date: '5 Mar 2026', status: 'Active' },
  { id: '4', type: 'Medium', name: 'Paid', platformSource: '- ', createdBy: 'Ria Sharma', date: '1 Mar 2026', status: 'Active' },
  { id: '5', type: 'Medium', name: 'Social', platformSource: '- ', createdBy: 'Ria Sharma', date: '1 Mar 2026', status: 'Active' },
  { id: '6', type: 'Term', name: 'PACE', platformSource: '- ', createdBy: 'Amit Patel', date: '10 Mar 2026', status: 'Active' },
  { id: '7', type: 'Source', name: 'Instagram', platformSource: 'Meta Ads', createdBy: 'Ria Sharma', date: '15 Mar 2026', status: 'Inactive' },
];

interface SettingsPageProps {
  onOpenAuditLog?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onOpenAuditLog }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Marketing Head';
  
  const [activeSection, setActiveSection] = useState<SettingsSection>('zoom');
  const [zoomAccounts, setZoomAccounts] = useState<ZoomAccount[]>([
    { 
      id: '1', 
      email: 'zoom1@quantumleap.co.in', 
      status: 'Active', 
      webinarsScheduled: 3,
      linkedPrograms: [
        { name: 'BSW April Week 3', date: '19 Apr 2026' },
        { name: 'BSW Re-invite April', date: '13 Apr 2026' },
        { name: 'BSW May Week 1', date: '3 May 2026' },
      ]
    },
    { 
      id: '2', 
      email: 'zoom2@quantumleap.co.in', 
      status: 'Inactive', 
      webinarsScheduled: 0,
      linkedPrograms: []
    },
    { 
      id: '3', 
      email: 'zoom3@quantumleap.co.in', 
      status: 'Active', 
      webinarsScheduled: 1,
      linkedPrograms: [
        { name: 'BBS Workshop', date: '25 Apr 2026' }
      ]
    },
  ]);
  const [accountToToggle, setAccountToToggle] = useState<ZoomAccount | null>(null);
  const [accountDetails, setAccountDetails] = useState<ZoomAccount | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isReactivateDialogOpen, setIsReactivateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // UTM State
  const [utms, setUtms] = useState<UTMTag[]>(MOCK_UTMS);
  const [utmFilter, setUtmFilter] = useState<'All' | UTMType>('All');
  const [utmSearch, setUtmSearch] = useState('');
  const [isAddUtmOpen, setIsAddUtmOpen] = useState(false);
  const [isUpdatePasswordOpen, setIsUpdatePasswordOpen] = useState(false);
  const [isTrainerPanelOpen, setIsTrainerPanelOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [utmToDeactivate, setUtmToDeactivate] = useState<UTMTag | null>(null);
  const [isUtmDeactivateDialogOpen, setIsUtmDeactivateDialogOpen] = useState(false);
  const [expandedUtmId, setExpandedUtmId] = useState<string | null>(null);

  // Zoom Add Account State
  const [isAddZoomOpen, setIsAddZoomOpen] = useState(false);
  const [zoomForm, setZoomForm] = useState({
    name: '',
    email: '',
    apiKey: '',
    apiSecret: ''
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'success' | 'failed'>('idle');
  const [forceFail, setForceFail] = useState(false);

  const handleConnectZoom = async () => {
    setConnectionState('connecting');
    await new Promise(resolve => setTimeout(resolve, 2000));
    setConnectionState(forceFail ? 'failed' : 'success');
  };

  const finalizeZoomConnection = () => {
    const newAccount: ZoomAccount = {
      id: Math.random().toString(36).substr(2, 9),
      email: zoomForm.email,
      status: 'Active',
      webinarsScheduled: 0,
      linkedPrograms: []
    };
    setZoomAccounts(prev => [...prev, newAccount]);
    setIsAddZoomOpen(false);
    // Reset state
    setZoomForm({ name: '', email: '', apiKey: '', apiSecret: '' });
    setConnectionState('idle');
    toast.success('Zoom account connected successfully');
  };

  const [newUtm, setNewUtm] = useState({
    type: 'Source' as UTMType,
    name: '',
    platformSource: '',
  });

  // Notifications State
  const [notificationSettings, setNotificationSettings] = useState<Record<string, { whatsapp: boolean; email: boolean }>>({
    zoomFailed: { whatsapp: true, email: true },
    wpFailed: { whatsapp: true, email: true },
    brokenLink: { whatsapp: true, email: false },
    syncFailed: { whatsapp: false, email: true },
    paymentFailed: { whatsapp: true, email: true },
    refundReceived: { whatsapp: false, email: true },
    campaignFailed: { whatsapp: true, email: true },
    campaignSuccess: { whatsapp: false, email: false },
    dailyReport: { whatsapp: false, email: true },
    weeklyReport: { whatsapp: false, email: true },
  });

  const [initialNotifications, setInitialNotifications] = useState(notificationSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(notificationSettings) !== JSON.stringify(initialNotifications);
  }, [notificationSettings, initialNotifications]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setInitialNotifications(notificationSettings);
      toast.success('Settings saved successfully');
    } catch (err) {
      setSaveError('Failed to save settings. Please try again.');
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Trainer State
  const [trainers, setTrainers] = useState<Trainer[]>([
    { id: '1', name: 'Siddharth Shah', email: 'siddharth@quantumleap.co.in', mobile: '+91 98765 43210', status: 'Active' },
    { id: '2', name: 'Rajesh Kumar', email: 'rajesh@quantumleap.co.in', mobile: '+91 98765 43211', status: 'Active' },
    { id: '3', name: 'Ria Sharma', email: 'ria@quantumleap.co.in', mobile: '+91 98765 43212', status: 'Active' },
  ]);

  const [trainerForm, setTrainerForm] = useState({
    name: '',
    email: '',
    mobile: '',
  });

  const [isTrainerDeactivateDialogOpen, setIsTrainerDeactivateDialogOpen] = useState(false);
  const [isTrainerActivateDialogOpen, setIsTrainerActivateDialogOpen] = useState(false);
  const [trainerToToggle, setTrainerToToggle] = useState<Trainer | null>(null);

  // Sketch Note State
  const [sketchNoteLink, setSketchNoteLink] = useState('form.qloneapp.com/sketchnotes?batch=BSW-APR-W3');
  const [newSketchNoteLink, setNewSketchNoteLink] = useState('');
  const [sketchNoteHistory, setSketchNoteHistory] = useState([
    { id: '1', url: '...sketchnotes?batch=BSW-MAR-W3', updatedBy: 'Ria Sharma', date: '28 Mar 2026' },
    { id: '2', url: '...sketchnotes?batch=BSW-FEB-W2', updatedBy: 'Ria Sharma', date: '10 Feb 2026' },
  ]);
  const [isEmptySketchNote, setIsEmptySketchNote] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: 'Ria George',
    phone: '+91 98765 43200'
  });
  const [initialProfileForm, setInitialProfileForm] = useState({
    name: 'Ria George',
    phone: '+91 98765 43200'
  });

  // Security State
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const passwordRequirements = [
    { label: 'Minimum 8 characters', regex: /.{8,}/ },
    { label: '1 Upper case', regex: /[A-Z]/ },
    { label: '1 Lower case', regex: /[a-z]/ },
    { label: '1 Special Character', regex: /[!@#$%^&*(),.?":{}|<>]/ },
    { label: '1 Numerical', regex: /[0-9]/ },
  ];

  const checkRequirement = (regex: RegExp) => regex.test(passwords.new);
  const isPasswordValid = passwordRequirements.every(req => checkRequirement(req.regex));
  const passwordsMatch = passwords.new === passwords.confirm && passwords.confirm !== '';

  const handleToggleStatus = (account: ZoomAccount) => {
    if (account.status === 'Active') {
      setAccountToToggle(account);
      setIsConfirmDialogOpen(true);
    } else {
      setAccountToToggle(account);
      setIsReactivateDialogOpen(true);
    }
  };

  const confirmReactivation = () => {
    if (accountToToggle) {
      setZoomAccounts(prev => prev.map(acc => 
        acc.id === accountToToggle.id ? { ...acc, status: 'Active' } : acc
      ));
      toast.success(`Account ${accountToToggle.email} reactivated.`);
      setIsReactivateDialogOpen(false);
      setAccountToToggle(null);
    }
  };

  const confirmDeactivation = () => {
    if (accountToToggle) {
      setZoomAccounts(prev => prev.map(acc => 
        acc.id === accountToToggle.id ? { ...acc, status: 'Inactive' } : acc
      ));
      toast.success(`Account ${accountToToggle.email} deactivated.`);
      setIsConfirmDialogOpen(false);
      setAccountToToggle(null);
    }
  };

  const handleAddUtm = (e: React.FormEvent) => {
    e.preventDefault();
    const utm: UTMTag = {
      id: Math.random().toString(36).substr(2, 9),
      type: newUtm.type,
      name: newUtm.name,
      platformSource: newUtm.type === 'Source' ? newUtm.platformSource : '- ',
      createdBy: `${user?.firstName} ${user?.lastName}`,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'Active',
    };
    setUtms([utm, ...utms]);
    setIsAddUtmOpen(false);
    setNewUtm({ type: 'Source', name: '', platformSource: '' });
    toast.success('UTM created and synced to HubSpot.', {
      className: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    });
  };

  const handleTrainerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTrainer) {
      setTrainers(prev => prev.map(t => t.id === editingTrainer.id ? { ...t, ...trainerForm } : t));
      toast.success('Trainer updated successfully.');
    } else {
      const trainer: Trainer = {
        id: Math.random().toString(36).substr(2, 9),
        ...trainerForm,
        status: 'Active',
      };
      setTrainers([trainer, ...trainers]);
      toast.success('Trainer added to the system.');
    }
    setIsTrainerPanelOpen(false);
    setEditingTrainer(null);
    setTrainerForm({ name: '', email: '', mobile: '' });
  };

  const deleteTrainer = (id: string) => {
    setTrainers(prev => prev.filter(t => t.id !== id));
    toast.success('Trainer removed from the system.');
  };

  const handleToggleTrainerStatus = (trainer: Trainer) => {
    setTrainerToToggle(trainer);
    if (trainer.status === 'Active') {
      setIsTrainerDeactivateDialogOpen(true);
    } else {
      setIsTrainerActivateDialogOpen(true);
    }
  };

  const confirmTrainerDeactivation = () => {
    if (trainerToToggle) {
      setTrainers(prev => prev.map(t => 
        t.id === trainerToToggle.id ? { ...t, status: 'Inactive' } : t
      ));
      toast.success(`${trainerToToggle.name} has been deactivated.`);
      setIsTrainerDeactivateDialogOpen(false);
      setTrainerToToggle(null);
    }
  };

  const confirmTrainerActivation = () => {
    if (trainerToToggle) {
      setTrainers(prev => prev.map(t => 
        t.id === trainerToToggle.id ? { ...t, status: 'Active' } : t
      ));
      toast.success(`${trainerToToggle.name} has been reactivated.`);
      setIsTrainerActivateDialogOpen(false);
      setTrainerToToggle(null);
    }
  };

  const toggleUtmStatus = (id: string) => {
    const utm = utms.find(u => u.id === id);
    if (!utm) return;

    if (utm.status === 'Active') {
      setUtmToDeactivate(utm);
      setIsUtmDeactivateDialogOpen(true);
    } else {
      setUtms(prev => prev.map(u => {
        if (u.id === id) {
          toast.success(`UTM reactivated.`);
          return { ...u, status: 'Active' };
        }
        return u;
      }));
    }
  };

  const confirmUtmDeactivation = () => {
    if (utmToDeactivate) {
      setUtms(prev => prev.map(u => {
        if (u.id === utmToDeactivate.id) {
          return { ...u, status: 'Inactive' };
        }
        return u;
      }));
      toast.success(`UTM deactivated.`);
      setIsUtmDeactivateDialogOpen(false);
      setUtmToDeactivate(null);
    }
  };

  const filteredUtms = utms.filter(utm => {
    const matchesFilter = utmFilter === 'All' || utm.type === utmFilter;
    const matchesSearch = utm.name.toLowerCase().includes(utmSearch.toLowerCase()) || 
                         utm.platformSource.toLowerCase().includes(utmSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sections = [
    { id: 'zoom', label: 'Zoom Accounts', icon: Video },
    { id: 'utm', label: 'UTM Management', icon: LinkIcon },
    { id: 'trainers', label: 'Trainer Management', icon: Users },
    { id: 'sketchnotes', label: 'Sketch Note Management', icon: Pencil },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Profile Management', icon: ShieldCheck },
  ];

  return (
    <div className="flex h-full bg-white">
      {/* Settings Sidebar */}
      <aside className="w-64 border-r border-slate-100 flex flex-col bg-slate-50/30">
        <div className="p-6">
          <h2 className="text-lg font-bold text-slate-900">Settings</h2>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as SettingsSection)}
              className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                activeSection === section.id 
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-100' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <section.icon className={`mr-3 h-5 w-5 ${activeSection === section.id ? 'text-slate-900' : 'text-slate-400'}`} />
              <span className={activeSection === section.id ? 'font-bold' : ''}>{section.label}</span>
            </button>
          ))}
          <button
            onClick={() => onOpenAuditLog?.()}
            className="mt-4 flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 border border-dashed border-slate-200"
          >
            <Search className="mr-3 h-5 w-5 text-slate-400" />
            <span>Audit Log</span>
          </button>
        </nav>
      </aside>

      {/* Settings Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {activeSection === 'zoom' && (
          <div className="max-w-4xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Zoom Accounts</h1>
                <p className="text-slate-500">
                  Zoom accounts used to auto-generate webinar links when a BSW program is created.
                </p>
              </div>
              <Button onClick={() => setIsAddZoomOpen(true)} className="bg-blue-600 hover:bg-blue-700 font-bold">
                <Plus className="mr-2 h-4 w-4" />
                Add Zoom Account
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Zoom Account</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Webinars</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zoomAccounts.map((account) => (
                  <TableRow
                    key={account.id}
                    className={cn(
                      "group cursor-pointer hover:bg-slate-50/80 transition-colors",
                      account.status === 'Inactive' ? 'text-[#9CA3AF]' : 'text-slate-900'
                    )}
                    onClick={() => {
                      setAccountDetails(account);
                      setIsDetailsDialogOpen(true);
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-[36px] h-[36px] rounded-full flex items-center justify-center text-[18px] shrink-0 border",
                          account.status === 'Active' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'
                        )}>
                          <Video className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-bold">{account.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border shadow-none",
                        account.status === 'Active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-grey-100 text-grey-600'
                      )}>
                        {account.status}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-bold">{account.webinarsScheduled}</span>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-slate-900 px-3 border border-[#E5E7EB] h-8 rounded-lg"
                          onClick={() => {
                            setAccountDetails(account);
                            setIsDetailsDialogOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                        {account.status === 'Active' ? (
                          <Button 
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-widest px-4 h-8 rounded-lg transition-all",
                              account.webinarsScheduled > 0 
                                ? 'text-slate-400 cursor-not-allowed opacity-50' 
                                : 'bg-[#F3F4F6] hover:bg-[#E5E7EB] text-slate-900'
                            )}
                            onClick={() => account.webinarsScheduled === 0 && handleToggleStatus(account)}
                          >
                            Deactivate
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost"
                            size="sm"
                            className="text-[10px] font-bold uppercase tracking-widest px-4 text-emerald-600 hover:bg-emerald-50 h-8 font-black"
                            onClick={() => handleToggleStatus(account)}
                          >
                            Reactivate
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Link Check Settings */}
            <div className="mt-12 pt-8 border-t border-slate-100 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Link Check Settings</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Configure how often the system verifies your program links.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 max-w-2xl">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">Check frequency</Label>
                    <div className="flex items-center gap-4">
                      <Select defaultValue="6h">
                        <SelectTrigger className="w-[280px] h-10 bg-white border-slate-200">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3h">Every 3 hours</SelectItem>
                          <SelectItem value="6h">Every 6 hours (default)</SelectItem>
                          <SelectItem value="12h">Every 12 hours</SelectItem>
                          <SelectItem value="24h">Every 24 hours</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        onClick={() => toast.success('Link check frequency updated.')}
                        className="bg-blue-600 hover:bg-blue-700 font-bold px-6"
                      >
                        Save
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                      Link checks run automatically during the active promotion window 
                      of each BSW event.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100">
              <p className="text-xs text-slate-400 italic">
                To connect a new Zoom account, contact your system administrator.
              </p>
            </div>
          </div>
        )}

        {activeSection === 'utm' && (
          <div className="max-w-6xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">UTM Management</h1>
                <p className="text-slate-500">
                  UTM tags for tracking payment links. New UTMs sync to HubSpot automatically.
                </p>
              </div>
              {isAdmin && (
                <Button className="bg-primary" onClick={() => setIsAddUtmOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add UTM
                </Button>
              )}
            </div>

      {/* Search and Filter */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {['All', 'Source', 'Medium', 'Term', 'Content'].map((tab) => (
            <button
              key={tab}
              onClick={() => setUtmFilter(tab as any)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                utmFilter === tab 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by UTM name or platform source" 
            className="pl-10 h-9 bg-white border-slate-200 rounded-xl focus-visible:ring-primary/20"
            value={utmSearch}
            onChange={(e) => setUtmSearch(e.target.value)}
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Type</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Platform Source</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            {isAdmin && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUtms.map((utm) => (
            <React.Fragment key={utm.id}>
              <TableRow
                className={cn("group cursor-pointer", utm.status === 'Inactive' ? 'text-[#9CA3AF]' : 'text-slate-900')}
                onClick={() => setExpandedUtmId((prev) => (prev === utm.id ? null : utm.id))}
              >
                <TableCell>
                  <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                    {utm.type}
                  </div>
                </TableCell>
                <TableCell className="font-bold text-sm">
                  {utm.name}
                </TableCell>
                <TableCell className="text-xs font-medium text-[#6B7280]">
                  {utm.type === 'Source' ? utm.platformSource : '- '}
                </TableCell>
                <TableCell className="text-xs font-medium text-[#6B7280]">{utm.createdBy}</TableCell>
                <TableCell className="text-xs font-medium text-[#6B7280]">{utm.date}</TableCell>
                <TableCell>
                  <div className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border shadow-none",
                    utm.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-grey-100 text-grey-600'
                  )}>
                    {utm.status}
                  </div>
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 text-[10px] font-bold uppercase tracking-widest",
                        utm.status === 'Active'
                          ? "text-red-500 hover:bg-red-50"
                          : "text-emerald-500 hover:bg-emerald-50"
                      )}
                      onClick={() => toggleUtmStatus(utm.id)}
                    >
                      {utm.status === 'Active' ? 'Deactivate' : 'Reactivate'}
                    </Button>
                  </TableCell>
                )}
              </TableRow>
              {expandedUtmId === utm.id && (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 6} className="bg-[#FAFAF9] p-4">
                    <div className="max-w-xl">
                      <AuditTrail
                        title="UTM activity"
                        collapsible={true}
                        maxVisible={3}
                        entries={
                          utm.status === 'Inactive'
                            ? [
                                {
                                  id: '1',
                                  actor: 'Ria Sharma (Marketing Head)',
                                  action: 'Created UTM',
                                  module: 'UTM',
                                  detail: 'Source · Google · Google Ads',
                                  timestamp: '1 Mar 2026, 10:00 AM',
                                  relative_time: '2 months ago',
                                  type: 'create',
                                },
                                {
                                  id: '2',
                                  actor: 'Ria Sharma (Marketing Head)',
                                  action: 'Deactivated UTM',
                                  module: 'UTM',
                                  detail: 'Source · Instagram · Meta Ads',
                                  timestamp: '15 Apr 2026, 2:00 PM',
                                  relative_time: '2 weeks ago',
                                  type: 'deactivate',
                                },
                              ]
                            : [
                                {
                                  id: '1',
                                  actor: 'Ria Sharma (Marketing Head)',
                                  action: 'Created UTM',
                                  module: 'UTM',
                                  detail: 'Source · Google · Google Ads',
                                  timestamp: '1 Mar 2026, 10:00 AM',
                                  relative_time: '2 months ago',
                                  type: 'create',
                                },
                              ]
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
          {filteredUtms.length === 0 && (
            <TableRow>
              <TableCell colSpan={isAdmin ? 7 : 6} className="h-32 text-center">
                <div className="text-center py-12">
                  <Search className="w-10 h-10 mx-auto mb-3 text-gray-300 opacity-30" />
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">No UTM tags found matching your search.</h3>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
          </div>
        )}

        {activeSection === 'trainers' && (
          <div className="max-w-6xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Trainer Management</h1>
                <p className="text-slate-500">
                  Manage trainers available for webinars and programs.
                </p>
              </div>
              <Button className="bg-primary" onClick={() => {
                setEditingTrainer(null);
                setTrainerForm({ name: '', email: '', mobile: '' });
                setIsTrainerPanelOpen(true);
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Trainer
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-[#E5E7EB]">
                  <TableHead className="text-[13px] font-bold uppercase text-[#6B7280] tracking-[0.5px] h-12">Trainer Name</TableHead>
                  <TableHead className="text-[13px] font-bold uppercase text-[#6B7280] tracking-[0.5px] h-12">Email Address</TableHead>
                  <TableHead className="text-[13px] font-bold uppercase text-[#6B7280] tracking-[0.5px] h-12">Mobile Number</TableHead>
                  <TableHead className="text-[13px] font-bold uppercase text-[#6B7280] tracking-[0.5px] h-12">Status</TableHead>
                  <TableHead className="text-[13px] font-bold uppercase text-[#6B7280] tracking-[0.5px] h-12 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainers.map((trainer, index) => {
                  const initials = trainer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                  const isInactive = trainer.status === 'Inactive';
                  
                  return (
                    <TableRow 
                      key={trainer.id} 
                      className={cn(
                        "h-[56px] transition-colors border-b border-[#F3F4F6] cursor-pointer hover:bg-slate-50/80", 
                        index % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]",
                        isInactive && "text-[#9CA3AF]"
                      )}
                      onClick={() => {
                        setEditingTrainer(trainer);
                        setTrainerForm({ name: trainer.name, email: trainer.email, mobile: trainer.mobile });
                        setIsTrainerPanelOpen(true);
                      }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-[36px] h-[36px] rounded-full flex items-center justify-center text-[12px] font-bold shrink-0",
                            getAvatarColors(initials)
                          )}>
                            {initials}
                          </div>
                          <span className={cn("text-sm font-bold", isInactive ? "text-[#9CA3AF]" : "text-black")}>
                            {trainer.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className={cn("text-xs font-medium", isInactive ? "text-[#9CA3AF]" : "text-[#6B7280]")}>
                        {trainer.email}
                      </TableCell>
                      <TableCell className={cn("text-xs font-medium", isInactive ? "text-[#9CA3AF]" : "text-[#6B7280]")}>
                        {trainer.mobile}
                      </TableCell>
                      <TableCell>
                        <div className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border-none",
                          isInactive ? "bg-slate-100 text-slate-500" : "bg-green-100 text-green-700"
                        )}>
                          {trainer.status}
                        </div>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] hover:text-slate-900 px-3 border border-[#E5E7EB] h-8 rounded-lg"
                            onClick={() => {
                              setEditingTrainer(trainer);
                              setTrainerForm({ name: trainer.name, email: trainer.email, mobile: trainer.mobile });
                              setIsTrainerPanelOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          {trainer.status === 'Active' ? (
                            <Button 
                              variant="ghost"
                              size="sm"
                              className="text-[10px] font-bold uppercase tracking-widest px-4 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-slate-900 h-8 rounded-lg"
                              onClick={() => handleToggleTrainerStatus(trainer)}
                            >
                              Deactivate
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost"
                              size="sm"
                              className="text-[10px] font-bold uppercase tracking-widest px-4 text-emerald-600 hover:bg-emerald-50 h-8 font-black"
                              onClick={() => handleToggleTrainerStatus(trainer)}
                            >
                              Reactivate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {activeSection === 'sketchnotes' && (
          <div className="max-w-4xl">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Settings — Sketch Note Management</h1>
            <p className="text-slate-500 mb-8 whitespace-nowrap">
              Manage the global sketch note link. New updates will be logged in history.
            </p>

            {isEmptySketchNote ? (
              <Card className="border-dashed border-2 bg-slate-50/50 p-24 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                  <Pencil className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No Sketch Note Link</h3>
                <p className="text-sm text-slate-500 max-w-[320px] mb-8 leading-relaxed">
                  You haven't configured a global sketch note link yet. 
                  Add your first link to start auto-updating links for each event.
                </p>
                <div className="w-full max-w-sm space-y-4">
                  <div className="space-y-2 text-left">
                    <Label htmlFor="initialLink" className="text-xs font-bold text-slate-700 uppercase tracking-widest">Update sketch note link</Label>
                    <Input 
                      id="initialLink"
                      placeholder="form.qloneapp.com/sketchnotes?batch=..." 
                      className="h-11 border-slate-200"
                      value={newSketchNoteLink}
                      onChange={(e) => setNewSketchNoteLink(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-bold"
                    onClick={() => {
                      if (!newSketchNoteLink) return;
                      setSketchNoteLink(newSketchNoteLink);
                      setNewSketchNoteLink('');
                      setIsEmptySketchNote(false);
                      setSketchNoteHistory([
                        { 
                          id: Math.random().toString(36).substr(2, 9), 
                          url: newSketchNoteLink, 
                          updatedBy: 'Ria Sharma', 
                          date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) 
                        },
                        ...sketchNoteHistory
                      ]);
                      toast.success('Sketch note link configured successfully.');
                    }}
                  >
                    Add new link
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-10">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Current Sketch Note Link</h3>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between">
                    <code className="text-sm text-slate-600 font-medium">{sketchNoteLink}</code>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs font-bold text-slate-500 hover:text-slate-900"
                      onClick={() => {
                        navigator.clipboard.writeText(sketchNoteLink);
                        toast.success('Link copied to clipboard.');
                      }}
                    >
                      <Copy className="h-3.5 w-3.5 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-[12px] text-slate-400 font-medium">
                    This is the active batch-specific URL. Team members copy this and paste it into the Zoom chat manually.
                  </p>
                </div>

                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="updateLink" className="text-xs font-bold text-slate-700">Update sketch note link</Label>
                    <Input 
                      id="updateLink"
                      placeholder="form.qloneapp.com/sketchnotes?batch=..." 
                      className="h-11 border-slate-200"
                      value={newSketchNoteLink}
                      onChange={(e) => setNewSketchNoteLink(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="h-11 px-8 bg-blue-600 hover:bg-blue-700 font-bold"
                    onClick={() => {
                      if (!newSketchNoteLink) return;
                      setSketchNoteLink(newSketchNoteLink);
                      setNewSketchNoteLink('');
                      setSketchNoteHistory([
                        { 
                          id: Math.random().toString(36).substr(2, 9), 
                          url: newSketchNoteLink, 
                          updatedBy: 'Ria Sharma', 
                          date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) 
                        },
                        ...sketchNoteHistory
                      ]);
                      toast.success('Sketch note link updated successfully.');
                    }}
                  >
                    Update link
                  </Button>
                </div>

                <Separator className="bg-slate-100" />

                <div className="space-y-6">
                  <AuditTrail
                    title="Sketch note link history"
                    collapsible={false}
                    maxVisible={5}
                    entries={[
                      {
                        id: '1',
                        actor: 'Ria Sharma (Marketing Head)',
                        action: 'Updated sketch note link',
                        module: 'Settings',
                        field: 'Sketch note link',
                        old_value: '...batch=BSW-MAR-W3',
                        new_value: '...batch=BSW-APR-W3',
                        timestamp: '28 Mar 2026, 9:00 AM',
                        relative_time: '1 month ago',
                        type: 'edit',
                      },
                      {
                        id: '2',
                        actor: 'Ria Sharma (Marketing Head)',
                        action: 'Updated sketch note link',
                        module: 'Settings',
                        field: 'Sketch note link',
                        old_value: '...batch=BSW-FEB-W2',
                        new_value: '...batch=BSW-MAR-W3',
                        timestamp: '10 Feb 2026, 9:00 AM',
                        relative_time: '3 months ago',
                        type: 'edit',
                      },
                    ]}
                  />
                </div>
              </div>
            )}

            {/* Simulation Toggle */}
            <div className="mt-20 pt-8 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="emptyToggle" 
                  checked={isEmptySketchNote} 
                  onChange={(e) => setIsEmptySketchNote(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                />
                <Label htmlFor="emptyToggle" className="text-[10px] text-slate-400 uppercase tracking-widest cursor-pointer">Simulate Empty State</Label>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="max-w-4xl">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Notification Settings</h1>
              <p className="text-slate-500">Control which alerts are sent to your team across different channels.</p>
            </div>

            {!isAdmin ? (
              <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed bg-slate-50/50">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
                  <Lock className="h-12 w-12 text-slate-300" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
                <p className="text-slate-500 max-w-sm">
                  Only the Marketing Head can configure notification settings.
                </p>
              </Card>
            ) : (
              <div className="space-y-8">
                <Card className="overflow-hidden border-slate-100 shadow-sm pt-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[40%] font-bold text-slate-700">Feature</TableHead>
                        <TableHead className="text-center font-bold text-slate-700">In-App</TableHead>
                        <TableHead className="text-center font-bold text-slate-700">WhatsApp</TableHead>
                        <TableHead className="text-center font-bold text-slate-700">Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        {
                          title: 'BSW WEBINARS',
                          items: [
                            { id: 'zoomFailed', name: 'Zoom link generation failed' },
                            { id: 'wpFailed', name: 'WordPress push failed' },
                            { id: 'brokenLink', name: 'Broken link detected' },
                            { id: 'syncFailed', name: 'Attendance sync failed' },
                          ]
                        },
                        {
                          title: 'PAYMENTS',
                          items: [
                            { id: 'paymentFailed', name: 'Payment not auto-captured' },
                            { id: 'refundReceived', name: 'Razorpay refund received' },
                          ]
                        },
                        {
                          title: 'CAMPAIGNS',
                          items: [
                            { id: 'campaignFailed', name: 'Campaign send failed' },
                            { id: 'campaignSuccess', name: 'Campaign successfully sent' },
                          ]
                        },
                        {
                          title: 'REPORTS',
                          items: [
                            { id: 'dailyReport', name: 'Daily report generated' },
                            { id: 'weeklyReport', name: 'Weekly report generated' },
                          ]
                        }
                      ].map((group) => (
                        <React.Fragment key={group.title}>
                          <TableRow className="bg-slate-50/30 hover:bg-slate-50/30">
                            <TableCell colSpan={4} className="py-2 px-4">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {group.title}
                              </span>
                            </TableCell>
                          </TableRow>
                          {group.items.map((item) => (
                            <TableRow key={item.id} className="hover:bg-slate-50/30 transition-colors">
                              <TableCell className="font-medium text-slate-700 py-4">
                                {item.name}
                              </TableCell>
                              
                              {/* In-App: Locked to On */}
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  <button
                                    disabled
                                    className="relative w-10 h-5 rounded-full bg-primary opacity-50 cursor-not-allowed"
                                  >
                                    <motion.div
                                      initial={false}
                                      animate={{ x: 22 }}
                                      className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                                    />
                                  </button>
                                </div>
                              </TableCell>

                              {/* WhatsApp Toggle */}
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  <button
                                    onClick={() => setNotificationSettings(prev => ({
                                      ...prev,
                                      [item.id]: { ...prev[item.id], whatsapp: !prev[item.id].whatsapp }
                                    }))}
                                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
                                      notificationSettings[item.id].whatsapp ? 'bg-primary' : 'bg-slate-200'
                                    }`}
                                  >
                                    <motion.div
                                      animate={{ x: notificationSettings[item.id].whatsapp ? 22 : 2 }}
                                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                      className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                                    />
                                  </button>
                                </div>
                              </TableCell>

                              {/* Email Toggle */}
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  <button
                                    onClick={() => setNotificationSettings(prev => ({
                                      ...prev,
                                      [item.id]: { ...prev[item.id], email: !prev[item.id].email }
                                    }))}
                                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
                                      notificationSettings[item.id].email ? 'bg-primary' : 'bg-slate-200'
                                    }`}
                                  >
                                    <motion.div
                                      animate={{ x: notificationSettings[item.id].email ? 22 : 2 }}
                                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                      className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                                    />
                                  </button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}
          </div>
        )}

        {activeSection === 'security' && (
          <div className="max-w-xl">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">My Profile</h1>
              <p className="text-[#6B7280]">View and update your personal details.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="profileName" className="text-sm font-bold text-slate-900">Name</Label>
                <Input 
                  id="profileName" 
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="h-11 border-slate-200 focus-visible:ring-primary/20 placeholder:text-slate-400"
                  placeholder="e.g. Ria George"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profileEmail" className="text-sm font-bold text-slate-900">Email</Label>
                <div className="space-y-1.5">
                  <Input 
                    id="profileEmail" 
                    value="ria@quantumleap.co.in"
                    readOnly
                    className="h-11 bg-slate-50 border-slate-100 text-[#9CA3AF] cursor-default font-medium"
                  />
                  <p className="text-[12px] text-[#6B7280] ml-1">Email cannot be changed. Contact Admin.</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profilePhone" className="text-sm font-bold text-slate-900">Phone Number</Label>
                <Input 
                  id="profilePhone" 
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="h-11 border-slate-200 focus-visible:ring-primary/20 placeholder:text-slate-400"
                  placeholder="e.g. +91 98765 43200"
                />
              </div>

              <Separator className="my-8 bg-slate-100" />

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-black uppercase tracking-widest text-[11px]">Password</h3>
                <div className="flex items-center justify-between py-1">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">Reset your password</p>
                    <p className="text-xs text-[#6B7280]">A reset link will be sent to your registered email address.</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="h-9 font-bold border-slate-200 text-[#6B7280] hover:bg-slate-50 transition-colors rounded-lg px-4"
                    onClick={() => toast.success('Password reset link sent to ria@quantumleap.co.in', { duration: 4000 })}
                  >
                    Send reset link
                  </Button>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 mt-12">
                <Button 
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-bold text-white transition-all disabled:opacity-50 disabled:grayscale"
                  disabled={profileForm.name === initialProfileForm.name && profileForm.phone === initialProfileForm.phone}
                  onClick={() => {
                    setInitialProfileForm(profileForm);
                    toast.success('Profile updated successfully.');
                  }}
                >
                  Save changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Account Details
            </DialogTitle>
            <DialogDescription render={<div className="pt-4 space-y-4" />}>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
                <span className="text-sm font-semibold text-slate-900">{accountDetails?.email}</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm font-bold text-slate-900">Linked Programs</span>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                    {accountDetails?.webinarsScheduled} Total
                  </Badge>
                </div>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {accountDetails?.linkedPrograms && accountDetails.linkedPrograms.length > 0 ? (
                    accountDetails.linkedPrograms.map((prog, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group hover:border-primary/20 transition-colors">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{prog.name}</span>
                          <span className="text-[11px] text-slate-500">{prog.date}</span>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-white border border-slate-100 flex items-center justify-center">
                          <Video className="h-3.5 w-3.5 text-primary" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <div className="text-center py-12">
                        <Video className="w-10 h-10 mx-auto mb-3 text-gray-300 opacity-30" />
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">No upcoming programs linked to this account.</h3>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsDetailsDialogOpen(false)}
              className="w-full font-bold text-slate-700"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* UTM Deactivation Dialog */}
      <Dialog open={isUtmDeactivateDialogOpen} onOpenChange={setIsUtmDeactivateDialogOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Deactivate this UTM?
            </DialogTitle>
            <DialogDescription className="pt-2">
              <p className="text-slate-600 text-sm leading-relaxed">
                This UTM will no longer appear in payment link dropdowns. 
                You can reactivate it anytime.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-8 flex flex-row justify-end items-center w-full gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsUtmDeactivateDialogOpen(false)} 
              className="px-6 h-10 font-bold border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmUtmDeactivation}
              className="px-6 h-10 font-bold bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-100 transition-all"
            >
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog (Zoom) */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[480px] p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Deactivate {accountToToggle?.email}?
            </DialogTitle>
            <div className="pt-4 space-y-4">
              {accountToToggle?.webinarsScheduled === 0 ? (
                <p className="text-[14px] text-[#4B5563] leading-relaxed">
                  This account has no upcoming programs linked. 
                  It will be removed from the Zoom account dropdown immediately.
                </p>
              ) : (
                <>
                  <p className="text-[14px] text-[#4B5563] leading-relaxed">
                    This account is linked to <span className="font-bold">{accountToToggle?.webinarsScheduled} upcoming programs</span>. 
                    After deactivating, you'll need to manually update 
                    the Zoom link for each affected program.
                  </p>
                  
                  <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#F3F4F6] space-y-2">
                    {accountToToggle?.linkedPrograms?.map((prog, i) => (
                      <div key={i} className="flex items-center text-[13px] text-[#374151]">
                        <span className="mr-2 text-[#9CA3AF]">·</span>
                        <span className="font-bold">{prog.name}</span>
                        <span className="mx-2 text-[#E5E7EB]"> — </span>
                        <span className="text-[#6B7280] font-medium">{prog.date}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </DialogHeader>
          <DialogFooter className="mt-8 flex flex-row justify-between items-center w-full gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsConfirmDialogOpen(false)} 
              className="flex-1 h-11 border-[#E5E7EB] text-[#4B5563] font-bold text-[14px] hover:bg-slate-50 transition-all"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDeactivation} 
              className="flex-1 h-11 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-[14px] border-none transition-all"
            >
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog (Zoom Reactivate) */}
      <Dialog open={isReactivateDialogOpen} onOpenChange={setIsReactivateDialogOpen}>
        <DialogContent className="sm:max-w-[480px] p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Reactivate {accountToToggle?.email}?
            </DialogTitle>
            <div className="pt-4 space-y-4">
              <p className="text-[14px] text-[#4B5563] leading-relaxed">
                This account will be restored and will appear in the Zoom account dropdown 
                for all future programs.
              </p>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-8 flex flex-row justify-between items-center w-full gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsReactivateDialogOpen(false)} 
              className="flex-1 h-11 border-[#E5E7EB] text-[#4B5563] font-bold text-[14px] hover:bg-slate-50 transition-all"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmReactivation} 
              className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[14px] border-none transition-all"
            >
              Reactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog (Trainer Activate) */}
      <Dialog open={isTrainerActivateDialogOpen} onOpenChange={setIsTrainerActivateDialogOpen}>
        <DialogContent className="sm:max-w-[480px] p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Activate this trainer?
            </DialogTitle>
            <div className="pt-4 space-y-4">
              <p className="text-[14px] text-[#4B5563] leading-relaxed">
                <span className="font-bold">{trainerToToggle?.name}</span> will appear in the trainer 
                dropdown when creating programs immediately.
              </p>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-8 flex flex-row justify-between items-center w-full gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsTrainerActivateDialogOpen(false)} 
              className="flex-1 h-11 border-[#E5E7EB] text-[#4B5563] font-bold text-[14px] hover:bg-slate-50 transition-all"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmTrainerActivation} 
              className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[14px] border-none transition-all"
            >
              Activate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog (Trainer Deactivate) */}
      <Dialog open={isTrainerDeactivateDialogOpen} onOpenChange={setIsTrainerDeactivateDialogOpen}>
        <DialogContent className="sm:max-w-[480px] p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Deactivate this trainer?
            </DialogTitle>
            <div className="pt-4 space-y-4">
              <p className="text-[14px] text-[#4B5563] leading-relaxed">
                <span className="font-bold">{trainerToToggle?.name}</span> will no longer appear in 
                the trainer dropdown when creating programs. 
                You can reactivate them anytime.
              </p>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-8 flex flex-row justify-between items-center w-full gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsTrainerDeactivateDialogOpen(false)} 
              className="flex-1 h-11 border-[#E5E7EB] text-[#4B5563] font-bold text-[14px] hover:bg-slate-50 transition-all"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmTrainerDeactivation} 
              className="flex-1 h-11 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-[14px] border-none transition-all"
            >
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Zoom Account Sidebar */}
      <AnimatePresence>
        {isAddZoomOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (connectionState !== 'connecting') setIsAddZoomOpen(false);
              }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[440px] max-w-[440px] bg-white shadow-2xl z-50 border-l p-8 flex flex-col overflow-hidden"
            >
              <button 
                onClick={() => setIsAddZoomOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors z-[60]"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>

              {connectionState === 'idle' || connectionState === 'connecting' ? (
                <>
                  <div className="mb-8 overflow-y-auto pr-1">
                    <h2 className="text-xl font-bold text-slate-900">Add Zoom Account</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Connect a Zoom account to auto-generate webinar links.
                    </p>

                    <div className="mt-8 space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="zoomName" className="font-bold text-slate-700">Account Name *</Label>
                        <Input 
                          id="zoomName" 
                          placeholder="e.g. Main Webinar Account" 
                          value={zoomForm.name}
                          onChange={(e) => setZoomForm({ ...zoomForm, name: e.target.value })}
                          className="h-11 border-slate-200"
                        />
                        <p className="text-[11px] text-slate-400">This is the display label shown when selecting an account.</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="zoomEmail" className="font-bold text-slate-700">Zoom Account Email *</Label>
                        <Input 
                          id="zoomEmail" 
                          placeholder="e.g. zoom1@quantumleap.co.in" 
                          value={zoomForm.email}
                          onChange={(e) => setZoomForm({ ...zoomForm, email: e.target.value })}
                          className="h-11 border-slate-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="apiKey" className="font-bold text-slate-700">API Key *</Label>
                        <div className="relative">
                          <Input 
                            id="apiKey" 
                            type={showApiKey ? 'text' : 'password'}
                            placeholder="Paste your Zoom API Key" 
                            value={zoomForm.apiKey}
                            onChange={(e) => setZoomForm({ ...zoomForm, apiKey: e.target.value })}
                            className="h-11 border-slate-200 pr-10"
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="apiSecret" className="font-bold text-slate-700">API Secret *</Label>
                        <div className="relative">
                          <Input 
                            id="apiSecret" 
                            type={showApiSecret ? 'text' : 'password'}
                            placeholder="Paste your Zoom API Secret" 
                            value={zoomForm.apiSecret}
                            onChange={(e) => setZoomForm({ ...zoomForm, apiSecret: e.target.value })}
                            className="h-11 border-slate-200 pr-10"
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowApiSecret(!showApiSecret)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showApiSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 leading-relaxed font-medium">
                          API Key and Secret are stored securely. 
                          Contact your Zoom account admin if you don't have these.
                        </p>
                      </div>

                      {/* Simulation Toggle */}
                      <div className="pt-4 flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="forceFail" 
                          checked={forceFail} 
                          onChange={(e) => setForceFail(e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                        />
                        <Label htmlFor="forceFail" className="text-[10px] text-slate-400 uppercase tracking-widest cursor-pointer">Simulate Connection Failure</Label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddZoomOpen(false)}
                      disabled={connectionState === 'connecting'}
                      className="h-11 font-bold border-slate-200 text-slate-600"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleConnectZoom}
                      disabled={connectionState === 'connecting' || !zoomForm.name || !zoomForm.email || !zoomForm.apiKey || !zoomForm.apiSecret}
                      className="h-11 bg-blue-600 hover:bg-blue-700 font-bold"
                    >
                      {connectionState === 'connecting' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : 'Connect Account'}
                    </Button>
                  </div>
                </>
              ) : connectionState === 'success' ? (
                <div className="flex flex-col items-center justify-center h-full max-w-[320px] mx-auto text-center">
                  <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                  </div>
                  <h2 className="text-[18px] font-bold text-slate-900 mb-2">Account connected</h2>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    <span className="font-bold text-slate-700">{zoomForm.name}</span> is ready to use in BSW program creation.
                  </p>
                  <Button 
                    onClick={finalizeZoomConnection}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-bold mt-10"
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full max-w-[320px] mx-auto text-center">
                  <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <XCircle className="h-10 w-10 text-red-500" />
                  </div>
                  <h2 className="text-[18px] font-bold text-slate-900 mb-2">Connection failed</h2>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Could not connect to Zoom. Check your API Key and Secret and try again.
                  </p>
                  <div className="w-full space-y-3 mt-10">
                    <Button 
                      variant="outline"
                      onClick={() => setConnectionState('idle')}
                      className="w-full h-11 font-bold border-slate-200 text-slate-600"
                    >
                      Try again
                    </Button>
                    <button 
                      onClick={() => setIsAddZoomOpen(false)}
                      className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add UTM Sidebar */}
      <AnimatePresence>
        {isAddUtmOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddUtmOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[440px] max-w-[440px] bg-white shadow-2xl z-50 border-l p-6 flex flex-col overflow-hidden"
            >
              <button 
                onClick={() => setIsAddUtmOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors z-[60]"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>

              <div className="space-y-1 mb-8">
                <h2 className="text-xl font-bold">Add UTM</h2>
                <p className="text-sm text-muted-foreground">
                  Create a new UTM tag for campaign tracking.
                </p>
              </div>

              <form onSubmit={handleAddUtm} className="space-y-6 flex-1">
                <div className="space-y-2">
                  <Label htmlFor="utmType">UTM Type</Label>
                  <Select 
                    value={newUtm.type} 
                    onValueChange={(v) => {
                      const type = v as UTMType;
                      setNewUtm({ 
                        ...newUtm, 
                        type, 
                        platformSource: type === 'Source' ? '' : '- ' 
                      });
                    }}
                  >
                    <SelectTrigger id="utmType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Source">Source</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Term">Term</SelectItem>
                      <SelectItem value="Content">Content</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="utmName">UTM Name</Label>
                  <Input 
                    id="utmName" 
                    placeholder={newUtm.type === 'Source' ? "e.g. Google" : "e.g. CPC"} 
                    value={newUtm.name}
                    onChange={(e) => setNewUtm({ ...newUtm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platformSource" className={cn(newUtm.type !== 'Source' && "text-slate-400")}>Platform Source</Label>
                  <Input 
                    id="platformSource" 
                    placeholder="e.g. Google Ads" 
                    value={newUtm.platformSource}
                    onChange={(e) => {
                      if (newUtm.type === 'Source') {
                        setNewUtm({ ...newUtm, platformSource: e.target.value });
                      }
                    }}
                    required={newUtm.type === 'Source'}
                    disabled={newUtm.type !== 'Source'}
                    className={cn(
                      "transition-all duration-200",
                      newUtm.type !== 'Source' && "bg-slate-50 text-slate-400 border-slate-100 font-medium cursor-default"
                    )}
                  />
                </div>

                <div className="mt-auto pt-6">
                  <Button type="submit" className="w-full h-11 font-bold">Save UTM</Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Update Password Sidebar */}
      <AnimatePresence>
        {isUpdatePasswordOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUpdatePasswordOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[440px] max-w-[440px] bg-white shadow-2xl z-50 border-l p-6 flex flex-col overflow-hidden"
            >
              <button 
                onClick={() => setIsUpdatePasswordOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors z-[60]"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>

              <div className="space-y-1 mb-8">
                <h2 className="text-xl font-bold">Update Password</h2>
                <p className="text-sm text-muted-foreground">
                  Change your account password.
                </p>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password*</Label>
                  <div className="relative">
                    <Input 
                      id="currentPassword"
                      type={showPasswords.current ? 'text' : 'password'}
                      placeholder="Type here"
                      className="pr-10 h-11 bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20"
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Set New Password*</Label>
                    <div className="relative">
                      <Input 
                        id="newPassword"
                        type={showPasswords.new ? 'text' : 'password'}
                        placeholder="Type Here"
                        className="pr-10 h-11 bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20"
                        value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Requirements Checklist */}
                  <div className="grid grid-cols-1 gap-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {passwordRequirements.map((req, i) => {
                      const met = checkRequirement(req.regex);
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <div className={`h-4 w-4 rounded-full flex items-center justify-center transition-colors ${met ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                            {met && <Check className="h-2.5 w-2.5 text-white" />}
                          </div>
                          <span className={`text-[11px] font-medium transition-colors ${met ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {req.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password*</Label>
                  <div className="relative">
                    <Input 
                      id="confirmPassword"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      placeholder="Type Here"
                      className={`pr-10 h-11 bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20 ${passwords.confirm && !passwordsMatch ? 'border-red-200' : ''}`}
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwords.confirm && !passwordsMatch && (
                    <p className="text-[11px] text-red-500 font-medium">Passwords do not match</p>
                  )}
                </div>
              </div>

              <div className="mt-auto pt-6 flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 h-11 font-bold"
                  onClick={() => setIsUpdatePasswordOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 h-11 font-bold"
                  disabled={!isPasswordValid || !passwordsMatch || !passwords.current}
                  onClick={() => {
                    toast.success('Password updated successfully.');
                    setPasswords({ current: '', new: '', confirm: '' });
                    setIsUpdatePasswordOpen(false);
                  }}
                >
                  Save Password
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Trainer Management Sidebar */}
      <AnimatePresence>
        {isTrainerPanelOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTrainerPanelOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[440px] max-w-[440px] bg-white shadow-2xl z-50 border-l p-6 flex flex-col overflow-hidden"
            >
              <button 
                onClick={() => setIsTrainerPanelOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors z-[60]"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>

              <div className="space-y-1 mb-8">
                <h2 className="text-xl font-bold">{editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}</h2>
                <p className="text-sm text-muted-foreground">
                  {editingTrainer ? 'Update trainer details in the system.' : 'Add a new trainer to the system.'}
                </p>
              </div>

              <form onSubmit={handleTrainerSubmit} className="space-y-6 flex-1">
                <div className="space-y-2">
                  <Label htmlFor="trainerName">Trainer Name*</Label>
                  <Input 
                    id="trainerName" 
                    placeholder="e.g. Siddharth Shah" 
                    value={trainerForm.name}
                    onChange={(e) => setTrainerForm({ ...trainerForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trainerEmail">Email Address</Label>
                  <Input 
                    id="trainerEmail" 
                    type="email"
                    placeholder="e.g. siddharth@quantumleap.co.in" 
                    value={trainerForm.email}
                    onChange={(e) => setTrainerForm({ ...trainerForm, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trainerMobile">Mobile Number</Label>
                  <Input 
                    id="trainerMobile" 
                    placeholder="e.g. +91 98765 43210" 
                    value={trainerForm.mobile}
                    onChange={(e) => setTrainerForm({ ...trainerForm, mobile: e.target.value })}
                  />
                </div>

                <div className="mt-auto pt-6 flex gap-3">
                  <Button 
                    type="button"
                    variant="outline" 
                    className="flex-1 h-11 font-bold"
                    onClick={() => setIsTrainerPanelOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 h-11 font-bold">
                    {editingTrainer ? 'Update Trainer' : 'Save Trainer'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sticky Save Bar */}
      <AnimatePresence>
        {activeSection === 'notifications' && hasUnsavedChanges && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-[100] p-4 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex justify-center items-center"
          >
            <div className="max-w-4xl w-full flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-50 p-2.5 rounded-full">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Unsaved Changes</p>
                  <p className="text-xs text-slate-500">You have modified your notification preferences.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {saveError && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 mr-2">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {saveError}
                  </div>
                )}
                <Button
                  variant="ghost"
                  className="font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  onClick={() => {
                    setNotificationSettings(initialNotifications);
                    setSaveError(null);
                  }}
                  disabled={isSaving}
                >
                  Discard
                </Button>
                <Button
                  className="min-w-[160px] h-11 font-bold shadow-lg shadow-primary/20"
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
