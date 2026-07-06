import React, { useState, useEffect } from 'react';
import { cn, getAvatarColors } from '@/lib/utils';
import { 
  Link2, 
  Plus, 
  Search, 
  MoreVertical, 
  Copy, 
  ExternalLink, 
  Power, 
  RefreshCw,
  AlertCircle,
  X,
  Check,
  Edit,
  Eye as EyeIcon,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import StatusBadge from './ui/StatusBadge';
import { Card } from './ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { CreatePaymentLink } from './CreatePaymentLink';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';
import AuditTrail from './AuditTrail';

interface PaymentLink {
  id: string;
  name: string;
  program: string;
  amount: string;
  utmSource: string;
  createdDate: string;
  createdBy: string;
  status: 'Active' | 'Inactive';
  // Extended details for panel
  gatewayType?: string;
  trainer?: string;
  country?: string;
  countryCode?: string;
  currencySymbol?: string;
  showBatch?: string;
  leadDept?: string;
  mode?: string;
  thankYouPage?: string;
  utmMedium?: string;
  utmTerm?: string;
  directLink?: string;
  shortLink?: string;
}

const DUMMY_DATA: PaymentLink[] = [
  { 
    id: '1', 
    name: 'BSW June – Google Ads', 
    program: 'BSW', 
    amount: '₹99', 
    utmSource: 'Google', 
    createdDate: '10 Apr 2026', 
    createdBy: 'Ria Sharma', 
    status: 'Active',
    gatewayType: 'Razorpay',
    trainer: 'Siddharth Shah',
    country: 'India',
    countryCode: '+91',
    currencySymbol: '₹',
    showBatch: 'No',
    leadDept: 'Marketing',
    mode: 'Online',
    thankYouPage: 'https://qloneapp.com/thankyou/bsw',
    utmMedium: 'Paid',
    utmTerm: 'BSW',
    directLink: 'https://payment.qloneapp.com/razorpay?BSW24',
    shortLink: 'https://ql.one/BSW24'
  },
  { id: '2', name: 'BSW June Facebook', program: 'BSW', amount: '₹99', utmSource: 'Facebook', createdDate: '10 Apr 2026', createdBy: 'Ria Sharma', status: 'Active' },
  { id: '3', name: 'PACE Batch 7 Paid', program: 'PACE', amount: '₹15,000', utmSource: 'Google', createdDate: '8 Apr 2026', createdBy: 'Andrea M.', status: 'Active' },
  { id: '4', name: 'BBS Mumbai Organic', program: 'BBS', amount: '₹0', utmSource: 'Organic', createdDate: '5 Apr 2026', createdBy: 'Rajesh Kumar', status: 'Active' },
  { id: '5', name: 'BSW May Instagram', program: 'BSW', amount: '₹99', utmSource: 'Instagram', createdDate: '1 Apr 2026', createdBy: 'Ria Sharma', status: 'Active' },
  { 
    id: '6', 
    name: 'PACE Batch 6', 
    program: 'PACE', 
    amount: '₹15,000', 
    utmSource: 'Facebook', 
    createdDate: '20 Mar 2026', 
    createdBy: 'Andrea M.', 
    status: 'Inactive',
    gatewayType: 'Razorpay',
    trainer: 'Rajesh Kumar',
    country: 'India',
    countryCode: '+91',
    currencySymbol: '₹',
    showBatch: 'No',
    leadDept: 'Marketing',
    mode: 'Online',
    thankYouPage: 'https://qloneapp.com/thankyou/pace',
    utmMedium: 'Paid',
    utmTerm: 'PACE',
    directLink: 'https://payment.qloneapp.com/razorpay?PACE24',
    shortLink: 'https://ql.one/PACE24'
  },
  { id: '7', name: 'BSW April Organic', program: 'BSW', amount: '₹99', utmSource: 'Organic', createdDate: '15 Mar 2026', createdBy: 'Rajesh Kumar', status: 'Inactive' },
  { id: '8', name: 'BBS Delhi Google', program: 'BBS', amount: '₹0', utmSource: 'Google', createdDate: '10 Mar 2026', createdBy: 'Ria Sharma', status: 'Active' },
];

interface PaymentLinksProps {}

export const PaymentLinks: React.FC<PaymentLinksProps> = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Marketing Head';
  const [links, setLinks] = useState<PaymentLink[]>(DUMMY_DATA);
  const [filter, setFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [search, setSearch] = useState('');
  const [selectedLink, setSelectedLink] = useState<PaymentLink | null>(null);
  const [copiedType, setCopiedType] = useState<'direct' | 'short' | null>(null);

  // Create/Edit Sheet state
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [editingPaymentLinkData, setEditingPaymentLinkData] = useState<PaymentLink | null>(null);
  const [isEditPaymentLinkFullPage, setIsEditPaymentLinkFullPage] = useState(false);

  // Deactivate Dialog state
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [linkToDeactivate, setLinkToDeactivate] = useState<string | null>(null);
  const [deactivateReason, setDeactivateReason] = useState('');

  const initiateDeactivate = (id: string) => {
    setLinkToDeactivate(id);
    setDeactivateReason('');
    setIsDeactivateDialogOpen(true);
  };

  const confirmDeactivate = () => {
    if (!linkToDeactivate || !deactivateReason.trim()) return;

    setLinks(prev => prev.map(link => {
      if (link.id === linkToDeactivate) {
        toast.success(`Link deactivated successfully.`);
        const updated = { ...link, status: 'Inactive' as const };
        if (selectedLink?.id === linkToDeactivate) {
          setSelectedLink(updated);
        }
        return updated;
      }
      return link;
    }));
    
    setIsDeactivateDialogOpen(false);
    setLinkToDeactivate(null);
  };

  // Reactivate Dialog state
  const [isReactivateDialogOpen, setIsReactivateDialogOpen] = useState(false);
  const [linkToReactivate, setLinkToReactivate] = useState<string | null>(null);
  const [reactivateReason, setReactivateReason] = useState('');

  const initiateReactivate = (id: string) => {
    setLinkToReactivate(id);
    setReactivateReason('');
    setIsReactivateDialogOpen(true);
  };

  const confirmReactivate = () => {
    if (!linkToReactivate || !reactivateReason.trim()) return;

    setLinks(prev => prev.map(link => {
      if (link.id === linkToReactivate) {
        toast.success(`Link reactivated successfully.`);
        const updated = { ...link, status: 'Active' as const };
        if (selectedLink?.id === linkToReactivate) {
          setSelectedLink(updated);
        }
        return updated;
      }
      return link;
    }));
    
    setIsReactivateDialogOpen(false);
    setLinkToReactivate(null);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedLink(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const filteredLinks = links.filter(link => {
    const matchesFilter = filter === 'All' || link.status === filter;
    const matchesSearch = link.name.toLowerCase().includes(search.toLowerCase()) || 
                         link.program.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleToggleStatus = (id: string) => {
    setLinks(prev => prev.map(link => {
      if (link.id === id) {
        const newStatus = link.status === 'Active' ? 'Inactive' : 'Active';
        toast.success(`Link ${newStatus === 'Active' ? 'reactivated' : 'deactivated'} successfully.`);
        const updated = { ...link, status: newStatus };
        if (selectedLink?.id === id) {
          setSelectedLink(updated);
        }
        return updated;
      }
      return link;
    }));
  };

  const handleCopy = (type: 'direct' | 'short', text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    toast.success(`${type === 'direct' ? 'Direct' : 'Short'} link copied to clipboard.`);
    setTimeout(() => setCopiedType(null), 2000);
  };

  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="text-center py-12">
          <Link2 className="w-10 h-10 mx-auto mb-3 text-gray-300 opacity-30" />
          <h3 className="text-sm font-semibold text-gray-700 mb-1">No payment links yet</h3>
          <p className="text-xs text-gray-400 mb-4 max-w-sm mx-auto">
            Create your first payment link to start tracking payments.
          </p>
          <Button
            onClick={() => {
              setEditingPaymentLinkData(null);
              setIsEditPaymentLinkFullPage(false);
              setIsCreateSheetOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 rounded-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Payment Link
          </Button>
        </div>
      </div>
    );
  }

  if (isEditPaymentLinkFullPage && editingPaymentLinkData) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <CreatePaymentLink
          initialData={editingPaymentLinkData}
          onBack={() => {
            setIsEditPaymentLinkFullPage(false);
            setEditingPaymentLinkData(null);
          }}
          isSidebar={false}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white py-8 flex justify-between items-start">
        <div>
          <h1 
            className="text-2xl font-bold text-slate-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => {
              setSelectedLink(null);
              setSearch('');
              setFilter('All');
            }}
          >
            Payment Links
          </h1>
          <p className="text-slate-500">
            All trackable payment links for BSW, BBS and PACE programs.
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingPaymentLinkData(null);
            setIsEditPaymentLinkFullPage(false);
            setIsCreateSheetOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 rounded-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Payment Link
        </Button>
      </div>

      <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
        <SheetContent className="gap-0 p-0 border-l border-slate-200 shadow-2xl flex flex-col">
          <CreatePaymentLink 
            onBack={() => {
              setIsCreateSheetOpen(false);
              setEditingPaymentLinkData(null);
            }}
            initialData={editingPaymentLinkData}
            isSidebar={true}
          />
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1 border border-slate-100 w-fit max-w-full overflow-x-auto mb-6">
        {(['All', 'Active', 'Inactive'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={cn(
              'h-9 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-all shrink-0',
              filter === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <div className="relative h-10">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by link name or program" 
              className="pl-10 h-10 bg-white border-slate-200 rounded-xl focus-visible:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 mt-2 ml-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Suggested:</span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {['BSW', 'BBS', 'PACE', 'Organic', 'Paid'].map((term) => (
                <button
                  key={term}
                  onClick={() => setSearch(term)}
                  className="px-2.5 py-1 text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Link Name</TableHead>
            <TableHead>Program</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>UTM Source</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLinks.map((link) => {
            const creatorInitials = link.createdBy.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            return (
              <TableRow 
                key={link.id} 
                onClick={() => setSelectedLink(link)}
                className={cn(
                  "cursor-pointer group",
                  link.status === 'Inactive' ? 'opacity-60 grayscale-[0.5] text-[#9CA3AF]' : ''
                )}
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {link.name}
                    </span>
                    <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mt-1">
                      ID: #{link.id.padStart(3, '0')}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-medium text-[#6B7280]">{link.program}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-black text-slate-900 tracking-tight">{link.amount}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-bold text-[#6B7280]">{link.utmSource}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-medium text-[#6B7280]">{link.createdDate}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-[36px] h-[36px] rounded-full flex items-center justify-center text-[12px] font-bold shrink-0",
                      getAvatarColors(creatorInitials)
                    )}>
                      {creatorInitials}
                    </div>
                    <span className="text-xs font-medium text-[#6B7280]">{link.createdBy}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={link.status} />
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg px-3"
                      onClick={() => setSelectedLink(link)}
                    >
                      <EyeIcon className="mr-1.5 h-3.5 w-3.5" />
                      View
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem 
                          onClick={() => window.open(link.directLink || 'https://payment.qloneapp.com/razorpay?BSW24', '_blank')} 
                          className="cursor-pointer gap-2 font-bold text-xs"
                        >
                          <ExternalLink className="h-4 w-4 text-slate-400" />
                          <span>View link →</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setEditingPaymentLinkData(link);
                            setIsEditPaymentLinkFullPage(true);
                            setSelectedLink(null);
                          }} 
                          className="cursor-pointer gap-2 font-bold text-xs"
                        >
                          <Edit className="h-4 w-4 text-slate-400" />
                          <span>Edit Link Details</span>
                        </DropdownMenuItem>
                        {link.status === 'Active' ? (
                          <>
                            <DropdownMenuItem onClick={() => handleCopy('direct', link.directLink || 'https://payment.qloneapp.com/razorpay?BSW24')} className="cursor-pointer gap-2 font-bold text-xs">
                              <ExternalLink className="h-4 w-4 text-slate-400" />
                              <span>Copy Direct Link</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopy('short', link.shortLink || 'https://ql.one/BSW24')} className="cursor-pointer gap-2 font-bold text-xs">
                              <RefreshCw className="h-4 w-4 text-slate-400" />
                              <span>Copy Short Link</span>
                            </DropdownMenuItem>
                            {isAdmin && (
                              <DropdownMenuItem 
                                onClick={() => initiateDeactivate(link.id)} 
                                className="cursor-pointer gap-2 text-red-600 focus:text-red-600 font-bold text-xs"
                              >
                                <Power className="h-4 w-4" />
                                <span>Deactivate Link</span>
                              </DropdownMenuItem>
                            )}
                          </>
                        ) : (
                          <>
                            <DropdownMenuItem 
                              onClick={() => initiateReactivate(link.id)} 
                              className="cursor-pointer gap-2 text-emerald-600 focus:text-emerald-600 font-bold text-xs"
                            >
                              <RefreshCw className="h-4 w-4" />
                              <span>Reactivate Link</span>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {filteredLinks.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="h-[400px] text-center">
                <div className="text-center py-12">
                  <Search className="w-10 h-10 mx-auto mb-3 text-gray-300 opacity-30" />
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">No payment links found</h3>
                  <p className="text-xs text-gray-400 mb-4 max-w-[250px] mx-auto">
                    We couldn't find any payment links matching "{search}"
                  </p>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSearch('')}
                    className="text-blue-600 font-bold hover:text-blue-700 hover:bg-blue-50"
                  >
                    Clear search
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedLink && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLink(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
            />
            
            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[440px] max-w-[440px] bg-white shadow-2xl z-[101] flex flex-col"
              role="dialog"
              aria-label="Payment link details"
              tabIndex={-1}
            >
              {/* Header */}
              <div className="relative px-5 py-4 border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedLink(null)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
                <div>
                  <div className="flex items-center gap-3 mb-1 pr-10">
                    <h2 className="text-base font-semibold text-gray-900">{selectedLink.name}</h2>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className={cn(
                          "flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider transition-colors outline-none",
                          selectedLink.status === 'Active' 
                            ? 'bg-green-500 text-white hover:bg-green-600' 
                            : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                        )}>
                          {selectedLink.status}
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-40">
                        <DropdownMenuItem 
                          onClick={() => window.open(selectedLink.directLink || 'https://payment.qloneapp.com/razorpay?BSW24', '_blank')} 
                          className="cursor-pointer gap-2 font-bold text-xs"
                        >
                          <ExternalLink className="h-4 w-4 text-slate-400" />
                          <span>View link →</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            if (selectedLink.status === 'Active') {
                              initiateDeactivate(selectedLink.id);
                            } else {
                              initiateReactivate(selectedLink.id);
                            }
                          }}
                          className="cursor-pointer gap-2"
                        >
                          {selectedLink.status === 'Active' ? (
                            <>
                              <Power className="h-4 w-4 text-red-500" />
                              <span>Deactivate Link</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4 text-green-500" />
                              <span>Reactivate Link</span>
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-[13px] text-slate-400">
                    Created by {selectedLink.createdBy}  ·  {selectedLink.createdDate}
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 px-4 text-xs font-bold border-slate-200 text-slate-600 hover:bg-slate-50"
                    onClick={() => {
                      setEditingPaymentLinkData(selectedLink);
                      setIsEditPaymentLinkFullPage(true);
                      setSelectedLink(null);
                    }}
                  >
                    <Edit className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto">
                {[
                  { label: 'Program Name', value: selectedLink.program },
                  { label: 'Gateway Type', value: selectedLink.gatewayType || 'Razorpay' },
                  { label: 'Trainer', value: selectedLink.trainer || 'Siddharth Shah' },
                  { label: 'Amount', value: selectedLink.amount },
                  { label: 'Country', value: selectedLink.country || 'India' },
                  { label: 'Country Code', value: selectedLink.countryCode || '+91' },
                  { label: 'Currency Symbol', value: selectedLink.currencySymbol || '₹' },
                  { label: 'Show Batch to User', value: selectedLink.showBatch || 'No' },
                  { label: 'Lead Tracking Dept', value: selectedLink.leadDept || 'Marketing' },
                  { label: 'Program Mode', value: selectedLink.mode || 'Online' },
                  { 
                    label: 'Thank You Page', 
                    value: selectedLink.thankYouPage || 'https://qloneapp.com/thankyou/bsw',
                    isLink: true 
                  },
                  { label: 'UTM Source', value: selectedLink.utmSource },
                  { label: 'UTM Medium', value: selectedLink.utmMedium || 'Paid' },
                  { label: 'UTM Term', value: selectedLink.utmTerm || 'BSW' },
                  { label: 'Created Date', value: selectedLink.createdDate },
                  { label: 'Created By', value: selectedLink.createdBy },
                ].map((row, idx) => (
                  <div 
                    key={row.label} 
                    className={`flex items-center px-8 h-[36px] ${idx % 2 !== 0 ? 'bg-[#F9FAFB]' : ''}`}
                  >
                    <span className="w-1/3 text-[12px] text-slate-400">{row.label}</span>
                    <span className="flex-1 text-[14px] text-slate-900 font-medium truncate">
                      {row.isLink ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help underline decoration-slate-200 underline-offset-2">
                                {row.value}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{row.value}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        row.value
                      )}
                    </span>
                  </div>
                ))}

                <div className="px-8 py-5 border-t border-slate-100">
                  <AuditTrail
                    title="Change history"
                    collapsible={true}
                    maxVisible={3}
                    entries={[
                      {
                        id: '1',
                        actor: 'Ria Sharma (Marketing Head)',
                        action: 'Created payment link',
                        module: 'Payment Links',
                        detail: 'BSW Standard — ₹99',
                        timestamp: '1 Apr 2026, 10:00 AM',
                        relative_time: '1 month ago',
                        type: 'create',
                      },
                      {
                        id: '2',
                        actor: 'Ria Sharma (Marketing Head)',
                        action: 'Edited UTM Source',
                        module: 'Payment Links',
                        field: 'UTM Source',
                        old_value: 'Google',
                        new_value: 'Facebook',
                        timestamp: '15 Apr 2026, 2:00 PM',
                        relative_time: '2 weeks ago',
                        type: 'edit',
                      },
                      {
                        id: '3',
                        actor: 'Ria Sharma (Marketing Head)',
                        action: 'Deactivated link',
                        module: 'Payment Links',
                        timestamp: '20 Apr 2026, 9:00 AM',
                        relative_time: '1 week ago',
                        type: 'deactivate',
                      },
                    ]}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-white border-t border-[#E5E7EB]">
                {selectedLink.status === 'Inactive' && (
                  <div className="flex items-center gap-2 text-[12px] text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100 mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <span>This link is inactive. Reactivate it to copy and share.</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] text-slate-400 mb-1.5 ml-1">Direct Link</p>
                    <div className="relative">
                      <Input 
                        readOnly 
                        value={selectedLink.directLink || 'https://payment.qloneapp.com/razorpay?BSW24'} 
                        className="bg-slate-50 border-slate-100 text-slate-500 h-10 pr-12 text-sm"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={selectedLink.status === 'Inactive'}
                        onClick={() => handleCopy('direct', selectedLink.directLink || 'https://payment.qloneapp.com/razorpay?BSW24')}
                        className="absolute right-1 top-1 h-8 w-8 text-slate-400 hover:text-primary"
                      >
                        {copiedType === 'direct' ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-400 mb-1.5 ml-1">Short Link</p>
                    <div className="relative">
                      <Input 
                        readOnly 
                        value={selectedLink.shortLink || 'https://ql.one/BSW24'} 
                        className="bg-slate-50 border-slate-100 text-slate-500 h-10 pr-12 text-sm"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={selectedLink.status === 'Inactive'}
                        onClick={() => handleCopy('short', selectedLink.shortLink || 'https://ql.one/BSW24')}
                        className="absolute right-1 top-1 h-8 w-8 text-slate-400 hover:text-primary"
                      >
                        {copiedType === 'short' ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full h-10 border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors gap-2"
                    onClick={() => window.open(selectedLink.directLink || 'https://payment.qloneapp.com/razorpay?BSW24', '_blank')}
                  >
                    View payment page →
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DEACTIVATE CONFIRMATION DIALOG */}
      <Dialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-bold text-slate-900">Deactivate this payment link?</DialogTitle>
            <DialogDescription className="text-sm text-slate-500 pt-2 leading-relaxed">
              This link will stop working immediately. Clients will no longer be able to make payments through it.
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-6 py-4 space-y-3">
            <Label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Reason for deactivation</Label>
            <Input 
              placeholder="e.g. Campaign has ended"
              className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:ring-0 focus:border-red-500"
              value={deactivateReason}
              onChange={(e) => setDeactivateReason(e.target.value)}
              autoFocus
            />
          </div>

          <DialogFooter className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-3 sm:justify-end">
            <Button 
              variant="outline" 
              onClick={() => setIsDeactivateDialogOpen(false)}
              className="h-11 rounded-xl border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-white"
            >
              Cancel
            </Button>
            <Button 
              disabled={!deactivateReason.trim()}
              onClick={confirmDeactivate}
              className="h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-500/10 disabled:opacity-50"
            >
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REACTIVATE CONFIRMATION DIALOG */}
      <Dialog open={isReactivateDialogOpen} onOpenChange={setIsReactivateDialogOpen}>
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-bold text-slate-900">Reactivate this payment link?</DialogTitle>
            <DialogDescription className="text-sm text-slate-500 pt-2 leading-relaxed">
              This link will become active again. Clients will be able to make payments through it immediately.
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-6 py-4 space-y-3">
            <Label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Reason for reactivation</Label>
            <Input 
              placeholder="e.g. Starting new phase of campaign"
              className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:ring-0 focus:border-emerald-500"
              value={reactivateReason}
              onChange={(e) => setReactivateReason(e.target.value)}
              autoFocus
            />
          </div>

          <DialogFooter className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-3 sm:justify-end">
            <Button 
              variant="outline" 
              onClick={() => setIsReactivateDialogOpen(false)}
              className="h-11 rounded-xl border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-white"
            >
              Cancel
            </Button>
            <Button 
              disabled={!reactivateReason.trim()}
              onClick={confirmReactivate}
              className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50"
            >
              Reactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};
