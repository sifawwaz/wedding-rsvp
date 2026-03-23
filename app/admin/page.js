"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [guests, setGuests] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .order("invite_name", { ascending: true });

    if (!error) {
      setGuests(data || []);
    }
  };

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const generateLinks = (guest) => {
    const path = `/rsvp/${guest.token}`;
    const url = `${baseUrl}${path}`;
    const message = `Hi ${guest.invite_name || guest.family || "Guest"}, you are invited to our wedding. Please RSVP here: ${url}`;

    return {
      url,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
      sms: `sms:?body=${encodeURIComponent(message)}`,
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

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-zinc-900">
          RSVP Dashboard
        </h1>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm border">
            <p className="text-sm text-zinc-500">Total Invites</p>
            <p className="mt-2 text-3xl font-bold">{stats.total}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border">
            <p className="text-sm text-zinc-500">Attending</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {stats.attending}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border">
            <p className="text-sm text-zinc-500">Not Attending</p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {stats.declined}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border">
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
                : "bg-white border text-zinc-700"
            }`}
          >
            All
          </button>

          <button
            onClick={() => setFilter("attending")}
            className={`rounded-full px-5 py-2 font-medium ${
              filter === "attending"
                ? "bg-green-600 text-white"
                : "bg-white border text-zinc-700"
            }`}
          >
            Attending
          </button>

          <button
            onClick={() => setFilter("declined")}
            className={`rounded-full px-5 py-2 font-medium ${
              filter === "declined"
                ? "bg-red-600 text-white"
                : "bg-white border text-zinc-700"
            }`}
          >
            Not Attending
          </button>

          <button
            onClick={() => setFilter("pending")}
            className={`rounded-full px-5 py-2 font-medium ${
              filter === "pending"
                ? "bg-amber-500 text-white"
                : "bg-white border text-zinc-700"
            }`}
          >
            Pending
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm border">
          <table className="min-w-full">
            <thead className="bg-zinc-100">
              <tr>
                <th className="px-4 py-3 text-left">Invite Name</th>
                <th className="px-4 py-3 text-left">Family</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Count</th>
                <th className="px-4 py-3 text-left">Link</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map((g) => {
                const links = generateLinks(g);

                return (
                  <tr key={g.id} className="border-t align-top">
                    <td className="px-4 py-3">{g.invite_name || "-"}</td>
                    <td className="px-4 py-3">{g.family || "-"}</td>
                    <td className="px-4 py-3">
                      {g.rsvp_status || "pending"}
                    </td>
                    <td className="px-4 py-3">{g.attending_count ?? 0}</td>
                    <td className="px-4 py-3">
                      <a
                        href={links.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline break-all"
                      >
                        Open Link
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => window.open(links.whatsapp)}
                          className="rounded bg-green-500 px-3 py-1 text-white"
                        >
                          WhatsApp
                        </button>
                        <button
                          onClick={() => window.open(links.sms)}
                          className="rounded bg-blue-500 px-3 py-1 text-white"
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
                  <td colSpan="6" className="px-4 py-8 text-center text-zinc-500">
                    No guests in this category.
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