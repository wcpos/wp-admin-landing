export function showSkeleton(el: HTMLElement): void {
  el.innerHTML =
    '<div style="padding:48px;display:flex;justify-content:center;color:#8b95a3;font-size:13px;">…</div>';
}
export function clearSkeleton(el: HTMLElement): void {
  el.innerHTML = '';
}
