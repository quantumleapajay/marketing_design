
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal,
  Plus, 
  Mail, 
  Phone, 
  CheckCircle2, 
  X,
  ChevronRight,
  Eye as EyeIcon,
  Calendar,
  Clock,
  ExternalLink,
  Download,
  History,
  ChevronDown,
  User,
  CreditCard,
  Target,
  Edit
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
} from './ui/sheet';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { cn, getAvatarColors } from '../lib/utils';
import { Contact } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const MOCK_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '+91 98765 43210',
    source: 'BSW Webinar',
    utmSource: 'BSW-MAR-2026',
    paymentStatus: 'Paid',
    amount: '₹5,000',
    attendance: 'Yes',
    duration: '85 mins',
    batch: 'BSW Batch March 2026'
  },
  {
    id: '2',
    name: 'Priya Shah',
    email: 'priya@example.com',
    phone: '+91 98765 43211',
    source: 'BSW Webinar',
    utmSource: 'FB-BSW-MAR',
    paymentStatus: 'Pending',
    amount: '₹0',
    attendance: 'No',
    batch: 'Not Assigned'
  },
  {
    id: '3',
    name: 'Amit Patel',
    email: 'amit@example.com',
    phone: '+91 98765 43212',
    source: 'PACE Direct',
    utmSource: 'REINVITE-BSW-FEB',
    paymentStatus: 'Paid',
    amount: '₹5,000',
    attendance: 'Yes',
    duration: '92 mins',
    batch: 'BSW Batch March 2026'
  },
  {
    id: '4',
    name: 'Sneha Reddy',
    email: 'sneha@example.com',
    phone: '+91 98765 43213',
    source: 'BSW Webinar',
    utmSource: 'BSW-MAR-2026',
    paymentStatus: 'Overdue',
    amount: '₹2,500',
    attendance: 'No',
    batch: 'Not Assigned'
  },
  {
    id: '5',
    name: 'Vikram Singh',
    email: 'vikram@example.com',
    phone: '+91 98765 43214',
    source: 'BBS Event',
    utmSource: 'LI-BSW-Q1',
    paymentStatus: 'Paid',
    amount: '₹5,000',
    attendance: 'Yes',
    duration: '78 mins',
    batch: 'BSW Batch March 2026'
  }
];

export const Contacts: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddRegistrationOpen, setIsAddRegistrationOpen] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    'bsw': true,
    'bbs': true,
    'pace': true
  });

  const [filterPrograms, setFilterPrograms] = useState<string[]>(['All']);
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string[]>([]);
  const [filterAttendance, setFilterAttendance] = useState<string[]>([]);
  const [filterBatch, setFilterBatch] = useState('All batches');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const [isEditUtmOpen, setIsEditUtmOpen] = useState(false);
  const [editingProgramUtm, setEditingProgramUtm] = useState<string | null>(null);
  const [utmReason, setUtmReason] = useState('');
  const [utmSource, setUtmSource] = useState('Google');
  const [utmMedium, setUtmMedium] = useState('Paid');
  const [utmTerm, setUtmTerm] = useState('BSW');
  const [optedOutByContactId, setOptedOutByContactId] = useState<Record<string, boolean>>({});
  const [optDialogOpen, setOptDialogOpen] = useState(false);
  const [optPendingContact, setOptPendingContact] = useState<Contact | null>(null);
  const [optPendingAction, setOptPendingAction] = useState<'opt-in' | 'opt-out'>('opt-out');
  const [optReason, setOptReason] = useState('');
  const [optReasonError, setOptReasonError] = useState('');
  const [optAuditLog, setOptAuditLog] = useState<
    { id: string; timestamp: string; contactId: string; contactName: string; action: 'Opt-In' | 'Opt-Out'; reason: string }[]
  >([]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [optedOutIds, setOptedOutIds] = useState<Set<string>>(new Set());
  const [isOptOutModalOpen, setIsOptOutModalOpen] = useState(false);

  const toggleCard = (cardId: string) => {
    setExpandedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const handleRowClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsPanelOpen(true);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getSourceColor = (source: string) => {
    return 'text-[#6B7280]';
  };

  const getPaymentStatusStyles = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-700';
      case 'Pending':
        return 'bg-amber-100 text-amber-700';
      case 'Overdue':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-grey-100 text-grey-600';
    }
  };

  const isContactOptedOut = (id: string) =>
    Boolean(optedOutByContactId[id]) || optedOutIds.has(id);

  const openOptConfirmation = (contact: Contact) => {
    const willOptOut = !isContactOptedOut(contact.id);
    setOptPendingContact(contact);
    setOptPendingAction(willOptOut ? 'opt-out' : 'opt-in');
    setOptReason('');
    setOptReasonError('');
    setOptDialogOpen(true);
  };

  const handleOptDialogOpenChange = (open: boolean) => {
    setOptDialogOpen(open);
    if (!open) {
      setOptPendingContact(null);
      setOptReason('');
      setOptReasonError('');
    }
  };

  const confirmOptChange = () => {
    if (!optPendingContact) return;
    if (!optReason.trim()) {
      setOptReasonError('Reason is required.');
      return;
    }
    setOptReasonError('');
    const c = optPendingContact;
    const isOptOut = optPendingAction === 'opt-out';
    setOptedOutByContactId((prev) => ({ ...prev, [c.id]: isOptOut }));
    setOptedOutIds((prev) => {
      const next = new Set(prev);
      if (isOptOut) next.add(c.id);
      else next.delete(c.id);
      return next;
    });
    const entry = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      timestamp: new Date().toISOString(),
      contactId: c.id,
      contactName: c.name,
      action: (isOptOut ? 'Opt-Out' : 'Opt-In') as 'Opt-In' | 'Opt-Out',
      reason: optReason.trim(),
    };
    setOptAuditLog((prev) => [entry, ...prev]);
    console.log('AUDIT LOG — Client communications preference', entry);
    toast.success(
      isOptOut
        ? `Opt-out recorded for ${c.name} (match: Email/Phone).`
        : `Opt-in recorded for ${c.name} (match: Email/Phone).`
    );
    handleOptDialogOpenChange(false);
  };

  const filteredContacts = MOCK_CONTACTS.filter((contact) => {
    const matchesSearch =
      !searchQuery ||
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery);
    const matchesPayment =
      filterPaymentStatus.length === 0 ||
      filterPaymentStatus.includes(contact.paymentStatus);
    const matchesBatch =
      filterBatch === 'All batches' || contact.batch === filterBatch;
    return matchesSearch && matchesPayment && matchesBatch;
  });

  const allFilteredSelected =
    filteredContacts.length > 0 &&
    filteredContacts.every((c) => selectedIds.has(c.id));

  const someSelected = selectedIds.size > 0;

  const hasActiveFilters =
    filterPaymentStatus.length > 0 ||
    filterAttendance.length > 0 ||
    filterBatch !== 'All batches' ||
    !!filterDateFrom ||
    !!filterDateTo;

  const resetAllFilters = () => {
    setFilterPrograms(['All']);
    setFilterPaymentStatus([]);
    setFilterAttendance([]);
    setFilterBatch('All batches');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  return (
    <div className="p-8 pt-0 max-w-[1600px] mx-auto space-y-8">
      <div className="sticky top-0 z-20 bg-white py-8 space-y-1">
        <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
        <p className="text-slate-500">All BSW, BBS and PACE clients in one place.</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Search by name, email, or phone..." 
            className="pl-12 h-12 bg-white border-slate-200 rounded-xl focus-visible:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex-1" />
        <Button 
          variant="outline" 
          onClick={() => setIsFilterOpen(true)}
          className="h-10 px-4 rounded-xl border-slate-200 text-[#6B7280] font-bold text-xs uppercase tracking-[0.5px] gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Filters:
          </span>

          {filterPaymentStatus.map((status) => (
            <span key={status} className="inline-flex items-center gap-1.5 px-3 py-1.5 
                         rounded-full bg-blue-50 border border-blue-200 
                         text-[12px] font-semibold text-blue-700">
              {status}
              <button
                onClick={() => setFilterPaymentStatus(
                  filterPaymentStatus.filter(s => s !== status)
                )}
                className="ml-0.5 text-blue-400 hover:text-blue-700 leading-none"
              >×</button>
            </span>
          ))}

          {filterAttendance.map((att) => (
            <span key={att} className="inline-flex items-center gap-1.5 px-3 py-1.5 
                         rounded-full bg-blue-50 border border-blue-200 
                         text-[12px] font-semibold text-blue-700">
              {att}
              <button
                onClick={() => setFilterAttendance(
                  filterAttendance.filter(a => a !== att)
                )}
                className="ml-0.5 text-blue-400 hover:text-blue-700 leading-none"
              >×</button>
            </span>
          ))}

          {filterBatch !== 'All batches' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                         bg-blue-50 border border-blue-200 
                         text-[12px] font-semibold text-blue-700">
              Batch: {filterBatch}
              <button
                onClick={() => setFilterBatch('All batches')}
                className="ml-0.5 text-blue-400 hover:text-blue-700 leading-none"
              >×</button>
            </span>
          )}

          {filterDateFrom && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                         bg-blue-50 border border-blue-200 
                         text-[12px] font-semibold text-blue-700">
              From: {filterDateFrom}
              <button
                onClick={() => setFilterDateFrom('')}
                className="ml-0.5 text-blue-400 hover:text-blue-700 leading-none"
              >×</button>
            </span>
          )}

          {filterDateTo && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                         bg-blue-50 border border-blue-200 
                         text-[12px] font-semibold text-blue-700">
              To: {filterDateTo}
              <button
                onClick={() => setFilterDateTo('')}
                className="ml-0.5 text-blue-400 hover:text-blue-700 leading-none"
              >×</button>
            </span>
          )}

          <button
            onClick={resetAllFilters}
            className="text-[11px] font-black text-slate-400 hover:text-red-500 
                   uppercase tracking-widest underline underline-offset-2 
                   transition-colors ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {someSelected && (
        <div className="flex items-center justify-between px-4 py-3 mb-2 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-black text-blue-700">
              {selectedIds.size} client{selectedIds.size > 1 ? 's' : ''} selected
            </span>
            {!allFilteredSelected && (
              <button
                type="button"
                className="text-[12px] font-bold text-blue-500 hover:text-blue-700 underline"
                onClick={() =>
                  setSelectedIds(new Set(filteredContacts.map((c) => c.id)))
                }
              >
                Select all {filteredContacts.length} results
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[12px] font-bold border-slate-200 text-slate-600 hover:bg-white rounded-lg"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear selection
            </Button>
            <Button
              size="sm"
              className="h-8 text-[12px] font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg px-4"
              onClick={() => setIsOptOutModalOpen(true)}
            >
              Opt out {selectedIds.size} client{selectedIds.size > 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[48px] pr-0">
              <Checkbox
                checked={allFilteredSelected}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedIds(new Set(filteredContacts.map((c) => c.id)));
                  } else {
                    setSelectedIds(new Set());
                  }
                }}
                className="border-slate-300"
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Contact Info</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Attendance</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredContacts.map((contact) => {
            const initials = getInitials(contact.name);
            return (
              <TableRow 
                key={contact.id} 
                className={cn(
                  'group cursor-pointer h-[56px] border-b border-[#F3F4F6] transition-colors',
                  optedOutIds.has(contact.id) && 'opacity-50 bg-slate-50',
                  selectedIds.has(contact.id) && 'bg-blue-50/60'
                )}
                onClick={() => handleRowClick(contact)}
              >
                <TableCell
                  className="w-[48px] pr-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={selectedIds.has(contact.id)}
                    onCheckedChange={(checked) => {
                      setSelectedIds((prev) => {
                        const next = new Set(prev);
                        if (checked) next.add(contact.id);
                        else next.delete(contact.id);
                        return next;
                      });
                    }}
                    className="border-slate-300"
                    aria-label={`Select ${contact.name}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-[36px] h-[36px] rounded-full flex items-center justify-center text-[12px] font-bold shrink-0",
                      getAvatarColors(initials)
                    )}>
                      {initials}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-black">{contact.name}</span>
                      <span className="text-[11px] text-[#6B7280]">ID: #{contact.id.padStart(4, '0')}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-[#6B7280]">
                    <span className="text-xs font-medium">{contact.email}</span>
                    <span className="text-xs font-medium">{contact.phone}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-[#6B7280]">{contact.source}</span>
                    <span className="text-[10px] text-[#9CA3AF] uppercase font-bold tracking-tight">UTM: {contact.utmSource}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Badge className={cn("rounded-md px-2 py-0.5 font-bold text-[10px] uppercase tracking-wider border-none shadow-none", getPaymentStatusStyles(contact.paymentStatus))}>
                      {contact.paymentStatus}
                    </Badge>
                    <span className="text-sm text-slate-900 font-bold">{contact.amount}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {contact.attendance === 'Yes' ? (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900">Attended</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{contact.duration}</span>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Absent</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "text-xs font-bold",
                    contact.batch === 'Not Assigned' ? 'text-slate-300' : 'text-slate-900'
                  )}>
                    {contact.batch}
                  </span>
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-8 text-[10px] font-bold uppercase tracking-widest rounded-lg px-3",
                        isContactOptedOut(contact.id)
                          ? "border-blue-200 text-blue-600 hover:bg-blue-50"
                          : "border-red-200 text-red-600 hover:bg-red-50"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        openOptConfirmation(contact);
                      }}
                    >
                      {isContactOptedOut(contact.id) ? 'Opt-In' : 'Opt-Out'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg px-3"
                      onClick={() => handleRowClick(contact)}
                    >
                      <EyeIcon className="mr-1.5 h-3.5 w-3.5" />
                      View
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog open={optDialogOpen} onOpenChange={handleOptDialogOpenChange}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>
              Confirm {optPendingAction === 'opt-out' ? 'opt-out' : 'opt-in'}
            </DialogTitle>
            <DialogDescription>
              {optPendingContact
                ? `You are about to record a marketing preference change for ${optPendingContact.name}. A reason is required for the audit log.`
                : 'Confirm preference change.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-1">
            <Label htmlFor="opt-reason" className="text-sm font-semibold text-slate-700">
              Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="opt-reason"
              placeholder="Enter the reason for this change…"
              className={cn(
                'min-h-[100px] border-slate-200 focus-visible:ring-0 focus-visible:border-blue-500',
                optReasonError && 'border-red-500'
              )}
              value={optReason}
              onChange={(e) => {
                setOptReason(e.target.value);
                if (optReasonError) setOptReasonError('');
              }}
            />
            {optReasonError ? <p className="text-xs text-red-500">{optReasonError}</p> : null}
          </div>
          <DialogFooter className="border-0 bg-transparent p-0 sm:justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => handleOptDialogOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              className={cn(
                optPendingAction === 'opt-out'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              )}
              onClick={confirmOptChange}
            >
              Confirm {optPendingAction === 'opt-out' ? 'opt-out' : 'opt-in'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FILTER PANEL */}
      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent className="gap-0 p-0 flex flex-col border-l border-slate-200 shadow-2xl">
          <SheetHeader className="relative">
            <SheetTitle>Filter Clients</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
            {/* Program Section */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Program</h3>
              <div className="space-y-3">
                {['BSW Webinar', 'BBS Event', 'PACE Direct', 'All'].map((prog) => (
                  <div key={prog} className="flex items-center gap-3">
                    <Checkbox 
                      id={`prog-${prog}`} 
                      checked={filterPrograms.includes(prog)}
                      onCheckedChange={(checked) => {
                        if (prog === 'All') {
                          if (checked) setFilterPrograms(['All']);
                          else setFilterPrograms([]);
                        } else {
                          let newProgs = checked 
                            ? [...filterPrograms.filter(p => p !== 'All'), prog]
                            : filterPrograms.filter(p => p !== prog);
                          
                          if (newProgs.length === 3 && !newProgs.includes('All')) {
                            setFilterPrograms(['All']);
                          } else if (newProgs.length === 0) {
                            setFilterPrograms([]);
                          } else {
                            setFilterPrograms(newProgs);
                          }
                        }
                      }}
                      className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <label 
                      htmlFor={`prog-${prog}`}
                      className="text-sm font-medium text-slate-700 cursor-pointer"
                    >
                      {prog}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Status Section */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Payment Status</h3>
              <div className="space-y-3">
                {['Captured', 'Refunded'].map((status) => (
                  <div key={status} className="flex items-center gap-3">
                    <Checkbox 
                      id={`status-${status}`} 
                      checked={filterPaymentStatus.includes(status)}
                      onCheckedChange={(checked) => {
                        if (checked) setFilterPaymentStatus([...filterPaymentStatus, status]);
                        else setFilterPaymentStatus(filterPaymentStatus.filter(s => s !== status));
                      }}
                      className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <label 
                      htmlFor={`status-${status}`}
                      className="text-sm font-medium text-slate-700 cursor-pointer"
                    >
                      {status}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Attendance Section */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Attendance</h3>
              <div className="space-y-3">
                {['Attended', 'Absent'].map((att) => (
                  <div key={att} className="flex items-center gap-3">
                    <Checkbox 
                      id={`attendance-${att}`} 
                      checked={filterAttendance.includes(att)}
                      onCheckedChange={(checked) => {
                        if (checked) setFilterAttendance([...filterAttendance, att]);
                        else setFilterAttendance(filterAttendance.filter(a => a !== att));
                      }}
                      className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <label 
                      htmlFor={`attendance-${att}`}
                      className="text-sm font-medium text-slate-700 cursor-pointer"
                    >
                      {att}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Batch Section */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Batch</h3>
              <Select value={filterBatch} onValueChange={setFilterBatch}>
                <SelectTrigger className="h-10 w-full bg-white border-slate-200 rounded-lg text-sm font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All batches">All batches</SelectItem>
                  <SelectItem value="BSW Batch March 2026">BSW Batch March 2026</SelectItem>
                  <SelectItem value="BBS Mumbai March 2026">BBS Mumbai March 2026</SelectItem>
                  <SelectItem value="PACE Batch 7">PACE Batch 7</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Section */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Date Range</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-[#9CA3AF] font-bold uppercase">From</Label>
                  <Input 
                    type="date"
                    className="h-9 text-xs rounded-lg border-slate-200 bg-white"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-[#9CA3AF] font-bold uppercase">To</Label>
                  <Input 
                    type="date"
                    className="h-9 text-xs rounded-lg border-slate-200 bg-white"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-3 border-t border-gray-100 bg-white mt-auto shadow-[0_-4px_12px_rgba(0,0,0,0.02)] flex justify-end gap-2">
            <Button 
              variant="outline" 
              className="h-11 rounded-xl border-slate-200 text-[#6B7280] font-bold text-xs uppercase tracking-widest"
              onClick={() => {
                setFilterPrograms(['All']);
                setFilterPaymentStatus([]);
                setFilterAttendance([]);
                setFilterBatch('All batches');
                setFilterDateFrom('');
                setFilterDateTo('');
              }}
            >
              Clear all
            </Button>
            <Button 
              className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest transition-all"
              onClick={() => setIsFilterOpen(false)}
            >
              Apply
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isPanelOpen} onOpenChange={setIsPanelOpen}>
        <SheetContent className="gap-0 p-0 flex flex-col overflow-hidden border-l border-slate-200 shadow-2xl">
          {/* PANEL HEADER */}
          <SheetHeader className="relative flex-shrink-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black text-xl shadow-sm">
                  {selectedContact ? getInitials(selectedContact.name) : 'RK'}
                </div>
                <div className="space-y-1">
                  <SheetTitle className="tracking-tight">
                    {selectedContact?.name || 'Rajesh Kumar'}
                  </SheetTitle>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <Mail className="h-3.5 w-3.5 text-slate-300" />
                      {selectedContact?.email || 'rajesh@example.com'}
                    </div>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <Phone className="h-3.5 w-3.5 text-slate-300" />
                      {selectedContact?.phone || '+91 98765 43210'}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                {/* Removed kebab menu as requested */}
              </div>
            </div>
          </SheetHeader>

          <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-8 bg-white border-b border-slate-100 flex-shrink-0">
              <TabsList className="bg-transparent h-14 p-0 gap-8 justify-start border-none">
                <TabsTrigger 
                  value="overview" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 h-14 text-xs font-black uppercase tracking-widest text-slate-400 data-[state=active]:text-slate-900 transition-all"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="programs" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 h-14 text-xs font-black uppercase tracking-widest text-slate-400 data-[state=active]:text-slate-900 transition-all"
                >
                  Programs
                </TabsTrigger>
                <TabsTrigger 
                  value="activity" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 h-14 text-xs font-black uppercase tracking-widest text-slate-400 data-[state=active]:text-slate-900 transition-all"
                >
                  Activity
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50/50">
              {/* OVERVIEW TAB */}
              <TabsContent value="overview" className="m-0 p-8 space-y-8">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                        <Target className="h-5 w-5 text-slate-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] text-slate-500 font-medium">3 programs</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Total Registrations</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                        <CreditCard className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] text-emerald-600 font-bold">₹20,099 total paid</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Payment Summary</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                        <CheckCircle2 className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] text-slate-500 font-medium">Attended 2 of 3 programs</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Attendance Summary</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 italic text-[11px] text-slate-400">
                    Lead details summary. Visit Programs tab to edit tracking for specific registrations.
                  </div>
                </div>
              </TabsContent>

              {/* PROGRAMS TAB */}
              <TabsContent value="programs" className="m-0 p-8 space-y-4">
                {/* CARD 1 — BSW Webinar */}
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                    onClick={() => toggleCard('bsw')}
                  >
                    <div className="flex items-center gap-3">
                      <Badge className="bg-purple-50 text-purple-600 border-purple-100 font-black text-[9px] uppercase tracking-widest px-2 py-0.5">
                        BSW WEBINAR
                      </Badge>
                      <span className="text-sm font-bold text-slate-900">BSW Batch March 2026</span>
                      <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black text-[9px] uppercase tracking-widest px-2 py-0.5">
                        PAID
                      </Badge>
                    </div>
                    <ChevronRight className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", expandedCards['bsw'] ? "rotate-90" : "rotate-0")} />
                  </div>
                  <AnimatePresence>
                    {expandedCards['bsw'] && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 pt-0 border-t border-slate-50 space-y-3">
                          <div className="grid grid-cols-2 gap-y-3 py-4">
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Registration Date</p>
                              <p className="text-xs font-bold text-slate-700">14 Mar 2026</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">UTM Source</p>
                              <p className="text-xs font-bold text-slate-700">Google</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">UTM Medium</p>
                              <p className="text-xs font-bold text-slate-700">Paid</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">UTM Term</p>
                              <p className="text-xs font-bold text-slate-700">BSW</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Payment Mode</p>
                              <p className="text-xs font-bold text-slate-700">Razorpay</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Amount</p>
                              <p className="text-xs font-bold text-slate-700">₹99</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Payment Date</p>
                              <p className="text-xs font-bold text-slate-700">14 Mar 2026</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Invoice</p>
                              <button className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                                <Download className="h-3 w-3" />
                                Download invoice
                              </button>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Attended</p>
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                <span className="text-xs font-bold text-emerald-600">Yes — 85 mins</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Webinar Date</p>
                              <p className="text-xs font-bold text-slate-700">15 Mar 2026</p>
                            </div>
                            <div className="col-span-2 pt-4 border-t border-slate-100 flex justify-end">
                              <button 
                                onClick={() => {
                                  setEditingProgramUtm('BSW Batch March 2026');
                                  setIsEditUtmOpen(true);
                                }}
                                className="text-[11px] font-bold text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1.5 uppercase tracking-widest"
                              >
                                <Edit className="h-3.5 w-3.5" />
                                Edit UTM details
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* CARD 2 — BBS Event */}
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                    onClick={() => toggleCard('bbs')}
                  >
                    <div className="flex items-center gap-3">
                      <Badge className="bg-orange-50 text-orange-600 border-orange-100 font-black text-[9px] uppercase tracking-widest px-2 py-0.5">
                        BBS EVENT
                      </Badge>
                      <span className="text-sm font-bold text-slate-900">BBS Mumbai March 2026</span>
                      <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black text-[9px] uppercase tracking-widest px-2 py-0.5">
                        PAID
                      </Badge>
                    </div>
                    <ChevronRight className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", expandedCards['bbs'] ? "rotate-90" : "rotate-0")} />
                  </div>
                  <AnimatePresence>
                    {expandedCards['bbs'] && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 pt-0 border-t border-slate-50 space-y-3">
                          <div className="grid grid-cols-2 gap-y-3 py-4">
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Registration Date</p>
                              <p className="text-xs font-bold text-slate-700">20 Mar 2026</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">UTM Source</p>
                              <p className="text-xs font-bold text-slate-700">Facebook</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">UTM Medium</p>
                              <p className="text-xs font-bold text-slate-700">Social</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">UTM Term</p>
                              <p className="text-xs font-bold text-slate-700">BBS</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Payment Mode</p>
                              <p className="text-xs font-bold text-slate-700">Manual — UPI</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Amount</p>
                              <p className="text-xs font-bold text-slate-700">₹0 (free event)</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Invoice</p>
                              <button className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                                <Download className="h-3 w-3" />
                                Download invoice
                              </button>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Attended</p>
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                <span className="text-xs font-bold text-emerald-600">Yes — 78 mins</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Event Date</p>
                              <p className="text-xs font-bold text-slate-700">22 Mar 2026</p>
                            </div>
                            <div className="col-span-2 pt-4 border-t border-slate-100 flex justify-end">
                              <button 
                                onClick={() => {
                                  setEditingProgramUtm('BBS Mumbai March 2026');
                                  setIsEditUtmOpen(true);
                                }}
                                className="text-[11px] font-bold text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1.5 uppercase tracking-widest"
                              >
                                <Edit className="h-3.5 w-3.5" />
                                Edit UTM details
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* CARD 3 — PACE */}
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                    onClick={() => toggleCard('pace')}
                  >
                    <div className="flex items-center gap-3">
                      <Badge className="bg-teal-50 text-teal-600 border-teal-100 font-black text-[9px] uppercase tracking-widest px-2 py-0.5">
                        PACE DIRECT
                      </Badge>
                      <span className="text-sm font-bold text-slate-900">PACE Batch 7</span>
                      <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black text-[9px] uppercase tracking-widest px-2 py-0.5">
                        PAID
                      </Badge>
                    </div>
                    <ChevronRight className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", expandedCards['pace'] ? "rotate-90" : "rotate-0")} />
                  </div>
                  <AnimatePresence>
                    {expandedCards['pace'] && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 pt-0 border-t border-slate-50 space-y-3">
                          <div className="grid grid-cols-2 gap-y-3 py-4">
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Registration Date</p>
                              <p className="text-xs font-bold text-slate-700">25 Mar 2026</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">UTM Source</p>
                              <p className="text-xs font-bold text-slate-700">Google</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">UTM Medium</p>
                              <p className="text-xs font-bold text-slate-700">Paid</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">UTM Term</p>
                              <p className="text-xs font-bold text-slate-700">PACE</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Payment Mode</p>
                              <p className="text-xs font-bold text-slate-700">Razorpay</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Amount</p>
                              <p className="text-xs font-bold text-slate-700">₹15,000</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Payment Date</p>
                              <p className="text-xs font-bold text-slate-700">25 Mar 2026</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">GST Invoice</p>
                              <button className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                                <Download className="h-3 w-3" />
                                Download GST invoice
                              </button>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Attended</p>
                              <div className="flex items-center gap-1.5">
                                <X className="h-3.5 w-3.5 text-slate-300" />
                                <span className="text-xs font-bold text-slate-400">No</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Batch Date</p>
                              <p className="text-xs font-bold text-slate-700">2 Apr 2026</p>
                            </div>
                            <div className="col-span-2 pt-4 border-t border-slate-100 flex justify-end">
                              <button 
                                onClick={() => {
                                  setEditingProgramUtm('PACE Batch 7');
                                  setIsEditUtmOpen(true);
                                }}
                                className="text-[11px] font-bold text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1.5 uppercase tracking-widest"
                              >
                                <Edit className="h-3.5 w-3.5" />
                                Edit UTM details
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </TabsContent>

              {/* ACTIVITY TAB */}
              <TabsContent value="activity" className="m-0 p-8 space-y-6">
                <div className="space-y-6 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                  <div className="relative pl-10">
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center z-10 shadow-sm">
                      <Plus className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900">Registered for PACE Batch 7 — ₹15,000 paid</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">25 Mar 2026, 2:15 PM</p>
                    </div>
                  </div>

                  <div className="relative pl-10">
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center z-10 shadow-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900">Attended BBS Mumbai Event</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">22 Mar 2026, 10:00 AM</p>
                    </div>
                  </div>

                  <div className="relative pl-10">
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center z-10 shadow-sm">
                      <Plus className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900">Registered for BBS Mumbai March 2026</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">20 Mar 2026, 4:30 PM</p>
                    </div>
                  </div>

                  <div className="relative pl-10">
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center z-10 shadow-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900">Attended BSW Webinar</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">15 Mar 2026, 7:00 PM</p>
                    </div>
                  </div>

                  <div className="relative pl-10">
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center z-10 shadow-sm">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900">Email sent: "Welcome to BSW Webinar"</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">14 Mar 2026, 11:15 AM</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* EDIT UTM PANEL */}
      <Sheet open={isEditUtmOpen} onOpenChange={setIsEditUtmOpen}>
        <SheetContent className="gap-0 p-0 flex flex-col border-l border-slate-200 shadow-2xl">
          <SheetHeader className="relative">
            <SheetTitle>
              Edit UTM — {editingProgramUtm || "Program"}
            </SheetTitle>
            <p className="text-[11px] text-[#6B7280] font-medium mt-1">Editing tracking for {selectedContact?.name || "Client"}.</p>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">UTM Source *</label>
              <Select value={utmSource} onValueChange={setUtmSource}>
                <SelectTrigger className="h-10 w-full bg-white border-slate-200 rounded-lg text-sm font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Google">Google</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="Organic">Organic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">UTM Medium *</label>
              <Select value={utmMedium} onValueChange={setUtmMedium}>
                <SelectTrigger className="h-10 w-full bg-white border-slate-200 rounded-lg text-sm font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Social">Social</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Direct">Direct</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">UTM Term *</label>
              <Select value={utmTerm} onValueChange={setUtmTerm}>
                <SelectTrigger className="h-10 w-full bg-white border-slate-200 rounded-lg text-sm font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BSW">BSW</SelectItem>
                  <SelectItem value="BBS">BBS</SelectItem>
                  <SelectItem value="PACE">PACE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Reason for edit *</label>
              <Input 
                placeholder="e.g. UTM was incorrectly captured at registration"
                className="h-10 bg-white border-slate-200 rounded-lg text-sm placeholder:text-slate-400"
                value={utmReason}
                onChange={(e) => setUtmReason(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="px-5 py-3 border-t border-gray-100 bg-white mt-auto shadow-[0_-4px_12px_rgba(0,0,0,0.02)] flex justify-end gap-2">
            <Button 
              variant="outline" 
              className="h-11 rounded-xl border-slate-200 text-[#6B7280] font-bold text-xs uppercase tracking-widest"
              onClick={() => setIsEditUtmOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:grayscale"
              disabled={!utmReason.trim()}
              onClick={() => {
                toast.success('UTM updated successfully.');
                setIsEditUtmOpen(false);
                setUtmReason('');
              }}
            >
              Save changes
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ADD REGISTRATION PANEL */}
      <Sheet open={isAddRegistrationOpen} onOpenChange={setIsAddRegistrationOpen}>
        <SheetContent className="gap-0 p-0 flex flex-col overflow-hidden border-l border-slate-200 shadow-2xl">
          <SheetHeader className="relative flex-shrink-0">
            <SheetTitle className="tracking-tight">
              Add New Registration
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Full Name</label>
              <Input 
                placeholder="Enter full name" 
                className="h-12 bg-white border-slate-200 rounded-xl focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Email</label>
              <Input 
                placeholder="Enter email address" 
                className="h-12 bg-white border-slate-200 rounded-xl focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Phone</label>
                <Input 
                  placeholder="Enter phone number" 
                  className="h-12 bg-white border-slate-200 rounded-xl focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Source</label>
                <div className="relative">
                  <select className="w-full h-12 px-4 bg-white border-2 border-blue-500 rounded-xl text-slate-900 font-medium focus:outline-none appearance-none">
                    <option>BSW Webinar</option>
                    <option>BBS Event</option>
                    <option>PACE Direct</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-3 border-t border-gray-100 bg-white flex justify-end gap-2">
            <Button 
              variant="outline" 
              className="h-14 rounded-2xl border-slate-200 text-slate-600 font-bold text-lg hover:bg-slate-50"
              onClick={() => setIsAddRegistrationOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-200"
              onClick={() => {
                toast.success('Registration added successfully');
                setIsAddRegistrationOpen(false);
              }}
            >
              Add Contact
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={isOptOutModalOpen} onOpenChange={setIsOptOutModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
            <DialogTitle className="text-lg font-black text-slate-900">
              Opt out {selectedIds.size} client{selectedIds.size > 1 ? 's' : ''}?
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 mt-1">
              These clients will be excluded from all future campaigns and communications. This
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-4 bg-red-50 border-b border-red-100">
            <p className="text-[12px] font-bold text-red-700 uppercase tracking-widest mb-2">
              Clients being opted out
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {Array.from(selectedIds).map((id) => {
                const contact = MOCK_CONTACTS.find((c) => c.id === id);
                return contact ? (
                  <p key={id} className="text-[13px] text-red-800 font-medium">
                    {contact.name} · {contact.email}
                  </p>
                ) : null;
              })}
            </div>
          </div>
          <div className="px-6 py-4 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              className="h-10 px-5 rounded-xl border-slate-200 font-bold text-[13px]"
              onClick={() => setIsOptOutModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="h-10 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-[13px]"
              onClick={() => {
                const count = selectedIds.size;
                const ids: string[] = Array.from(selectedIds);
                setOptedOutIds((prev) => {
                  const next = new Set(prev);
                  ids.forEach((id) => next.add(id));
                  return next;
                });
                setOptedOutByContactId((prev) => {
                  const next: Record<string, boolean> = { ...prev };
                  ids.forEach((id) => {
                    next[id] = true;
                  });
                  return next;
                });
                setSelectedIds(new Set());
                setIsOptOutModalOpen(false);
                toast.success(
                  `${count} client${count > 1 ? 's' : ''} opted out successfully.`,
                  { duration: 4000 }
                );
              }}
            >
              Confirm opt out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
