"use client";

import React, { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LowStockAlertItem } from "@/types/inventory";
import { Mail, CheckCircle2, AlertTriangle, Eye, SendHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LowStockNotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lowStockItems: LowStockAlertItem[];
}

export function LowStockNotificationModal({
  open,
  onOpenChange,
  lowStockItems,
}: LowStockNotificationModalProps) {
  const [recipientEmail, setRecipientEmail] = useState("admin@yourdomain.com");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    mode?: string;
    message?: string;
    previewHtml?: string;
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleSendEmail = async () => {
    setSending(true);
    setResult(null);

    try {
      const res = await fetch("/api/alerts/low-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lowStockItems,
          recipientEmail: recipientEmail.trim(),
          storeName: "StockPulse Inventory",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to trigger email alert");
      }

      setResult({
        success: true,
        mode: data.mode,
        message: data.message,
        previewHtml: data.previewHtml,
      });
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || "Failed to dispatch email",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <DialogTitle>Send Resend Low-Stock Email Alert</DialogTitle>
            <DialogDescription>
              Notify procurement managers of stock deficits via the Resend API.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-4">
        {/* Recipient Input */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Recipient Alert Email
          </label>
          <div className="flex gap-2">
            <Input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="procurement@company.com"
            />
            <Button
              onClick={handleSendEmail}
              disabled={sending || lowStockItems.length === 0}
              className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
            >
              {sending ? (
                "Sending..."
              ) : (
                <span className="flex items-center gap-1.5">
                  <SendHorizontal className="w-3.5 h-3.5" />
                  Dispatch
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Result Feedback Banner */}
        {result && (
          <div
            className={`p-3 rounded-lg border text-xs ${
              result.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
                : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300"
            }`}
          >
            <div className="flex items-start gap-2">
              {result.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-semibold">
                  {result.success
                    ? result.mode === "live"
                      ? "Email Successfully Sent via Resend!"
                      : "Email Prepared & Verified (Simulated Mode)"
                    : "Failed to Send Alert"}
                </p>
                <p className="text-[11px] opacity-90 leading-relaxed">{result.message}</p>
                {result.previewHtml && (
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-1 mt-1 font-semibold underline text-emerald-700 hover:text-emerald-900 dark:text-emerald-400"
                  >
                    <Eye className="w-3 h-3" />
                    {showPreview ? "Hide Rendered Email" : "Preview Rendered Email"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rendered HTML preview if toggled */}
        {showPreview && result?.previewHtml && (
          <div className="border border-slate-200 rounded-lg p-2 max-h-60 overflow-y-auto bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
            <iframe
              srcDoc={result.previewHtml}
              title="Email Preview"
              className="w-full h-72 border-0 bg-white rounded"
            />
          </div>
        )}

        {/* Low Stock Items Summary */}
        <div className="border border-slate-200 rounded-lg overflow-hidden dark:border-slate-800">
          <div className="bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 border-b border-slate-200 dark:bg-slate-800/80 dark:border-slate-800 dark:text-slate-300 flex justify-between items-center">
            <span>Items Included in Alert ({lowStockItems.length})</span>
            <span className="text-[10px] text-slate-500 font-normal">
              Based on minimum threshold criteria
            </span>
          </div>
          <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {lowStockItems.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                All inventory levels are currently above minimum alert thresholds!
              </div>
            ) : (
              lowStockItems.map((item) => (
                <div key={item.id} className="p-3 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {item.sku} &bull; {item.category}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">
                      Threshold: {item.min_threshold}
                    </span>
                    <Badge variant={item.current_stock === 0 ? "destructive" : "warning"}>
                      {item.current_stock === 0 ? "Out of Stock (0)" : `${item.current_stock} left`}
                    </Badge>
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

