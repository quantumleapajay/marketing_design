import { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, FileText, LoaderCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CADENCE_LABELS, MOCK_REPORTS, type ReportCadence, type ReportStatus } from './marketingReportsData';

function getStatusBadge(status: ReportStatus) {
  if (status === 'ready') {
    return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Ready</Badge>;
  }
  if (status === 'generating') {
    return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Generating</Badge>;
  }
  return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Failed</Badge>;
}

export function MarketingReports() {
  const [activeCadence, setActiveCadence] = useState<ReportCadence>('daily');
  const [openedReportId, setOpenedReportId] = useState<string>('');

  const cadenceReports = useMemo(
    () => MOCK_REPORTS.filter((report) => report.cadence === activeCadence),
    [activeCadence]
  );

  const currentReport = useMemo(() => {
    if (!cadenceReports.length) return null;
    const opened = cadenceReports.find((report) => report.id === openedReportId);
    return opened || cadenceReports[0];
  }, [cadenceReports, openedReportId]);

  const historyReports = useMemo(() => MOCK_REPORTS.slice().sort((a, b) => b.generatedAt.localeCompare(a.generatedAt)), []);

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-full space-y-6">
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900">Marketing Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CADENCE_LABELS) as ReportCadence[]).map((cadence) => (
              <Button
                key={cadence}
                variant={activeCadence === cadence ? 'default' : 'outline'}
                onClick={() => {
                  setActiveCadence(cadence);
                  setOpenedReportId('');
                }}
                className="min-w-24"
              >
                {CADENCE_LABELS[cadence]}
              </Button>
            ))}
          </div>
          <p className="text-sm text-slate-600">
            Daily PACE sales summary is auto-sent to Marketing Head email and stored here in CRM under Reports.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="border-slate-200 xl:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-900">{CADENCE_LABELS[activeCadence]} Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cadenceReports.length ? (
              cadenceReports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setOpenedReportId(report.id)}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    currentReport?.id === report.id
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-slate-900">{report.periodLabel}</div>
                    {getStatusBadge(report.status)}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Generated: {new Date(report.generatedAt).toLocaleString()}
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 p-4">
                <div className="text-center py-12">
                  <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300 opacity-30" />
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">No report generated yet.</h3>
                  <p className="text-xs text-gray-400 mb-4">Next scheduled generation will appear here.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-900">
              {currentReport ? `${currentReport.title} - ${currentReport.periodLabel}` : 'Report Details'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentReport ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <StatusIcon status={currentReport.status} />
                  <span className="text-slate-600">
                    Generated at {new Date(currentReport.generatedAt).toLocaleString()}
                  </span>
                  <Badge variant="outline" className="border-slate-300 text-slate-600">
                    Delivery: {currentReport.deliveryStatus}
                  </Badge>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h3 className="font-semibold text-slate-900 mb-3">Highlights</h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {currentReport.highlights.map((line) => (
                      <li key={line}>- {line}</li>
                    ))}
                  </ul>
                </div>

                {currentReport.status === 'failed' && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    Report generation failed. Retry from scheduler controls once data sources recover.
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Button>Open report</Button>
                  <Button variant="outline" onClick={() => setOpenedReportId('')}>
                    Switch cadence
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 p-5">
                <div className="text-center py-12">
                  <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300 opacity-30" />
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">
                    Select a report from the left to review details.
                  </h3>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-600" />
            Report History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {historyReports.map((report) => (
            <div key={report.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500" />
                <span className="font-medium text-slate-900">
                  {CADENCE_LABELS[report.cadence]} - {report.periodLabel}
                </span>
              </div>
              <span className="text-slate-500">{new Date(report.generatedAt).toLocaleString()}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusIcon({ status }: { status: ReportStatus }) {
  if (status === 'ready') {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-700">
        <CheckCircle2 className="h-4 w-4" />
        Ready
      </span>
    );
  }
  if (status === 'generating') {
    return (
      <span className="inline-flex items-center gap-1 text-amber-700">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        Generating
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-red-700">
      <XCircle className="h-4 w-4" />
      Failed
    </span>
  );
}
