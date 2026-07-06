
import React, { useState } from 'react';
import { 
  Video, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Calendar, 
  Users, 
  ExternalLink,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Book,
  ChevronRight as ChevronRightIcon,
  BarChart3,
  ChevronDown,
  RotateCcw,
  Eye,
  MessageCircle,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { Card, CardContent } from './ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { cn, getAvatarColors } from '../lib/utils';

interface Webinar {
  id: string;
  title: string;
  date: string;
  time: string;
  status: 'Upcoming' | 'Live' | 'Completed' | 'Cancelled';
  registrations: number;
  attendance: number;
  conversions: string;
  instructor: string;
  isReinvite?: boolean;
  sourceBatches?: number;
  subtext?: string;
  type?: 'Standard' | 'Re-invite' | 'Recorded';
}

const MOCK_WEBINARS: Webinar[] = [
  {
    id: '0001',
    title: 'BSW April Week 3 - Day 1',
    date: '19 Apr 2026',
    time: '7:00 PM',
    status: 'Upcoming',
    registrations: 450,
    attendance: 0,
    conversions: 'Batch 7',
    instructor: 'Siddharth Shah'
  },
  {
    id: '0002',
    title: 'BSW Re-invite – Apr Wk 1+2+3',
    date: '26 Apr 2026',
    time: '8:00 PM',
    status: 'Upcoming',
    registrations: 30,
    attendance: 0,
    conversions: '—',
    instructor: 'Siddharth Shah',
    isReinvite: true,
    sourceBatches: 3
  },
  {
    id: '0003',
    title: 'BSW April Week 2',
    date: '16 Apr 2026',
    time: '7:00 PM',
    status: 'Completed',
    registrations: 380,
    attendance: 310,
    conversions: 'Batch 7',
    instructor: 'Siddharth Shah'
  },
  {
    id: '0004',
    title: 'BSW April Week 1',
    date: '9 Apr 2026',
    time: '7:00 PM',
    status: 'Completed',
    registrations: 420,
    attendance: 350,
    conversions: 'Batch 7',
    instructor: 'Amit Patel'
  }
];

interface WebinarsProps {
  onViewDetails?: (webinar: Webinar) => void;
  onCreateWebinar?: () => void;
  onCreateCampaign?: (event: { id: string; name: string }) => void;
}

export const Webinars: React.FC<WebinarsProps> = ({ onViewDetails, onCreateWebinar, onCreateCampaign }) => {
  const REINVITE_THRESHOLD = 3;
  const { user } = useAuth();
  const isAdmin = user?.role === 'Marketing Head';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Filter Panel States
  const [dateFrom, setDateFrom] = useState('2026-04-01');
  const [dateTo, setDateTo] = useState('2026-04-30');
  const [paceBatch, setPaceBatch] = useState('All');
  const [trainer, setTrainer] = useState('All');
  const [programTypes, setProgramTypes] = useState({
    standard: true,
    reinvite: true,
    recorded: true
  });
  const [isFilterActive, setIsFilterActive] = useState(false);

  const resetFilters = () => {
    setDateFrom('2026-04-01');
    setDateTo('2026-04-30');
    setPaceBatch('All');
    setTrainer('All');
    setProgramTypes({
      standard: true,
      reinvite: true,
      recorded: true
    });
    setIsFilterActive(false);
  };

  const applyFilters = () => {
    setIsFilterActive(true);
  };

  const EDGE_CASES: Webinar[] = [
    {
      id: 'edge-zoom-conflict',
      title: 'BSW – Zoom Conflict',
      subtext: '⚠ Edge case: Zoom account has scheduling conflict',
      date: '28 Apr 2026',
      time: '7:00 PM',
      status: 'Upcoming',
      registrations: 0,
      attendance: 0,
      conversions: 'Batch 7',
      instructor: 'Ria Sharma',
      type: 'Standard'
    },
    {
      id: 'edge-wa-broken',
      title: 'BSW – WhatsApp Broken',
      subtext: '⚠ Edge case: WhatsApp link is invalid or expired',
      date: '29 Apr 2026',
      time: '7:00 PM',
      status: 'Upcoming',
      registrations: 120,
      attendance: 0,
      conversions: 'Batch 8',
      instructor: 'Amit Patel',
      type: 'Standard'
    },
    {
      id: 'edge-multiple-broken',
      title: 'BSW – Multiple Broken',
      subtext: '⚠ Edge case: Multiple links are broken/missing',
      date: '30 Apr 2026',
      time: '7:00 PM',
      status: 'Upcoming',
      registrations: 85,
      attendance: 0,
      conversions: 'Batch 8',
      instructor: 'Rajesh Kumar',
      type: 'Standard'
    },
    {
      id: 'edge-attendance-live',
      title: 'BSW – Attendance: Live Now',
      subtext: '● Live right now — testing attendance counter',
      date: '26 Apr 2026',
      time: '7:00 PM',
      status: 'Live',
      registrations: 120,
      attendance: 0,
      conversions: 'Batch 9',
      instructor: 'Ria Sharma',
      type: 'Standard'
    },
    {
      id: 'edge-attendance-sync-failed',
      title: 'BSW – Attendance: Sync Failed',
      subtext: '⚠ Sync failed — manual upload required',
      date: '25 Apr 2026',
      time: '7:00 PM',
      status: 'Completed',
      registrations: 190,
      attendance: 0,
      conversions: 'Batch 8',
      instructor: 'Amit Patel',
      type: 'Standard'
    },
    {
      id: 'edge-reg-closes-10',
      title: 'BSW – Reg. Closes in 10 Days',
      subtext: 'Registration closing > 7 days logic test',
      date: '16 May 2026',
      time: '7:00 PM',
      status: 'Upcoming',
      registrations: 45,
      attendance: 0,
      conversions: 'Batch 9',
      instructor: 'Ria Sharma',
      type: 'Standard'
    }
  ];

  const filteredWebinars = [...MOCK_WEBINARS, ...EDGE_CASES].filter(webinar => {
    const matchesSearch = webinar.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         webinar.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || webinar.status === statusFilter;
    
    // Apply filters if active
    if (isFilterActive) {
      const matchesBatch = paceBatch === 'All' || 
                          (paceBatch === 'None' && (webinar.conversions === '—' || !webinar.conversions)) ||
                          webinar.conversions === paceBatch;
      const matchesTrainer = trainer === 'All' || webinar.instructor === trainer;
      
      let type: 'standard' | 'reinvite' | 'recorded' = 'standard';
      if (webinar.isReinvite) type = 'reinvite';
      if (webinar.type === 'Recorded') type = 'recorded';
      
      const matchesType = programTypes[type];
      
      return matchesSearch && matchesStatus && matchesBatch && matchesTrainer && matchesType;
    }

    return matchesSearch && matchesStatus;
  });
  const upcomingEventCount = MOCK_WEBINARS.filter((webinar) => webinar.status === 'Upcoming').length;
  const shouldShowCreateEventAlert = !isAdmin && upcomingEventCount < 3;

  const getAppliedFilterNames = () => {
    const names = [];
    if (paceBatch !== 'All') names.push(paceBatch === 'None' ? 'No Batch' : paceBatch);
    if (trainer !== 'All') names.push(trainer);
    if (!programTypes.standard || !programTypes.reinvite || !programTypes.recorded) {
        if (programTypes.standard) names.push('Standard BSW');
        if (programTypes.reinvite) names.push('Re-invite');
        if (programTypes.recorded) names.push('Recorded');
    }
    return names.join(' · ');
  };

  const getStatusBadge = (status: Webinar['status']) => {
    if (status === 'Live') {
      return (
        <StatusBadge
          status="Live"
          className="relative pl-5 before:absolute before:left-2 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full before:bg-green-600 before:animate-pulse"
        />
      );
    }
    return <StatusBadge status={status} />;
  };

  return (
    <div className="p-8 pt-0 md:p-10 md:pt-0 max-w-7xl mx-auto space-y-10" id="bsw-listing-container">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white py-8 md:py-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-[32px] font-black text-slate-900 tracking-tight leading-none mb-3">BSW (Webinars)</h1>
          <p className="text-slate-500 font-medium">Manage and track your upcoming and past webinars across all batches.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 h-12 px-8 font-black text-base rounded-xl mt-auto"
            onClick={onCreateWebinar}
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Event
          </Button>
        </div>
      </div>

      {shouldShowCreateEventAlert && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800 font-semibold">
            Only {upcomingEventCount} upcoming BSW event{upcomingEventCount === 1 ? '' : 's'} scheduled. Please create more events so the pipeline does not run dry.
          </p>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-7">
            <div className="flex items-center justify-between mb-5">
              <div className="p-2.5 bg-blue-50 rounded-xl">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none px-3 font-bold text-[10px] uppercase tracking-wider">Active & Upcoming</Badge>
            </div>
            <h3 className="text-3xl font-black text-slate-900">12</h3>
            <p className="text-[13px] font-bold text-slate-400 mt-2 uppercase tracking-wide">Scheduled Webinars</p>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-7">
            <div className="flex items-center justify-between mb-5">
              <div className="p-2.5 bg-emerald-50 rounded-xl">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none px-3 font-bold text-[10px] uppercase tracking-wider">Across all batches</Badge>
            </div>
            <h3 className="text-3xl font-black text-slate-900">4,250</h3>
            <p className="text-[13px] font-bold text-slate-400 mt-2 uppercase tracking-wide">Total Registrations</p>
          </CardContent>
        </Card>

        <Card className="border-indigo-100 bg-indigo-50/30 shadow-sm overflow-hidden group hover:shadow-md transition-all border-dashed">
          <CardContent className="p-7">
            <div className="flex items-center justify-between mb-5">
              <div className="p-2.5 bg-indigo-100 rounded-xl">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
              </div>
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-600 border-none px-3 font-bold text-[10px] uppercase tracking-wider">Till Date</Badge>
            </div>
            <h3 className="text-3xl font-black text-indigo-700">18.2%</h3>
            <p className="text-[13px] font-bold text-indigo-400 mt-2 uppercase tracking-wide">Overall PACE Conversions</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1 border border-slate-100 w-fit max-w-full overflow-x-auto">
        {(['All', 'Upcoming', 'Live', 'Completed'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setStatusFilter(tab)}
            className={cn(
              'h-9 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-all shrink-0',
              statusFilter === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="space-y-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-5 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
            <Input 
              placeholder="Search by title or instructor..." 
              className="pl-12 h-12 bg-slate-50 border-slate-200 rounded-2xl focus-visible:ring-blue-500/20 text-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className={cn(
                    "h-12 w-12 rounded-2xl border-slate-200 hover:bg-slate-50 relative transition-all",
                    isFilterActive && "border-blue-200 bg-blue-50 text-blue-600"
                  )}
                >
                  <Filter className={cn("h-5 w-5", isFilterActive ? "text-blue-600" : "text-slate-500")} />
                  {isFilterActive && (
                    <span className="absolute top-3 right-3 w-2 h-2 bg-blue-600 rounded-full border-2 border-white" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[450px] p-6 rounded-2xl shadow-xl border-slate-100 z-50">
                <div className="space-y-6">
                  {/* Date Range */}
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Date Range</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-500">From</Label>
                        <Input 
                          type="date" 
                          value={dateFrom} 
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="h-10 border-slate-200 rounded-xl bg-slate-50 focus-visible:ring-blue-500/20"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-500">To</Label>
                        <Input 
                          type="date" 
                          value={dateTo} 
                          onChange={(e) => setDateTo(e.target.value)}
                          className="h-10 border-slate-200 rounded-xl bg-slate-50 focus-visible:ring-blue-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PACE Batch Linked */}
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">PACE Batch</Label>
                    <Select value={paceBatch} onValueChange={setPaceBatch}>
                      <SelectTrigger className="h-11 border-slate-200 rounded-xl bg-slate-50">
                        <SelectValue placeholder="Select PACE Batch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All batches</SelectItem>
                        <SelectItem value="Batch 7">PACE Batch 7</SelectItem>
                        <SelectItem value="Batch 8">PACE Batch 8</SelectItem>
                        <SelectItem value="Batch 9">PACE Batch 9</SelectItem>
                        <SelectItem value="None">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Trainer */}
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Trainer</Label>
                    <Select value={trainer} onValueChange={setTrainer}>
                      <SelectTrigger className="h-11 border-slate-200 rounded-xl bg-slate-50">
                        <SelectValue placeholder="Select Trainer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All trainers</SelectItem>
                        <SelectItem value="Siddharth Shah">Siddharth Shah</SelectItem>
                        <SelectItem value="Amit Patel">Amit Patel</SelectItem>
                        <SelectItem value="Rajesh Kumar">Rajesh Kumar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Program Type */}
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Program Type</Label>
                    <div className="grid grid-cols-1 gap-3 pt-1">
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="standard" 
                          checked={programTypes.standard} 
                          onCheckedChange={(checked) => setProgramTypes(prev => ({ ...prev, standard: checked === true }))}
                        />
                        <label htmlFor="standard" className="text-sm font-bold text-slate-700 cursor-pointer">Standard BSW</label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="reinvite" 
                          checked={programTypes.reinvite}
                          onCheckedChange={(checked) => setProgramTypes(prev => ({ ...prev, reinvite: checked === true }))}
                        />
                        <label htmlFor="reinvite" className="text-sm font-bold text-slate-700 cursor-pointer">Re-invite</label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="recorded" 
                          checked={programTypes.recorded}
                          onCheckedChange={(checked) => setProgramTypes(prev => ({ ...prev, recorded: checked === true }))}
                        />
                        <label htmlFor="recorded" className="text-sm font-bold text-slate-700 cursor-pointer">Recorded</label>
                      </div>
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                    <Button 
                      variant="ghost" 
                      onClick={resetFilters}
                      className="text-[11px] font-black uppercase tracking-widest text-[#6B7280] hover:bg-slate-50 hover:text-slate-900"
                    >
                      Reset
                    </Button>
                    <Button 
                      onClick={applyFilters}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[12px] uppercase tracking-widest px-8 rounded-xl h-11"
                    >
                      Apply filters
                    </Button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isFilterActive && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between px-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#6B7280] font-medium">
                Filtered by: <span className="text-slate-900 font-bold">{getAppliedFilterNames() || 'Defaults'}</span>
              </span>
            </div>
            <button 
              onClick={resetFilters}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear filters
            </button>
          </motion.div>
        )}
      </div>

      {isFilterActive && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Filters:
          </span>

          {trainer && trainer !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[12px] font-semibold text-blue-700">
              Instructor: {trainer}
              <button
                type="button"
                onClick={() => setTrainer('All')}
                className="ml-0.5 text-blue-400 hover:text-blue-700 leading-none transition-colors"
                aria-label="Remove instructor filter"
              >
                ×
              </button>
            </span>
          )}

          {dateFrom && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[12px] font-semibold text-blue-700">
              From: {dateFrom}
              <button
                type="button"
                onClick={() => setDateFrom('')}
                className="ml-0.5 text-blue-400 hover:text-blue-700 leading-none transition-colors"
                aria-label="Remove date from filter"
              >
                ×
              </button>
            </span>
          )}

          {dateTo && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[12px] font-semibold text-blue-700">
              To: {dateTo}
              <button
                type="button"
                onClick={() => setDateTo('')}
                className="ml-0.5 text-blue-400 hover:text-blue-700 leading-none transition-colors"
                aria-label="Remove date to filter"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}

      {/* Webinars Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-[#E5E7EB]">
            <TableHead className="text-[13px] font-bold uppercase text-[#6B7280] tracking-[0.5px] py-4 h-[56px]">Webinar Details</TableHead>
            <TableHead className="text-[13px] font-bold uppercase text-[#6B7280] tracking-[0.5px] py-4 h-[56px]">Schedule</TableHead>
            <TableHead className="text-[13px] font-bold uppercase text-[#6B7280] tracking-[0.5px] py-4 h-[56px]">Status</TableHead>
            <TableHead className="text-[13px] font-bold uppercase text-[#6B7280] tracking-[0.5px] py-4 h-[56px]">Participants</TableHead>
            <TableHead className="text-[13px] font-bold uppercase text-[#6B7280] tracking-[0.5px] py-4 h-[56px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredWebinars.length > 0 ? (
            filteredWebinars.map((webinar, index) => {
              const instructorInitials = webinar.instructor.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              return (
                <TableRow 
                  key={webinar.id} 
                  className={cn(
                    "group cursor-pointer transition-colors h-[56px] border-b border-[#F3F4F6]",
                    index % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]"
                  )}
                  onClick={() => onViewDetails ? onViewDetails(webinar) : toast.info(`Viewing details for ${webinar.title}`)}
                >
                  <TableCell className="py-0 h-[56px]">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-[36px] h-[36px] rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 shadow-sm border border-white/20",
                        getAvatarColors(instructorInitials)
                      )}>
                        {instructorInitials}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-bold text-black truncate">
                            {webinar.title}
                          </span>
                          {webinar.isReinvite && (
                            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest flex items-center gap-1 shrink-0">
                              <RotateCcw className="h-2.5 w-2.5" />
                              Re-invite · {webinar.sourceBatches} source
                            </span>
                          )}
                        </div>
                        {webinar.subtext ? (
                          <div className="text-[11px] text-amber-600 font-bold truncate mt-0.5">
                            {webinar.subtext}
                          </div>
                        ) : (
                          <div className="text-[11px] text-[#6B7280] font-medium truncate mt-0.5">
                            {webinar.isReinvite && (webinar.sourceBatches || 0) >= REINVITE_THRESHOLD
                              ? `${Math.max((webinar.registrations || 0) - REINVITE_THRESHOLD, 0)} leads excluded from this re-invite pool — re-invite threshold of 3 reached.`
                              : `PACE: ${webinar.conversions} · ${webinar.instructor}`}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-0 h-[56px]">
                    <div className="flex flex-col leading-tight">
                      <div className="text-[13px] font-medium text-slate-700">
                        {webinar.date}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium tracking-tight">
                        {webinar.time}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-0 h-[56px]">
                    {getStatusBadge(webinar.status)}
                  </TableCell>
                  <TableCell className="py-0 h-[56px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px] font-bold text-slate-900">{webinar.registrations}</span>
                      <span className="text-[11px] text-slate-400 font-medium">REGS</span>
                      {webinar.status === 'Completed' && (
                        <>
                          <span className="text-slate-200 ml-1">/</span>
                          <span className="text-[13px] font-bold text-slate-500">{webinar.attendance} attended</span>
                        </>
                      )}
                      {webinar.isReinvite && (
                        <span className="text-[11px] text-slate-400 font-medium uppercase ml-1">Auto-enrolled</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-0 h-[56px] text-right">
                    <div className="flex items-center justify-end gap-2 pr-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-[12px] font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg px-3 shadow-sm bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails ? onViewDetails(webinar) : toast.info(`Viewing details for ${webinar.title}`);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                        Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-[12px] font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg px-3 shadow-sm bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateCampaign?.({ id: webinar.id, name: webinar.title });
                        }}
                      >
                        <MessageCircle className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                        Campaign
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 p-0">
                          {/* Upcoming Rows */}
                          {webinar.status === 'Upcoming' && (
                            <>
                              {isAdmin && (
                                <>
                                  <DropdownMenuItem className="font-bold text-[10px] uppercase tracking-widest p-2 px-3">
                                    Update Status
                                  </DropdownMenuItem>
                                </>
                              )}
                            </>
                          )}
                          
                          {/* Live Rows */}
                          {webinar.status === 'Live' && (
                            <>
                              {isAdmin && (
                                <DropdownMenuItem className="font-bold text-[10px] uppercase tracking-widest p-2 px-3">
                                  End Webinar
                                </DropdownMenuItem>
                              )}
                              {!isAdmin && (
                                <DropdownMenuItem disabled className="text-slate-400 text-[10px] italic p-2 px-3">
                                  No actions available
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                          
                          {/* Completed Rows */}
                          {webinar.status === 'Completed' && (
                            <>
                              {isAdmin && (
                                <DropdownMenuItem className="font-bold text-[10px] uppercase tracking-widest p-2 px-3 text-red-600">
                                  Delete Record
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-20 text-center">
                  <div className="text-center py-12">
                    <Search className="w-10 h-10 mx-auto mb-3 text-gray-300 opacity-30" />
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">No webinars found</h3>
                    <p className="text-xs text-gray-400 mb-4 max-w-[240px] mx-auto">Try adjusting your search or filters to find what you're looking for.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}

          {/* EDGE CASE TEST ROWS REMOVED FOR CLEAN FILTERING - INTEGRATED INTO FILTERED DATA */}
        </TableBody>
        </Table>
      </div>
    </div>
  );
};
