import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center" style={{ background: "var(--bg)" }}>
      <div className="animate-fade-up delay-1 mb-10 flex items-center gap-4" style={{ color: "var(--gold)" }}>
        <span className="block h-px w-16 bg-[#b8966a] opacity-50" />
        <span className="text-xl">✦</span>
        <span className="block h-px w-16 bg-[#b8966a] opacity-50" />
      </div>

      <p className="animate-fade-up delay-1 mb-5 text-xs font-medium uppercase tracking-[0.35em]" style={{ color: "var(--gold)", fontFamily: "var(--font-body)" }}>
        You Are Cordially Invited
      </p>

      <h1 className="animate-fade-up delay-2 mb-4 leading-tight" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: 400, color: "var(--text)" }}>
        Ayman &amp; <em style={{ fontStyle: "italic", color: "var(--gold-dark)" }}>Abdul Bari</em>
      </h1>

      <p className="animate-fade-up delay-3 mb-2 text-base font-light" style={{ color: "var(--text-muted)", letterSpacing: "0.04em" }}>
        Saturday · May 3rd, 2026
      </p>

      <p className="animate-fade-up delay-3 mb-12 max-w-md text-base font-light leading-relaxed" style={{ color: "var(--text-muted)" }}>
        We are overjoyed to celebrate with our beloved family and friends. Please use your personal link to RSVP.
      </p>

      <div className="animate-fade-up delay-4 mb-12 flex items-center gap-3 opacity-30" style={{ color: "var(--gold)" }}>
        <span className="block h-px w-12 bg-[#b8966a]" />
        <span>✦</span>
        <span className="block h-px w-12 bg-[#b8966a]" />
      </div>

      <div className="animate-fade-up delay-5 flex flex-col gap-4 sm:flex-row">
        <Link href="/admin" className="rounded-full px-8 py-3 text-sm font-medium tracking-wide text-white transition hover:opacity-90" style={{ background: "var(--gold)" }}>
          Admin Dashboard
        </Link>
        <Link href="/rsvp" className="rounded-full border px-8 py-3 text-sm font-medium tracking-wide transition hover:bg-[#e8e0d3]" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
          View RSVP Page
        </Link>
      </div>
    </main>
  );
}