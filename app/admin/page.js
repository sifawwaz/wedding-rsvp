"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [guests, setGuests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [copiedId, setCopiedId] = useState(null);

  const [newInviteName, setNewInviteName] = useState("");
  const [newFamily, setNewFamily] = useState("");
  const [newMaxGuests, setNewMaxGuests] = useState(1);
  const [addingGuest, setAddingGuest] = useState(false);

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .order("invite_name", { ascending: true });

    if (error) {
      console.error("Error fetching guests:", error);
      return;
    }

    setGuests(data || []);
  };

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://wedding-rsvp.vercel.app";

  const generateToken = (length = 12) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i += 1) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  };

  const generateLinks = (guest) => {
    const url = `${baseUrl}/rsvp/${guest.token}`;
    const displayName = guest.invite_name || guest.family || "Guest";
    const message = `Hi ${displayName}, welcome to Ayman & Abdul Bari's RSVP page. Please RSVP here: ${url}`;

    return {
      url,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
      sms: `sms:?body=${encodeURIComponent(message)}`,
    };
  };

  const addGuest = async () => {
    if (!newInviteName.trim()) {
      alert("Please enter an invite name.");
      return;
    }

    setAddingGuest(true);

    try {
      let token = generateToken();
      let exists = true;

      while (exists) {
        const { data, error } = await supabase
          .from("guests")
          .select("id")
          .eq("token", token)
          .maybeSingle();

        if (error) {
          alert("Could not generate guest token.");
          setAddingGuest(false);
          return;
        }

        if (!data) {
          exists = false;
        } else {
          token = generateToken();
        }
      }

      const rsvpPath = `/rsvp/${token}`;
      const rsvpLink = `${baseUrl}${rsvpPath}`;

      const payload = {
        invite_name: newInviteName.trim(),
        family: newFamily.trim() || null,
        max_guests: Number(newMaxGuests) || 1,
        token,
        rsvp_path: rsvpPath,
        rsvp_link: rsvpLink,
        rsvp_status: "pending",
        attending_count: 0,
        attending_names: null,
      };

      const { error } = await supabase.from("guests").insert([payload]);

      if (error) {
        alert("Could not add guest.");
        setAddingGuest(false);
        return;
      }

      setNewInviteName("");
      setNewFamily("");
      setNewMaxGuests(1);
      await fetchGuests();
    } finally {
      setAddingGuest(false);
    }
  };

  const copyLink = async (guest) => {
    const { url } = generateLinks(guest);

    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(guest.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const stats = useMemo(() => {
    const attending = guests.filter((g) => g.rsvp_status === "attending").length;
    const declined = guests.filter((g) => g.rsvp_status === "declined").length;
    const pending = guests.filter(
      (g) => !g.rsvp_status || g.rsvp_status === "pending"
    ).length;

    return {
      total: guests.length,
      attending,
      declined,
      pending,
    };
  }, [guests]);

  const filteredGuests = useMemo(() => {
    if (filter === "attending") {
      return guests.filter((g) => g.rsvp_status === "attending");
    }

    if (filter === "declined") {
      return guests.filter((g) => g.rsvp_status === "declined");
    }

    if (filter === "pending") {
      return guests.filter(
        (g) => !g.rsvp_status || g.rsvp_status === "pending"
      );
    }

    return guests;
  }, [guests, filter]);

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-2 text-3xl font-bold text-zinc-900">
          RSVP Dashboard
        </h1>
        <p className="mb-8 text-zinc-600">
          Manage invitations, create guests, copy RSVP links, and track live
          responses.
        </p>

        <div className="mb-8 rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900">
            Add Guest
          </h2>

          <div className="grid gap-4 md:grid-cols-4">
            <input
              type="text"
              placeholder="Invite name"
              value={newInviteName}
              onChange={(e) => setNewInviteName(e.target.value)}
              className="rounded-lg border px-4 py-3"
            />

            <input
              type="text"
              placeholder="Family (optional)"
              value={newFamily}
              onChange={(e) => setNewFamily(e.target.value)}
              className="rounded-lg border px-4 py-3"
            />

            <input
              type="number"
              min="1"
              placeholder="Max guests"
              value={newMaxGuests}
              onChange={(e) => setNewMaxGuests(e.target.value)}
              className="rounded-lg border px-4 py-3"
            />

            <button
              onClick={addGuest}
              disabled={addingGuest}
              className="rounded-lg bg-black px-4 py-3 text-white hover:bg-zinc-800 disabled:opacity-60"
            >
              {addingGuest ? "Adding..." : "Add Guest"}
            </button>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Total Invites</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Attending</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {stats.attending}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Not Attending</p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {stats.declined}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Pending</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {stats.pending}
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-full px-5 py-2 font-medium ${
              filter === "all"
                ? "bg-black text-white"
                : "border bg-white text-zinc-700"
            }`}
          >
            All
          </button>

          <button
            onClick={() => setFilter("attending")}
            className={`rounded-full px-5 py-2 font-medium ${
              filter === "attending"
                ? "bg-green-600 text-white"
                : "border bg-white text-zinc-700"
            }`}
          >
            Attending
          </button>

          <button
            onClick={() => setFilter("declined")}
            className={`rounded-full px-5 py-2 font-medium ${
              filter === "declined"
                ? "bg-red-600 text-white"
                : "border bg-white text-zinc-700"
            }`}
          >
            Not Attending
          </button>

          <button
            onClick={() => setFilter("pending")}
            className={`rounded-full px-5 py-2 font-medium ${
              filter === "pending"
                ? "bg-amber-500 text-white"
                : "border bg-white text-zinc-700"
            }`}
          >
            Pending
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="min-w-full">
            <thead className="bg-zinc-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-700">
                  Invite Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-700">
                  Family
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-700">
                  Invited
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-700">
                  Attending
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-700">
                  Names
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-700">
                  RSVP Link
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredGuests.map((guest) => {
                const links = generateLinks(guest);

                return (
                  <tr key={guest.id} className="border-t align-top">
                    <td className="px-4 py-3 text-zinc-900">
                      {guest.invite_name || "-"}
                    </td>

                    <td className="px-4 py-3 text-zinc-700">
                      {guest.family || "-"}
                    </td>

                    <td className="px-4 py-3 text-zinc-700">
                      {guest.max_guests ?? 1}
                    </td>

                    <td className="px-4 py-3 text-zinc-700">
                      {guest.attending_count ?? 0}
                    </td>

                    <td className="px-4 py-3 text-zinc-700">
                      {guest.attending_names || "-"}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                          guest.rsvp_status === "attending"
                            ? "bg-green-100 text-green-700"
                            : guest.rsvp_status === "declined"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {guest.rsvp_status || "pending"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <a
                        href={links.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-blue-600 underline"
                      >
                        {links.url}
                      </a>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => copyLink(guest)}
                          className="rounded bg-zinc-800 px-3 py-1 text-sm text-white hover:bg-zinc-700"
                        >
                          {copiedId === guest.id ? "Copied" : "Copy Link"}
                        </button>

                        <button
                          onClick={() => window.open(links.whatsapp, "_blank")}
                          className="rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600"
                        >
                          WhatsApp
                        </button>

                        <button
                          onClick={() => window.open(links.sms, "_blank")}
                          className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                        >
                          SMS
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredGuests.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-8 text-center text-zinc-500"
                  >
                    No guests found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}