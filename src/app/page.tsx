import Link from "next/link";

export default function Home() {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      {/* Navbar */}
      <header
        className="border-b backdrop-blur"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img
              src="/assets/Flag_of_Nepal.gif"
              alt="Flag of Nepal"
              className="h-8 w-auto"
            />
            <span className="text-lg font-semibold tracking-tight" style={{ color: "var(--foreground)" }}>
              Digital Nepal Citizen Ecosystem
            </span>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition hover:opacity-90"
            style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
          >
            Sign In
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <img
          src="/assets/Flag_of_Nepal.gif"
          alt="Flag of Nepal"
          className="mb-8 h-28 w-auto"
          style={{ filter: "drop-shadow(0 10px 20px rgba(11, 46, 107, 0.15))" }}
        />

        <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "var(--foreground)" }}>
          Digital Nepal Citizen Ecosystem
        </h1>

        <p className="mt-4 max-w-xl text-base" style={{ color: "var(--text-secondary)" }}>
          A unified citizen registry connecting Ward, Municipality, Province,
          and Central government offices across Nepal — one identity, one
          record, one system.
        </p>

        <div className="mt-8">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold transition hover:opacity-90"
            style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
          >
            Sign In to Continue
          </Link>
        </div>

        <p className="mt-6 text-xs" style={{ color: "var(--text-secondary)" }}>
          Government-grade citizen registry · Kummayak Rural Municipality Pilot
        </p>
      </main>

      {/* Footer */}
      <footer
        className="border-t py-6 text-center text-xs"
        style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
      >
        &copy; {new Date().getFullYear()} Digital Nepal Citizen Ecosystem
      </footer>
    </div>
  );
}
