import { useState } from 'react'
import {
  Calendar,
  Clock,
  DollarSign,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  X,
  Calculator,
  Building2,
} from 'lucide-react'

/* ─── Constants ───────────────────────────────────────────── */
const PLATFORMS = [
  'Amazon FC',
  'Uber Eats',
  'Deliveroo',
  'DPD Logistics',
  'Tesco Extra',
  'Stuart',
  'Costa Coffee',
  'Just Eat',
  'Hermes / Evri',
  'Other',
]

const EMPTY_FORM = {
  platform:     '',
  date:         '',
  hoursWorked:  '',
  grossEarnings:'',
  deductions:   '',
}

/* ─── Validation rules ────────────────────────────────────── */
function validate(fields) {
  const errs = {}

  if (!fields.platform)
    errs.platform = 'Please select a platform.'

  if (!fields.date)
    errs.date = 'Date is required.'
  else if (new Date(fields.date) > new Date())
    errs.date = 'Date cannot be in the future.'

  const hrs = parseFloat(fields.hoursWorked)
  if (fields.hoursWorked === '')
    errs.hoursWorked = 'Hours worked is required.'
  else if (isNaN(hrs) || hrs <= 0)
    errs.hoursWorked = 'Enter a positive number of hours.'
  else if (hrs > 24)
    errs.hoursWorked = 'Hours cannot exceed 24 in a single shift.'

  const gross = parseFloat(fields.grossEarnings)
  if (fields.grossEarnings === '')
    errs.grossEarnings = 'Gross earnings is required.'
  else if (isNaN(gross) || gross < 0)
    errs.grossEarnings = 'Enter a valid amount (0 or more).'

  const ded = parseFloat(fields.deductions)
  if (fields.deductions === '')
    errs.deductions = 'Enter deductions (use 0 if none).'
  else if (isNaN(ded) || ded < 0)
    errs.deductions = 'Deductions cannot be negative.'
  else if (!isNaN(gross) && ded > gross)
    errs.deductions = 'Deductions cannot exceed gross earnings.'

  return errs
}

/* ─── Sub-components ──────────────────────────────────────── */
function FieldLabel({ htmlFor, children, required }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
      {children}
      {required && <span className="text-brand-400 ml-1">*</span>}
    </label>
  )
}

function ErrorMsg({ message }) {
  if (!message) return null
  return (
    <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1.5 animate-[fadeIn_0.15s_ease]">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </p>
  )
}

function InputWrapper({ error, children }) {
  return (
    <div className={`
      flex items-center gap-2.5 w-full rounded-xl border px-3.5 py-3
      bg-surface-muted transition-all duration-200 focus-within:ring-2 focus-within:ring-brand-500/40
      ${error
        ? 'border-red-500/50 focus-within:border-red-500'
        : 'border-surface-border focus-within:border-brand-500'
      }
    `}>
      {children}
    </div>
  )
}

/* ─── Main Component ──────────────────────────────────────── */
export default function ShiftForm({ onSubmitSuccess, onCancel }) {
  const [fields,  setFields]  = useState(EMPTY_FORM)
  const [errors,  setErrors]  = useState({})
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)

  /* Live-compute net income */
  const gross = parseFloat(fields.grossEarnings) || 0
  const ded   = parseFloat(fields.deductions)    || 0
  const net   = gross - ded

  /* Helpers */
  const touch  = key => setTouched(t => ({ ...t, [key]: true }))
  const change = (key, val) => {
    const next = { ...fields, [key]: val }
    setFields(next)
    if (touched[key]) setErrors(validate(next))
  }

  const handleBlur = key => {
    touch(key)
    setErrors(prev => ({ ...prev, ...validate(fields) }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    const allTouched = Object.fromEntries(Object.keys(EMPTY_FORM).map(k => [k, true]))
    setTouched(allTouched)
    const errs = validate(fields)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    /* No API — just surface the data */
    setSubmitted(true)
    onSubmitSuccess?.({ ...fields, netIncome: net.toFixed(2) })
  }

  const handleReset = () => {
    setFields(EMPTY_FORM)
    setErrors({})
    setTouched({})
    setSubmitted(false)
  }

  /* ── Success state ── */
  if (submitted) {
    return (
      <div className="bg-surface-card border border-surface-border rounded-2xl p-8 flex flex-col items-center text-center gap-5 shadow-xl shadow-black/20">
        <div className="w-16 h-16 gradient-success rounded-2xl flex items-center justify-center shadow-lg">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg mb-1">Shift logged!</h3>
          <p className="text-slate-400 text-sm">
            <span className="text-emerald-400 font-semibold">£{net.toFixed(2)}</span> net income recorded
            for <span className="text-white font-medium">{fields.platform}</span> on{' '}
            {new Date(fields.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            id="shift-form-log-another"
            onClick={handleReset}
            className="gradient-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-brand-500/25"
          >
            Log another shift
          </button>
          {onCancel && (
            <button
              id="shift-form-done"
              onClick={onCancel}
              className="text-slate-400 hover:text-white text-sm font-medium px-5 py-2.5 rounded-xl border border-surface-border hover:border-slate-500 transition-all"
            >
              Done
            </button>
          )}
        </div>
      </div>
    )
  }

  /* ── Form ── */
  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl shadow-xl shadow-black/20 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-surface-border">
        <div>
          <h3 className="text-white font-semibold text-base">Log a Shift</h3>
          <p className="text-slate-400 text-xs mt-0.5">Record your gig earnings and deductions</p>
        </div>
        {onCancel && (
          <button
            id="shift-form-close"
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-surface-muted transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <form id="shift-form" onSubmit={handleSubmit} noValidate>
        <div className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">

          {/* Platform */}
          <div className="sm:col-span-2">
            <FieldLabel htmlFor="sf-platform" required>Platform</FieldLabel>
            <InputWrapper error={errors.platform}>
              <Building2 className={`w-4 h-4 shrink-0 ${errors.platform ? 'text-red-400' : 'text-slate-500'}`} />
              <div className="relative flex-1">
                <select
                  id="sf-platform"
                  value={fields.platform}
                  onChange={e => change('platform', e.target.value)}
                  onBlur={() => handleBlur('platform')}
                  className={`
                    w-full bg-transparent text-sm outline-none appearance-none pr-6 cursor-pointer
                    ${fields.platform ? 'text-white' : 'text-slate-500'}
                  `}
                >
                  <option value="" disabled>Select a platform...</option>
                  {PLATFORMS.map(p => (
                    <option key={p} value={p} className="bg-surface-card text-white">{p}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </InputWrapper>
            <ErrorMsg message={errors.platform} />
          </div>

          {/* Date */}
          <div>
            <FieldLabel htmlFor="sf-date" required>Shift Date</FieldLabel>
            <InputWrapper error={errors.date}>
              <Calendar className={`w-4 h-4 shrink-0 ${errors.date ? 'text-red-400' : 'text-slate-500'}`} />
              <input
                id="sf-date"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={fields.date}
                onChange={e => change('date', e.target.value)}
                onBlur={() => handleBlur('date')}
                className="flex-1 bg-transparent text-sm text-white outline-none [color-scheme:dark] cursor-pointer"
              />
            </InputWrapper>
            <ErrorMsg message={errors.date} />
          </div>

          {/* Hours worked */}
          <div>
            <FieldLabel htmlFor="sf-hours" required>Hours Worked</FieldLabel>
            <InputWrapper error={errors.hoursWorked}>
              <Clock className={`w-4 h-4 shrink-0 ${errors.hoursWorked ? 'text-red-400' : 'text-slate-500'}`} />
              <input
                id="sf-hours"
                type="number"
                step="0.5"
                min="0"
                max="24"
                placeholder="e.g. 7.5"
                value={fields.hoursWorked}
                onChange={e => change('hoursWorked', e.target.value)}
                onBlur={() => handleBlur('hoursWorked')}
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-xs text-slate-500 shrink-0">hrs</span>
            </InputWrapper>
            <ErrorMsg message={errors.hoursWorked} />
          </div>

          {/* Gross earnings */}
          <div>
            <FieldLabel htmlFor="sf-gross" required>Gross Earnings</FieldLabel>
            <InputWrapper error={errors.grossEarnings}>
              <span className={`text-sm font-bold shrink-0 ${errors.grossEarnings ? 'text-red-400' : 'text-slate-500'}`}>£</span>
              <input
                id="sf-gross"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={fields.grossEarnings}
                onChange={e => change('grossEarnings', e.target.value)}
                onBlur={() => handleBlur('grossEarnings')}
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
            </InputWrapper>
            <ErrorMsg message={errors.grossEarnings} />
          </div>

          {/* Deductions */}
          <div>
            <FieldLabel htmlFor="sf-deductions" required>Deductions</FieldLabel>
            <InputWrapper error={errors.deductions}>
              <span className={`text-sm font-bold shrink-0 ${errors.deductions ? 'text-red-400' : 'text-slate-500'}`}>−£</span>
              <input
                id="sf-deductions"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={fields.deductions}
                onChange={e => change('deductions', e.target.value)}
                onBlur={() => handleBlur('deductions')}
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
            </InputWrapper>
            <ErrorMsg message={errors.deductions} />
          </div>

          {/* Net income preview */}
          <div className="sm:col-span-2">
            <div className={`
              flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all duration-300
              ${(gross > 0 || ded > 0)
                ? 'bg-emerald-500/5 border-emerald-500/25'
                : 'bg-surface-muted border-surface-border'
              }
            `}>
              <div className="flex items-center gap-2.5 text-sm text-slate-400">
                <Calculator className="w-4 h-4 text-slate-500" />
                <span>Estimated Net Income</span>
              </div>
              <span className={`font-bold text-lg tabular-nums transition-colors duration-300 ${
                gross > 0 || ded > 0 ? 'text-emerald-400' : 'text-slate-600'
              }`}>
                £{net.toFixed(2)}
              </span>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-surface-border bg-surface-muted/30">
          <button
            id="shift-form-reset"
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-300 font-medium transition-colors"
          >
            Reset form
          </button>
          <div className="flex gap-3">
            {onCancel && (
              <button
                id="shift-form-cancel"
                type="button"
                onClick={onCancel}
                className="text-sm text-slate-400 hover:text-white px-4 py-2.5 rounded-xl border border-surface-border hover:border-slate-500 transition-all font-medium"
              >
                Cancel
              </button>
            )}
            <button
              id="shift-form-submit"
              type="submit"
              className="gradient-brand text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-brand-500/25 flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Log Shift
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
