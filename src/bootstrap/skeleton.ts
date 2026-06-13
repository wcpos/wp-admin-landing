// src/bootstrap/skeleton.ts
// A branded loading placeholder shown the instant the bootstrap runs, before
// the variant chunk + analytics resolve. Pure inline HTML/CSS (no React, no
// variant stylesheet yet): the awning stripe for immediate brand recognition,
// plus a shimmering hero layout that signals "a page is assembling" and roughly
// matches the free-plus shape to minimise layout shift on swap.

const BAR = (w: string, h = '14px', extra = '') =>
  `<div class="wcpos-sk-bar" style="width:${w};height:${h};${extra}"></div>`;

export function showSkeleton(el: HTMLElement): void {
  el.innerHTML = `
<style>
  @keyframes wcpos-sk-shimmer { 100% { transform: translateX(100%); } }
  #woocommerce-pos-upgrade .wcpos-sk { position:relative; overflow:hidden; border-radius:8px; background:#fff;
    box-shadow:0 1px 2px rgba(0,0,0,.04); }
  #woocommerce-pos-upgrade .wcpos-sk-bar { position:relative; overflow:hidden; border-radius:6px; background:#eceef1; }
  #woocommerce-pos-upgrade .wcpos-sk-bar::after, #woocommerce-pos-upgrade .wcpos-sk-img::after {
    content:""; position:absolute; inset:0; transform:translateX(-100%);
    background:linear-gradient(90deg, transparent, rgba(255,255,255,.65), transparent);
    animation:wcpos-sk-shimmer 1.25s infinite; }
  #woocommerce-pos-upgrade .wcpos-sk-img { position:relative; overflow:hidden; border-radius:10px; background:#e7eaee; min-height:240px; }
  #woocommerce-pos-upgrade .wcpos-sk-grid { display:grid; gap:40px; padding:40px; align-items:center; }
  @media (min-width:1024px){ #woocommerce-pos-upgrade .wcpos-sk-grid { grid-template-columns:1fr 1fr; padding:56px; } }
</style>
<div class="wcpos-sk" role="status" aria-label="Loading" aria-live="polite">
  <div aria-hidden="true" style="height:7px;background:repeating-linear-gradient(90deg,#CD2C24 0 26px,#F5E5C0 26px 52px)"></div>
  <div class="wcpos-sk-grid">
    <div style="display:flex;flex-direction:column;gap:18px">
      ${BAR('190px', '22px', 'border-radius:999px;background:#f3e9d0')}
      <div style="display:flex;flex-direction:column;gap:10px">
        ${BAR('70%', '30px')}
        ${BAR('55%', '30px')}
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:4px">
        ${BAR('95%')}${BAR('90%')}${BAR('60%')}
      </div>
      <div style="display:flex;gap:14px;align-items:center;margin-top:10px">
        ${BAR('130px', '40px', 'border-radius:8px;background:#f0cfcd')}
        ${BAR('120px', '14px')}
      </div>
    </div>
    <div class="wcpos-sk-img"></div>
  </div>
</div>`;
}

export function clearSkeleton(el: HTMLElement): void {
  el.innerHTML = '';
}
