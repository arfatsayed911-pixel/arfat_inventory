"use client";

import React from "react";
import { 
  FolderTree, 
  BarChart3, 
  Settings, 
  FileSpreadsheet, 
  ChevronRight, 
  X, 
  Database,
  Mail,
  ShieldCheck,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InventoryStats } from "@/types/inventory";
import { formatCurrency } from "@/lib/utils";

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onNavigate: (tab: string) => void;
  stats: InventoryStats;
  isSupabaseLive: boolean;
  onOpenAlerts: () => void;
  onResetDemo: () => void;
}

export function SidePanel({
  isOpen,
  onClose,
  activeTab,
  onNavigate,
  stats,
  isSupabaseLive,
  onOpenAlerts,
  onResetDemo,
}: SidePanelProps) {
  if (!isOpen) return null;

  const minorTools = [
    {
      id: "categories",
      title: "Category Taxonomy",
      desc: "Organize items by product grouping",
      icon: FolderTree,
      badge: `${stats.totalCategories} groups`,
    },
    {
      id: "reports",
      title: "Reports & CSV Exports",
      desc: "Valuation, reorder sheets & downloads",
      icon: BarChart3,
      badge: "Excel/CSV",
    },
    {
      id: "deployment",
      title: "Supabase & System Setup",
      desc: "PostgreSQL, Resend API & Vercel sync",
      icon: Settings,
      badge: isSupabaseLive ? "Connected" : "Local",
    },
  ];

  return (
    <aside className="w-80 shrink-0 border-l border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-950 flex flex-col h-full shadow-lg z-20 animate-in slide-in-from-right duration-200">
      {/* Side Panel Header */}
      <div className="h-12 px-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/60 dark:bg-slate-900/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Minor Tools & Utilities
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          title="Close Tools Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Side Panel Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Navigation list for minor features */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Secondary Modules
          </div>
          {minorTools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTab === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => {
                  onNavigate(tool.id);
                  onClose();
                }}
                className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-50 dark:text-slate-900 dark:border-slate-50 shadow-sm"
                    : "bg-white border-slate-200/70 hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-1.5 rounded-lg ${
                      isActive
                        ? "bg-white/10 text-white dark:bg-slate-900/10 dark:text-slate-900"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-snug">{tool.title}</div>
                    <div
                      className={`text-[10px] ${
                        isActive ? "text-slate-300 dark:text-slate-600" : "text-slate-400"
                      }`}
                    >
                      {tool.desc}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>
            );
          })}
        </div>

        {/* Quick Summary Pill */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 dark:bg-slate-900/60 dark:border-slate-800 space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Quick Valuation (INR)
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Total Cost</span>
            <span className="font-bold font-mono text-slate-900 dark:text-slate-100">
              {formatCurrency(stats.totalCostValue)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Retail Potential</span>
            <span className="font-bold font-mono text-emerald-600">
              {formatCurrency(stats.totalRetailValue)}
            </span>
          </div>
        </div>

        {/* Quick Email Alert Button */}
        <div className="pt-2">
          <Button
            size="sm"
            onClick={() => {
              onOpenAlerts();
              onClose();
            }}
            className="w-full h-8 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white gap-1.5 shadow-sm"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Send Low Stock Email</span>
          </Button>
        </div>

        {/* Reset Demo Data */}
        <div className="pt-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={onResetDemo}
            className="w-full h-7 text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Sample Data</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
