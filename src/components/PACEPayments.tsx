import React, { useState, useMemo } from 'react';
import { cn, getAvatarColors } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Calendar,
  Clock,
  Users,
  AlertCircle,
  X,
  Check,
  Edit,
  Eye as EyeIcon,
  ChevronDown,
  Info,
  Lock,
  Unlock,
  CheckCircle2,
  FileText,
  Download,
  History,
  CreditCard,
  Banknote,
  Smartphone,
  RotateCcw,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "./ui/sheet";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';
import AuditTrail from './AuditTrail';

interface PACEPayment {
  id: string;
  clientName: string;
  email: string;
  mobile: string;
  batch: string;
  amount: number;
  paymentMode: 'Razorpay' | 'Card' | 'UPI' | 'Cash' | 'Cheque' | 'Manual';
  paymentDate: string;
  utmSource: string;
  utmMedium?: string;
  utmTerm?: string;
  department?: string;
  status: 'Captured' | 'Refunded';
  invoiceStatus: 'View' | 'Generating...';
  gstStatus: 'GST Pending' | 'GST: Non-GST' | 'GST: Generated' | 'GSTIN Pending';
  gstInvoicedRequired?: 'Yes' | 'No';
  gstin?: string;
  companyName?: string;
  billingAddress?: string;
  ticketValue: number;
  program: string;
  invoiceType?: 'GST' | 'Non-GST' | 'Pending GSTIN';
  generatedBy?: 'System';
  invoiceService?: 'Master India' | 'Native CRM Invoice Service';
  gstFormSentAt?: string;
  reminderState?: 'none' | '24h_reminder' | '3_day_sequence';
  refundInfo?: {
    amount: number;
    date: string;
    mode: string;
    notes: string;
    razorpayId?: string;
  };
}

const DUMMY_PAYMENTS: PACEPayment[] = [
  { 
    id: 'TXN001', 
    clientName: 'Anita Rao', 
    email: 'anita@example.com',
    mobile: '98765 01234', 
    batch: 'PACE Batch 7', 
    amount: 15000, 
    paymentMode: 'Razorpay', 
    paymentDate: '10 Apr 2026', 
    utmSource: 'Google', 
    utmMedium: 'cpc',
    utmTerm: 'crm_marketing',
    department: 'Sales',
    status: 'Captured',
    program: 'PACE Batch 7',
    ticketValue: 15000,
    invoiceType: 'Non-GST',
    generatedBy: 'System',
    invoiceService: 'Native CRM Invoice Service',
    gstFormSentAt: '10 Apr 2026, 3:43 PM',
    reminderState: 'none',
    invoiceStatus: 'View',
    gstStatus: 'GST: Non-GST',
    gstInvoicedRequired: 'No'
  },
  { 
    id: 'TXN002', 
    clientName: 'Kiran Shah', 
    email: 'kiran@example.com',
    mobile: '98765 02345', 
    batch: 'PACE Batch 7', 
    amount: 15000, 
    paymentMode: 'UPI', 
    paymentDate: '09 Apr 2026', 
    utmSource: 'Facebook', 
    utmMedium: 'social_ads',
    utmTerm: 'pace_mar',
    department: 'Marketing',
    status: 'Captured',
    program: 'PACE Batch 7',
    ticketValue: 15000,
    reminderState: '24h_reminder',
    invoiceStatus: 'View',
    gstStatus: 'GST Pending'
  },
  { 
    id: 'TXN003', 
    clientName: 'Meena Nair', 
    email: 'meena@example.com',
    mobile: '98765 03456', 
    batch: 'PACE Batch 7', 
    amount: 15000, 
    paymentMode: 'Razorpay', 
    paymentDate: '08 Apr 2026', 
    utmSource: 'Organic', 
    utmMedium: 'direct',
    utmTerm: 'bsw_referral',
    department: 'Customer Success',
    status: 'Refunded',
    program: 'PACE Batch 7',
    ticketValue: 15000,
    invoiceType: 'Non-GST',
    generatedBy: 'System',
    invoiceService: 'Native CRM Invoice Service',
    reminderState: 'none',
    invoiceStatus: 'View',
    gstStatus: 'GST: Non-GST',
    gstInvoicedRequired: 'No',
    refundInfo: {
      amount: 15000,
      date: '12 Apr 2026',
      mode: 'Webhook (Razorpay)',
      notes: 'Automatic refund via Razorpay',
      razorpayId: 'rfnd_PB23901S3'
    }
  },
  { 
    id: 'TXN004', 
    clientName: 'Suresh T.', 
    email: 'suresh@example.com',
    mobile: '98765 04567', 
    batch: 'PACE Batch 8', 
    amount: 18000, 
    paymentMode: 'Card', 
    paymentDate: '01 Apr 2026', 
    utmSource: 'Google', 
    utmMedium: 'search',
    utmTerm: 'leadership_pace',
    department: 'Sales',
    status: 'Captured',
    program: 'PACE Batch 8',
    ticketValue: 18000,
    invoiceType: 'GST',
    generatedBy: 'System',
    invoiceService: 'Master India',
    reminderState: 'none',
    invoiceStatus: 'View',
    gstStatus: 'GST: Generated',
    gstInvoicedRequired: 'Yes',
    gstin: '27AAACP5000A1Z5',
    companyName: 'Suresh Tech Solutions',
    billingAddress: 'Mumbai, Maharashtra'
  },
  { 
    id: 'TXN005', 
    clientName: 'Priya V.', 
    email: 'priya@example.com',
    mobile: '98765 05678', 
    batch: 'PACE Batch 7', 
    amount: 15000, 
    paymentMode: 'Cash', 
    paymentDate: '28 Mar 2026', 
    utmSource: 'Instagram', 
    utmMedium: 'story_add',
    utmTerm: 'pace_batch_7',
    department: 'Marketing',
    status: 'Captured',
    program: 'PACE Batch 7',
    ticketValue: 15000,
    invoiceType: 'Pending GSTIN',
    generatedBy: 'System',
    reminderState: '3_day_sequence',
    invoiceStatus: 'Generating...',
    gstStatus: 'GSTIN Pending',
    gstInvoicedRequired: 'Yes'
  },
];

function parsePaymentDisplayDateMs(display: string): number | null {
  const t = Date.parse(display);
  return Number.isNaN(t) ? null : t;
}

export const PACEPayments: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PACEPayment[]>(DUMMY_PAYMENTS);
  const [isManualSheetOpen, setIsManualSheetOpen] = useState(false);
  const [isRefundSheetOpen, setIsRefundSheetOpen] = useState(false);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PACEPayment | null>(null);
  const [isRefundConfirmOpen, setIsRefundConfirmOpen] = useState(false);

  // Manual Payment Form State
  const [manualPayment, setManualPayment] = useState({
    name: '', email: '', mobile: '', program: 'PACE', batch: '', 
    amount: '', mode: '', date: '', utm: '', notes: ''
  });
  const [manualError, setManualError] = useState('');

  // Manual Refund Form State
  const [refundData, setRefundData] = useState({
    amount: '', date: '', mode: '', notes: ''
  });
  const [refundError, setRefundError] = useState('');

  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterSource, setFilterSource] = useState('All');
  const [filterBatch, setFilterBatch] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const hasActiveFilters =
    !!filterDateFrom ||
    !!filterDateTo ||
    filterSource !== 'All' ||
    filterBatch !== 'All' ||
    filterStatus !== 'All';

  const resetPaymentFilters = () => {
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterSource('All');
    setFilterBatch('All');
    setFilterStatus('All');
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((pay) => {
      if (filterSource !== 'All' && pay.utmSource !== filterSource) return false;
      if (filterBatch !== 'All' && pay.batch !== filterBatch) return false;
      if (filterStatus !== 'All' && pay.status !== filterStatus) return false;
      const payMs = parsePaymentDisplayDateMs(pay.paymentDate);
      if (filterDateFrom) {
        const fromMs = new Date(filterDateFrom).setHours(0, 0, 0, 0);
        if (payMs === null || payMs < fromMs) return false;
      }
      if (filterDateTo) {
        const toMs = new Date(filterDateTo).setHours(23, 59, 59, 999);
        if (payMs === null || payMs > toMs) return false;
      }
      return true;
    });
  }, [payments, filterDateFrom, filterDateTo, filterSource, filterBatch, filterStatus]);

  // Summary Calculations
  const totals = useMemo(() => {
    return payments.reduce((acc, pay) => {
      if (pay.status === 'Captured') {
        acc.captured += pay.amount;
      } else {
        acc.refunded += pay.amount;
      }
      return acc;
    }, { captured: 0, refunded: 0 });
  }, [payments]);

  const handleAddManualPayment = () => {
    if (manualPayment.notes.length < 10) {
      setManualError('Notes must be at least 10 characters.');
      return;
    }
    const newPay: PACEPayment = {
      id: `TXN${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      clientName: manualPayment.name,
      email: manualPayment.email,
      mobile: manualPayment.mobile,
      batch: manualPayment.batch,
      amount: parseInt(manualPayment.amount),
      paymentMode: manualPayment.mode as any,
      paymentDate: manualPayment.date,
      utmSource: manualPayment.utm,
      program: manualPayment.batch || 'PACE',
      ticketValue: parseInt(manualPayment.amount),
      generatedBy: 'System',
      status: 'Captured',
      invoiceStatus: 'Generating...',
      gstStatus: 'GST Pending'
    };
    setPayments([newPay, ...payments]);
    toast.success('Manual payment recorded.');
    setIsManualSheetOpen(false);
    setManualPayment({
      name: '', email: '', mobile: '', program: 'PACE', batch: '', 
      amount: '', mode: '', date: '', utm: '', notes: ''
    });
    setManualError('');
  };

  const handleProcessRefund = () => {
    if (refundData.notes.length < 10) {
      setRefundError('Notes must be at least 10 characters.');
      return;
    }
    if (parseInt(refundData.amount) > (selectedPayment?.amount || 0)) {
      setRefundError('Refund amount cannot exceed original amount.');
      return;
    }
    setIsRefundConfirmOpen(true);
  };

  const confirmRefund = () => {
    if (selectedPayment) {
      setPayments(prev => prev.map(p => 
        p.id === selectedPayment.id 
          ? { 
              ...p, 
              status: 'Refunded',
              refundInfo: {
                amount: parseInt(refundData.amount),
                date: refundData.date,
                mode: refundData.mode,
                notes: refundData.notes
              }
            } 
          : p
      ));
      toast.success('Refund processed successfully.');
      setIsRefundConfirmOpen(false);
      setIsRefundSheetOpen(false);
      setRefundData({ amount: '', date: '', mode: '', notes: '' });
      setRefundError('');
    }
  };

  const openRefundPanel = (payment: PACEPayment) => {
    setSelectedPayment(payment);
    setRefundData({
      amount: payment.amount.toString(),
      date: new Date().toISOString().split('T')[0],
      mode: 'Bank Transfer',
      notes: ''
    });
    setIsRefundSheetOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Captured': return "bg-green-100 text-green-700 border-green-200";
      case 'Refunded': return "bg-red-100 text-red-700 border-red-200";
      default: return "";
    }
  };

  const getGSTBadge = (status: string) => {
    switch (status) {
      case 'GST Pending': return "bg-amber-100 text-amber-700 border-amber-200";
      case 'GST: Non-GST': return "bg-slate-100 text-slate-600 border-slate-200";
      case 'GST: Generated': return "bg-green-100 text-green-700 border-green-200";
      case 'GSTIN Pending': return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "";
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">PACE Payments</h1>
          <p className="text-slate-500 text-sm">All PACE payments across all batches and payment modes.</p>
        </div>
        <Button 
          onClick={() => setIsManualSheetOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 rounded-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add manual payment
        </Button>
      </div>

      {/* Summary Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm mb-6">
        <div className="flex items-center gap-12">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 text-left">Total Collected</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">₹{totals.captured.toLocaleString()}</span>
              <span className="text-[11px] font-bold text-green-600 flex items-center gap-0.5">
                <CheckCircle2 className="h-3 w-3" />
                Live
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 text-left">Refunded</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-400 strikethrough">₹{totals.refunded.toLocaleString()}</span>
              <span className="text-[11px] font-bold text-red-500">Excluded</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[12px] text-slate-400 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
          <Info className="h-4 w-4" />
          <span className="font-medium">Refunded amounts excluded from total collection figures.</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search client name or mobile..." className="pl-9 h-10 w-full max-w-md border-slate-200" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
          <div className="w-full space-y-3 lg:flex-1 lg:min-w-[220px]">
            <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">
              Date range
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500">From</Label>
                <Input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="h-10 border-slate-200 rounded-xl bg-slate-50 focus-visible:ring-blue-500/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500">To</Label>
                <Input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="h-10 border-slate-200 rounded-xl bg-slate-50 focus-visible:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 w-full sm:w-auto sm:min-w-[160px]">
            <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Payment source</Label>
            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="h-10 border-slate-200 rounded-xl bg-slate-50">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All sources</SelectItem>
                <SelectItem value="Google">Google</SelectItem>
                <SelectItem value="Facebook">Facebook</SelectItem>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="Organic">Organic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 w-full sm:w-auto sm:min-w-[160px]">
            <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Batch</Label>
            <Select value={filterBatch} onValueChange={setFilterBatch}>
              <SelectTrigger className="h-10 border-slate-200 rounded-xl bg-slate-50">
                <SelectValue placeholder="Batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All batches</SelectItem>
                <SelectItem value="PACE Batch 7">PACE Batch 7</SelectItem>
                <SelectItem value="PACE Batch 8">PACE Batch 8</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 w-full sm:w-auto sm:min-w-[160px]">
            <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Payment status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-10 border-slate-200 rounded-xl bg-slate-50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All statuses</SelectItem>
                <SelectItem value="Captured">Captured</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mb-4 flex w-full flex-wrap items-center gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Filters:
            </span>

            {filterSource !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                         bg-blue-50 border border-blue-200 
                         text-[12px] font-semibold text-blue-700">
                Source: {filterSource}
                <button
                  type="button"
                  onClick={() => setFilterSource('All')}
                  className="ml-0.5 text-blue-400 hover:text-blue-700 leading-none"
                >
                  ×
                </button>
              </span>
            )}

            {filterBatch !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                         bg-blue-50 border border-blue-200 
                         text-[12px] font-semibold text-blue-700">
                Batch: {filterBatch}
                <button
                  type="button"
                  onClick={() => setFilterBatch('All')}
                  className="ml-0.5 text-blue-400 hover:text-blue-700 leading-none"
                >
                  ×
                </button>
              </span>
            )}

            {filterStatus !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                         bg-blue-50 border border-blue-200 
                         text-[12px] font-semibold text-blue-700">
                Status: {filterStatus}
                <button
                  type="button"
                  onClick={() => setFilterStatus('All')}
                  className="ml-0.5 text-blue-400 hover:text-blue-700 leading-none"
                >
                  ×
                </button>
              </span>
            )}

            {filterDateFrom && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                         bg-blue-50 border border-blue-200 
                         text-[12px] font-semibold text-blue-700">
                From: {filterDateFrom}
                <button
                  type="button"
                  onClick={() => setFilterDateFrom('')}
                  className="ml-0.5 text-blue-400 hover:text-blue-700 leading-none"
                >
                  ×
                </button>
              </span>
            )}

            {filterDateTo && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                         bg-blue-50 border border-blue-200 
                         text-[12px] font-semibold text-blue-700">
                To: {filterDateTo}
                <button
                  type="button"
                  onClick={() => setFilterDateTo('')}
                  className="ml-0.5 text-blue-400 hover:text-blue-700 leading-none"
                >
                  ×
                </button>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={resetPaymentFilters}
            className="ml-auto shrink-0 text-[11px] font-black text-slate-400 hover:text-red-500 
                   uppercase tracking-widest underline underline-offset-2 
                   transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white border-t border-[#E5E7EB] overflow-hidden rounded-xl shadow-sm border-x border-b">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-[#E5E7EB] bg-slate-50/50">
              <TableHead className="h-12 font-bold text-[12px] uppercase text-[#6B7280] tracking-[0.5px]">Client Name</TableHead>
              <TableHead className="h-12 font-bold text-[12px] uppercase text-[#6B7280] tracking-[0.5px]">Batch</TableHead>
              <TableHead className="h-12 font-bold text-[12px] uppercase text-[#6B7280] tracking-[0.5px]">Amount</TableHead>
              <TableHead className="h-12 font-bold text-[12px] uppercase text-[#6B7280] tracking-[0.5px]">Mode</TableHead>
              <TableHead className="h-12 font-bold text-[12px] uppercase text-[#6B7280] tracking-[0.5px]">Date</TableHead>
              <TableHead className="h-12 font-bold text-[12px] uppercase text-[#6B7280] tracking-[0.5px]">Status</TableHead>
              <TableHead className="h-12 font-bold text-[12px] uppercase text-[#6B7280] tracking-[0.5px]">GST Status</TableHead>
              <TableHead className="h-12 font-bold text-[12px] uppercase text-[#6B7280] tracking-[0.5px]">Invoice</TableHead>
              <TableHead className="h-12 font-bold text-[12px] uppercase text-[#6B7280] tracking-[0.5px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((pay, idx) => {
              const isRefunded = pay.status === 'Refunded';
              const initials = pay.clientName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              
              return (
                <TableRow 
                  key={pay.id} 
                  className={cn(
                    "group h-[56px] border-b border-[#F3F4F6] transition-colors cursor-pointer",
                    idx % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]",
                    isRefunded && "bg-red-50/30 hover:bg-red-50/50"
                  )}
                  onClick={() => {
                    setSelectedPayment(pay);
                    setIsDetailPanelOpen(true);
                  }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black shrink-0",
                        getAvatarColors(initials)
                      )}>
                        {initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-slate-900">{pay.clientName}</span>
                        <span className="text-[11px] text-slate-400 font-medium">{pay.mobile}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-[13px] text-slate-600 font-medium">{pay.batch}</span>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "text-[14px] font-black",
                      isRefunded ? "text-slate-400 line-through" : "text-slate-900"
                    )}>
                      ₹{pay.amount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       {pay.paymentMode === 'Razorpay' && <CreditCard className="h-3.5 w-3.5 text-blue-500" />}
                       {pay.paymentMode === 'UPI' && <Smartphone className="h-3.5 w-3.5 text-purple-500" />}
                       {pay.paymentMode === 'Cash' && <Banknote className="h-3.5 w-3.5 text-green-500" />}
                       <span className="text-[13px] text-slate-600 font-medium">{pay.paymentMode}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-[13px] text-slate-500">{pay.paymentDate}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-none",
                      getStatusBadge(pay.status)
                    )}>
                      {pay.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-none",
                      getGSTBadge(pay.gstStatus)
                    )}>
                      {pay.gstStatus}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={pay.invoiceStatus === 'Generating...'}
                      className={cn(
                        "h-8 text-xs font-bold gap-2",
                        pay.invoiceStatus === 'View' ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50" : "text-slate-400"
                      )}
                    >
                      {pay.invoiceStatus === 'View' ? <FileText className="h-3.5 w-3.5" /> : <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                      {pay.invoiceStatus}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => {
                          setSelectedPayment(pay);
                          setIsDetailPanelOpen(true);
                        }} className="font-bold text-xs gap-2">
                          <EyeIcon className="h-3.5 w-3.5 text-slate-400" />
                          View details
                        </DropdownMenuItem>
                        
                        {pay.status === 'Captured' && (
                          <>
                            {pay.paymentMode === 'Razorpay' ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex w-full items-center px-2 py-1.5 text-xs font-bold text-slate-300 cursor-not-allowed gap-2">
                                      <RotateCcw className="h-3.5 w-3.5" />
                                      Refund via Razorpay (auto)
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="left" className="bg-slate-900 text-white border-none text-[11px] p-2 max-w-[200px]">
                                    Razorpay refunds are processed automatically via webhook.
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => openRefundPanel(pay)} 
                                className="font-bold text-xs gap-2 text-red-600 focus:text-red-600"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Process manual refund
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                        <DropdownMenuItem className="font-bold text-xs gap-2">
                          <History className="h-3.5 w-3.5 text-slate-400" />
                          Audit history
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* MANUAL PAYMENT PANEL */}
      <Sheet open={isManualSheetOpen} onOpenChange={setIsManualSheetOpen}>
        <SheetContent side="right" className="gap-0 p-0 flex flex-col">
          <SheetHeader className="relative">
            <SheetTitle>Add Manual Payment</SheetTitle>
            <SheetDescription className="text-slate-500 font-medium">Record a payment received outside of Razorpay.</SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client Name</Label>
                <Input 
                  placeholder="Enter full name" 
                  className="h-11 border-slate-200"
                  value={manualPayment.name}
                  onChange={(e) => setManualPayment({...manualPayment, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email</Label>
                  <Input 
                    type="email" 
                    placeholder="name@example.com" 
                    className="h-11 border-slate-200"
                    value={manualPayment.email}
                    onChange={(e) => setManualPayment({...manualPayment, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mobile</Label>
                  <Input 
                    placeholder="91XXXXXXXXXX" 
                    className="h-11 border-slate-200"
                    value={manualPayment.mobile}
                    onChange={(e) => setManualPayment({...manualPayment, mobile: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Program</Label>
                  <Select value={manualPayment.program} onValueChange={(v) => setManualPayment({...manualPayment, program: v})}>
                    <SelectTrigger className="h-11 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PACE">PACE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Batch</Label>
                  <Select value={manualPayment.batch} onValueChange={(v) => setManualPayment({...manualPayment, batch: v})}>
                    <SelectTrigger className="h-11 border-slate-200">
                      <SelectValue placeholder="Select Batch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PACE Batch 7">PACE Batch 7</SelectItem>
                      <SelectItem value="PACE Batch 8">PACE Batch 8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <Input 
                      placeholder="15000" 
                      className="h-11 border-slate-200 pl-8"
                      value={manualPayment.amount}
                      onChange={(e) => setManualPayment({...manualPayment, amount: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Payment Mode</Label>
                  <Select value={manualPayment.mode} onValueChange={(v) => setManualPayment({...manualPayment, mode: v})}>
                    <SelectTrigger className="h-11 border-slate-200 text-left">
                      <SelectValue placeholder="Select Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Card">Card</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Payment Date</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-slate-300" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-900 text-white text-[10px]">Enter actual date payment was received.</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input 
                    type="date" 
                    className="h-11 border-slate-200"
                    value={manualPayment.date}
                    onChange={(e) => setManualPayment({...manualPayment, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">UTM Source</Label>
                  <Select value={manualPayment.utm} onValueChange={(v) => setManualPayment({...manualPayment, utm: v})}>
                    <SelectTrigger className="h-11 border-slate-200 text-left">
                      <SelectValue placeholder="Select Source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Google">Google</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="Organic">Organic</SelectItem>
                      <SelectItem value="Manual">Manual Entry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className={cn("text-[11px] font-bold uppercase tracking-wider", manualError ? "text-red-500" : "text-slate-400")}>
                  Internal Notes (Mandatory)
                </Label>
                <Textarea 
                  placeholder="Minimum 10 characters required for audit history..."
                  className={cn("min-h-[100px] border-slate-200 resize-none", manualError && "border-red-200 bg-red-50/20")}
                  value={manualPayment.notes}
                  onChange={(e) => setManualPayment({...manualPayment, notes: e.target.value})}
                />
                {manualError && (
                  <p className="text-[11px] text-red-500 font-bold flex items-center gap-1 animate-in slide-in-from-top-1">
                    <AlertCircle className="h-3 w-3" />
                    {manualError}
                  </p>
                )}
              </div>
            </div>
          </div>

          <SheetFooter className="bg-white">
            <Button 
              onClick={handleAddManualPayment}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 shadow-lg shadow-slate-200"
            >
              Save payment
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* PROCESS REFUND PANEL */}
      <Sheet open={isRefundSheetOpen} onOpenChange={setIsRefundSheetOpen}>
        <SheetContent side="right" className="gap-0 p-0 flex flex-col">
          <SheetHeader className="relative">
            <SheetTitle>Process Manual Refund</SheetTitle>
            <SheetDescription className="text-red-600/70 font-medium">Create a refund record for {selectedPayment?.clientName}</SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-3">
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest block mb-1">Transaction Details</span>
                <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-slate-100">
                  <span className="text-[12px] text-slate-500">Batch</span>
                  <span className="text-[12px] font-bold text-slate-900">{selectedPayment?.batch}</span>
                </div>
                <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-slate-100">
                  <span className="text-[12px] text-slate-500">Original Amount</span>
                  <span className="text-[12px] font-bold text-slate-900">₹{selectedPayment?.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-slate-100">
                  <span className="text-[12px] text-slate-500">Original Payment Mode</span>
                  <span className="text-[12px] font-bold text-slate-900">{selectedPayment?.paymentMode}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 mt-4">
                 <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Refund Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <Input 
                      placeholder={selectedPayment?.amount.toString()} 
                      className="h-11 border-slate-200 pl-8 font-bold text-red-600"
                      value={refundData.amount}
                      onChange={(e) => setRefundData({...refundData, amount: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Refund Date</Label>
                    <Input 
                      type="date" 
                      className="h-11 border-slate-200"
                      value={refundData.date}
                      onChange={(e) => setRefundData({...refundData, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Refund Mode</Label>
                    <Select value={refundData.mode} onValueChange={(v) => setRefundData({...refundData, mode: v})}>
                      <SelectTrigger className="h-11 border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={cn("text-[11px] font-bold uppercase tracking-wider", refundError ? "text-red-500" : "text-slate-400")}>
                    Refund Reason/Notes (Mandatory)
                  </Label>
                  <Textarea 
                    placeholder="Explain why this refund is being processed..."
                    className={cn("min-h-[100px] border-slate-200 resize-none", refundError && "border-red-200 bg-red-50/20")}
                    value={refundData.notes}
                    onChange={(e) => setRefundData({...refundData, notes: e.target.value})}
                  />
                  {refundError && (
                    <p className="text-[11px] text-red-500 font-bold flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      {refundError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="bg-white">
            <Button 
                onClick={handleProcessRefund}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 shadow-lg shadow-red-200"
              >
                Confirm refund
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Refund Confirmation Dialog */}
      <Dialog open={isRefundConfirmOpen} onOpenChange={setIsRefundConfirmOpen}>
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden">
          <div className="p-6 text-center">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-6 mx-auto">
              <RotateCcw className="h-8 w-8 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-black text-slate-900 mb-2">Confirm refund processing?</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              This will mark the payment as <span className="text-red-600 font-bold underline underline-offset-4">Refunded</span>. 
              The original transaction will be preserved in audit history. This action cannot be undone.
            </DialogDescription>
          </div>
          <DialogFooter className="bg-slate-50 p-4 border-t border-slate-100 flex gap-3 sm:justify-center">
            <Button 
              variant="ghost" 
              onClick={() => setIsRefundConfirmOpen(false)}
              className="flex-1 font-bold text-slate-500 h-11 rounded-lg"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmRefund}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold h-11 rounded-lg shadow-lg shadow-red-100"
            >
              Confirm refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PAYMENT DETAIL PANEL */}
      <Sheet open={isDetailPanelOpen} onOpenChange={(open) => {
        setIsDetailPanelOpen(open);
      }}>
        <SheetContent side="right" className="gap-0 p-0 flex flex-col bg-white">
          <SheetHeader className="relative flex-shrink-0">
            <div className="flex items-center gap-5 pr-10">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black shrink-0 shadow-sm",
                selectedPayment ? getAvatarColors(selectedPayment.clientName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)) : ""
              )}>
                {selectedPayment?.clientName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div className="flex flex-col min-w-0">
                <SheetTitle className="truncate">
                  {selectedPayment?.clientName}
                </SheetTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="bg-slate-50 text-slate-500 font-mono text-[10px] border-slate-200">#{selectedPayment?.id}</Badge>
                  <Badge className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5", getStatusBadge(selectedPayment?.status || ""))}>
                    {selectedPayment?.status}
                  </Badge>
                </div>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
            {/* Payment Grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-8">
              {[
                { label: 'Batch Selection', value: selectedPayment?.batch },
                { label: 'Amount Paid', value: `₹${selectedPayment?.amount.toLocaleString()}`, heavy: true },
                { label: 'Payment Date', value: selectedPayment?.paymentDate },
                { label: 'Payment Mode', value: selectedPayment?.paymentMode },
                { label: 'Client Mobile', value: selectedPayment?.mobile },
                { label: 'Client Email', value: selectedPayment?.email, truncate: true },
                { label: 'UTM Source', value: selectedPayment?.utmSource || 'N/A' },
                { label: 'UTM Medium', value: selectedPayment?.utmMedium || 'N/A' },
                { label: 'UTM Term', value: selectedPayment?.utmTerm || 'N/A' },
                { label: 'Department', value: selectedPayment?.department || 'Accounts' },
              ].map((item, i) => (
                <div key={i} className={cn("flex flex-col gap-1.5", item.truncate && "min-w-0")}>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.label}</span>
                  <span className={cn(
                    "text-[14px] text-slate-900 font-bold", 
                    item.heavy && "text-[18px] font-black",
                    item.truncate && "truncate"
                   )}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Refund History (if applicable) */}
            {selectedPayment?.status === 'Refunded' && selectedPayment.refundInfo && (
              <div className="bg-red-50/50 rounded-2xl border border-red-100 p-6 space-y-4">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-lg bg-red-100 flex items-center justify-center">
                      <RotateCcw className="h-3.5 w-3.5 text-red-600" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-red-700">Refund Information</h3>
                 </div>
                 {selectedPayment.refundInfo.razorpayId && (
                   <div className="flex flex-col gap-1 mb-4 p-3 bg-white rounded-lg border border-red-100">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Automatic System Log</span>
                      <p className="text-[13px] text-slate-700 leading-relaxed font-medium">
                        Razorpay refund received automatically.
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                        <span className="text-[11px] text-slate-400">Razorpay Refund ID: <span className="font-mono text-slate-600">{selectedPayment.refundInfo.razorpayId}</span></span>
                      </div>
                   </div>
                 )}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase text-red-400 tracking-widest">Refund Amount</span>
                      <span className="text-[14px] text-red-700 font-black">₹{selectedPayment.refundInfo.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase text-red-400 tracking-widest">Refund Date</span>
                      <span className="text-[14px] text-red-700 font-bold">{selectedPayment.refundInfo.date}</span>
                    </div>
                 </div>
                 <div className="flex flex-col gap-1 mt-2">
                    <span className="text-[10px] font-black uppercase text-red-400 tracking-widest">Reason/Notes</span>
                    <p className="text-[13px] text-red-700 leading-relaxed bg-white/50 p-3 rounded-lg border border-red-50 italic">
                      "{selectedPayment.refundInfo.notes}"
                    </p>
                 </div>
              </div>
            )}

            {/* GST Details */}
            <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-5 space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-600">
                    <FileText className="h-3.5 w-3.5 text-blue-500" />
                    GST Details
                  </div>
                  <Badge className={cn("text-[9px] font-black uppercase tracking-widest px-2", getGSTBadge(selectedPayment?.gstStatus || ""))}>
                    {selectedPayment?.gstStatus}
                  </Badge>
               </div>

               <div className="space-y-4">
                 {selectedPayment?.gstStatus === 'GST Pending' && (
                    <div className="p-4 rounded-lg border border-amber-100 bg-amber-50/50">
                       <p className="text-[12px] text-amber-700 leading-relaxed font-bold flex items-center gap-2">
                         <AlertCircle className="h-3.5 w-3.5" />
                         Step 1: GST form link sent from CRM. Step 2: waiting for client submission.
                       </p>
                    </div>
                 )}

                 {selectedPayment?.gstInvoicedRequired === 'No' && (
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[12px] text-slate-600 font-medium">Non-GST invoice generated via Native CRM Invoice Service (not Master India).</span>
                       <button className="text-[12px] font-bold text-blue-600 hover:underline flex items-center gap-1.5 leading-none">
                         View invoice
                         <ExternalLink className="h-3 w-3" />
                       </button>
                    </div>
                 )}

                 {selectedPayment?.gstInvoicedRequired === 'Yes' && selectedPayment.gstin && (
                    <div className="space-y-3">
                       <div className="flex items-center justify-between px-1">
                        <span className="text-[12px] text-green-700 font-bold">GST invoice generated successfully via Master India API.</span>
                          <button className="text-[12px] font-bold text-blue-600 hover:underline flex items-center gap-1.5 leading-none">
                            View invoice
                            <ExternalLink className="h-3 w-3" />
                          </button>
                       </div>
                       <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-200/50 px-1">
                          <div className="flex justify-between items-center text-[11px]">
                             <span className="text-slate-400 font-bold uppercase tracking-wider">Company</span>
                             <span className="text-slate-700 font-bold uppercase">{selectedPayment.companyName}</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px]">
                             <span className="text-slate-400 font-bold uppercase tracking-wider">GSTIN</span>
                             <span className="text-slate-700 font-mono font-bold">{selectedPayment.gstin}</span>
                          </div>
                       </div>
                    </div>
                 )}

                 {selectedPayment?.gstStatus === 'GSTIN Pending' && (
                    <div className="p-4 rounded-lg border border-amber-100 bg-amber-50/50">
                       <p className="text-[12px] text-amber-900 leading-relaxed font-bold flex items-center gap-2">
                         <AlertCircle className="h-3.5 w-3.5" />
                         GST required but GSTIN missing. Invoice not generated. 3-day reminder sequence (Email + WhatsApp) active.
                       </p>
                    </div>
                 )}

                 <div className="pt-2 border-t border-slate-200/50 px-1 space-y-1">
                   <p className="text-[11px] text-slate-500 font-medium">Program: <span className="font-bold text-slate-700">{selectedPayment?.program}</span></p>
                   <p className="text-[11px] text-slate-500 font-medium">Invoice Type: <span className="font-bold text-slate-700">{selectedPayment?.invoiceType || 'Pending'}</span></p>
                   <p className="text-[11px] text-slate-500 font-medium">Generated By: <span className="font-bold text-slate-700">{selectedPayment?.generatedBy || 'System'}</span></p>
                 </div>
               </div>
            </div>

            {/* Audit Log Section */}
            <div className="pb-4">
              <AuditTrail
                title="Payment audit log"
                collapsible={true}
                maxVisible={3}
                entries={[
                  {
                    id: '1',
                    actor: 'System',
                    action: 'Payment captured via Razorpay',
                    module: 'PACE Payments',
                    detail: '₹15,000 · PACE Batch 7',
                    timestamp: '10 Apr 2026, 3:42 PM',
                    relative_time: '18 days ago',
                    type: 'trigger',
                  },
                  {
                    id: '2',
                    actor: 'System',
                    action: 'GST form sent to client',
                    module: 'PACE Payments',
                    detail: 'anita@example.com',
                    timestamp: '10 Apr 2026, 3:43 PM',
                    relative_time: '18 days ago',
                    type: 'trigger',
                  },
                  {
                    id: '3',
                    actor: 'System',
                    action: 'Non-GST invoice generated',
                    module: 'PACE Payments',
                    detail: 'Invoice #INV-2026-001',
                    timestamp: '10 Apr 2026, 4:01 PM',
                    relative_time: '18 days ago',
                    type: 'trigger',
                  },
                ]}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default PACEPayments;
