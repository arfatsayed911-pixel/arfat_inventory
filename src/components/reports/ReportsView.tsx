"use client";

import React from "react";
import { Product, Category, StockMovement, InventoryStats, LowStockAlertItem } from "@/types/inventory";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { 
  FileSpreadsheet, 
  Download, 
  DollarSign, 
  Package, 
  AlertTriangle, 
  TrendingUp,
  FileText
} from "lucide-react";

interface ReportsViewProps {
  products: Product[];
  categories: Category[];
  movements: StockMovement[];
  stats: InventoryStats;
  lowStockItems: LowStockAlertItem[];
}

export function ReportsView({
  products,
  categories,
  movements,
  stats,
  lowStockItems,
}: ReportsViewProps) {
  // Helper to trigger file download
  const downloadCSV = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. Export Products
  const handleExportProducts = () => {
    const headers = [
      "Product ID",
      "Name",
      "SKU",
      "Barcode",
      "Category",
      "Unit",
      "Cost Price ($)",
      "Selling Price ($)",
      "Current Stock",
      "Min Threshold",
      "Total Cost Value ($)",
      "Total Retail Value ($)",
      "Location",
      "Created At",
    ];

    const rows = products.map((p) => [
      `"${p.id}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.sku}"`,
      `"${p.barcode || ""}"`,
      `"${p.category?.name || "Uncategorized"}"`,
      `"${p.unit}"`,
      p.cost_price,
      p.selling_price,
      p.current_stock,
      p.min_threshold,
      (p.cost_price * p.current_stock).toFixed(2),
      (p.selling_price * p.current_stock).toFixed(2),
      `"${p.location || ""}"`,
      `"${p.created_at}"`,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadCSV(`inventory-products-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  // 2. Export Valuation Summary
  const handleExportValuation = () => {
    const headers = ["Category", "Product Count", "Total Stock Units", "Total Cost Value ($)", "Total Retail Value ($)", "Estimated Gross Profit ($)"];
    
    // Group by category
    const catMap = new Map<string, { name: string; count: number; units: number; cost: number; retail: number }>();
    for (const c of categories) {
      catMap.set(c.id, { name: c.name, count: 0, units: 0, cost: 0, retail: 0 });
    }

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

    // Total row
    rows.push([
      `"TOTAL INVENTORY"`,
      stats.totalProducts,
      stats.totalStockUnits,
      stats.totalCostValue.toFixed(2),
      stats.totalRetailValue.toFixed(2),
      stats.potentialProfit.toFixed(2),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadCSV(`inventory-valuation-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  // 3. Export Reorder Sheet
  const handleExportReorderSheet = () => {
    const headers = ["Product Name", "SKU", "Category", "Current Stock", "Min Threshold", "Deficit (Units)", "Cost per Unit ($)", "Estimated Reorder Cost ($)"];
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Inventory Reports & Exports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Audit inventory asset valuations, generate procurement sheets, and export spreadsheet data.
          </p>
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Product Catalog CSV */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <CardTitle className="text-sm">Product Catalog CSV</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Complete inventory master sheet with SKUs, barcodes, unit prices, and locations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportProducts}
              className="w-full text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download Products CSV
            </Button>
          </CardContent>
        </Card>

        {/* Valuation Summary CSV */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <CardTitle className="text-sm">Valuation Summary CSV</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Asset cost totals, retail projections, and gross margins grouped by category.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportValuation}
              className="w-full text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download Valuation CSV
            </Button>
          </CardContent>
        </Card>

        {/* Reorder Procurement Sheet */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <CardTitle className="text-sm">Reorder Sheet CSV</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Deficit counts, suggested order quantities, and estimated replenishment cost.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportReorderSheet}
              className="w-full text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download Reorder CSV
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Reorder Recommendation Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Reorder & Restock Recommendations</CardTitle>
              <CardDescription>
                Items requiring immediate purchase order placement to restore safe buffer stocks.
              </CardDescription>
            </div>
            <Badge variant="warning">{lowStockItems.length} Items Flagged</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product / SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Min Threshold</TableHead>
                  <TableHead className="text-right">Deficit</TableHead>
                  <TableHead className="text-right">Suggested Order Qty</TableHead>
                  <TableHead className="text-right">Est. Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-28 text-center text-xs text-slate-500">
                      Great job! All inventory levels are above minimum reorder thresholds.
                    </TableCell>
                  </TableRow>
                ) : (
                  lowStockItems.map((item) => {
                    const suggested = item.deficit > 0 ? item.deficit + item.min_threshold : item.min_threshold;
                    const estCost = suggested * item.cost_price;

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                            {item.name}
                          </div>
                          <div className="font-mono text-[11px] text-slate-500">
                            {item.sku}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                          {item.category}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={item.current_stock === 0 ? "destructive" : "warning"}>
                            {item.current_stock}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono">
                          {item.min_threshold}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                          {item.deficit > 0 ? `-${item.deficit}` : "0"}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {suggested} units
                        </TableCell>
                        <TableCell className="text-right text-xs font-semibold">
                          {formatCurrency(estCost)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

