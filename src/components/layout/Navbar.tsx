"use client";

import React from "react";
import { Package, LayoutDashboard, Boxes, ArrowLeftRight, FolderTree, BarChart3, Settings, Bell, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  onBack: () => void;
  canGoBack: boolean;
  lowStockCount: number;
  onOpenAlerts: () => void;
  isSupabaseLive: boolean;
}

export function Navbar({
  activeTab,
  onNavigate,
  onBack,
  canGoBack,
  lowStockCount,
  onOpenAlerts,
  isSupabaseLive,
}: NavbarProps) {
  const navItems = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Boxes },
    { id: "movements", label: "Stock In/Out", icon: ArrowLeftRight },
    { id: "categories", label: "Categories", icon: FolderTree },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "deployment", label: "Setup", icon: Settings },
  ];

  return (
    <header className="h-14 border-b border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-950 px-4 flex items-center justify-between shrink-0 select-none">
      {/* Left: Back button or Logo */}
      <div className="flex items-center gap-3">
        {canGoBack && activeTab !== "dashboard" ? (
          <Button
            size="sm"
            variant="outline"
            onClick={onBack}
            className="h-8 px-2.5 text-xs font-semibold gap-1.5 bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 border-transparent shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Button>
        ) : (
          <button
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-2 text-left focus:outline-none"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900">
              <Package className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold tracking-tight">StockPulse</span>
          </button>
        )}

        {/* Database indicator */}
        <Badge
          variant="outline"
          className="hidden sm:inline-flex text-[10px] py-0 px-2 h-5 font-normal"
        >
          {isSupabaseLive ? "Supabase Live" : "Demo Store"}
        </Badge>
      </div>

      {/* Middle: Minimal Navigation */}
      <nav className="flex items-center gap-1 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right: Low Stock Alert Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenAlerts}
          className="relative p-1.5 rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Low Stock Alerts"
        >
          <Bell className="w-4 h-4" />
          {lowStockCount > 0 && (
            <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
              {lowStockCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
