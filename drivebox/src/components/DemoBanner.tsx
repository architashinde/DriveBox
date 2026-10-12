import { isAppwriteConfigured } from "@/lib/appwrite/config";

export function DemoBanner() {
  if (isAppwriteConfigured()) return null;

  return (
    <p className="border-b border-[#E0D3C2] bg-[#F3E4D4] px-4 py-2 text-center text-sm text-ink">
      Local demo is on. Codes appear in the sign-in window until Appwrite keys are added.
    </p>
  );
}