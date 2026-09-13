/**
 * Loaders.
 *
 * Two families, because the app has two skins: the dark marketing/auth shell
 * and the light dashboard. Route-level `loading.tsx` files pick the one that
 * matches the segment they cover, so a navigation never flashes a white screen
 * on top of a dark page.
 */

/** Inline spinner for panels inside the (light) dashboard. */
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primaryColor/15 border-t-primaryColor" />
    </div>
  );
}

/**
 * Page-level loader for the light dashboard.
 *
 * Fills the content area rather than the viewport — the sidebar and header stay
 * put during a route change, so only the pane that is actually loading moves.
 */
export function LoadingPage() {
  return (
    <div className="flex min-h-[65vh] w-full items-center justify-center bg-offWhiteColor">
      <div className="flex flex-col items-center gap-4">
        <div className="h-11 w-11 animate-spin rounded-full border-2 border-primaryColor/15 border-t-primaryColor" />
        <p className="text-sm text-darkGrayColor">Loading…</p>
      </div>
    </div>
  );
}

/**
 * Full-screen loader for the dark shell (landing + auth).
 *
 * Mirrors the auth layout: night canvas, blueprint grid, the two accent glows,
 * and the HRX mark — so a route change reads as the same surface settling
 * rather than a different page being swapped in.
 */
export function BrandLoadingPage({ label = "Loading" }: { label?: string }) {
  return (
    <div className="hrx-dark hrx-grid fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-nightColor font-[family-name:var(--font-poppins)] text-lightColor">
      <div className="pointer-events-none absolute -left-24 top-0 h-[420px] w-[420px] rounded-full bg-accentColor/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-10 h-[320px] w-[320px] rounded-full bg-glowColor/10 blur-[110px]" />

      <div className="relative flex flex-col items-center">
        <div className="relative">
          {/* halo breathing behind the mark */}
          <span className="absolute inset-0 -z-10 rounded-2xl bg-accentColor/30 blur-xl hrx-breathe" />
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accentColor to-glowColor text-xl font-bold text-white shadow-[0_12px_40px_-12px_rgba(99,102,241,0.9)]">
            H
          </span>
        </div>

        <span className="mt-5 text-[15px] font-semibold tracking-tight">
          HRX <span className="text-mutedColor">AI</span>
        </span>

        {/* indeterminate track */}
        <div className="relative mt-6 h-[3px] w-40 overflow-hidden rounded-full bg-lineColor">
          <div className="hrx-sweep absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-accentColor to-glowColor" />
        </div>

        <p className="mt-4 text-xs tracking-wide text-mutedColor">{label}…</p>
      </div>
    </div>
  );
}
