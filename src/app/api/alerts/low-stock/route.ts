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
    const { items, recipientEmail, storeName = "Arfat Inventory" } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items provided" },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const toEmail = recipientEmail || process.env.ALERT_RECIPIENT_EMAIL || "admin@example.com";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3005";

    const subject = `⚠️ Low Stock Alert: ${items.length} item(s) - ${storeName}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
            .card { max-width: 580px; margin: 0 auto; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
            .header { background: #0f172a; color: #fff; padding: 16px 20px; }
            .header h1 { margin: 0; font-size: 16px; font-weight: 600; }
            .body { padding: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 12px; }
            th { text-align: left; padding: 8px; background: #f1f5f9; color: #475569; font-size: 11px; }
            td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
            .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: 600; font-size: 10px; background: #fef3c7; color: #b45309; }
            .btn { display: inline-block; background: #0f172a; color: #ffffff !important; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-size: 12px; margin-top: 16px; }
            .footer { padding: 12px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>${storeName} &mdash; Low Stock Alert</h1>
            </div>
            <div class="body">
              <p style="margin: 0 0 12px 0; font-size: 13px;">The following items are at or below minimum threshold:</p>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th style="text-align: right;">Stock</th>
                    <th style="text-align: right;">Min</th>
                  </tr>
                </thead>
                <tbody>
                  ${items
                    .map(
                      (item) => `
                    <tr>
                      <td><strong>${item.name}</strong></td>
                      <td style="font-family: monospace; color: #64748b;">${item.sku}</td>
                      <td style="text-align: right;"><span class="badge">${item.current_stock} left</span></td>
                      <td style="text-align: right; color: #64748b;">${item.min_threshold}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>

              <div style="text-align: center; margin-top: 16px;">
                <a href="${appUrl}" class="btn" target="_blank">Open Arfat Inventory</a>
              </div>
            </div>
            <div class="footer">
              Arfat Inventory &bull; Automated Resend Notification
            </div>
          </div>
        </body>
      </html>
    `;

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
        message: `Dispatched to ${toEmail}`,
      });
    }

    return NextResponse.json({
      success: true,
      mode: "simulated",
      recipient: toEmail,
      itemsCount: items.length,
      subject,
      previewHtml: emailHtml,
      message: `[Simulated] Ready. Configure RESEND_API_KEY in .env.local to deliver to ${toEmail}.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to dispatch email" },
      { status: 500 }
    );
  }
}
