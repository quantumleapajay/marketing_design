import React, { useState } from 'react';
import { cn } from '../lib/utils';
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
  MessageCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import StatusBadge from './ui/StatusBadge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from "./ui/label";
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';
import AuditTrail from './AuditTrail';
import type { Campaign as LinkedCampaign } from './Campaigns';

interface PACEBatch {
  id: string;
  name: string;
  type: 'Online' | 'Offline';
  date: string;
  endDate?: string;
  time: string;
  venueName?: string;
  city?: string;
  address?: string;
  enrolled: number;
  targetCapacity: number;
  extendedCapacity?: number;
  registrationStatus: 'Open' | 'Closed';
  status: 'Upcoming' | 'Live' | 'Full' | 'Completed' | 'Cancelled';
  paymentLinkState?: 'Active' | 'Sold Out' | 'Deactivated';
  cancellationReason?: string;
}

const DUMMY_BATCHES: PACEBatch[] = [
  { 
    id: 'B001', 
    name: 'PACE Batch 7', 
    type: 'Offline', 
    date: '15 May 2026',
    endDate: '20 May 2026',
    time: '9:00 AM', 
    venueName: 'ITC Maratha',
    city: 'Mumbai',
    address: 'Andheri East, Mumbai',
    enrolled: 42, 
    targetCapacity: 60,
    extendedCapacity: 72,
    registrationStatus: 'Open', 
    status: 'Upcoming',
    paymentLinkState: 'Active'
  },
  { 
    id: 'B002', 
    name: 'PACE Batch 8', 
    type: 'Online', 
    date: '20 Jun 2026', 
    time: '10:00 AM', 
    enrolled: 0, 
    targetCapacity: 100,
    registrationStatus: 'Open', 
    status: 'Upcoming',
    paymentLinkState: 'Active'
  },
  { 
    id: 'B003', 
    name: 'PACE Batch 6', 
    type: 'Offline', 
    date: '10 Apr 2026',
    endDate: '15 Apr 2026',
    time: '9:00 AM', 
    venueName: 'Conrad',
    city: 'Pune',
    address: 'Koregaon Park, Pune',
    enrolled: 60, 
    targetCapacity: 60,
    registrationStatus: 'Closed', 
    status: 'Full',
    paymentLinkState: 'Sold Out'
  },
  { 
    id: 'B004', 
    name: 'PACE Batch 5', 
    type: 'Offline', 
    date: '15 Mar 2026',
    endDate: '20 Mar 2026',
    time: '9:00 AM', 
    venueName: 'Taj City Center',
    city: 'Bengaluru',
    address: 'MG Road, Bengaluru',
    enrolled: 58, 
    targetCapacity: 60,
    registrationStatus: 'Closed', 
    status: 'Completed',
    paymentLinkState: 'Deactivated'
  },
];

interface PACEBatchesProps {
  onCreateClick: () => void;
  onCreateCampaign?: (batch: { id: string; name: string }) => void;
  linkedCampaigns?: LinkedCampaign[];
}

export const PACEBatches: React.FC<PACEBatchesProps> = ({ onCreateClick, onCreateCampaign, linkedCampaigns = [] }) => {
  const { user } = useAuth();
  const [batches, setBatches] = useState<PACEBatch[]>(DUMMY_BATCHES);
  const [search, setSearch] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<PACEBatch | null>(null);
  const [isBatchDetailOpen, setIsBatchDetailOpen] = useState(false);
  const [batchDetailTab, setBatchDetailTab] = useState<'details' | 'campaigns'>('details');

  const viewBatchDetails = (batch: PACEBatch) => {
    setSelectedBatch(batch);
    setBatchDetailTab('details');
    setIsBatchDetailOpen(true);
  };
  
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [batchToToggle, setBatchToToggle] = useState<PACEBatch | null>(null);
  
  const [isCapacitySheetOpen, setIsCapacitySheetOpen] = useState(false);
  const [batchToEditCapacity, setBatchToEditCapacity] = useState<PACEBatch | null>(null);
  const [newCapacity, setNewCapacity] = useState('');
  const [newExtendedCapacity, setNewExtendedCapacity] = useState('');
  const [capacityAuditLogs, setCapacityAuditLogs] = useState<any[]>([]);
  const [batchToCancel, setBatchToCancel] = useState<PACEBatch | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const filteredBatches = batches.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCloseRegistrations = () => {
    if (batchToToggle) {
      setBatches(prev => prev.map(b => 
        b.id === batchToToggle.id ? { ...b, registrationStatus: 'Closed' } : b
      ));
      toast.success(`Registrations closed for ${batchToToggle.name}`);
      setIsCloseModalOpen(false);
      setBatchToToggle(null);
    }
  };

  const handleOpenRegistrations = () => {
    if (batchToToggle) {
      setBatches(prev => prev.map(b => 
        b.id === batchToToggle.id ? { ...b, registrationStatus: 'Open' } : b
      ));
      toast.success(`Registrations opened for ${batchToToggle.name}`);
      setIsOpenModalOpen(false);
      setBatchToToggle(null);
    }
  };

  const handleUpdateCapacity = () => {
    if (batchToEditCapacity && newCapacity) {
      const capVal = parseInt(newCapacity);
      const hardCap = newExtendedCapacity ? parseInt(newExtendedCapacity) : undefined;
      setBatches(prev => prev.map(b => {
        if (b.id === batchToEditCapacity.id) {
          const previousTarget = b.targetCapacity;
          const previousExtended = b.extendedCapacity;
          const effectiveHardLimit = hardCap || capVal;
          const updated = { ...b, targetCapacity: capVal, extendedCapacity: hardCap };
          if (updated.enrolled >= effectiveHardLimit) {
            updated.status = 'Full';
            updated.paymentLinkState = 'Sold Out';
            updated.registrationStatus = 'Closed';
          } else if (updated.enrolled >= updated.targetCapacity) {
            // Soft limit reached: alert marketing team, keep registration open.
            toast.warning(`Capacity alert: ${updated.name} reached target (${updated.enrolled}/${updated.targetCapacity}).`);
          } else if (updated.status === 'Full') {
            updated.status = 'Upcoming'; // Simple fallback
            updated.paymentLinkState = 'Active';
            updated.registrationStatus = 'Open';
          }
          setCapacityAuditLogs((prevLogs) => [
            {
              id: `cap-${Date.now()}`,
              actor: user?.role || 'Marketing Team Member',
              action: `Updated capacity for ${updated.name}`,
              module: 'PACE',
              detail: `Target: ${previousTarget} -> ${updated.targetCapacity} · Extended: ${previousExtended ?? '-'} -> ${updated.extendedCapacity ?? '-'}`,
              timestamp: new Date().toLocaleString(),
              type: 'edit',
            },
            ...prevLogs,
          ]);
          return updated;
        }
        return b;
      }));
      toast.success(`Capacity updated for ${batchToEditCapacity.name}`);
      setIsCapacitySheetOpen(false);
      setBatchToEditCapacity(null);
    }
  };

  const handleCancelBatch = () => {
    if (!batchToCancel) return;
    if (cancelReason.trim().length < 10) {
      toast.error('Cancellation reason must be at least 10 characters.');
      return;
    }
    setBatches((prev) =>
      prev.map((b) =>
        b.id === batchToCancel.id
          ? { ...b, status: 'Cancelled', cancellationReason: cancelReason.trim(), paymentLinkState: 'Deactivated' }
          : b
      )
    );
    setCapacityAuditLogs((prevLogs) => [
      {
        id: `cancel-${Date.now()}`,
        actor: user?.role || 'Marketing Team Member',
        action: `Cancelled batch ${batchToCancel.name}`,
        module: 'PACE',
        detail: `Reason: ${cancelReason.trim()} · Enrolled: ${batchToCancel.enrolled} · Payment link deactivated: Yes`,
        timestamp: new Date().toLocaleString(),
        type: 'deactivate',
      },
      ...prevLogs,
    ]);
    toast.success(`Batch cancelled and payment link deactivated for ${batchToCancel.name}.`);
    setIsCancelModalOpen(false);
    setBatchToCancel(null);
    setCancelReason('');
  };

  const getRegBadge = (status: string) => {
    switch (status) {
      case 'Open': return "bg-green-100 text-green-700 border-green-200";
      case 'Closed': return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "";
    }
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto min-h-screen">
      {/* Header */}
      <div className="sticky top-[52px] z-10 bg-white py-8 flex justify-between items-start mb-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">PACE Batches</h1>
          <p className="text-slate-500 text-sm">Manage batch capacity, registration status, and overflow.</p>
        </div>
        <Button 
          onClick={onCreateClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 rounded-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create batch
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search batches..." 
            className="pl-9 h-10 border-slate-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List View */}
      <div className="bg-white border-t border-[#E5E7EB]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-[#E5E7EB]">
              <TableHead className="sticky left-0 z-20 bg-white h-14 font-bold text-[13px] uppercase text-[#6B7280] tracking-[0.5px] min-w-[200px]">Batch Name</TableHead>
              <TableHead className="h-14 font-bold text-[13px] uppercase text-[#6B7280] tracking-[0.5px]">Type</TableHead>
              <TableHead className="h-14 font-bold text-[13px] uppercase text-[#6B7280] tracking-[0.5px]">City</TableHead>
              <TableHead className="h-14 font-bold text-[13px] uppercase text-[#6B7280] tracking-[0.5px]">Date</TableHead>
              <TableHead className="h-14 font-bold text-[13px] uppercase text-[#6B7280] tracking-[0.5px]">Time</TableHead>
              <TableHead className="h-14 font-bold text-[13px] uppercase text-[#6B7280] tracking-[0.5px]">Enrollment</TableHead>
              <TableHead className="h-14 font-bold text-[13px] uppercase text-[#6B7280] tracking-[0.5px]">Registration</TableHead>
              <TableHead className="h-14 font-bold text-[13px] uppercase text-[#6B7280] tracking-[0.5px]">Status</TableHead>
              <TableHead className="h-14 font-bold text-[13px] uppercase text-[#6B7280] tracking-[0.5px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBatches.map((batch, idx) => {
              const hardLimit = batch.extendedCapacity || batch.targetCapacity;
              const enrollPct = Math.min((batch.enrolled / hardLimit) * 100, 100);
              const isFull = batch.enrolled >= hardLimit;

              return (
                <TableRow 
                  key={batch.id} 
                  onClick={() => viewBatchDetails(batch)}
                  className={cn(
                    "group h-[56px] border-b border-[#F3F4F6] transition-colors cursor-pointer hover:bg-slate-50/80",
                    idx % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]"
                  )}
                >
                  <TableCell className={cn(
                    "sticky left-0 z-10 min-w-[200px]",
                    idx % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]"
                  )}>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-black group-hover:text-blue-600 transition-colors">
                        {batch.name}
                      </span>
                      <span className="text-[11px] text-[#9CA3AF] mt-0.5">ID: #{batch.id}</span>
                      {batch.registrationStatus === 'Closed' && (
                        <span className="text-[11px] text-amber-600 font-bold mt-1.5 flex items-center gap-1.5 leading-tight">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Payment link redirects to lead capture form
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[11px] font-medium text-slate-500 border-slate-200">
                      {batch.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-[13px] text-slate-600 font-medium">
                      {batch.type === 'Offline' ? batch.city || '—' : '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-[13px] text-slate-600 font-medium">{batch.date}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-[13px] text-slate-600">{batch.time}</span>
                  </TableCell>
                  <TableCell className="w-[180px]">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[11px] font-bold">
                        <span className={cn(isFull ? "text-red-600" : "text-slate-500")}>
                          {batch.enrolled} / {hardLimit}
                        </span>
                        <span className="text-slate-400 capitalize whitespace-nowrap ml-2">Enrolled</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            isFull ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "bg-blue-500"
                          )} 
                          style={{ width: `${enrollPct}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border shadow-none",
                      getRegBadge(batch.registrationStatus)
                    )}>
                      {batch.registrationStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={batch.status} />
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-[12px] font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg px-3 shadow-sm bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateCampaign?.({ id: batch.id, name: batch.name });
                        }}
                      >
                        <MessageCircle className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                        Campaign
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem className="font-bold text-xs gap-2" onClick={() => viewBatchDetails(batch)}>
                            <EyeIcon className="h-3.5 w-3.5 text-slate-400" />
                            View details
                          </DropdownMenuItem>
                        
                        {batch.registrationStatus === 'Open' ? (
                          <DropdownMenuItem 
                            onClick={() => {
                              setBatchToToggle(batch);
                              setIsCloseModalOpen(true);
                            }}
                            className="font-bold text-xs gap-2 text-amber-600 focus:text-amber-600"
                          >
                            <Lock className="h-3.5 w-3.5" />
                            Close registrations
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => {
                              setBatchToToggle(batch);
                              setIsOpenModalOpen(true);
                            }}
                            className="font-bold text-xs gap-2 text-blue-600 focus:text-blue-600"
                          >
                            <Unlock className="h-3.5 w-3.5" />
                            Re-open registrations
                          </DropdownMenuItem>
                        )}

                        {(user?.role === 'Marketing Head' || user?.role === 'Marketing Team Member') && (
                          <DropdownMenuItem 
                            onClick={() => {
                              setBatchToEditCapacity(batch);
                              setNewCapacity(batch.targetCapacity.toString());
                              setNewExtendedCapacity(batch.extendedCapacity?.toString() || '');
                              setIsCapacitySheetOpen(true);
                            }}
                            className="font-bold text-xs gap-2"
                          >
                            <Edit className="h-3.5 w-3.5 text-slate-400" />
                            Edit capacity
                          </DropdownMenuItem>
                        )}
                        {(batch.status === 'Upcoming' || batch.status === 'Live') && (
                          <DropdownMenuItem
                            onClick={() => {
                              setBatchToCancel(batch);
                              setCancelReason('');
                              setIsCancelModalOpen(true);
                            }}
                            className="font-bold text-xs gap-2 text-red-600 focus:text-red-600"
                          >
                            <Lock className="h-3.5 w-3.5" />
                            Cancel batch
                          </DropdownMenuItem>
                        )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Close Registration Modal */}
      <Dialog open={isCloseModalOpen} onOpenChange={setIsCloseModalOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <Lock className="h-7 w-7 text-amber-600" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">Close registrations for {batchToToggle?.name}?</DialogTitle>
                <DialogDescription className="text-slate-500 mt-2">
                  The payment link will redirect to a lead capture form. Leads who submit will be added to the Overflow bucket.
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-3">Lead Capture Lifecycle Preview</span>
              <div className="space-y-2">
                <div className="h-8 bg-white border border-slate-100 rounded-lg flex items-center px-3 text-[12px] text-slate-400 italic">John Doe</div>
                <div className="h-8 bg-white border border-slate-100 rounded-lg flex items-center px-3 text-[12px] text-slate-400 italic">john@example.com</div>
                <div className="h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-[11px] font-bold text-slate-400">Join Waitlist</div>
              </div>
              <p className="text-[10px] text-slate-400 mt-3 text-center italic">
                Note: Submissions go to PACE Overflow — Pending Seat status
              </p>
            </div>
          </div>
          <DialogFooter className="bg-slate-50 p-4 flex gap-3 sm:justify-center border-t border-slate-200">
            <Button 
              variant="ghost" 
              onClick={() => setIsCloseModalOpen(false)}
              className="flex-1 font-bold text-slate-500 h-11"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCloseRegistrations}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold h-11"
            >
              Close registrations
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Re-open Registration Modal */}
      <Dialog open={isOpenModalOpen} onOpenChange={setIsOpenModalOpen}>
        <DialogContent className="sm:max-w-[420px] p-6 text-center">
          <div className="flex flex-col items-center">
            <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Unlock className="h-7 w-7 text-blue-600" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900">Re-open registrations for {batchToToggle?.name}?</DialogTitle>
              <DialogDescription className="text-slate-500 mt-2">
                Payment link will revert to the payment page. Clients will be able to enroll again.
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="flex gap-3 sm:justify-center mt-8 pt-6 border-t border-slate-100">
            <Button 
              variant="outline" 
              onClick={() => setIsOpenModalOpen(false)}
              className="flex-1 h-11 font-bold border-slate-200 text-slate-600"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleOpenRegistrations}
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              Re-open
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Capacity Sheet */}
      <Sheet open={isCapacitySheetOpen} onOpenChange={setIsCapacitySheetOpen}>
        <SheetContent side="right" className="gap-0 p-0 flex flex-col h-full">
          <SheetHeader className="relative">
            <SheetTitle>Edit Capacity</SheetTitle>
            <SheetDescription className="text-slate-500 font-medium">
              Update capacity for {batchToEditCapacity?.name}
            </SheetDescription>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
              <Info className="h-5 w-5 text-slate-400 mt-0.5" />
              <p className="text-[13px] text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-900">Note:</span> All other batch fields are locked after creation to maintain data integrity.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Capacity</Label>
                <Input 
                  type="number" 
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  className="h-12 border-slate-200 text-lg font-bold"
                />
                <p className="text-[11px] text-slate-400 mt-2">
                  Currently enrolled: <span className="font-bold text-slate-600">{batchToEditCapacity?.enrolled}</span>
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Extended Capacity (Hard Limit)</Label>
                <Input
                  type="number"
                  value={newExtendedCapacity}
                  onChange={(e) => setNewExtendedCapacity(e.target.value)}
                  placeholder="Optional"
                  className="h-12 border-slate-200 text-lg font-bold"
                />
              </div>
            </div>
          </div>

          <SheetFooter className="mt-auto bg-white">
            <Button 
              onClick={handleUpdateCapacity}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-100"
            >
              Update capacity
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Cancel {batchToCancel?.name}?</DialogTitle>
            <DialogDescription>
              Cancelling deactivates the linked payment link immediately. Completed batches cannot be cancelled.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reason (minimum 10 characters)</Label>
            <Input
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>Back</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleCancelBatch}>
              Confirm cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={isBatchDetailOpen} onOpenChange={setIsBatchDetailOpen}>
        <SheetContent side="right" className="gap-0 p-0 flex flex-col h-full">
          <SheetHeader>
            <SheetTitle>{selectedBatch?.name}</SheetTitle>
            <SheetDescription>PACE batch details</SheetDescription>
          </SheetHeader>
          <div className="p-6">
            <Tabs value={batchDetailTab} onValueChange={(value) => setBatchDetailTab(value as 'details' | 'campaigns')}>
              <TabsList className="mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-3 text-sm">
                <p><span className="font-semibold">Type:</span> {selectedBatch?.type}</p>
                <p><span className="font-semibold">Start Date:</span> {selectedBatch?.date}</p>
                <p><span className="font-semibold">End Date:</span> {selectedBatch?.endDate || '—'}</p>
                <p><span className="font-semibold">City:</span> {selectedBatch?.city || '—'}</p>
                <p><span className="font-semibold">Venue Name:</span> {selectedBatch?.venueName || '—'}</p>
                <p><span className="font-semibold">Address:</span> {selectedBatch?.address || '—'}</p>
                <p><span className="font-semibold">Target Capacity:</span> {selectedBatch?.targetCapacity}</p>
                <p><span className="font-semibold">Extended Capacity:</span> {selectedBatch?.extendedCapacity || '—'}</p>
                <p><span className="font-semibold">Payment Link State:</span> {selectedBatch?.paymentLinkState || 'Active'}</p>
                <p><span className="font-semibold">Cancellation Reason:</span> {selectedBatch?.cancellationReason || '—'}</p>
              </TabsContent>
              <TabsContent value="campaigns" className="space-y-3 text-sm">
                <Button
                  variant="outline"
                  className="h-9 text-[12px] font-bold border-slate-200 text-blue-600 hover:bg-blue-50 hover:border-blue-200 rounded-xl px-4"
                  onClick={() => selectedBatch && onCreateCampaign?.({ id: selectedBatch.id, name: selectedBatch.name })}
                >
                  + Create campaign for this batch
                </Button>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Campaign Name</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sent On</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {linkedCampaigns
                        .filter((campaign) => selectedBatch && campaign.sourceEventId === selectedBatch.id)
                        .map((campaign) => (
                          <TableRow key={campaign.id}>
                            <TableCell className="font-medium text-slate-900">{campaign.name}</TableCell>
                            <TableCell>{campaign.channel}</TableCell>
                            <TableCell>{campaign.status}</TableCell>
                            <TableCell>{campaign.sentOn || campaign.scheduledFor || '—'}</TableCell>
                          </TableRow>
                        ))}
                      {linkedCampaigns.filter((campaign) => selectedBatch && campaign.sourceEventId === selectedBatch.id).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                            No campaigns linked to this batch yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

      <div className="mt-8">
        <AuditTrail
          title="Capacity Edit Audit"
          collapsible
          maxVisible={3}
          entries={capacityAuditLogs}
        />
      </div>
    </div>
  );
};
