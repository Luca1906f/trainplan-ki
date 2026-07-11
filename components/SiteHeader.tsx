export default function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="https://fitgit.app" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(212_60%_50%)] text-sm font-bold text-white">
            FG
          </span>
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Fit<span className="text-[hsl(212_60%_50%)]">Git</span>
          </span>
        </a>
        <a
          href="https://fitgit.app"
          className="text-sm text-zinc-500 transition-colors hover:text-[hsl(212_60%_50%)] dark:text-zinc-400"
        >
          ← Zurück zur Website
        </a>
      </div>
    </header>
  );
}
