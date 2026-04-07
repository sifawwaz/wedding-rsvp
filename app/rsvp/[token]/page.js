"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function Ornament({ className = "" }) {
  return (
    <svg viewBox="0 0 120 12" className={className} aria-hidden="true" fill="none">
      <line x1="0" y1="6" x2="48" y2="6" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="54" cy="6" r="1.8" fill="currentColor" />
      <circle cx="60" cy="6" r="3" fill="currentColor" />
      <circle cx="66" cy="6" r="1.8" fill="currentColor" />
      <line x1="72" y1="6" x2="120" y2="6" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}

function Stepper({ label, value, onChange, max }) {
  return (
    <div className="mb-5 rounded-2xl px-5 py-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em]" style={{ color: "var(--text-faint)", fontFamily: "var(--font-body)" }}>
        {label}
      </p>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="flex h-10 w-10 items-center justify-center rounded-full text-xl font-light transition active:scale-95"
          style={{ border: "1px solid var(--border)", color: "var(--text-muted)", background: "white" }}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="w-8 text-center text-2xl font-light" style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="flex h-10 w-10 items-center justify-center rounded-full text-xl font-light transition active:scale-95"
          style={{ border: "1px solid var(--border)", color: "var(--text-muted)", background: "white" }}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

/* ── Splash / Welcome Screen ── */
function SplashScreen({ guestName, onEnter }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center"
      style={{ background: "var(--bg)", animation: "fadeUp 0.7s ease-out both" }}
    >
      {/* Top ornament */}
      <div className="mb-10 flex items-center gap-4" style={{ color: "var(--gold)" }}>
        <span className="block h-px w-16 bg-[#b8966a] opacity-40" />
        <span className="text-xl">✦</span>
        <span className="block h-px w-16 bg-[#b8966a] opacity-40" />
      </div>

      <p
        className="mb-4 text-xs font-medium uppercase tracking-[0.35em]"
        style={{ color: "var(--gold)", fontFamily: "var(--font-body)" }}
      >
        You Are Cordially Invited
      </p>

      {/* Couple names */}
      <h1
        className="mb-2 leading-tight"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
          fontWeight: 400,
          color: "var(--text)",
        }}
      >
        Ayman &amp; <em style={{ fontStyle: "italic", color: "var(--gold-dark)" }}>AbdulBari</em>
      </h1>

      <p
        className="mb-2 text-sm font-light tracking-widest"
        style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
      >
        Thursday · May 21st, 2026
      </p>

      <Ornament className="mx-auto my-8 w-28 opacity-30" style={{ color: "var(--gold)" }} />

      {/* Dear guest name */}
      <p
        className="mb-3 text-sm uppercase tracking-[0.25em]"
        style={{ color: "var(--text-faint)", fontFamily: "var(--font-body)" }}
      >
        Dear
      </p>
      <p
        className="mb-10 leading-none"
        style={{
          fontFamily: "'Great Vibes', cursive",
          fontSize: "clamp(3rem, 8vw, 5.5rem)",
          color: "var(--gold-dark)",
          textShadow: "0 2px 12px rgba(154,122,82,0.15)",
        }}
      >
        {guestName}
      </p>

      <p
        className="mb-10 max-w-sm text-sm font-light leading-relaxed"
        style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
      >
      Assalamualaikum Warahmatullahi Wabarakatuh! We are overjoyed to have you join us on our special day. Please tap below to view your personal invitation and RSVP.
      </p>

      {/* CTA */}
      <button
        onClick={onEnter}
        className="rounded-full px-10 py-3.5 text-sm font-medium tracking-widest text-white transition-all hover:opacity-90 active:scale-95"
        style={{ background: "var(--gold)", fontFamily: "var(--font-body)", letterSpacing: "0.1em" }}
      >
        VIEW MY INVITATION
      </button>

      {/* Bottom ornament */}
      <div className="mt-12 flex items-center gap-3 opacity-20" style={{ color: "var(--gold)" }}>
        <span className="block h-px w-10 bg-[#b8966a]" />
        <span>✦</span>
        <span className="block h-px w-10 bg-[#b8966a]" />
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function RSVPPage() {
  const params = useParams();
  const token = params?.token;

  const CHANGE_DEADLINE = new Date("2026-05-03T23:59:59");

  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const [status, setStatus] = useState("pending");
  const [menCount, setMenCount] = useState(0);
  const [womenCount, setWomenCount] = useState(0);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const changesOpen = new Date() <= CHANGE_DEADLINE;

  useEffect(() => {
    const fetchGuest = async () => {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .eq("token", token)
        .single();

      if (error) {
        setGuest(null);
        setLoading(false);
        return;
      }

      setGuest(data || null);
      setStatus(data?.rsvp_status || "pending");
      setMenCount(Number(data?.men_count || 0));
      setWomenCount(Number(data?.women_count || 0));
      setLoading(false);
    };

    if (token) fetchGuest();
  }, [token]);

  const maxGuests = Number(guest?.max_guests || 1);
  const totalAttending = menCount + womenCount;

  const notify = async (payload) => {
    try {
      await fetch("/api/notify-rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.error("Notify failed", e);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  };

  const handleSubmit = async () => {
    if (!guest || !changesOpen) return;

    if (status === "pending") {
      showToast("Please select whether you are attending.", "info");
      return;
    }

    if (status === "attending") {
      if (totalAttending < 1) {
        showToast("Please add at least one guest.", "info");
        return;
      }
      if (totalAttending > maxGuests) {
        showToast(`You cannot exceed ${maxGuests} invited guest(s).`, "error");
        return;
      }

      setSaving(true);
      const { error } = await supabase
        .from("guests")
        .update({
          rsvp_status: "attending",
          men_count: menCount,
          women_count: womenCount,
          attending_count: totalAttending,
          attending_names: null,
        })
        .eq("token", token);
      setSaving(false);

      if (error) { showToast("Could not save RSVP. Please try again.", "error"); return; }

      await notify({
        invite_name: guest.invite_name,
        family: guest.family,
        rsvp_status: "attending",
        attending_count: totalAttending,
        men_count: menCount,
        women_count: womenCount,
        max_guests: maxGuests,
      });

      setGuest({ ...guest, rsvp_status: "attending", men_count: menCount, women_count: womenCount, attending_count: totalAttending });
      showToast("RSVP confirmed — we can't wait to see you, InshaAllah! 🎉");
      return;
    }

    if (status === "declined") {
      setSaving(true);
      const { error } = await supabase
        .from("guests")
        .update({ rsvp_status: "declined", men_count: 0, women_count: 0, attending_count: 0, attending_names: null })
        .eq("token", token);
      setSaving(false);

      if (error) { showToast("Could not save RSVP. Please try again.", "error"); return; }

      await notify({
        invite_name: guest.invite_name,
        family: guest.family,
        rsvp_status: "declined",
        attending_count: 0,
        men_count: 0,
        women_count: 0,
        max_guests: maxGuests,
      });

      setGuest({ ...guest, rsvp_status: "declined", men_count: 0, women_count: 0, attending_count: 0 });
      showToast("Response recorded. We'll miss you!");
    }
  };

  const handleChangeResponse = () => {
    if (!changesOpen) return;
    setGuest((prev) => ({ ...prev, rsvp_status: "pending" }));
    setStatus("pending");
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "var(--bg)" }}>
        <div className="h-10 w-10 rounded-full border-2 animate-spin" style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
        <p className="text-sm tracking-widest" style={{ color: "var(--text-faint)", fontFamily: "var(--font-body)" }}>
          Loading invitation…
        </p>
      </div>
    );
  }

  /* ── Not found ── */
  if (!guest) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--bg)" }}>
        <div className="w-full max-w-md rounded-3xl p-10 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-3xl mb-4" aria-hidden="true">✉️</p>
          <h1 className="text-2xl mb-3" style={{ fontFamily: "var(--font-display)", fontWeight: 500, color: "var(--text)" }}>
            Invitation Not Found
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
            This RSVP link is invalid or no longer available. Please contact the couple for assistance.
          </p>
        </div>
      </div>
    );
  }

  const guestName = guest.invite_name || guest.family || "Guest";
  const alreadyResponded = guest.rsvp_status && guest.rsvp_status !== "pending";

  const toastColors = {
    success: { bg: "#edf8f0", border: "#c3e6cb", text: "#1f5c30" },
    error:   { bg: "#fef2f2", border: "#fecaca", text: "#7f1d1d" },
    info:    { bg: "#fef9ec", border: "#f6d860", text: "#78510a" },
  };

  /* ── Splash screen ── */
  if (showSplash) {
    return (
      <>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" />
        <SplashScreen guestName={guestName} onEnter={() => setShowSplash(false)} />
      </>
    );
  }

  /* ── RSVP Card ── */
  return (
    <div className="min-h-screen px-4 py-12 md:px-6" style={{ background: "var(--bg)", animation: "fadeUp 0.5s ease-out both" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" />

      {/* Toast */}
      {toast.show && (
        <div
          role="alert"
          className="fixed top-5 left-1/2 z-50 -translate-x-1/2 rounded-2xl px-6 py-3 text-sm text-center shadow-md"
          style={{
            background: toastColors[toast.type].bg,
            border: `1px solid ${toastColors[toast.type].border}`,
            color: toastColors[toast.type].text,
            fontFamily: "var(--font-body)",
            animation: "fadeSlide 0.3s ease-out both",
            minWidth: "260px",
            maxWidth: "90vw",
          }}
        >
          {toast.message}
        </div>
      )}

      <div className="mx-auto w-full max-w-2xl">
        <div
          className="rounded-[2rem] overflow-hidden"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          {/* Header */}
          <div
            className="px-8 pt-10 pb-8 text-center"
            style={{ background: "linear-gradient(160deg, #faf7f2 0%, #f4ede2 100%)", borderBottom: "1px solid var(--border)" }}
          >
            <div className="mb-6 flex justify-center">
              <img src="/rsvp.png" alt="Ayman & AbdulBari Wedding" className="w-[200px] md:w-[270px] object-contain" loading="lazy" />
            </div>
            <Ornament className="mx-auto mb-5 w-28 opacity-40" style={{ color: "var(--gold)" }} />
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.3em]" style={{ color: "var(--gold)", fontFamily: "var(--font-body)" }}>
              Wedding Invitation
            </p>
            <p className="text-sm font-light" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
              Please kindly respond by <strong style={{ color: "var(--text)", fontWeight: 500 }}>May 3rd, 2026</strong>
            </p>
          </div>

          {/* Body */}
          <div className="px-6 py-8 md:px-10 md:py-10">

            {/* Invitation For card */}
            <div
              className="mb-8 rounded-2xl px-6 py-7 text-center"
              style={{ background: "linear-gradient(135deg, #fdfcf9 0%, #f9f5ef 100%)", border: "1px solid var(--border)" }}
            >
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.4em]" style={{ color: "var(--text-faint)", fontFamily: "var(--font-body)" }}>
                Invitation For
              </p>
              <p
                className="leading-none"
                style={{
                  fontFamily: "'Great Vibes', cursive",
                  fontSize: "clamp(2.8rem, 8vw, 5rem)",
                  color: "var(--gold-dark)",
                  textShadow: "0 2px 16px rgba(154,122,82,0.18)",
                }}
              >
                {guestName}
              </p>
              <div className="mt-4 flex justify-center">
                <span
                  className="rounded-full px-4 py-1 text-sm font-medium"
                  style={{ background: "#f0e9df", color: "var(--gold-dark)", fontFamily: "var(--font-body)" }}
                >
                  {maxGuests} {maxGuests === 1 ? "guest" : "guests"} invited
                </span>
              </div>
            </div>

            {/* Already responded */}
            {alreadyResponded ? (
              <div className="text-center">
                {guest.rsvp_status === "attending" ? (
                  <>
                    <div
                      className="mb-2 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium"
                      style={{ background: "#edf8f0", color: "#2e6a40", border: "1px solid #c3e6cb", fontFamily: "var(--font-body)" }}
                    >
                      <span>✓</span> Attending
                    </div>
                    <p className="mb-6 text-sm" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
                      Your RSVP is confirmed. We cant wait to see you, InshaAllah!
                    </p>
                    <div className="mx-auto mb-6 grid max-w-xs grid-cols-2 gap-3">
                      {[{ label: "Men", value: guest.men_count || 0 }, { label: "Women", value: guest.women_count || 0 }].map(({ label, value }) => (
                        <div key={label} className="rounded-2xl px-5 py-4 text-center" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                          <p className="mb-1 text-xs uppercase tracking-widest" style={{ color: "var(--text-faint)", fontFamily: "var(--font-body)" }}>{label}</p>
                          <p className="text-3xl font-light" style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className="mb-2 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium"
                      style={{ background: "#fef2f2", color: "#9b1c1c", border: "1px solid #fecaca", fontFamily: "var(--font-body)" }}
                    >
                      Not Attending
                    </div>
                    <p className="mb-6 text-sm" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
                      We'll miss you. Thank you for letting us know.
                    </p>
                  </>
                )}

                {changesOpen ? (
                  <button
                    onClick={handleChangeResponse}
                    className="rounded-full px-7 py-2.5 text-sm font-medium transition hover:opacity-80 active:scale-95"
                    style={{ border: "1px solid var(--border)", color: "var(--text-muted)", fontFamily: "var(--font-body)", background: "white" }}
                  >
                    Change Response
                  </button>
                ) : (
                  <p className="text-xs" style={{ color: "var(--text-faint)", fontFamily: "var(--font-body)" }}>
                    RSVP changes are now closed.
                  </p>
                )}
              </div>
            ) : (
              /* RSVP form */
              <div>
                <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em]" style={{ color: "var(--text-faint)", fontFamily: "var(--font-body)" }}>
                  Will you be attending?
                </p>

                <div className="mb-7 grid grid-cols-2 gap-3">
                  {[
                    { value: "attending", label: "Yes, I'll be there 🎉" },
                    { value: "declined",  label: "Sorry, I can't make it" },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setStatus(value)}
                      className="rounded-2xl px-4 py-4 text-sm font-medium transition-all active:scale-95"
                      style={{
                        fontFamily: "var(--font-body)",
                        border: status === value ? "2px solid var(--gold)" : "1px solid var(--border)",
                        background: status === value ? "#fdf7ee" : "white",
                        color: status === value ? "var(--gold-dark)" : "var(--text-muted)",
                        boxShadow: status === value ? "0 0 0 3px rgba(184,150,106,0.12)" : "none",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {status === "attending" && (
                  <div className="mb-7">
                    <Stepper label="Men attending" value={menCount} onChange={setMenCount} max={maxGuests} />
                    <Stepper label="Women attending" value={womenCount} onChange={setWomenCount} max={maxGuests} />
                    <div
                      className="rounded-xl px-4 py-3 text-center text-sm"
                      style={{
                        background: totalAttending > maxGuests ? "#fef2f2" : "#f4f8f5",
                        color: totalAttending > maxGuests ? "#9b1c1c" : "#2e6a40",
                        border: `1px solid ${totalAttending > maxGuests ? "#fecaca" : "#c3e6cb"}`,
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {totalAttending > maxGuests
                        ? `⚠ Exceeds limit of ${maxGuests}`
                        : `Total attending: ${totalAttending} / ${maxGuests}`}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={saving || !changesOpen || status === "pending"}
                  className="w-full rounded-full py-4 text-sm font-medium tracking-wide text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ background: "var(--gold)", fontFamily: "var(--font-body)", letterSpacing: "0.06em" }}
                >
                  {saving ? "Saving…" : "Confirm RSVP"}
                </button>

                {!changesOpen && (
                  <p className="mt-3 text-center text-xs" style={{ color: "var(--text-faint)", fontFamily: "var(--font-body)" }}>
                    RSVP submissions are now closed.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Ornament className="mx-auto mb-4 w-24 opacity-20" style={{ color: "var(--gold)" }} />
          <p className="text-xs tracking-wider" style={{ color: "var(--text-faint)", fontFamily: "var(--font-body)" }}>
            Ayman &amp; AbdulBari · 2026
          </p>
        </div>
      </div>
    </div>
  );
}