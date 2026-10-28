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
  const [recipientEmail, setRecipientEmail] = useState("admin@example.com");
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
          storeName: "Arfat Inventory",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      setResult({
        success: true,
        mode: data.mode,
        message: data.message,
        previewHtml: data.previewHtml,
      });
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || "Failed",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="text-base flex items-center gap-2">
          <Mail className="w-4 h-4 text-amber-600" />
          Low Stock Alert Email
        </DialogTitle>
        <DialogDescription className="text-xs">
          Send stock deficit notification via Resend.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="Recipient email"
            className="h-8 text-xs"
          />
          <Button
            onClick={handleSendEmail}
            disabled={sending || lowStockItems.length === 0}
            className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white shrink-0 px-3"
          >
            {sending ? "Sending..." : "Send"}
          </Button>
        </div>

        {result && (
          <div
            className={`p-2.5 rounded border text-xs ${
              result.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <p className="font-semibold text-xs">{result.message}</p>
            {result.previewHtml && (
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="mt-1 text-[11px] underline font-medium block"
              >
                {showPreview ? "Hide Preview" : "Show Email Preview"}
              </button>
            )}
          </div>
        )}

        {showPreview && result?.previewHtml && (
          <iframe
            srcDoc={result.previewHtml}
            title="Preview"
            className="w-full h-48 border rounded bg-white text-xs"
          />
        )}

        <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 rounded border border-slate-200 text-xs">
          {lowStockItems.map((item) => (
            <div key={item.id} className="p-2 flex items-center justify-between">
              <div>
                <span className="font-semibold text-xs">{item.name}</span>
                <span className="text-[10px] text-slate-400 font-mono ml-1.5">{item.sku}</span>
              </div>
              <Badge variant={item.current_stock === 0 ? "destructive" : "warning"} className="text-[10px] py-0 px-1">
                {item.current_stock} left (min: {item.min_threshold})
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-7 text-xs">
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
