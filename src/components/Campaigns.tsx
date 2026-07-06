import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Edit3, Inbox, Lock, MoreVertical, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Textarea } from './ui/textarea';
import { cn } from '../lib/utils';

type CampaignStatus = 'Scheduled' | 'Sending' | 'Sent' | 'Failed' | 'Cancelled';
type CampaignTab = 'All' | 'Scheduled' | 'Sent' | 'Failed';
type ProgramType = 'BSW' | 'BBS' | 'PACE' | 'All';
type ChannelType = 'Email' | 'WhatsApp' | 'Both';
type SegmentKey =
  | 'allRegistered'
  | 'attendedOnly'
  | 'nonAttendees'
  | 'paceBuyers'
  | 'nonPaceBuyers'
  | 'reinviteEligible';
type TemplateStatus = 'Active' | 'Inactive';
type PageMode = 'list' | 'create' | 'templates';
type TemplateEditorMode = 'create' | 'edit';

export interface Campaign {
  id: string;
  name: string;
  program: ProgramType | string;
  batch?: string;
  channel: ChannelType;
  templateId?: string;
  templateName?: string;
  status: CampaignStatus;
  sentOn?: string;
  scheduledFor?: string;
  createdBy: string;
  createdDate: string;
  sourceEventId?: string;
  sourceEventName?: string;
  audienceSegment: string;
  audienceCount: number;
  optedOutExcluded: number;
  estimatedReach: number;
  manuallyReviewed?: boolean;
  failureReason?: string;
  failedRecipientCount?: number;
  failedAt?: string;
  hubspotConfirmed?: boolean;
  metrics?: {
    email?: {
      deliveredCount?: string;
      openRate?: string;
      clickRate?: string;
      unsubscribeCount?: string;
    };
    whatsapp?: {
      deliveredCount?: string;
      deliveryRate?: string;
      clickRate?: string;
    };
  };
}

interface CampaignTemplate {
  id: string;
  name: string;
  channel: ChannelType;
  status: TemplateStatus;
  createdBy: string;
  createdDate: string;
  updatedAt: string;
  subject?: string;
  emailBody?: string;
  whatsappBody?: string;
}

interface TemplateAuditEntry {
  id: string;
  actor: string;
  templateName: string;
  action: 'Create' | 'Edit' | 'Deactivate' | 'Activate';
  timestamp: string;
}

export interface CampaignPrefillContext {
  programName: string;
  sourceEventId?: string;
  sourceEventName?: string;
  token: number;
}

interface CampaignsProps {
  prefillContext?: CampaignPrefillContext | null;
  onCampaignCreated?: (campaign: Campaign) => void;
}

const STATUS_TABS: CampaignTab[] = ['All', 'Scheduled', 'Sent', 'Failed'];

const SEGMENT_META: Record<SegmentKey, { label: string; count: number; optedOut: number }> = {
  allRegistered: { label: 'All Registered', count: 450, optedOut: 18 },
  attendedOnly: { label: 'Attended Only', count: 269, optedOut: 9 },
  nonAttendees: { label: 'Non-Attendees', count: 181, optedOut: 7 },
  paceBuyers: { label: 'PACE Buyers', count: 76, optedOut: 3 },
  nonPaceBuyers: { label: 'Non-PACE Buyers', count: 193, optedOut: 8 },
  reinviteEligible: { label: 'Re-invite Eligible', count: 42, optedOut: 2 },
};

const INITIAL_TEMPLATES: CampaignTemplate[] = [
  {
    id: 'TPL-001',
    name: 'BSW Reminder — WhatsApp',
    channel: 'WhatsApp',
    status: 'Active',
    createdBy: 'Ria Sharma',
    createdDate: '17 Apr 2026',
    updatedAt: '17 Apr 2026, 7:00 PM',
    whatsappBody: 'Your webinar starts soon. Join using your reminder link.',
  },
  {
    id: 'TPL-002',
    name: 'PACE Offer — Email',
    channel: 'Email',
    status: 'Active',
    createdBy: 'Amit Patel',
    createdDate: '20 Apr 2026',
    updatedAt: '20 Apr 2026, 3:45 PM',
    subject: 'Your next step with PACE',
    emailBody: 'Thanks for attending. Claim your PACE offer now.',
  },
  {
    id: 'TPL-003',
    name: 'Re-invite — Email + WhatsApp',
    channel: 'Both',
    status: 'Active',
    createdBy: 'Ria Sharma',
    createdDate: '24 Apr 2026',
    updatedAt: '24 Apr 2026, 8:00 PM',
    subject: 'Last chance to join the next batch',
    emailBody: 'We noticed you missed the last session. Rejoin now.',
    whatsappBody: 'You are invited again. Reserve your seat now.',
  },
];

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'CAM-001',
    name: 'BSW Apr W3 — Pre-webinar reminder',
    program: 'BSW',
    sourceEventId: 'BSW-APR-W3',
    sourceEventName: 'BSW April Week 3',
    channel: 'WhatsApp',
    templateId: 'TPL-001',
    templateName: 'BSW Reminder — WhatsApp',
    status: 'Sent',
    sentOn: '17 Apr 2026, 7:00 PM',
    createdBy: 'Ria Sharma',
    createdDate: '17 Apr 2026',
    audienceSegment: 'All Registered',
    audienceCount: 450,
    optedOutExcluded: 18,
    estimatedReach: 432,
    hubspotConfirmed: false,
    metrics: {
      whatsapp: {
        deliveredCount: '432',
        deliveryRate: '96.0%',
        clickRate: '12.8%',
      },
    },
  },
  {
    id: 'CAM-002',
    name: 'PACE June — BSW attendees',
    program: 'PACE',
    sourceEventName: 'PACE Batch 8',
    channel: 'Email',
    templateId: 'TPL-002',
    templateName: 'PACE Offer — Email',
    status: 'Scheduled',
    scheduledFor: '30 Apr 2026, 10:00 AM',
    createdBy: 'Amit Patel',
    createdDate: '25 Apr 2026',
    audienceSegment: 'Attended Only',
    audienceCount: 269,
    optedOutExcluded: 9,
    estimatedReach: 260,
    hubspotConfirmed: false,
    metrics: {
      email: {
        deliveredCount: 'Awaiting HubSpot sync',
        openRate: 'Awaiting HubSpot sync',
        clickRate: 'Awaiting HubSpot sync',
        unsubscribeCount: 'Awaiting HubSpot sync',
      },
    },
  },
  {
    id: 'CAM-003',
    name: 'PACE Direct — Abandoned',
    program: 'PACE',
    sourceEventName: 'PACE Batch 7',
    channel: 'Email',
    templateId: 'TPL-002',
    templateName: 'PACE Offer — Email',
    status: 'Failed',
    sentOn: '20 Apr 2026, 3:45 PM',
    createdBy: 'Amit Patel',
    createdDate: '20 Apr 2026',
    audienceSegment: 'Non-PACE Buyers',
    audienceCount: 38,
    optedOutExcluded: 8,
    estimatedReach: 30,
    manuallyReviewed: false,
    failureReason: 'HubSpot API connection timed out (504).',
    failedRecipientCount: 30,
    failedAt: '20 Apr 2026, 3:45 PM',
    hubspotConfirmed: false,
    metrics: {
      email: {
        deliveredCount: 'Awaiting HubSpot sync',
        openRate: 'Awaiting HubSpot sync',
        clickRate: 'Awaiting HubSpot sync',
        unsubscribeCount: 'Awaiting HubSpot sync',
      },
    },
  },
  {
    id: 'CAM-004',
    name: 'BBS Mumbai — Qualified follow-up',
    program: 'BBS',
    sourceEventName: 'BBS Mumbai May 2026',
    channel: 'Both',
    templateId: 'TPL-003',
    templateName: 'Re-invite — Email + WhatsApp',
    status: 'Cancelled',
    createdBy: 'Ria Sharma',
    createdDate: '26 Apr 2026',
    audienceSegment: 'Re-invite Eligible',
    audienceCount: 43,
    optedOutExcluded: 2,
    estimatedReach: 41,
    hubspotConfirmed: false,
    metrics: {
      email: {
        deliveredCount: 'Awaiting HubSpot sync',
        openRate: 'Awaiting HubSpot sync',
        clickRate: 'Awaiting HubSpot sync',
        unsubscribeCount: 'Awaiting HubSpot sync',
      },
      whatsapp: {
        deliveredCount: 'Awaiting HubSpot sync',
        deliveryRate: 'Awaiting HubSpot sync',
        clickRate: 'Awaiting HubSpot sync',
      },
    },
  },
];

const toDateTime = (date: string, time: string) => {
  if (!date || !time) return null;
  const iso = new Date(`${date}T${time}:00`);
  return Number.isNaN(iso.getTime()) ? null : iso;
};

const nowPretty = () =>
  new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

const statusClass = (status: CampaignStatus) => {
  if (status === 'Sent') return 'bg-emerald-100 text-emerald-700';
  if (status === 'Scheduled') return 'bg-blue-100 text-blue-700';
  if (status === 'Failed') return 'bg-red-100 text-red-700';
  if (status === 'Cancelled') return 'bg-slate-200 text-slate-700';
  return 'bg-amber-100 text-amber-700';
};

const channelClass = (channel: ChannelType) => {
  if (channel === 'Email') return 'bg-blue-100 text-blue-700';
  if (channel === 'WhatsApp') return 'bg-green-100 text-green-700';
  return 'bg-purple-100 text-purple-700';
};

const matchTemplateChannel = (template: CampaignTemplate, campaignChannel: ChannelType) => {
  if (campaignChannel === 'Both') return template.channel === 'Both';
  return template.channel === campaignChannel || template.channel === 'Both';
};

const prettyChannel = (channel: ChannelType) => (channel === 'Both' ? 'Both' : channel);

export const Campaigns: React.FC<CampaignsProps> = ({ prefillContext = null, onCampaignCreated }) => {
  const [mode, setMode] = useState<PageMode>('list');
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [templates, setTemplates] = useState<CampaignTemplate[]>(INITIAL_TEMPLATES);
  const [templateAuditLogs, setTemplateAuditLogs] = useState<TemplateAuditEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignTab>('All');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [pendingCancelCampaignId, setPendingCancelCampaignId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<'details' | 'performance'>('details');
  const [manualMetricInputs, setManualMetricInputs] = useState<Record<string, string>>({});

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [lockedProgramName, setLockedProgramName] = useState('');
  const [sourceEventId, setSourceEventId] = useState('');
  const [sourceEventName, setSourceEventName] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [program, setProgram] = useState<ProgramType | ''>('');
  const [linkedEvent, setLinkedEvent] = useState('');
  const [channel, setChannel] = useState<ChannelType | ''>('');
  const [segment, setSegment] = useState<SegmentKey | ''>('');
  const [templateId, setTemplateId] = useState('');
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [scheduleType, setScheduleType] = useState<'now' | 'later'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const [templatePanelOpen, setTemplatePanelOpen] = useState(false);
  const [templateEditorMode, setTemplateEditorMode] = useState<TemplateEditorMode>('create');
  const [editingTemplateId, setEditingTemplateId] = useState('');
  const [templateNameDraft, setTemplateNameDraft] = useState('');
  const [templateChannelDraft, setTemplateChannelDraft] = useState<ChannelType | ''>('');
  const [templateSubjectDraft, setTemplateSubjectDraft] = useState('');
  const [templateEmailBodyDraft, setTemplateEmailBodyDraft] = useState('');
  const [templateWhatsappBodyDraft, setTemplateWhatsappBodyDraft] = useState('');
  const [showTemplateEditorPreview, setShowTemplateEditorPreview] = useState(false);

  const filteredCampaigns = useMemo(() => {
    const rows = campaigns.filter((campaign) => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = statusFilter === 'All' || campaign.status === statusFilter;
      return matchesSearch && matchesTab;
    });
    if (statusFilter !== 'Failed') return rows;
    return rows.sort((a, b) => {
      const aUnreviewed = a.status === 'Failed' && !a.manuallyReviewed;
      const bUnreviewed = b.status === 'Failed' && !b.manuallyReviewed;
      if (aUnreviewed && !bUnreviewed) return -1;
      if (!aUnreviewed && bUnreviewed) return 1;
      return new Date(b.sentOn || b.createdDate).getTime() - new Date(a.sentOn || a.createdDate).getTime();
    });
  }, [campaigns, searchQuery, statusFilter]);

  const campaignCounts = useMemo(() => {
    const visibleForSummary = campaigns.filter((item) => item.status !== 'Cancelled');
    return {
      total: visibleForSummary.length,
      sent: visibleForSummary.filter((item) => item.status === 'Sent').length,
      scheduled: visibleForSummary.filter((item) => item.status === 'Scheduled').length,
      failed: visibleForSummary.filter((item) => item.status === 'Failed').length,
    };
  }, [campaigns]);

  const selectedSegment = segment ? SEGMENT_META[segment] : null;
  const optedOutCount = selectedSegment?.optedOut || 0;
  const estimatedReach = selectedSegment ? selectedSegment.count - selectedSegment.optedOut : 0;
  const selectedTemplate = templates.find((item) => item.id === templateId) || null;

  const availableTemplates = useMemo(
    () =>
      templates.filter(
        (item) => item.status === 'Active' && (channel ? matchTemplateChannel(item, channel) : true)
      ),
    [templates, channel]
  );

  const getTemplateUsedIn = (templateIdValue: string) =>
    campaigns.filter((campaign) => campaign.templateId === templateIdValue).length;

  const isTemplateUsedInScheduled = (templateIdValue: string) =>
    campaigns.some(
      (campaign) => campaign.templateId === templateIdValue && campaign.status === 'Scheduled'
    );

  const resetCreateForm = () => {
    setStep(1);
    setCampaignName('');
    setProgram('');
    setLinkedEvent('');
    setChannel('');
    setSegment('');
    setTemplateId('');
    setShowTemplatePreview(false);
    setScheduleType('now');
    setScheduledDate('');
    setScheduledTime('');
    setLockedProgramName('');
    setSourceEventId('');
    setSourceEventName('');
  };

  const openTemplateEditor = (modeValue: TemplateEditorMode, template?: CampaignTemplate) => {
    setTemplateEditorMode(modeValue);
    setEditingTemplateId(template?.id || '');
    setTemplateNameDraft(template?.name || '');
    setTemplateChannelDraft(template?.channel || (channel || ''));
    setTemplateSubjectDraft(template?.subject || '');
    setTemplateEmailBodyDraft(template?.emailBody || '');
    setTemplateWhatsappBodyDraft(template?.whatsappBody || '');
    setShowTemplateEditorPreview(false);
    setTemplatePanelOpen(true);
  };

  const saveTemplate = () => {
    if (!templateNameDraft.trim() || !templateChannelDraft) return;
    const requiresSubject = templateChannelDraft === 'Email' || templateChannelDraft === 'Both';
    const hasEmailBody =
      templateChannelDraft === 'Email' || templateChannelDraft === 'Both'
        ? templateEmailBodyDraft.trim().length > 0
        : true;
    const hasWhatsappBody =
      templateChannelDraft === 'WhatsApp' || templateChannelDraft === 'Both'
        ? templateWhatsappBodyDraft.trim().length > 0
        : true;
    if ((requiresSubject && !templateSubjectDraft.trim()) || !hasEmailBody || !hasWhatsappBody) {
      toast.error('Complete all required template fields before saving.');
      return;
    }

    const timestamp = nowPretty();
    if (templateEditorMode === 'edit' && editingTemplateId) {
      const target = templates.find((item) => item.id === editingTemplateId);
      setTemplates((prev) =>
        prev.map((item) =>
          item.id === editingTemplateId
            ? {
                ...item,
                name: templateNameDraft.trim(),
                channel: templateChannelDraft,
                subject: requiresSubject ? templateSubjectDraft.trim() : undefined,
                emailBody:
                  templateChannelDraft === 'Email' || templateChannelDraft === 'Both'
                    ? templateEmailBodyDraft.trim()
                    : undefined,
                whatsappBody:
                  templateChannelDraft === 'WhatsApp' || templateChannelDraft === 'Both'
                    ? templateWhatsappBodyDraft.trim()
                    : undefined,
                updatedAt: timestamp,
              }
            : item
        )
      );
      setTemplateAuditLogs((prev) => [
        {
          id: `tpl-log-${Date.now()}`,
          actor: 'Ria Sharma',
          templateName: target?.name || templateNameDraft.trim(),
          action: 'Edit',
          timestamp,
        },
        ...prev,
      ]);
      toast.success('Template updated.');
    } else {
      const next: CampaignTemplate = {
        id: `TPL-${Date.now()}`,
        name: templateNameDraft.trim(),
        channel: templateChannelDraft,
        status: 'Active',
        createdBy: 'Ria Sharma',
        createdDate: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        updatedAt: timestamp,
        subject: requiresSubject ? templateSubjectDraft.trim() : undefined,
        emailBody:
          templateChannelDraft === 'Email' || templateChannelDraft === 'Both'
            ? templateEmailBodyDraft.trim()
            : undefined,
        whatsappBody:
          templateChannelDraft === 'WhatsApp' || templateChannelDraft === 'Both'
            ? templateWhatsappBodyDraft.trim()
            : undefined,
      };
      setTemplates((prev) => [next, ...prev]);
      setTemplateId(next.id);
      setTemplateAuditLogs((prev) => [
        {
          id: `tpl-log-${Date.now()}`,
          actor: 'Ria Sharma',
          templateName: next.name,
          action: 'Create',
          timestamp,
        },
        ...prev,
      ]);
      toast.success('Template created and selected.');
    }
    setTemplatePanelOpen(false);
  };

  const toggleTemplateStatus = (templateItem: CampaignTemplate, next: TemplateStatus) => {
    if (next === 'Inactive' && isTemplateUsedInScheduled(templateItem.id)) return;
    const action = next === 'Active' ? 'Activate' : 'Deactivate';
    const timestamp = nowPretty();
    setTemplates((prev) =>
      prev.map((item) => (item.id === templateItem.id ? { ...item, status: next, updatedAt: timestamp } : item))
    );
    setTemplateAuditLogs((prev) => [
      {
        id: `tpl-log-${Date.now()}`,
        actor: 'Ria Sharma',
        templateName: templateItem.name,
        action,
        timestamp,
      },
      ...prev,
    ]);
    toast.success(`Template ${next === 'Active' ? 'activated' : 'deactivated'}.`);
  };

  const confirmCancelScheduledCampaign = () => {
    if (!pendingCancelCampaignId) return;
    setCampaigns((prev) =>
      prev.map((item) =>
        item.id === pendingCancelCampaignId ? { ...item, status: 'Cancelled' } : item
      )
    );
    setSelectedCampaign((prev) =>
      prev && prev.id === pendingCancelCampaignId ? { ...prev, status: 'Cancelled' } : prev
    );
    setPendingCancelCampaignId(null);
    toast.success('Campaign cancelled.');
  };

  const markFailedAsReviewed = (campaignId: string) => {
    setCampaigns((prev) => prev.map((item) => (item.id === campaignId ? { ...item, manuallyReviewed: true } : item)));
    setSelectedCampaign((prev) => (prev && prev.id === campaignId ? { ...prev, manuallyReviewed: true } : prev));
    toast.success('Marked as reviewed.');
  };

  const metricKey = (campaignId: string, channelKey: 'email' | 'whatsapp', field: string) =>
    `${campaignId}-${channelKey}-${field}`;

  const getMetricDisplay = (
    campaign: Campaign,
    channelKey: 'email' | 'whatsapp',
    field: string
  ) => {
    const key = metricKey(campaign.id, channelKey, field);
    const manual = manualMetricInputs[key];
    const fromData =
      channelKey === 'email'
        ? campaign.metrics?.email?.[field as keyof NonNullable<Campaign['metrics']>['email']]
        : campaign.metrics?.whatsapp?.[field as keyof NonNullable<Campaign['metrics']>['whatsapp']];
    return manual || fromData || 'Awaiting HubSpot sync';
  };

  const finalizeCampaign = () => {
    if (!campaignName.trim() || !(lockedProgramName || program) || !channel || !selectedSegment || !templateId) {
      return;
    }
    if (scheduleType === 'later') {
      const dt = toDateTime(scheduledDate, scheduledTime);
      if (!dt || dt <= new Date()) {
        toast.error('Scheduled datetime must be in the future.');
        return;
      }
    }

    if (
      scheduleType === 'now' &&
      !window.confirm(
        `You are about to send this campaign to ${estimatedReach} contacts. This cannot be undone. Confirm?`
      )
    ) {
      return;
    }

    const resolvedProgram = lockedProgramName || program;
    const selected = templates.find((item) => item.id === templateId);
    const created: Campaign = {
      id: `CAM-${Date.now()}`,
      name: campaignName.trim(),
      program: resolvedProgram,
      sourceEventId: sourceEventId || undefined,
      sourceEventName: linkedEvent || sourceEventName || undefined,
      channel,
      templateId,
      templateName: selected?.name,
      status: scheduleType === 'now' ? 'Sending' : 'Scheduled',
      sentOn: scheduleType === 'now' ? nowPretty() : undefined,
      scheduledFor: scheduleType === 'later' ? toDateTime(scheduledDate, scheduledTime)?.toLocaleString('en-GB') : undefined,
      createdBy: 'Ria Sharma',
      createdDate: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      audienceSegment: selectedSegment.label,
      audienceCount: selectedSegment.count,
      optedOutExcluded: selectedSegment.optedOut,
      estimatedReach,
    };

    setCampaigns((prev) => [created, ...prev]);
    onCampaignCreated?.(created);
    setMode('list');
    resetCreateForm();

    if (scheduleType === 'later') {
      toast.success('Campaign scheduled successfully.');
      return;
    }

    setTimeout(() => {
      const nextStatus: CampaignStatus = estimatedReach > 0 ? 'Sent' : 'Failed';
      setCampaigns((prev) =>
        prev.map((item) =>
          item.id === created.id
            ? { ...item, status: nextStatus, sentOn: nowPretty() }
            : item
        )
      );
      if (nextStatus === 'Sent') toast.success('Campaign sent successfully.');
      else toast.error('Campaign failed to send.');
    }, 900);
  };

  useEffect(() => {
    if (!prefillContext) return;
    resetCreateForm();
    setMode('create');
    setLockedProgramName(prefillContext.programName);
    setSourceEventId(prefillContext.sourceEventId || '');
    setSourceEventName(prefillContext.sourceEventName || '');
    setLinkedEvent(prefillContext.sourceEventName || '');
    setSegment('allRegistered');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillContext?.token]);

  if (mode === 'templates') {
    return (
      <div className="p-6 max-w-[1200px] mx-auto space-y-6">
        <div className="sticky top-0 z-20 bg-white py-8 space-y-4">
          <button className="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-1" onClick={() => setMode('list')}>
            <ChevronLeft className="h-4 w-4" /> Back to Campaigns
          </button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Manage Templates</h1>
              <p className="text-slate-500 mt-1">Create, edit and control template availability for campaigns.</p>
            </div>
            <Button className="h-10 px-4 font-bold" onClick={() => openTemplateEditor('create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Template
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Template Name</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Used In</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((templateItem) => {
                const usedIn = getTemplateUsedIn(templateItem.id);
                const blockedDeactivate = isTemplateUsedInScheduled(templateItem.id);
                return (
                  <TableRow key={templateItem.id}>
                    <TableCell className="font-medium text-slate-900">{templateItem.name}</TableCell>
                    <TableCell>
                      <Badge className={cn('hover:opacity-100', channelClass(templateItem.channel))}>
                        {prettyChannel(templateItem.channel)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-700">{usedIn} campaigns</TableCell>
                    <TableCell>
                      <Badge className={templateItem.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}>
                        {templateItem.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-700">{templateItem.createdBy}</TableCell>
                    <TableCell className="text-slate-700">{templateItem.createdDate}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openTemplateEditor('edit', templateItem)}>Edit</DropdownMenuItem>
                          {templateItem.status === 'Active' ? (
                            <DropdownMenuItem
                              disabled={blockedDeactivate}
                              title={
                                blockedDeactivate
                                  ? 'Cannot deactivate — this template is used in a scheduled campaign.'
                                  : undefined
                              }
                              onClick={() => toggleTemplateStatus(templateItem, 'Inactive')}
                            >
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => toggleTemplateStatus(templateItem, 'Active')}>
                              Activate
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
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Template Audit Trail</h3>
          {templateAuditLogs.length === 0 ? (
            <p className="text-sm text-slate-500">No template actions yet.</p>
          ) : (
            <div className="space-y-2">
              {templateAuditLogs.map((entry) => (
                <div key={entry.id} className="text-sm text-slate-700 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  {entry.actor} • {entry.action} • {entry.templateName} • {entry.timestamp}
                </div>
              ))}
            </div>
          )}
        </div>

        <TemplateEditorSheet
          open={templatePanelOpen}
          onOpenChange={setTemplatePanelOpen}
          mode={templateEditorMode}
          name={templateNameDraft}
          setName={setTemplateNameDraft}
          channel={templateChannelDraft}
          setChannel={setTemplateChannelDraft}
          subject={templateSubjectDraft}
          setSubject={setTemplateSubjectDraft}
          emailBody={templateEmailBodyDraft}
          setEmailBody={setTemplateEmailBodyDraft}
          whatsappBody={templateWhatsappBodyDraft}
          setWhatsappBody={setTemplateWhatsappBodyDraft}
          previewOpen={showTemplateEditorPreview}
          setPreviewOpen={setShowTemplateEditorPreview}
          onSave={saveTemplate}
        />
      </div>
    );
  }

  if (mode === 'create') {
    const step1Valid = Boolean(campaignName.trim() && (lockedProgramName || program) && channel);
    const step2Valid = Boolean(segment);
    const step3Valid = Boolean(templateId);
    const scheduleDateTime = toDateTime(scheduledDate, scheduledTime);
    const step4Valid =
      scheduleType === 'now' || (scheduleType === 'later' && !!scheduleDateTime && scheduleDateTime > new Date());
    return (
      <div className="p-6 max-w-[1200px] mx-auto space-y-6">
        <div className="sticky top-0 z-20 bg-white py-8 space-y-4">
          <button className="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-1" onClick={() => { setMode('list'); resetCreateForm(); }}>
            <ChevronLeft className="h-4 w-4" /> Back to Campaigns
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Create Campaign</h1>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 flex-wrap">
            <StepPill index={1} label="Basics" active={step === 1} done={step > 1} />
            <StepPill index={2} label="Audience" active={step === 2} done={step > 2} />
            <StepPill index={3} label="Template" active={step === 3} done={step > 3} />
            <StepPill index={4} label="Schedule" active={step === 4} done={false} />
          </div>
        </div>

        {step === 1 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <InputRow label="Campaign Name *">
              <Input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} className="h-11" />
            </InputRow>
            <InputRow label="Program *">
              {lockedProgramName ? (
                <div className="h-11 rounded-md border border-slate-200 bg-slate-50 px-3 flex items-center justify-between text-sm text-slate-700">
                  {lockedProgramName}
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
              ) : (
                <Select value={program || undefined} onValueChange={(value) => setProgram(value as ProgramType)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BSW">BSW</SelectItem>
                    <SelectItem value="BBS">BBS</SelectItem>
                    <SelectItem value="PACE">PACE</SelectItem>
                    <SelectItem value="All">All</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </InputRow>
            <InputRow label="Linked Event / Batch (optional)">
              {sourceEventName ? (
                <div className="h-11 rounded-md border border-slate-200 bg-slate-50 px-3 flex items-center justify-between text-sm text-slate-700">
                  {linkedEvent || sourceEventName}
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
              ) : (
                <Input
                  value={linkedEvent}
                  onChange={(e) => setLinkedEvent(e.target.value)}
                  placeholder="Event or batch name"
                  className="h-11"
                />
              )}
            </InputRow>
            <InputRow label="Channel *">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(['Email', 'WhatsApp', 'Both'] as ChannelType[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setChannel(option);
                      setTemplateId('');
                    }}
                    className={cn(
                      'h-12 rounded-xl border text-sm font-semibold',
                      channel === option
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-700'
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </InputRow>
            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" onClick={() => { setMode('list'); resetCreateForm(); }}>Cancel</Button>
              <Button disabled={!step1Valid} onClick={() => setStep(2)}>Next</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <InputRow label="Audience Segment *">
              <Select value={segment || undefined} onValueChange={(value) => setSegment(value as SegmentKey)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select audience segment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allRegistered">All Registered</SelectItem>
                  <SelectItem value="attendedOnly">Attended Only</SelectItem>
                  <SelectItem value="nonAttendees">Non-Attendees</SelectItem>
                  <SelectItem value="paceBuyers">PACE Buyers</SelectItem>
                  <SelectItem value="nonPaceBuyers">Non-PACE Buyers</SelectItem>
                  <SelectItem value="reinviteEligible">Re-invite Eligible</SelectItem>
                </SelectContent>
              </Select>
            </InputRow>
            <p className="text-sm text-slate-600">
              {optedOutCount} opted-out contacts will be automatically excluded from this send.
            </p>
            <p className="text-sm font-semibold text-slate-800">Estimated reach: {estimatedReach} contacts</p>
            <p className="text-xs text-slate-500">
              Opt-out suppression is enforced server-side at send time.
            </p>
            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button disabled={!step2Valid} onClick={() => setStep(3)}>Next</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <InputRow label="Template *">
              <Select value={templateId || undefined} onValueChange={setTemplateId}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select active template" />
                </SelectTrigger>
                <SelectContent>
                  {availableTemplates.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="__create_new__">+ Create new template</SelectItem>
                </SelectContent>
              </Select>
            </InputRow>
            {templateId === '__create_new__' && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                Creating a new template opens in a side panel.
                <div className="mt-2">
                  <Button size="sm" className="h-8" onClick={() => { setTemplateId(''); openTemplateEditor('create'); }}>
                    Open template editor
                  </Button>
                </div>
              </div>
            )}
            {selectedTemplate && (
              <>
                <Button variant="outline" className="h-9" onClick={() => setShowTemplatePreview((prev) => !prev)}>
                  {showTemplatePreview ? 'Hide preview' : 'Preview template'}
                </Button>
                {showTemplatePreview && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-sm">
                    {selectedTemplate.subject && <p><span className="font-semibold">Subject:</span> {selectedTemplate.subject}</p>}
                    {selectedTemplate.emailBody && <p><span className="font-semibold">Email:</span> {selectedTemplate.emailBody}</p>}
                    {selectedTemplate.whatsappBody && <p><span className="font-semibold">WhatsApp:</span> {selectedTemplate.whatsappBody}</p>}
                  </div>
                )}
              </>
            )}
            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button disabled={!step3Valid} onClick={() => setStep(4)}>Next</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="space-y-2">
              <button
                className={cn('w-full rounded-xl border p-3 text-left text-sm', scheduleType === 'now' ? 'border-blue-600 bg-blue-50' : 'border-slate-200')}
                onClick={() => setScheduleType('now')}
              >
                Send Now
              </button>
              <button
                className={cn('w-full rounded-xl border p-3 text-left text-sm', scheduleType === 'later' ? 'border-blue-600 bg-blue-50' : 'border-slate-200')}
                onClick={() => setScheduleType('later')}
              >
                Schedule for Later
              </button>
            </div>
            {scheduleType === 'later' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InputRow label="Date">
                  <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
                </InputRow>
                <InputRow label="Time">
                  <Input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
                </InputRow>
              </div>
            )}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 space-y-1">
              <p>Audience selected: {selectedSegment?.label || '—'}</p>
              <p>Estimated send count: {estimatedReach}</p>
              <p>Opted-out excluded: {optedOutCount}</p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
              <Button disabled={!step4Valid} onClick={finalizeCampaign}>
                {scheduleType === 'now' ? 'Confirm Send' : 'Confirm Schedule'}
              </Button>
            </div>
          </div>
        )}

        <TemplateEditorSheet
          open={templatePanelOpen}
          onOpenChange={setTemplatePanelOpen}
          mode={templateEditorMode}
          name={templateNameDraft}
          setName={setTemplateNameDraft}
          channel={templateChannelDraft}
          setChannel={setTemplateChannelDraft}
          subject={templateSubjectDraft}
          setSubject={setTemplateSubjectDraft}
          emailBody={templateEmailBodyDraft}
          setEmailBody={setTemplateEmailBodyDraft}
          whatsappBody={templateWhatsappBodyDraft}
          setWhatsappBody={setTemplateWhatsappBodyDraft}
          previewOpen={showTemplateEditorPreview}
          setPreviewOpen={setShowTemplateEditorPreview}
          onSave={saveTemplate}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      <div className="sticky top-0 z-20 bg-white py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Campaigns</h1>
            <p className="text-slate-500 mt-1">Create and send targeted email and WhatsApp campaigns.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-10 px-4 font-bold" onClick={() => setMode('templates')}>
              Manage Templates
            </Button>
            <Button className="h-10 px-4 font-bold" onClick={() => setMode('create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard label="Total Campaigns" value={String(campaignCounts.total)} />
        <SummaryCard label="Sent" value={String(campaignCounts.sent)} />
        <SummaryCard label="Scheduled" value={String(campaignCounts.scheduled)} />
        <SummaryCard label="Failed" value={String(campaignCounts.failed)} valueClassName="text-red-600" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by campaign name..."
            className="pl-10 h-10 bg-white border-slate-200 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1 border border-slate-100 w-fit max-w-full overflow-x-auto">
          {STATUS_TABS.map((tab) => (
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
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Campaign Name</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Linked Event</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCampaigns.length > 0 ? (
              filteredCampaigns.map((campaign) => (
                <TableRow
                  key={campaign.id}
                  onClick={() => setSelectedCampaign(campaign)}
                  className="cursor-pointer hover:bg-slate-50/80"
                >
                  <TableCell className="font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      {campaign.status === 'Failed' && !campaign.manuallyReviewed && (
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                      )}
                      <span>{campaign.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-700">{campaign.program}</TableCell>
                  <TableCell className="text-slate-700">{campaign.sourceEventName || '—'}</TableCell>
                  <TableCell>
                    <Badge className={cn('hover:opacity-100', channelClass(campaign.channel))}>
                      {prettyChannel(campaign.channel)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('hover:opacity-100', statusClass(campaign.status))}>
                      {campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {campaign.status === 'Scheduled' ? campaign.scheduledFor || '—' : campaign.sentOn || '—'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-72 text-center">
                  <div className="text-center py-12">
                    <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-300 opacity-30" />
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">No campaigns found.</h3>
                    <p className="text-xs text-gray-400 mb-4 max-w-sm mx-auto">
                      Try changing filters or create a new campaign.
                    </p>
                    <Button onClick={() => setMode('create')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Campaign
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selectedCampaign} onOpenChange={(open) => !open && setSelectedCampaign(null)}>
        <SheetContent className="gap-0 p-0">
          {selectedCampaign && (
            <>
              <SheetHeader className="relative">
                <SheetTitle>{selectedCampaign.name}</SheetTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={channelClass(selectedCampaign.channel)}>{prettyChannel(selectedCampaign.channel)}</Badge>
                  <Badge className={statusClass(selectedCampaign.status)}>{selectedCampaign.status}</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Created by {selectedCampaign.createdBy} · {selectedCampaign.createdDate}
                </p>
              </SheetHeader>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1 border border-slate-100 w-fit">
                  <button
                    className={cn(
                      'h-8 px-3 rounded-lg text-xs font-bold',
                      detailTab === 'details' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
                    )}
                    onClick={() => setDetailTab('details')}
                  >
                    Details
                  </button>
                  <button
                    className={cn(
                      'h-8 px-3 rounded-lg text-xs font-bold',
                      detailTab === 'performance' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
                    )}
                    onClick={() => setDetailTab('performance')}
                  >
                    Performance
                  </button>
                </div>

                {detailTab === 'details' ? (
                  <div className="space-y-3">
                    <DetailRow label="Program" value={String(selectedCampaign.program)} />
                    <DetailRow label="Linked event" value={selectedCampaign.sourceEventName || '—'} />
                    <DetailRow label="Channel" value={selectedCampaign.channel} />
                    <DetailRow label="Template" value={selectedCampaign.templateName || '—'} />
                    <DetailRow label="Audience segment" value={selectedCampaign.audienceSegment} />
                    <DetailRow label="Audience selected" value={`${selectedCampaign.audienceCount} contacts`} />
                    <DetailRow label="Opted-out excluded" value={`${selectedCampaign.optedOutExcluded} contacts`} />
                    <DetailRow label="Estimated reach" value={`${selectedCampaign.estimatedReach} contacts`} />
                    <DetailRow
                      label={selectedCampaign.status === 'Scheduled' ? 'Scheduled for' : 'Sent on'}
                      value={
                        selectedCampaign.status === 'Scheduled'
                          ? selectedCampaign.scheduledFor || '—'
                          : selectedCampaign.sentOn || '—'
                      }
                    />
                    {selectedCampaign.status === 'Failed' && (
                      <>
                        <DetailRow label="Failure reason" value={selectedCampaign.failureReason || '—'} />
                        <DetailRow label="Failed recipient count" value={String(selectedCampaign.failedRecipientCount || 0)} />
                        <DetailRow label="Failure timestamp" value={selectedCampaign.failedAt || '—'} />
                        {!selectedCampaign.manuallyReviewed && (
                          <Button
                            variant="outline"
                            className="h-9 text-red-700 border-red-200 bg-red-50 hover:bg-red-100"
                            onClick={() => markFailedAsReviewed(selectedCampaign.id)}
                          >
                            Mark as Reviewed
                          </Button>
                        )}
                      </>
                    )}
                    {selectedCampaign.status === 'Scheduled' && (
                      <Button
                        variant="outline"
                        className="h-9 text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100"
                        onClick={() => setPendingCancelCampaignId(selectedCampaign.id)}
                      >
                        Cancel campaign
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedCampaign.channel === 'Email' && (
                      <MetricGroup
                        title="Email Metrics"
                        rows={[
                          { key: 'deliveredCount', label: 'Delivered Count' },
                          { key: 'openRate', label: 'Open Rate (%)' },
                          { key: 'clickRate', label: 'Click Rate (%)' },
                          { key: 'unsubscribeCount', label: 'Unsubscribe Count' },
                        ]}
                        campaign={selectedCampaign}
                        channel="email"
                        getMetricDisplay={getMetricDisplay}
                        metricKey={metricKey}
                        setManualMetricInputs={setManualMetricInputs}
                      />
                    )}
                    {selectedCampaign.channel === 'WhatsApp' && (
                      <MetricGroup
                        title="WhatsApp Metrics"
                        rows={[
                          { key: 'deliveredCount', label: 'Delivered Count' },
                          { key: 'deliveryRate', label: 'Delivery Rate (%)' },
                          { key: 'clickRate', label: 'Click Rate (%)' },
                        ]}
                        campaign={selectedCampaign}
                        channel="whatsapp"
                        getMetricDisplay={getMetricDisplay}
                        metricKey={metricKey}
                        setManualMetricInputs={setManualMetricInputs}
                      />
                    )}
                    {selectedCampaign.channel === 'Both' && (
                      <>
                        <MetricGroup
                          title="Email Metrics"
                          rows={[
                            { key: 'deliveredCount', label: 'Delivered Count' },
                            { key: 'openRate', label: 'Open Rate (%)' },
                            { key: 'clickRate', label: 'Click Rate (%)' },
                            { key: 'unsubscribeCount', label: 'Unsubscribe Count' },
                          ]}
                          campaign={selectedCampaign}
                          channel="email"
                          getMetricDisplay={getMetricDisplay}
                          metricKey={metricKey}
                          setManualMetricInputs={setManualMetricInputs}
                        />
                        <MetricGroup
                          title="WhatsApp Metrics"
                          rows={[
                            { key: 'deliveredCount', label: 'Delivered Count' },
                            { key: 'deliveryRate', label: 'Delivery Rate (%)' },
                            { key: 'clickRate', label: 'Click Rate (%)' },
                          ]}
                          campaign={selectedCampaign}
                          channel="whatsapp"
                          getMetricDisplay={getMetricDisplay}
                          metricKey={metricKey}
                          setManualMetricInputs={setManualMetricInputs}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog
        open={Boolean(pendingCancelCampaignId)}
        onOpenChange={(open) => {
          if (!open) setPendingCancelCampaignId(null);
        }}
      >
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Cancel scheduled campaign?</DialogTitle>
            <DialogDescription>
              Cancelling this campaign will stop it from sending. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingCancelCampaignId(null)}>
              Keep Scheduled
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmCancelScheduledCampaign}
            >
              Confirm Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const TemplateEditorSheet = ({
  open,
  onOpenChange,
  mode,
  name,
  setName,
  channel,
  setChannel,
  subject,
  setSubject,
  emailBody,
  setEmailBody,
  whatsappBody,
  setWhatsappBody,
  previewOpen,
  setPreviewOpen,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: TemplateEditorMode;
  name: string;
  setName: (value: string) => void;
  channel: ChannelType | '';
  setChannel: (value: ChannelType | '') => void;
  subject: string;
  setSubject: (value: string) => void;
  emailBody: string;
  setEmailBody: (value: string) => void;
  whatsappBody: string;
  setWhatsappBody: (value: string) => void;
  previewOpen: boolean;
  setPreviewOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  onSave: () => void;
}) => {
  const showSubject = channel === 'Email' || channel === 'Both';
  const showEmailEditor = channel === 'Email' || channel === 'Both';
  const showWhatsappEditor = channel === 'WhatsApp' || channel === 'Both';
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="gap-0 p-0">
        <SheetHeader className="relative">
          <SheetTitle>{mode === 'create' ? 'Create Template' : 'Edit Template'}</SheetTitle>
        </SheetHeader>
        <div className="p-6 space-y-4 overflow-y-auto h-[calc(100%-84px)]">
          <InputRow label="Template Name *">
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
          </InputRow>
          <InputRow label="Channel *">
            <Select value={channel || undefined} onValueChange={(value) => setChannel(value as ChannelType)}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                <SelectItem value="Both">Both</SelectItem>
              </SelectContent>
            </Select>
          </InputRow>
          {showSubject && (
            <InputRow label="Subject Line *">
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="h-11" />
            </InputRow>
          )}
          {showEmailEditor && (
            <InputRow label="Email Body *">
              <Textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Supports text, links, images, documents, buttons, and video links."
                className="min-h-[120px]"
              />
            </InputRow>
          )}
          {showWhatsappEditor && (
            <InputRow label="WhatsApp Body *">
              <Textarea
                value={whatsappBody}
                onChange={(e) => setWhatsappBody(e.target.value)}
                placeholder="Supports text, links, images, documents, buttons, and video links."
                className="min-h-[120px]"
              />
            </InputRow>
          )}
          <Button variant="outline" className="h-9" onClick={() => setPreviewOpen((prev) => !prev)}>
            {previewOpen ? 'Hide Preview' : 'Preview'}
          </Button>
          {previewOpen && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-sm">
              {showSubject && <p><span className="font-semibold">Subject:</span> {subject || '—'}</p>}
              {showEmailEditor && <p><span className="font-semibold">Email:</span> {emailBody || '—'}</p>}
              {showWhatsappEditor && <p><span className="font-semibold">WhatsApp:</span> {whatsappBody || '—'}</p>}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={onSave}>Save Template</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const InputRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-slate-700">{label}</label>
    {children}
  </div>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
    <span className="text-slate-500">{label}</span>
    <span className="text-slate-900 font-medium">{value}</span>
  </div>
);

const MetricGroup = ({
  title,
  rows,
  campaign,
  channel,
  getMetricDisplay,
  metricKey,
  setManualMetricInputs,
}: {
  title: string;
  rows: Array<{ key: string; label: string }>;
  campaign: Campaign;
  channel: 'email' | 'whatsapp';
  getMetricDisplay: (campaign: Campaign, channelKey: 'email' | 'whatsapp', field: string) => string;
  metricKey: (campaignId: string, channelKey: 'email' | 'whatsapp', field: string) => string;
  setManualMetricInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
    <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
    {rows.map((row) => {
      const value = getMetricDisplay(campaign, channel, row.key);
      const showPlaceholder = value === 'Awaiting HubSpot sync';
      const key = metricKey(campaign.id, channel, row.key);
      return (
        <div key={row.key} className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
          <span className="text-sm text-slate-600">{row.label}</span>
          <div className="flex items-center gap-2">
            {showPlaceholder ? (
              <>
                <span className="text-xs text-slate-400">Awaiting HubSpot sync</span>
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700"
                  onClick={() => {
                    const entered = window.prompt(`Enter ${row.label}`, '');
                    if (entered === null) return;
                    setManualMetricInputs((prev) => ({ ...prev, [key]: entered.trim() || prev[key] || '' }));
                  }}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <span className="text-sm font-semibold text-slate-900">{value}</span>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

const SummaryCard = ({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4">
    <p className="text-sm text-slate-500">{label}</p>
    <p className={cn('text-2xl font-bold text-slate-900 mt-1', valueClassName)}>{value}</p>
  </div>
);

const StepPill = ({
  index,
  label,
  active,
  done,
}: {
  index: number;
  label: string;
  active: boolean;
  done: boolean;
}) => (
  <div className={cn(
    'inline-flex items-center gap-2 rounded-full border px-3 py-1.5',
    active ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-600'
  )}>
    <span
      className={cn(
        'h-5 w-5 rounded-full inline-flex items-center justify-center text-[11px] font-bold',
        done ? 'bg-emerald-100 text-emerald-700' : active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
      )}
    >
      {index}
    </span>
    <span>{label}</span>
  </div>
);

export default Campaigns;
