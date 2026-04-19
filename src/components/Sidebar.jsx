import {
  LayoutDashboard,
  CalendarClock,
  BadgeCheck,
  MessageSquareWarning,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react'

const navItems = [
  { id: 'dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'shifts',      label: 'Shifts',       icon: CalendarClock },
  { id: 'certificate', label: 'Certificate',  icon: BadgeCheck },
  { id: 'grievance',   label: 'Grievance',    icon: MessageSquareWarning },
]

export default function Sidebar({ activeNav, setActiveNav, collapsed, setCollapsed }) {
  return (
    <aside
      className={`
        relative flex flex-col shrink-0 bg-surface-card border-r border-surface-border
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-64'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-surface-border">
        <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center shrink-0 shadow-lg">
          <Zap className="w-5 h-5 text-white" fill="currentColor" />
        </div>
        {!collapsed && (
          <span className="text-white font-bold text-lg tracking-tight">
            Fair<span className="text-brand-400">Gig</span>
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeNav === id
          return (
            <button
              key={id}
              id={`nav-${id}`}
              onClick={() => setActiveNav(id)}
              title={collapsed ? label : undefined}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium
                transition-all duration-200 group relative
                ${isActive
                  ? 'gradient-brand text-white shadow-lg shadow-brand-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-surface-muted'
                }
              `}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform duration-200
                  ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}
              />
              {!collapsed && <span className="truncate">{label}</span>}

              {/* Active indicator pip */}
              {isActive && (
                <span className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full opacity-80" />
              )}

              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="
                  absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs
                  rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100
                  pointer-events-none transition-opacity duration-150 shadow-xl z-50
                  border border-surface-border
                ">
                  {label}
                </div>
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 border-t border-surface-border pt-4 space-y-3">
        {/* Pro badge */}
        {!collapsed && (
          <div className="mx-1 p-3 rounded-xl bg-gradient-to-br from-brand-900/60 to-purple-900/40 border border-brand-800/50">
            <p className="text-xs font-semibold text-brand-300 mb-0.5">FairGig Pro</p>
            <p className="text-xs text-slate-400">Upgrade for premium shifts</p>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          id="sidebar-collapse-toggle"
          onClick={() => setCollapsed(c => !c)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl
            text-slate-400 hover:text-white hover:bg-surface-muted transition-all duration-200 text-xs font-medium"
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" />
            : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>
          }
        </button>
      </div>
    </aside>
  )
}
