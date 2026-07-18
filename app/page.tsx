import { SceneHero } from "@/components/home/SceneHero";
import { Ticker } from "@/components/home/Ticker";
import { SceneWhy } from "@/components/home/SceneWhy";
import { SceneStepwell } from "@/components/home/SceneStepwell";
import { SceneVision } from "@/components/home/SceneVision";
import { SceneWork } from "@/components/home/SceneWork";
import { SceneWaitlistCTA } from "@/components/home/SceneWaitlistCTA";
import { SceneGallery } from "@/components/home/SceneGallery";

// The homepage, rebuilt against the product owner's own reference build
// (docs/HALO_ASSET_AUDIT.md, public/assets/halo/vadodara/ASSET_SOURCES.md).
// Scrollography: Hero -> Ticker -> Why (For Barodians) -> Stepwell interlude
// -> Vision -> Work (For Sellers) -> Waitlist CTA -> Heritage gallery.
// Search itself is untouched: the hero embeds the real HaloSearch -> /search
// -> lib/search/parser.ts pipeline, not a re-implementation. WaitlistProvider
// wraps the whole app (app/layout.tsx) so header/footer CTAs can open the
// modal too, not just this page's own scenes.

export default function HomePage() {
  return (
    <>
      <SceneHero />
      <Ticker />
      <SceneWhy />
      <SceneStepwell />
      <SceneVision />
      <SceneWork />
      <SceneWaitlistCTA />
      <SceneGallery />
    </>
  );
}
