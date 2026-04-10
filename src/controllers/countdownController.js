/**
 * Live Countdown Image Endpoint
 * Serves an SVG countdown image that recalculates on every request.
 * Email clients re-fetch images on each open, so this creates a "live" countdown.
 * 
 * Usage: <img src="https://api.foodagriexpo.com/api/countdown?to=1794963600" />
 */

export const getCountdownImage = (req, res) => {
    // Target timestamp (seconds) — defaults to ASFAA-2026: Sept 17, 2026
    const targetTimestamp = parseInt(req.query.to || '1794963600') * 1000;
    const now = Date.now();
    const diff = Math.max(0, targetTimestamp - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n) => String(n).padStart(2, '0');

    const label = req.query.label || 'COUNTDOWN TO ASFAA-2026';
    const subtitle = req.query.sub || 'September 17–19, 2026 • Singapore';
    const bg = req.query.bg || '00113a';
    const fg = req.query.fg || 'ffffff';

    const isLive = diff > 0;

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="180" viewBox="0 0 600 180">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#${bg};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e3a5f;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="600" height="180" rx="14" fill="url(#bg)" />
  
  <!-- Label -->
  <text x="300" y="34" text-anchor="middle" fill="#94a3b8" font-family="Arial,Helvetica,sans-serif" font-size="11" font-weight="700" letter-spacing="2.5">${label}</text>
  
  ${isLive ? `
  <!-- Day Box -->
  <rect x="60" y="50" width="105" height="85" rx="10" fill="#ffffff" opacity="0.95" />
  <text x="112" y="100" text-anchor="middle" fill="#${bg}" font-family="Arial,Helvetica,sans-serif" font-size="40" font-weight="800">${pad(days)}</text>
  <text x="112" y="122" text-anchor="middle" fill="#64748b" font-family="Arial,Helvetica,sans-serif" font-size="10" font-weight="700" letter-spacing="1.5">DAYS</text>
  
  <!-- Hour Box -->
  <rect x="180" y="50" width="105" height="85" rx="10" fill="#ffffff" opacity="0.95" />
  <text x="232" y="100" text-anchor="middle" fill="#${bg}" font-family="Arial,Helvetica,sans-serif" font-size="40" font-weight="800">${pad(hours)}</text>
  <text x="232" y="122" text-anchor="middle" fill="#64748b" font-family="Arial,Helvetica,sans-serif" font-size="10" font-weight="700" letter-spacing="1.5">HOURS</text>

  <!-- Minute Box -->
  <rect x="300" y="50" width="105" height="85" rx="10" fill="#ffffff" opacity="0.95" />
  <text x="352" y="100" text-anchor="middle" fill="#${bg}" font-family="Arial,Helvetica,sans-serif" font-size="40" font-weight="800">${pad(minutes)}</text>
  <text x="352" y="122" text-anchor="middle" fill="#64748b" font-family="Arial,Helvetica,sans-serif" font-size="10" font-weight="700" letter-spacing="1.5">MINS</text>

  <!-- Seconds Box -->
  <rect x="420" y="50" width="105" height="85" rx="10" fill="#ffffff" opacity="0.95" />
  <text x="472" y="100" text-anchor="middle" fill="#${bg}" font-family="Arial,Helvetica,sans-serif" font-size="40" font-weight="800">${pad(seconds)}</text>
  <text x="472" y="122" text-anchor="middle" fill="#64748b" font-family="Arial,Helvetica,sans-serif" font-size="10" font-weight="700" letter-spacing="1.5">SECS</text>

  <!-- Divider dots -->
  <circle cx="172" cy="82" r="3" fill="#ffffff" opacity="0.4" />
  <circle cx="172" cy="98" r="3" fill="#ffffff" opacity="0.4" />
  <circle cx="292" cy="82" r="3" fill="#ffffff" opacity="0.4" />
  <circle cx="292" cy="98" r="3" fill="#ffffff" opacity="0.4" />
  <circle cx="412" cy="82" r="3" fill="#ffffff" opacity="0.4" />
  <circle cx="412" cy="98" r="3" fill="#ffffff" opacity="0.4" />
  ` : `
  <!-- Event Live Banner -->
  <text x="300" y="95" text-anchor="middle" fill="#ffffff" font-family="Arial,Helvetica,sans-serif" font-size="24" font-weight="700">🎉 THE SUMMIT IS LIVE!</text>
  `}
  
  <!-- Subtitle -->
  <text x="300" y="162" text-anchor="middle" fill="#cbd5e1" font-family="Arial,Helvetica,sans-serif" font-size="11" font-weight="500">${subtitle}</text>
</svg>`;

    // Critical: prevent caching so email clients always fetch a fresh image
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.send(svg);
};
