"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Mail, 
  Globe, 
  Github, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Key, 
  Server, 
  Sparkles,
  ShieldCheck,
  Terminal
} from "lucide-react";

interface SetupViewProps {
  isSupabaseLive: boolean;
  onOpenAlertsModal: () => void;
}

export function SetupView({ isSupabaseLive, onOpenAlertsModal }: SetupViewProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const schemaSnippet = `-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  barcode TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  unit TEXT NOT NULL DEFAULT 'pcs',
  cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  current_stock INTEGER NOT NULL DEFAULT 0,
  min_threshold INTEGER NOT NULL DEFAULT 5,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Stock Movements (Audit Trail)
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('IN', 'OUT', 'ADJUSTMENT')),
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('purchase', 'sale', 'damaged', 'return', 'audit', 'initial', 'transfer')),
  reference TEXT,
  notes TEXT,
  created_by TEXT DEFAULT 'Admin',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON categories FOR ALL USING (true);
CREATE POLICY "Allow public read" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON products FOR ALL USING (true);
CREATE POLICY "Allow public read" ON stock_movements FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON stock_movements FOR ALL USING (true);`;

  const envSnippet = `# 1. Supabase Connection (Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# 2. Resend Email Notifications (https://resend.com/api-keys)
RESEND_API_KEY=re_123456789_abcdefg
RESEND_FROM_EMAIL=inventory@yourdomain.com
ALERT_RECIPIENT_EMAIL=admin@yourdomain.com

# 3. App URL for action links
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Architecture, Supabase & Deployment Setup
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Everything you need to connect your live Supabase database, Resend email notifications, GitHub, and deploy to Vercel with a custom domain.
        </p>
      </div>

      {/* Live System Health & Integrations Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Supabase Status */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <CardTitle className="text-sm">Supabase PostgreSQL</CardTitle>
              </div>
              <Badge variant={isSupabaseLive ? "success" : "secondary"}>
                {isSupabaseLive ? "Connected & Active" : "Fallback / Demo Mode"}
              </Badge>
            </div>
            <CardDescription className="text-xs pt-1">
              {isSupabaseLive
                ? "Live connection established via Supabase JS client."
                : "Currently using persistent client storage. Add your credentials in .env.local to activate live DB."}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Resend Status */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-600" />
                <CardTitle className="text-sm">Resend Email Delivery</CardTitle>
              </div>
              <Badge variant="warning">Ready for API Key</Badge>
            </div>
            <CardDescription className="text-xs pt-1">
              Official SDK integration in <span className="font-mono">/api/alerts/low-stock</span>. Supports both live and preview modes.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenAlertsModal}
              className="w-full text-xs"
            >
              Test Resend Notification
            </Button>
          </CardContent>
        </Card>

        {/* Vercel Status */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600" />
                <CardTitle className="text-sm">Vercel & Custom Domain</CardTitle>
              </div>
              <Badge variant="outline">Production Ready</Badge>
            </div>
            <CardDescription className="text-xs pt-1">
              Standard Next.js 15 App Router architecture ready for zero-config Vercel import.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* 1. Supabase PostgreSQL Schema */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              <div>
                <CardTitle className="text-base">1. Supabase PostgreSQL Setup</CardTitle>
                <CardDescription className="text-xs">
                  Create tables, foreign keys, triggers, and Row-Level Security (RLS) policies.
                </CardDescription>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(schemaSnippet, "schema")}
              className="text-xs"
            >
              {copiedSection === "schema" ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Copied SQL
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy SQL
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <li>Create a project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">supabase.com</a>.</li>
            <li>Go to <strong>SQL Editor</strong> in the Supabase Dashboard.</li>
            <li>Paste and run the SQL below (also located in <span className="font-mono">supabase/schema.sql</span>).</li>
          </ol>

          <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed">
            {schemaSnippet}
          </pre>
        </CardContent>
      </Card>

      {/* 2. Environment Variables (.env.local) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-600" />
              <div>
                <CardTitle className="text-base">2. Environment Configuration</CardTitle>
                <CardDescription className="text-xs">
                  Copy these keys into your local <span className="font-mono">.env.local</span> and into your Vercel Project Settings.
                </CardDescription>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(envSnippet, "env")}
              className="text-xs"
            >
              {copiedSection === "env" ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Copied .env
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy .env
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto leading-relaxed">
            {envSnippet}
          </pre>
        </CardContent>
      </Card>

      {/* 3. Vercel & Custom Domain Deployment Guide */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            <div>
              <CardTitle className="text-base">3. Deploying to Vercel & Connecting Custom Domain</CardTitle>
              <CardDescription className="text-xs">
                Step-by-step instructions for continuous deployment and domain mapping.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Github className="w-4 h-4" />
              Step A: Push to GitHub
            </h4>
            <pre className="p-2.5 rounded bg-slate-100 dark:bg-slate-900 font-mono text-[11px] text-slate-800 dark:text-slate-200">
              git init
              {"\n"}git add .
              {"\n"}git commit -m &quot;Initial Inventory Management System&quot;
              {"\n"}git branch -M main
              {"\n"}git remote add origin https://github.com/your-username/inventory-management.git
              {"\n"}git push -u origin main
            </pre>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Server className="w-4 h-4" />
              Step B: Import Repository in Vercel
            </h4>
            <p>
              1. Log in to <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">vercel.com</a> &rarr; Click <strong>&quot;Add New...&quot;</strong> &rarr; <strong>&quot;Project&quot;</strong>.
              <br />
              2. Select your GitHub repository. Vercel detects Next.js automatically.
              <br />
              3. Expand <strong>Environment Variables</strong> and paste your Supabase and Resend keys.
              <br />
              4. Click <strong>Deploy</strong>. Vercel will build and launch your application globally on its high-speed Edge network.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              Step C: Connecting Your Custom Domain
            </h4>
            <p>
              1. In your Vercel Project Dashboard, navigate to <strong>Settings</strong> &rarr; <strong>Domains</strong>.
              <br />
              2. Type your domain (e.g., <span className="font-mono font-semibold">inventory.yourcompany.com</span> or <span className="font-mono font-semibold">yourdomain.com</span>) and click <strong>Add</strong>.
              <br />
              3. At your domain registrar (GoDaddy, Namecheap, Cloudflare, Google Domains):
            </p>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 space-y-1 font-mono text-[11px]">
              <div><strong>For Apex / Root Domain (e.g. yourdomain.com):</strong></div>
              <div>Type: <strong>A Record</strong> | Name: <strong>@</strong> | Value: <strong>76.76.21.21</strong></div>
              <div className="pt-2"><strong>For Subdomains (e.g. inventory.yourdomain.com):</strong></div>
              <div>Type: <strong>CNAME</strong> | Name: <strong>inventory</strong> | Value: <strong>cname.vercel-dns.com</strong></div>
            </div>
            <p>
              4. Vercel automatically provisions free SSL/TLS certificates and activates HTTPS within minutes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

