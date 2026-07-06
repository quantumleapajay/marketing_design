import React, { useState, useEffect } from 'react';
import { cn, getAvatarColors } from '../lib/utils';
import { 
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
  ChevronDown,
  ExternalLink as ViewIcon,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';

interface PACELink {
  id: string;
  name: string;
  program: string;
  amount: string;
  utmSource: string;
  createdDate: string;
  createdBy: string;
  status: 'Active' | 'Inactive';
  inactiveReason?: 'manual' | 'capacity';
  // Detail fields
  gatewayType: string;
  trainerName: string;
  country: string;
  countryCode: string;
  currencySymbol: string;
  showBatch: 'Yes' | 'No';
  leadTracking: 'Organic' | 'Non Organic';
  department: string;
  utmTerm: string;
  utmMedium: string;
  programMode: string;
  adsType: string;
  thankYouPageLink: string;
  shortLink: string;
  directLink: string;
  lastEditedBy?: string;
  lastEditedDate?: string;
}

const DUMMY_PACE_LINKS: PACELink[] = [
  { 
    id: 'P001', 
    name: 'PACE BSW June', 
    program: 'PACE Batch 7', 
    amount: '₹15,000', 
    utmSource: 'Google', 
    createdDate: '10 Apr 2026', 
    createdBy: 'Ria Sharma', 
    status: 'Active',
    gatewayType: 'Razorpay',
    trainerName: 'Siddharth Shah',
    country: 'India',
    countryCode: '+91',
    currencySymbol: '₹',
    showBatch: 'No',
    leadTracking: 'Non Organic',
    department: 'Marketing',
    utmTerm: 'BSW',
    utmMedium: 'Paid',
    programMode: 'Online',
    adsType: 'Google Ads',
    thankYouPageLink: 'https://qloneapp.com/thankyou/pace',
    shortLink: 'qlone.co/p001',
    directLink: 'https://payment.qloneapp.com/razorpay?p001'
  },
  { 
    id: 'P002', 
    name: 'PACE BBS Apr', 
    program: 'PACE Batch 7', 
    amount: '₹15,000', 
    utmSource: 'Facebook', 
    createdDate: '08 Apr 2026', 
    createdBy: 'Ria Sharma', 
    status: 'Active',
    gatewayType: 'Razorpay',
    trainerName: 'Rajesh Kumar',
    country: 'India',
    countryCode: '+91',
    currencySymbol: '₹',
    showBatch: 'No',
    leadTracking: 'Non Organic',
    department: 'Sales',
    utmTerm: 'BBS',
    utmMedium: 'Social',
    programMode: 'Online',
    adsType: 'Meta Ads',
    thankYouPageLink: 'https://qloneapp.com/thankyou/pace',
    shortLink: 'qlone.co/p002',
    directLink: 'https://payment.qloneapp.com/razorpay?p002'
  },
  { 
    id: 'P003', 
    name: 'PACE Direct', 
    program: 'PACE Batch 8', 
    amount: '₹18,000', 
    utmSource: 'Organic', 
    createdDate: '01 Apr 2026', 
    createdBy: 'Amit Patel', 
    status: 'Inactive',
    inactiveReason: 'manual',
    gatewayType: 'Exly',
    trainerName: 'Siddharth Shah',
    country: 'India',
    countryCode: '+91',
    currencySymbol: '₹',
    showBatch: 'Yes',
    leadTracking: 'Organic',
    department: 'CX',
    utmTerm: 'Direct',
    utmMedium: 'Organic',
    programMode: 'Offline',
    adsType: 'No Ads',
    thankYouPageLink: 'https://qloneapp.com/thankyou/pace-direct',
    shortLink: 'qlone.co/p003',
    directLink: 'https://payment.qloneapp.com/razorpay?p003'
  },
];

interface PACEPaymentLinksProps {
  onCreateClick: () => void;
  onEditClick: (link: PACELink) => void;
}

export const PACEPaymentLinks: React.FC<PACEPaymentLinksProps> = ({ onCreateClick, onEditClick }) => {
  const [links, setLinks] = useState<PACELink[]>(DUMMY_PACE_LINKS);
  const [search, setSearch] = useState('');
  const [selectedLink, setSelectedLink] = useState<PACELink | null>(null);
  const [copiedType, setCopiedType] = useState<'direct' | 'short' | null>(null);
  
  // Deactivate modal state
  const [isDeactivateAlertOpen, setIsDeactivateAlertOpen] = useState(false);
  const [linkToDeactivate, setLinkToDeactivate] = useState<PACELink | null>(null);

  const filteredLinks = links.filter(link => 
    link.name.toLowerCase().includes(search.toLowerCase()) || 
    link.program.toLowerCase().includes(search.toLowerCase()) ||
    link.utmSource.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (type: 'direct' | 'short', text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    toast.success(`${type === 'direct' ? 'Direct' : 'Short'} link copied.`);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDeactivate = () => {
    if (linkToDeactivate) {
      setLinks(prev => prev.map(l => l.id === linkToDeactivate.id ? { ...l, status: 'Inactive', inactiveReason: 'manual' } : l));
      if (selectedLink?.id === linkToDeactivate.id) {
        setSelectedLink({ ...selectedLink, status: 'Inactive' });
      }
      toast.success('Payment link deactivated.');
      setIsDeactivateAlertOpen(false);
      setLinkToDeactivate(null);
    }
  };

  const handleReactivate = (link: PACELink) => {
    setLinks(prev => prev.map(l => l.id === link.id ? { ...l, status: 'Active', inactiveReason: undefined } : l));
    if (selectedLink?.id === link.id) {
      setSelectedLink({ ...selectedLink, status: 'Active' });
    }
    toast.success('Payment link reactivated.');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen pb-20">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">PACE Payment Links</h1>
          <p className="text-slate-500">Create trackable payment links for PACE batches.</p>
        </div>
        <Button 
          onClick={onCreateClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 rounded-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create link
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search PACE links..." 
            className="pl-9 h-10 border-slate-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-10 text-slate-600 gap-2 font-bold border-slate-200">
          <Info className="h-4 w-4 text-slate-400" />
          Filters
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white border-t border-[#E5E7EB]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-[#E5E7EB]">
              <TableHead className="h-14 font-bold text-[13px] uppercase text-[#6B7280] tracking-[0.5px]">Link Name</TableHead>
              <TableHead className="h-14 font-bold text-[13px] uppercase text-[#6B7280] tracking-[0.5px]">Program</TableHead>
              <TableHead className="h-14 font-bold text-[13px] uppercase text-[#6B7280] tracking-[0.5px]">Amount</TableHead>
              <TableHead className="h-14 font-bold text-[13px] uppercase text-[#6B7280] tracking-[0.5px]">UTM Source</TableHead>
              <TableHead className="h-14 font-bold text-[13px] uppercase text-[#6B7280] tracking-[0.5px]">Created Date</TableHead>
              <TableHead className="h-14 font-bold text-[13px] uppercase text-[#6B7280] tracking-[0.5px]">Created By</TableHead>
              <TableHead className="h-14 font-bold text-[13px] uppercase text-[#6B7280] tracking-[0.5px]">Status</TableHead>
              <TableHead className="h-14 font-bold text-[13px] uppercase text-[#6B7280] tracking-[0.5px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLinks.map((link, idx) => {
              const initials = link.createdBy.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              return (
                <TableRow 
                  key={link.id} 
                  className={cn(
                    "group h-[56px] cursor-pointer border-b border-[#F3F4F6] transition-colors",
                    idx % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]",
                    link.status === 'Inactive' ? "bg-grey-50/50" : ""
                  )}
                  onClick={() => setSelectedLink(link)}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className={cn("text-[14px] font-bold transition-colors", link.status === 'Inactive' ? "text-[#9CA3AF]" : "text-black group-hover:text-blue-600")}>
                        {link.name}
                      </span>
                      <span className="text-[11px] text-[#9CA3AF] mt-0.5">ID: #{link.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn("text-[13px]", link.status === 'Inactive' ? "text-[#9CA3AF]" : "text-slate-600")}>{link.program}</span>
                  </TableCell>
                  <TableCell>
                    <span className={cn("text-[14px] font-bold", link.status === 'Inactive' ? "text-[#9CA3AF]" : "text-slate-900")}>{link.amount}</span>
                  </TableCell>
                  <TableCell>
                    <span className={cn("text-[13px]", link.status === 'Inactive' ? "text-[#9CA3AF]" : "text-slate-600")}>{link.utmSource}</span>
                  </TableCell>
                  <TableCell>
                    <span className={cn("text-[13px]", link.status === 'Inactive' ? "text-[#9CA3AF]" : "text-slate-600")}>{link.createdDate}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-[36px] h-[36px] rounded-full flex items-center justify-center text-[12px] font-bold shrink-0",
                        link.status === 'Inactive' ? "bg-grey-100 text-grey-400 opacity-50" : getAvatarColors(initials)
                      )}>
                        {initials}
                      </div>
                      <span className={cn("text-[13px] font-medium", link.status === 'Inactive' ? "text-[#9CA3AF]" : "text-slate-700")}>{link.createdBy}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border shadow-none",
                      link.status === 'Active' 
                        ? "bg-green-100 text-green-700 border-green-200" 
                        : "bg-grey-100 text-grey-600 border-grey-200"
                    )}>
                      {link.status === 'Inactive' ? (link.inactiveReason === 'capacity' ? 'Sold Out' : 'Deactivated') : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => setSelectedLink(link)} className="font-bold text-xs gap-2">
                          <EyeIcon className="h-3.5 w-3.5 text-slate-400" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditClick(link)} className="font-bold text-xs gap-2">
                          <Edit className="h-3.5 w-3.5 text-slate-400" />
                          Edit
                        </DropdownMenuItem>
                        {link.status === 'Active' ? (
                          <DropdownMenuItem 
                            onClick={() => {
                              setLinkToDeactivate(link);
                              setIsDeactivateAlertOpen(true);
                            }}
                            className="font-bold text-xs gap-2 text-red-600 focus:text-red-600"
                          >
                            <Power className="h-3.5 w-3.5" />
                            Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => handleReactivate(link)}
                            className="font-bold text-xs gap-2 text-green-600 focus:text-green-600"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Reactivate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filteredLinks.length === 0 && (
          <div className="text-center py-12 border-b border-[#F3F4F6]">
            <Search className="w-10 h-10 mx-auto mb-3 text-gray-300 opacity-30" />
            <h3 className="text-sm font-semibold text-gray-700 mb-1">No payment links found</h3>
            <p className="text-xs text-gray-400 mb-4">Try adjusting your search query.</p>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedLink && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLink(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[440px] max-w-[440px] bg-white shadow-2xl z-[101] flex flex-col border-l border-slate-200"
            >
              {/* Panel Header */}
              <div className="relative px-5 py-4 border-b border-gray-100 bg-white">
                <button
                  type="button"
                  onClick={() => setSelectedLink(null)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="pr-10">
                  <h2 className="text-base font-semibold text-gray-900">{selectedLink.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">PACE Payment Link Details</p>
                </div>
              </div>

              {/* Panel Body */}
              <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                <div className="space-y-6">
                  {/* Status Badge in detail */}
                  <div>
                    <Badge className={cn(
                      "px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border shadow-none",
                      selectedLink.status === 'Active' 
                        ? "bg-green-500 text-white border-green-600" 
                        : "bg-slate-200 text-slate-500 border-slate-300"
                    )}>
                      {selectedLink.status === 'Inactive' ? (selectedLink.inactiveReason === 'capacity' ? 'Sold Out' : 'Deactivated') : 'Active'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-y-4">
                    {[
                      { label: 'Link Name', value: selectedLink.name },
                      { label: 'Program Name', value: selectedLink.program },
                      { label: 'Gateway Type', value: selectedLink.gatewayType },
                      { label: 'Trainer Name', value: selectedLink.trainerName },
                      { label: 'Amount', value: selectedLink.amount },
                      { label: 'Country', value: selectedLink.country },
                      { label: 'Show Batch to User', value: selectedLink.showBatch },
                      { label: 'Lead Tracking', value: selectedLink.leadTracking },
                      { label: 'Department', value: selectedLink.department },
                      { label: 'UTM Source', value: selectedLink.utmSource },
                      { label: 'UTM Term', value: selectedLink.utmTerm },
                      { label: 'UTM Medium', value: selectedLink.utmMedium },
                      { label: 'Program Mode', value: selectedLink.programMode },
                      { label: 'Ads Type', value: selectedLink.adsType },
                      { label: 'Thank You Page Link', value: selectedLink.thankYouPageLink },
                      { label: 'Country Code', value: selectedLink.countryCode },
                      { label: 'Currency Symbol', value: selectedLink.currencySymbol },
                      { label: 'Created Date', value: selectedLink.createdDate },
                      { label: 'Created By', value: selectedLink.createdBy },
                      { label: 'Last Edited By', value: selectedLink.lastEditedBy || 'N/A' },
                      { label: 'Last Edited Date', value: selectedLink.lastEditedDate || 'N/A' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
                        <span className="text-[14px] text-slate-800 font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Links Section */}
                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <div>
                      <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Direct Link</Label>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-600 truncate">
                          {selectedLink.directLink}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleCopy('direct', selectedLink.directLink)}
                          className="h-9 w-9 border border-slate-200"
                        >
                          {copiedType === 'direct' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-slate-400" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Short Link</Label>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-600 truncate">
                          {selectedLink.shortLink}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleCopy('short', selectedLink.shortLink)}
                          className="h-9 w-9 border border-slate-200"
                        >
                          {copiedType === 'short' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-slate-400" />}
                        </Button>
                      </div>
                    </div>
                    <Button 
                      onClick={() => window.open(selectedLink.directLink, '_blank')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 mt-2 h-11"
                    >
                      <ViewIcon className="h-4 w-4" />
                      View Link
                    </Button>
                  </div>
                </div>
              </div>

              {/* Panel Footer Actions */}
              <div className="p-6 border-t border-slate-100 flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => onEditClick(selectedLink)}
                  className="flex-1 font-bold border-slate-200 text-slate-600 h-11"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Link
                </Button>
                {selectedLink.status === 'Active' ? (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setLinkToDeactivate(selectedLink);
                      setIsDeactivateAlertOpen(true);
                    }}
                    className="flex-1 font-bold border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 h-11"
                  >
                    <Power className="mr-2 h-4 w-4" />
                    Deactivate
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => handleReactivate(selectedLink)}
                    className="flex-1 font-bold border-green-100 text-green-600 hover:bg-green-50 hover:border-green-200 h-11"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reactivate
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Deactivate confirmation modal */}
      <Dialog open={isDeactivateAlertOpen} onOpenChange={setIsDeactivateAlertOpen}>
        <DialogContent className="sm:max-w-[420px] p-6 text-center">
          <div className="flex flex-col items-center">
            <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 text-center">Deactivate this payment link?</DialogTitle>
              <DialogDescription className="text-center text-slate-500 mt-2 px-4">
                It will no longer accept new payments. Clients will see an "Access Denied" page.
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="flex gap-3 sm:justify-center mt-8">
            <Button 
              variant="outline" 
              onClick={() => setIsDeactivateAlertOpen(false)}
              className="flex-1 h-11 font-bold border-slate-200 text-slate-600 rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeactivate}
              className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
            >
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
