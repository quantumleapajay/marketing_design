import React, { useMemo, useState } from 'react';
import { Plus, Inbox, Calendar, Users, BarChart3, Filter, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface BBSEvent {
  id: string;
  name: string;
  code: string;
  speaker: string;
  city: string;
  slot: 'Morning' | 'Afternoon' | 'Evening';
  date: string;
  status: 'Upcoming' | 'Live' | 'Completed' | 'Cancelled';
  registrations: number;
  capacity: number;
  attended: number;
  registrationsCloseDate: string;
  isEdgeCase?: boolean;
  edgeCaseType?: 'registration_full' | 'attendance_sync_failed' | 'cancelled_after_registrations' | 'reg_closes_soon';
}

const BBS_EVENTS: BBSEvent[] = [
  {
    id: 'BBS-MUM-MAY26',
    name: 'BBS Mumbai — May 2026',
    code: 'BBS-MUM-MAY26',
    speaker: 'Siddharth Shah',
    city: 'Mumbai',
    slot: 'Morning',
    date: '15 May 2026',
    status: 'Upcoming',
    registrations: 124,
    capacity: 200,
    attended: 0,
    registrationsCloseDate: '2026-05-08',
  },
  {
    id: 'BBS-BLR-APR26',
    name: 'BBS Bengaluru — Apr 2026',
    code: 'BBS-BLR-APR26',
    speaker: 'Amit Patel',
    city: 'Bengaluru',
    slot: 'Evening',
    date: '20 Apr 2026',
    status: 'Completed',
    registrations: 198,
    capacity: 200,
    attended: 178,
    registrationsCloseDate: '2026-04-18',
  },
  {
    id: 'BBS-DEL-APR26',
    name: 'BBS Delhi — Apr 2026',
    code: 'BBS-DEL-APR26',
    speaker: 'Rajesh Kumar',
    city: 'Delhi',
    slot: 'Morning',
    date: '12 Apr 2026',
    status: 'Completed',
    registrations: 156,
    capacity: 180,
    attended: 142,
    registrationsCloseDate: '2026-04-10',
  },
  {
    id: 'BBS-PUN-MAR26',
    name: 'BBS Pune — Mar 2026',
    code: 'BBS-PUN-MAR26',
    speaker: 'Siddharth Shah',
    city: 'Pune',
    slot: 'Evening',
    date: '8 Mar 2026',
    status: 'Cancelled',
    registrations: 45,
    capacity: 150,
    attended: 0,
    registrationsCloseDate: '2026-03-05',
  },
];

const EDGE_CASE_EVENTS: BBSEvent[] = [
  {
    id: 'BBS-EC-FULL',
    name: 'BBS EC — Registration Full',
    code: 'BBS-EC-FULL',
    speaker: 'Ria Sharma',
    city: 'Hyderabad',
    slot: 'Morning',
    date: '10 May 2026',
    status: 'Upcoming',
    registrations: 200,
    capacity: 200,
    attended: 0,
    registrationsCloseDate: '2026-05-06',
    isEdgeCase: true,
    edgeCaseType: 'registration_full',
  },
  {
    id: 'BBS-EC-ATTENDANCE-FAIL',
    name: 'BBS EC — Attendance Sync Failed',
    code: 'BBS-EC-ATTENDANCE-FAIL',
    speaker: 'Amit Patel',
    city: 'Chennai',
    slot: 'Evening',
    date: '5 Apr 2026',
    status: 'Completed',
    registrations: 167,
    capacity: 200,
    attended: 167,
    registrationsCloseDate: '2026-04-03',
    isEdgeCase: true,
    edgeCaseType: 'attendance_sync_failed',
  },
  {
    id: 'BBS-EC-CANCELLED-REG',
    name: 'BBS EC — Cancelled with Registrations',
    code: 'BBS-EC-CANCELLED-REG',
    speaker: 'Rajesh Kumar',
    city: 'Kolkata',
    slot: 'Morning',
    date: '18 Apr 2026',
    status: 'Cancelled',
    registrations: 45,
    capacity: 150,
    attended: 0,
    registrationsCloseDate: '2026-04-12',
    isEdgeCase: true,
    edgeCaseType: 'cancelled_after_registrations',
  },
  {
    id: 'BBS-EC-CLOSES-SOON',
    name: 'BBS EC — Reg Closes Soon',
    code: 'BBS-EC-CLOSES-SOON',
    speaker: 'Siddharth Shah',
    city: 'Mumbai',
    slot: 'Morning',
    date: '12 May 2026',
    status: 'Upcoming',
    registrations: 89,
    capacity: 150,
    attended: 0,
    registrationsCloseDate: '2026-05-03',
    isEdgeCase: true,
    edgeCaseType: 'reg_closes_soon',
  },
];

interface BBSEventsProps {
  onCreateCampaign?: (event: { id: string; name: string }) => void;
  onCreateEvent?: () => void;
  onViewDetails?: (event: BBSEvent) => void;
}

export const BBSEvents: React.FC<BBSEventsProps> = ({ onCreateCampaign, onCreateEvent, onViewDetails }) => {
  const [activeView, setActiveView] = useState<'All Events' | 'Upcoming' | 'Live' | 'Completed' | 'Cancelled'>('All Events');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterCity, setFilterCity] = useState('All');
  const [filterTrainer, setFilterTrainer] = useState('All');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [isFilterActive, setIsFilterActive] = useState(false);

  const resetFilters = () => {
    setFilterCity('All');
    setFilterTrainer('All');
    setFilterDateFrom('');
    setFilterDateTo('');
    setIsFilterActive(false);
  };

  const tabs: Array<'All Events' | 'Upcoming' | 'Live' | 'Completed' | 'Cancelled'> = ['All Events', 'Upcoming', 'Live', 'Completed', 'Cancelled'];

  const visibleEvents = useMemo(() => {
    let events = activeView === 'All Events'
      ? BBS_EVENTS
      : BBS_EVENTS.filter((e) => e.status === activeView);

    if (isFilterActive) {
      if (filterCity !== 'All') events = events.filter(e => e.city === filterCity);
      if (filterTrainer !== 'All') events = events.filter(e => e.speaker === filterTrainer);
      if (filterDateFrom) events = events.filter(e => new Date(e.date) >= new Date(filterDateFrom));
      if (filterDateTo) events = events.filter(e => new Date(e.date) <= new Date(filterDateTo));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      events = events.filter((e) =>
        `${e.name} ${e.code} ${e.speaker} ${e.city}`.toLowerCase().includes(q)
      );
    }
    return events;
  }, [activeView, isFilterActive, filterCity, filterTrainer, filterDateFrom, filterDateTo, searchQuery]);
  const visibleEdgeEvents = useMemo(() => {
    const events = activeView === 'All Events'
      ? EDGE_CASE_EVENTS
      : EDGE_CASE_EVENTS.filter((event) => event.status === activeView);
    if (!searchQuery.trim()) return events;
    const q = searchQuery.toLowerCase();
    return events.filter((e) =>
      `${e.name} ${e.code} ${e.speaker} ${e.city}`.toLowerCase().includes(q)
    );
  }, [activeView, searchQuery]);

  const getStatusBadge = (status: BBSEvent['status'], _isMutedCancelled = false) => {
    return <StatusBadge status={status} />;
  };

  const getRegCloseMeta = (registrationsCloseDate: string) => {
    const closeDate = new Date(registrationsCloseDate);
    const today = new Date();
    closeDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysUntilClose = Math.ceil((closeDate.getTime() - today.getTime()) / msPerDay);

    if (daysUntilClose < 0) {
      return { state: 'closed' as const, label: 'Registrations closed' };
    }
    if (daysUntilClose <= 7) {
      return { state: 'soon' as const, label: `Reg. closes in ${daysUntilClose} day${daysUntilClose === 1 ? '' : 's'}` };
    }

    const formatted = closeDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    return { state: 'later' as const, label: `Reg. closes: ${formatted}` };
  };

  return (
    <div className="p-8 pt-0 max-w-7xl mx-auto space-y-6">
      <div className="sticky top-0 z-20 bg-white py-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">BBS (Events)</h1>
          <p className="text-slate-500 mt-1">Manage business seminars, registrations and attendance.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 font-bold h-11 px-6" onClick={onCreateEvent}>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none px-2 font-bold text-[10px] uppercase tracking-wider">Upcoming</Badge>
            </div>
            <h3 className="text-2xl font-black text-slate-900">3</h3>
            <p className="text-[12px] font-bold text-slate-400 mt-1 uppercase tracking-wide">Upcoming Events</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Users className="h-4 w-4 text-emerald-600" />
              </div>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none px-2 font-bold text-[10px] uppercase tracking-wider">All Time</Badge>
            </div>
            <h3 className="text-2xl font-black text-slate-900">1,842</h3>
            <p className="text-[12px] font-bold text-slate-400 mt-1 uppercase tracking-wide">Total Registrations</p>
          </CardContent>
        </Card>

        <Card className="border-indigo-100 bg-indigo-50/30 shadow-sm overflow-hidden hover:shadow-md transition-all border-dashed">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BarChart3 className="h-4 w-4 text-indigo-600" />
              </div>
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-600 border-none px-2 font-bold text-[10px] uppercase tracking-wider">Till Date</Badge>
            </div>
            <h3 className="text-2xl font-black text-indigo-700">16.4%</h3>
            <p className="text-[12px] font-bold text-indigo-400 mt-1 uppercase tracking-wide">Overall PACE Conversions</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1 border border-slate-100 w-fit max-w-full overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveView(tab)}
            className={cn(
              'h-9 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-all shrink-0',
              activeView === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-5 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
            <Input
              placeholder="Search by event name, code, trainer or city..."
              className="pl-12 h-12 bg-slate-50 border-slate-200 rounded-2xl focus-visible:ring-blue-500/20 text-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-12 w-12 rounded-2xl border-slate-200 hover:bg-slate-50 relative transition-all",
                isFilterActive && "border-blue-200 bg-blue-50 text-blue-600"
              )}
              onClick={() => setIsFilterOpen(true)}
            >
              <Filter className={cn("h-5 w-5", isFilterActive ? "text-blue-600" : "text-slate-500")} />
              {isFilterActive && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-blue-600 border-2 border-white" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isFilterActive && (
        <div className="mb-4 flex w-full flex-wrap items-center gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Filters:
          </span>

          {filterCity !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                         bg-blue-50 border border-blue-200 
                         text-[12px] font-semibold text-blue-700">
              City: {filterCity}
              <button
                onClick={() => {
                  setFilterCity('All');
                  if (filterTrainer === 'All' && !filterDateFrom && !filterDateTo) {
                    setIsFilterActive(false);
                  }
                }}
                className="ml-0.5 text-blue-400 hover:text-blue-700 leading-none"
              >×</button>
            </span>
          )}

          {filterTrainer !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                         bg-blue-50 border border-blue-200 
                         text-[12px] font-semibold text-blue-700">
              Trainer: {filterTrainer}
              <button
                onClick={() => {
                  setFilterTrainer('All');
                  if (filterCity === 'All' && !filterDateFrom && !filterDateTo) {
                    setIsFilterActive(false);
                  }
                }}
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
                onClick={() => {
                  setFilterDateFrom('');
                  if (filterCity === 'All' && filterTrainer === 'All' && !filterDateTo) {
                    setIsFilterActive(false);
                  }
                }}
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
                onClick={() => {
                  setFilterDateTo('');
                  if (filterCity === 'All' && filterTrainer === 'All' && !filterDateFrom) {
                    setIsFilterActive(false);
                  }
                }}
                className="ml-0.5 text-blue-400 hover:text-blue-700 leading-none"
              >×</button>
            </span>
          )}
          </div>

          <button
            onClick={resetFilters}
            className="ml-auto shrink-0 text-[11px] font-black text-slate-400 hover:text-red-500 
                   uppercase tracking-widest underline underline-offset-2 
                   transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {BBS_EVENTS.length === 0 ? (
          <div className="h-[360px] flex flex-col items-center justify-center p-8">
            <div className="text-center py-12">
              <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-300 opacity-30" />
              <h3 className="text-sm font-semibold text-gray-700 mb-1">No BBS events yet.</h3>
              <p className="text-xs text-gray-400 mb-4">Create your first BBS event to get started.</p>
              <Button className="bg-blue-600 hover:bg-blue-700 font-bold h-10 px-5">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
            </div>
          </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Event Details</TableHead>
              <TableHead>City + Slot</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registrations</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleEvents.map((event, idx) => {
              const fillPct = Math.min((event.registrations / event.capacity) * 100, 100);
              const isFull = event.registrations >= event.capacity;
              const isCancelled = event.status === 'Cancelled';
              const regCloseMeta = getRegCloseMeta(event.registrationsCloseDate);

              return (
              <TableRow
                key={event.id}
                className={cn(
                  'h-[56px] cursor-pointer transition-colors hover:bg-slate-50/80',
                  isCancelled && 'text-slate-400 bg-slate-50/70'
                )}
                onClick={() => onViewDetails?.(event)}
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className={cn('font-bold text-sm', isCancelled ? 'text-slate-400' : 'text-slate-900')}>{event.name}</span>
                    <span className="text-xs text-slate-500">Code: {event.code} · {event.speaker}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-slate-600">{event.city} · {event.slot}</TableCell>
                <TableCell className="text-sm text-slate-600">{event.date}</TableCell>
                <TableCell>
                  {getStatusBadge(event.status)}
                </TableCell>
                <TableCell>
                  {event.status === 'Upcoming' ? (
                    <div className="min-w-[160px]">
                      <p className={cn('text-sm font-bold', isFull ? 'text-red-600' : 'text-slate-700')}>
                        {event.registrations} / {event.capacity}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">vs. target {event.capacity}</p>
                      <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all', isFull ? 'bg-red-500' : 'bg-blue-500')}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                      <p
                        className={cn(
                          'mt-1.5 text-xs font-medium',
                          regCloseMeta.state === 'soon' && 'inline-flex rounded-full bg-amber-100 text-amber-700 px-2 py-0.5',
                          regCloseMeta.state === 'later' && 'text-slate-500',
                          regCloseMeta.state === 'closed' && 'text-red-600'
                        )}
                      >
                        {regCloseMeta.label}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-slate-700">
                      {event.status === 'Completed'
                        ? `${event.attended} attended / ${event.registrations} registered`
                        : `${event.registrations} / ${event.capacity} · ${event.attended} attended`}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-[12px] font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg px-3 shadow-sm bg-white"
                    onClick={() => onCreateCampaign?.({ id: event.id, name: event.name })}
                  >
                    Campaign
                  </Button>
                </TableCell>
              </TableRow>
            );
            })}
            {visibleEdgeEvents.length > 0 && (
              <TableRow className="bg-slate-800 hover:bg-slate-800">
                <TableCell colSpan={6} className="text-[11px] font-black uppercase tracking-widest text-slate-100 py-2.5">
                  ↓ EDGE CASE TEST ROWS — DEV & TESTING ONLY
                </TableCell>
              </TableRow>
            )}
            {visibleEdgeEvents.map((event) => {
              const fillPct = Math.min((event.registrations / event.capacity) * 100, 100);
              const isFull = event.registrations >= event.capacity;
              const isCancelled = event.status === 'Cancelled';
              const regCloseMeta = getRegCloseMeta(event.registrationsCloseDate);
              const isCancelledWithRegistrations = event.edgeCaseType === 'cancelled_after_registrations';

              return (
                <TableRow
                  key={event.id}
                  className={cn(
                    'h-[56px] cursor-pointer bg-amber-50/70 transition-colors hover:bg-amber-50',
                    isCancelled && 'text-slate-500',
                    isCancelledWithRegistrations && 'bg-[#FFFBF0] border-l-2 border-l-[#F59E0B]'
                  )}
                  onClick={() => onViewDetails?.(event)}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className={cn('font-bold text-sm', isCancelled ? 'text-slate-600' : 'text-slate-900')}>{event.name}</span>
                      <span className="text-xs text-slate-500">Code: {event.code} · {event.speaker}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-700">{event.city} · {event.slot}</TableCell>
                  <TableCell className="text-sm text-slate-700">{event.date}</TableCell>
                  <TableCell>{getStatusBadge(event.status, isCancelledWithRegistrations)}</TableCell>
                  <TableCell>
                    {event.status === 'Upcoming' ? (
                      <div className="min-w-[160px]">
                        <p className={cn('text-sm font-bold', isFull ? 'text-red-600' : 'text-slate-700')}>
                          {event.registrations} / {event.capacity}
                        </p>
                      <p className="mt-1 text-[11px] text-slate-400">vs. target {event.capacity}</p>
                        <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={cn('h-full rounded-full transition-all', isFull ? 'bg-red-500' : 'bg-blue-500')}
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                        <p
                          className={cn(
                            'mt-1.5 text-xs font-medium',
                            regCloseMeta.state === 'soon' && 'inline-flex rounded-full bg-amber-100 text-amber-700 px-2 py-0.5',
                            regCloseMeta.state === 'later' && 'text-slate-500',
                            regCloseMeta.state === 'closed' && 'text-red-600'
                          )}
                        >
                          {regCloseMeta.label}
                        </p>
                      </div>
                    ) : (
                      <p className={cn('text-sm font-semibold', isCancelledWithRegistrations ? 'text-slate-400' : 'text-slate-700')}>
                        {event.status === 'Completed'
                          ? `${event.attended} attended / ${event.registrations} registered`
                          : isCancelledWithRegistrations
                            ? `${event.registrations} / ${event.capacity}`
                            : `${event.attended} attended`}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-[12px] font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg px-3 shadow-sm bg-white"
                      onClick={() => onCreateCampaign?.({ id: event.id, name: event.name })}
                    >
                      Campaign
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {visibleEvents.length === 0 && visibleEdgeEvents.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center">
                  <div className="text-center py-12">
                    <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-300 opacity-30" />
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">No events in this view.</h3>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        )}
      </div>

      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent side="right" className="w-[360px] p-0">
          <SheetHeader className="px-6 py-5 border-b border-slate-100">
            <SheetTitle className="text-base font-black text-slate-900">Filter Events</SheetTitle>
          </SheetHeader>
          
          <div className="px-6 py-6 space-y-6">
            
            <div className="space-y-2">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">City</Label>
              <Select value={filterCity} onValueChange={setFilterCity}>
                <SelectTrigger className="h-10 border-slate-200 rounded-xl bg-slate-50">
                  <SelectValue placeholder="All cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All cities</SelectItem>
                  <SelectItem value="Mumbai">Mumbai</SelectItem>
                  <SelectItem value="Bengaluru">Bengaluru</SelectItem>
                  <SelectItem value="Delhi">Delhi</SelectItem>
                  <SelectItem value="Pune">Pune</SelectItem>
                  <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                  <SelectItem value="Chennai">Chennai</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Trainer</Label>
              <Select value={filterTrainer} onValueChange={setFilterTrainer}>
                <SelectTrigger className="h-10 border-slate-200 rounded-xl bg-slate-50">
                  <SelectValue placeholder="All trainers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All trainers</SelectItem>
                  <SelectItem value="Siddharth Shah">Siddharth Shah</SelectItem>
                  <SelectItem value="Amit Patel">Amit Patel</SelectItem>
                  <SelectItem value="Rajesh Kumar">Rajesh Kumar</SelectItem>
                  <SelectItem value="Ria Sharma">Ria Sharma</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Date Range</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] text-slate-400 font-bold">From</Label>
                  <Input 
                    type="date" 
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="h-10 border-slate-200 rounded-xl bg-slate-50 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-slate-400 font-bold">To</Label>
                  <Input 
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="h-10 border-slate-200 rounded-xl bg-slate-50 text-sm"
                  />
                </div>
              </div>
            </div>

          </div>

          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={resetFilters}
              className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700"
            >
              Reset
            </Button>
            <Button 
              onClick={() => { setIsFilterActive(true); setIsFilterOpen(false); }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[12px] uppercase tracking-widest px-6 rounded-xl h-10"
            >
              Apply
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default BBSEvents;
