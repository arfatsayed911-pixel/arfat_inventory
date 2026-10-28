"use client";

import React, { useState } from "react";
import { Package, LayoutDashboard, Boxes, ArrowLeftRight, FolderTree, BarChart3, Cloud, Menu, X, Bell, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lowStockCount: number;
  onOpenAlerts: () => void;
  isSupabaseLive: boolean;
  onResetData: () => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  lowStockCount,
  onOpenAlerts,
  isSupabaseLive,
  onResetData,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Boxes },
    { id: "movements", label: "Stock In / Out", icon: ArrowLeftRight },
    { id: "categories", label: "Categories", icon: FolderTree },
    { id: "reports", label: "Reports & CSV", icon: BarChart3 },
    { id: "deployment", label: "Supabase & Setup", icon: Cloud },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick("dashboard")}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm dark:bg-slate-50 dark:text-slate-900">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-50 block leading-tight">
                  StockPulse
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase block">
                  Inventory System
                </span>
              </div>
            </button>

            {/* Supabase connection badge */}
            <div className="hidden lg:flex items-center ml-2">
              <Badge
                variant="outline"
                className={`text-[10px] font-medium flex items-center gap-1.5 ${
                  isSupabaseLive
                    ? "border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-400"
                    : "border-slate-200 text-slate-600 bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isSupabaseLive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                  }`}
                />
                {isSupabaseLive ? "Supabase Live" : "Local / Demo Store"}
              </Badge>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-slate-50 shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-75" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & Alerts */}
          <div className="flex items-center gap-2">
            {/* Low stock alert badge button */}
            <button
              onClick={onOpenAlerts}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              title="Low Stock Alerts"
            >
              <Bell className="w-4 h-4" />
              {lowStockCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
                  {lowStockCount}
                </span>
              )}
            </button>

            {/* Quick Demo Data Reset */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetData}
              className="hidden sm:inline-flex text-xs text-slate-500 hover:text-slate-900"
              title="Reset sample inventory data"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset Demo
            </Button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-3 space-y-1 dark:border-slate-800 animate-in slide-in-from-top-2 duration-150">
            <div className="px-3 py-2 text-xs text-slate-500 font-medium">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-white"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
            <div className="pt-2 px-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-500">Database:</span>
              <Badge variant="outline" className="text-[10px]">
                {isSupabaseLive ? "Supabase Live" : "Local/Demo Store"}
              </Badge>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

