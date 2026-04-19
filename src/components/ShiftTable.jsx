import { useState } from 'react'
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  Download,
  SlidersHorizontal,
} from 'lucide-react'

/* ─── Dummy Data ──────────────────────────────────────────── */
const RAW_DATA = [
  { id: 1,  date: '2026-04-01', platform: 'Amazon FC',     hoursWorked: 8.0,  grossEarnings: 120.00, deductions: 12.00, status: 'paid'    },
  { id: 2,  date: '2026-04-03', platform: 'Uber Eats',     hoursWorked: 5.5,  grossEarnings: 82.50,  deductions: 8.25,  status: 'paid'    },
  { id: 3,  date: '2026-04-05', platform: 'Deliveroo',     hoursWorked: 4.0,  grossEarnings: 60.00,  deductions: 6.00,  status: 'pending' },
  { id: 4,  date: '2026-04-07', platform: 'Tesco Extra',   hoursWorked: 8.0,  grossEarnings: 96.00,  deductions: 9.60,  status: 'paid'    },
  { id: 5,  date: '2026-04-08', platform: 'DPD Logistics', hoursWorked: 9.5,  grossEarnings: 143.00, deductions: 14.30, status: 'paid'    },
  { id: 6,  date: '2026-04-10', platform: 'Costa Coffee',  hoursWorked: 6.0,  grossEarnings: 58.00,  deductions: 5.80,  status: 'pending' },
  { id: 7,  date: '2026-04-12', platform: 'Amazon FC',     hoursWorked: 8.0,  grossEarnings: 120.00, deductions: 12.00, status: 'paid'    },
  { id: 8,  date: '2026-04-14', platform: 'Stuart',        hoursWorked: 3.5,  grossEarnings: 42.00,  deductions: 4.20,  status: 'failed'  },
  { id: 9,  date: '2026-04-15', platform: 'Uber Eats',     hoursWorked: 6.0,  grossEarnings: 90.00,  deductions: 9.00,  status: 'pending' },
  { id: 10, date: '2026-04-16', platform: 'Deliveroo',     hoursWorked: 4.5,  grossEarnings: 67.50,  deductions: 6.75,  status: 'paid'    },
  { id: 11, date: '2026-04-17', platform: 'DPD Logistics', hoursWorked: 10.0, grossEarnings: 155.00, deductions: 15.50, status: 'paid'    },
  { id: 12, date: '2026-04-18', platform: 'Tesco Extra',   hoursWorked: 7.0,  grossEarnings: 84.00,  deductions: 8.40,  status: 'pending' },
]

const DATA = RAW_DATA.map(r => ({ ...r, netIncome: +(r.grossEarnings - r.deductions).toFixed(2) }))

/* ─── Helpers ─────────────────────────────────────────────── */
const fmt = n => `£${n.toFixed(2)}`
const fmtDate = iso => {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const STATUS_STYLES = {
  paid:    'bg-emerald-400/10 text-emerald-400 border border-emerald-500/20',
  pending: 'bg-amber-400/10  text-amber-400   border border-amber-500/20',
  failed:  'bg-red-400/10    text-red-400     border border-red-500/20',
}

/* ─── Column definitions ──────────────────────────────────── */
const COLUMNS = [
  { key: 'date',          label: 'Date',           align: 'left'  },
  { key: 'platform',      label: 'Platform',        align: 'left'  },
  { key: 'hoursWorked',   label: 'Hours Worked',    align: 'right' },
  { key: 'grossEarnings', label: 'Gross Earnings',  align: 'right' },
  { key: 'deductions',    label: 'Deductions',      align: 'right' },
  { key: 'netIncome',     label: 'Net Income',      align: 'right' },
  { key: 'status',        label: 'Status',          align: 'center', sortable: false },
]

/* ─── Sort Icon ───────────────────────────────────────────── */
function SortIcon({ column, sortKey, sortDir }) {
  if (column !== sortKey) return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
  return sortDir === 'asc'
    ? <ChevronUp   className="w-3.5 h-3.5 text-brand-400" />
    : <ChevronDown className="w-3.5 h-3.5 text-brand-400" />
}

/* ─── Main Component ──────────────────────────────────────── */
export default function ShiftTable() {
  const [sortKey, setSortKey]   = useState('date')
  const [sortDir, setSortDir]   = useState('desc')
  const [search,  setSearch]    = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  /* Sorting */
  const handleSort = key => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  /* Filter + sort pipeline */
  const rows = [...DATA]
    .filter(r => {
      const matchSearch = r.platform.toLowerCase().includes(search.toLowerCase()) ||
                          fmtDate(r.date).toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || r.status === statusFilter
      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey]
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ?  1 : -1
      return 0
    })

  /* Summary totals */
  const totals = rows.reduce(
    (acc, r) => ({
      hours:   acc.hours   + r.hoursWorked,
      gross:   acc.gross   + r.grossEarnings,
      deduct:  acc.deduct  + r.deductions,
      net:     acc.net     + r.netIncome,
    }),
    { hours: 0, gross: 0, deduct: 0, net: 0 }
  )

  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden shadow-xl shadow-black/20">

      {/* ── Table header controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-surface-border">
        <div>
          <h3 className="text-white font-semibold text-base">Shift Earnings</h3>
          <p className="text-slate-400 text-xs mt-0.5">{rows.length} records</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="flex items-center gap-2 bg-surface-muted border border-surface-border rounded-xl px-3 py-2 w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              id="shift-table-search"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="bg-transparent text-xs text-slate-300 placeholder-slate-500 outline-none w-full"
            />
          </div>

          {/* Status filter pills */}
          <div className="flex bg-surface-muted border border-surface-border rounded-xl p-1 gap-1">
            {['all', 'paid', 'pending', 'failed'].map(s => (
              <button
                key={s}
                id={`shift-table-filter-${s}`}
                onClick={() => setStatusFilter(s)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg capitalize transition-all duration-200 ${
                  statusFilter === s
                    ? 'gradient-brand text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Filter icon placeholder */}
          <button
            id="shift-table-export"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white px-3 py-2 rounded-xl border border-surface-border hover:border-slate-500 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>

          <button
            id="shift-table-columns"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white px-3 py-2 rounded-xl border border-surface-border hover:border-slate-500 transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Columns
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          {/* Head */}
          <thead>
            <tr className="border-b border-surface-border bg-surface-muted/40">
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  className={`
                    py-3 px-5 text-xs font-semibold uppercase tracking-wider text-slate-500
                    whitespace-nowrap select-none
                    ${col.align === 'right'  ? 'text-right'  : ''}
                    ${col.align === 'center' ? 'text-center' : ''}
                    ${col.align === 'left'   ? 'text-left'   : ''}
                    ${col.sortable !== false ? 'cursor-pointer group hover:text-slate-300 transition-colors' : ''}
                  `}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.align === 'right' && col.sortable !== false && (
                      <SortIcon column={col.key} sortKey={sortKey} sortDir={sortDir} />
                    )}
                    {col.label}
                    {col.align !== 'right' && col.sortable !== false && (
                      <SortIcon column={col.key} sortKey={sortKey} sortDir={sortDir} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-slate-500 text-sm">
                  No shifts match your filters.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`
                    border-b border-surface-border/50 last:border-0
                    transition-colors duration-150
                    ${idx % 2 === 0 ? 'bg-transparent' : 'bg-surface-muted/20'}
                    hover:bg-brand-500/5
                  `}
                >
                  {/* Date */}
                  <td className="py-3.5 px-5 text-slate-300 whitespace-nowrap">
                    {fmtDate(row.date)}
                  </td>

                  {/* Platform */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2.5">
                      {/* Color dot keyed by platform initial */}
                      <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 opacity-80" />
                      <span className="text-white font-medium">{row.platform}</span>
                    </div>
                  </td>

                  {/* Hours Worked */}
                  <td className="py-3.5 px-5 text-right text-slate-300 tabular-nums">
                    {row.hoursWorked.toFixed(1)} hrs
                  </td>

                  {/* Gross Earnings */}
                  <td className="py-3.5 px-5 text-right text-slate-300 tabular-nums">
                    {fmt(row.grossEarnings)}
                  </td>

                  {/* Deductions */}
                  <td className="py-3.5 px-5 text-right tabular-nums">
                    <span className="text-red-400">−{fmt(row.deductions)}</span>
                  </td>

                  {/* Net Income */}
                  <td className="py-3.5 px-5 text-right tabular-nums">
                    <span className="text-emerald-400 font-semibold">{fmt(row.netIncome)}</span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-5 text-center">
                    <span className={`
                      inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize
                      ${STATUS_STYLES[row.status]}
                    `}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {/* ── Summary footer ── */}
          {rows.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-surface-border bg-surface-muted/50">
                <td className="py-3.5 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider" colSpan={2}>
                  Totals ({rows.length} shifts)
                </td>
                <td className="py-3.5 px-5 text-right text-white font-bold tabular-nums text-sm">
                  {totals.hours.toFixed(1)} hrs
                </td>
                <td className="py-3.5 px-5 text-right text-white font-bold tabular-nums text-sm">
                  {fmt(totals.gross)}
                </td>
                <td className="py-3.5 px-5 text-right font-bold tabular-nums text-sm">
                  <span className="text-red-400">−{fmt(totals.deduct)}</span>
                </td>
                <td className="py-3.5 px-5 text-right font-bold tabular-nums text-sm">
                  <span className="text-emerald-400">{fmt(totals.net)}</span>
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
