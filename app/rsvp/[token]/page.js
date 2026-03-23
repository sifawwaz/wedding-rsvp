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

  if (loading) return <div className="p-10">Loading...</div>;

  if (!guest) {
    return <div className="p-10 text-center">❌ Guest not found</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white">
      <div className="bg-white text-black p-10 rounded-2xl shadow-xl text-center">
        <h1 className="text-2xl font-bold mb-4">
          Hi {guest.invite_name || guest.family || "Guest"} 👋
        </h1>

        {guest.rsvp_status !== "pending" ? (
          <div>
            <p className="text-lg mb-4">✅ You already responded:</p>

            <p className="text-xl font-semibold">
              {guest.rsvp_status === "attending"
                ? "🎉 Attending"
                : "❌ Not Attending"}
            </p>
          </div>
        ) : (
          <>
            <p className="mb-6">Will you attend?</p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => handleRSVP("attending")}
                className="bg-green-500 px-6 py-2 rounded-lg text-white"
              >
                Yes
              </button>

              <button
                onClick={() => handleRSVP("declined")}
                className="bg-red-500 px-6 py-2 rounded-lg text-white"
              >
                No
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}