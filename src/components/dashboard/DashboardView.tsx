"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InventoryStats, LowStockAlertItem, StockMovement } from "@/types/inventory";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  ArrowDownLeft, 
  ArrowUpRight, 
  SlidersHorizontal,
  Plus,
  Mail,
  Boxes
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
    <div className="h-full flex flex-col gap-3 overflow-hidden">
      {/* Top Bar: Title & Quick Actions */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            onClick={() => onOpenMovementModal("IN")}
            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2.5"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 mr-1" />
            Stock In
          </Button>
          <Button
            size="sm"
            onClick={() => onOpenMovementModal("OUT")}
            className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white px-2.5"
          >
            <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
            Stock Out
          </Button>
          <Button
            size="sm"
            onClick={onOpenProductModal}
            className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white px-2.5"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Product
          </Button>
        </div>
      </div>

      {/* Low Stock Alert Strip (Minimal Words) */}
      {lowStockItems.length > 0 && (
        <div className="shrink-0 flex items-center justify-between px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/60 text-xs">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="font-semibold">{lowStockItems.length} Low Stock Item(s)</span>
            <span className="text-amber-700 dark:text-amber-400 hidden sm:inline">
              &bull; {lowStockItems.slice(0, 2).map((i) => i.name).join(", ")}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onNavigateToTab("products")}
              className="h-6 px-2 text-[11px] text-amber-900 hover:bg-amber-100"
            >
              View
            </Button>
            <Button
              size="sm"
              onClick={onOpenAlertsModal}
              className="h-6 px-2 text-[11px] bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Mail className="w-3 h-3 mr-1" />
              Notify
            </Button>
          </div>
        </div>
      )}

      {/* KPI Stats (Compact, No Scroll) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
        <Card className="p-3">
          <div className="text-[11px] text-slate-500 font-medium">Total Products</div>
          <div className="text-xl font-bold mt-0.5 text-slate-900 dark:text-slate-100">
            {stats.totalProducts} <span className="text-xs font-normal text-slate-400">({stats.totalStockUnits} units)</span>
          </div>
        </Card>

        <Card className="p-3">
          <div className="text-[11px] text-slate-500 font-medium">Cost Valuation</div>
          <div className="text-xl font-bold mt-0.5 text-slate-900 dark:text-slate-100">
            {formatCurrency(stats.totalCostValue)}
          </div>
        </Card>

        <Card className="p-3">
          <div className="text-[11px] text-slate-500 font-medium">Retail Valuation</div>
          <div className="text-xl font-bold mt-0.5 text-slate-900 dark:text-slate-100">
            {formatCurrency(stats.totalRetailValue)} <span className="text-xs font-semibold text-emerald-600">({marginPercent}%)</span>
          </div>
        </Card>

        <Card className="p-3">
          <div className="text-[11px] text-slate-500 font-medium">Stock Status</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge variant="success" className="text-[10px] py-0 px-1.5">{stats.inStockCount} OK</Badge>
            <Badge variant="warning" className="text-[10px] py-0 px-1.5">{stats.lowStockCount} Low</Badge>
            <Badge variant="destructive" className="text-[10px] py-0 px-1.5">{stats.outOfStockCount} Out</Badge>
          </div>
        </Card>
      </div>

      {/* Bottom Area: Recent Activity (Contained, no page scrolling) */}
      <div className="flex-1 min-h-0 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 flex flex-col overflow-hidden">
        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Recent Movements
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateToTab("movements")}
            className="h-6 px-2 text-[11px] text-slate-500 hover:text-slate-900"
          >
            All Movements &rarr;
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {recentMovements.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              No recent movements.
            </div>
          ) : (
            recentMovements.map((m) => (
              <div key={m.id} className="px-3 py-2 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                <div className="flex items-center gap-2.5">
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
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {m.product?.name || "Product"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {m.reason} &bull; {m.reference || "-"} &bull; {formatDate(m.created_at)}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span
                    className={`font-bold ${
                      m.type === "IN"
                        ? "text-emerald-600"
                        : m.type === "OUT"
                        ? "text-rose-600"
                        : "text-indigo-600"
                    }`}
                  >
                    {m.type === "IN" ? `+${m.quantity}` : m.type === "OUT" ? `-${m.quantity}` : `±${m.quantity}`}
                  </span>
                  <div className="text-[10px] text-slate-400">
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
