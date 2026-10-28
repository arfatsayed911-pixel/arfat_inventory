"use client";

import React, { useState, useMemo } from "react";
import { StockMovement, MovementType } from "@/types/inventory";
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
  ArrowLeft
} from "lucide-react";

interface MovementsViewProps {
  movements: StockMovement[];
  onBackToHome: () => void;
  onOpenMovementModal: (productId?: string, type?: MovementType) => void;
}

export function MovementsView({
  movements,
  onBackToHome,
  onOpenMovementModal,
}: MovementsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

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
      return matchesSearch && matchesType;
    });
  }, [movements, searchTerm, typeFilter]);

  const handleExportCSV = () => {
    const headers = ["Date", "Product", "SKU", "Type", "Quantity", "Prev Stock", "New Stock", "Reason", "Reference", "Notes"];
    const rows = filteredMovements.map((m) => [
      `"${m.created_at}"`,
      `"${m.product?.name || ''}"`,
      `"${m.product?.sku || ''}"`,
      m.type,
      m.quantity,
      m.previous_stock,
      m.new_stock,
      `"${m.reason}"`,
      `"${m.reference || ''}"`,
      `"${m.notes || ''}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stock-movements-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
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
            Stock Movements ({movements.length})
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-8 px-2 text-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            CSV
          </Button>
          <Button
            size="sm"
            onClick={() => onOpenMovementModal()}
            className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white px-2.5"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Record
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex-1 max-w-xs relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search product or ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs shadow-xs focus-visible:outline-none dark:border-slate-800 dark:bg-slate-950"
        >
          <option value="ALL">All Types</option>
          <option value="IN">Stock In</option>
          <option value="OUT">Stock Out</option>
          <option value="ADJUSTMENT">Adjustment</option>
        </select>
      </div>

      {/* Table Container (Fits remaining height without page scrolling) */}
      <div className="flex-1 min-h-0 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-white dark:bg-slate-950 z-10 shadow-xs">
              <TableRow className="h-8">
                <TableHead className="py-2 text-[11px]">Date</TableHead>
                <TableHead className="py-2 text-[11px]">Product</TableHead>
                <TableHead className="py-2 text-[11px]">Type</TableHead>
                <TableHead className="py-2 text-[11px] text-right">Quantity</TableHead>
                <TableHead className="py-2 text-[11px]">Balance</TableHead>
                <TableHead className="py-2 text-[11px]">Reason / Ref</TableHead>
                <TableHead className="py-2 text-[11px]">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-slate-400">
                    No movements found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMovements.map((m) => (
                  <TableRow key={m.id} className="h-10 hover:bg-slate-50/70">
                    <TableCell className="py-2 text-[11px] text-slate-500 whitespace-nowrap">
                      {formatDate(m.created_at)}
                    </TableCell>

                    <TableCell className="py-2">
                      <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        {m.product?.name || "Product"}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {m.product?.sku}
                      </div>
                    </TableCell>

                    <TableCell className="py-2">
                      <div className="inline-flex items-center gap-1">
                        <span
                          className={`p-0.5 rounded ${
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
                        <span className="text-xs font-semibold">
                          {m.type === "IN" ? "In" : m.type === "OUT" ? "Out" : "Adj"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-2 text-right">
                      <span
                        className={`font-mono font-bold text-xs ${
                          m.type === "IN"
                            ? "text-emerald-600"
                            : m.type === "OUT"
                            ? "text-rose-600"
                            : "text-indigo-600"
                        }`}
                      >
                        {m.type === "IN" ? `+${m.quantity}` : m.type === "OUT" ? `-${m.quantity}` : `±${m.quantity}`}
                      </span>
                    </TableCell>

                    <TableCell className="py-2 text-xs font-mono text-slate-500">
                      {m.previous_stock} &rarr; <span className="font-bold text-slate-900 dark:text-slate-100">{m.new_stock}</span>
                    </TableCell>

                    <TableCell className="py-2">
                      <span className="text-xs capitalize font-medium">{m.reason}</span>
                      {m.reference && m.reference !== "-" && (
                        <span className="text-[10px] text-slate-400 font-mono ml-1">#{m.reference}</span>
                      )}
                    </TableCell>

                    <TableCell className="py-2 text-xs text-slate-400 max-w-[150px] truncate">
                      {m.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
