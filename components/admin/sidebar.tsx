"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Wallet, ArrowLeftRight, CalendarDays, Settings,
  LogOut, ChevronLeft, ChevronRight, Menu,
} from "lucide-react"

interface SidebarProps {
  email: string
  logoutAction: () => Promise<void>
}

const NAV_ITEMS = [
  { href: "/admin/visao-geral",          icon: LayoutDashboard, label: "Visão Geral" },
  { href: "/admin/relatorios/carteira",  icon: Wallet,          label: "Carteira" },
  { href: "/admin/relatorios/repasse",   icon: ArrowLeftRight,  label: "Repasse" },
  { href: "/admin/relatorios/calendario", icon: CalendarDays,   label: "Calendário" },
  { href: "/admin/relatorios/config",    icon: Settings,        label: "Configurações" },
]

export function Sidebar({ email, logoutAction }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  // Persiste preferência do usuário
  useEffect(() => {
    const saved = localStorage.getItem("pace360-sidebar-collapsed")
    if (saved !== null) setCollapsed(saved === "true")
  }, [])

  function toggle() {
    setCollapsed(v => {
      localStorage.setItem("pace360-sidebar-collapsed", String(!v))
      return !v
    })
  }

  return (
    <aside
      className={`shrink-0 bg-black border-r border-zinc-900 flex flex-col transition-all duration-200 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Logo + toggle */}
      <div className={`flex items-center border-b border-zinc-900 h-16 ${collapsed ? "justify-center px-0" : "px-4 justify-between"}`}>
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-3 min-w-0">
            <div
              className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-black text-white text-sm"
              style={{ backgroundColor: "#ff2c03" }}
            >
              S
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm leading-none text-white truncate">Somma Club</p>
              <p className="text-[10px] text-white/50 mt-0.5 tracking-wider uppercase">PACE 360</p>
            </div>
          </Link>
        )}
        {collapsed && (
          <Link href="/admin">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm"
              style={{ backgroundColor: "#ff2c03" }}
            >
              S
            </div>
          </Link>
        )}
        <button
          onClick={toggle}
          className={`p-1.5 rounded-md text-white/50 hover:text-white hover:bg-zinc-900 transition ${collapsed ? "absolute left-10 top-4" : ""}`}
          title={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-1">
        {NAV_ITEMS.map(item => {
          const active = item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                active
                  ? "text-white font-medium"
                  : "text-white/60 hover:bg-zinc-900 hover:text-white"
              } ${collapsed ? "justify-center" : ""}`}
              style={active ? { backgroundColor: "#ff2c0322", color: "#ff6932" } : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className={`p-2 border-t border-zinc-900 ${collapsed ? "flex justify-center" : ""}`}>
        {!collapsed && (
          <p className="text-[10px] text-white/40 px-3 pb-1 truncate">{email}</p>
        )}
        <form action={logoutAction}>
          <button
            type="submit"
            title={collapsed ? "Sair" : undefined}
            className={`flex items-center gap-3 px-3 py-2 text-sm text-white/60 hover:bg-zinc-900 hover:text-white rounded-md transition w-full ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
        </form>
      </div>
    </aside>
  )
}
