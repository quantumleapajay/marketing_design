import React, { useCallback, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { NewBBSEventPayload } from './CreateBBSEvent';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import AuditTrail from './AuditTrail';
import { QrCode, AlertTriangle, Copy, Inbox, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import type { Campaign as LinkedCampaign } from './Campaigns';

interface BBSEventDetailProps {
  event: NewBBSEventPayload | null;
  onBack: () => void;
  onCreateCampaign?: () => void;
  onCreateCampaignForEvent?: (event: { id: string; name: string }) => void;
  onAddTrackedLink?: () => void;
  linkedCampaigns?: LinkedCampaign[];
}

export const BBSEventDetail: React.FC<BBSEventDetailProps> = ({
  event,
  onBack,
  onCreateCampaign,
  onCreateCampaignForEvent,
  onAddTrackedLink,
  linkedCampaigns = [],
}) => {
  const [activeRegistrationsView, setActiveRegistrationsView] = useState<'All' | 'Qualified' | 'Unqualified' | 'RSVP Confirmed' | 'Did Not Attend'>('All');
  const [activeAttendanceView, setActiveAttendanceView] = useState<'All' | 'Attended' | 'Did not attend'>('All');
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [adSpend, setAdSpend] = useState('₹1,24,800');
  const [isEditingAdSpend, setIsEditingAdSpend] = useState(false);
  const [showDisqualificationReasons, setShowDisqualificationReasons] = useState(false);
  const [hoveredVelocityPoint, setHoveredVelocityPoint] = useState<number | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [isManualAttendanceUploaded, setIsManualAttendanceUploaded] = useState(false);
  const [eventState, setEventState] = useState<NewBBSEventPayload | null>(event);
  const [linkToDeactivate, setLinkToDeactivate] = useState<{ id: string; linkName: string } | null>(null);
  const [editForm, setEditForm] = useState({
    targetCapacity: String(event?.targetCapacity ?? ''),
    extendedCapacity: String(event?.extendedCapacity ?? ''),
  });

  React.useEffect(() => {
    setEventState(event);
  }, [event]);

  React.useEffect(() => {
    if (!event) return;
    setEditForm({
      targetCapacity: String(event.targetCapacity ?? ''),
      extendedCapacity: String(event.extendedCapacity ?? ''),
    });
  }, [event]);

  const applyCapacitiesFromForm = useCallback(() => {
    setEventState((prev) =>
      prev
        ? {
            ...prev,
            targetCapacity: Number(editForm.targetCapacity) || prev.targetCapacity,
            extendedCapacity: Number(editForm.extendedCapacity) || prev.extendedCapacity,
          }
        : prev
    );
  }, [editForm]);

  if (!eventState) {
    return (
      <div className="p-8">
        <Button variant="ghost" className="px-0 h-auto mb-4" onClick={onBack}>
          {'← Back to BBS Events'}
        </Button>
        <div className="text-center py-12">
          <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-300 opacity-30" />
          <h3 className="text-sm font-semibold text-gray-700 mb-4">No event selected.</h3>
        </div>
      </div>
    );
  }

  const status = eventState.status || 'Upcoming';
  const registrations = eventState.registrations ?? 124;
  const capacity = eventState.targetCapacity ?? 200;
  const attended = eventState.attended ?? 178;
  const rsvpConfirmed = eventState.rsvpConfirmed ?? 198;
  const showUpRate = rsvpConfirmed > 0 ? ((attended / rsvpConfirmed) * 100).toFixed(1) : '0.0';
  const registrationPct = Math.min((registrations / Math.max(capacity, 1)) * 100, 100);
  const isUpcoming = status === 'Upcoming';
  const isCompleted = status === 'Completed';
  const isCancelled = status === 'Cancelled';
  const isRegistrationFullEdgeCase = eventState.edgeCaseType === 'registration_full';
  const isAttendanceSyncFailedEdgeCase = eventState.edgeCaseType === 'attendance_sync_failed';
  const isCancelledWithRegistrationsEdgeCase = eventState.edgeCaseType === 'cancelled_after_registrations';

  const getRegCloseMeta = (registrationsCloseDate?: string) => {
    if (!registrationsCloseDate) return null;
    const closeDate = new Date(registrationsCloseDate);
    const today = new Date();
    closeDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysUntilClose = Math.ceil((closeDate.getTime() - today.getTime()) / msPerDay);

    if (daysUntilClose < 0) return { state: 'closed' as const, label: 'Registrations closed' };
    if (daysUntilClose <= 7) {
      return { state: 'soon' as const, label: `Reg. closes in ${daysUntilClose} day${daysUntilClose === 1 ? '' : 's'}` };
    }
    const formatted = closeDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    return { state: 'later' as const, label: `Reg. closes: ${formatted}` };
  };
  const regCloseMeta = getRegCloseMeta(eventState.registrationsCloseDate);
  const unauthorizedCount = 3;
  const failedUploadCountLabel = isManualAttendanceUploaded ? '2' : 'Nil';

  const registrationRows = [
    { name: 'Priya Sharma', mobile: '98765 12345', slot: 'Morning', businessOwner: true, qualification: 'Qualified', rsvp: 'RSVP Confirmed', date: '10 Apr 2026', email: 'priya@gmail.com', years: '6', team: '8', industry: 'Retail', turnover: '₹80L', desc: 'Boutique chain owner', profileType: '', utm: 'Google' },
    { name: 'Ravi Kumar', mobile: '98765 43210', slot: 'Morning', businessOwner: false, qualification: 'Unqualified', rsvp: 'Not RSVPed', date: '11 Apr 2026', email: 'ravi@gmail.com', years: '', team: '', industry: '', turnover: '', desc: '', profileType: 'Professional', utm: 'Facebook' },
    { name: 'Anita Rao', mobile: '98765 01234', slot: 'Morning', businessOwner: true, qualification: 'Qualified', rsvp: 'RSVP Confirmed', date: '9 Apr 2026', email: 'anita@gmail.com', years: '9', team: '20', industry: 'Services', turnover: '₹1.2Cr', desc: 'Agency owner', profileType: '', utm: 'Google' },
    { name: 'Vikram Singh', mobile: '98765 09876', slot: 'Evening', businessOwner: false, qualification: 'Disqualified', rsvp: '—', date: '8 Apr 2026', email: 'vikram@gmail.com', years: '', team: '', industry: '', turnover: '', desc: '', profileType: 'Freelancer', utm: 'Organic' },
    { name: 'Meena Nair', mobile: '98765 03456', slot: 'Morning', businessOwner: false, qualification: 'Pending', rsvp: 'Not RSVPed', date: '12 Apr 2026', email: 'meena@gmail.com', years: '', team: '', industry: '', turnover: '', desc: '', profileType: 'Aspiring Business Owner', utm: 'Facebook' },
  ];
  const allowedProfileTypes = ['Aspiring Business Owner', 'Professional', 'Freelancer', 'Consultant', 'Student'];

  const filteredRegistrationRows = useMemo(() => {
    return registrationRows.filter((row) => {
      const matchesSearch = row.name.toLowerCase().includes(search.toLowerCase()) || row.mobile.includes(search);
      const matchesView =
        activeRegistrationsView === 'All' ||
        (activeRegistrationsView === 'Qualified' && row.qualification === 'Qualified') ||
        (activeRegistrationsView === 'Unqualified' && row.qualification === 'Unqualified') ||
        (activeRegistrationsView === 'RSVP Confirmed' && row.rsvp === 'RSVP Confirmed') ||
        (activeRegistrationsView === 'Did Not Attend' && row.rsvp === 'Not RSVPed');
      return matchesSearch && matchesView;
    });
  }, [search, activeRegistrationsView]);

  const attendanceRows = [
    { name: 'Priya Sharma', mobile: '98765 12345', attended: 'Yes', bought: 'Yes' },
    { name: 'Ravi Kumar', mobile: '98765 43210', attended: 'No', bought: 'No' },
    { name: 'Anita Rao', mobile: '98765 01234', attended: 'Yes', bought: 'Yes' },
    { name: 'Vikram Singh', mobile: '98765 09876', attended: 'No', bought: 'No' },
    { name: 'Meena Nair', mobile: '98765 03456', attended: 'Yes', bought: 'No' },
  ].filter((row) => activeAttendanceView === 'All' || (activeAttendanceView === 'Attended' ? row.attended === 'Yes' : row.attended === 'No'));

  const velocityData = [
    { dateLabel: 'Apr 1', dayIndex: 0, actual: 12 },
    { dateLabel: 'Apr 3', dayIndex: 2, actual: 28 },
    { dateLabel: 'Apr 5', dayIndex: 4, actual: 45 },
    { dateLabel: 'Apr 7', dayIndex: 6, actual: 67 },
    { dateLabel: 'Apr 9', dayIndex: 8, actual: 89 },
    { dateLabel: 'Apr 11', dayIndex: 10, actual: 112 },
    { dateLabel: 'Apr 13', dayIndex: 12, actual: 134 },
    { dateLabel: 'Apr 15', dayIndex: 14, actual: 156 },
    { dateLabel: 'Apr 17', dayIndex: 16, actual: 178 },
    { dateLabel: 'Apr 19', dayIndex: 18, actual: 198 },
  ].map((point) => ({
    ...point,
    target: Number(((point.dayIndex / 18) * 200).toFixed(0)),
  }));
  const velocityChart = { width: 760, height: 260, padLeft: 48, padRight: 20, padTop: 20, padBottom: 34 };
  const plotWidth = velocityChart.width - velocityChart.padLeft - velocityChart.padRight;
  const plotHeight = velocityChart.height - velocityChart.padTop - velocityChart.padBottom;
  const maxY = 210;
  const toX = (dayIndex: number) => velocityChart.padLeft + (dayIndex / 18) * plotWidth;
  const toY = (value: number) => velocityChart.padTop + ((maxY - value) / maxY) * plotHeight;
  const actualPath = velocityData
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.dayIndex)} ${toY(p.actual)}`)
    .join(' ');
  const targetPath = velocityData
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.dayIndex)} ${toY(p.target)}`)
    .join(' ');

  const [trackedLinks, setTrackedLinks] = useState([
    { id: 'trk-google', linkName: 'BBS Mumbai — Google', utmSource: 'Google', shortLink: 'qlone.co/bbs-mum-g', registrations: '67 regs' },
    { id: 'trk-facebook', linkName: 'BBS Mumbai — Facebook', utmSource: 'Facebook', shortLink: 'qlone.co/bbs-mum-fb', registrations: '57 regs' },
  ]);

  const handleCopyTrackedLink = async (linkId: string, link: string) => {
    await navigator.clipboard.writeText(link);
    setCopiedLinkId(linkId);
    setTimeout(() => setCopiedLinkId((prev) => (prev === linkId ? null : prev)), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <Button variant="ghost" className="px-0 h-auto mb-4" onClick={onBack}>
        {'← Back to BBS Events'}
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">{eventState.name}</h1>
            <Badge className={cn(
              'text-[10px] font-black uppercase tracking-wider',
              isUpcoming && 'bg-blue-100 text-blue-700',
              isCompleted && 'bg-slate-100 text-slate-700',
              isCancelled && 'bg-slate-100 text-slate-500'
            )}>{status}</Badge>
            {isRegistrationFullEdgeCase && (
              <Badge className="text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">
                Full
              </Badge>
            )}
            {regCloseMeta && (
              <span
                className={cn(
                  'text-xs font-semibold',
                  regCloseMeta.state === 'soon' && 'inline-flex items-center rounded-full bg-amber-100 text-amber-700 px-2 py-0.5',
                  regCloseMeta.state === 'later' && 'text-slate-500',
                  regCloseMeta.state === 'closed' && 'text-red-600'
                )}
              >
                {regCloseMeta.label}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 mt-1">{eventState.city} · {eventState.slot} · {eventState.date} · {eventState.trainer}</p>
          <p className="text-xs text-slate-400 mt-1">BBS Code: {eventState.code}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 text-[12px] font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg px-3 shadow-sm bg-white"
          onClick={() =>
            onCreateCampaignForEvent?.({
              id: eventState.id || eventState.code,
              name: eventState.name,
            })
          }
        >
          Campaign
        </Button>
      </div>

      <Card className="p-5 border-slate-200">
        {isUpcoming ? (
          <div>
            <p className={cn('text-sm font-bold', isRegistrationFullEdgeCase ? 'text-red-700' : 'text-slate-800')}>
              {registrations} / {capacity} registered
            </p>
            <div className="h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div className={cn('h-full rounded-full', isRegistrationFullEdgeCase ? 'bg-red-500' : 'bg-blue-500')} style={{ width: `${registrationPct}%` }} />
            </div>
            {isRegistrationFullEdgeCase && (
              <p className="text-xs font-bold text-red-600 mt-2">Registrations full — capacity reached</p>
            )}
            <div className="mt-3">
              {regCloseMeta && (
                <span
                  className={cn(
                    'text-xs font-bold',
                    regCloseMeta.state === 'soon' && 'inline-flex items-center rounded-full bg-amber-100 text-amber-700 px-3 py-1',
                    regCloseMeta.state === 'later' && 'text-slate-500',
                    regCloseMeta.state === 'closed' && 'text-red-600'
                  )}
                >
                  {regCloseMeta.label}
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm font-semibold text-slate-700">
            {registrations} registered · {attended} attended · Show-up rate: {showUpRate}%
          </p>
        )}
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {isCancelledWithRegistrationsEdgeCase && (
            <Card className="border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-800">
                This event was cancelled after 45 people registered. Their records have been updated with status: Event Cancelled.
              </p>
            </Card>
          )}
          <Card className="border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold">Event Details</h3>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3 text-sm">
              <p className="text-slate-500">Program Name</p><p className="font-medium">{eventState.name}</p>
              <p className="text-slate-500">BBS Code</p><p className="font-medium">{eventState.code}</p>
              <p className="text-slate-500">Date</p><p className="font-medium">{eventState.date}</p>
              <p className="text-slate-500">Slot</p><p className="font-medium">{eventState.slot} Batch · {eventState.slot === 'Morning' ? '9:00 AM – 1:00 PM' : '5:00 PM – 9:00 PM'}</p>
              <p className="text-slate-500">Trainer</p><p className="font-medium">{eventState.trainer}</p>
              <p className="text-slate-500">City</p><p className="font-medium">{eventState.city}</p>
              <p className="text-slate-500">Venue</p><p className="font-medium">{eventState.venue}</p>
              <p className="text-slate-500">Target Capacity</p><p className="font-medium">{capacity}</p>
              <p className="text-slate-500">Extended Capacity</p>
              <p className="font-medium">
                {eventState.extendedCapacity ? (
                  eventState.extendedCapacity
                ) : (
                  <span className="text-slate-300 text-sm">Not set</span>
                )}
              </p>
              <p className="text-slate-500">Registrations Close</p><p className="font-medium">{eventState.registrationsCloseDate}</p>
            </div>
            <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-3">
              <p className="text-sm font-medium text-slate-700">Target Capacity</p>
              <Input
                type="number"
                value={editForm.targetCapacity}
                onChange={(e) => setEditForm((p) => ({ ...p, targetCapacity: e.target.value }))}
                onBlur={applyCapacitiesFromForm}
              />
              <p className="text-sm font-medium text-slate-700">
                Extended Capacity
                <span className="ml-2 text-[11px] font-normal text-slate-400">Optional</span>
              </p>
              <Input
                type="number"
                placeholder="e.g. 220"
                value={editForm.extendedCapacity}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, extendedCapacity: e.target.value }))
                }
                onBlur={applyCapacitiesFromForm}
              />
              <p className="text-[11px] text-slate-400">
                Buffer seats beyond target.
              </p>
            </div>
          </Card>

          <Card className="border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold">Tracked Links</h3>
            </div>
            <div className="p-5">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Link Name</TableHead>
                    <TableHead>UTM Source</TableHead>
                    <TableHead>Short Link</TableHead>
                    <TableHead>Registrations</TableHead>
                    <TableHead>Copy</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trackedLinks.map((row) => {
                    const isCopied = copiedLinkId === row.id;
                    return (
                      <TableRow
                        key={row.id}
                        className="group cursor-pointer hover:bg-slate-50/80 transition-colors"
                        onClick={() => toast.info(`View tracked link: ${row.linkName}`)}
                      >
                        <TableCell>{row.linkName}</TableCell>
                        <TableCell>{row.utmSource}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="group inline-flex items-center gap-1.5">
                            <span className="text-sm font-medium text-slate-800">{row.shortLink}</span>
                            <button
                              type="button"
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600"
                              onClick={() => void handleCopyTrackedLink(row.id, row.shortLink)}
                              aria-label={`Copy ${row.shortLink}`}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>{row.registrations}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              'h-7 px-2 text-xs',
                              isCopied && 'border-green-200 text-green-700 bg-green-50 hover:bg-green-50'
                            )}
                            onClick={() => void handleCopyTrackedLink(row.id, row.shortLink)}
                          >
                            {isCopied ? 'Copied ✓' : 'Copy'}
                          </Button>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-[11px] font-bold text-red-600/80 hover:bg-red-50 hover:text-red-700 rounded-lg"
                            onClick={() => setLinkToDeactivate({ id: row.id, linkName: row.linkName })}
                          >
                            Deactivate
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {isRegistrationFullEdgeCase ? (
                <p className="mt-4 text-sm font-semibold text-red-600">Registration closed (capacity reached)</p>
              ) : (
                <Button 
                  variant="outline" 
                  className="mt-4 h-9 text-[12px] font-bold border-slate-200 
                             text-blue-600 hover:bg-blue-50 hover:border-blue-200 
                             rounded-xl px-4"
                  onClick={() => onAddTrackedLink?.()}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add tracked link
                </Button>
              )}
            </div>
          </Card>

          <AuditTrail title="Audit log" collapsible={true} maxVisible={3} entries={[]} />
        </TabsContent>

        <TabsContent value="registrations" className="space-y-5 mt-6">
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1 w-fit border">
            {(['All', 'Qualified', 'Unqualified', 'RSVP Confirmed', 'Did Not Attend'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveRegistrationsView(tab)} className={cn('h-8 px-3 text-xs font-bold rounded-lg', activeRegistrationsView === tab ? 'bg-white shadow-sm' : 'text-slate-500')}>{tab}</button>
            ))}
          </div>
          <p className="text-sm text-slate-600">Total: 124 · Qualified: 89 · RSVP Confirmed: 76 · No-show: 0</p>
          <Input placeholder="Search by name or mobile..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
          <Card className="border-slate-200">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Name</TableHead><TableHead>Mobile</TableHead><TableHead>Slot</TableHead><TableHead>Business Owner</TableHead><TableHead>Qualification Status</TableHead><TableHead>RSVP Status</TableHead><TableHead>Registered On</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrationRows.map((row) => (
                  <TableRow key={row.mobile} className="cursor-pointer" onClick={() => setSelectedLead(row)}>
                    <TableCell>{row.name}</TableCell><TableCell>{row.mobile}</TableCell><TableCell>{row.slot}</TableCell><TableCell>{row.businessOwner ? 'Yes' : 'No'}</TableCell><TableCell>{row.qualification}</TableCell><TableCell>{row.rsvp}</TableCell><TableCell>{row.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-6 space-y-5">
          {isUpcoming ? (
            <Card className="border-dashed border-slate-200 p-12 text-center bg-slate-50/50">
              <QrCode className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-600">
                Attendance is tracked via QR code on event day. Data will appear here automatically after the event ends.
              </p>
            </Card>
          ) : (
            <>
              {isAttendanceSyncFailedEdgeCase ? (
                <Card className="p-4 border-amber-200 bg-amber-50">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-700" />
                      <p className="text-sm font-semibold text-amber-800">
                        QR attendance sync failed. Upload attendance CSV to continue.
                      </p>
                    </div>
                    <div className="border-2 border-dashed border-amber-300 rounded-lg p-5 bg-white text-center">
                      <p className="text-sm text-slate-600 mb-2">Drop attendance CSV here or click to upload</p>
                      <p className="text-xs text-slate-500 mb-3">
                        Download the attendance report from the registration app, then upload it here.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-300 text-amber-800"
                        onClick={() => {
                          setIsManualAttendanceUploaded(true);
                          toast.success('Attendance CSV uploaded successfully.');
                        }}
                      >
                        Upload attendance CSV manually
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-4 border-green-200 bg-green-50"><p className="text-sm font-semibold text-green-800">QR attendance synced · 20 Apr 2026</p></Card>
              )}
              <p className="text-sm text-slate-700">
                Registered: {registrations} · Attended: {attended} · Did not attend: {registrations - attended} · Unauthorized: {unauthorizedCount} · Failed: {failedUploadCountLabel} · Show-up rate: {showUpRate}%
              </p>
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1 w-fit border">
                {(['All', 'Attended', 'Did not attend'] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveAttendanceView(tab)} className={cn('h-8 px-3 text-xs font-bold rounded-lg', activeAttendanceView === tab ? 'bg-white shadow-sm' : 'text-slate-500')}>{tab}</button>
                ))}
              </div>
              <Card className="border-slate-200">
                <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Mobile</TableHead><TableHead>Attended</TableHead><TableHead>Bought PACE</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {attendanceRows.map((row) => (
                      <TableRow
                        key={row.mobile}
                        className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                        onClick={() => toast.info(`Attendance: ${row.name}`)}
                      >
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.mobile}</TableCell>
                        <TableCell>{row.attended}</TableCell>
                        <TableCell>{row.bought}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="performance" className="mt-6 space-y-5">
          {isUpcoming ? (
            <Card className="border-dashed border-slate-200 p-10 text-center text-slate-500">Performance data available after event is marked Completed.</Card>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-3">
                <Card className="p-4"><p className="text-xs text-slate-500">Total Registrations</p><p className="text-xl font-bold">{registrations}</p></Card>
                <Card className="p-4"><p className="text-xs text-slate-500">Total Attended</p><p className="text-xl font-bold">{attended}</p></Card>
                <Card className="p-4"><p className="text-xs text-slate-500">Show-up Rate</p><p className="text-xl font-bold">{showUpRate}%</p></Card>
                <Card className="p-4"><p className="text-xs text-slate-500">(Attended / RSVP)</p><p className="text-xl font-bold">{showUpRate}%</p></Card>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <Card className="p-4"><p className="text-xs text-slate-500">Qualified Leads</p><p className="text-xl font-bold">89 (44.9%)</p></Card>
                <Card className="p-4"><p className="text-xs text-slate-500">RSVP Confirmed</p><p className="text-xl font-bold">76 (42.7%)</p></Card>
                <Card className="p-4"><p className="text-xs text-slate-500">PACE Sales</p><p className="text-xl font-bold">23</p></Card>
                <Card className="p-4"><p className="text-xs text-slate-500">PACE Conversions</p><p className="text-xl font-bold">12.9%</p></Card>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-4"><p className="text-xs text-slate-500">Disqualified Leads</p><p className="text-xl font-bold">34</p></Card>
                <Card className="p-4"><p className="text-xs text-slate-500">Recycled Leads (BSW Re-invite)</p><p className="text-xl font-bold">12</p></Card>
              </div>
              <Card className="p-5 border-slate-200">
                <h3 className="text-sm font-bold text-slate-900">Registration Velocity</h3>
                <p className="text-xs text-slate-500 mt-1">Registrations over time vs target pace</p>
                <div className="mt-4 rounded-xl border border-slate-100 p-3 bg-white relative overflow-hidden">
                  <svg viewBox={`0 0 ${velocityChart.width} ${velocityChart.height}`} className="w-full h-[260px]">
                    <line
                      x1={velocityChart.padLeft}
                      y1={velocityChart.height - velocityChart.padBottom}
                      x2={velocityChart.width - velocityChart.padRight}
                      y2={velocityChart.height - velocityChart.padBottom}
                      stroke="#CBD5E1"
                      strokeWidth="1"
                    />
                    <line
                      x1={velocityChart.padLeft}
                      y1={velocityChart.padTop}
                      x2={velocityChart.padLeft}
                      y2={velocityChart.height - velocityChart.padBottom}
                      stroke="#CBD5E1"
                      strokeWidth="1"
                    />

                    {velocityData.slice(0, -1).map((p, idx) => {
                      const next = velocityData[idx + 1];
                      const x1 = toX(p.dayIndex);
                      const x2 = toX(next.dayIndex);
                      const a1 = toY(p.actual);
                      const a2 = toY(next.actual);
                      const t1 = toY(p.target);
                      const t2 = toY(next.target);
                      const ahead = p.actual >= p.target && next.actual >= next.target;
                      const behind = p.actual < p.target && next.actual < next.target;
                      if (!ahead && !behind) return null;
                      return (
                        <polygon
                          key={`fill-${idx}`}
                          points={`${x1},${a1} ${x2},${a2} ${x2},${t2} ${x1},${t1}`}
                          fill={ahead ? 'rgba(34,197,94,0.18)' : 'rgba(245,158,11,0.20)'}
                        />
                      );
                    })}

                    <path d={targetPath} fill="none" stroke="#94A3B8" strokeWidth="2" strokeDasharray="6 5" />
                    <path d={actualPath} fill="none" stroke="#2563EB" strokeWidth="2.5" />

                    {velocityData.map((p, idx) => (
                      <g key={p.dateLabel}>
                        <circle
                          cx={toX(p.dayIndex)}
                          cy={toY(p.actual)}
                          r="4"
                          fill="#2563EB"
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredVelocityPoint(idx)}
                          onMouseLeave={() => setHoveredVelocityPoint((prev) => (prev === idx ? null : prev))}
                        />
                        <text x={toX(p.dayIndex)} y={velocityChart.height - 10} textAnchor="middle" fontSize="10" fill="#64748B">
                          {p.dateLabel}
                        </text>
                      </g>
                    ))}

                    {[0, 50, 100, 150, 200].map((tick) => (
                      <text
                        key={`y-${tick}`}
                        x={velocityChart.padLeft - 8}
                        y={toY(tick) + 4}
                        textAnchor="end"
                        fontSize="10"
                        fill="#94A3B8"
                      >
                        {tick}
                      </text>
                    ))}
                  </svg>

                  {hoveredVelocityPoint !== null && (
                    <div
                      className="absolute z-10 bg-slate-900 text-white text-[11px] rounded-md px-3 py-2 pointer-events-none"
                      style={{
                        left: `${(toX(velocityData[hoveredVelocityPoint].dayIndex) / velocityChart.width) * 100}%`,
                        top: `${(toY(velocityData[hoveredVelocityPoint].actual) / velocityChart.height) * 100}%`,
                        transform: 'translate(-50%, -115%)',
                      }}
                    >
                      {velocityData[hoveredVelocityPoint].dateLabel}: {velocityData[hoveredVelocityPoint].actual} registrations (Target: {velocityData[hoveredVelocityPoint].target} | Actual: {velocityData[hoveredVelocityPoint].actual} | Δ {velocityData[hoveredVelocityPoint].actual - velocityData[hoveredVelocityPoint].target >= 0 ? '+' : ''}{velocityData[hoveredVelocityPoint].actual - velocityData[hoveredVelocityPoint].target})
                    </div>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <p className="font-semibold text-slate-700">Final registrations: 198 / 200 (99%)</p>
                  <p className="font-semibold text-slate-700 text-right">vs target pace on closing day: +4 ahead</p>
                </div>
              </Card>
              <Card className="p-4 flex items-center justify-between">
                <p className="text-sm font-semibold">Ad Spend: {isEditingAdSpend ? <input value={adSpend} onChange={(e) => setAdSpend(e.target.value)} className="border rounded px-2 py-1 ml-2" /> : adSpend}</p>
                <button className="text-xs text-blue-600 font-bold" onClick={() => setIsEditingAdSpend((prev) => !prev)}>{isEditingAdSpend ? 'SAVE' : 'EDIT'}</button>
              </Card>
              <Card className="p-4">
                <button
                  type="button"
                  className="w-full text-left text-sm font-semibold text-slate-800"
                  onClick={() => setShowDisqualificationReasons((prev) => !prev)}
                >
                  Disqualification reasons {showDisqualificationReasons ? '▴' : '▾'}
                </button>
                {showDisqualificationReasons && (
                  <div className="text-sm text-slate-600 space-y-1 mt-3">
                    <p>Not interested: 14</p>
                    <p>Not a business owner: 8</p>
                    <p>Outside target segment: 7</p>
                    <p>Other: 5</p>
                  </div>
                )}
              </Card>
              <div className="flex items-center gap-3">
                <Input type="date" className="max-w-xs" />
                <Select><SelectTrigger className="max-w-[220px]"><SelectValue placeholder="Filter by city" /></SelectTrigger><SelectContent><SelectItem value="mumbai">Mumbai</SelectItem><SelectItem value="delhi">Delhi</SelectItem><SelectItem value="bengaluru">Bengaluru</SelectItem></SelectContent></Select>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="campaigns" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
              onClick={() =>
                onCreateCampaignForEvent?.({
                  id: eventState.id || eventState.code,
                  name: eventState.name,
                })
              }
            >
              + Create campaign for this event
            </Button>
          </div>
          <Card className="border-slate-200">
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
                  .filter((campaign) => campaign.sourceEventId === eventState.id || campaign.sourceEventName === eventState.name)
                  .map((campaign) => (
                    <TableRow key={campaign.id} className="cursor-pointer hover:bg-slate-50/70">
                      <TableCell className="font-medium text-slate-900">{campaign.name}</TableCell>
                      <TableCell>{campaign.channel}</TableCell>
                      <TableCell>{campaign.status}</TableCell>
                      <TableCell>{campaign.sentOn || campaign.scheduledFor || '—'}</TableCell>
                    </TableRow>
                  ))}
                {linkedCampaigns.filter((campaign) => campaign.sourceEventId === eventState.id || campaign.sourceEventName === eventState.name).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-slate-500 py-10">
                      No campaigns linked to this event yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <SheetContent side="right" className="gap-0 p-0">
          {selectedLead && (
            <>
              <SheetHeader className="relative">
                <SheetTitle>{selectedLead.name}</SheetTitle>
              </SheetHeader>
            <div className="p-6 space-y-4">
              {(() => {
                const showBusinessFields = selectedLead.businessOwner === true;
                const showProfileType = selectedLead.businessOwner === false;
                return (
              <div className="grid grid-cols-1 gap-2 text-sm">
                <p><span className="text-slate-500">Name:</span> {selectedLead.name}</p>
                <p><span className="text-slate-500">Email:</span> {selectedLead.email}</p>
                <p><span className="text-slate-500">Mobile:</span> {selectedLead.mobile}</p>
                <p><span className="text-slate-500">Slot:</span> {selectedLead.slot}</p>
                <p><span className="text-slate-500">Business Owner:</span> {selectedLead.businessOwner ? 'Yes' : 'No'}</p>
                {showBusinessFields && (
                  <>
                    <p><span className="text-slate-500">Years in Business:</span> {selectedLead.years}</p>
                    <p><span className="text-slate-500">Team Size:</span> {selectedLead.team}</p>
                    <p><span className="text-slate-500">Industry:</span> {selectedLead.industry}</p>
                    <p><span className="text-slate-500">Annual Turnover:</span> {selectedLead.turnover}</p>
                    <p><span className="text-slate-500">Product/Service Description:</span> {selectedLead.desc}</p>
                  </>
                )}
                {showProfileType && (
                  <p><span className="text-slate-500">Profile Type:</span> {allowedProfileTypes.includes(selectedLead.profileType) ? selectedLead.profileType : 'Professional'}</p>
                )}
                <p><span className="text-slate-500">UTM Source:</span> {selectedLead.utm}</p>
              </div>
                );
              })()}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <p className="text-sm"><span className="text-slate-500">RSVP Status:</span> {selectedLead.rsvp}</p>
                <p className="text-sm"><span className="text-slate-500">Qualification Status:</span> {selectedLead.qualification}</p>
              </div>
            </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={!!linkToDeactivate} onOpenChange={(open) => !open && setLinkToDeactivate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deactivate tracked link?</DialogTitle>
            <DialogDescription>
              {linkToDeactivate
                ? `Are you sure you want to deactivate "${linkToDeactivate.linkName}"?`
                : 'Are you sure you want to deactivate this tracked link?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setLinkToDeactivate(null)} className="font-bold text-slate-500">
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
              onClick={() => {
                if (!linkToDeactivate) return;
                setTrackedLinks((prev) => prev.filter((link) => link.id !== linkToDeactivate.id));
                toast.success('Tracked link deactivated.');
                setLinkToDeactivate(null);
              }}
            >
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};
