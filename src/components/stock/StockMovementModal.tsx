"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product, MovementType, MovementReason } from "@/types/inventory";
import { ArrowDownLeft, ArrowUpRight, SlidersHorizontal } from "lucide-react";

interface StockMovementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  initialProductId?: string;
  initialType?: MovementType;
  onRecord: (params: {
    product_id: string;
    type: MovementType;
    quantity: number;
    reason: MovementReason;
    reference?: string;
    notes?: string;
    created_by?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function StockMovementModal({
  open,
  onOpenChange,
  products,
  initialProductId,
  initialType = "IN",
  onRecord,
}: StockMovementModalProps) {
  const [productId, setProductId] = useState<string>("");
  const [type, setType] = useState<MovementType>(initialType);
  const [quantity, setQuantity] = useState<string>("1");
  const [reason, setReason] = useState<MovementReason>("purchase");
  const [reference, setReference] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [createdBy, setCreatedBy] = useState<string>("Admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialProductId) {
      setProductId(initialProductId);
    } else if (products.length > 0 && !productId) {
      setProductId(products[0].id);
    }
    if (initialType) {
      setType(initialType);
      if (initialType === "IN") setReason("purchase");
      if (initialType === "OUT") setReason("sale");
      if (initialType === "ADJUSTMENT") setReason("audit");
    }
    setQuantity("1");
    setReference("");
    setNotes("");
    setError(null);
  }, [open, initialProductId, initialType, products]);

  const selectedProduct = products.find((p) => p.id === productId);
  const currentStock = selectedProduct ? selectedProduct.current_stock : 0;
  const numQty = parseInt(quantity) || 0;

  // Calculation of projected new stock
  let projectedStock = currentStock;
  if (type === "IN") {
    projectedStock = currentStock + numQty;
  } else if (type === "OUT") {
    projectedStock = Math.max(0, currentStock - numQty);
  } else if (type === "ADJUSTMENT") {
    projectedStock = numQty;
  }

  const handleTypeChange = (newType: MovementType) => {
    setType(newType);
    if (newType === "IN") setReason("purchase");
    if (newType === "OUT") setReason("sale");
    if (newType === "ADJUSTMENT") {
      setReason("audit");
      setQuantity(String(currentStock));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!productId) {
      setError("Please select a product.");
      return;
    }

    if (numQty <= 0 && type !== "ADJUSTMENT") {
      setError("Quantity must be greater than zero.");
      return;
    }

    if (type === "OUT" && numQty > currentStock) {
      setError(`Cannot dispatch ${numQty} units. Current stock is only ${currentStock} ${selectedProduct?.unit || 'units'}.`);
      return;
    }

    setLoading(true);
    try {
      const res = await onRecord({
        product_id: productId,
        type,
        quantity: numQty,
        reason,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
        created_by: createdBy.trim() || "Admin",
      });

      if (!res.success) {
        setError(res.error || "Failed to record stock movement");
      } else {
        onOpenChange(false);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Record Stock Movement</DialogTitle>
        <DialogDescription>
          Record inventory intake, dispatch, or audit adjustments with precise tracking.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Movement Type Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-lg dark:bg-slate-800">
          <button
            type="button"
            onClick={() => handleTypeChange("IN")}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-all ${
              type === "IN"
                ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-900 dark:text-emerald-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            Stock In (Receive)
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("OUT")}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-all ${
              type === "OUT"
                ? "bg-white text-rose-700 shadow-sm dark:bg-slate-900 dark:text-rose-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Stock Out (Dispatch)
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("ADJUSTMENT")}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-all ${
              type === "ADJUSTMENT"
                ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Adjustment
          </button>
        </div>

        {/* Product Selection */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Product *
          </label>
          <select
            className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku}) — Current: {p.current_stock} {p.unit}
              </option>
            ))}
          </select>
        </div>

        {/* Calculation Preview Banner */}
        {selectedProduct && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs dark:bg-slate-800/60 dark:border-slate-800">
            <div>
              <span className="text-slate-500">Current Stock:</span>{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {currentStock} {selectedProduct.unit}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500">Projected Balance:</span>{" "}
              <span
                className={`font-bold ${
                  projectedStock <= selectedProduct.min_threshold
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {projectedStock} {selectedProduct.unit}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {type === "ADJUSTMENT" ? "New Accurate Count *" : "Quantity *"}
            </label>
            <Input
              type="number"
              min={type === "ADJUSTMENT" ? "0" : "1"}
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Reason *
            </label>
            <select
              className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
              value={reason}
              onChange={(e) => setReason(e.target.value as MovementReason)}
            >
              {type === "IN" && (
                <>
                  <option value="purchase">Purchase Order (Restock)</option>
                  <option value="return">Customer Return</option>
                  <option value="initial">Initial Intake</option>
                  <option value="transfer">Warehouse Transfer In</option>
                </>
              )}
              {type === "OUT" && (
                <>
                  <option value="sale">Sales Fulfillment</option>
                  <option value="damaged">Damaged / Expired</option>
                  <option value="transfer">Warehouse Transfer Out</option>
                </>
              )}
              {type === "ADJUSTMENT" && (
                <>
                  <option value="audit">Physical Stock Count Audit</option>
                  <option value="damaged">Write-off Adjustment</option>
                </>
              )}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Reference / PO / Invoice #
            </label>
            <Input
              placeholder={type === "IN" ? "e.g. PO-8910" : "e.g. INV-4491"}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Recorded By
            </label>
            <Input
              placeholder="e.g. Inventory Manager"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Movement Notes (Optional)
            </label>
            <Input
              placeholder="e.g. Supplier delivered via DHL tracking #..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className={
              type === "IN"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : type === "OUT"
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }
          >
            {loading ? "Recording..." : `Confirm ${type === "IN" ? "Stock In" : type === "OUT" ? "Stock Out" : "Adjustment"}`}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

