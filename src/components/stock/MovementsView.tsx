"use client";

import React, { useState, useMemo } from "react";
import { StockMovement, MovementType, MovementReason } from "@/types/inventory";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  SlidersHorizontal, 
  Plus, 
  Download,
  Calendar
} from "lucide-react";

interface MovementsViewProps {
  movements: StockMovement[];
  onOpenMovementModal: (productId?: string, type?: MovementType) => void;
}

export function MovementsView({
  movements,
  onOpenMovementModal,
}: MovementsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [reasonFilter, setReasonFilter] = useState<string>("ALL");

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const productName = m.product?.name || "";
      const productSku = m.product?.sku || "";
      const reference = m.reference || "";

      const matchesSearch =
        productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        productSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reference.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "ALL" || m.type === typeFilter;
      const matchesReason = reasonFilter === "ALL" || m.reason === reasonFilter;

      return matchesSearch && matchesType && matchesReason;
    });
  }, [movements, searchTerm, typeFilter, reasonFilter]);

  // Export movements to CSV
  const handleExportCSV = () => {
    const headers = ["Date", "Product Name", "SKU", "Type", "Quantity", "Previous Stock", "New Stock", "Reason", "Reference", "Notes", "Recorded By"];
    const rows = filteredMovements.map((m) => [
      `"${m.created_at}"`,
      `"${m.product?.name || 'Unknown'}"`,
      `"${m.product?.sku || ''}"`,
      `"${m.type}"`,
      m.quantity,
      m.previous_stock,
      m.new_stock,
      `"${m.reason}"`,
      `"${m.reference || ''}"`,
      `"${m.notes || ''}"`,
      `"${m.created_by || ''}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `stock-movements-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Stock-In & Stock-Out Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Full ledger of inventory changes, supplier deliveries, sales dispatches, and audit adjustments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs text-slate-700 dark:text-slate-300"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </Button>
          <Button
            size="sm"
            onClick={() => onOpenMovementModal()}
            className="bg-slate-900 hover:bg-slate-800 text-white"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Record Movement
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-1 items-center gap-2 max-w-md relative">
          <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search by product, SKU, or reference #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Movement Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
          >
            <option value="ALL">All Types</option>
            <option value="IN">Stock In (Intake)</option>
            <option value="OUT">Stock Out (Dispatch)</option>
            <option value="ADJUSTMENT">Stock Adjustment</option>
          </select>

          {/* Reason Filter */}
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
          >
            <option value="ALL">All Reasons</option>
            <option value="purchase">Purchase Orders</option>
            <option value="sale">Sales Orders</option>
            <option value="damaged">Damaged / Expired</option>
            <option value="return">Returns</option>
            <option value="audit">Physical Audits</option>
            <option value="transfer">Transfers</option>
          </select>
        </div>
      </div>

      {/* Movements Table Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Movement Type</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Stock Balance</TableHead>
              <TableHead>Reason & Ref</TableHead>
              <TableHead>Operator / Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMovements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-xs text-slate-500">
                  No movement records found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredMovements.map((m) => (
                <TableRow key={m.id}>
                  {/* Date */}
                  <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                    {formatDate(m.created_at)}
                  </TableCell>

                  {/* Product */}
                  <TableCell>
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        {m.product?.name || "Inventory Product"}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {m.product?.sku}
                      </div>
                    </div>
                  </TableCell>

                  {/* Type */}
                  <TableCell>
                    <div className="inline-flex items-center gap-1.5">
                      <span
                        className={`p-1 rounded ${
                          m.type === "IN"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                            : m.type === "OUT"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                            : "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400"
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
                      <span className="text-xs font-semibold">
                        {m.type === "IN" ? "Stock In" : m.type === "OUT" ? "Stock Out" : "Adjustment"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Quantity */}
                  <TableCell className="text-right">
                    <span
                      className={`font-mono font-bold text-sm ${
                        m.type === "IN"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : m.type === "OUT"
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-indigo-600 dark:text-indigo-400"
                      }`}
                    >
                      {m.type === "IN" ? `+${m.quantity}` : m.type === "OUT" ? `-${m.quantity}` : `±${m.quantity}`}
                    </span>
                  </TableCell>

                  {/* Stock Balance Transition */}
                  <TableCell>
                    <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
                      <span>{m.previous_stock}</span>
                      <span className="mx-1 text-slate-400">&rarr;</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{m.new_stock}</span>
                    </div>
                  </TableCell>

                  {/* Reason & Ref */}
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <Badge variant="secondary" className="w-fit text-[10px] uppercase font-mono">
                        {m.reason}
                      </Badge>
                      {m.reference && m.reference !== "-" && (
                        <span className="text-[11px] text-slate-500 font-mono">
                          Ref: #{m.reference}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Operator & Notes */}
                  <TableCell>
                    <div className="text-xs">
                      <div className="text-slate-700 dark:text-slate-300 font-medium">
                        {m.created_by || "Admin"}
                      </div>
                      {m.notes && (
                        <div className="text-[11px] text-slate-400 italic max-w-xs truncate">
                          {m.notes}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

