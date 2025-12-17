import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen pt-20 pb-16 bg-brand-bg dark:bg-[#0f0f11] transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 grid gap-32">

        {/* Hero */}
        <section className="text-center">
          <h1 className="text-5xl font-semibold tracking-tight text-brand-text dark:text-white leading-tight">
            Become Better at Coding.
          </h1>
          <p className="text-brand-subtext dark:text-neutral-400 mt-4 max-w-2xl mx-auto text-lg leading-relaxed">
            Practice real-world coding problems in a clean, distraction-free environment. 
            Track your progress, earn XP, and level up your problem-solving abilities.
          </p>

          <Link
            href="/dashboard"
            className="inline-block mt-8 px-6 py-3 rounded-lg bg-brand-text dark:bg-white text-white dark:text-black text-sm hover:opacity-90 transition"
          >
            Start Solving
          </Link>
        </section>

        {/* Stats Preview */}
        <section className="grid sm:grid-cols-3 gap-6">
          <div className="card p-6 text-center">
            <div className="text-3xl font-semibold text-brand-text dark:text-white">+100</div>
            <p className="text-brand-subtext dark:text-neutral-400 text-sm mt-1">Practice Questions</p>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl font-semibold text-brand-text dark:text-white">XP Levels</div>
            <p className="text-brand-subtext dark:text-neutral-400 text-sm mt-1">Track Your Growth</p>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl font-semibold text-brand-text dark:text-white">Clean UI</div>
            <p className="text-brand-subtext dark:text-neutral-400 text-sm mt-1">Focus On Learning</p>
          </div>
        </section>

        {/* How it Works */}
        <section className="grid gap-10">
          <h2 className="text-center text-2xl font-semibold text-brand-text dark:text-white">
            How It Works
          </h2>

          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div className="card p-6">
              <h3 className="font-medium text-brand-text dark:text-white mb-2">1. Pick a Challenge</h3>
              <p className="text-brand-subtext dark:text-neutral-400 text-sm">
                Choose from curated coding problems designed to help you grow.
              </p>
            </div>

            <div className="card p-6">
              <h3 className="font-medium text-brand-text dark:text-white mb-2">2. Solve in the Editor</h3>
              <p className="text-brand-subtext dark:text-neutral-400 text-sm">
                Our clean editor keeps you focused — no distractions.
              </p>
            </div>

            <div className="card p-6">
              <h3 className="font-medium text-brand-text dark:text-white mb-2">3. Level Up</h3>
              <p className="text-brand-subtext dark:text-neutral-400 text-sm">
                Earn XP for solving challenges and level up your profile.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Problems */}
        <section className="grid gap-4">
          <h2 className="text-xl font-semibold text-brand-text dark:text-white">Featured Problems</h2>
          <p className="text-brand-subtext dark:text-neutral-400 text-sm">Handpicked challenges to get started.</p>

          <div className="grid sm:grid-cols-3 gap-4">
            <Link href="/problems/two-sum" className="card p-4 hover:shadow-md transition">
              <div className="font-medium text-brand-text dark:text-white">Two Sum</div>
              <div className="text-sm text-brand-subtext dark:text-neutral-400 mt-1">Beginner friendly</div>
            </Link>

            <Link href="/problems/valid-parentheses" className="card p-4 hover:shadow-md transition">
              <div className="font-medium text-brand-text dark:text-white">Valid Parentheses</div>
              <div className="text-sm text-brand-subtext dark:text-neutral-400 mt-1">Logic & stack basics</div>
            </Link>

            <Link href="/problems/reverse-string" className="card p-4 hover:shadow-md transition">
              <div className="font-medium text-brand-text dark:text-white">Reverse String</div>
              <div className="text-sm text-brand-subtext dark:text-neutral-400 mt-1">Simple but useful</div>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-brand-subtext dark:text-neutral-500 text-sm pt-8 border-t dark:border-neutral-800">
          Made with ❤️ by Mayank
        </footer>

      </div>
    </div>
  );
}