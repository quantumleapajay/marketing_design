import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  AlertCircle,
  Info,
  Check,
  ChevronsUpDown,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock3,
  RefreshCw,
  TrendingUp,
  Users,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useAuth } from '../lib/auth';

type Program = 'BSW' | 'BBS' | 'PACE';

interface MarketingDailyRecord {
  date: string;
  city: string;
  batch: string;
  bswRegistrations: number;
  bswAttended: number;
  bswPaceConversions: number;
  bswAdSpend: number;
  bbsRegistrations: number;
  bbsQualified: number;
  bbsPaceConversions: number;
  bbsAdSpend: number;
  paceSalesDirect: number;
  paceSalesFromBsw: number;
  paceSalesFromBbs: number;
  paceRevenue: number;
}

interface FilterState {
  fromDate: string;
  toDate: string;
  programs: Program[];
  batches: string[];
  cities: string[];
}

type EdgeCaseCategory =
  | 'missing_data'
  | 'invalid_data'
  | 'delayed_data'
  | 'filter_conflicts'

type EdgeCaseSeverity = 'high' | 'medium' | 'low';

interface EdgeCaseItem {
  id: string;
  category: EdgeCaseCategory;
  severity: EdgeCaseSeverity;
  message: string;
  nextAction: string;
  metricRef: string;
}

type TrafficLightStatus = 'green' | 'amber' | 'red';
type DashboardViewMode = 'daily' | 'weekly' | 'monthly';

const MOCK_DAILY_DATA: MarketingDailyRecord[] = [
  { date: '2026-04-20', city: 'Bengaluru', batch: 'PACE-17', bswRegistrations: 82, bswAttended: 61, bswPaceConversions: 7, bswAdSpend: 41000, bbsRegistrations: 54, bbsQualified: 39, bbsPaceConversions: 5, bbsAdSpend: 26000, paceSalesDirect: 4, paceSalesFromBsw: 7, paceSalesFromBbs: 5, paceRevenue: 480000 },
  { date: '2026-04-21', city: 'Bengaluru', batch: 'PACE-17', bswRegistrations: 76, bswAttended: 54, bswPaceConversions: 6, bswAdSpend: 39000, bbsRegistrations: 47, bbsQualified: 35, bbsPaceConversions: 4, bbsAdSpend: 23000, paceSalesDirect: 3, paceSalesFromBsw: 6, paceSalesFromBbs: 4, paceRevenue: 420000 },
  { date: '2026-04-22', city: 'Mumbai', batch: 'PACE-18', bswRegistrations: 71, bswAttended: 49, bswPaceConversions: 5, bswAdSpend: 36500, bbsRegistrations: 51, bbsQualified: 36, bbsPaceConversions: 5, bbsAdSpend: 25500, paceSalesDirect: 5, paceSalesFromBsw: 5, paceSalesFromBbs: 5, paceRevenue: 450000 },
  { date: '2026-04-23', city: 'Chennai', batch: 'PACE-19', bswRegistrations: 66, bswAttended: 42, bswPaceConversions: 4, bswAdSpend: 33000, bbsRegistrations: 45, bbsQualified: 30, bbsPaceConversions: 3, bbsAdSpend: 21000, paceSalesDirect: 3, paceSalesFromBsw: 4, paceSalesFromBbs: 3, paceRevenue: 330000 },
  { date: '2026-04-24', city: 'Mumbai', batch: 'PACE-18', bswRegistrations: 88, bswAttended: 67, bswPaceConversions: 8, bswAdSpend: 44000, bbsRegistrations: 59, bbsQualified: 44, bbsPaceConversions: 6, bbsAdSpend: 29500, paceSalesDirect: 6, paceSalesFromBsw: 8, paceSalesFromBbs: 6, paceRevenue: 560000 },
  { date: '2026-04-25', city: 'Bengaluru', batch: 'PACE-19', bswRegistrations: 79, bswAttended: 58, bswPaceConversions: 7, bswAdSpend: 40500, bbsRegistrations: 49, bbsQualified: 36, bbsPaceConversions: 4, bbsAdSpend: 23800, paceSalesDirect: 5, paceSalesFromBsw: 7, paceSalesFromBbs: 4, paceRevenue: 470000 },
  { date: '2026-04-26', city: 'Chennai', batch: 'PACE-19', bswRegistrations: 74, bswAttended: 53, bswPaceConversions: 6, bswAdSpend: 37800, bbsRegistrations: 53, bbsQualified: 37, bbsPaceConversions: 5, bbsAdSpend: 25000, paceSalesDirect: 4, paceSalesFromBsw: 6, paceSalesFromBbs: 5, paceRevenue: 455000 },
];

/** Mock data uses fixed 2026 dates; tie default + reset range to this dataset so filters always match rows regardless of system clock. */
function getMockDatasetDefaultRange(): Pick<FilterState, 'fromDate' | 'toDate'> {
  const sorted = [...MOCK_DAILY_DATA.map((r) => r.date)].sort();
  return { fromDate: sorted[0], toDate: sorted[sorted.length - 1] };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function UnifiedMarketingDashboard() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...getMockDatasetDefaultRange(),
    programs: ['BSW', 'BBS', 'PACE'],
    batches: [],
    cities: [],
  }));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [showAllEdgeCases, setShowAllEdgeCases] = useState(false);
  const [selectedEdgeCaseId, setSelectedEdgeCaseId] = useState<string | null>(null);
  const [invalidSimulation, setInvalidSimulation] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    bsw: false,
    bbs: false,
    pace: false,
  });
  const [viewMode, setViewMode] = useState<DashboardViewMode>('weekly');

  const setDefaultFilters = () => {
    setFilters({
      ...getMockDatasetDefaultRange(),
      programs: ['BSW', 'BBS', 'PACE'],
      batches: [],
      cities: [],
    });
    setLastUpdated(new Date());
    setInvalidSimulation(false);
    setSelectedEdgeCaseId(null);
  };

  // Apply filter presets that intentionally yield 0 records.
  const applyMissingNoRecordsPreset = () => {
    setFilters({
      ...getMockDatasetDefaultRange(),
      programs: ['BSW', 'BBS', 'PACE'],
      // Mumbai only exists with PACE-18 in our mock dataset.
      cities: ['Mumbai'],
      batches: ['PACE-17'],
    });
    setLastUpdated(new Date());
    setInvalidSimulation(false);
    setSelectedEdgeCaseId('missing-no-records');
  };

  const applyInvalidDataPreset = () => {
    setDefaultFilters();
    setInvalidSimulation(true);
    setSelectedEdgeCaseId('invalid-row-values');
  };

  const applyDelayedDataPreset = () => {
    setDefaultFilters();
    setLastUpdated(new Date(Date.now() - 20 * 60 * 1000));
    setSelectedEdgeCaseId('stale-data-feed');
  };


  const cities = useMemo(
    () => ['ALL', ...Array.from(new Set(MOCK_DAILY_DATA.map((row) => row.city)))],
    []
  );
  const batches = useMemo(
    () => ['ALL', ...Array.from(new Set(MOCK_DAILY_DATA.map((row) => row.batch)))],
    []
  );

  const filteredRows = useMemo(() => {
    return MOCK_DAILY_DATA.filter((row) => {
      const inDateRange = row.date >= filters.fromDate && row.date <= filters.toDate;
      const matchCity = filters.cities.length === 0 || filters.cities.includes(row.city);
      const matchBatch = filters.batches.length === 0 || filters.batches.includes(row.batch);
      return inDateRange && matchCity && matchBatch;
    });
  }, [filters]);

  const metrics = useMemo(() => {
    const totals = filteredRows.reduce(
      (acc, row) => {
        acc.bswRegistrations += row.bswRegistrations;
        acc.bswAttended += row.bswAttended;
        acc.bswPaceConversions += row.bswPaceConversions;
        acc.bswAdSpend += row.bswAdSpend;
        acc.bbsRegistrations += row.bbsRegistrations;
        acc.bbsQualified += row.bbsQualified;
        acc.bbsPaceConversions += row.bbsPaceConversions;
        acc.bbsAdSpend += row.bbsAdSpend;
        acc.paceSalesDirect += row.paceSalesDirect;
        acc.paceSalesFromBsw += row.paceSalesFromBsw;
        acc.paceSalesFromBbs += row.paceSalesFromBbs;
        acc.paceRevenue += row.paceRevenue;
        return acc;
      },
      {
        bswRegistrations: 0,
        bswAttended: 0,
        bswPaceConversions: 0,
        bswAdSpend: 0,
        bbsRegistrations: 0,
        bbsQualified: 0,
        bbsPaceConversions: 0,
        bbsAdSpend: 0,
        paceSalesDirect: 0,
        paceSalesFromBsw: 0,
        paceSalesFromBbs: 0,
        paceRevenue: 0,
      }
    );

    const bswShowUpRate = totals.bswRegistrations
      ? (totals.bswAttended / totals.bswRegistrations) * 100
      : 0;
    const bbsShowUpRate = totals.bbsRegistrations
      ? (totals.bbsQualified / totals.bbsRegistrations) * 100
      : 0;
    const totalPaceBuyers = totals.paceSalesDirect + totals.paceSalesFromBsw + totals.paceSalesFromBbs;
    return {
      ...totals,
      bswShowUpRate,
      bbsShowUpRate,
      totalPaceBuyers,
    };
  }, [filteredRows]);

  const dataStalenessMinutes = useMemo(() => {
    return Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60));
  }, [lastUpdated]);

  const edgeCases = useMemo(() => {
    const items: EdgeCaseItem[] = [];

    if (filteredRows.length === 0) {
      items.push({
        id: 'missing-no-records',
        category: 'missing_data',
        severity: 'high',
        message: 'No records found for selected filters.',
        nextAction: 'Expand date range or switch batch/city filters.',
        metricRef: 'Global Filters',
      });
      // When there are no records, keep the experience simple:
      // show only "Missing Data" and avoid showing "Filter Conflicts" etc.
      return items;
    }

    const hasInvalidRows =
      invalidSimulation ||
      filteredRows.some(
        (row) =>
          row.bswAdSpend < 0 ||
          row.bbsAdSpend < 0 ||
          row.bswPaceConversions > row.bswRegistrations ||
          row.bbsPaceConversions > row.bbsRegistrations
      );
    if (hasInvalidRows) {
      items.push({
        id: 'invalid-row-values',
        category: 'invalid_data',
        severity: 'high',
        message: 'Invalid values found in spend or conversion counts.',
        nextAction: 'Review CRM sync validation for registrations and spend fields.',
        metricRef: 'Data Validation',
      });
    }

    if (dataStalenessMinutes > 5) {
      items.push({
        id: 'stale-data-feed',
        category: 'delayed_data',
        severity: dataStalenessMinutes > 15 ? 'high' : 'medium',
        message: `Data refresh is delayed by ${dataStalenessMinutes} minutes.`,
        nextAction: 'Use refresh now and verify CRM feed health.',
        metricRef: 'Last Updated',
      });
    }

    const hasNarrowFilters =
      filters.cities.length > 0 || filters.batches.length > 0 || filters.programs.length !== 3;
    if (hasNarrowFilters && filteredRows.length === 0) {
      items.push({
        id: 'filter-conflict',
        category: 'filter_conflicts',
        severity: 'medium',
        message: 'Selected filter combination has no matching data.',
        nextAction: 'Clear one filter at a time to isolate conflicting criteria.',
        metricRef: 'Filter Scope',
      });
    }

    return items;
  }, [dataStalenessMinutes, filteredRows, filters, invalidSimulation]);

  const visibleEdgeCases = useMemo(() => {
    if (showAllEdgeCases) return edgeCases;
    const rank: Record<EdgeCaseSeverity, number> = { high: 3, medium: 2, low: 1 };
    return [...edgeCases].sort((a, b) => rank[b.severity] - rank[a.severity]).slice(0, 3);
  }, [edgeCases, showAllEdgeCases]);
  const hasHighSeverityAlert = edgeCases.some((item) => item.severity === 'high');
  const showDataQualityAlerts = user?.role === 'Marketing Head';

  const edgeCaseGroups = useMemo(() => {
    return visibleEdgeCases.reduce<Record<EdgeCaseCategory, EdgeCaseItem[]>>(
      (acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      },
      {
        missing_data: [],
        invalid_data: [],
        delayed_data: [],
        filter_conflicts: [],
      }
    );
  }, [visibleEdgeCases]);

  const runRefresh = () => {
    setIsRefreshing(true);
    window.setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 700);
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLastUpdated(new Date());
    }, 30000);
    return () => window.clearInterval(interval);
  }, []);

  const showBSW = filters.programs.includes('BSW');
  const showBBS = filters.programs.includes('BBS');
  const showPACE = filters.programs.includes('PACE');

  const dailyMetrics = {
    bswRegistrations: 12,
    bswAttended: 9,
    bswPaceConversions: 1,
    bswAdSpend: 14200,
    bbsRegistrations: 8,
    bbsQualified: 5,
    bbsPaceConversions: 1,
    bbsAdSpend: 0,
    paceSalesDirect: 1,
    paceSalesFromBsw: 1,
    paceSalesFromBbs: 1,
    paceRevenue: 90000,
    bswShowUpRate: 75,
    bbsShowUpRate: 62.5,
    totalPaceBuyers: 3,
  };

  const monthlyMetrics = {
    bswRegistrations: 1148,
    bswAttended: 836,
    bswPaceConversions: 42,
    bswAdSpend: 542000,
    bbsRegistrations: 812,
    bbsQualified: 604,
    bbsPaceConversions: 34,
    bbsAdSpend: 318000,
    paceSalesDirect: 0,
    paceSalesFromBsw: 42,
    paceSalesFromBbs: 34,
    paceRevenue: 2265000,
    bswShowUpRate: 72.8,
    bbsShowUpRate: 74.4,
    totalPaceBuyers: 76,
  };

  const activeMetrics = viewMode === 'daily' ? dailyMetrics : viewMode === 'monthly' ? monthlyMetrics : metrics;

  const lastReportSentText =
    viewMode === 'daily'
      ? 'Today, 6:00 PM'
      : viewMode === 'monthly'
      ? '1 Apr 2026, 7:00 AM'
      : 'Monday, 28 Apr 2026, 9:00 AM';

  const toggleSection = (section: 'bsw' | 'bbs' | 'pace') => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Edge cases are shown as a fixed list (PRD “listed at all times”).
  // Clicking one applies the corresponding preset so the UI updates immediately.
  const edgeCaseCatalog = [
    {
      optionId: 'missing-no-records',
      label: 'Missing Data',
      category: 'missing_data' as const,
      severity: 'high' as const,
      messagePreview: 'No records found for selected filters.',
      checkedWhenEdgeCaseId: 'missing-no-records' as const,
      onSelect: applyMissingNoRecordsPreset,
    },
    {
      optionId: 'filter-conflicts',
      label: 'Filter Conflicts',
      category: 'filter_conflicts' as const,
      severity: 'medium' as const,
      messagePreview: 'Selected filters don’t match any records.',
      checkedWhenEdgeCaseId: null,
      // For low-literacy simplicity, selecting this takes you to the same “No matching records” state.
      onSelect: applyMissingNoRecordsPreset,
    },
    {
      optionId: 'invalid-row-values',
      label: 'Invalid Data',
      category: 'invalid_data' as const,
      severity: 'high' as const,
      messagePreview: 'Invalid values found in spend or conversion counts.',
      checkedWhenEdgeCaseId: 'invalid-row-values' as const,
      onSelect: applyInvalidDataPreset,
    },
    {
      optionId: 'stale-data-feed',
      label: 'Delayed / Stale Data',
      category: 'delayed_data' as const,
      severity: 'high' as const,
      messagePreview: 'Data refresh is delayed.',
      checkedWhenEdgeCaseId: 'stale-data-feed' as const,
      onSelect: applyDelayedDataPreset,
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 bg-slate-50 min-h-full">
      <Card className="border-slate-200">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">Unified Marketing Dashboard</h2>
              <Badge variant="outline" className="text-slate-600 border-slate-300">
                Last updated {lastUpdated.toLocaleTimeString()}
              </Badge>
              {isRefreshing && (
                <span className="text-sm text-slate-500 flex items-center gap-1">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Updating metrics
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Start Date</label>
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(event) => setFilters((prev) => ({ ...prev, fromDate: event.target.value }))}
                  className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm"
                  aria-label="Start date"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">End Date</label>
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(event) => setFilters((prev) => ({ ...prev, toDate: event.target.value }))}
                  className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm"
                  aria-label="End date"
                />
              </div>
              <MultiSelectFilter
                label="Program Type"
                placeholder="Select programs"
                options={['BSW', 'BBS', 'PACE']}
                selected={filters.programs}
                onChange={(nextPrograms) => {
                  const safePrograms = nextPrograms.length ? (nextPrograms as Program[]) : ['BSW', 'BBS', 'PACE'];
                  setFilters((prev) => ({ ...prev, programs: safePrograms }));
                }}
              />
              <MultiSelectFilter
                label="PACE Batch"
                placeholder="Select batches"
                options={batches.filter((item) => item !== 'ALL')}
                selected={filters.batches}
                onChange={(nextBatches) => setFilters((prev) => ({ ...prev, batches: nextBatches }))}
              />
              <MultiSelectFilter
                label="City"
                placeholder="Select cities"
                options={cities.filter((item) => item !== 'ALL')}
                selected={filters.cities}
                onChange={(nextCities) => setFilters((prev) => ({ ...prev, cities: nextCities }))}
              />
              <div className="space-y-1">
                <label className="text-xs font-medium text-transparent">Refresh</label>
                <Button onClick={runRefresh} variant="outline" className="h-9 w-full">
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh now
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {[
            { id: 'daily', label: 'Daily' },
            { id: 'weekly', label: 'Weekly' },
            { id: 'monthly', label: 'Monthly' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as DashboardViewMode)}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
                viewMode === tab.id
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-700 bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500">Last report sent: {lastReportSentText}</p>
      </div>

      {viewMode === 'daily' && (
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-900">Today&apos;s snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <div className="text-sm text-slate-500">BSW Registrations today</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">12</div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <div className="text-sm text-slate-500">BBS Registrations today</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">8</div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <div className="text-sm text-slate-500">PACE Sales today</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">3</div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <div className="text-sm text-slate-500">Ad Spend today</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">₹14,200</div>
              </div>
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <p>Daily summary is auto-emailed to Marketing Head at 6:00 PM.</p>
              <p className="flex items-center gap-1.5">
                Last sent: Today, 6:00 PM <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'weekly' && (
      <Card className="border-slate-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  Cross-function Snapshot
                </CardTitle>
            <div className="flex items-center gap-2">
              {showDataQualityAlerts && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs">
                    {hasHighSeverityAlert ? (
                      <AlertTriangle className="h-3.5 w-3.5 mr-1 text-amber-600" />
                    ) : (
                      <Info className="h-3.5 w-3.5 mr-1 text-slate-500" />
                    )}
                    Data quality alerts
                    <ChevronsUpDown className="h-3 w-3 ml-1 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72 p-1">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Data quality alerts</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {edgeCaseCatalog.map((opt) => (
                      <DropdownMenuCheckboxItem
                        key={opt.optionId}
                        checked={opt.checkedWhenEdgeCaseId ? selectedEdgeCaseId === opt.checkedWhenEdgeCaseId : false}
                        onCheckedChange={() => opt.onSelect()}
                      >
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <SeverityBadge severity={opt.severity} />
                            <span className="text-xs font-medium text-slate-900">{opt.label}</span>
                          </div>
                          <span className="text-[11px] text-slate-600 line-clamp-2">{opt.messagePreview}</span>
                        </div>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="text-sm text-slate-500">Total PACE Buyers</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{metrics.totalPaceBuyers}</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="text-sm text-slate-500">Revenue</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(metrics.paceRevenue)}</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="text-sm text-slate-500">Revenue</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(metrics.paceRevenue)}</div>
            </div>
          </div>

          {selectedEdgeCaseId && (
            <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
              {(() => {
                const selected = edgeCases.find((item) => item.id === selectedEdgeCaseId);
                if (!selected) return null;

                if (selected.id === 'missing-no-records') {
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={selected.severity} />
                        <span className="text-xs font-semibold text-slate-900">No matching records</span>
                      </div>
                      <div className="text-sm text-slate-800">Try to reset or Adjust your filters to view data</div>
                      <Button
                        onClick={() =>
                          setDefaultFilters()
                        }
                      >
                        Reset filters
                      </Button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={selected.severity} />
                      <span className="text-xs font-semibold text-slate-900">
                        {formatEdgeCategory(selected.category)}
                      </span>
                    </div>
                    <div className="text-sm text-slate-800">{selected.message}</div>
                    <div className="text-sm text-slate-700">
                      Next action: <span className="font-medium">{selected.nextAction}</span>
                    </div>
                    <div className="text-xs text-slate-500">Reference: {selected.metricRef}</div>
                  </div>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {viewMode === 'monthly' && (
        <>
          <Card className="border-slate-200">
            <CardContent className="pt-6 space-y-2">
              <h3 className="text-base font-semibold text-slate-900">April 2026 — Monthly Summary</h3>
              <p className="text-xs text-slate-500">Auto-generated on 1 May 2026</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-sm">
                <MetricRow label="Total PACE Buyers" value="76" />
                <MetricRow label="Total Revenue" value="₹22,65,000" />
                <MetricRow label="Best performing source" value="BSW (42 sales)" />
                <MetricRow label="Best performing batch" value="PACE Batch 7 (60 enrollments)" />
              </div>
              <div className="mt-4 text-xs text-slate-500 space-y-1">
                <p>Monthly summary auto-emailed on 1st of each month.</p>
                <p>Last sent: Not yet sent — next: 1 May 2026</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {viewMode === 'weekly' && filteredRows.length === 0 ? (
          <Card className="border-slate-200 xl:col-span-3">
            <CardContent className="py-8">
              <div className="text-center py-12">
                <Search className="w-10 h-10 mx-auto mb-3 text-gray-300 opacity-30" />
                <h3 className="text-sm font-semibold text-gray-700 mb-1">No matching records</h3>
                <p className="text-xs text-gray-400 mb-4 max-w-md mx-auto">
                  Try to reset or Adjust your filters to view data
                </p>
                <Button onClick={() => setDefaultFilters()}>
                  Reset filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
        {showBSW && (
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-600" />
                  BSW Performance
                  <TrafficLightBadge metricName="bswShowUpRate" value={activeMetrics.bswShowUpRate} />
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => toggleSection('bsw')}>
                  {collapsedSections.bsw ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            {!collapsedSections.bsw ? (
              <CardContent className="space-y-3 text-sm">
                <MetricRow label="Registrations" value={String(activeMetrics.bswRegistrations)} />
                <MetricRow label="Attended" value={String(activeMetrics.bswAttended)} />
                <MetricRow label="Show-up Rate" value={formatPercent(activeMetrics.bswShowUpRate)} />
                <MetricRow label="PACE Conversions" value={String(activeMetrics.bswPaceConversions)} />
                <MetricRow label="Ad Spend" value={formatCurrency(activeMetrics.bswAdSpend)} />
              </CardContent>
            ) : (
              <CardContent className="text-sm text-slate-500">Section collapsed. Click show section to view details.</CardContent>
            )}
          </Card>
        )}

        {showBBS && (
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-slate-600" />
                  BBS Performance
                  <TrafficLightBadge metricName="bbsShowUpRate" value={activeMetrics.bbsShowUpRate} />
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => toggleSection('bbs')}>
                  {collapsedSections.bbs ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            {!collapsedSections.bbs ? (
              <CardContent className="space-y-3 text-sm">
                <MetricRow label="Registrations" value={String(activeMetrics.bbsRegistrations)} />
                <MetricRow label="Qualified" value={String(activeMetrics.bbsQualified)} />
                <MetricRow label="Show-up Rate" value={formatPercent(activeMetrics.bbsShowUpRate)} />
                <MetricRow label="PACE Conversions" value={String(activeMetrics.bbsPaceConversions)} />
                <MetricRow label="Ad Spend" value={formatCurrency(activeMetrics.bbsAdSpend)} />
              </CardContent>
            ) : (
              <CardContent className="text-sm text-slate-500">Section collapsed. Click show section to view details.</CardContent>
            )}
          </Card>
        )}

        {showPACE && (
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-slate-600" />
                  PACE Performance
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => toggleSection('pace')}>
                  {collapsedSections.pace ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            {!collapsedSections.pace ? (
              <CardContent className="space-y-3 text-sm">
                <MetricRow
                  label="Total Sales"
                  value={String(activeMetrics.paceSalesDirect + activeMetrics.paceSalesFromBsw + activeMetrics.paceSalesFromBbs)}
                />
                <MetricRow label="Revenue" value={formatCurrency(activeMetrics.paceRevenue)} />
                <MetricRow label="Sales by Source (BSW)" value={String(activeMetrics.paceSalesFromBsw)} />
                <MetricRow label="Sales by Source (BBS)" value={String(activeMetrics.paceSalesFromBbs)} />
                <MetricRow label="Sales by Source (Direct)" value={String(activeMetrics.paceSalesDirect)} />
              </CardContent>
            ) : (
              <CardContent className="text-sm text-slate-500">Section collapsed. Click show section to view details.</CardContent>
            )}
          </Card>
        )}
          </>
        )}
      </div>

      {viewMode === 'weekly' && (
        <Card className="border-slate-200">
          <CardContent className="pt-6 space-y-3">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
              <ComparisonPill
                label="BSW Regs"
                current="378 this week"
                previous="312 last week"
                change="+21.2%"
                positive={true}
              />
              <ComparisonPill
                label="BBS Regs"
                current="257 this week"
                previous="290 last week"
                change="-11.4%"
                positive={false}
              />
              <ComparisonPill
                label="PACE Sales"
                current="76 this week"
                previous="68 last week"
                change="+11.8%"
                positive={true}
              />
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <p>Weekly summary auto-emailed every Monday morning.</p>
              <p>Last sent: Monday, 28 Apr 2026, 9:00 AM</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200">
        <CardContent className="pt-6 flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Clock3 className="h-4 w-4" />
            Data refreshes automatically every 30 seconds.
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <CheckCircle2 className="h-4 w-4" />
            Reports are available in-app only. No share, export, or download actions.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function ComparisonPill({
  label,
  current,
  previous,
  change,
  positive,
}: {
  label: string;
  current: string;
  previous: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs flex items-center justify-between gap-2">
      <span className="text-slate-700">
        {label}: {current} vs {previous}
      </span>
      <span className={positive ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
        {positive ? '↑' : '↓'} {change}
      </span>
    </div>
  );
}

function getTrafficLightStatus(metricName: 'bswShowUpRate' | 'bbsShowUpRate', value: number): TrafficLightStatus {
  if (value >= 70) return 'green';
  if (value >= 60) return 'amber';
  return 'red';
}

function TrafficLightBadge({
  metricName,
  value,
}: {
  metricName: 'bswShowUpRate' | 'bbsShowUpRate';
  value: number;
}) {
  const status = getTrafficLightStatus(metricName, value);

  if (status === 'green') {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
        Green - On track
      </Badge>
    );
  }

  if (status === 'amber') {
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
        <AlertCircle className="h-3.5 w-3.5 mr-1" />
        Amber - Watch
      </Badge>
    );
  }

  return (
    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
      <AlertTriangle className="h-3.5 w-3.5 mr-1" />
      Red - Action needed
    </Badge>
  );
}

function SeverityBadge({ severity }: { severity: EdgeCaseSeverity }) {
  if (severity === 'high') {
    return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">High</Badge>;
  }
  if (severity === 'medium') {
    return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Medium</Badge>;
  }
  return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">Low</Badge>;
}

function formatEdgeCategory(category: EdgeCaseCategory): string {
  switch (category) {
    case 'missing_data':
      return 'Missing Data';
    case 'invalid_data':
      return 'Invalid Data';
    case 'delayed_data':
      return 'Delayed Data';
    case 'filter_conflicts':
      return 'Filter Conflicts';
    default:
      return category;
  }
}

function MultiSelectFilter({
  label,
  placeholder,
  options,
  selected,
  onChange,
}: {
  label: string;
  placeholder: string;
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
}) {
  const selectedLabel =
    selected.length === 0
      ? `All ${label}`
      : selected.length <= 2
      ? selected.join(', ')
      : `${selected.length} selected`;

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
      return;
    }
    onChange([...selected, option]);
  };

  const clearAll = () => onChange([]);

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-9 w-full justify-between text-sm font-normal">
            <span className="truncate text-slate-700">{selectedLabel || placeholder}</span>
            <ChevronsUpDown className="h-4 w-4 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 p-1">
          <DropdownMenuGroup>
            <DropdownMenuLabel>{label}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {options.map((option) => (
              <DropdownMenuCheckboxItem
                key={option}
                checked={selected.includes(option)}
                onCheckedChange={() => toggleOption(option)}
              >
                <div className="flex items-center gap-2">
                  {selected.includes(option) ? (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <span className="h-3.5 w-3.5" />
                  )}
                  <span>{option}</span>
                </div>
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <button
              type="button"
              className="w-full rounded-md px-2 py-1 text-left text-xs text-slate-500 hover:bg-slate-100"
              onClick={clearAll}
            >
              Clear selection (Show all)
            </button>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
