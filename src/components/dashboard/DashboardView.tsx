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
  Mail
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
    <div className="h-full flex flex-col gap-2.5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Arfat Inventory
        </h1>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            onClick={() => onOpenMovementModal("IN")}
            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2.5"
          >
            <ArrowDownLeft className="w-3 h-3 mr-1" />
            In
          </Button>
          <Button
            size="sm"
            onClick={() => onOpenMovementModal("OUT")}
            className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white px-2.5"
          >
            <ArrowUpRight className="w-3 h-3 mr-1" />
            Out
          </Button>
          <Button
            size="sm"
            onClick={onOpenProductModal}
            className="h-7 text-xs bg-slate-900 hover:bg-slate-800 text-white px-2.5"
          >
            <Plus className="w-3 h-3 mr-1" />
            Product
          </Button>
        </div>
      </div>

      {/* Low Stock Alert Strip */}
      {lowStockItems.length > 0 && (
        <div className="shrink-0 flex items-center justify-between px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/60 text-xs">
          <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="font-semibold">{lowStockItems.length} Low Stock</span>
            <span className="text-amber-700 dark:text-amber-400 hidden sm:inline text-[11px]">
              ({lowStockItems.map((i) => i.name).slice(0, 2).join(", ")})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onNavigateToTab("products")}
              className="h-6 px-1.5 text-[11px] text-amber-900"
            >
              View
            </Button>
            <Button
              size="sm"
              onClick={onOpenAlertsModal}
              className="h-6 px-2 text-[11px] bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Mail className="w-3 h-3 mr-1" />
              Alert
            </Button>
          </div>
        </div>
      )}

      {/* KPI Cards (Clean, Minimal Words) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
        <Card className="p-2.5">
          <div className="text-[10px] text-slate-400 uppercase font-medium">Products</div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {stats.totalProducts} <span className="text-xs font-normal text-slate-400">({stats.totalStockUnits} pcs)</span>
          </div>
        </Card>

        <Card className="p-2.5">
          <div className="text-[10px] text-slate-400 uppercase font-medium">Cost Value</div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(stats.totalCostValue)}
          </div>
        </Card>

        <Card className="p-2.5">
          <div className="text-[10px] text-slate-400 uppercase font-medium">Retail Value</div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(stats.totalRetailValue)} <span className="text-xs font-semibold text-emerald-600">({marginPercent}%)</span>
          </div>
        </Card>

        <Card className="p-2.5">
          <div className="text-[10px] text-slate-400 uppercase font-medium">Status</div>
          <div className="flex items-center gap-1 mt-0.5">
            <Badge variant="success" className="text-[9px] py-0 px-1">{stats.inStockCount} OK</Badge>
            <Badge variant="warning" className="text-[9px] py-0 px-1">{stats.lowStockCount} Low</Badge>
            <Badge variant="destructive" className="text-[9px] py-0 px-1">{stats.outOfStockCount} Out</Badge>
          </div>
        </Card>
      </div>

      {/* Activity Feed Container (Remaining height, no page scroll) */}
      <div className="flex-1 min-h-0 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 flex flex-col overflow-hidden">
        <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/60 dark:bg-slate-900/50">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Recent Movements
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateToTab("movements")}
            className="h-6 px-1.5 text-[11px] text-slate-500"
          >
            All &rarr;
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {recentMovements.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              No movements.
            </div>
          ) : (
            recentMovements.map((m) => (
              <div key={m.id} className="px-3 py-2 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                <div className="flex items-center gap-2">
                  <span
                    className={`p-1 rounded shrink-0 ${
                      m.type === "IN"
                        ? "bg-emerald-100 text-emerald-700"
                        : m.type === "OUT"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    {m.type === "IN" ? (
                      <ArrowDownLeft className="w-3 h-3" />
                    ) : m.type === "OUT" ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <SlidersHorizontal className="w-3 h-3" />
                    )}
                  </span>
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {m.product?.name || "Product"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {m.reason} &bull; {formatDate(m.created_at)}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span
                    className={`font-bold text-xs ${
                      m.type === "IN"
                        ? "text-emerald-600"
                        : m.type === "OUT"
                        ? "text-rose-600"
                        : "text-indigo-600"
                    }`}
                  >
                    {m.type === "IN" ? `+${m.quantity}` : m.type === "OUT" ? `-${m.quantity}` : `±${m.quantity}`}
                  </span>
                  <div className="text-[9px] text-slate-400">
                    {m.previous_stock} &rarr; {m.new_stock}
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
