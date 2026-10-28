"use client";

import React from "react";
import { Product, Category, StockMovement, InventoryStats, LowStockAlertItem } from "@/types/inventory";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { 
  Download, 
  ArrowLeft,
  FileSpreadsheet,
  AlertTriangle,
  DollarSign
} from "lucide-react";

interface ReportsViewProps {
  products: Product[];
  categories: Category[];
  movements: StockMovement[];
  stats: InventoryStats;
  lowStockItems: LowStockAlertItem[];
  onBackToHome: () => void;
}

export function ReportsView({
  products,
  categories,
  movements,
  stats,
  lowStockItems,
  onBackToHome,
}: ReportsViewProps) {
  const downloadCSV = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
  };

  const handleExportProducts = () => {
    const headers = ["ID", "Name", "SKU", "Category", "Unit", "Cost", "Price", "Stock", "Threshold", "Location"];
    const rows = products.map((p) => [
      `"${p.id}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.sku}"`,
      `"${p.category?.name || "Uncategorized"}"`,
      `"${p.unit}"`,
      p.cost_price,
      p.selling_price,
      p.current_stock,
      p.min_threshold,
      `"${p.location || ""}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadCSV(`inventory-products-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const handleExportValuation = () => {
    const headers = ["Category", "Product Count", "Stock Units", "Cost Value ($)", "Retail Value ($)", "Profit Margin ($)"];
    const catMap = new Map<string, { name: string; count: number; units: number; cost: number; retail: number }>();
    for (const c of categories) catMap.set(c.id, { name: c.name, count: 0, units: 0, cost: 0, retail: 0 });

    for (const p of products) {
      const entry = catMap.get(p.category_id);
      if (entry) {
        entry.count++;
        entry.units += p.current_stock;
        entry.cost += p.cost_price * p.current_stock;
        entry.retail += p.selling_price * p.current_stock;
      }
    }

    const rows = Array.from(catMap.values()).map((row) => [
      `"${row.name}"`,
      row.count,
      row.units,
      row.cost.toFixed(2),
      row.retail.toFixed(2),
      (row.retail - row.cost).toFixed(2),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadCSV(`inventory-valuation-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const handleExportReorder = () => {
    const headers = ["Product", "SKU", "Category", "Stock", "Threshold", "Deficit", "Cost", "Est. Order Cost"];
    const rows = lowStockItems.map((item) => {
      const suggestedReorder = item.deficit > 0 ? item.deficit + item.min_threshold : item.min_threshold;
      return [
        `"${item.name.replace(/"/g, '""')}"`,
        `"${item.sku}"`,
        `"${item.category}"`,
        item.current_stock,
        item.min_threshold,
        item.deficit,
        item.cost_price,
        (suggestedReorder * item.cost_price).toFixed(2),
      ];
    });
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadCSV(`reorder-sheet-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onBackToHome}
            className="h-8 px-2.5 text-xs gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </Button>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Reports & CSV Exports
          </h1>
        </div>
      </div>

      {/* 3 Quick Export Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 shrink-0">
        <Card className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <div>
              <div className="text-xs font-semibold">Products Catalog</div>
              <div className="text-[10px] text-slate-400">{products.length} items</div>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={handleExportProducts} className="h-7 text-xs px-2">
            <Download className="w-3 h-3 mr-1" /> CSV
          </Button>
        </Card>

        <Card className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <div>
              <div className="text-xs font-semibold">Valuation Report</div>
              <div className="text-[10px] text-slate-400">{formatCurrency(stats.totalCostValue)} cost</div>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={handleExportValuation} className="h-7 text-xs px-2">
            <Download className="w-3 h-3 mr-1" /> CSV
          </Button>
        </Card>

        <Card className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <div>
              <div className="text-xs font-semibold">Reorder Sheet</div>
              <div className="text-[10px] text-slate-400">{lowStockItems.length} flagged</div>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={handleExportReorder} className="h-7 text-xs px-2">
            <Download className="w-3 h-3 mr-1" /> CSV
          </Button>
        </Card>
      </div>

      {/* Reorder Recommendation Table (Contained, no page scroll) */}
      <div className="flex-1 min-h-0 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 overflow-hidden flex flex-col">
        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50">
          <span className="text-xs font-semibold">Reorder Recommendations</span>
          <Badge variant="warning" className="text-[10px] py-0 px-1.5">{lowStockItems.length} Items</Badge>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-white dark:bg-slate-950 z-10 shadow-xs">
              <TableRow className="h-8">
                <TableHead className="py-2 text-[11px]">Product</TableHead>
                <TableHead className="py-2 text-[11px]">Category</TableHead>
                <TableHead className="py-2 text-[11px] text-right">Stock</TableHead>
                <TableHead className="py-2 text-[11px] text-right">Min</TableHead>
                <TableHead className="py-2 text-[11px] text-right">Suggested Qty</TableHead>
                <TableHead className="py-2 text-[11px] text-right">Est. Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-slate-400">
                    All stock levels are above minimum alert thresholds.
                  </TableCell>
                </TableRow>
              ) : (
                lowStockItems.map((item) => {
                  const suggested = item.deficit > 0 ? item.deficit + item.min_threshold : item.min_threshold;
                  const estCost = suggested * item.cost_price;

                  return (
                    <TableRow key={item.id} className="h-9 hover:bg-slate-50/70">
                      <TableCell className="py-1.5">
                        <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                          {item.name}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400">
                          {item.sku}
                        </div>
                      </TableCell>
                      <TableCell className="py-1.5 text-xs text-slate-500">
                        {item.category}
                      </TableCell>
                      <TableCell className="py-1.5 text-right font-mono font-bold text-xs">
                        <span className={item.current_stock === 0 ? "text-rose-600" : "text-amber-600"}>
                          {item.current_stock}
                        </span>
                      </TableCell>
                      <TableCell className="py-1.5 text-right font-mono text-xs text-slate-400">
                        {item.min_threshold}
                      </TableCell>
                      <TableCell className="py-1.5 text-right font-mono font-bold text-xs text-indigo-600">
                        +{suggested}
                      </TableCell>
                      <TableCell className="py-1.5 text-right font-semibold text-xs">
                        {formatCurrency(estCost)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
