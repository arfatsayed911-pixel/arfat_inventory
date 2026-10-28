"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Mail, 
  Globe, 
  CheckCircle2, 
  Copy, 
  ArrowLeft
} from "lucide-react";

interface SetupViewProps {
  isSupabaseLive: boolean;
  onBackToHome: () => void;
  onOpenAlertsModal: () => void;
}

export function SetupView({ isSupabaseLive, onBackToHome, onOpenAlertsModal }: SetupViewProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const envSnippet = `# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Resend
RESEND_API_KEY=re_123456789_abcdefg
RESEND_FROM_EMAIL=inventory@yourdomain.com
ALERT_RECIPIENT_EMAIL=admin@yourdomain.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3005`;

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
            System & Deployment
          </h1>
        </div>

        <Badge variant={isSupabaseLive ? "success" : "secondary"} className="text-xs">
          {isSupabaseLive ? "Supabase Live" : "Demo Mode"}
        </Badge>
      </div>

      {/* 3 Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 shrink-0">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-600" /> Supabase DB
            </span>
            <Badge variant={isSupabaseLive ? "success" : "outline"} className="text-[10px]">
              {isSupabaseLive ? "Connected" : "Local"}
            </Badge>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Schema in <span className="font-mono text-slate-600">supabase/schema.sql</span>
          </p>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-amber-600" /> Resend Alerts
            </span>
            <Button size="sm" variant="ghost" onClick={onOpenAlertsModal} className="h-6 px-1.5 text-[11px]">
              Test Alert &rarr;
            </Button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Official SDK route in <span className="font-mono text-slate-600">/api/alerts/low-stock</span>
          </p>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-600" /> Vercel & Domain
            </span>
            <Badge variant="outline" className="text-[10px]">Ready</Badge>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            CNAME <span className="font-mono text-slate-600">cname.vercel-dns.com</span>
          </p>
        </Card>
      </div>

      {/* Environment Config Snippet Box (Fits remaining height) */}
      <div className="flex-1 min-h-0 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 overflow-hidden flex flex-col p-3">
        <div className="flex items-center justify-between mb-2 shrink-0">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Environment Variables (.env.local)
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => copyToClipboard(envSnippet, "env")}
            className="h-7 text-xs px-2"
          >
            {copiedSection === "env" ? (
              <>
                <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" /> Copy
              </>
            )}
          </Button>
        </div>

        <pre className="flex-1 overflow-y-auto p-3 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono leading-relaxed select-all">
          {envSnippet}
        </pre>
      </div>
    </div>
  );
}
