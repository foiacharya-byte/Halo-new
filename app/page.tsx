import { SceneHero } from "@/components/home/SceneHero";
import { SceneReality } from "@/components/home/SceneReality";
import { SceneSearchFirst } from "@/components/home/SceneSearchFirst";
import { ScenePassItOn } from "@/components/home/ScenePassItOn";
import { SceneTrust } from "@/components/home/SceneTrust";
import { SceneHowItWorks } from "@/components/home/SceneHowItWorks";
import { ScenePoints } from "@/components/home/ScenePoints";
import { SceneJoin } from "@/components/home/SceneJoin";
import { SceneActivityRibbon } from "@/components/home/SceneActivityRibbon";

// The homepage — the approved light scroll-story design (reverted from an
// unapproved dark exploration; see public/assets/halo/matched/README_FIRST.md
// and docs/HALO_ASSET_AUDIT.md). Scrollography: Hero -> Reality -> Search or
// Request -> Pass It On -> Trust -> How It Works -> Halo Points -> Join ->
// Activity ribbon (footer lives globally in app/layout.tsx). The hero
// embeds the real, unmodified HaloSearch -> /search -> lib/search/parser.ts
// pipeline, not a re-implementation.

export default function HomePage() {
  return (
    <>
      <SceneHero />
      <SceneReality />
      <SceneSearchFirst />
      <ScenePassItOn />
      <SceneTrust />
      <SceneHowItWorks />
      <ScenePoints />
      <SceneJoin />
      <SceneActivityRibbon />
    </>
  );
}
