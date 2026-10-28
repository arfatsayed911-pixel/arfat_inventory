"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InventoryStats, LowStockAlertItem, Product, StockMovement } from "@/types/inventory";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  ArrowDownLeft, 
  ArrowUpRight, 
  SlidersHorizontal,
  Mail, 
  Plus, 
  CheckCircle,
  XCircle,
  FileSpreadsheet
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
    ? ((stats.potentialProfit / stats.totalRetailValue) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Inventory Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time stock levels, inventory valuation, and warehouse activity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => onOpenMovementModal("IN")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 mr-1.5" />
            Stock In
          </Button>
          <Button
            size="sm"
            onClick={() => onOpenMovementModal("OUT")}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            <ArrowUpRight className="w-3.5 h-3.5 mr-1.5" />
            Stock Out
          </Button>
          <Button size="sm" onClick={onOpenProductModal} className="bg-slate-900 text-white hover:bg-slate-800">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Critical Low Stock Alert Banner (if any) */}
      {lowStockItems.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 sm:p-5 dark:border-amber-900/60 dark:bg-amber-950/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <span>Stock Alert: {lowStockItems.length} product(s) below safe threshold</span>
                  <Badge variant="warning">{lowStockItems.length} Urgent</Badge>
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 max-w-2xl">
                  {lowStockItems.slice(0, 3).map(i => `${i.name} (${i.current_stock} left)`).join(", ")}
                  {lowStockItems.length > 3 ? `, and ${lowStockItems.length - 3} others.` : "."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onNavigateToTab("products")}
                className="text-xs border-amber-300 text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-300"
              >
                Inspect Items
              </Button>
              <Button
                size="sm"
                onClick={onOpenAlertsModal}
                className="text-xs bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Mail className="w-3.5 h-3.5 mr-1.5" />
                Notify via Resend
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Products
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-950 dark:text-blue-400">
              <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {stats.totalProducts}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Across <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.totalCategories}</span> categories ({stats.totalStockUnits.toLocaleString()} units)
            </p>
          </CardContent>
        </Card>

        {/* Total Inventory Value (Cost) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Inventory Cost Value
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center dark:bg-emerald-950 dark:text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {formatCurrency(stats.totalCostValue)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Retail: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(stats.totalRetailValue)}</span>
            </p>
          </CardContent>
        </Card>

        {/* Potential Margin */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Potential Gross Profit
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center dark:bg-indigo-950 dark:text-indigo-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {formatCurrency(stats.potentialProfit)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Estimated margin: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{marginPercent}%</span>
            </p>
          </CardContent>
        </Card>

        {/* Stock Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Stock Status
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center dark:bg-amber-950 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {stats.lowStockCount + stats.outOfStockCount}
              </span>
              <span className="text-xs text-slate-500">items need attention</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span className="text-rose-600 font-semibold">{stats.outOfStockCount} out</span>
              <span>&bull;</span>
              <span className="text-amber-600 font-semibold">{stats.lowStockCount} low</span>
              <span>&bull;</span>
              <span className="text-emerald-600 font-semibold">{stats.inStockCount} healthy</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout: Stock Health Breakdown + Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Stock Health & Quick Summary */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Stock Distribution</CardTitle>
            <CardDescription>
              Inventory health breakdown by stock threshold.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Health Bar */}
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex dark:bg-slate-800">
              {stats.totalProducts > 0 && (
                <>
                  <div
                    style={{ width: `${(stats.inStockCount / stats.totalProducts) * 100}%` }}
                    className="bg-emerald-500 h-full"
                    title={`Healthy: ${stats.inStockCount}`}
                  />
                  <div
                    style={{ width: `${(stats.lowStockCount / stats.totalProducts) * 100}%` }}
                    className="bg-amber-500 h-full"
                    title={`Low Stock: ${stats.lowStockCount}`}
                  />
                  <div
                    style={{ width: `${(stats.outOfStockCount / stats.totalProducts) * 100}%` }}
                    className="bg-rose-500 h-full"
                    title={`Out of Stock: ${stats.outOfStockCount}`}
                  />
                </>
              )}
            </div>

            {/* Legend */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  Healthy Stock
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {stats.inStockCount} items
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  Low Stock Alert
                </span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {stats.lowStockCount} items
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                  Out of Stock
                </span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  {stats.outOfStockCount} items
                </span>
              </div>
            </div>

            {/* Quick Actions Card Box */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Quick Actions
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateToTab("products")}
                  className="w-full text-xs justify-start"
                >
                  <Package className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  All Products
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateToTab("reports")}
                  className="w-full text-xs justify-start"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  Export Reports
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Col: Recent Stock Activity Feed */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Stock Movements</CardTitle>
              <CardDescription>
                Live log of inventory intake, dispatches, and audit changes.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateToTab("movements")}
              className="text-xs"
            >
              View All &rarr;
            </Button>
          </CardHeader>
          <CardContent>
            {recentMovements.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No recent stock movements recorded.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentMovements.slice(0, 5).map((m) => (
                  <div key={m.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          m.type === "IN"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                            : m.type === "OUT"
                            ? "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                            : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
                        }`}
                      >
                        {m.type === "IN" ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : m.type === "OUT" ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <SlidersHorizontal className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {m.product?.name || "Inventory Product"}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="capitalize">{m.reason}</span>
                          {m.reference && <span>&bull; #{m.reference}</span>}
                          <span>&bull; {formatDate(m.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`font-mono font-bold text-sm ${
                          m.type === "IN"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : m.type === "OUT"
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-indigo-600 dark:text-indigo-400"
                        }`}
                      >
                        {m.type === "IN" ? `+${m.quantity}` : m.type === "OUT" ? `-${m.quantity}` : `±${m.quantity}`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {m.previous_stock} &rarr; {m.new_stock}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

