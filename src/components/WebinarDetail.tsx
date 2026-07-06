import React, { useEffect, useMemo, useState } from 'react';
import { 
  ArrowLeft, RefreshCw, Search, X, Users, BarChart2, Pencil, 
  AlertCircle, Copy, AlertTriangle, CheckCircle2, ChevronDown,
  Upload, Check, CloudUpload, Loader2, Info,
  RotateCcw, MoreVertical, ExternalLink, FileText, Mail, FileUp, ListRestart,
  Megaphone
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn, getAvatarColors } from '../lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import { useAuth } from '../lib/auth';
import AuditTrail from './AuditTrail';
import type { Campaign as LinkedCampaign } from './Campaigns';

interface WebinarDetailProps {
  webinar?: any;
  onBack: () => void;
  onCreateReinviteBatch?: () => void;
  onNavigate?: (tab: string) => void;
  onCreateCampaignForEvent?: (event: { id: string; name: string }) => void;
  linkedCampaigns?: LinkedCampaign[];
}

type CampaignChannel = 'Email' | 'WhatsApp' | 'Both';
type MetricField = 'openRate' | 'clickRate' | 'deliveryRate';

const LinkItem = ({ label, value }: { label: string; value: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-green-500" style={{ width: '8px', height: '8px' }} />
        <span className="text-[14px] font-bold text-black">{label}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
        onClick={handleCopy}
      >
        {copied ? <span className="text-[10px] text-green-500 font-bold">✓</span> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="grid grid-cols-2 items-center h-[36px]">
    <span className="text-[12px] text-[#9CA3AF]">{label}</span>
    <span className="text-[14px] text-[#111827]">{value}</span>
  </div>
);



interface Registration {
  id: string;
  name: string;
  email: string;
  mobile: string;
  registeredOn: string;
  payment: 'Captured' | 'Failed';
  utmSource: string;
  utmMedium: string;
  utmTerm: string;
  utmContent: string;
  leadSource: string;
  webinarDate: string;
  batch: string;
  paymentMode?: string;
  paymentAmount?: string;
  paymentNotes?: string;
  paymentAuditTrail?: { date: string; action: string; user: string }[];
}

const DUMMY_REGISTRATIONS: Registration[] = [
  { 
    id: '1', 
    name: 'Anita Rao', 
    email: 'anita.rao@example.com',
    mobile: '98765 01234', 
    registeredOn: '10 Apr 2026', 
    payment: 'Captured', 
    utmSource: 'Google', 
    utmMedium: 'CPC',
    utmTerm: 'Business Growth',
    utmContent: 'Ad 1',
    leadSource: 'Google Ads',
    webinarDate: '19 Apr 2026',
    batch: 'BSW Apr W3' 
  },
  { 
    id: '2', 
    name: 'Kiran Shah', 
    email: 'kiran.shah@example.com',
    mobile: '98765 02345', 
    registeredOn: '10 Apr 2026', 
    payment: 'Captured', 
    utmSource: 'Facebook', 
    utmMedium: 'Social',
    utmTerm: 'Entrepreneurship',
    utmContent: 'Post 1',
    leadSource: 'Meta Ads',
    webinarDate: '19 Apr 2026',
    batch: 'BSW Apr W3' 
  },
  { 
    id: '3', 
    name: 'Meena Nair', 
    email: 'meena.nair@example.com',
    mobile: '98765 03456', 
    registeredOn: '11 Apr 2026', 
    payment: 'Failed', 
    utmSource: 'Organic', 
    utmMedium: 'Direct',
    utmTerm: '—',
    utmContent: '—',
    leadSource: 'Direct',
    webinarDate: '19 Apr 2026',
    batch: 'BSW Apr W3' 
  },
  { 
    id: '4', 
    name: 'Suresh T.', 
    email: 'suresh.t@example.com',
    mobile: '98765 04567', 
    registeredOn: '11 Apr 2026', 
    payment: 'Captured', 
    utmSource: 'Google', 
    utmMedium: 'CPC',
    utmTerm: 'Sales Strategy',
    utmContent: 'Ad 2',
    leadSource: 'Google Ads',
    webinarDate: '19 Apr 2026',
    batch: 'BSW Apr W3' 
  },
  { 
    id: '5', 
    name: 'Priya V.', 
    email: 'priya.v@example.com',
    mobile: '98765 05678', 
    registeredOn: '12 Apr 2026', 
    payment: 'Failed', 
    utmSource: 'Instagram', 
    utmMedium: 'Social',
    utmTerm: 'Marketing',
    utmContent: 'Story 1',
    leadSource: 'Meta Ads',
    webinarDate: '19 Apr 2026',
    batch: 'BSW Apr W3' 
  },
];

interface Attendance {
  id: string;
  name: string;
  attended: boolean;
  duration: string;
  batch: string;
}

const DUMMY_ATTENDANCE: Attendance[] = [
  { id: '1', name: 'Anita Rao', attended: true, duration: '52 min', batch: 'BSW Apr W3' },
  { id: '2', name: 'Kiran Shah', attended: true, duration: '48 min', batch: 'BSW Apr W3' },
  { id: '3', name: 'Meena Nair', attended: false, duration: '0 min', batch: 'BSW Apr W3' },
  { id: '4', name: 'Suresh T.', attended: true, duration: '61 min', batch: 'BSW Apr W3' },
  { id: '5', name: 'Priya V.', attended: false, duration: '0 min', batch: 'BSW Apr W3' },
];

type WebinarAttendanceRowStatus = 'attended' | 'not_attended' | 'unauthorized';

interface WebinarAttendanceRow {
  name: string;
  mobile: string;
  status: WebinarAttendanceRowStatus;
  duration: number;
}

const WEBINAR_ATTENDANCE_MOCK: WebinarAttendanceRow[] = [
  { name: 'Rahul Khanna', mobile: '98765 43210', status: 'attended', duration: 92 },
  { name: 'Priya Sharma', mobile: '98765 12345', status: 'not_attended', duration: 0 },
  { name: 'Amit Patel', mobile: '98765 67890', status: 'attended', duration: 115 },
  { name: 'Sanya Reddy', mobile: '98765 54321', status: 'attended', duration: 45 },
  { name: 'Vikram Singh', mobile: '98765 09876', status: 'not_attended', duration: 0 },
  { name: 'Zoom guest (unmatched)', mobile: '—', status: 'unauthorized', duration: 18 },
  { name: 'Forwarded invite join', mobile: '—', status: 'unauthorized', duration: 62 },
  { name: 'Dial-in — no registration', mobile: '—', status: 'unauthorized', duration: 5 },
];

type WebinarAttendanceFilterTab = 'All' | 'Attended' | 'Not Attended' | 'Unauthorized';

export const WebinarDetail: React.FC<WebinarDetailProps> = ({ 
  webinar,
  onBack, 
  onCreateReinviteBatch, 
  onNavigate,
  onCreateCampaignForEvent,
  linkedCampaigns = []
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Marketing Head';
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showManualPayment, setShowManualPayment] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', mobile: '' });
  const [paymentForm, setPaymentForm] = useState({ amount: '', mode: '', notes: '' });
  
  const [filter, setFilter] = useState('All');
  const [showPostWebinarPreview, setShowPostWebinarPreview] = useState(false);
  const [isEditingAdSpend, setIsEditingAdSpend] = useState(false);
  const [isAdSpendSet, setIsAdSpendSet] = useState(true);
  const [adSpend, setAdSpend] = useState('24,500');
  const [currentStatus, setCurrentStatus] = useState('Upcoming');
  const [activeSubTab, setActiveSubTab] = useState(() => 
    (webinar?.id === 'edge-attendance-live' || webinar?.id === 'edge-attendance-sync-failed') 
      ? 'attendance' 
      : 'overview'
  );
  const [liveAttendees, setLiveAttendees] = useState(87);
  const [isLiveRefreshing, setIsLiveRefreshing] = useState(false);
 
  // Attendance sync states
  const [syncState, setSyncState] = useState<'failed' | 'processing' | 'success'>(
    webinar?.id === 'edge-attendance-sync-failed' ? 'failed' : 'success'
  );
  const [isDragging, setIsDragging] = useState(false);

  const [attendancePreviewState, setAttendancePreviewState] = useState<'Upcoming' | 'Live' | 'Completed' | 'Sync failed'>('Upcoming');
  const [attendanceFilter, setAttendanceFilter] = useState<WebinarAttendanceFilterTab>('All');
  const [isManualAttendanceUpload, setIsManualAttendanceUpload] = useState(false);

  const attendanceCounts = useMemo(() => {
    let attended = 0;
    let notAttended = 0;
    let unauthorized = 0;
    for (const r of WEBINAR_ATTENDANCE_MOCK) {
      if (r.status === 'attended') attended += 1;
      else if (r.status === 'not_attended') notAttended += 1;
      else unauthorized += 1;
    }
    return { attended, notAttended, unauthorized };
  }, []);

  const attendanceShowUpRate =
    attendanceCounts.attended + attendanceCounts.notAttended > 0
      ? (
          (attendanceCounts.attended / (attendanceCounts.attended + attendanceCounts.notAttended)) *
          100
        ).toFixed(1)
      : '0.0';

  useEffect(() => {
    if (attendanceCounts.unauthorized < 1 && attendanceFilter === 'Unauthorized') {
      setAttendanceFilter('All');
    }
  }, [attendanceCounts.unauthorized, attendanceFilter]);

  // Attendance tab states (legacy, keeping for compatibility if used elsewhere)
  const [attendanceSyncStatus, setAttendanceSyncStatus] = useState<'successful' | 'failed'>('successful');
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Registrations tab states
  const [showPaymentInfoBox, setShowPaymentInfoBox] = useState(true);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState<Record<string, boolean>>({});
  const [linkedPaceBatches, setLinkedPaceBatches] = useState<string[]>(['PACE Batch 7', 'PACE Batch 8']);
  
  // Status confirmation states
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [statusReason, setStatusReason] = useState('');
  const [auditLogs, setAuditLogs] = useState<any[]>([
    { id: '1', category: 'Status', date: '28 Apr 2026, 01:45 PM', action: 'Status changed: Upcoming → Live', user: 'Ria Sharma', reason: 'Webinar starting now' },
    { id: '2', category: 'Links', date: '28 Apr 2026, 12:15 PM', action: 'Payment link updated', user: 'Kunal Singh', reason: 'Pricing updated for new cycle' },
    { id: '3', category: 'Links', date: '28 Apr 2026, 11:30 AM', action: 'Zoom link updated', user: 'Ria Sharma', reason: 'Fixed broken link' },
    { id: '4', category: 'System', date: '28 Apr 2026, 10:00 AM', action: 'Event Created', user: 'Ria Sharma', reason: 'Initial setup' }
  ]);

  const [logCategoryFilter, setLogCategoryFilter] = useState('All');
  const [registrationSearchQuery, setRegistrationSearchQuery] = useState('');

  const handleStatusSelect = (val: string) => {
    if (val === currentStatus) return;
    setPendingStatus(val);
    setShowStatusConfirm(true);
  };

  const confirmStatusChange = () => {
    if (pendingStatus === 'Cancelled' && !statusReason.trim()) {
      toast.error('Cancellation reason is required.');
      return;
    }

    if (pendingStatus) {
      const oldStatus = currentStatus;
      setCurrentStatus(pendingStatus);
      const newLog = {
        id: Math.random().toString(36).substr(2, 9),
        category: 'Status',
        date: new Date().toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        action: `Status changed: ${oldStatus} → ${pendingStatus}`,
        user: user?.name || 'Ria Sharma',
        reason: statusReason.trim() || 'No reason provided'
      };
      setAuditLogs(prev => [newLog, ...prev]);
      toast.success(`Status updated to ${pendingStatus}`);
    }
    setShowStatusConfirm(false);
    setStatusReason('');
    setPendingStatus(null);
  };

  const manualPaymentFormInitial = {
    name: '',
    email: '',
    mobile: '',
    amount: '99',
    mode: 'UPI',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  };

  const [manualPaymentForm, setManualPaymentForm] = useState(manualPaymentFormInitial);

  // Link Checker states
  const [showLinkHistory, setShowLinkHistory] = useState(false);
  const [brokenLink, setBrokenLink] = useState<'Zoom' | 'WhatsApp' | 'Payment' | null>(() => {
    if (webinar?.id === 'edge-wa-broken') return 'WhatsApp';
    if (webinar?.id === 'edge-zoom-conflict') return 'Zoom';
    return null;
  });
  const [isFixingLink, setIsFixingLink] = useState(false);
  const [fixedUrl, setFixedUrl] = useState('');
  const [links, setLinks] = useState(() => {
    if (webinar?.id === 'edge-wa-broken') {
      return [
        { id: 'zoom', name: 'Zoom', url: 'https://zoom.us/j/123456789', status: 'Active', color: 'green', last: '10:30 AM', next: 'in 2 hours' },
        { id: 'wa', name: 'WhatsApp', url: 'https://chat.whatsapp.com/invite/123', status: 'Broken', color: 'red', last: '—', next: '—' },
        { id: 'pay', name: 'Payment', url: 'https://razorpay.com/pay/123', status: 'Active', color: 'green', last: '09:15 AM', next: 'in 1 hour' },
      ];
    }
    if (webinar?.id === 'edge-zoom-conflict') {
      return [
        { id: 'zoom', name: 'Zoom', url: 'https://zoom.us/j/123456789', status: 'Broken', color: 'red', last: '—', next: '—' },
        { id: 'wa', name: 'WhatsApp', url: 'https://chat.whatsapp.com/invite/123', status: 'Active', color: 'green', last: '10:30 AM', next: 'in 2 hours' },
        { id: 'pay', name: 'Payment', url: 'https://razorpay.com/pay/123', status: 'Active', color: 'green', last: '09:15 AM', next: 'in 1 hour' },
      ];
    }
    if (webinar?.id === 'edge-multiple-broken') {
      return [
        { id: 'zoom', name: 'Zoom', url: '—', status: 'Missing', color: 'red', last: '—', next: '—' },
        { id: 'wa', name: 'WhatsApp', url: '—', status: 'Missing', color: 'red', last: '—', next: '—' },
        { id: 'pay', name: 'Payment', url: 'https://razorpay.com/pay/123', status: 'Expired', color: 'amber', last: '09:15 AM', next: 'in 1 hour' },
      ];
    }
    return [
      { id: 'zoom', name: 'Zoom', url: 'https://zoom.us/j/123456789', status: 'Active', color: 'green', last: '10:30 AM', next: 'in 2 hours' },
      { id: 'wa', name: 'WhatsApp', url: 'https://chat.whatsapp.com/invite/123', status: 'Active', color: 'green', last: '10:30 AM', next: 'in 2 hours' },
      { id: 'pay', name: 'Payment', url: 'https://razorpay.com/pay/123', status: 'Expired', color: 'amber', last: '09:15 AM', next: 'in 1 hour' },
    ];
  });
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  // Zoom Link states
  const [zoomLinkState, setZoomLinkState] = useState<'normal' | 'failed' | 'manual'>('normal');
  const [manualZoomLink, setManualZoomLink] = useState('');
  const [isSavingManualLink, setIsSavingManualLink] = useState(false);


  const [hasSketchNoteLink, setHasSketchNoteLink] = useState(true);
  const sketchNoteUrl = "form.qloneapp.com/sketchnotes?batch=BSW-APR-W3";
  const [manualMetricInputs, setManualMetricInputs] = useState<Record<string, boolean>>({});
  const [manualMetricValues, setManualMetricValues] = useState<Record<string, string>>({});

  const staticCampaignRowsByEventId: Record<string, Array<{
    id: string;
    name: string;
    channel: CampaignChannel;
    audience: string;
    status: string;
    delivered: string;
    openRate: string;
    clickRate: string;
    deliveryRate: string;
    date: string;
    hubspotUnavailable: boolean;
    sourceEventName?: string;
  }>> = {
    'BSW-APR-W3': [
      {
        id: 'bsw-w3-reminder',
        name: 'BSW Apr W3 — Pre-webinar reminder',
        channel: 'WhatsApp',
        audience: 'All registered · 450 contacts',
        status: 'Sent',
        delivered: '432 / 450',
        openRate: '—',
        clickRate: '—',
        deliveryRate: '96.0%',
        date: '17 Apr 2026, 7:00 PM',
        hubspotUnavailable: false,
        sourceEventName: 'BSW April Week 3',
      },
      {
        id: 'bsw-w3-day-reminder',
        name: 'BSW Apr W3 — Day of reminder',
        channel: 'WhatsApp',
        audience: 'All registered · 450 contacts',
        status: 'Sent',
        delivered: '441 / 450',
        openRate: '—',
        clickRate: '—',
        deliveryRate: '98.0%',
        date: '19 Apr 2026, 6:00 PM',
        hubspotUnavailable: false,
        sourceEventName: 'BSW April Week 3',
      },
    ],
    'BBS-MUM-MAY26': [
      {
        id: 'bbs-mumbai-qualified-followup',
        name: 'BBS Mumbai — Qualified follow-up',
        channel: 'Both',
        audience: 'Qualified leads · 43 contacts',
        status: 'Draft',
        delivered: '43 / 43',
        openRate: '58.4%',
        clickRate: '19.2%',
        deliveryRate: '100%',
        date: '26 Apr 2026',
        hubspotUnavailable: false,
        sourceEventName: 'BBS Mumbai May 2026',
      },
    ],
    'BSW-RI-APR': [
      {
        id: 'bsw-reinvite-final-reminder',
        name: 'BSW Re-invite — Final reminder',
        channel: 'WhatsApp',
        audience: 'Non-attendees · 42 contacts',
        status: 'Sent',
        delivered: '41 / 42',
        openRate: '—',
        clickRate: '—',
        deliveryRate: '97.6%',
        date: '24 Apr 2026, 8:00 PM',
        hubspotUnavailable: false,
        sourceEventName: 'BSW Re-invite Apr',
      },
    ],
  };

  const resolveSourceEventId = () => {
    if (!webinar) return '';
    if (webinar.sourceEventId) return webinar.sourceEventId as string;
    if (webinar.id === '0001' || webinar.title?.includes('April Week 3')) return 'BSW-APR-W3';
    if (webinar.id === '0002' || webinar.title?.toLowerCase().includes('re-invite')) return 'BSW-RI-APR';
    if (webinar.title?.includes('BBS Mumbai May 2026')) return 'BBS-MUM-MAY26';
    return webinar.id || '';
  };

  const activeSourceEventId = resolveSourceEventId();

  const linkedCampaignRows = linkedCampaigns
    .filter((campaign) => campaign.sourceEventId && campaign.sourceEventId === activeSourceEventId)
    .map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      channel: campaign.channel as CampaignChannel,
      audience: `${campaign.audienceSegment} · ${campaign.audienceCount} contacts`,
      status: campaign.status,
      delivered:
        campaign.channel === 'Email'
          ? `${campaign.metrics?.email?.deliveredCount || 'Awaiting HubSpot sync'} / ${campaign.estimatedReach}`
          : `${campaign.metrics?.whatsapp?.deliveredCount || 'Awaiting HubSpot sync'} / ${campaign.estimatedReach}`,
      openRate: campaign.metrics?.email?.openRate || 'Awaiting HubSpot sync',
      clickRate:
        campaign.channel === 'Email'
          ? campaign.metrics?.email?.clickRate || 'Awaiting HubSpot sync'
          : campaign.metrics?.whatsapp?.clickRate || 'Awaiting HubSpot sync',
      deliveryRate: campaign.metrics?.whatsapp?.deliveryRate || 'Awaiting HubSpot sync',
      date: campaign.sentOn || campaign.createdDate,
      hubspotUnavailable: !campaign.hubspotConfirmed,
      sourceEventName: campaign.sourceEventName,
    }));

  const campaignRows = [...(staticCampaignRowsByEventId[activeSourceEventId] || []), ...linkedCampaignRows];

  const getMetricKey = (campaignId: string, field: MetricField, subChannel?: 'Email' | 'WhatsApp') =>
    `${campaignId}-${subChannel || 'primary'}-${field}`;
  const getDeliveredCount = (deliveredText: string) => deliveredText.split('/')[0]?.trim() || deliveredText;

  const renderMetricValue = (
    campaignId: string,
    field: MetricField,
    fallbackValue: string,
    hubspotUnavailable?: boolean,
    isWhatsAppUnsupported?: boolean,
    subChannel?: 'Email' | 'WhatsApp'
  ) => {
    const metricKey = getMetricKey(campaignId, field, subChannel);
    const inputVisible = !!manualMetricInputs[metricKey];
    const manualValue = manualMetricValues[metricKey];
    const displayValue = manualValue || fallbackValue;

    if (hubspotUnavailable) {
      return (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {inputVisible ? (
            <Input
              value={manualValue || ''}
              onChange={(e) =>
                setManualMetricValues((prev) => ({
                  ...prev,
                  [metricKey]: e.target.value,
                }))
              }
              placeholder="Enter"
              className="h-7 w-20 text-xs"
            />
          ) : (
            <>
              <span className="text-slate-400">—</span>
              <AlertCircle
                className="h-3.5 w-3.5 text-amber-500"
                title="HubSpot metrics unavailable. Update manually if needed."
              />
              <button
                type="button"
                className="text-xs font-medium text-blue-600 hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  setManualMetricInputs((prev) => ({
                    ...prev,
                    [metricKey]: true,
                  }));
                }}
              >
                Enter
              </button>
            </>
          )}
        </div>
      );
    }

    if (isWhatsAppUnsupported) {
      return (
        <span
          className="text-slate-400"
          title="WhatsApp does not track open rates"
        >
          —
        </span>
      );
    }

    return <span>{displayValue}</span>;
  };

  const handleRowClick = (reg: Registration) => {
    setSelectedReg(reg);
    setEditForm({ name: reg.name, email: reg.email, mobile: reg.mobile });
    setIsEditingProfile(false);
    setShowManualPayment(false);
    setIsPanelOpen(true);
  };

  const handleSaveProfile = () => {
    if (selectedReg) {
      setSelectedReg({ ...selectedReg, ...editForm });
      setIsEditingProfile(false);
      toast.success('Lead profile updated successfully.');
    }
  };

  const handleAddManualPayment = () => {
    if (selectedReg) {
      // Simulate invoice generation
      setIsGeneratingInvoice(prev => ({ ...prev, [selectedReg.id]: true }));
      
      const newAudit = [
        ...(selectedReg.paymentAuditTrail || []),
        { date: new Date().toLocaleString(), action: 'Manual Payment Recorded', user: 'Ria Sharma' }
      ];
      
      setSelectedReg({ 
        ...selectedReg, 
        payment: 'Captured', 
        paymentAmount: manualPaymentForm.amount,
        paymentMode: manualPaymentForm.mode,
        paymentNotes: manualPaymentForm.notes,
        paymentAuditTrail: newAudit
      });

      setShowManualPayment(false);
      toast.success('Manual payment recorded.');

      // Clear generation state after a delay
      setTimeout(() => {
        setIsGeneratingInvoice(prev => ({ ...prev, [selectedReg.id]: false }));
      }, 3000);
    }
  };

  const resetManualPaymentForm = (reg?: Registration) => {
    setManualPaymentForm({
      name: reg?.name || '',
      email: reg?.email || '',
      mobile: reg?.mobile || '',
      amount: '99',
      mode: 'UPI',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const registrationCloseDateLabel = webinar?.id === 'edge-reg-closes-10' ? '6 May 2026' : '17 Apr 2026';
  const registrationCloseDate = new Date(`${registrationCloseDateLabel} 23:59:59`);
  const todayDate = new Date();
  const isRegistrationClosed = !Number.isNaN(registrationCloseDate.getTime()) && registrationCloseDate < todayDate;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {webinar?.id === 'edge-attendance-live' && (
        <div className="bg-[#1F1F1F] text-white text-[10px] uppercase font-black tracking-[0.1em] py-2 text-center sticky top-0 z-[110]">
          EDGE CASE: Attendance Live Counter — dev testing row
        </div>
      )}

      {webinar?.id === 'edge-attendance-sync-failed' && (
        <div className="bg-[#1F1F1F] text-white text-[10px] uppercase font-black tracking-[0.1em] py-2 text-center sticky top-0 z-[110]">
          EDGE CASE: Attendance Sync Failed — dev testing row
        </div>
      )}

      {webinar?.id === 'edge-reg-closes-10' && (
        <div className="bg-[#1F1F1F] text-white text-[10px] uppercase font-black tracking-[0.1em] py-2 text-center sticky top-0 z-[110]">
          EDGE CASE: Reg. Closes {'>'}7 Days — dev testing row
        </div>
      )}
      
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              className="p-0 h-auto text-slate-500 hover:text-slate-900 hover:bg-transparent flex items-center gap-2"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">BSW (Webinars)</span>
            </Button>

            <div className="flex items-center gap-3">
              <Select value={currentStatus} onValueChange={handleStatusSelect}>
                <SelectTrigger className="w-40 h-8 text-[10px] font-bold uppercase tracking-wider border-slate-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Upcoming">Upcoming</SelectItem>
                  <SelectItem value="Live">Live</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Button className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 rounded-lg shadow-sm">
                + Campaign
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-[28px] font-bold text-slate-900 leading-tight">
                {webinar?.title || 'BSW April Week 3 - Day 1'}
              </h1>
              <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider">
                {currentStatus}
              </Badge>
            </div>

            <div className="text-[14px] text-slate-600 font-medium flex flex-wrap items-center gap-2">
              <span>19 Apr 2026</span>
              <span className="text-slate-300">·</span>
              <span>7:00 PM</span>
              <span className="text-slate-300">·</span>
              <span>Instructor: Siddharth Shah</span>
              <span className="text-slate-300">·</span>
              <span>zoom1@quantumleap.co.in</span>
            </div>

            <div className="text-[14px] text-slate-500 flex flex-wrap items-center gap-2">
              <span>
                BSW Batch Code: <span className="font-bold text-slate-700">{webinar?.id === 'edge-reg-closes-10' ? 'BSW-MAY-W5' : 'BSW-APR-W3'}</span>
              </span>
              <span className="text-slate-300">·</span>
              {isRegistrationClosed ? (
                <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-none rounded-[12px] px-[10px] py-[2px] text-[11px] font-semibold">
                  Promotion completed
                </Badge>
              ) : (
                <Badge className="bg-[#FEF3E2] text-[#7A4A00] hover:bg-[#FEF3E2] border-none rounded-[12px] px-[10px] py-[2px] text-[11px] font-semibold">
                  Reg closes: {registrationCloseDateLabel}
                </Badge>
              )}
            </div>
          </div>

          {!isRegistrationClosed && webinar?.id !== 'edge-reg-closes-10' && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3 text-[14px]">
              <div className="flex items-center gap-2 text-amber-700 font-medium">
                <AlertTriangle className="h-4 w-4" />
                <span>Registration closes in 2 days</span>
              </div>
            </div>
          )}
        </div>

      {/* Amber Banner - Appears if any link is Expired or Broken */}
      {links.some(l => l.status === 'Expired' || l.status === 'Broken') && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 mb-6 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <p className="text-sm font-medium text-amber-900">
              {webinar?.id === 'edge-multiple-broken' 
                ? 'Multiple links are broken or missing — attendees will not be able to join'
                : webinar?.id === 'edge-wa-broken'
                ? 'WhatsApp group link is invalid — attendees cannot join the group'
                : webinar?.id === 'edge-zoom-conflict'
                ? 'Zoom account has a scheduling conflict — check account selection'
                : 'Payment link is expired — fix it before the webinar'}
            </p>
          </div>
          <Button 
            variant="ghost" 
            className="text-amber-700 font-bold text-sm hover:bg-amber-100/50 flex items-center gap-1 h-8"
            onClick={() => {
              document.getElementById('link-checker-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Fix now
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="bg-transparent border-b border-slate-200 w-full justify-start rounded-none h-auto p-0 gap-8">
          <TabsTrigger 
            value="overview" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 text-sm font-bold text-slate-500 data-[state=active]:text-blue-600"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="registrations" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 text-sm font-bold text-slate-500 data-[state=active]:text-blue-600"
          >
            Registrations
          </TabsTrigger>
          <TabsTrigger 
            value="attendance" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 text-sm font-bold text-slate-500 data-[state=active]:text-blue-600"
          >
            Attendance
          </TabsTrigger>
          <TabsTrigger 
            value="post-webinar" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 text-sm font-bold text-slate-500 data-[state=active]:text-blue-600"
          >
            Post-Webinar
          </TabsTrigger>
          <TabsTrigger
            value="campaigns"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 text-sm font-bold text-slate-500 data-[state=active]:text-blue-600"
          >
            Campaigns
          </TabsTrigger>
          <TabsTrigger 
            value="audit-log" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 text-sm font-bold text-slate-500 data-[state=active]:text-blue-600"
          >
            Audit Log
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <div className="space-y-6">
            {/* Link Checker Status moved inside Overview tab */}
            <div className="space-y-4" id="link-checker-section">
              {brokenLink && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-red-900 leading-none">Broken link detected: {brokenLink} Link</h4>
                      <div className="flex items-center gap-3 text-[12px] text-red-600 font-medium">
                        <span>Detected: 25 Apr 2026, 11:15 AM</span>
                        <span className="text-red-300">|</span>
                        <span>Alert sent to: All team members</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="bg-red-600 hover:bg-red-700 text-white font-bold h-9 px-6 rounded-lg text-xs"
                    onClick={() => {
                      setFixedUrl('');
                      setEditingLinkId(links.find(l => l.name === brokenLink)?.id || null);
                      setIsFixingLink(true);
                    }}
                  >
                    Fix link
                  </Button>
                </motion.div>
              )}

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
                  <h3 className="text-[20px] font-bold text-slate-900">Link Checker Status</h3>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 gap-2 text-xs font-bold border-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98]"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Run check now
                    </Button>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {links.map((link) => (
                    <div key={link.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-12">
                        <div className="w-24">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={cn(
                              "h-2 w-2 rounded-full",
                              link.color === 'green' ? "bg-green-500" : link.color === 'red' ? "bg-red-500 animate-pulse" : "bg-amber-500"
                            )} />
                            <span className="text-sm font-bold text-slate-900">{link.name}</span>
                          </div>
                          <Badge className={cn(
                            "text-[10px] font-black uppercase tracking-tight rounded-md px-1.5 h-4 border-none",
                            link.color === 'green' ? "bg-green-100 text-green-700" : link.color === 'red' ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"
                          )}>
                            {link.status}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 group">
                            <span className="text-[13px] text-slate-600 font-medium truncate max-w-[300px]">
                              {link.url}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-slate-400 hover:text-slate-600"
                              onClick={() => {
                                navigator.clipboard.writeText(link.url);
                                toast.success(`${link.name} link copied!`);
                              }}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            
                            {link.status === 'Active' ? (
                              <a href={link.url} target="_blank" rel="noreferrer" className="text-blue-600 text-[11px] font-bold uppercase hover:underline">Open</a>
                            ) : (
                              <button 
                                className="text-red-500 text-[11px] font-black uppercase hover:underline"
                                onClick={() => {
                                  setEditingLinkId(link.id);
                                  setFixedUrl('');
                                }}
                              >
                                Fix
                              </button>
                            )}
                          </div>
                          {editingLinkId === link.id && (
                            <div className="mt-2 flex items-center gap-2 animate-in slide-in-from-left-2 duration-300">
                              {link.id === 'pay' ? (
                                <Select value={fixedUrl} onValueChange={setFixedUrl}>
                                  <SelectTrigger className="h-8 text-xs border-blue-200 focus:ring-blue-500 w-[240px]">
                                    <SelectValue placeholder="Select new payment link" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="https://rzp.io/l/bsw-apr-standard" className="text-xs">BSW April Standard - ₹99</SelectItem>
                                    <SelectItem value="https://rzp.io/l/bsw-apr-earlybird" className="text-xs">BSW April Early Bird - ₹49</SelectItem>
                                    <SelectItem value="https://rzp.io/l/bsw-apr-vip" className="text-xs">BSW April VIP - ₹199</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input 
                                  placeholder={`Enter new ${link.name} URL`}
                                  value={fixedUrl}
                                  onChange={(e) => setFixedUrl(e.target.value)}
                                  className="h-8 text-xs border-blue-200 focus-visible:ring-blue-500 w-[240px]"
                                />
                              )}
                              <Button 
                                size="sm" 
                                className="h-8 bg-blue-600 hover:bg-blue-700 font-bold px-4 text-xs text-white"
                                onClick={() => {
                                  setLinks(prev => prev.map(l => l.id === link.id ? { 
                                    ...l, 
                                    url: fixedUrl || l.url, 
                                    status: 'Active', 
                                    color: 'green',
                                    last: 'Now' 
                                  } : l));
                                  if (brokenLink === link.name) {
                                    setBrokenLink(null);
                                  }
                                  setEditingLinkId(null);
                                  toast.success('Link updated and verified.');
                                }}
                              >
                                Save
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-8 text-[12px]">
                        <div className="flex flex-col items-end">
                          <span className="text-slate-400 font-medium uppercase tracking-tight text-[10px]">Last Checked</span>
                          <span className="font-bold text-slate-700">{link.last}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-slate-400 font-medium uppercase tracking-tight text-[10px]">Next Check</span>
                          <span className="font-bold text-slate-700">{link.next}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-1 border-t border-slate-100 bg-slate-50/50">
                  <Button 
                    variant="ghost" 
                    className="w-full h-10 text-blue-600 font-bold text-sm hover:bg-slate-100/50 flex items-center justify-center gap-1"
                    onClick={() => setShowLinkHistory(!showLinkHistory)}
                  >
                    {showLinkHistory ? 'Hide history ↑' : 'View check history (last 7 days) ↓'}
                  </Button>
                </div>

                <AnimatePresence>
                  {showLinkHistory && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-white"
                    >
                      <div className="p-4 pt-0 border-t border-slate-100">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent border-b border-slate-100">
                              <TableHead className="h-9 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Date & Time</TableHead>
                              <TableHead className="h-9 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Zoom</TableHead>
                              <TableHead className="h-9 text-[10px] uppercase font-bold text-slate-400 tracking-wider">WhatsApp</TableHead>
                              <TableHead className="h-9 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Payment</TableHead>
                              <TableHead className="h-9 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Alert sent?</TableHead>
                              <TableHead className="h-9 text-[10px] uppercase font-bold text-slate-400 tracking-wider text-right">Checked by</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {[
                              { time: '25 Apr, 10:30 AM', zoom: 'ACTIVE', wa: 'ACTIVE', pay: 'EXPIRED', alert: 'No', by: 'System (auto)' },
                              { time: '25 Apr, 07:30 AM', zoom: 'ACTIVE', wa: 'BROKEN', pay: 'ACTIVE', alert: 'Yes', by: 'System (auto)' },
                              { time: '24 Apr, 10:30 PM', zoom: 'ACTIVE', wa: 'ACTIVE', pay: 'ACTIVE', alert: 'No', by: 'Ria Sharma (manual)' },
                              { time: '24 Apr, 07:30 PM', zoom: 'BROKEN', wa: 'ACTIVE', pay: 'ACTIVE', alert: 'Yes', by: 'System (auto)' },
                              { time: '24 Apr, 04:30 PM', zoom: 'ACTIVE', wa: 'ACTIVE', pay: 'ACTIVE', alert: 'No', by: 'System (auto)' },
                            ].map((row, idx) => (
                              <TableRow
                                key={idx}
                                className={cn(
                                  "cursor-pointer hover:bg-slate-50 border-b border-slate-50 transition-colors",
                                  row.alert === 'Yes' ? "bg-[#FEF9F9]" : "bg-white"
                                )}
                                onClick={() => toast.info(`Link check run · ${row.time}`)}
                              >
                                <TableCell className="py-2.5 text-[12px] font-medium text-slate-600">{row.time}</TableCell>
                                <TableCell className="py-2.5">
                                  <Badge className={cn(
                                    "text-[9px] font-black uppercase tracking-tight rounded px-1.5 h-3.5 border-none",
                                    row.zoom === 'ACTIVE' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                                  )}>
                                    {row.zoom}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-2.5">
                                  <Badge className={cn(
                                    "text-[9px] font-black uppercase tracking-tight rounded px-1.5 h-3.5 border-none",
                                    row.wa === 'ACTIVE' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                                  )}>
                                    {row.wa}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-2.5">
                                  <Badge className={cn(
                                    "text-[9px] font-black uppercase tracking-tight rounded px-1.5 h-3.5 border-none",
                                    row.pay === 'ACTIVE' ? "bg-green-100 text-green-700" : row.pay === 'BROKEN' ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"
                                  )}>
                                    {row.pay}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-2.5">
                                   <span className={cn("text-[11px]", row.alert === 'Yes' ? "text-red-500 font-bold" : "text-slate-400 font-medium")}>
                                     {row.alert}
                                   </span>
                                </TableCell>
                                <TableCell className="py-2.5 text-right">
                                  {row.by.includes('(manual)') ? (
                                    <div className="flex items-center justify-end gap-1.5">
                                      <span className="text-[12px] font-medium text-slate-700">{row.by.split(' (')[0]}</span>
                                      <Badge className="bg-blue-50 text-blue-600 border-none rounded px-1 py-0 text-[8px] font-black uppercase tracking-tighter">Manual</Badge>
                                    </div>
                                  ) : (
                                    <span className="text-[12px] italic text-slate-400">{row.by}</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Event Details */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="text-[20px] font-bold text-slate-900">Event Details</h3>
                <div className="space-y-0 border border-slate-100 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3.5 bg-white">
                    <span className="text-[12px] text-slate-500">Zoom Link</span>
                    <div className="flex-1 max-w-[400px] ml-4">
                      {zoomLinkState === 'failed' ? (
                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 space-y-3">
                          <div className="flex items-center gap-2 text-amber-800">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-tight">Zoom link generation failed. Enter a link manually.</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input 
                              placeholder="Paste Zoom webinar URL" 
                              value={manualZoomLink}
                              onChange={(e) => setManualZoomLink(e.target.value)}
                              className="h-8 text-xs bg-white border-amber-200 focus-visible:ring-amber-500"
                            />
                            <Button 
                              size="sm" 
                              className="h-8 bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 text-[11px]"
                              onClick={() => {
                                if (manualZoomLink) {
                                  setZoomLinkState('manual');
                                  toast.success('Manual Zoom link saved.');
                                }
                              }}
                            >
                              Save link
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] text-[#111827] truncate font-medium">
                              {zoomLinkState === 'manual' ? manualZoomLink : 'https://zoom.us/j/94512xxx'}
                            </span>
                            <Badge className={cn(
                              "text-[10px] font-bold uppercase tracking-tight rounded-md px-1.5 h-4 border-none",
                              zoomLinkState === 'manual' ? "bg-slate-100 text-slate-500" : "bg-green-100 text-green-700"
                            )}>
                              {zoomLinkState === 'manual' ? 'Manual' : 'Active'}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-slate-400 hover:text-slate-600"
                              onClick={() => {
                                navigator.clipboard.writeText(zoomLinkState === 'manual' ? manualZoomLink : 'https://zoom.us/j/94512xxx');
                                toast.success('Link copied!');
                              }}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <a 
                              href={zoomLinkState === 'manual' ? manualZoomLink : 'https://zoom.us/j/94512xxx'} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-blue-600 text-[11px] font-bold uppercase hover:underline"
                            >
                              Open
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {[
                    { label: 'BSW Batch Code', value: webinar?.id === 'edge-reg-closes-10' ? 'BSW-MAY-W5' : 'BSW-APR-W3' },
                    { 
                      label: 'Linked PACE Batch', 
                      value: linkedPaceBatches.length > 0 ? linkedPaceBatches.join(' · ') : '—',
                      isMuted: linkedPaceBatches.length === 0,
                      showAdd: linkedPaceBatches.length === 0
                    },
                    { 
                      label: 'Registration Closes', 
                      value: webinar?.id === 'edge-reg-closes-10' ? '6 May 2026' : '17 Apr 2026', 
                      subValue: webinar?.id === 'edge-reg-closes-10' ? null : 'in 2 days', 
                      isUrgent: webinar?.id !== 'edge-reg-closes-10' 
                    },
                    { label: 'Program Type', value: 'Live Webinar', status: 'Upcoming' },
                  ].map((row, i) => (
                    <div key={row.label} className={`flex items-center justify-between px-4 py-3.5 ${i % 2 === 0 ? 'bg-[#F9FAFB]' : 'bg-white'}`}>
                      <span className="text-[12px] text-slate-500">{row.label}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[14px] ${row.isMuted ? 'text-slate-400' : 'text-[#111827]'}`}>
                          {row.value}
                        </span>
                        {row.showAdd && (
                          <button 
                            className="text-blue-600 text-[11px] font-bold hover:underline"
                            onClick={() => setLinkedPaceBatches(['PACE Batch 7'])}
                          >
                            Add
                          </button>
                        )}
                        {row.subValue && (
                          <span className={`text-[14px] ${row.isUrgent ? 'text-amber-600 font-medium' : 'text-slate-500'}`}>
                            · {row.subValue}
                          </span>
                        )}
                        {row.status && (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-300">·</span>
                            <Badge 
                              variant="outline" 
                              className={`text-[11px] font-bold rounded-md py-0 px-2 cursor-pointer transition-colors ${
                                row.status === 'Upcoming' 
                                  ? 'border-blue-200 text-blue-600 hover:bg-blue-50' 
                                  : 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed'
                              }`}
                            >
                              {row.status}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {webinar?.id === 'edge-reg-closes-10' && (
                  <div className="mt-6 space-y-3">
                    <div className="flex gap-4">
                      <div className="flex-1 bg-[#F5F4F1] rounded-lg p-3 border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">≤7 DAYS</p>
                        <Badge className="bg-[#FEF3E2] text-[#7A4A00] hover:bg-[#FEF3E2] border-none rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                          Reg. closes in 2 days
                        </Badge>
                      </div>
                      <div className="flex-1 bg-[#F5F4F1] rounded-lg p-3 border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">{'>'}7 DAYS</p>
                        <span className="text-[13px] text-slate-500 font-medium">Reg. closes: 6 May 2026</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 italic">
                      Threshold = 7 days. ≤7 days → amber pill badge appears in header and status row. {'>'}7 days → plain grey text only, no visual treatment.
                    </p>
                  </div>
                )}
              </div>

              {/* Sketch Notes */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">Sketch Notes</h2>
                </div>

                {!hasSketchNoteLink ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex flex-col items-center text-center space-y-4">
                    <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-amber-900">No sketch note link configured for this batch.</p>
                      <p className="text-xs text-amber-700">Set it up in Settings → Sketch Note Management.</p>
                    </div>
                    {isAdmin && (
                      <Button 
                        variant="link" 
                        className="text-amber-800 font-bold text-sm h-auto p-0 hover:text-amber-900 flex items-center gap-1"
                        onClick={() => onNavigate?.('settings')}
                      >
                        Go to settings →
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Batch link</Label>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700 truncate">{sketchNoteUrl}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-slate-600"
                            onClick={() => {
                              navigator.clipboard.writeText(sketchNoteUrl);
                              toast.success('Link copied');
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-[12px] text-slate-400 font-medium">This link is batch-specific. It auto-updates when the previous event is marked Completed.</p>
                    </div>

                    {isAdmin && (
                      <div className="pt-2">
                        <Button 
                          variant="link" 
                          className="text-blue-600 font-black text-[12px] uppercase tracking-wider h-auto p-0 flex items-center gap-1 hover:text-blue-700 group"
                          onClick={() => onNavigate?.('settings')}
                        >
                          Manage sketch note links <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <AuditTrail
                  title="Event activity"
                  collapsible={true}
                  maxVisible={4}
                  entries={[
                    {
                      id: '1',
                      actor: 'Ria Sharma (Marketing Head)',
                      action: 'Created BSW event',
                      module: 'BSW',
                      detail: 'BSW April Week 3 · BSW-APR-W3',
                      timestamp: '1 Apr 2026, 9:00 AM',
                      relative_time: '1 month ago',
                      type: 'create',
                    },
                    {
                      id: '2',
                      actor: 'System',
                      action: 'Zoom link auto-generated',
                      module: 'BSW',
                      detail: 'zoom1@quantumleap.co.in · https://zoom.us/j/94512xxx',
                      timestamp: '1 Apr 2026, 9:01 AM',
                      relative_time: '1 month ago',
                      type: 'trigger',
                    },
                    {
                      id: '3',
                      actor: 'System',
                      action: 'Website synced to WordPress',
                      module: 'BSW',
                      detail: '5 fields pushed successfully',
                      timestamp: '1 Apr 2026, 9:02 AM',
                      relative_time: '1 month ago',
                      type: 'trigger',
                    },
                    {
                      id: '4',
                      actor: 'Amit Patel (Marketing Team)',
                      action: 'Copied sketch note link',
                      module: 'BSW',
                      detail: 'form.qloneapp.com/sketchnotes?batch=BSW-APR-W3',
                      timestamp: '19 Apr 2026, 6:45 PM',
                      relative_time: '1 week ago',
                      type: 'trigger',
                    },
                    {
                      id: '5',
                      actor: 'Ria Sharma (Marketing Head)',
                      action: 'Changed event status',
                      module: 'BSW',
                      field: 'Status',
                      old_value: 'Upcoming (Live)',
                      new_value: 'Completed',
                      timestamp: '19 Apr 2026, 9:30 PM',
                      relative_time: '1 week ago',
                      type: 'edit',
                    },
                  ]}
                />
              </div>

          </div>
        </TabsContent>
        <TabsContent value="registrations" className="mt-6">
          <div className="space-y-6">
            {showPaymentInfoBox && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start justify-between animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex gap-3">
                  <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-[13px] font-medium text-slate-600">
                    BSW registrations are charged at ₹99. 
                    B2C GST invoices are auto-generated on payment confirmation.
                  </p>
                </div>
                <button 
                  onClick={() => setShowPaymentInfoBox(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search by name or mobile" 
                  className="pl-9 h-10 border-slate-200 shadow-sm"
                  value={registrationSearchQuery}
                  onChange={(e) => setRegistrationSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <Tabs defaultValue="All" onValueChange={setFilter} className="w-full md:w-auto">
                  <TabsList className="bg-slate-100 p-1 h-10">
                    <TabsTrigger value="All" className="px-4 text-xs font-bold">All</TabsTrigger>
                    <TabsTrigger value="Captured" className="px-4 text-xs font-bold">Captured</TabsTrigger>
                    <TabsTrigger value="Failed" className="px-4 text-xs font-bold">Failed</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-4 rounded-lg shadow-sm shrink-0"
                  onClick={() => {
                    resetManualPaymentForm();
                    setShowManualPayment(true);
                  }}
                >
                  + Add manual payment
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-slate-50/50 h-12">
                    <TableHead className="text-[11px] font-black uppercase tracking-widest text-[#6B7280]">Name</TableHead>
                    <TableHead className="text-[11px] font-black uppercase tracking-widest text-[#6B7280]">Mobile</TableHead>
                    <TableHead className="text-[11px] font-black uppercase tracking-widest text-[#6B7280]">Registered On</TableHead>
                    <TableHead className="text-[11px] font-black uppercase tracking-widest text-[#6B7280]">Payment Status</TableHead>
                    <TableHead className="text-[11px] font-black uppercase tracking-widest text-[#6B7280]">UTM Source</TableHead>
                    <TableHead className="text-[11px] font-black uppercase tracking-widest text-[#6B7280]">Batch</TableHead>
                    <TableHead className="text-[11px] font-black uppercase tracking-widest text-[#6B7280] text-right pr-6">Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DUMMY_REGISTRATIONS
                    .filter(reg => {
                      const matchesStatus = filter === 'All' || reg.payment === filter;
                      const matchesSearch = reg.name.toLowerCase().includes(registrationSearchQuery.toLowerCase()) || 
                                          reg.mobile.includes(registrationSearchQuery);
                      return matchesStatus && matchesSearch;
                    })
                    .map((reg) => {
                      const initials = reg.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                    const isGenerating = isGeneratingInvoice[reg.id];
                    
                    return (
                      <TableRow 
                        key={reg.id} 
                        className="cursor-pointer group h-[56px] hover:bg-slate-50/50"
                        onClick={() => handleRowClick(reg)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-[36px] h-[36px] rounded-full flex items-center justify-center text-[12px] font-bold shrink-0",
                              getAvatarColors(initials)
                            )}>
                              {initials}
                            </div>
                            <span className="text-sm font-bold text-black border-none">
                              {reg.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-[#6B7280] font-medium border-none">{reg.mobile}</TableCell>
                        <TableCell className="text-xs text-[#6B7280] font-medium border-none">{reg.registeredOn}</TableCell>
                        <TableCell className="border-none">
                          <div className="flex items-center gap-4">
                            {reg.payment === 'Captured' ? (
                              <div className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-700">
                                Captured <Check className="h-2.5 w-2.5" />
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-600">
                                  Failed ✗
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button 
                                      className="text-[11px] font-black text-red-500 uppercase tracking-wider hover:underline flex items-center gap-1"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      Retry <ChevronDown className="h-3 w-3" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start" className="w-56">
                                    <DropdownMenuCheckboxItem 
                                      className="py-2.5"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toast.success(`Payment link resent to ${reg.email}`);
                                      }}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-slate-400" />
                                        <span className="font-bold text-slate-700">Send payment link again</span>
                                      </div>
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem 
                                      className="py-2.5"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRowClick(reg);
                                        resetManualPaymentForm(reg);
                                        setShowManualPayment(true);
                                      }}
                                    >
                                      <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-slate-400" />
                                        <span className="font-bold text-slate-700">Mark as manually paid</span>
                                      </div>
                                    </DropdownMenuCheckboxItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-[#6B7280] font-medium border-none">{reg.utmSource}</TableCell>
                        <TableCell className="text-xs text-[#6B7280] font-medium border-none">{reg.batch}</TableCell>
                        <TableCell className="text-right pr-6 border-none">
                          {reg.payment === 'Captured' ? (
                            isGenerating ? (
                              <span className="text-[11px] font-bold text-slate-400 italic flex items-center justify-end gap-2">
                                <Loader2 className="h-3 w-3 animate-spin" /> Generating...
                              </span>
                            ) : (
                              <button 
                                className="text-blue-600 text-xs font-bold hover:underline flex items-center justify-end gap-1.5 ml-auto"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toast.info('Downloading invoice...');
                                }}
                              >
                                <FileText className="h-3.5 w-3.5" /> View
                              </button>
                            )
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {DUMMY_REGISTRATIONS
                    .filter(reg => {
                      const matchesStatus = filter === 'All' || reg.payment === filter;
                      const matchesSearch = reg.name.toLowerCase().includes(registrationSearchQuery.toLowerCase()) || 
                                          reg.mobile.includes(registrationSearchQuery);
                      return matchesStatus && matchesSearch;
                    }).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-[300px] text-center">
                          <div className="text-center py-12">
                            <Search className="w-10 h-10 mx-auto mb-3 text-gray-300 opacity-30" />
                            <h3 className="text-sm font-semibold text-gray-700 mb-1">No registrations found</h3>
                            <p className="text-xs text-gray-400 mb-4 max-w-[250px] mx-auto">
                              We couldn't find any registrations matching "{registrationSearchQuery}"
                            </p>
                            <Button 
                              variant="ghost" 
                              onClick={() => setRegistrationSearchQuery('')}
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
            </div>
          </div>
        </TabsContent>
        <TabsContent value="attendance" className="mt-8">
          <div className="space-y-6">
            {webinar?.id === 'edge-attendance-sync-failed' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                {syncState === 'failed' && (
                  <>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-[14px] font-bold text-amber-900">Zoom sync failed</h5>
                        <p className="text-[13px] text-amber-700 mt-1">
                          Attendance data could not be synced automatically. Upload the Zoom participant report CSV to continue.
                        </p>
                      </div>
                    </div>

                    <div 
                      className={cn(
                        "border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer",
                        isDragging ? "border-blue-500 bg-blue-50" : "border-[#D4D1C8] bg-white hover:border-blue-400 hover:bg-[#EEF3FF]"
                      )}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={() => {
                        setIsDragging(false);
                        setSyncState('processing');
                        setTimeout(() => setSyncState('success'), 2000);
                      }}
                      onClick={() => {
                        setSyncState('processing');
                        setTimeout(() => setSyncState('success'), 2000);
                      }}
                    >
                      <div className="h-14 w-14 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <FileUp className="h-7 w-7 text-slate-400" />
                      </div>
                      <p className="text-[13px] font-bold text-[#6B6760]">
                        Drop your CSV file here or click to browse
                      </p>
                      <p className="text-[11px] text-[#9B9890] mt-1.5 font-medium">
                        .csv files only · Zoom participant report format
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-400 text-center font-medium">
                      To get this file: open Zoom → Reports → Usage Reports → Webinar → download participant report
                    </p>
                  </>
                )}

                {syncState === 'processing' && (
                  <div className="bg-white border border-slate-200 rounded-xl p-16 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
                    <p className="text-[14px] font-bold text-slate-900">Processing attendance data...</p>
                    <p className="text-[12px] text-slate-500 mt-1">This will only take a moment</p>
                  </div>
                )}

                {syncState === 'success' && (
                  <div className="space-y-6 animate-in slide-in-from-top-2 duration-500">
                    <div className="bg-green-100 border border-green-200 rounded-lg p-3 flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <p className="text-[13px] font-bold text-green-800">Attendance uploaded for 190 attendees.</p>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 border-b border-slate-200">
                            <TableHead className="text-[11px] font-bold uppercase text-slate-500 py-3 px-4">Participant</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase text-slate-500 py-3 px-4">WhatsApp</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase text-slate-500 py-3 px-4">Attended</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase text-slate-500 py-3 px-4">Duration</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase text-slate-500 py-3 px-4">Re-invites</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase text-slate-500 py-3 px-4">Clicks</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase text-slate-500 py-3 px-4">Current Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="border-b border-slate-100">
                            <TableCell className="py-3 px-4 text-[13px] font-bold text-slate-900">Meena Nair</TableCell>
                            <TableCell className="py-3 px-4 text-[13px] text-slate-600">98765 78901</TableCell>
                            <TableCell className="py-3 px-4 text-[13px] font-bold text-green-600">YES ✓</TableCell>
                            <TableCell className="py-3 px-4 text-[13px] text-slate-600">88 mins</TableCell>
                            <TableCell className="py-3 px-4 text-[13px] text-slate-400">—</TableCell>
                            <TableCell className="py-3 px-4 text-[13px] text-slate-400">—</TableCell>
                            <TableCell className="py-3 px-4 text-[13px] text-slate-600">No</TableCell>
                          </TableRow>
                          <TableRow className="border-b border-slate-100">
                            <TableCell className="py-3 px-4 text-[13px] font-bold text-slate-900">Arjun Das</TableCell>
                            <TableCell className="py-3 px-4 text-[13px] text-slate-600">98765 89012</TableCell>
                            <TableCell className="py-3 px-4 text-[13px] font-bold text-red-600">NO</TableCell>
                            <TableCell className="py-3 px-4 text-[13px] text-slate-600">0</TableCell>
                            <TableCell className="py-3 px-4 text-[13px] text-slate-600">1× (2 left)</TableCell>
                            <TableCell className="py-3 px-4 text-[13px] text-slate-600">0×</TableCell>
                            <TableCell className="py-3 px-4 text-[13px] text-slate-600">No</TableCell>
                          </TableRow>
                          <TableRow className="border-none">
                            <TableCell className="py-3 px-4 text-[13px] font-bold text-slate-900">Kavya Iyer</TableCell>
                            <TableCell className="py-3 px-4 text-[13px] text-slate-600">98765 90123</TableCell>
                            <TableCell className="py-3 px-4 text-[13px] font-bold text-green-600">YES ✓</TableCell>
                            <TableCell className="py-3 px-4 text-[13px] text-slate-600">104 mins</TableCell>
                            <TableCell className="py-3 px-4 text-[13px] text-slate-400">—</TableCell>
                            <TableCell className="py-3 px-4 text-[13px] text-slate-400">—</TableCell>
                            <TableCell className="py-3 px-4">
                              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none font-bold text-[10px] py-0">PACE ✓</Badge>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {webinar?.id === 'edge-attendance-live' && (
              <div className="space-y-6">
                <div className="bg-[#DCFCE7] border border-[#86EFAC] rounded-lg p-[10px_14px] flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#166534] animate-pulse" />
                  <p className="text-[12px] font-medium text-[#166534]">Webinar is live right now — 26 Apr 2026, 7:00 PM</p>
                </div>

                <div className="bg-[#F0FDF4] border-[1.5px] border-[#86EFAC] rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
                  <span className="text-[52px] font-semibold text-[#166534] leading-none mb-2 tabular-nums">
                    {liveAttendees}
                  </span>
                  <p className="text-[13px] font-medium text-[#15803D] mb-4">
                    attendees in the webinar right now
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#4ADE80] font-medium">
                    <span>Updates every 5 minutes · Last updated 2 min ago</span>
                    <button 
                      onClick={() => {
                        setIsLiveRefreshing(true);
                        setTimeout(() => {
                          setLiveAttendees(91);
                          setIsLiveRefreshing(false);
                          toast.success('Live count updated');
                        }, 600);
                      }}
                      className={cn(
                        "p-1 hover:bg-[#86EFAC]/20 rounded-full transition-colors",
                        isLiveRefreshing && "animate-spin"
                      )}
                    >
                      <RotateCcw className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <p className="text-[12px] text-slate-500 text-center">
                  Full attendance data syncs automatically within 30 minutes of the webinar ending. No action needed.
                </p>
              </div>
            )}

            {/* State Preview Toggle */}
            <div className="flex justify-end items-center gap-3">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Preview state:</span>
              <Select
                value={attendancePreviewState}
                onValueChange={(v: any) => {
                  setAttendancePreviewState(v);
                  if (v !== 'Completed') setIsManualAttendanceUpload(false);
                }}
              >
                <SelectTrigger className="w-40 h-8 text-xs font-bold border-slate-200">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Upcoming" className="text-xs font-medium">Upcoming</SelectItem>
                  <SelectItem value="Live" className="text-xs font-medium">Live</SelectItem>
                  <SelectItem value="Completed" className="text-xs font-medium">Completed</SelectItem>
                  <SelectItem value="Sync failed" className="text-xs font-medium">Sync failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {attendancePreviewState === 'Upcoming' ? (
              <div className="text-center py-12">
                <Users className="w-10 h-10 mx-auto mb-3 text-gray-300 opacity-30" />
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Webinar has not started</h3>
                <p className="text-xs text-gray-400 mb-4 max-w-sm mx-auto">
                  Attendance data will appear here once the webinar goes live and participants begin to join.
                </p>
              </div>
            ) : attendancePreviewState === 'Live' ? (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="bg-green-600 text-white rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  <span className="text-[13px] font-bold">Webinar is live right now</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center text-center shadow-sm">
                  <div className="text-[36px] font-bold text-slate-900 mb-1 leading-none">87</div>
                  <div className="text-sm font-medium text-slate-500 mb-6">attendees in the webinar</div>
                  
                  <div className="flex items-center gap-2 text-[12px] text-slate-400">
                    <span>Updates every 5 minutes · Last updated 2 min ago</span>
                    <RefreshCw className="h-3 w-3 cursor-pointer hover:text-blue-500 transition-colors" />
                  </div>
                </div>

                <p className="text-[13px] text-slate-400 text-center">
                  Full attendance data syncs automatically within 30 minutes of the webinar ending.
                </p>
              </div>
            ) : attendancePreviewState === 'Completed' ? (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-[13px] font-bold text-green-800">Zoom attendance synced · 19 Apr 2026 at 11:42 AM</span>
                </div>

                {/* Summary Row */}
                <div className="flex items-center justify-between py-6 px-10 bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <button
                    type="button"
                    onClick={() => setAttendanceFilter('Attended')}
                    className={cn(
                      'text-center rounded-xl px-4 py-2 -my-2 min-w-[88px] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300',
                      attendanceFilter === 'Attended' ? 'bg-slate-100 ring-2 ring-slate-200' : 'hover:bg-slate-50'
                    )}
                  >
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Attended</div>
                    <div className="text-xl font-bold text-slate-900 tabular-nums">{attendanceCounts.attended}</div>
                  </button>
                  <div className="h-10 w-[1px] bg-slate-100 shrink-0" />
                  <button
                    type="button"
                    onClick={() => setAttendanceFilter('Not Attended')}
                    className={cn(
                      'text-center rounded-xl px-4 py-2 -my-2 min-w-[88px] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300',
                      attendanceFilter === 'Not Attended' ? 'bg-slate-100 ring-2 ring-slate-200' : 'hover:bg-slate-50'
                    )}
                  >
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Did not attend</div>
                    <div className="text-xl font-bold text-slate-900 tabular-nums">{attendanceCounts.notAttended}</div>
                  </button>
                  <div className="h-10 w-[1px] bg-slate-100 shrink-0" />
                  <button
                    type="button"
                    disabled={attendanceCounts.unauthorized < 1}
                    onClick={() => {
                      if (attendanceCounts.unauthorized >= 1) setAttendanceFilter('Unauthorized');
                    }}
                    className={cn(
                      'text-center rounded-xl px-4 py-2 -my-2 min-w-[88px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300',
                      attendanceCounts.unauthorized < 1
                        ? 'opacity-40 cursor-not-allowed'
                        : 'cursor-pointer hover:bg-amber-50/80',
                      attendanceFilter === 'Unauthorized' ? 'bg-amber-50 ring-2 ring-amber-200' : ''
                    )}
                  >
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Unauthorized</div>
                    <div className="text-xl font-bold text-amber-600 tabular-nums">{attendanceCounts.unauthorized}</div>
                  </button>
                  {isManualAttendanceUpload && (
                    <>
                      <div className="h-10 w-[1px] bg-slate-100" />
                      <div className="text-center">
                        <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Failed to upload</div>
                        <div className="text-xl font-bold text-red-600">2</div>
                      </div>
                    </>
                  )}
                  <div className="h-10 w-[1px] bg-slate-100 shrink-0" />
                  <div className="text-center min-w-[88px] px-2">
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Show-up rate</div>
                    <div className="text-xl font-bold text-blue-600 tabular-nums">{attendanceShowUpRate}%</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Tabs
                    value={attendanceFilter}
                    onValueChange={(v) => setAttendanceFilter(v as WebinarAttendanceFilterTab)}
                    className="w-auto"
                  >
                    <TabsList className="bg-slate-100 p-1 h-10">
                      <TabsTrigger value="All" className="px-6 text-xs font-bold">
                        All
                      </TabsTrigger>
                      <TabsTrigger value="Attended" className="px-6 text-xs font-bold">
                        Attended
                      </TabsTrigger>
                      <TabsTrigger value="Not Attended" className="px-6 text-xs font-bold">
                        Did not attend
                      </TabsTrigger>
                      {attendanceCounts.unauthorized >= 1 ? (
                        <TabsTrigger value="Unauthorized" className="px-6 text-xs font-bold">
                          Unauthorized
                        </TabsTrigger>
                      ) : null}
                    </TabsList>
                  </Tabs>

                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent bg-slate-50/50">
                          <TableHead className="text-[11px] font-black uppercase tracking-widest py-4">Name</TableHead>
                          <TableHead className="text-[11px] font-black uppercase tracking-widest py-4">Mobile</TableHead>
                          <TableHead className="text-[11px] font-black uppercase tracking-widest py-4">Attended</TableHead>
                          <TableHead className="text-[11px] font-black uppercase tracking-widest py-4 text-center">Duration (mins)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {WEBINAR_ATTENDANCE_MOCK.filter((item) => {
                            if (attendanceFilter === 'Attended') return item.status === 'attended';
                            if (attendanceFilter === 'Not Attended') return item.status === 'not_attended';
                            if (attendanceFilter === 'Unauthorized') return item.status === 'unauthorized';
                            return true;
                          }).map((row) => (
                          <TableRow
                            key={`${row.name}-${row.mobile}`}
                            className="h-14 cursor-pointer hover:bg-slate-50/80 transition-colors"
                            onClick={() => toast.info(`Attendance: ${row.name}`)}
                          >
                            <TableCell className="font-bold text-sm text-slate-900">{row.name}</TableCell>
                            <TableCell className="text-[13px] text-slate-500">{row.mobile}</TableCell>
                            <TableCell>
                              {row.status === 'unauthorized' ? (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-none font-bold text-[10px] uppercase">
                                  Unauthorized
                                </Badge>
                              ) : row.status === 'attended' ? (
                                <Badge variant="secondary" className="bg-green-100 text-green-700 border-none font-bold text-[10px] uppercase">Yes ✓</Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-slate-100 text-slate-400 border-none font-bold text-[10px] uppercase">No —</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm font-medium text-slate-600 text-center">{row.duration}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-10 flex flex-col items-center text-center shadow-sm">
                  <div className="h-16 w-16 bg-amber-100/50 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="h-8 w-8 text-amber-600" />
                  </div>
                  <h4 className="text-lg font-bold text-amber-900 mb-2">Zoom sync failed. Upload attendance manually.</h4>
                  <p className="text-sm text-amber-700 max-w-sm mb-8 font-medium">
                    Download the participant report from Zoom, then upload it here.
                  </p>
                  
                  {!showFileUpload ? (
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white font-black h-12 px-8 rounded-xl"
                      onClick={() => setShowFileUpload(true)}
                    >
                      Upload attendance CSV
                    </Button>
                  ) : (
                    <div 
                      className="w-full max-w-xl border-2 border-dashed border-amber-200 rounded-2xl p-12 bg-white/50 cursor-pointer hover:bg-white hover:border-blue-400 transition-all group"
                      onClick={() => {
                        toast.info('Selecting file...');
                        setTimeout(() => {
                          setAttendancePreviewState('Completed');
                          setIsManualAttendanceUpload(true);
                          setShowFileUpload(false);
                          toast.success('Attendance report uploaded successfully.');
                        }, 2000);
                      }}
                    >
                      <CloudUpload className="h-10 w-10 text-slate-300 mb-4 mx-auto group-hover:text-blue-500 group-hover:scale-110 transition-all" />
                      <div className="text-sm font-bold text-slate-600">Drop Zoom participant report here</div>
                      <div className="text-xs text-slate-400 mt-1">or click to browse (.csv)</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="post-webinar" className="mt-6">
          <div className="flex justify-end mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Preview completed state</span>
              <button 
                onClick={() => setShowPostWebinarPreview(!showPostWebinarPreview)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${showPostWebinarPreview ? 'bg-primary' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${showPostWebinarPreview ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          {!showPostWebinarPreview ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <BarChart2 className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Post-webinar metrics will appear here</h3>
              <p className="text-sm text-slate-500 max-w-xs">
                Available after the webinar is marked Completed.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Total Registrations', value: '198' },
                  { label: 'Total Attended', value: '156' },
                  { label: 'Show-up Rate', value: '78.8%' },
                  { label: 'PACE Sales', value: '23' },
                  { label: 'PACE Conversions', value: '14.7%' },
                  { label: 'Revenue Generated', value: '₹3,45,000' },
                ].map((metric) => (
                  <div key={metric.label} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">{metric.label}</div>
                    <div className="text-2xl font-black text-slate-900">{metric.value}</div>
                  </div>
                ))}
                
                {/* Re-invite Eligible Metric */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-[11px] font-black text-blue-400 uppercase tracking-widest">Re-invite Eligible</div>
                    <RotateCcw className="h-4 w-4 text-blue-400 group-hover:rotate-180 transition-transform duration-500" />
                  </div>
                  <div className="text-2xl font-black text-blue-600">38</div>
                  <div className="text-[10px] font-medium text-blue-400 mt-1">non-attendees + non-PACE buyers</div>
                </div>

                {/* Ad Spend Metric */}
                <div className={cn(
                  "rounded-xl p-5 shadow-sm transition-all relative overflow-hidden",
                  !isAdSpendSet && !isEditingAdSpend ? "bg-white border-2 border-dashed border-slate-200" : "bg-white border border-slate-200"
                )}>
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Ad Spend</div>
                  
                  {isEditingAdSpend ? (
                    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                        <Input 
                          autoFocus
                          value={adSpend}
                          onChange={(e) => setAdSpend(e.target.value)}
                          className="h-9 pl-7 text-sm font-bold border-blue-200 focus-visible:ring-blue-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 h-8 bg-blue-600 hover:bg-blue-700 font-bold text-xs"
                          onClick={() => {
                            setIsAdSpendSet(true);
                            setIsEditingAdSpend(false);
                            toast.success('Ad spend updated.');
                          }}
                        >
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 text-xs font-bold text-slate-400"
                          onClick={() => setIsEditingAdSpend(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {!isAdSpendSet ? (
                        <button 
                          className="w-full text-left focus:outline-none group py-1"
                          onClick={() => setIsEditingAdSpend(true)}
                        >
                          <span className="text-sm font-bold text-slate-300 group-hover:text-slate-400 tracking-tight">Enter Ad Spend</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="text-2xl font-black text-slate-900 group">
                            ₹ {adSpend}
                          </div>
                          <button 
                            className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline"
                            onClick={() => setIsEditingAdSpend(true)}
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

            </div>
          )}
        </TabsContent>

        <TabsContent value="campaigns" className="mt-6">
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                onClick={() =>
                  onCreateCampaignForEvent?.({
                    id: webinar?.id || 'unknown-event',
                    name: webinar?.title || 'BSW Event',
                  })
                }
              >
                + Create campaign for this event
              </Button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Campaign Name</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Delivered</TableHead>
                    <TableHead>Delivery Rate</TableHead>
                    <TableHead>Open Rate</TableHead>
                    <TableHead>Click Rate</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaignRows.map((item) => {
                    if (item.channel !== 'Both') {
                      return (
                        <TableRow
                          key={item.id}
                          className="cursor-pointer hover:bg-slate-50/70 transition-colors"
                          onClick={() => toast.info(`View campaign: ${item.name}`)}
                        >
                          <TableCell className="font-medium text-slate-900">
                            <div>{item.name}</div>
                            {item.sourceEventName && (
                              <div className="mt-1 text-xs text-slate-500">
                                Linked event: {item.sourceEventName}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{item.channel}</TableCell>
                          <TableCell>{item.audience}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{item.status}</Badge>
                          </TableCell>
                          <TableCell>{getDeliveredCount(item.delivered)}</TableCell>
                          <TableCell>{renderMetricValue(item.id, 'deliveryRate', item.deliveryRate, item.hubspotUnavailable)}</TableCell>
                          <TableCell>
                            {renderMetricValue(
                              item.id,
                              'openRate',
                              item.openRate,
                              item.hubspotUnavailable,
                              item.channel === 'WhatsApp'
                            )}
                          </TableCell>
                          <TableCell>
                            {renderMetricValue(
                              item.id,
                              'clickRate',
                              item.clickRate,
                              item.hubspotUnavailable,
                              item.channel === 'WhatsApp'
                            )}
                          </TableCell>
                          <TableCell>{item.date}</TableCell>
                        </TableRow>
                      );
                    }

                    return (
                      <React.Fragment key={item.id}>
                        <TableRow
                          className="cursor-pointer bg-slate-50 hover:bg-slate-100/80 transition-colors"
                          onClick={() => toast.info(`View campaign: ${item.name}`)}
                        >
                          <TableCell className="font-medium text-slate-900 border-l-2 border-purple-400">
                            <div>{item.name}</div>
                            {item.sourceEventName && (
                              <div className="mt-1 text-xs text-slate-500">
                                Linked event: {item.sourceEventName}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>Both</TableCell>
                          <TableCell>{item.audience}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{item.status}</Badge>
                          </TableCell>
                          <TableCell className="text-slate-400">—</TableCell>
                          <TableCell className="text-slate-400">—</TableCell>
                          <TableCell className="text-slate-400">—</TableCell>
                          <TableCell className="text-slate-400">—</TableCell>
                          <TableCell>{item.date}</TableCell>
                        </TableRow>

                        <TableRow
                          className="cursor-pointer hover:bg-slate-50/70 transition-colors"
                          onClick={() => toast.info(`View campaign: ${item.name} (Email)`)}
                        >
                          <TableCell className="border-l-2 border-purple-400">
                            <div className="pl-5 text-blue-700 font-medium">↳ Email</div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Email</Badge>
                          </TableCell>
                          <TableCell>{item.audience}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{item.status}</Badge>
                          </TableCell>
                          <TableCell>43</TableCell>
                          <TableCell>{renderMetricValue(item.id, 'deliveryRate', '100%', item.hubspotUnavailable, false, 'Email')}</TableCell>
                          <TableCell>{renderMetricValue(item.id, 'openRate', '58.4%', item.hubspotUnavailable, false, 'Email')}</TableCell>
                          <TableCell>{renderMetricValue(item.id, 'clickRate', '19.2%', item.hubspotUnavailable, false, 'Email')}</TableCell>
                          <TableCell>{item.date}</TableCell>
                        </TableRow>

                        <TableRow
                          className="cursor-pointer hover:bg-slate-50/70 transition-colors"
                          onClick={() => toast.info(`View campaign: ${item.name} (WhatsApp)`)}
                        >
                          <TableCell className="border-l-2 border-purple-400">
                            <div className="pl-5 text-green-700 font-medium">↳ WhatsApp</div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">WhatsApp</Badge>
                          </TableCell>
                          <TableCell>{item.audience}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{item.status}</Badge>
                          </TableCell>
                          <TableCell>41</TableCell>
                          <TableCell>{renderMetricValue(item.id, 'deliveryRate', '95.3%', item.hubspotUnavailable, false, 'WhatsApp')}</TableCell>
                          <TableCell>{renderMetricValue(item.id, 'openRate', '—', item.hubspotUnavailable, true, 'WhatsApp')}</TableCell>
                          <TableCell>{renderMetricValue(item.id, 'clickRate', '—', item.hubspotUnavailable, true, 'WhatsApp')}</TableCell>
                          <TableCell>{item.date}</TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <p className="text-xs text-slate-500">
              Open rate, click rate and delivery rate are pulled from HubSpot. Data may update within 15 minutes of send.
            </p>

            {campaignRows.length === 0 && (
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="text-center py-12">
                  <Megaphone className="w-10 h-10 mx-auto mb-3 text-gray-300 opacity-30" />
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">No campaigns created for this event yet.</h3>
                  <Button
                    variant="outline"
                    onClick={() =>
                      onCreateCampaignForEvent?.({
                        id: webinar?.id || 'unknown-event',
                        name: webinar?.title || 'BSW Event',
                      })
                    }
                  >
                    + Create campaign
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="audit-log" className="mt-8">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <h3 className="text-sm font-bold text-slate-900">Event Audit Log</h3>
                <div className="h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category:</span>
                  <Select value={logCategoryFilter} onValueChange={setLogCategoryFilter}>
                    <SelectTrigger className="w-32 h-8 text-[11px] font-bold border-none bg-slate-50 hover:bg-slate-100 shadow-none">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Categories</SelectItem>
                      <SelectItem value="Status">Status</SelectItem>
                      <SelectItem value="Links">Links</SelectItem>
                      <SelectItem value="System">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                <Info className="h-3.5 w-3.5" />
                <span>Tracks all critical changes to this webinar event</span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-slate-100 bg-slate-50/50">
                    <TableHead className="w-[180px] h-10 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Date & Time</TableHead>
                    <TableHead className="h-10 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Category</TableHead>
                    <TableHead className="h-10 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Action</TableHead>
                    <TableHead className="h-10 text-[10px] uppercase font-bold text-slate-400 tracking-wider">User</TableHead>
                    <TableHead className="h-10 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Reason/Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs
                    .filter(log => logCategoryFilter === 'All' || log.category === logCategoryFilter)
                    .map((log) => (
                    <TableRow
                      key={log.id}
                      className="cursor-pointer hover:bg-slate-50 border-b border-slate-50 transition-colors"
                      onClick={() => toast.info(`${log.action}`)}
                    >
                      <TableCell className="py-4 text-[13px] font-medium text-slate-600 font-mono">
                        {log.date}
                      </TableCell>
                      <TableCell className="py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                          log.category === 'Status' ? "bg-blue-50 text-blue-600" :
                          log.category === 'Links' ? "bg-purple-50 text-purple-600" :
                          "bg-slate-100 text-slate-500"
                        )}>
                          {log.category}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          {log.action.includes('Status changed') ? (
                            <ListRestart className="h-3.5 w-3.5 text-blue-500" />
                          ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          )}
                          <span className="text-[13px] font-bold text-slate-900">{log.action}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black uppercase",
                            getAvatarColors(log.user.split(' ').map((n: string) => n[0]).join('').slice(0, 2))
                          )}>
                            {log.user.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="text-[13px] font-medium text-slate-700">{log.user}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <p className="text-[13px] text-slate-500 italic max-w-md">
                          "{log.reason}"
                        </p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Slide-in Panel */}
      <AnimatePresence>
        {isPanelOpen && selectedReg && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPanelOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[440px] max-w-[440px] bg-white shadow-2xl z-50 border-l flex flex-col overflow-hidden custom-scrollbar"
            >
              <div className="relative px-5 py-4 border-b border-gray-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPanelOpen(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
                <h2 className="text-base font-semibold text-gray-900 pr-10">Lead Details</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-8">
                <div className="space-y-8">
                  {/* Profile Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Client Profile</h3>
                      {!isEditingProfile ? (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1.5"
                          onClick={() => setIsEditingProfile(true)}
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-xs font-bold text-slate-500"
                            onClick={() => setIsEditingProfile(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            size="sm" 
                            className="h-8 text-xs font-bold bg-blue-600 hover:bg-blue-700"
                            onClick={handleSaveProfile}
                          >
                            Save
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-slate-400 uppercase">Name</Label>
                        {isEditingProfile ? (
                          <Input 
                            value={editForm.name} 
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="h-9 bg-white border-slate-200"
                          />
                        ) : (
                          <p className="text-sm font-semibold text-slate-900">{selectedReg.name}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-slate-400 uppercase">Email</Label>
                        {isEditingProfile ? (
                          <Input 
                            value={editForm.email} 
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="h-9 bg-white border-slate-200"
                          />
                        ) : (
                          <p className="text-sm font-semibold text-slate-900">{selectedReg.email}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-slate-400 uppercase">Mobile</Label>
                        {isEditingProfile ? (
                          <Input 
                            value={editForm.mobile} 
                            onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                            className="h-9 bg-white border-slate-200"
                          />
                        ) : (
                          <p className="text-sm font-semibold text-slate-900">{selectedReg.mobile}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Program Details Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Program Details</h3>
                    <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-slate-400 uppercase">Webinar Date</Label>
                          <p className="text-sm font-semibold text-slate-900">{selectedReg.webinarDate}</p>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-slate-400 uppercase">Lead Source</Label>
                          <p className="text-sm font-semibold text-slate-900">{selectedReg.leadSource}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-slate-400 uppercase">UTM Source</Label>
                          <p className="text-sm font-semibold text-slate-900">{selectedReg.utmSource}</p>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-slate-400 uppercase">UTM Medium</Label>
                          <p className="text-sm font-semibold text-slate-900">{selectedReg.utmMedium}</p>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-slate-400 uppercase">UTM Term</Label>
                          <p className="text-sm font-semibold text-slate-900">{selectedReg.utmTerm}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Payment Status</h3>
                      <div className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest",
                        selectedReg.payment === 'Captured' ? "bg-green-100 text-green-700" : 
                        "bg-red-100 text-red-600"
                      )}>
                        {selectedReg.payment} {selectedReg.payment === 'Captured' ? <Check className="h-2.5 w-2.5" /> : "✗"}
                      </div>
                    </div>

                    {selectedReg.payment === 'Failed' && (
                      <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex flex-col items-center gap-3">
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                        <p className="text-sm text-red-700 text-center font-medium">
                          No auto-capture possible for this failed transaction.
                        </p>
                        <Button 
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-10 shadow-lg shadow-red-600/20"
                          onClick={() => {
                            resetManualPaymentForm(selectedReg);
                            setShowManualPayment(true);
                          }}
                        >
                          Mark as manually paid
                        </Button>
                      </div>
                    )}

                    {selectedReg.paymentAuditTrail && selectedReg.paymentAuditTrail.length > 0 && (
                      <div className="space-y-3">
                        <Label className="text-[11px] font-bold text-slate-400 uppercase">Audit Trail</Label>
                        <div className="space-y-2">
                          {selectedReg.paymentAuditTrail.map((audit, i) => (
                            <div key={i} className="text-[12px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <div className="flex justify-between font-bold text-slate-700">
                                <span>{audit.action}</span>
                                <span className="text-slate-400 font-normal">{audit.date}</span>
                              </div>
                              <div className="text-slate-500">By: {audit.user}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Manual Payment Panel */}
      <AnimatePresence>
        {showManualPayment && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowManualPayment(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[440px] max-w-[440px] bg-white shadow-2xl z-[70] border-l flex flex-col overflow-hidden custom-scrollbar"
            >
              <div className="relative px-5 py-4 border-b border-gray-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowManualPayment(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
                <h2 className="text-base font-semibold text-gray-900 pr-10 font-sans">Add Manual Payment</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-8">

                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client Name</Label>
                      <Input 
                        value={manualPaymentForm.name} 
                        onChange={(e) => setManualPaymentForm({ ...manualPaymentForm, name: e.target.value })}
                        className="h-10 border-slate-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email</Label>
                      <Input 
                        value={manualPaymentForm.email} 
                        onChange={(e) => setManualPaymentForm({ ...manualPaymentForm, email: e.target.value })}
                        className="h-10 border-slate-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mobile</Label>
                      <Input 
                        value={manualPaymentForm.mobile} 
                        onChange={(e) => setManualPaymentForm({ ...manualPaymentForm, mobile: e.target.value })}
                        className="h-10 border-slate-200"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Amount</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                          <Input 
                            type="number"
                            value={manualPaymentForm.amount} 
                            onChange={(e) => setManualPaymentForm({ ...manualPaymentForm, amount: e.target.value })}
                            className="h-10 pl-7 border-slate-200"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Payment Date</Label>
                        <Input 
                          type="date"
                          value={manualPaymentForm.date} 
                          onChange={(e) => setManualPaymentForm({ ...manualPaymentForm, date: e.target.value })}
                          className="h-10 border-slate-200"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Payment Mode</Label>
                      <Select 
                        value={manualPaymentForm.mode} 
                        onValueChange={(v) => setManualPaymentForm({ ...manualPaymentForm, mode: v })}
                      >
                        <SelectTrigger className="h-10 border-slate-200">
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent className="z-[80]">
                          <SelectItem value="Card">Card</SelectItem>
                          <SelectItem value="UPI">UPI</SelectItem>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Notes</Label>
                      <textarea 
                        className="w-full min-h-[100px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        placeholder="Optional notes about this payment..."
                        value={manualPaymentForm.notes}
                        onChange={(e) => setManualPaymentForm({ ...manualPaymentForm, notes: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button 
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black text-base shadow-lg shadow-blue-600/20 rounded-xl"
                    onClick={() => {
                        if (!selectedReg) {
                            toast.success('Manual payment recorded.');
                            setShowManualPayment(false);
                            return;
                        }
                        handleAddManualPayment();
                    }}
                  >
                    Save payment
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Dialog open={showStatusConfirm} onOpenChange={setShowStatusConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              You are changing the status from <span className="font-bold text-slate-900">{currentStatus}</span> to <span className="font-bold text-blue-600">{pendingStatus}</span>.
              This action will be logged in the audit trail.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Reason for change {pendingStatus === 'Cancelled' ? '(Required)' : '(Optional)'}
              </Label>
              <Textarea
                id="reason"
                placeholder="Providing context helps the team understand this change..."
                className="min-h-[100px] border-slate-200 focus:ring-blue-500"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowStatusConfirm(false)} className="font-bold text-slate-500">
              Cancel
            </Button>
            <Button
              onClick={confirmStatusChange}
              className="bg-blue-600 hover:bg-blue-700 font-bold text-white px-6"
              disabled={pendingStatus === 'Cancelled' && !statusReason.trim()}
            >
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};
