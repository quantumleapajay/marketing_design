import React, { useEffect, useMemo, useState } from 'react';
import { Search, SearchX, X } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

const PAGE_SIZE = 50;
const TWO_YEARS_DAYS = 730;
const EXPIRING_WINDOW_DAYS = 30;
const TEAM_AUDIT_ACCESS_KEY = 'audit_log_access_marketing_team';

const MODULE_OPTIONS = ['All', 'BSW', 'BBS', 'PACE', 'Campaigns', 'Settings', 'Transactions', 'Digital Products'];
const ACTION_OPTIONS = ['All', 'Create', 'Edit', 'Delete', 'Opt-Out', 'Opt-In', 'Export', 'Login', 'Deactivate', 'Campaign Send', 'Refund', 'Batch Change'];
const RECORD_TYPE_OPTIONS = ['All', 'Lead', 'Batch', 'Payment', 'Invoice', 'Campaign', 'Link', 'UTM', 'User'];

const BASE_ENTRIES = [
  { id: '1', actionDescription: 'Created BSW webinar', performedByName: 'Ria Sharma', performedByRole: 'Marketing Head', isSystem: false, module: 'BSW', recordAffected: 'BSW May Week 1', oldValue: '-', newValue: 'Created with 250 capacity', actionType: 'Create', recordType: 'Batch', timestampValue: '2026-05-04T09:20:00.000Z' },
  { id: '2', actionDescription: 'Webhook sync completed', performedByName: 'System', performedByRole: 'System', isSystem: true, module: 'Campaigns', recordAffected: 'April Meta Retargeting', oldValue: 'Sync pending', newValue: 'Sync completed', actionType: 'Campaign Send', recordType: 'Campaign', timestampValue: '2026-05-04T13:20:00.000Z' },
  { id: '3', actionDescription: 'Invoice generated', performedByName: 'System', performedByRole: 'System', isSystem: true, module: 'Transactions', recordAffected: 'Invoice #INV-2026-041', oldValue: 'Draft', newValue: 'Issued', actionType: 'Create', recordType: 'Invoice', permanentRetention: true, timestampValue: '2024-05-10T10:30:00.000Z' },
  { id: '4', actionDescription: 'Payment status updated', performedByName: 'Amit Patel', performedByRole: 'Marketing Team Member', isSystem: false, module: 'Transactions', recordAffected: 'Payment #PAY-2193', oldValue: 'Captured', newValue: 'Refunded', actionType: 'Refund', recordType: 'Payment', permanentRetention: true, timestampValue: '2024-04-09T10:45:00.000Z' },
  { id: '5', actionDescription: 'Updated UTM source', performedByName: 'Amit Patel', performedByRole: 'Marketing Team Member', isSystem: false, module: 'Settings', recordAffected: 'UTM: Meta-Remarketing', oldValue: 'google', newValue: 'facebook', actionType: 'Edit', recordType: 'UTM', timestampValue: '2026-05-03T06:10:00.000Z' },
  { id: '6', actionDescription: 'Opt-out request recorded', performedByName: 'System', performedByRole: 'System', isSystem: true, module: 'Campaigns', recordAffected: 'Lead: Priya Nair', oldValue: 'Subscribed', newValue: 'Opted out', actionType: 'Opt-Out', recordType: 'Lead', permanentRetention: true, timestampValue: '2023-05-04T08:00:00.000Z' },
  { id: '7', actionDescription: 'Exported lead list', performedByName: 'Ria Sharma', performedByRole: 'Marketing Head', isSystem: false, module: 'Digital Products', recordAffected: 'Copywriting Masterclass', oldValue: '-', newValue: 'Exported 231 leads', actionType: 'Export', recordType: 'Lead', timestampValue: '2026-05-01T11:00:00.000Z' },
  { id: '8', actionDescription: 'Batch reassigned', performedByName: 'Ria Sharma', performedByRole: 'Marketing Head', isSystem: false, module: 'PACE', recordAffected: 'Batch PACE-APR-W2', oldValue: 'Trainer A', newValue: 'Trainer B', actionType: 'Batch Change', recordType: 'Batch', timestampValue: '2026-05-02T14:15:00.000Z' },
  { id: '9', actionDescription: 'API call retried and succeeded', performedByName: 'System', performedByRole: 'System', isSystem: true, module: 'BBS', recordAffected: 'BBS Link BBS-2026-APR', oldValue: 'API timeout', newValue: 'Sync successful', actionType: 'Edit', recordType: 'Link', timestampValue: '2026-05-03T21:05:00.000Z' },
];

const buildDataset = () => {
  const rows = [];
  for (let i = 0; i < 140; i += 1) {
    const base = BASE_ENTRIES[i % BASE_ENTRIES.length];
    const date = new Date(base.timestampValue);
    date.setHours(date.getHours() - i * 4);
    rows.push({
      ...base,
      id: `${base.id}-${i + 1}`,
      recordAffected: `${base.recordAffected} · Ref ${String(i + 1).padStart(2, '0')}`,
      timestampValue: date.toISOString(),
      timestamp: date.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    });
  }
  return rows.sort((a, b) => new Date(b.timestampValue) - new Date(a.timestampValue));
};

const INITIAL_DATASET = buildDataset();

const defaultRange = () => {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 30);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
};

const isPermanentlyRetained = (entry) =>
  entry.permanentRetention ||
  entry.recordType === 'Payment' ||
  entry.recordType === 'Invoice' ||
  entry.actionType === 'Opt-Out' ||
  entry.actionType === 'Opt-In' ||
  entry.actionDescription.toLowerCase().includes('gst amendment') ||
  entry.actionDescription.toLowerCase().includes('double payment');

const runNightlyRetention = (entries) => {
  const now = new Date();
  const visible = [];
  const archived = [];

  entries.forEach((entry) => {
    const ageDays = Math.floor((now.getTime() - new Date(entry.timestampValue).getTime()) / (1000 * 60 * 60 * 24));
    if (ageDays > TWO_YEARS_DAYS && !isPermanentlyRetained(entry)) {
      archived.push({ ...entry, archivedAt: now.toISOString(), archiveReason: 'Rolling 2-year retention policy' });
    } else {
      visible.push(entry);
    }
  });

  if (archived.length > 0) {
    visible.unshift({
      id: `retention-${now.getTime()}`,
      actionDescription: 'Nightly retention soft-delete executed',
      performedByName: 'System',
      performedByRole: 'System',
      isSystem: true,
      module: 'Settings',
      recordAffected: `${archived.length} archived records`,
      oldValue: 'Visible in live audit log',
      newValue: 'Moved to archived storage',
      actionType: 'Delete',
      recordType: 'User',
      timestampValue: now.toISOString(),
      timestamp: now.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      permanentRetention: true,
    });
  }

  return {
    visible: visible.sort((a, b) => new Date(b.timestampValue) - new Date(a.timestampValue)),
    archived,
  };
};

export const AuditLog = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Marketing Head';
  const [teamAuditAccess, setTeamAuditAccess] = useState(
    () => window.localStorage.getItem(TEAM_AUDIT_ACCESS_KEY) === 'true'
  );

  const canAccessAudit = isAdmin || teamAuditAccess;
  const names = ['All', 'Ria Sharma', 'Amit Patel', 'Charu Mehta', 'System'];
  const datePreset = defaultRange();
  const [filters, setFilters] = useState({
    search: '',
    module: 'All',
    actionType: 'All',
    performedBy: 'All',
    recordType: 'All',
    from: datePreset.from,
    to: datePreset.to,
  });
  const [showExpiring, setShowExpiring] = useState(false);
  const [page, setPage] = useState(1);

  const retentionResult = useMemo(() => runNightlyRetention(INITIAL_DATASET), []);

  useEffect(() => {
    setPage(1);
  }, [filters, showExpiring]);

  const expiringEntries = useMemo(() => {
    const now = new Date();
    return retentionResult.visible.filter((entry) => {
      if (isPermanentlyRetained(entry)) return false;
      const ageDays = Math.floor((now.getTime() - new Date(entry.timestampValue).getTime()) / (1000 * 60 * 60 * 24));
      return ageDays >= TWO_YEARS_DAYS - EXPIRING_WINDOW_DAYS && ageDays <= TWO_YEARS_DAYS;
    });
  }, [retentionResult.visible]);

  const rowsSource = showExpiring ? expiringEntries : retentionResult.visible;

  const filtered = useMemo(
    () =>
      rowsSource.filter((entry) => {
        const haystack = `${entry.performedByName} ${entry.performedByRole} ${entry.actionDescription} ${entry.module} ${entry.recordAffected}`.toLowerCase();
        const searchMatch = !filters.search.trim() || haystack.includes(filters.search.toLowerCase());
        const moduleMatch = filters.module === 'All' || entry.module === filters.module;
        const actionMatch = filters.actionType === 'All' || entry.actionType === filters.actionType;
        const actorMatch = filters.performedBy === 'All' || entry.performedByName === filters.performedBy;
        const recordTypeMatch = filters.recordType === 'All' || entry.recordType === filters.recordType;
        const entryDate = new Date(entry.timestampValue);
        const fromMatch = !filters.from || entryDate >= new Date(`${filters.from}T00:00:00`);
        const toMatch = !filters.to || entryDate <= new Date(`${filters.to}T23:59:59`);
        return searchMatch && moduleMatch && actionMatch && actorMatch && recordTypeMatch && fromMatch && toMatch;
      }),
    [filters, rowsSource]
  );

  const totalEntries = filtered.length;
  const totalPages = Math.max(Math.ceil(totalEntries / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalEntries);
  const pageRows = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  const activeFilterTags = [
    filters.module !== 'All' ? { key: 'module', label: `Module: ${filters.module}` } : null,
    filters.actionType !== 'All' ? { key: 'actionType', label: `Action: ${filters.actionType}` } : null,
    filters.performedBy !== 'All' ? { key: 'performedBy', label: `Performed by: ${filters.performedBy}` } : null,
    filters.recordType !== 'All' ? { key: 'recordType', label: `Record: ${filters.recordType}` } : null,
    filters.from ? { key: 'from', label: `From: ${filters.from}` } : null,
    filters.to ? { key: 'to', label: `To: ${filters.to}` } : null,
  ].filter(Boolean);

  const clearTag = (key) => {
    if (key === 'from' || key === 'to') {
      const range = defaultRange();
      setFilters((prev) => ({ ...prev, [key]: range[key] }));
      return;
    }
    setFilters((prev) => ({ ...prev, [key]: 'All' }));
  };

  if (!canAccessAudit) {
    return (
      <div className="p-8 pt-0 max-w-7xl mx-auto">
        <div className="py-8">
          <h1 className="text-2xl font-bold text-slate-900">Audit Log</h1>
          <p className="text-sm text-slate-500 mt-1">Access restricted. Ask a Marketing Head to grant Audit Log permission.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pt-0 max-w-7xl mx-auto space-y-4">
      <div className="sticky top-0 z-20 bg-white py-8">
        <h1 className="text-2xl font-bold text-slate-900">Audit Log</h1>
        <p className="text-[#6B7280] mt-1 text-sm">All activity across the Marketing CRM.</p>
        {isAdmin && (
          <div className="mt-3 flex items-center gap-2">
            <Button
              variant={teamAuditAccess ? 'default' : 'outline'}
              className={cn('h-8 text-xs', teamAuditAccess && 'bg-blue-600 hover:bg-blue-700')}
              onClick={() => {
                const next = !teamAuditAccess;
                setTeamAuditAccess(next);
                window.localStorage.setItem(TEAM_AUDIT_ACCESS_KEY, String(next));
              }}
            >
              {teamAuditAccess ? 'Team access enabled' : 'Enable team access'}
            </Button>
            <span className="text-xs text-slate-500">Admin can grant/revoke Audit Log access for team members.</span>
          </div>
        )}
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by actor, action, or module..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="pl-10 h-10 border-slate-200 rounded-xl bg-slate-50 focus-visible:ring-blue-200 placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {MODULE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, module: option }))}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-semibold transition-all border',
                filters.module === option
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
              )}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex items-end gap-3 flex-wrap">
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Action type</label>
            <Select value={filters.actionType} onValueChange={(value) => setFilters((prev) => ({ ...prev, actionType: value }))}>
              <SelectTrigger className="h-10 w-[190px] border-slate-200 rounded-xl bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{ACTION_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Performed by</label>
            <Select value={filters.performedBy} onValueChange={(value) => setFilters((prev) => ({ ...prev, performedBy: value }))}>
              <SelectTrigger className="h-10 w-[190px] border-slate-200 rounded-xl bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{names.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Record type</label>
            <Select value={filters.recordType} onValueChange={(value) => setFilters((prev) => ({ ...prev, recordType: value }))}>
              <SelectTrigger className="h-10 w-[190px] border-slate-200 rounded-xl bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{RECORD_TYPE_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Date range</label>
            <div className="flex items-center gap-2">
              <Input type="date" value={filters.from} onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))} className="h-10 w-[155px] border-slate-200 rounded-xl bg-white text-sm" />
              <Input type="date" value={filters.to} onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))} className="h-10 w-[155px] border-slate-200 rounded-xl bg-white text-sm" />
            </div>
          </div>
          {isAdmin && (
            <Button variant={showExpiring ? 'default' : 'outline'} className={cn('h-10 rounded-xl', showExpiring && 'bg-blue-600 hover:bg-blue-700')} onClick={() => setShowExpiring((prev) => !prev)}>
              {showExpiring ? 'Showing expiring logs' : 'View expiring logs'}
            </Button>
          )}
        </div>

        {activeFilterTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilterTags.map((tag) => (
              <Badge key={tag.key} variant="secondary" className="pl-2 pr-1 py-1 bg-slate-100 text-slate-700">
                {tag.label}
                <button type="button" onClick={() => clearTag(tag.key)} className="ml-1 rounded hover:bg-slate-200 p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden border border-[#E5E7EB] rounded-xl">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Action Description</TableHead>
              <TableHead>Performed By</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Record Affected</TableHead>
              <TableHead>Old Value</TableHead>
              <TableHead>New Value</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length > 0 ? (
              pageRows.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-sm text-slate-800">{entry.actionDescription}</TableCell>
                  <TableCell className="text-sm text-slate-700">
                    {entry.isSystem ? 'System' : `${entry.performedByName} (${entry.performedByRole})`}
                  </TableCell>
                  <TableCell className="text-sm text-slate-700">{entry.module}</TableCell>
                  <TableCell className="text-sm text-slate-700">{entry.recordAffected}</TableCell>
                  <TableCell className="text-sm text-slate-600">{entry.oldValue}</TableCell>
                  <TableCell className="text-sm text-slate-600">{entry.newValue}</TableCell>
                  <TableCell className="text-sm text-slate-500">{entry.timestamp}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-56">
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <SearchX className="h-8 w-8 text-slate-300" />
                    <p className="text-sm text-slate-600">No log entries found matching your filters.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing {totalEntries === 0 ? 0 : startIndex + 1}-{endIndex} of {totalEntries} entries
        </p>
        <div className="flex gap-2">
          <Button variant="outline" className="h-9" disabled={safePage <= 1} onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
            Prev
          </Button>
          <Button variant="outline" className="h-9" disabled={safePage >= totalPages} onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
