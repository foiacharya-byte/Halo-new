import { SceneNeed } from "@/components/home/SceneNeed";
import { SceneReality } from "@/components/home/SceneReality";
import { SceneSearchFirst } from "@/components/home/SceneSearchFirst";
import { ScenePassItOn } from "@/components/home/ScenePassItOn";
import { SceneTrust } from "@/components/home/SceneTrust";
import { SceneHowItWorks } from "@/components/home/SceneHowItWorks";
import { ScenePoints } from "@/components/home/ScenePoints";
import { SceneEarlyAccess } from "@/components/home/SceneEarlyAccess";
import { SceneLivingCity } from "@/components/home/SceneLivingCity";

// The homepage is a scroll story (docs/HALO_PRELAUNCH_IMPLEMENTATION_PLAN.md,
// Phase 1), not a features grid. Scene 3 wraps the real, unmodified search
// pipeline (HaloSearch -> /search -> lib/search/parser.ts) rather than
// forking it — see SceneNeed and SceneSearchFirst.

export default function HomePage() {
  return (
    <>
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <SceneNeed />
      </div>

      <SceneReality />
      <SceneSearchFirst />
      <ScenePassItOn />
      <SceneTrust />
      <SceneHowItWorks />
      <ScenePoints />
      <SceneEarlyAccess />
      <SceneLivingCity />
    </>
  );
}
