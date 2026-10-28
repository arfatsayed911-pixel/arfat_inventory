import { NextResponse } from "next/server";
import { Resend } from "resend";
import { LowStockAlertItem } from "@/types/inventory";

interface RequestPayload {
  items: LowStockAlertItem[];
  recipientEmail?: string;
  storeName?: string;
}

export async function POST(request: Request) {
  try {
    const body: RequestPayload = await request.json();
    const { items, recipientEmail, storeName = "Acme Inventory" } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No low stock items provided for alert" },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const toEmail = recipientEmail || process.env.ALERT_RECIPIENT_EMAIL || "admin@example.com";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.vercel.app";

    const subject = `⚠️ Low Stock Alert: ${items.length} product(s) require reordering - ${storeName}`;

    // Build modern minimalist HTML email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; line-height: 1.5; }
            .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            .header { background: #0f172a; color: #ffffff; padding: 24px; border-bottom: 3px solid #ef4444; }
            .header h1 { margin: 0 0 6px 0; font-size: 20px; font-weight: 600; display: flex; align-items: center; }
            .header p { margin: 0; color: #94a3b8; font-size: 14px; }
            .body { padding: 24px; }
            .alert-banner { background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px; color: #991b1b; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px; }
            th { text-align: left; padding: 10px 12px; background: #f1f5f9; color: #475569; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; }
            td { padding: 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
            .badge-out { display: inline-block; padding: 2px 8px; border-radius: 9999px; background: #fee2e2; color: #b91c1c; font-weight: 600; font-size: 11px; }
            .badge-low { display: inline-block; padding: 2px 8px; border-radius: 9999px; background: #fef3c7; color: #b45309; font-weight: 600; font-size: 11px; }
            .btn { display: inline-block; background: #2563eb; color: #ffffff !important; font-weight: 500; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; margin-top: 8px; }
            .footer { padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Inventory Stock Warning</h1>
              <p>${storeName} &bull; Automated Stock Monitor</p>
            </div>
            <div class="body">
              <div class="alert-banner">
                <strong>Attention Required:</strong> The following <strong>${items.length} items</strong> have fallen to or below their safe minimum reorder thresholds.
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th style="text-align: right;">Current Stock</th>
                    <th style="text-align: right;">Min Alert</th>
                  </tr>
                </thead>
                <tbody>
                  ${items
                    .map(
                      (item) => `
                    <tr>
                      <td><strong>${item.name}</strong></td>
                      <td style="font-family: monospace; color: #64748b;">${item.sku}</td>
                      <td>${item.category}</td>
                      <td style="text-align: right;">
                        <span class="${item.current_stock === 0 ? "badge-out" : "badge-low"}">
                          ${item.current_stock === 0 ? "Out of Stock (0)" : `${item.current_stock} remaining`}
                        </span>
                      </td>
                      <td style="text-align: right; color: #64748b;">${item.min_threshold}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>

              <div style="text-align: center; margin-top: 20px;">
                <a href="${appUrl}" class="btn" target="_blank">Open StockPulse Inventory Dashboard</a>
              </div>
            </div>
            <div class="footer">
              This automated email was generated by StockPulse Stock Management System &bull; Powered by Resend & Supabase
            </div>
          </div>
        </body>
      </html>
    `;

    // If Resend API key is provided and valid, send the real email!
    if (resendApiKey && !resendApiKey.includes("123456789")) {
      const resend = new Resend(resendApiKey);
      const data = await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject,
        html: emailHtml,
      });

      return NextResponse.json({
        success: true,
        mode: "live",
        data,
        recipient: toEmail,
        itemsCount: items.length,
        message: `Low stock alert email successfully dispatched via Resend to ${toEmail}`,
      });
    }

    // In demo/test mode when RESEND_API_KEY is not configured yet
    return NextResponse.json({
      success: true,
      mode: "simulated",
      recipient: toEmail,
      itemsCount: items.length,
      subject,
      previewHtml: emailHtml,
      message: `[Simulated Mode] RESEND_API_KEY is not yet configured in .env.local. The email payload was constructed and verified successfully. Once you add RESEND_API_KEY, emails will be delivered to ${toEmail}.`,
    });
  } catch (error: any) {
    console.error("Resend API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error dispatching alert email" },
      { status: 500 }
    );
  }
}

