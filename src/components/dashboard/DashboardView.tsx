"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InventoryStats, LowStockAlertItem, StockMovement } from "@/types/inventory";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  AlertTriangle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  SlidersHorizontal,
  Plus,
  Mail,
  Boxes,
  PackageCheck,
  TrendingUp,
  History
} from "lucide-react";

interface DashboardViewProps {
  stats: InventoryStats;
  lowStockItems: LowStockAlertItem[];
  recentMovements: StockMovement[];
  onOpenProductModal: () => void;
  onOpenMovementModal: (type?: "IN" | "OUT") => void;
  onOpenAlertsModal: () => void;
  onNavigateToTab: (tab: string) => void;
}

export function DashboardView({
  stats,
  lowStockItems,
  recentMovements,
  onOpenProductModal,
  onOpenMovementModal,
  onOpenAlertsModal,
  onNavigateToTab,
}: DashboardViewProps) {
  const marginPercent = stats.totalRetailValue > 0
    ? ((stats.potentialProfit / stats.totalRetailValue) * 100).toFixed(0)
    : "0";

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden select-none">
      
      {/* Top Banner: Primary Actions (LARGE & BOLD FOCUS) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <span>Inventory Dashboard</span>
            <Badge variant="outline" className="text-xs font-mono font-bold text-slate-600 border-slate-300">
              ₹ INR
            </Badge>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Manage physical stock, quick intakes, and customer dispatches.
          </p>
        </div>

        {/* Large Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="lg"
            onClick={() => onOpenMovementModal("IN")}
            className="h-10 px-4 text-xs md:text-sm font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-1.5"
          >
            <ArrowDownLeft className="w-4 h-4 stroke-[3]" />
            <span>Stock In</span>
          </Button>

          <Button
            size="lg"
            onClick={() => onOpenMovementModal("OUT")}
            className="h-10 px-4 text-xs md:text-sm font-extrabold bg-rose-600 hover:bg-rose-700 text-white shadow-md flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-4 h-4 stroke-[3]" />
            <span>Stock Out</span>
          </Button>

          <Button
            size="lg"
            onClick={onOpenProductModal}
            className="h-10 px-4 text-xs md:text-sm font-extrabold bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-50 dark:text-slate-900 shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ New Product</span>
          </Button>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockItems.length > 0 && (
        <div className="shrink-0 flex items-center justify-between px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600 stroke-[2.5] shrink-0" />
            <span className="font-extrabold text-sm">{lowStockItems.length} Products Low On Stock</span>
            <span className="text-amber-700 dark:text-amber-400 hidden md:inline text-xs">
              &bull; {lowStockItems.map((i) => `${i.name} (${i.current_stock} left)`).slice(0, 2).join(", ")}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigateToTab("products")}
              className="h-7 px-2.5 text-xs font-bold border-amber-300 text-amber-950 hover:bg-amber-100"
            >
              Review Items
            </Button>
            <Button
              size="sm"
              onClick={onOpenAlertsModal}
              className="h-7 px-2.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
            >
              <Mail className="w-3.5 h-3.5 mr-1" />
              Notify Resend
            </Button>
          </div>
        </div>
      )}

      {/* MAIN FEATURE KPI METRICS (LARGE & BOLD IN INDIAN RUPEES) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        
        {/* Total Stock Units & Products */}
        <Card 
          onClick={() => onNavigateToTab("products")}
          className="p-3.5 cursor-pointer hover:border-slate-400 transition-all border-l-4 border-l-blue-600 bg-white dark:bg-slate-900 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Products
            </span>
            <Boxes className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-50 mt-1">
            {stats.totalProducts}
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">
            {stats.totalStockUnits.toLocaleString("en-IN")} total items in stock
          </div>
        </Card>

        {/* Cost Valuation (₹ INR) */}
        <Card className="p-3.5 border-l-4 border-l-amber-500 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Inventory Cost Value
            </span>
            <span className="font-bold text-sm text-amber-600 font-mono">₹</span>
          </div>
          <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-50 mt-1 font-mono">
            {formatCurrency(stats.totalCostValue)}
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">
            Total procurement capital invested
          </div>
        </Card>

        {/* Retail Valuation (₹ INR) & Profit */}
        <Card className="p-3.5 border-l-4 border-l-emerald-600 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Retail Valuation
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-50 mt-1 font-mono">
            {formatCurrency(stats.totalRetailValue)}
          </div>
          <div className="text-xs font-bold text-emerald-600 mt-0.5">
            Profit Margin: +{formatCurrency(stats.potentialProfit)} ({marginPercent}%)
          </div>
        </Card>

        {/* Stock Status Health */}
        <Card className="p-3.5 border-l-4 border-l-slate-900 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Stock Status
            </span>
            <PackageCheck className="w-4 h-4 text-slate-700" />
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <Badge variant="success" className="text-xs font-bold py-0.5 px-2">
              {stats.inStockCount} In Stock
            </Badge>
            <Badge variant="warning" className="text-xs font-bold py-0.5 px-2">
              {stats.lowStockCount} Low
            </Badge>
            <Badge variant="destructive" className="text-xs font-bold py-0.5 px-2">
              {stats.outOfStockCount} Out
            </Badge>
          </div>
          <div className="text-xs font-semibold text-slate-400 mt-1.5">
            Real-time warehouse health
          </div>
        </Card>
      </div>

      {/* Activity Feed Ledger (Remaining Viewport Height, No Global Page Scroll) */}
      <div className="flex-1 min-h-0 rounded-xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-950 flex flex-col overflow-hidden shadow-xs">
        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            <span className="text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100">
              Live Stock Movements Ledger
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateToTab("movements")}
            className="h-7 px-2.5 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            View Full Ledger &rarr;
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {recentMovements.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              No recent movements recorded.
            </div>
          ) : (
            recentMovements.map((m) => (
              <div 
                key={m.id} 
                className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`p-1.5 rounded-lg shrink-0 ${
                      m.type === "IN"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : m.type === "OUT"
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                    }`}
                  >
                    {m.type === "IN" ? (
                      <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                    ) : m.type === "OUT" ? (
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <SlidersHorizontal className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </span>
                  <div>
                    <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                      {m.product?.name || "Product"}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      <span className="uppercase font-semibold text-slate-600 dark:text-slate-300">{m.reason}</span>
                      {m.reference && <span> &bull; #{m.reference}</span>}
                      <span> &bull; {formatDate(m.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span
                    className={`font-black text-sm md:text-base ${
                      m.type === "IN"
                        ? "text-emerald-600"
                        : m.type === "OUT"
                        ? "text-rose-600"
                        : "text-indigo-600"
                    }`}
                  >
                    {m.type === "IN" ? `+${m.quantity}` : m.type === "OUT" ? `-${m.quantity}` : `±${m.quantity}`}
                  </span>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {m.previous_stock} &rarr; <span className="font-bold text-slate-700 dark:text-slate-200">{m.new_stock}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
