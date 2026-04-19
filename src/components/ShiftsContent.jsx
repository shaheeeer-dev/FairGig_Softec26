import { MapPin, Clock, DollarSign, Filter, Plus, Search, ChevronDown, Briefcase } from 'lucide-react'

const allShifts = [
  { id: 'SH-001', role: 'Warehouse Operative', company: 'Amazon FC',     location: 'Birmingham, B37', date: 'Sun 19 Apr', time: '14:00–22:00', pay: '£120.00', status: 'confirmed',  type: 'Full-time' },
  { id: 'SH-002', role: 'Delivery Partner',    company: 'Uber Eats',     location: 'Manchester, M1',  date: 'Mon 20 Apr', time: '09:00–17:00', pay: '£85.50',  status: 'pending',    type: 'Part-time' },
  { id: 'SH-003', role: 'Cyclist Courier',     company: 'Deliveroo',     location: 'London, EC1',     date: 'Mon 20 Apr', time: '18:30–23:00', pay: '£67.00',  status: 'confirmed',  type: 'Gig'       },
  { id: 'SH-004', role: 'Shelf Stacker',       company: 'Tesco Extra',   location: 'Leeds, LS1',      date: 'Tue 21 Apr', time: '06:00–14:00', pay: '£96.00',  status: 'pending',    type: 'Part-time' },
  { id: 'SH-005', role: 'Van Driver',          company: 'DPD Logistics', location: 'Bristol, BS1',    date: 'Fri 18 Apr', time: '07:00–15:00', pay: '£143.00', status: 'completed',  type: 'Full-time' },
  { id: 'SH-006', role: 'Barista',             company: 'Costa Coffee',  location: 'Edinburgh, EH1',  date: 'Wed 22 Apr', time: '06:30–12:30', pay: '£58.00',  status: 'confirmed',  type: 'Part-time' },
]

const statusStyles = {
  confirmed: { bg: 'bg-emerald-400/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  pending:   { bg: 'bg-amber-400/10',   text: 'text-amber-400',   dot: 'bg-amber-400'   },
  completed: { bg: 'bg-slate-400/10',   text: 'text-slate-400',   dot: 'bg-slate-500'   },
}

function ShiftCard({ id, role, company, location, date, time, pay, status, type }) {
  const s = statusStyles[status]
  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl p-5 card-glow transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center shadow-md">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{role}</p>
            <p className="text-slate-400 text-xs">{company}</p>
          </div>
        </div>
        <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-500" />{location}</span>
        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-500" />{time}</span>
        <span className="flex items-center gap-1.5 text-slate-300 font-medium">{date}</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 bg-brand-900/50 text-brand-300 rounded-md font-medium">{type}</span>
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-surface-border">
        <p className="text-emerald-400 font-bold text-base">{pay}</p>
        <div className="flex gap-2">
          <button id={`shift-details-${id}`} className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-surface-border hover:border-slate-500 transition-all">
            Details
          </button>
          {status === 'pending' && (
            <button id={`shift-accept-${id}`} className="text-xs text-white px-3 py-1.5 rounded-lg gradient-brand hover:opacity-90 transition-opacity font-medium">
              Accept
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ShiftsContent() {
  const tabs = ['All', 'Confirmed', 'Pending', 'Completed']

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-white font-bold text-xl">My Shifts</h2>
          <p className="text-slate-400 text-sm mt-0.5">{allShifts.length} shifts scheduled this month</p>
        </div>
        <button id="shifts-add-new" className="flex items-center gap-2 gradient-brand text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-brand-500/25">
          <Plus className="w-4 h-4" /> Add Shift
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 bg-surface-card border border-surface-border rounded-xl px-3 py-2.5 flex-1 min-w-[200px] max-w-xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input id="shifts-search" type="text" placeholder="Search shifts…" className="bg-transparent text-sm text-slate-300 placeholder-slate-500 outline-none w-full" />
        </div>
        {/* Filter button */}
        <button id="shifts-filter" className="flex items-center gap-2 bg-surface-card border border-surface-border rounded-xl px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:border-brand-500 transition-all">
          <Filter className="w-4 h-4" /> Filter <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </button>
        {/* Tabs */}
        <div className="flex bg-surface-card border border-surface-border rounded-xl p-1 gap-1">
          {tabs.map(tab => (
            <button
              key={tab}
              id={`shifts-tab-${tab.toLowerCase()}`}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
                tab === 'All'
                  ? 'gradient-brand text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Shift cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {allShifts.map(s => <ShiftCard key={s.id} {...s} />)}
      </div>
    </div>
  )
}
