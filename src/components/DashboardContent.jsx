import { useState } from 'react'
import {
  TrendingUp, Clock, DollarSign, Star,
  ChevronRight, ArrowUpRight, ArrowDownRight,
  Briefcase, MapPin, CheckCircle2, AlertCircle, Plus,
} from 'lucide-react'
import ShiftTable from './ShiftTable'
import ShiftForm  from './ShiftForm'


/* ─── Stat Card ─────────────────────────────────────────── */
function StatCard({ label, value, sub, delta, positive, gradient, icon: Icon }) {
  return (
    <div className={`
      relative overflow-hidden rounded-2xl p-5 card-glow transition-all duration-300
      bg-surface-card border border-surface-border cursor-default
    `}>
      {/* Gradient blob */}
      <div className={`absolute -top-4 -right-4 w-24 h-24 ${gradient} rounded-full opacity-15 blur-2xl`} />

      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {delta !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ${
            positive
              ? 'text-emerald-400 bg-emerald-400/10'
              : 'text-red-400 bg-red-400/10'
          }`}>
            {positive
              ? <ArrowUpRight className="w-3 h-3" />
              : <ArrowDownRight className="w-3 h-3" />
            }
            {delta}
          </span>
        )}
      </div>

      <p className="text-3xl font-bold text-white tracking-tight mb-1">{value}</p>
      <p className="text-sm font-medium text-slate-300">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  )
}

/* ─── Shift Row ──────────────────────────────────────────── */
function ShiftRow({ company, role, time, pay, status }) {
  const statusStyles = {
    confirmed: 'bg-emerald-400/10 text-emerald-400',
    pending:   'bg-amber-400/10  text-amber-400',
    completed: 'bg-slate-400/10  text-slate-400',
  }
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-surface-border/60 last:border-0 group">
      <div className="w-9 h-9 rounded-xl bg-surface-muted flex items-center justify-center shrink-0">
        <Briefcase className="w-4 h-4 text-brand-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{role}</p>
        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3" />{company} · {time}
        </p>
      </div>
      <p className="text-sm font-semibold text-emerald-400 shrink-0">{pay}</p>
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${statusStyles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  )
}

/* ─── Activity Row ───────────────────────────────────────── */
function ActivityItem({ icon: Icon, color, text, time }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className={`w-7 h-7 ${color} rounded-lg flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-300">{text}</p>
        <p className="text-xs text-slate-500 mt-0.5">{time}</p>
      </div>
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────── */
export default function DashboardContent() {
  const [showForm, setShowForm] = useState(false)
  const stats = [
    { label: 'Total Earnings',  value: '£3,284',  sub: 'This month',       delta: '+12.4%', positive: true,  gradient: 'gradient-brand',   icon: DollarSign  },
    { label: 'Hours Worked',    value: '142 hrs',  sub: 'Apr 2026',         delta: '+8.1%',  positive: true,  gradient: 'gradient-success', icon: Clock       },
    { label: 'Upcoming Shifts', value: '6',        sub: 'Next 7 days',      delta: undefined,                 gradient: 'gradient-warning', icon: TrendingUp  },
    { label: 'Rating',          value: '4.9 ★',    sub: 'Based on 87 reviews',                               gradient: 'gradient-purple',  icon: Star        },
  ]

  const shifts = [
    { company: 'Amazon FC',      role: 'Warehouse Operative', time: 'Today, 14:00',   pay: '£120.00', status: 'confirmed' },
    { company: 'Uber Eats',      role: 'Delivery Partner',    time: 'Tomorrow, 09:00',pay: '£85.50',  status: 'pending'   },
    { company: 'Deliveroo',      role: 'Cyclist Courier',     time: 'Mon, 18:30',     pay: '£67.00',  status: 'confirmed' },
    { company: 'Tesco Extra',    role: 'Shelf Stacker',       time: 'Tue, 06:00',     pay: '£96.00',  status: 'pending'   },
    { company: 'DPD Logistics',  role: 'Van Driver',          time: '18 Apr',         pay: '£143.00', status: 'completed' },
  ]

  const activities = [
    { icon: CheckCircle2, color: 'gradient-success', text: 'Shift confirmed at Amazon FC',      time: '2 hours ago'    },
    { icon: DollarSign,   color: 'gradient-brand',   text: 'Payment of £85.50 received',        time: '5 hours ago'    },
    { icon: Star,         color: 'gradient-warning',  text: 'New 5★ review from Deliveroo',     time: 'Yesterday'      },
    { icon: AlertCircle,  color: 'gradient-danger',   text: 'Grievance #GR-084 under review',   time: '2 days ago'     },
    { icon: CheckCircle2, color: 'gradient-purple',   text: 'Food Hygiene certificate renewed',  time: '3 days ago'     },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Greeting banner */}
      <div className="relative overflow-hidden rounded-2xl gradient-brand p-6 shadow-2xl shadow-brand-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_60%)]" />
        <div className="relative">
          <p className="text-blue-100 text-sm font-medium mb-1">Sunday, 19 April 2026</p>
          <h2 className="text-white text-2xl font-bold mb-1">Good morning, Adeel! 👋</h2>
          <p className="text-blue-200 text-sm">You have <strong className="text-white">2 shifts today</strong> and <strong className="text-white">£220.50</strong> pending payment.</p>
        </div>
        <div className="relative mt-5 flex gap-3">
          <button id="dashboard-find-shifts-btn" className="bg-white/20 hover:bg-white/30 border border-white/30 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5">
            Find Shifts <ChevronRight className="w-4 h-4" />
          </button>
          <button id="dashboard-view-earnings-btn" className="bg-white text-brand-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 transition-all duration-200">
            View Earnings
          </button>
          <button
            id="dashboard-log-shift-btn"
            onClick={() => setShowForm(f => !f)}
            className="ml-auto flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4" /> Log Shift
          </button>
        </div>
      </div>

      {/* Stat cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Bottom two-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming shifts – 2/3 width */}
        <div className="lg:col-span-2 bg-surface-card border border-surface-border rounded-2xl p-6 card-glow">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold">Upcoming Shifts</h3>
            <button id="dashboard-view-all-shifts" className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1 transition-colors">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {shifts.map((s, i) => <ShiftRow key={i} {...s} />)}
        </div>

        {/* Recent activity – 1/3 */}
        <div className="bg-surface-card border border-surface-border rounded-2xl p-6 card-glow">
          <h3 className="text-white font-semibold mb-5">Recent Activity</h3>
          <div className="space-y-1">
            {activities.map((a, i) => <ActivityItem key={i} {...a} />)}
          </div>
          <button id="dashboard-view-all-activity" className="w-full mt-4 text-xs text-brand-400 hover:text-brand-300 font-medium text-center transition-colors">
            View all activity
          </button>
        </div>
      </div>

      {/* Log shift form — toggled by banner CTA */}
      {showForm && (
        <ShiftForm
          onSubmitSuccess={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Shift earnings table */}
      <ShiftTable />
    </div>
  )
}
