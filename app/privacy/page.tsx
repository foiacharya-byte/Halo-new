import { Eyebrow } from "@/components/ui";

export const metadata = { title: "Privacy & data rights" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-prose px-4 py-10 sm:px-6">
      <Eyebrow>Privacy</Eyebrow>
      <h1 className="mt-3 font-serif text-3xl text-ink">Privacy &amp; data rights</h1>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-ink-soft">
        <section>
          <h2 className="font-serif text-lg text-ink">What we collect and why</h2>
          <p className="mt-2">
            When you contribute, we collect your first name, a mobile number (for one-time
            verification and moderation), and your area. We collect the service&rsquo;s public
            contact details and your experience so Halo can be useful to the next person.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-ink">What is public and what is not</h2>
          <p className="mt-2">
            Your contribution (use context, experience and useful detail) may appear publicly after
            review, shown under your chosen display name. Your personal phone number is{" "}
            <strong className="text-ink">never</strong> published. A service&rsquo;s number is shown
            only when it is publicly advertised or shared with permission, and after moderation.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-ink">Consent</h2>
          <p className="mt-2">
            We ask for separate consent for (1) processing your contribution and (2) optional Halo
            updates. Optional updates are never pre-checked. You can withdraw update consent at any
            time.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-ink">Your rights</h2>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Request a correction to any listing or contribution.</li>
            <li>Request erasure of your contribution.</li>
            <li>Request removal of a business listing (data-principal right).</li>
            <li>Reach a grievance/contact route for any concern.</li>
          </ul>
          <p className="mt-3">
            Halo is a directory. It does not request access to your contacts or address book, and it
            never publishes your personal contact details as the contributor.
          </p>
        </section>
      </div>
    </div>
  );
}
