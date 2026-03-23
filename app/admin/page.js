"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [guests, setGuests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [copiedId, setCopiedId] = useState(null);

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
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://wedding-rsvp-lsbx2fjhm-sifawwazs-projects.vercel.app";

  const generateLinks = (guest) => {
    const path = `/rsvp/${guest.token}`;
    const url = `${baseUrl}${path}`;
    const displayName = guest.invite_name || guest.family || "Guest";
    const message = `Welcome to Ayman & Abdul Bari's RSVP page! Please use your personal RSVP link: ${url}`;

    return {
      url,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
      sms: `sms:?body=${encodeURIComponent(message)}`,
      displayName,
    };
  };

  const stats = useMemo(() => {
    const attending = guests.filter((g) => g.rsvp_status === "attending").length;
    const declined = guests.filter(
      (g) => g.rsvp_status === "declined" || g.rsvp_status === "not_attending"
    ).length;
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
      return guests.filter(
        (g) => g.rsvp_status === "declined" || g.rsvp_status === "not_attending"
      );
    }

    if (filter === "pending") {
      return guests.filter(
        (g) => !g.rsvp_status || g.rsvp_status === "pending"
      );
    }

    return guests;
  }, [guests, filter]);

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

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-2 text-3xl font-bold text-zinc-900">
          RSVP Dashboard
        </h1>
        <p className="mb-8 text-zinc-600">
          Manage invitations, copy RSVP links, and track guest responses.
        </p>

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
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-700">
                  Attending Count
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

                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                          guest.rsvp_status === "attending"
                            ? "bg-green-100 text-green-700"
                            : guest.rsvp_status === "declined" ||
                              guest.rsvp_status === "not_attending"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {guest.rsvp_status || "pending"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-zinc-700">
                      {guest.attending_count ?? 0}
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
                    colSpan="6"
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