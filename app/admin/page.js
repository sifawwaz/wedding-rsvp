"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [guests, setGuests] = useState([]);

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    const { data } = await supabase.from("guests").select("*");
    setGuests(data || []);
  };

  const generateLinks = (guest) => {
    // 🔑 Use environment variable in production
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const url = `${baseUrl}/rsvp/${guest.id}`;

    const message = `Hi ${guest.name}, RSVP here: ${url}`;

    return {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
      sms: `sms:?body=${encodeURIComponent(message)}`,
    };
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">RSVP Dashboard</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th>Name</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {guests.map((g) => {
            const links = generateLinks(g);
            return (
              <tr key={g.id} className="border-t text-center">
                <td>{g.name}</td>
                <td>{g.rsvp_status}</td>
                <td className="flex gap-2 justify-center py-2">
                  <button
                    onClick={() => window.open(links.whatsapp)}
                    className="bg-green-500 px-3 py-1 text-white rounded"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => window.open(links.sms)}
                    className="bg-blue-500 px-3 py-1 text-white rounded"
                  >
                    SMS
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}