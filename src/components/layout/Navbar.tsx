"use client";

import React from "react";
import { 
  Package, 
  LayoutDashboard, 
  Boxes, 
  ArrowLeftRight, 
  FolderTree, 
  BarChart3, 
  Settings, 
  Bell, 
  ArrowLeft,
  LogOut,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  FolderPlus,
  FileSpreadsheet
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthUser } from "@/lib/services/authService";

interface NavbarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  onBack: () => void;
  canGoBack: boolean;
  lowStockCount: number;
  onOpenAlerts: () => void;
  isSupabaseLive: boolean;
  user: AuthUser | null;
  onLogout: () => void;
  isSidePanelOpen: boolean;
  onToggleSidePanel: () => void;
}

export function Navbar({
  activeTab,
  onNavigate,
  onBack,
  canGoBack,
  lowStockCount,
  onOpenAlerts,
  isSupabaseLive,
  user,
  onLogout,
  isSidePanelOpen,
  onToggleSidePanel,
}: NavbarProps) {
  // Main primary tabs (Large & Bold focus)
  const mainTabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Boxes },
    { id: "movements", label: "Stock In / Out", icon: ArrowLeftRight },
  ];

  return (
    <header className="h-14 border-b border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-950 px-4 flex items-center justify-between shrink-0 select-none shadow-xs">
      {/* Left: Brand + Back to Home */}
      <div className="flex items-center gap-3">
        {canGoBack && activeTab !== "dashboard" ? (
          <Button
            size="sm"
            variant="outline"
            onClick={onBack}
            className="h-8 px-3 text-xs font-bold gap-1.5 bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 shadow-sm border-transparent"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Button>
        ) : (
          <button
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-2 text-left focus:outline-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900 shadow-sm">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-slate-50 block leading-tight">
                Arfat Inventory
              </span>
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block">
                ₹ INR Portal
              </span>
            </div>
          </button>
        )}

        <Badge
          variant="outline"
          className="hidden md:inline-flex text-[9px] py-0 px-2 h-5 font-medium border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
        >
          {isSupabaseLive ? "Supabase Active" : "Local Mode"}
        </Badge>
      </div>

      {/* Center: MAIN FEATURES (Large, Bold, Prominent) */}
      <nav className="flex items-center gap-2">
        {mainTabs.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all shadow-xs ${
                isActive
                  ? "bg-slate-900 text-white shadow-md dark:bg-slate-50 dark:text-slate-900 scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right: Low Stock Alert, Minor Tools Side Panel, User & Logout */}
      <div className="flex items-center gap-2">
        {/* Toggle Minor Tools Side Panel */}
        <Button
          size="sm"
          variant="outline"
          onClick={onToggleSidePanel}
          className={`h-8 px-2.5 text-xs font-semibold gap-1.5 ${
            isSidePanelOpen
              ? "bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-50"
              : "text-slate-600 hover:text-slate-900"
          }`}
          title="Toggle Minor Tools & Reports"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Tools</span>
        </Button>

        {/* Low Stock Alerts */}
        <button
          onClick={onOpenAlerts}
          className="relative p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Low Stock Alerts"
        >
          <Bell className="w-4 h-4" />
          {lowStockCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-amber-500 text-[9px] font-extrabold text-white ring-2 ring-white dark:ring-slate-950">
              {lowStockCount}
            </span>
          )}
        </button>

        {/* User Info & Logout Button */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="hidden lg:block text-right">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {user?.name || "Arfat Sayed"}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {user?.email || "arfatsayed911@gmail.com"}
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={onLogout}
            className="h-8 px-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 gap-1"
            title="Log out of Arfat Inventory"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
