import React, { useMemo, useState } from 'react';
import { Inbox } from 'lucide-react';

const FALLBACK_ENTRIES = [
  {
    id: '1',
    actor: 'Ria Sharma (Marketing Head)',
    action: 'Created payment link',
    module: 'Payment Links',
    detail: 'BSW Standard — ₹99 · Google Ads',
    timestamp: '26 Apr 2026, 3:42 PM',
    relative_time: '2 hours ago',
    type: 'create',
  },
  {
    id: '2',
    actor: 'Ria Sharma (Marketing Head)',
    action: 'Edited UTM Source',
    module: 'UTM',
    field: 'UTM Source',
    old_value: 'Google',
    new_value: 'Facebook',
    reason: 'Campaign attribution correction',
    timestamp: '26 Apr 2026, 11:20 AM',
    relative_time: '6 hours ago',
    type: 'edit',
  },
  {
    id: '3',
    actor: 'System',
    action: 'Zoom attendance synced',
    module: 'BSW',
    detail: 'BSW April Week 3 · 198 attendees synced',
    timestamp: '26 Apr 2026, 8:05 PM',
    relative_time: 'Yesterday',
    type: 'trigger',
  },
  {
    id: '4',
    actor: 'Amit Patel (Marketing Team)',
    action: 'Deactivated payment link',
    module: 'Payment Links',
    detail: 'PACE Direct — ₹18,000',
    timestamp: '25 Apr 2026, 2:30 PM',
    relative_time: '2 days ago',
    type: 'deactivate',
  },
  {
    id: '5',
    actor: 'Ria Sharma (Marketing Head)',
    action: 'Processed manual refund',
    module: 'PACE Payments',
    field: 'Payment Status',
    old_value: 'Captured',
    new_value: 'Refunded',
    reason: 'Client cancelled — duplicate registration',
    timestamp: '24 Apr 2026, 4:15 PM',
    relative_time: '3 days ago',
    type: 'edit',
  },
  {
    id: '6',
    actor: 'Ria Sharma (Marketing Head)',
    action: 'Updated sketch note link',
    module: 'Settings',
    field: 'Sketch note link',
    old_value: '...batch=BSW-MAR-W3',
    new_value: '...batch=BSW-APR-W3',
    timestamp: '20 Apr 2026, 9:00 AM',
    relative_time: '1 week ago',
    type: 'edit',
  },
];

const TYPE_COLORS = {
  create: '#4CAF50',
  edit: '#2563EB',
  deactivate: '#F59E0B',
  reactivate: '#4CAF50',
  trigger: '#9B9890',
  login: '#9B9890',
};

const getTypeColor = (type) => TYPE_COLORS[type] || '#9B9890';

const SkeletonRows = () => (
  <div className="space-y-0">
    {[1, 2, 3].map((row) => (
      <div
        key={row}
        className="grid grid-cols-[12px_1fr_auto] gap-3 py-3 items-start border-b border-[#F5F4F1] last:border-b-0"
      >
        <div className="w-2 h-2 rounded-full bg-[#E5E7EB] mt-1 animate-pulse" />
        <div className="space-y-2">
          <div className="h-3 w-3/4 rounded bg-[#E5E7EB] animate-pulse" />
          <div className="h-3 w-2/3 rounded bg-[#F1F2F4] animate-pulse" />
        </div>
        <div className="h-3 w-16 rounded bg-[#F1F2F4] animate-pulse mt-0.5" />
      </div>
    ))}
  </div>
);

const AuditTrail = ({
  entries,
  title = 'Audit log',
  collapsible = false,
  maxVisible = 5,
  isLoading = false,
}) => {
  const data = useMemo(() => {
    if (Array.isArray(entries)) return entries;
    return FALLBACK_ENTRIES;
  }, [entries]);

  const [isCollapsed, setIsCollapsed] = useState(Boolean(collapsible));
  const [showAll, setShowAll] = useState(false);

  const hasOverflow = data.length > maxVisible;
  const visibleEntries = showAll ? data : data.slice(0, maxVisible);
  const hiddenCount = Math.max(data.length - maxVisible, 0);

  return (
    <div className="bg-white border border-[#E4E2DC] rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-medium text-[#2F2E2B]">{title}</h3>
        {collapsible && (
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="text-[12px] text-[#5A5A56] hover:text-[#1F2937]"
          >
            {isCollapsed ? '▾ Expand' : '▴ Collapse'}
          </button>
        )}
      </div>

      {!isCollapsed && (
        <div className="mt-3">
          {isLoading ? (
            <SkeletonRows />
          ) : visibleEntries.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-300 opacity-30" />
              <h3 className="text-sm font-semibold text-gray-700 mb-4">No activity recorded yet.</h3>
            </div>
          ) : (
            <div className="space-y-0">
              {visibleEntries.map((entry) => {
                const hasFieldChange =
                  entry.field && entry.old_value !== undefined && entry.new_value !== undefined;

                return (
                  <div
                    key={entry.id}
                    className="grid grid-cols-[12px_1fr_auto] gap-3 py-3 items-start border-b border-[#F5F4F1] last:border-b-0"
                  >
                    <span
                      className="w-2 h-2 rounded-full mt-1"
                      style={{ backgroundColor: getTypeColor(entry.type) }}
                    />

                    <div className="min-w-0">
                      <p className="text-[12px] text-[#2F2E2B] leading-5">
                        <span className="font-medium">{entry.actor}</span>{' '}
                        <span className="font-normal">{entry.action}</span>
                      </p>

                      {hasFieldChange && (
                        <p className="text-[11px] text-[#9B9890] mt-1 leading-4 break-words">
                          {entry.field}: {entry.old_value} {'\u2192'} {entry.new_value}
                        </p>
                      )}

                      {entry.reason && (
                        <p className="text-[11px] italic text-[#9B9890] mt-1 leading-4 break-words">
                          Reason: {entry.reason}
                        </p>
                      )}

                      {entry.detail && (
                        <p className="text-[11px] text-[#9B9890] mt-1 leading-4 break-words">
                          {entry.detail}
                        </p>
                      )}
                    </div>

                    <span
                      className="text-[11px] text-[#9B9890] whitespace-nowrap mt-0.5"
                      title={entry.timestamp}
                    >
                      {entry.relative_time}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && hasOverflow && (
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="mt-3 text-[12px] text-[#2563EB] hover:text-[#1D4ED8]"
            >
              {showAll
                ? 'Show less \u2191'
                : `Show ${hiddenCount} more entries \u2193`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditTrail;
export { FALLBACK_ENTRIES };
