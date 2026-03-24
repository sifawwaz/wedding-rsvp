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
      <div className="min-h-screen flex items-center justify-center bg-[#f8f3ea] text-[#3d3324]">
        <p className="text-lg font-medium">Loading your invitation...</p>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f3ea] px-6">
        <div className="max-w-md rounded-[2rem] border border-[#dcc9a3] bg-white p-8 text-center shadow-lg">
          <h1 className="mb-3 text-2xl font-semibold text-[#5b4527]">
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
    <div className="min-h-screen bg-gradient-to-br from-[#f7f1e6] via-[#fdfaf4] to-[#efe4cf] px-6 py-12 flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-[2rem] border border-[#dcc9a3] bg-white/95 p-8 shadow-2xl md:p-12">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 h-px w-32 bg-gradient-to-r from-transparent via-[#b8945b] to-transparent" />

          <p className="mb-3 text-lg text-[#8a6a37]">
            السلام عليكم ورحمة الله وبركاته
          </p>

          <p
            className="mb-6 text-2xl text-[#6d532b] md:text-3xl"
            style={{
              fontFamily:
                '"Brush Script MT", "Lucida Handwriting", "Apple Chancery", cursive',
            }}
          >
            Assalamu Alaikum wa Rahmatullahi wa Barakatuh
          </p>

          <p
            className="mb-4 text-4xl font-semibold tracking-[0.28em] text-[#8a6a37] md:text-5xl"
            style={{ fontFamily: '"Times New Roman", Georgia, serif' }}
          >
            WEDDING RSVP
          </p>

          <h1
            className="mb-4 text-2xl font-semibold leading-tight text-[#4d3a20] md:text-3xl"
            style={{
              fontFamily:
                '"Brush Script MT", "Lucida Handwriting", "Apple Chancery", cursive',
            }}
          >
            Welcome to Ayman & Abdul Bari&apos;s RSVP page
          </h1>

          <p className="mx-auto max-w-xl text-sm leading-7 text-[#6b5a43] md:text-base">
            Please select whether you will be attending or not.
          </p>

          <div className="mt-6 rounded-[1.5rem] border border-[#e6d6b7] bg-[#fbf7ef] px-6 py-5">
            <p
              className="mb-2 text-lg text-[#6d532b] md:text-xl"
              style={{
                fontFamily:
                  '"Brush Script MT", "Lucida Handwriting", "Apple Chancery", cursive',
              }}
            >
              In sha Allah on {"{Insert Date Here}"}
            </p>
            <p className="mb-3 text-[#8a6a37]">إن شاء الله</p>

            <p className="text-sm text-[#5d4c35] md:text-base">
              Venue: <span className="font-semibold">{"{Insert Venue Here}"}</span>
            </p>
          </div>

          <div className="mx-auto mt-5 h-px w-32 bg-gradient-to-r from-transparent via-[#b8945b] to-transparent" />
        </div>

        <div className="mb-8 rounded-[1.5rem] border border-[#e6d6b7] bg-[#fbf7ef] px-6 py-5 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#9b7a43]">
            Invitation For
          </p>
          <h2
            className="text-2xl font-semibold text-[#3f2f1a] md:text-3xl"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            {guest.invite_name || guest.family || "Guest"}
          </h2>
          <p className="mt-3 text-[#6b5a43]">
            Total invited from your family:{" "}
            <span className="font-semibold text-[#3f2f1a]">{maxGuests}</span>
          </p>
        </div>

        {alreadyResponded ? (
          <div className="text-center">
            <p className="mb-4 text-lg text-[#5d4c35]">
              Your response has been recorded.
            </p>

            <div className="mb-4 inline-block rounded-full bg-[#f3e7cf] px-6 py-3 text-lg font-semibold text-[#6d532b]">
              {guest.rsvp_status === "attending"
                ? `Attending (${guest.attending_count || 0})`
                : "Not Attending"}
            </div>

            {guest.rsvp_status === "attending" && guest.attending_names && (
              <div className="mt-4 rounded-[1.5rem] border border-[#e6d6b7] bg-[#fbf7ef] p-4 text-left">
                <p className="mb-2 font-semibold text-[#3f2f1a]">
                  Attending family members:
                </p>
                <ul className="list-disc pl-5 text-[#5d4c35]">
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
              className="mt-6 rounded-full bg-[#6d532b] px-6 py-3 text-white transition hover:bg-[#5b4523]"
            >
              Change My Response
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label className="mb-2 block font-medium text-[#3f2f1a]">
                Will you be attending?
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-[#d9c39d] bg-white px-4 py-3 text-black"
              >
                <option value="pending">Select one</option>
                <option value="attending">Yes, attending</option>
                <option value="declined">No, cannot attend</option>
              </select>
            </div>

            {status === "attending" && (
              <>
                <div className="mb-6">
                  <label className="mb-2 block font-medium text-[#3f2f1a]">
                    How many people from your family will attend?
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={maxGuests}
                    value={attendingCount}
                    onChange={(e) => handleCountChange(e.target.value)}
                    className="w-full rounded-lg border border-[#d9c39d] bg-white px-4 py-3 text-black placeholder:text-black"
                  />
                  <p className="mt-2 text-sm text-[#7a6850]">
                    You can enter up to {maxGuests}.
                  </p>
                </div>

                {visibleNameInputs.length > 0 && (
                  <div className="mb-8">
                    <label className="mb-3 block font-medium text-[#3f2f1a]">
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
                          className="w-full rounded-lg border border-[#d9c39d] bg-white px-4 py-3 text-black placeholder:text-black"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={saving || status === "pending"}
                className="rounded-full bg-[#6d532b] px-8 py-3 font-semibold text-white shadow-md transition hover:bg-[#5b4523] disabled:opacity-60"
              >
                {saving ? "Saving..." : "Submit RSVP"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}