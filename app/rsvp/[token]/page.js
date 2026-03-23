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

  useEffect(() => {
    const fetchGuest = async () => {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .eq("token", token)
        .single();

      if (error || !data) {
        setGuest(null);
        setLoading(false);
        return;
      }

      setGuest(data);
      setStatus(data.rsvp_status || "pending");

      const savedCount = Number(data.attending_count || 0);
      setAttendingCount(savedCount);

      const parsedNames =
        data.attending_names && data.attending_names.trim()
          ? data.attending_names
              .split(",")
              .map((name) => name.trim())
              .filter(Boolean)
          : [];

      if (parsedNames.length > 0) {
        setAttendingNames(parsedNames);
      } else {
        setAttendingNames(savedCount > 0 ? Array(savedCount).fill("") : [""]);
      }

      setLoading(false);
    };

    if (token) fetchGuest();
  }, [token]);

  const maxGuests = Number(guest?.max_guests || 1);

  const visibleNameInputs = useMemo(() => {
    if (status !== "attending" || attendingCount < 1) return [];
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

  const handleNameChange = (index, value) => {
    setAttendingNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!guest) return;

    if (status === "attending") {
      if (attendingCount < 1) {
        alert("Please enter how many people are attending.");
        return;
      }

      if (attendingCount > maxGuests) {
        alert(`You cannot exceed the invited count of ${maxGuests}.`);
        return;
      }

      const cleanedNames = attendingNames
        .slice(0, attendingCount)
        .map((name) => name.trim())
        .filter(Boolean);

      if (cleanedNames.length !== attendingCount) {
        alert("Please enter the name of each attending family member.");
        return;
      }

      setSaving(true);

      const { error } = await supabase
        .from("guests")
        .update({
          rsvp_status: "attending",
          attending_count: attendingCount,
          attending_names: cleanedNames.join(", "),
        })
        .eq("token", token);

      setSaving(false);

      if (error) {
        alert("Could not save RSVP.");
        return;
      }

      setGuest({
        ...guest,
        rsvp_status: "attending",
        attending_count: attendingCount,
        attending_names: cleanedNames.join(", "),
      });

      alert("RSVP saved successfully.");
      return;
    }

    if (status === "declined") {
      setSaving(true);

      const { error } = await supabase
        .from("guests")
        .update({
          rsvp_status: "declined",
          attending_count: 0,
          attending_names: null,
        })
        .eq("token", token);

      setSaving(false);

      if (error) {
        alert("Could not save RSVP.");
        return;
      }

      setGuest({
        ...guest,
        rsvp_status: "declined",
        attending_count: 0,
        attending_names: null,
      });

      alert("RSVP saved successfully.");
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

  const alreadyResponded = guest.rsvp_status && guest.rsvp_status !== "pending";

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-100 to-amber-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl bg-white/90 backdrop-blur rounded-[2rem] shadow-2xl border border-rose-100 p-8 md:p-12">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🌸✨💍✨🌸</div>
          <p className="uppercase tracking-[0.35em] text-xs text-rose-500 font-semibold mb-3">
            Wedding RSVP
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-rose-900 leading-tight mb-4">
            Welcome to Ayman & Abdul Bari&apos;s RSVP page!
          </h1>
          <p className="text-base md:text-lg text-zinc-700 leading-8">
            Please select whether you will be attending or not.
          </p>
        </div>

        <div className="bg-rose-50 rounded-2xl px-6 py-5 mb-8 border border-rose-100 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-rose-500 mb-2">
            Invitation For
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            {guest.invite_name || guest.family || "Guest"}
          </h2>
          <p className="mt-3 text-zinc-600">
            Total invited from your family:{" "}
            <span className="font-semibold text-zinc-900">{maxGuests}</span>
          </p>
        </div>

        {alreadyResponded ? (
          <div className="text-center">
            <p className="text-lg text-zinc-700 mb-4">
              Your response has been recorded.
            </p>

            <div className="inline-block rounded-full px-6 py-3 text-lg font-semibold bg-rose-100 text-rose-900 mb-4">
              {guest.rsvp_status === "attending"
                ? `🎉 Attending (${guest.attending_count || 0})`
                : "💌 Not Attending"}
            </div>

            {guest.rsvp_status === "attending" && guest.attending_names && (
              <div className="mt-4 text-left bg-zinc-50 border rounded-2xl p-4">
                <p className="font-semibold text-zinc-900 mb-2">
                  Attending family members:
                </p>
                <ul className="list-disc pl-5 text-zinc-700">
                  {guest.attending_names.split(",").map((name, index) => (
                    <li key={index}>{name.trim()}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => {
                setGuest({ ...guest, rsvp_status: "pending" });
                setStatus("pending");
              }}
              className="mt-6 px-6 py-3 rounded-full bg-black text-white hover:bg-zinc-800"
            >
              Change My Response
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label className="block mb-2 font-medium text-zinc-800">
                Will you be attending?
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border px-4 py-3"
              >
                <option value="pending">Select one</option>
                <option value="attending">Yes, attending</option>
                <option value="declined">No, cannot attend</option>
              </select>
            </div>

            {status === "attending" && (
              <>
                <div className="mb-6">
                  <label className="block mb-2 font-medium text-zinc-800">
                    How many people from your family will attend?
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={maxGuests}
                    value={attendingCount}
                    onChange={(e) => handleCountChange(e.target.value)}
                    className="w-full rounded-lg border px-4 py-3"
                  />
                  <p className="mt-2 text-sm text-zinc-500">
                    You can enter up to {maxGuests}.
                  </p>
                </div>

                {visibleNameInputs.length > 0 && (
                  <div className="mb-8">
                    <label className="block mb-3 font-medium text-zinc-800">
                      Enter the names of the attending family members
                    </label>

                    <div className="space-y-3">
                      {visibleNameInputs.map((name, index) => (
                        <input
                          key={index}
                          type="text"
                          value={name}
                          onChange={(e) =>
                            handleNameChange(index, e.target.value)
                          }
                          placeholder={`Person ${index + 1} name`}
                          className="w-full rounded-lg border px-4 py-3"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleSubmit}
                disabled={saving || status === "pending"}
                className="px-8 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Submit RSVP"}
              </button>
            </div>
          </>
        )}

        <div className="mt-10 text-center text-3xl">🌷🤍🌷</div>
      </div>
    </div>
  );
}