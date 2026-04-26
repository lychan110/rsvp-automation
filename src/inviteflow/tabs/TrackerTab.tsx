import { useAppState } from '../state/AppContext';

interface CategoryRow {
  category: string;
  total: number;
  sent: number;
  attending: number;
  declined: number;
  noResponse: number;
}

const STAT_COLORS: Record<string, string> = {
  TOTAL: 'border-l-gray-400 dark:border-l-[#8b949e]',
  PENDING: 'border-l-gray-400 dark:border-l-[#6e7681]',
  SENT: 'border-l-green-500 dark:border-l-[#3fb950]',
  FAILED: 'border-l-red-500 dark:border-l-[#f85149]',
  ATTENDING: 'border-l-[#C8A84B]',
  DECLINED: 'border-l-red-500 dark:border-l-[#f85149]',
  'NO RESPONSE': 'border-l-gray-400 dark:border-l-[#6e7681]',
};
const STAT_VALUE_COLORS: Record<string, string> = {
  TOTAL: 'text-gray-500 dark:text-[#8b949e]',
  PENDING: 'text-gray-500 dark:text-[#6e7681]',
  SENT: 'text-green-600 dark:text-[#3fb950]',
  FAILED: 'text-red-600 dark:text-[#f85149]',
  ATTENDING: 'text-[#C8A84B]',
  DECLINED: 'text-red-600 dark:text-[#f85149]',
  'NO RESPONSE': 'text-gray-400 dark:text-[#6e7681]',
};

export default function TrackerTab() {
  const state = useAppState();
  const inv = state.invitees;

  const total = inv.length;
  const sent = inv.filter(i => i.inviteStatus === 'sent').length;
  const pending = inv.filter(i => i.inviteStatus === 'pending').length;
  const failed = inv.filter(i => i.inviteStatus === 'failed').length;
  const attending = inv.filter(i => i.rsvpStatus === 'Attending').length;
  const declined = inv.filter(i => i.rsvpStatus === 'Declined').length;
  const noResponse = inv.filter(i => i.rsvpStatus === 'No Response').length;

  const stats: [string, number][] = [
    ['TOTAL', total], ['PENDING', pending], ['SENT', sent],
    ['FAILED', failed], ['ATTENDING', attending], ['DECLINED', declined], ['NO RESPONSE', noResponse],
  ];

  const cats = Array.from(new Set(inv.map(i => i.category).filter(Boolean))).sort();
  const byCategory: CategoryRow[] = cats.map(cat => {
    const rows = inv.filter(i => i.category === cat);
    return {
      category: cat,
      total: rows.length,
      sent: rows.filter(i => i.inviteStatus === 'sent').length,
      attending: rows.filter(i => i.rsvpStatus === 'Attending').length,
      declined: rows.filter(i => i.rsvpStatus === 'Declined').length,
      noResponse: rows.filter(i => i.rsvpStatus === 'No Response').length,
    };
  });

  if (total === 0) {
    return (
      <div className="p-10 text-gray-500 text-xs text-center dark:text-[#6e7681]">
        No invitees yet. Add them in the Invitees tab.
      </div>
    );
  }

  return (
    <div className="p-5 max-w-[900px] mx-auto w-full">
      <div className="text-sm font-bold tracking-[0.08em] text-gray-900 mb-5 dark:text-[#f0f6fc]">TRACKER</div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mb-7">
        {stats.map(([label, value]) => (
          <div
            key={label}
            className={`bg-white border border-gray-200 border-l-4 rounded-lg px-4 py-3 dark:bg-[#0d1117] dark:border-[#21262d] ${STAT_COLORS[label]}`}
          >
            <div className="text-[9px] text-gray-500 tracking-[0.12em] font-mono mb-1.5 dark:text-[#6e7681]">{label}</div>
            <div className={`text-2xl font-bold ${STAT_VALUE_COLORS[label]}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* By category table */}
      {byCategory.length > 0 && (
        <>
          <div className="text-[10px] text-gray-500 tracking-widest font-mono uppercase mb-2.5 dark:text-[#6e7681]">BY CATEGORY</div>
          <div className="border border-gray-200 rounded-lg overflow-hidden dark:border-[#21262d]">
            <div className="overflow-x-auto" role="region" aria-label="Category breakdown" tabIndex={0}>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {['Category', 'Total', 'Sent', 'Attending', 'Declined', 'No Response'].map(h => (
                      <th key={h} className="text-[10px] text-gray-500 tracking-widest font-mono uppercase text-left px-3 py-2 border-b border-gray-200 dark:text-[#6e7681] dark:border-[#21262d]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {byCategory.map(row => (
                    <tr key={row.category} className="border-b border-gray-100 last:border-0 dark:border-[#161b22]">
                      <td className="text-xs text-gray-900 px-3 py-1.5 dark:text-[#c9d1d9]">{row.category}</td>
                      <td className="text-xs text-gray-700 px-3 py-1.5 dark:text-[#c9d1d9]">{row.total}</td>
                      <td className="text-xs text-green-600 px-3 py-1.5 dark:text-[#3fb950]">{row.sent}</td>
                      <td className="text-xs text-[#C8A84B] px-3 py-1.5">{row.attending}</td>
                      <td className="text-xs text-red-600 px-3 py-1.5 dark:text-[#f85149]">{row.declined}</td>
                      <td className="text-xs text-gray-500 px-3 py-1.5 dark:text-[#6e7681]">{row.noResponse}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
