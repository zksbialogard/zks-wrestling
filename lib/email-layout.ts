const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "https://zks-wrestling.vercel.app";

export function wrapEmailHtml(content: string, previewText?: string) {
  const safeContent = content.trim();

  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ZKS Białogard</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;color:#e0e0e0;">
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>` : ""}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0a0a0a;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#121212;border:1px solid rgba(212,175,55,0.35);border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:24px 28px;background:linear-gradient(135deg,#f7d154 0%,#d4af37 45%,#8a6d3b 100%);color:#000;">
              <p style="margin:0;font-size:12px;letter-spacing:0.25em;text-transform:uppercase;font-weight:700;">ZKS Białogard</p>
              <h1 style="margin:8px 0 0;font-size:24px;line-height:1.2;">Manager klubowy</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;font-size:15px;line-height:1.7;color:#e0e0e0;">
              ${safeContent}
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px;">
              <a href="${APP_URL}/panel-rodzica" style="display:inline-block;background:#d4af37;color:#000;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:8px;">
                Otwórz panel rodzica
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px;border-top:1px solid rgba(212,175,55,0.2);font-size:12px;color:#a3a3a3;">
              ZKS Białogard · Wiadomość automatyczna z aplikacji klubowej.<br />
              W razie pytań: <a href="mailto:zksbialogard@wp.pl" style="color:#f7d154;">zksbialogard@wp.pl</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function absoluteAppLink(path: string) {
  if (path.startsWith("http")) {
    return path;
  }

  return `${APP_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
