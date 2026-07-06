import React, { useMemo, useState } from 'react';
import { cn, getAvatarColors } from '../lib/utils';
import {
  MoreVertical,
  Eye as EyeIcon,
  Search,
  Filter,
  Download,
  Inbox,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserPlus,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
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
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner';
import { useAuth } from '../lib/auth';
import AuditTrail from './AuditTrail';

interface OverflowLead {
  id: string;
  name: string;
  mobile: string;
  email: string;
  registeredOn: string;
  registrationTimestamp: string;
  status: 'Pending Seat' | 'Seat Offered' | 'Closed Won';
  assignedTo: string;
  batchPreference?: string;
  sourceBatch: string;
  utmSource: string;
  utmMedium: string;
  utmTerm: string;
  utmCampaign: string;
  utmContent: string;
  notes: string;
  activity: any[];
}

const SALES_TEAM = ['Ravi Kumar', 'Neha Jain', 'Vikram Rao'];

const DUMMY_LEADS: OverflowLead[] = [
  {
    id: '0001',
    name: 'Rahul Khanna',
    mobile: '98765 43210',
    email: 'rahul@gmail.com',
    registeredOn: '10 Apr 2026',
    registrationTimestamp: '10 Apr 2026, 10:32 AM',
    status: 'Pending Seat',
    assignedTo: '—',
    batchPreference: 'Weekend Morning',
    sourceBatch: 'PACE Batch 7',
    utmSource: 'google',
    utmMedium: 'cpc',
    utmTerm: 'pace_lead',
    utmCampaign: 'pace_apr_push',
    utmContent: 'ad_variant_a',
    notes: '',
    activity: [],
  },
  {
    id: '0002',
    name: 'Priya Sharma',
    mobile: '98765 12345',
    email: 'priya@gmail.com',
    registeredOn: '09 Apr 2026',
    registrationTimestamp: '09 Apr 2026, 06:18 PM',
    status: 'Pending Seat',
    assignedTo: '—',
    batchPreference: 'Weekday Evening',
    sourceBatch: 'PACE Batch 7',
    utmSource: 'facebook',
    utmMedium: 'paid_social',
    utmTerm: 'crm_pace',
    utmCampaign: 'pace_retargeting',
    utmContent: 'carousel_2',
    notes: '',
    activity: [],
  },
  {
    id: '0003',
    name: 'Amit Patel',
    mobile: '98765 67890',
    email: 'amit@gmail.com',
    registeredOn: '08 Apr 2026',
    registrationTimestamp: '08 Apr 2026, 11:42 AM',
    status: 'Seat Offered',
    assignedTo: 'Ravi Kumar',
    sourceBatch: 'PACE Batch 6',
    utmSource: 'organic',
    utmMedium: 'direct',
    utmTerm: 'pace',
    utmCampaign: 'none',
    utmContent: 'none',
    notes: 'Asked for callback tomorrow.',
    activity: [],
  },
];

export const PACEOverflow: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Marketing Head';
  const [leads, setLeads] = useState<OverflowLead[]>(DUMMY_LEADS);
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<OverflowLead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [leadToAssign, setLeadToAssign] = useState<OverflowLead | null>(null);
  const [assignedTeamMember, setAssignedTeamMember] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | OverflowLead['status']>('All');
  const [batchFilter, setBatchFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [notesDraft, setNotesDraft] = useState('');

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const searchMatch =
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        lead.email.toLowerCase().includes(search.toLowerCase());
      const statusMatch = statusFilter === 'All' || lead.status === statusFilter;
      const batchMatch = batchFilter === 'All' || lead.sourceBatch === batchFilter;
      const assigneeMatch = assigneeFilter === 'All' || lead.assignedTo === assigneeFilter;
      const dateValue = new Date(lead.registrationTimestamp).getTime();
      const fromMatch = !fromDate || dateValue >= new Date(`${fromDate}T00:00:00`).getTime();
      const toMatch = !toDate || dateValue <= new Date(`${toDate}T23:59:59`).getTime();
      return searchMatch && statusMatch && batchMatch && assigneeMatch && fromMatch && toMatch;
    });
  }, [leads, search, statusFilter, batchFilter, assigneeFilter, fromDate, toDate]);

  const pendingCount = leads.filter((l) => l.status === 'Pending Seat').length;
  const offeredCount = leads.filter((l) => l.status === 'Seat Offered').length;
  const closedCount = leads.filter((l) => l.status === 'Closed Won').length;

  const viewLeadRecord = (lead: OverflowLead) => {
    setSelectedLead(lead);
    setNotesDraft(lead.notes || '');
    setIsDetailOpen(true);
  };

  const handleSeatOffer = () => {
    if (!leadToAssign || !assignedTeamMember) {
      toast.error('Select a team member for assignment.');
      return;
    }
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadToAssign.id
          ? {
              ...l,
              status: 'Seat Offered',
              assignedTo: assignedTeamMember,
              activity: [
                {
                  id: `act-${Date.now()}`,
                  actor: user?.role || 'Marketing Team Member',
                  action: 'Marked as Seat Offered',
                  module: 'PACE Overflow',
                  detail: `Assigned to ${assignedTeamMember}`,
                  timestamp: new Date().toLocaleString(),
                  type: 'edit',
                },
                ...l.activity,
              ],
            }
          : l
      )
    );
    toast.success('Lead moved to Seat Offered and assigned.');
    setIsAssignModalOpen(false);
    setLeadToAssign(null);
    setAssignedTeamMember('');
  };

  const saveLeadNotes = () => {
    if (!selectedLead) return;
    setLeads((prev) =>
      prev.map((l) => (l.id === selectedLead.id ? { ...l, notes: notesDraft } : l))
    );
    setSelectedLead((prev) => (prev ? { ...prev, notes: notesDraft } : prev));
    toast.success('Lead notes updated.');
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Pending Seat') return 'bg-amber-100 text-amber-700 border-amber-200';
    if (status === 'Seat Offered') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const uniqueBatches = Array.from(new Set(leads.map((l) => l.sourceBatch)));

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 mb-1 leading-tight tracking-tight">PACE Overflow</h1>
        <p className="text-slate-500 text-sm font-medium">
          Leads who registered interest when a batch was full. Action them when seats become available.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-5">
          <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Pending Seat</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{pendingCount}</span>
              <span className="text-xs font-bold text-slate-400">leads</span>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-200 ml-auto" />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-5">
          <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Seat Offered</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{offeredCount}</span>
              <span className="text-xs font-bold text-slate-400">leads</span>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-200 ml-auto" />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-5">
          <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Enrolled (Closed Won)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{closedCount}</span>
              <span className="text-xs font-bold text-slate-400">leads</span>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-200 ml-auto" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9 h-10 border-slate-200 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-10 text-slate-600 font-bold border-slate-200 gap-2 px-4 shadow-sm" onClick={() => setIsFilterOpen(true)}>
          <Filter className="h-4 w-4 text-slate-400" />
          Filter
        </Button>
        {isAdmin && (
          <Button variant="outline" className="h-10 text-slate-600 font-bold border-slate-200 gap-2 px-4 shadow-sm ml-auto">
            <Download className="h-4 w-4 text-slate-400" />
            Export
          </Button>
        )}
      </div>

      <div className="bg-white border-t border-[#E5E7EB] overflow-hidden rounded-xl shadow-sm border-x border-b">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-[#E5E7EB] bg-slate-50/50">
              <TableHead className="h-[56px] font-bold text-[13px] uppercase text-[#6B7280] tracking-[0.5px] px-6">Name</TableHead>
              <TableHead className="h-[56px] font-bold text-[13px] uppercase text-[#6B7280] tracking-[0.5px] px-6">Email</TableHead>
              <TableHead className="h-[56px] font-bold text-[13px] uppercase text-[#6B7280] tracking-[0.5px] px-6">Registered On</TableHead>
              <TableHead className="h-[56px] font-bold text-[13px] uppercase text-[#6B7280] tracking-[0.5px] px-6">Status</TableHead>
              <TableHead className="h-[56px] font-bold text-[13px] uppercase text-[#6B7280] tracking-[0.5px] px-6">Assigned To</TableHead>
              <TableHead className="h-[56px] font-bold text-[13px] uppercase text-[#6B7280] tracking-[0.5px] px-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length > 0 ? (
              filteredLeads.map((lead, idx) => {
                const initials = lead.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
                return (
                  <TableRow
                    key={lead.id}
                    onClick={() => viewLeadRecord(lead)}
                    className={cn(
                      'group h-[56px] border-b border-[#F3F4F6] transition-colors cursor-pointer hover:bg-slate-50/80',
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'
                    )}
                  >
                    <TableCell className="px-6">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black shrink-0', getAvatarColors(initials))}>
                          {initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{lead.name}</span>
                          <span className="text-[11px] text-[#9CA3AF] mt-0.5 font-medium">ID: #{lead.id}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6"><span className="text-[13px] text-slate-500">{lead.email}</span></TableCell>
                    <TableCell className="px-6"><span className="text-[13px] text-slate-500 font-medium">{lead.registeredOn}</span></TableCell>
                    <TableCell className="px-6">
                      <Badge className={cn('px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-none', getStatusBadge(lead.status))}>
                        {lead.status === 'Pending Seat' ? 'PACE Overflow — Pending Seat' : lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6"><span className="text-[13px] text-slate-600 font-bold">{lead.assignedTo}</span></TableCell>
                    <TableCell className="px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          {lead.status === 'Pending Seat' && (
                            <DropdownMenuItem
                              onClick={() => {
                                setLeadToAssign(lead);
                                setAssignedTeamMember('');
                                setIsAssignModalOpen(true);
                              }}
                              className="font-bold text-xs gap-2 text-blue-600 focus:text-blue-600"
                            >
                              <UserPlus className="h-3.5 w-3.5" />
                              Mark as Seat Offered
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="font-bold text-xs gap-2" onClick={() => viewLeadRecord(lead)}>
                            <EyeIcon className="h-3.5 w-3.5 text-slate-400" />
                            View lead record
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-96">
                  <div className="text-center py-12">
                    <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-300 opacity-30" />
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">No overflow leads</h3>
                    <p className="text-xs text-gray-400 mb-4 max-w-[320px] mx-auto">Overflow leads appear here when a PACE batch is full and clients register their interest.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Assign to team member?</DialogTitle>
            <DialogDescription>Lead will move to Seat Offered and assignment will be logged.</DialogDescription>
          </DialogHeader>
          <Select value={assignedTeamMember} onValueChange={setAssignedTeamMember}>
            <SelectTrigger><SelectValue placeholder="Select active sales team member" /></SelectTrigger>
            <SelectContent>
              {SALES_TEAM.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSeatOffer}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent side="right" className="gap-0 p-0 flex flex-col">
          <SheetHeader>
            <SheetTitle>Filter Overflow Leads</SheetTitle>
          </SheetHeader>
          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Pending Seat">Pending Seat</SelectItem>
                  <SelectItem value="Seat Offered">Seat Offered</SelectItem>
                  <SelectItem value="Closed Won">Closed Won</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Batch</Label>
              <Select value={batchFilter} onValueChange={setBatchFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  {uniqueBatches.map((batch) => <SelectItem key={batch} value={batch}>{batch}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Assigned To</Label>
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="—">Unassigned</SelectItem>
                  {SALES_TEAM.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>From</Label><Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} /></div>
              <div className="space-y-1"><Label>To</Label><Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} /></div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent side="right" className="gap-0 p-0 flex flex-col h-full">
          <SheetHeader>
            <SheetTitle>{selectedLead?.name}</SheetTitle>
          </SheetHeader>
          {selectedLead && (
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="space-y-1 text-sm">
                <p><span className="font-semibold">Full Name:</span> {selectedLead.name}</p>
                <p><span className="font-semibold">Email:</span> {selectedLead.email}</p>
                <p><span className="font-semibold">Phone Number:</span> {selectedLead.mobile}</p>
                <p><span className="font-semibold">Registration Timestamp:</span> {selectedLead.registrationTimestamp}</p>
                <p><span className="font-semibold">Status:</span> {selectedLead.status === 'Pending Seat' ? 'PACE Overflow — Pending Seat' : selectedLead.status}</p>
                <p><span className="font-semibold">Assigned To:</span> {selectedLead.assignedTo}</p>
                <p><span className="font-semibold">Batch Preference:</span> {selectedLead.batchPreference || '—'}</p>
                <p><span className="font-semibold">Source Batch:</span> {selectedLead.sourceBatch}</p>
                <p><span className="font-semibold">UTM Source:</span> {selectedLead.utmSource}</p>
                <p><span className="font-semibold">UTM Medium:</span> {selectedLead.utmMedium}</p>
                <p><span className="font-semibold">UTM Term:</span> {selectedLead.utmTerm}</p>
                <p><span className="font-semibold">UTM Campaign:</span> {selectedLead.utmCampaign}</p>
                <p><span className="font-semibold">UTM Content:</span> {selectedLead.utmContent}</p>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} />
                <Button size="sm" onClick={saveLeadNotes}>Save notes</Button>
              </div>
              <AuditTrail title="Lead activity / audit trail" collapsible maxVisible={4} entries={selectedLead.activity} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

