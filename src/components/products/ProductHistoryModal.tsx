"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product, StockMovement } from "@/types/inventory";
import { InventoryService } from "@/lib/services/inventoryService";
import { formatDate } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, SlidersHorizontal, History } from "lucide-react";

interface ProductHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function ProductHistoryModal({
  open,
  onOpenChange,
  product,
}: ProductHistoryModalProps) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && product) {
      setLoading(true);
      InventoryService.getStockMovements(product.id)
        .then((data) => setMovements(data))
        .finally(() => setLoading(false));
    }
  }, [open, product]);

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
            <History className="w-5 h-5" />
          </div>
          <div>
            <DialogTitle>Stock Audit Trail: {product.name}</DialogTitle>
            <DialogDescription>
              SKU: <span className="font-mono">{product.sku}</span> &bull; Current Stock:{" "}
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {product.current_stock} {product.unit}
              </span>
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-4">
        <div className="border border-slate-200 rounded-lg overflow-hidden dark:border-slate-800">
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-500">
                Loading movement audit trail...
              </div>
            ) : movements.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No recorded stock movements for this item yet.
              </div>
            ) : (
              movements.map((m) => (
                <div key={m.id} className="p-3 text-xs flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`p-1.5 rounded mt-0.5 ${
                        m.type === "IN"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                          : m.type === "OUT"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                          : "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400"
                      }`}
                    >
                      {m.type === "IN" ? (
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                      ) : m.type === "OUT" ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold capitalize text-slate-900 dark:text-slate-100">
                          {m.type === "IN" ? "Stock In" : m.type === "OUT" ? "Stock Out" : "Adjustment"}
                        </span>
                        <Badge variant="secondary" className="text-[10px] uppercase">
                          {m.reason}
                        </Badge>
                        {m.reference && m.reference !== "-" && (
                          <span className="text-[11px] font-mono text-slate-500">
                            #{m.reference}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {formatDate(m.created_at)} &bull; By {m.created_by || "Admin"}
                      </div>
                      {m.notes && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 italic">
                          &ldquo;{m.notes}&rdquo;
                        </div>
                      )}
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
                      Balance: {m.previous_stock} &rarr; {m.new_stock}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

