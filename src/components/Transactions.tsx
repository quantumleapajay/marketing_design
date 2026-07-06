
import React, { useMemo, useState } from 'react';
import { 
  Search, 
  SlidersHorizontal,
  Download,
  Eye,
  Info,
  X
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
import { 
  Sheet, 
  SheetContent, 
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import { Checkbox } from './ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { toast } from 'sonner';
import { cn, getAvatarColors } from '../lib/utils';
import { useAuth } from '../lib/auth';

interface Transaction {
  id: string;
  name: string;
  email: string;
  phone: string;
  details: string;
  date: string;
  time: string;
  amount: string;
  status: 'Captured' | 'Refunded';
  program: string;
  state: string;
  city: string;
  refundDate?: string;
  refundAmount?: string;
  refundMode?: string;
  refundId?: string;
}

type DatePreset = 'all' | 'last7' | 'last30' | 'thisMonth' | 'custom';
type FilterKey = 'status' | 'source' | 'program' | 'programType';

interface FilterState {
  status: string[];
  source: string[];
  program: string[];
  programType: string[];
  datePreset: DatePreset;
  dateFrom: string;
  dateTo: string;
}

const DEFAULT_FILTERS: FilterState = {
  status: [],
  source: [],
  program: [],
  programType: [],
  datePreset: 'all',
  dateFrom: '',
  dateTo: '',
};

const parseTxDate = (dateValue: string) => {
  const [dayRaw, monthRaw, yearRaw] = dateValue.split(' ');
  const monthMap: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };

  return new Date(Number(yearRaw), monthMap[monthRaw], Number(dayRaw));
};

const getProgramType = (program: string) => {
  if (program.toLowerCase().includes('pace')) return 'PACE';
  if (program.toLowerCase().includes('bsw')) return 'BSW';
  return 'Other';
};

const MOCK_TRANSACTIONS: Transaction[] = [
  { 
    id: 'RPY-001', 
    name: 'Rajesh Kumar', 
    email: 'raj@example.com', 
    phone: '+91 98765 43210', 
    details: 'Razorpay', 
    date: '14 Mar 2026', 
    time: '11:42 AM',
    amount: '₹99', 
    status: 'Captured',
    program: 'BSW Webinar',
    state: 'Maharashtra',
    city: 'Mumbai'
  },
  { 
    id: 'RPY-002', 
    name: 'Priya Shah', 
    email: 'pri@example.com', 
    phone: '+91 98765 43211', 
    details: 'Razorpay', 
    date: '14 Mar 2026', 
    time: '11:55 AM',
    amount: '₹99', 
    status: 'Captured',
    program: 'BSW Webinar',
    state: 'Gujarat',
    city: 'Ahmedabad'
  },
  { 
    id: 'RPY-003', 
    name: 'Amit Patel', 
    email: 'ami@example.com', 
    phone: '+91 98765 43212', 
    details: 'Razorpay', 
    date: '25 Mar 2026', 
    time: '2:15 PM',
    amount: '₹15,000', 
    status: 'Captured',
    program: 'PACE Masterclass',
    state: 'Maharashtra',
    city: 'Pune'
  },
  { 
    id: 'RPY-004', 
    name: 'Sneha Reddy', 
    email: 'sne@example.com', 
    phone: '+91 98765 43213', 
    details: 'UPI', 
    date: '16 Mar 2026', 
    time: '9:30 AM',
    amount: '₹99', 
    status: 'Captured',
    program: 'BSW Webinar',
    state: 'Telangana',
    city: 'Hyderabad'
  },
  { 
    id: 'RPY-005', 
    name: 'Vikram Singh', 
    email: 'vik@example.com', 
    phone: '+91 98765 43214', 
    details: 'Free Webinar', 
    date: '22 Mar 2026', 
    time: '4:00 PM',
    amount: '₹0', 
    status: 'Captured',
    program: 'BSW Webinar',
    state: 'Delhi',
    city: 'New Delhi'
  },
  { 
    id: 'RPY-006', 
    name: 'Meera Joshi', 
    email: 'mee@example.com', 
    phone: '+91 98765 43215', 
    details: 'Card', 
    date: '1 Apr 2026', 
    time: '3:20 PM',
    amount: '₹15,000', 
    status: 'Captured',
    program: 'PACE Masterclass',
    state: 'Karnataka',
    city: 'Bengaluru'
  },
  { 
    id: 'RPY-007', 
    name: 'Arjun Nair', 
    email: 'arj@example.com', 
    phone: '+91 98765 43216', 
    details: 'Razorpay', 
    date: '2 Apr 2026', 
    time: '10:10 AM',
    amount: '₹99', 
    status: 'Refunded',
    program: 'BSW Webinar',
    state: 'Kerala',
    city: 'Kochi',
    refundDate: '10 Apr 2026',
    refundAmount: '₹99',
    refundMode: 'Razorpay (Auto)',
    refundId: 'REF-007'
  },
  { 
    id: 'RPY-008', 
    name: 'Kavya Iyer', 
    email: 'kav@example.com', 
    phone: '+91 98765 43217', 
    details: 'Bank Transfer', 
    date: '5 Apr 2026', 
    time: '1:45 PM',
    amount: '₹15,000', 
    status: 'Captured',
    program: 'PACE Masterclass',
    state: 'Tamil Nadu',
    city: 'Chennai'
  },
];

export const Transactions: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Marketing Head';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);
  const [activeSelector, setActiveSelector] = useState<FilterKey | null>(null);
  const [selectorSearch, setSelectorSearch] = useState('');
  const [draftFilters, setDraftFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const handleExport = () => {
    setIsExportDialogOpen(false);
    toast.success('Export started. Your file will download shortly.', { duration: 4000 });
    // triggers backend workflow create_csv_file_transaction_data
  };

  const DetailRow = ({ label, value, isEven }: { label: string; value: string | React.ReactNode; isEven: boolean }) => (
    <div className={cn("flex items-center justify-between h-9 px-4", isEven ? "bg-[#F9FAFB]" : "bg-white")}>
      <span className="text-[12px] text-slate-500 font-medium">{label}</span>
      <span className="text-[13px] font-medium text-slate-900">{value}</span>
    </div>
  );

  const getStatusBadge = (status: Transaction['status']) => {
    if (status === 'Captured') {
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-bold text-green-700 uppercase tracking-widest">
          Captured
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-grey-100 px-2.5 py-1 text-[11px] font-bold text-grey-600 uppercase tracking-widest">
        Refunded
      </span>
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const filterOptions = useMemo(() => ({
    status: ['Captured', 'Refunded'],
    source: Array.from(new Set(MOCK_TRANSACTIONS.map((tx) => tx.details))),
    program: Array.from(new Set(MOCK_TRANSACTIONS.map((tx) => tx.program))),
    programType: Array.from(new Set(MOCK_TRANSACTIONS.map((tx) => getProgramType(tx.program)))),
  }), []);

  const selectedDateLabel = useMemo(() => {
    if (appliedFilters.datePreset === 'all') return 'All dates';
    if (appliedFilters.datePreset === 'last7') return 'Last 7 days';
    if (appliedFilters.datePreset === 'last30') return 'Last 30 days';
    if (appliedFilters.datePreset === 'thisMonth') return 'This month';
    return 'Custom range';
  }, [appliedFilters.datePreset]);

  const activeFilterCount = [
    appliedFilters.status.length > 0,
    appliedFilters.source.length > 0,
    appliedFilters.program.length > 0,
    appliedFilters.programType.length > 0,
    appliedFilters.datePreset !== 'all' || appliedFilters.dateFrom || appliedFilters.dateTo,
  ].filter(Boolean).length;

  const getDateRangeFromPreset = (preset: DatePreset) => {
    const now = new Date();
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (preset === 'last7') {
      const from = new Date(to);
      from.setDate(from.getDate() - 6);
      return { from, to };
    }
    if (preset === 'last30') {
      const from = new Date(to);
      from.setDate(from.getDate() - 29);
      return { from, to };
    }
    if (preset === 'thisMonth') {
      const from = new Date(to.getFullYear(), to.getMonth(), 1);
      return { from, to };
    }

    return { from: null as Date | null, to: null as Date | null };
  };

  const filteredTransactions = MOCK_TRANSACTIONS.filter(tx => {
    const matchesSearch = tx.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tx.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tx.phone.includes(searchQuery) ||
                          tx.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = appliedFilters.status.length === 0 || appliedFilters.status.includes(tx.status);
    const matchesSource = appliedFilters.source.length === 0 || appliedFilters.source.includes(tx.details);
    const matchesProgram = appliedFilters.program.length === 0 || appliedFilters.program.includes(tx.program);
    const matchesProgramType = appliedFilters.programType.length === 0 || appliedFilters.programType.includes(getProgramType(tx.program));

    const txDate = parseTxDate(tx.date);
    let matchesDate = true;

    if (appliedFilters.datePreset === 'all') {
      matchesDate = true;
    } else if (appliedFilters.datePreset === 'custom') {
      if (appliedFilters.dateFrom) {
        matchesDate = matchesDate && txDate >= new Date(appliedFilters.dateFrom);
      }
      if (appliedFilters.dateTo) {
        matchesDate = matchesDate && txDate <= new Date(appliedFilters.dateTo);
      }
    } else {
      const { from, to } = getDateRangeFromPreset(appliedFilters.datePreset);
      if (from && to) {
        matchesDate = txDate >= from && txDate <= to;
      }
    }

    return matchesSearch && matchesStatus && matchesSource && matchesProgram && matchesProgramType && matchesDate;
  });

  const openFilterDrawer = () => {
    setDraftFilters(appliedFilters);
    setSelectorSearch('');
    setActiveSelector(null);
    setIsFilterOpen(true);
  };

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setIsFilterOpen(false);
    setSelectorSearch('');
    setActiveSelector(null);
  };

  const resetDraftFilters = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setSelectorSearch('');
    setActiveSelector(null);
  };

  const clearAllFilters = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setSearchQuery('');
  };

  const toggleDraftFilterValue = (key: FilterKey, value: string) => {
    setDraftFilters((prev) => {
      const hasValue = prev[key].includes(value);
      return {
        ...prev,
        [key]: hasValue
          ? prev[key].filter((item) => item !== value)
          : [...prev[key], value],
      };
    });
  };

  const getFieldSummary = (key: FilterKey) => {
    const values = draftFilters[key];
    if (values.length === 0) return 'All options';
    if (values.length === 1) return values[0];
    return `${values.length} selected`;
  };

  const chips = [
    {
      key: 'date',
      label: selectedDateLabel,
      filter: 'date' as const,
      removable: appliedFilters.datePreset !== 'all',
    },
    ...appliedFilters.status.map((value) => ({ key: `status-${value}`, label: value, filter: 'status' as FilterKey, value, removable: true })),
    ...appliedFilters.source.map((value) => ({ key: `source-${value}`, label: value, filter: 'source' as FilterKey, value, removable: true })),
    ...appliedFilters.program.map((value) => ({ key: `program-${value}`, label: value, filter: 'program' as FilterKey, value, removable: true })),
    ...appliedFilters.programType.map((value) => ({ key: `programType-${value}`, label: value, filter: 'programType' as FilterKey, value, removable: true })),
  ];

  return (
    <div className="p-8 pt-0 max-w-7xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white py-8 mb-0">
        <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
        <p className="text-[#6B7280] mt-1 text-sm">All payment records across BSW, BBS and PACE programs.</p>
      </div>

      {/* Top Row: Search & Filters */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
          <Input 
            placeholder="Search by email or phone number" 
            className="pl-10 h-10 bg-white border-slate-200 rounded-xl focus-visible:ring-primary/20 placeholder:text-[#9CA3AF]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={openFilterDrawer}
            className="h-10 px-4 rounded-xl border-slate-200 text-[#374151] font-semibold text-sm gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
          </Button>
          {isAdmin && (
            <Button 
              variant="outline" 
              onClick={() => setIsExportDialogOpen(true)}
              className="h-10 px-4 rounded-xl border-slate-200 text-[#6B7280] font-bold text-xs uppercase tracking-widest gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </div>

      {chips.length > 0 && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-700"
              >
                {chip.label}
                {chip.removable && (
                  <button
                    onClick={() => {
                      if (chip.filter === 'date') {
                        setAppliedFilters((prev) => ({
                          ...prev,
                          datePreset: 'all',
                          dateFrom: '',
                          dateTo: '',
                        }));
                        return;
                      }

                      setAppliedFilters((prev) => ({
                        ...prev,
                        [chip.filter]: prev[chip.filter].filter((item) => item !== chip.value),
                      }));
                    }}
                    className="text-slate-400 hover:text-slate-600"
                    aria-label={`Remove ${chip.label} filter`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </span>
            ))}
          </div>
          <button
            onClick={clearAllFilters}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Transactions Table */}
      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-[#E5E7EB]">
              <TableHead className="text-[13px] font-bold uppercase text-[#6B7280] tracking-[0.5px] h-12">Name</TableHead>
              <TableHead className="text-[13px] font-bold uppercase text-[#6B7280] tracking-[0.5px] h-12">Details</TableHead>
              <TableHead className="text-[13px] font-bold uppercase text-[#6B7280] tracking-[0.5px] h-12">Created</TableHead>
              <TableHead className="text-[13px] font-bold uppercase text-[#6B7280] tracking-[0.5px] h-12">Amount</TableHead>
              <TableHead className="text-[13px] font-bold uppercase text-[#6B7280] tracking-[0.5px] h-12">Status</TableHead>
              <TableHead className="text-[13px] font-bold uppercase text-[#6B7280] tracking-[0.5px] h-12">Invoice</TableHead>
              <TableHead className="text-[13px] font-bold uppercase text-[#6B7280] tracking-[0.5px] h-12">Transaction ID</TableHead>
              <TableHead className="text-[13px] font-bold uppercase text-[#6B7280] tracking-[0.5px] h-12 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((tx, index) => {
              const isRefunded = tx.status === 'Refunded';
              const initials = getInitials(tx.name);
              return (
                <TableRow 
                  key={tx.id} 
                  onClick={() => setSelectedTransaction(tx)}
                  className={cn(
                    "cursor-pointer transition-colors h-[56px] border-b border-[#F3F4F6]",
                    index % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]",
                    isRefunded && "text-[#9CA3AF]"
                  )}
                >
                  <TableCell className="py-2">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-[36px] h-[36px] rounded-full flex items-center justify-center text-[12px] font-bold shrink-0",
                        getAvatarColors(initials)
                      )}>
                        {initials}
                      </div>
                      <div className="flex flex-col whitespace-nowrap overflow-hidden">
                        <span className={cn("text-sm font-bold", isRefunded ? "text-[#9CA3AF]" : "text-black")}>{tx.name}</span>
                        <span className="text-[11px] text-[#6B7280]">ID: #{(index + 1).toString().padStart(4, '0')}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#9CA3AF] shrink-0">{tx.email}</span>
                          <span className="text-[10px] text-[#9CA3AF] shrink-0">·</span>
                          <span className="text-[10px] text-[#9CA3AF] shrink-0">{tx.phone}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-[13px] text-[#6B7280]">{tx.details}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className={cn("text-[13px]", isRefunded ? "text-[#9CA3AF]" : "text-black")}>{tx.date}</span>
                      <span className="text-[11px] text-[#6B7280]">{tx.time}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn("text-sm font-bold", isRefunded ? "text-[#9CA3AF]" : "text-black")}>{tx.amount}</span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(tx.status)}
                  </TableCell>
                  <TableCell>
                    <span className="text-[12px] text-[#6B7280]">Invoice #{(index + 1).toString().padStart(4, '0')}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-[12px] font-mono text-[#6B7280]">{tx.id}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTransaction(tx);
                      }}
                      className="h-8 px-3 border-slate-200 text-[#6B7280] font-bold text-[11px] uppercase tracking-widest gap-2 rounded-lg hover:bg-slate-50 transition-all"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredTransactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-[400px] text-center">
                  <div className="text-center py-12">
                    <Search className="w-10 h-10 mx-auto mb-3 text-gray-300 opacity-30" />
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">No transactions found</h3>
                    <p className="text-xs text-gray-400 mb-4 max-w-[250px] mx-auto">
                      We couldn't find any transactions matching "{searchQuery}"
                    </p>
                    <Button 
                      variant="ghost" 
                      onClick={clearAllFilters}
                      className="text-blue-600 font-bold hover:text-blue-700 hover:bg-blue-50"
                    >
                      Try removing one filter
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Filter Panel */}
      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent className="gap-0 p-0 flex flex-col border-l border-slate-200 shadow-2xl">
          <SheetHeader className="relative">
            <SheetTitle>
              {activeSelector ? 'Choose options' : 'Filters'}
            </SheetTitle>
          </SheetHeader>

          {!activeSelector ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">Basic filters</h3>
                <p className="text-xs text-slate-500">Choose a period to narrow transactions.</p>

                <div className="space-y-2">
                  <p className="text-xs text-slate-500">Date range</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'all', label: 'All dates' },
                      { key: 'last7', label: 'Last 7 days' },
                      { key: 'last30', label: 'Last 30 days' },
                      { key: 'thisMonth', label: 'This month' },
                      { key: 'custom', label: 'Custom' },
                    ].map((option) => (
                      <button
                        key={option.key}
                        onClick={() => setDraftFilters((prev) => ({ ...prev, datePreset: option.key as DatePreset }))}
                        className={cn(
                          'h-11 rounded-lg border text-sm text-left px-3',
                          draftFilters.datePreset === option.key
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-slate-200 text-slate-700'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {draftFilters.datePreset === 'custom' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <p className="text-xs text-slate-500">From</p>
                      <Input
                        type="date"
                        className="h-11 rounded-lg border-slate-200 text-sm"
                        value={draftFilters.dateFrom}
                        onChange={(e) => setDraftFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs text-slate-500">To</p>
                      <Input
                        type="date"
                        className="h-11 rounded-lg border-slate-200 text-sm"
                        value={draftFilters.dateTo}
                        onChange={(e) => setDraftFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                {([
                  ['status', 'Payment status'],
                  ['source', 'Payment source'],
                ] as [FilterKey, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectorSearch('');
                      setActiveSelector(key);
                    }}
                    className="w-full min-h-11 rounded-lg border border-slate-200 px-3 py-2 text-left"
                  >
                    <p className="text-sm font-medium text-slate-800">{label}</p>
                    <p className="text-xs text-slate-500">{getFieldSummary(key)}</p>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setIsMoreFiltersOpen((prev) => !prev)}
                  className="w-full h-11 rounded-lg border border-slate-200 px-3 text-left text-sm font-semibold text-slate-800"
                >
                  More filters {isMoreFiltersOpen ? '−' : '+'}
                </button>
                {isMoreFiltersOpen && (
                  <div className="space-y-2">
                    {([
                      ['program', 'Program/Campaign'],
                      ['programType', 'Program type'],
                    ] as [FilterKey, string][]).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectorSearch('');
                          setActiveSelector(key);
                        }}
                        className="w-full min-h-11 rounded-lg border border-slate-200 px-3 py-2 text-left"
                      >
                        <p className="text-sm font-medium text-slate-800">{label}</p>
                        <p className="text-xs text-slate-500">{getFieldSummary(key)}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <Button
                variant="ghost"
                onClick={() => setActiveSelector(null)}
                className="justify-start px-0 text-slate-600 hover:bg-transparent"
              >
                ← Back to filters
              </Button>

              <Input
                placeholder="Type to search options"
                value={selectorSearch}
                onChange={(e) => setSelectorSearch(e.target.value)}
                className="h-11 rounded-lg border-slate-200"
              />

              <div className="space-y-1">
                {filterOptions[activeSelector]
                  .filter((option) => option.toLowerCase().includes(selectorSearch.toLowerCase()))
                  .map((option) => {
                    const checked = draftFilters[activeSelector].includes(option);
                    return (
                      <button
                        key={option}
                        onClick={() => toggleDraftFilterValue(activeSelector, option)}
                        className="w-full min-h-11 rounded-lg border border-slate-200 px-3 text-left flex items-center gap-3"
                      >
                        <Checkbox
                          checked={checked}
                          className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 pointer-events-none"
                        />
                        <span className="text-sm text-slate-700">{option}</span>
                      </button>
                    );
                  })}
                {filterOptions[activeSelector].filter((option) => option.toLowerCase().includes(selectorSearch.toLowerCase())).length === 0 && (
                  <div className="text-center py-12">
                    <Search className="w-10 h-10 mx-auto mb-3 text-gray-300 opacity-30" />
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">No options found</h3>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="px-5 py-3 border-t border-gray-100 bg-white mt-auto sticky bottom-0">
            {activeSelector ? (
              <div className="flex justify-end gap-2">
                <Button
                  className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm"
                  onClick={() => setActiveSelector(null)}
                >
                  Done
                </Button>
              </div>
            ) : (
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="h-11 rounded-xl border-slate-200 text-[#374151] font-semibold text-sm"
                  onClick={resetDraftFilters}
                >
                  Reset all
                </Button>
                <Button
                  className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all"
                  onClick={applyFilters}
                >
                  Apply filters
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Detail Panel */}
      <Sheet open={!!selectedTransaction} onOpenChange={(open) => !open && setSelectedTransaction(null)}>
        <SheetContent showCloseButton={false} className="gap-0 p-0 flex flex-col border-l border-slate-200 shadow-2xl">
          {selectedTransaction && (
            <div className="flex flex-col h-full bg-white">
              {/* Panel Header */}
              <div className="relative px-5 py-4 border-b border-gray-100">
                <button 
                  type="button"
                  onClick={() => setSelectedTransaction(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
                <h2 className="text-base font-semibold text-gray-900 pr-10">{selectedTransaction.name}</h2>
                <p className="text-[13px] text-[#6B7280] mt-1">
                  {selectedTransaction.email}  ·  {selectedTransaction.phone}
                </p>
              </div>

              {/* Panel Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Transaction Details Section */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Transaction Details</h3>
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <DetailRow label="Details" value={selectedTransaction.details} isEven={false} />
                    <DetailRow label="Program" value={selectedTransaction.program} isEven={true} />
                    <DetailRow label="Created" value={`${selectedTransaction.date}, ${selectedTransaction.time}`} isEven={false} />
                    <DetailRow label="Amount" value={selectedTransaction.amount} isEven={true} />
                    <DetailRow label="Status" value={getStatusBadge(selectedTransaction.status)} isEven={false} />
                    <DetailRow label="Transaction ID" value={selectedTransaction.id} isEven={true} />
                    <DetailRow label="State" value={selectedTransaction.state} isEven={false} />
                    <DetailRow label="City" value={selectedTransaction.city} isEven={true} />
                  </div>
                </div>

                {/* Refund Details Section (Conditional) */}
                {selectedTransaction.status === 'Refunded' && (
                  <div className="space-y-4">
                    <h3 className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Refund Details</h3>
                    <div className="border border-slate-100 rounded-xl overflow-hidden">
                      <DetailRow label="Refund Date" value={selectedTransaction.refundDate} isEven={false} />
                      <DetailRow label="Refund Amount" value={selectedTransaction.refundAmount} isEven={true} />
                      <DetailRow label="Refund Mode" value={selectedTransaction.refundMode} isEven={false} />
                      <DetailRow label="Refund ID" value={selectedTransaction.refundId} isEven={true} />
                    </div>
                  </div>
                )}

                {/* Invoice Section */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Invoice</h3>
                  <div className="flex items-center justify-between h-9 px-4 border border-slate-100 rounded-xl bg-white">
                    <span className="text-[13px] text-slate-500">GST Invoice — auto-generated</span>
                    <button 
                      onClick={() => {
                        // Opens invoice PDF
                      }}
                      className="text-[13px] font-bold text-blue-600 hover:underline"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
      {/* Export Confirmation Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-[480px] p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">
              Export transaction data?
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6 space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">The exported file will include:</p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Program Attended
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Payment Date
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Payment Amount
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  State
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  City
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Transaction ID
                </li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
              <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                Client information (name, email, phone) 
                is not included in the export to protect privacy.
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-row justify-between items-center w-full gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={() => setIsExportDialogOpen(false)}
              className="flex-1 h-11 border-slate-200 text-[#6B7280] font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleExport}
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm uppercase tracking-widest rounded-xl shadow-lg shadow-blue-100 transition-all"
            >
              Export CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
