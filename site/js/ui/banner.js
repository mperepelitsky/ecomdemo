const DEMO_BANNER_ID = "demoBanner";

function buildDemoBanner(pageType) {
  const banner = document.createElement("div");
  banner.id = DEMO_BANNER_ID;
  banner.setAttribute("role", "status");
  banner.style.cssText =
    "background:#f59e0b;color:#111827;padding:8px 16px;font-family:Arial, sans-serif;font-size:14px;display:flex;align-items:center;justify-content:center;gap:8px;text-align:center;border-bottom:1px solid #e5e7eb;";

  if (pageType) {
    banner.setAttribute("data-page-type", pageType);
  }

  const badge = document.createElement("span");
  badge.textContent = "DEMO";
  badge.style.cssText =
    "background:#111827;color:#f59e0b;padding:2px 6px;border-radius:4px;font-weight:700;font-size:12px;letter-spacing:0.08em;";

  const message = document.createElement("span");
  message.textContent = "This site is a demo. Orders will not be fulfilled.";

  banner.append(badge, message);
  return banner;
}

export function initDemoBanner({ pageType } = {}) {
  if (document.getElementById(DEMO_BANNER_ID)) {
    return;
  }

  if (!document.body) {
    return;
  }

  const banner = buildDemoBanner(pageType);
  document.body.prepend(banner);
}
