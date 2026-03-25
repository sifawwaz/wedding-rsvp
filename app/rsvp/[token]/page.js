"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RSVPPage() {
  const params = useParams();
  const token = params?.token;

  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [status, setStatus] = useState("pending");
  const [attendingCount, setAttendingCount] = useState(0);
  const [attendingNames, setAttendingNames] = useState([""]);

  const [stats, setStats] = useState({
    attending: 0,
    declined: 0,
  });

  // 🔥 FETCH STATS
  const fetchStats = async () => {
    const { data } = await supabase.from("guests").select("*");

    const attendingTotal = data
      ?.filter((g) => g.rsvp_status === "attending")
      .reduce((sum, g) => sum + (g.attending_count || 0), 0);

    const declinedTotal =
      data?.filter((g) => g.rsvp_status === "declined").length || 0;

    setStats({
      attending: attendingTotal,
      declined: declinedTotal,
    });
  };

  // 🔥 FETCH GUEST
  useEffect(() => {
    const fetchGuest = async () => {
      const { data } = await supabase
        .from("guests")
        .select("*")
        .eq("token", token)
        .single();

      setGuest(data);
      setStatus(data?.rsvp_status || "pending");

      const count = Number(data?.attending_count || 0);
      setAttendingCount(count);

      const names =
        data?.attending_names?.split(",").map((n) => n.trim()) || [];

      setAttendingNames(
        names.length ? names : count > 0 ? Array(count).fill("") : [""]
      );

      setLoading(false);
    };

    if (token) {
      fetchGuest();
      fetchStats();
    }
  }, [token]);

  const maxGuests = Number(guest?.max_guests || 1);

  const visibleInputs = useMemo(() => {
    if (status !== "attending") return [];
    return attendingNames.slice(0, attendingCount);
  }, [attendingNames, attendingCount, status]);

  const handleCountChange = (value) => {
    const count = Math.max(0, Math.min(Number(value) || 0, maxGuests));
    setAttendingCount(count);

    setAttendingNames((prev) => {
      const next = [...prev];
      while (next.length < count) next.push("");
      return next.slice(0, Math.max(count, 1));
    });
  };

  const handleNameChange = (i, val) => {
    setAttendingNames((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
  };

  const notify = async (payload) => {
    await fetch("/api/notify-rsvp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  };

  const handleSubmit = async () => {
    if (!guest) return;

    if (status === "attending") {
      const cleaned = attendingNames
        .slice(0, attendingCount)
        .map((n) => n.trim());

      if (cleaned.some((n) => !n)) {
        alert("Enter all names.");
        return;
      }

      setSaving(true);

      await supabase
        .from("guests")
        .update({
          rsvp_status: "attending",
          attending_count: attendingCount,
          attending_names: cleaned.join(", "),
        })
        .eq("token", token);

      setSaving(false);

      await notify({
        invite_name: guest.invite_name,
        family: guest.family,
        rsvp_status: "attending",
        attending_count: attendingCount,
        attending_names: cleaned.join(", "),
        max_guests: maxGuests,
      });

      fetchStats(); // 🔥 refresh counters

      alert("RSVP saved");
      return;
    }

    if (status === "declined") {
      setSaving(true);

      await supabase
        .from("guests")
        .update({
          rsvp_status: "declined",
          attending_count: 0,
          attending_names: null,
        })
        .eq("token", token);

      setSaving(false);

      await notify({
        invite_name: guest.invite_name,
        family: guest.family,
        rsvp_status: "declined",
        attending_count: 0,
        attending_names: null,
        max_guests: maxGuests,
      });

      fetchStats(); // 🔥 refresh counters

      alert("RSVP saved");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!guest) return <div className="p-10 text-center">Guest not found</div>;

  return (
    <div className="min-h-screen bg-[#f7f1e6] flex items-center justify-center px-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-xl w-full text-center">

        {/* IMAGE */}
        <div className="mb-6 flex justify-center">
          <img src="/rsvp.png" className="w-80 object-contain" />
        </div>

        {/* STATS */}
        <div className="flex justify-center gap-6 mb-6 text-sm">
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full">
            Attending: {stats.attending}
          </div>

          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-full">
            Not Attending: {stats.declined}
          </div>
        </div>

        {/* TEXT */}
        <p className="text-gray-600 mb-6">
          Please respond by May 3rd 2026
        </p>

        {/* NAME */}
        <h2 className="text-3xl font-semibold mb-2 text-black">
          {guest.invite_name || guest.family}
        </h2>

        <p className="text-gray-500 mb-6">
          Invited: {maxGuests}
        </p>

        {/* SELECT */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border rounded-lg px-4 py-3 mb-4 text-black"
        >
          <option value="pending">Select</option>
          <option value="attending">Attending</option>
          <option value="declined">Not Attending</option>
        </select>

        {/* ATTENDING */}
        {status === "attending" && (
          <>
            <input
              type="number"
              min="1"
              max={maxGuests}
              value={attendingCount}
              onChange={(e) => handleCountChange(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 mb-4 text-black"
            />

            {visibleInputs.map((name, i) => (
              <input
                key={i}
                value={name}
                onChange={(e) => handleNameChange(i, e.target.value)}
                placeholder={`Person ${i + 1}`}
                className="w-full border rounded-lg px-4 py-3 mb-2 text-black"
              />
            ))}
          </>
        )}

        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="mt-6 bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800"
        >
          {saving ? "Saving..." : "Submit RSVP"}
        </button>
      </div>
    </div>
  );
}