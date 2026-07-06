export type ReportCadence = 'daily' | 'weekly' | 'monthly';
export type ReportStatus = 'ready' | 'generating' | 'failed';

export interface MarketingReport {
  id: string;
  cadence: ReportCadence;
  title: string;
  periodLabel: string;
  generatedAt: string;
  deliveryStatus: 'sent' | 'pending' | 'failed';
  status: ReportStatus;
  highlights: string[];
}

export interface ReportEdgeCase {
  id: string;
  severity: 'high' | 'medium';
  message: string;
  nextAction: string;
}

export const MOCK_REPORTS: MarketingReport[] = [
  {
    id: 'daily-2026-04-28',
    cadence: 'daily',
    title: 'Daily PACE Sales Summary',
    periodLabel: '28 Apr 2026',
    generatedAt: '2026-04-28T20:05:00',
    deliveryStatus: 'sent',
    status: 'ready',
    highlights: ['Total sales count: 23', 'Total revenue: INR 3,45,000', 'Top source: BSW', 'Batch performance: Batch 7 (15), Batch 8 (8)'],
  },
  {
    id: 'weekly-2026-W17',
    cadence: 'weekly',
    title: 'Weekly Marketing Report',
    periodLabel: 'Week 17, 2026',
    generatedAt: '2026-04-28T09:00:00',
    deliveryStatus: 'sent',
    status: 'ready',
    highlights: ['BSW show-up up by 3.1%', 'BBS conversions up by 2.6%', 'PACE revenue up by 8.4% WoW'],
  },
  {
    id: 'monthly-2026-03',
    cadence: 'monthly',
    title: 'Monthly Marketing Report',
    periodLabel: 'March 2026',
    generatedAt: '2026-04-01T08:10:00',
    deliveryStatus: 'sent',
    status: 'ready',
    highlights: ['Total PACE buyers: 462', 'Revenue: INR 1.42 Cr', 'Top source: BSW webinars'],
  },
  {
    id: 'daily-2026-04-29',
    cadence: 'daily',
    title: 'Daily PACE Sales Summary',
    periodLabel: '29 Apr 2026',
    generatedAt: '2026-04-29T20:05:00',
    deliveryStatus: 'pending',
    status: 'generating',
    highlights: ['Generation in progress'],
  },
  {
    id: 'monthly-2026-02',
    cadence: 'monthly',
    title: 'Monthly Marketing Report',
    periodLabel: 'February 2026',
    generatedAt: '2026-03-01T08:10:00',
    deliveryStatus: 'failed',
    status: 'failed',
    highlights: ['Run failed due to missing source feed. Retry required.'],
  },
];

export const CADENCE_LABELS: Record<ReportCadence, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

export function getReportEdgeCases(reports: MarketingReport[]): ReportEdgeCase[] {
  return reports.flatMap<ReportEdgeCase>((report) => {
    if (report.status === 'failed') {
      return [
        {
          id: `report-failed-${report.id}`,
          severity: 'high',
          message: `${CADENCE_LABELS[report.cadence]} report failed for ${report.periodLabel}.`,
          nextAction: 'Review source feed and retry scheduled generation.',
        },
      ];
    }
    if (report.status === 'generating' || report.deliveryStatus === 'pending') {
      return [
        {
          id: `report-pending-${report.id}`,
          severity: 'medium',
          message: `${CADENCE_LABELS[report.cadence]} report is still generating for ${report.periodLabel}.`,
          nextAction: 'Wait for completion and confirm generation timestamp.',
        },
      ];
    }
    return [];
  });
}
