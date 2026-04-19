import { MessageSquareWarning, Plus, Clock, CheckCircle2, XCircle, ChevronRight, AlertCircle, Paperclip, Send } from 'lucide-react'

const grievances = [
  {
    id: 'GR-084',
    title: 'Unpaid overtime – Amazon FC shift 12 Apr',
    category: 'Wage Dispute',
    submitted: '14 Apr 2026',
    updated: '17 Apr 2026',
    status: 'under_review',
    priority: 'high',
    description: 'I worked 3 hours beyond my contracted 8-hour shift on 12 April but was only paid for 8 hours. I have raised this with my supervisor but received no response.',
  },
  {
    id: 'GR-081',
    title: 'Unsafe working conditions at DPD depot',
    category: 'Health & Safety',
    submitted: '2 Apr 2026',
    updated: '10 Apr 2026',
    status: 'resolved',
    priority: 'medium',
    description: 'Wet floor with no warning signs in the loading bay area. Reported to site manager.',
  },
  {
    id: 'GR-077',
    title: 'App cancellation penalty applied unfairly',
    category: 'App/Platform Issue',
    submitted: '18 Mar 2026',
    updated: '25 Mar 2026',
    status: 'closed',
    priority: 'low',
    description: 'Charged £15 cancellation fee despite cancelling within the allowed 30-minute window.',
  },
]

const statusConfig = {
  under_review: { icon: Clock,         bg: 'bg-amber-400/10',   text: 'text-amber-400',   label: 'Under Review' },
  resolved:     { icon: CheckCircle2,  bg: 'bg-emerald-400/10', text: 'text-emerald-400', label: 'Resolved'     },
  closed:       { icon: XCircle,       bg: 'bg-slate-400/10',   text: 'text-slate-400',   label: 'Closed'       },
  open:         { icon: AlertCircle,   bg: 'bg-red-400/10',     text: 'text-red-400',     label: 'Open'         },
}

const priorityConfig = {
  high:   'bg-red-400/10    text-red-400   border-red-500/20',
  medium: 'bg-amber-400/10  text-amber-400  border-amber-500/20',
  low:    'bg-slate-400/10  text-slate-400  border-slate-500/20',
}

function GrievanceCard({ id, title, category, submitted, updated, status, priority, description }) {
  const sc = statusConfig[status]
  const StatusIcon = sc.icon
  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl p-5 card-glow transition-all duration-300 hover:-translate-y-0.5 flex flex-col gap-4">
      {/* Top */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl gradient-danger flex items-center justify-center shrink-0 shadow-md">
            <MessageSquareWarning className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-snug truncate">{title}</p>
            <p className="text-xs text-slate-400 mt-0.5">{id} · {category}</p>
          </div>
        </div>
        <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${sc.bg} ${sc.text}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {sc.label}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{description}</p>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>Submitted: <span className="text-slate-400">{submitted}</span></span>
        <span className="w-1 h-1 rounded-full bg-slate-600" />
        <span>Updated: <span className="text-slate-400">{updated}</span></span>
        <span className={`ml-auto px-2 py-0.5 rounded-full border text-xs font-medium capitalize ${priorityConfig[priority]}`}>
          {priority} priority
        </span>
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-surface-border flex gap-2">
        <button id={`grievance-view-${id}`} className="flex-1 text-xs font-medium py-2 rounded-xl border border-surface-border text-slate-400 hover:text-white hover:border-slate-500 transition-all flex items-center justify-center gap-1.5">
          View Details <ChevronRight className="w-3.5 h-3.5" />
        </button>
        {status === 'under_review' && (
          <button id={`grievance-followup-${id}`} className="flex-1 text-xs font-medium py-2 rounded-xl gradient-brand text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5">
            Follow Up <Send className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

export default function GrievanceContent() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-white font-bold text-xl">Grievances</h2>
          <p className="text-slate-400 text-sm mt-0.5">Submit and track workplace concerns</p>
        </div>
        <button id="grievance-new" className="flex items-center gap-2 gradient-brand text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-brand-500/25">
          <Plus className="w-4 h-4" /> New Grievance
        </button>
      </div>

      {/* Info banner */}
      <div className="rounded-2xl bg-brand-900/30 border border-brand-800/40 p-5 flex items-start gap-4">
        <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center shrink-0 shadow-md">
          <AlertCircle className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-white text-sm font-semibold mb-1">Know your rights</p>
          <p className="text-slate-400 text-xs leading-relaxed">
            You have the right to raise a grievance without fear of victimisation. FairGig will acknowledge your submission within <strong className="text-slate-300">2 working days</strong> and aim to resolve it within <strong className="text-slate-300">14 days</strong>.
          </p>
        </div>
      </div>

      {/* Grievance cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {grievances.map(g => <GrievanceCard key={g.id} {...g} />)}

        {/* New submission placeholder */}
        <button id="grievance-submit-new" className="rounded-2xl border-2 border-dashed border-surface-border hover:border-brand-500/50 bg-surface-card/50 hover:bg-brand-500/5 transition-all duration-300 flex flex-col items-center justify-center gap-3 p-8 text-center group min-h-[200px]">
          <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-slate-600 group-hover:border-brand-400 flex items-center justify-center transition-colors">
            <Paperclip className="w-5 h-5 text-slate-500 group-hover:text-brand-400 transition-colors" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">Submit a new grievance</p>
            <p className="text-xs text-slate-500 mt-0.5">Describe your issue and attach evidence</p>
          </div>
        </button>
      </div>
    </div>
  )
}
