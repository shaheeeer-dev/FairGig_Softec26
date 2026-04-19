import { Bell, Search, ChevronDown, Settings } from 'lucide-react'

const pageTitles = {
  dashboard:   { title: 'Dashboard',   subtitle: "Welcome back, here's your overview" },
  shifts:      { title: 'Shifts',      subtitle: 'Manage your upcoming and past shifts' },
  certificate: { title: 'Certificate', subtitle: 'View and download your certifications' },
  grievance:   { title: 'Grievance',   subtitle: 'Submit and track workplace grievances' },
}

export default function Topbar({ activeNav }) {
  const { title, subtitle } = pageTitles[activeNav] || pageTitles.dashboard

  return (
    <header className="flex items-center justify-between px-6 lg:px-8 py-4 border-b border-surface-border bg-surface-card shrink-0">
      {/* Page title */}
      <div>
        <h1 className="text-white font-semibold text-lg leading-tight">{title}</h1>
        <p className="text-slate-400 text-xs mt-0.5">{subtitle}</p>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 bg-surface-muted border border-surface-border rounded-xl px-3 py-2 w-48 lg:w-64">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            id="topbar-search"
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-slate-300 placeholder-slate-500 outline-none w-full"
          />
        </div>

        {/* Notifications */}
        <button
          id="topbar-notifications"
          className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-surface-muted border border-surface-border text-slate-400 hover:text-white hover:border-brand-500 transition-all duration-200"
        >
          <Bell className="w-4 h-4" />
          {/* Unread badge */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-surface-card" />
        </button>

        {/* Settings */}
        <button
          id="topbar-settings"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-muted border border-surface-border text-slate-400 hover:text-white hover:border-brand-500 transition-all duration-200"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="w-px h-7 bg-surface-border" />

        {/* User profile */}
        <button
          id="topbar-user-profile"
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-surface-muted transition-all duration-200 group"
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center text-white text-sm font-bold shadow-md shrink-0">
            AK
          </div>
          <div className="hidden md:block text-left">
            <p className="text-white text-sm font-medium leading-none">Adeel Khan</p>
            <p className="text-slate-400 text-xs mt-0.5">Gig Worker &middot; Verified</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
        </button>
      </div>
    </header>
  )
}
