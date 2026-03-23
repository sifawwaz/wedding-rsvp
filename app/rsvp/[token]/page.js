"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RSVPPage() {
  const params = useParams();
  const token = params?.token;

  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuest = async () => {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .eq("token", token)
        .single();

      if (error) {
        setGuest(null);
      } else {
        setGuest(data);
      }

      setLoading(false);
    };

    if (token) fetchGuest();
  }, [token]);

  const handleRSVP = async (status) => {
    const { error } = await supabase
      .from("guests")
      .update({ rsvp_status: status })
      .eq("token", token);

    if (!error) {
      setGuest({ ...guest, rsvp_status: status });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50 text-rose-900">
        <p className="text-lg font-medium">Loading your invitation...</p>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50 px-6">
        <div className="bg-white p-8 rounded-3xl shadow-lg text-center max-w-md">
          <h1 className="text-2xl font-bold text-rose-900 mb-3">
            Invitation Not Found
          </h1>
          <p className="text-zinc-600">
            This RSVP link is invalid or no longer available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-100 to-amber-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl bg-white/90 backdrop-blur rounded-[2rem] shadow-2xl border border-rose-100 p-8 md:p-12 text-center">
        <div className="mb-6">
          <div className="text-4xl mb-3">🌸✨💍✨🌸</div>
          <p className="uppercase tracking-[0.35em] text-xs text-rose-500 font-semibold mb-3">
            Wedding RSVP
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-rose-900 leading-tight mb-4">
            Welcome to Ayman & Abdul Bari&apos;s Wedding RSVP page!
          </h1>
          <p className="text-base md:text-lg text-zinc-700 max-w-xl mx-auto leading-8">
            Please select whether you will be attending or not.
          </p>
        </div>

        <div className="bg-rose-50 rounded-2xl px-6 py-5 mb-8 border border-rose-100">
          <p className="text-sm uppercase tracking-[0.25em] text-rose-500 mb-2">
            Invitation For
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            {guest.invite_name || guest.family || "Guest"}
          </h2>
        </div>

        {guest.rsvp_status !== "pending" ? (
          <div className="space-y-4">
            <p className="text-lg text-zinc-700">Your response has been recorded.</p>
            <div className="inline-block rounded-full px-6 py-3 text-lg font-semibold bg-rose-100 text-rose-900">
              {guest.rsvp_status === "attending"
                ? "🎉 Attending"
                : "💌 Not Attending"}
            </div>
          </div>
        ) : (
          <>
            <p className="text-zinc-600 mb-8 text-lg">
              We would be honored to celebrate with you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleRSVP("attending")}
                className="px-8 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md transition"
              >
                Yes, I Will Attend
              </button>

              <button
                onClick={() => handleRSVP("declined")}
                className="px-8 py-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-semibold shadow-md transition"
              >
                Sorry, I Cannot Attend
              </button>
            </div>
          </>
        )}

        <div className="mt-10 text-3xl">🌷🤍🌷</div>
      </div>
    </div>
  );
}