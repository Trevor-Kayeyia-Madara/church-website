import SectionWrapper from "@/components/SectionWrapper";
import AdminYouTubeSync from "@/components/AdminYouTubeSync";

export const metadata = {
  title: "Admin YouTube Sync",
};

export const dynamic = "force-dynamic";

export default async function AdminYouTubePage() {
  return (
    <div>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 via-background to-background" />
        <SectionWrapper className="relative py-10 sm:py-14">
          <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">
            Admin
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-black leading-tight">
            YouTube Sermons Import
          </h1>
          <p className="mt-4 text-white/80 max-w-3xl">
            Sync sermons from a YouTube playlist or channel into the website
            database.
          </p>
        </SectionWrapper>
      </div>

      <SectionWrapper className="py-10 sm:py-12">
        <AdminYouTubeSync />
      </SectionWrapper>
    </div>
  );
}
