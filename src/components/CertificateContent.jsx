import { BadgeCheck, Download, Calendar, Clock, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react'

const certificates = [
  {
    id: 'CERT-001',
    name: 'Food Hygiene Level 2',
    issuer: 'Highfield Qualifications',
    issued: '15 Jan 2025',
    expires: '15 Jan 2028',
    status: 'valid',
    code: 'FH2-2025-8841',
  },
  {
    id: 'CERT-002',
    name: 'Manual Handling',
    issuer: 'RoSPA',
    issued: '3 Mar 2024',
    expires: '3 Mar 2026',
    status: 'expiring',
    code: 'MH-2024-3342',
  },
  {
    id: 'CERT-003',
    name: 'First Aid at Work',
    issuer: 'St John Ambulance',
    issued: '10 Jun 2022',
    expires: '10 Jun 2025',
    status: 'expired',
    code: 'FAW-2022-6601',
  },
  {
    id: 'CERT-004',
    name: 'CSCS Card – Labourer',
    issuer: 'CSCS UK',
    issued: '22 Nov 2023',
    expires: '22 Nov 2028',
    status: 'valid',
    code: 'CSCS-2023-9987',
  },
]

const statusConfig = {
  valid:    { icon: CheckCircle2, bg: 'bg-emerald-400/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Valid' },
  expiring: { icon: AlertCircle,  bg: 'bg-amber-400/10',   text: 'text-amber-400',   border: 'border-amber-500/20',   label: 'Expiring Soon' },
  expired:  { icon: AlertCircle,  bg: 'bg-red-400/10',     text: 'text-red-400',     border: 'border-red-500/20',     label: 'Expired' },
}

function CertCard({ id, name, issuer, issued, expires, status, code }) {
  const cfg = statusConfig[status]
  const StatusIcon = cfg.icon
  return (
    <div className={`bg-surface-card border ${cfg.border} rounded-2xl p-6 card-glow transition-all duration-300 hover:-translate-y-0.5`}>
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 gradient-brand rounded-2xl flex items-center justify-center shadow-lg">
          <BadgeCheck className="w-6 h-6 text-white" />
        </div>
        <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {cfg.label}
        </span>
      </div>

      {/* Info */}
      <h4 className="text-white font-semibold text-base mb-1">{name}</h4>
      <p className="text-slate-400 text-sm mb-4">{issuer}</p>

      <div className="space-y-2 mb-5">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Issued: <span className="text-slate-300">{issued}</span></span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Expires: <span className={status === 'expired' ? 'text-red-400 font-medium' : 'text-slate-300'}>{expires}</span></span>
        </div>
      </div>

      {/* Certificate code */}
      <div className="bg-surface-muted rounded-xl px-3 py-2 mb-4">
        <p className="text-xs text-slate-500 mb-0.5">Certificate No.</p>
        <p className="text-xs font-mono text-brand-300 tracking-wide">{code}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button id={`cert-download-${id}`} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 rounded-xl gradient-brand text-white hover:opacity-90 transition-opacity">
          <Download className="w-3.5 h-3.5" /> Download
        </button>
        {status !== 'valid' && (
          <button id={`cert-renew-${id}`} className="flex items-center gap-1.5 text-xs font-medium px-3 py-2.5 rounded-xl border border-amber-500/30 text-amber-400 hover:bg-amber-400/10 transition-all">
            <RefreshCw className="w-3.5 h-3.5" /> Renew
          </button>
        )}
      </div>
    </div>
  )
}

export default function CertificateContent() {
  const valid    = certificates.filter(c => c.status === 'valid').length
  const expiring = certificates.filter(c => c.status === 'expiring').length
  const expired  = certificates.filter(c => c.status === 'expired').length

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-white font-bold text-xl">My Certificates</h2>
          <p className="text-slate-400 text-sm mt-0.5">Manage and download your professional certifications</p>
        </div>
        <button id="cert-upload-new" className="flex items-center gap-2 gradient-brand text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-brand-500/25">
          <BadgeCheck className="w-4 h-4" /> Upload Certificate
        </button>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Valid',         count: valid,    style: 'bg-emerald-400/10 text-emerald-400 border-emerald-500/20' },
          { label: 'Expiring Soon', count: expiring, style: 'bg-amber-400/10  text-amber-400   border-amber-500/20'   },
          { label: 'Expired',       count: expired,  style: 'bg-red-400/10    text-red-400     border-red-500/20'     },
        ].map(p => (
          <div key={p.label} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${p.style}`}>
            <span className="text-lg font-bold">{p.count}</span>
            <span>{p.label}</span>
          </div>
        ))}
      </div>

      {/* Certificate grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {certificates.map(c => <CertCard key={c.id} {...c} />)}

        {/* Upload placeholder */}
        <button id="cert-add-placeholder" className="rounded-2xl border-2 border-dashed border-surface-border hover:border-brand-500/50 bg-surface-card/50 hover:bg-brand-500/5 transition-all duration-300 flex flex-col items-center justify-center gap-3 p-8 text-center group min-h-[220px]">
          <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-slate-600 group-hover:border-brand-400 flex items-center justify-center transition-colors">
            <BadgeCheck className="w-5 h-5 text-slate-500 group-hover:text-brand-400 transition-colors" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">Add a certificate</p>
            <p className="text-xs text-slate-500 mt-0.5">PDF, JPG, or PNG up to 10MB</p>
          </div>
        </button>
      </div>
    </div>
  )
}
