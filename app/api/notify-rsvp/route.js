import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      invite_name,
      family,
      rsvp_status,
      attending_count,
      attending_names,
      max_guests,
    } = body;

    const displayName = invite_name || family || "Guest";

    // 🔥 GET FULL ATTENDING LIST
    const { data: attendingGuests } = await supabase
      .from("guests")
      .select("invite_name, family, attending_count, attending_names")
      .eq("rsvp_status", "attending")
      .order("invite_name", { ascending: true });

    const rows = (attendingGuests || [])
      .map((g, i) => {
        const name = g.invite_name || g.family || "Guest";
        return `
          <tr>
            <td style="padding:6px;border:1px solid #ddd;">${i + 1}</td>
            <td style="padding:6px;border:1px solid #ddd;">${name}</td>
            <td style="padding:6px;border:1px solid #ddd;">${g.attending_count || 0}</td>
            <td style="padding:6px;border:1px solid #ddd;">${g.attending_names || "-"}</td>
          </tr>
        `;
      })
      .join("");

    const html = `
      <div style="font-family: Arial;">
        <h2>RSVP Update</h2>

        <p><b>Guest:</b> ${displayName}</p>
        <p><b>Status:</b> ${rsvp_status}</p>
        <p><b>Invited:</b> ${max_guests ?? 1}</p>
        <p><b>Attending:</b> ${attending_count ?? 0}</p>
        <p><b>Names:</b> ${attending_names || "-"}</p>

        <hr />

        <h3>Full Attending List</h3>

        <table style="border-collapse:collapse;width:100%;">
          <tr>
            <th style="border:1px solid #ddd;padding:6px;">#</th>
            <th style="border:1px solid #ddd;padding:6px;">Guest</th>
            <th style="border:1px solid #ddd;padding:6px;">Count</th>
            <th style="border:1px solid #ddd;padding:6px;">Names</th>
          </tr>
          ${rows}
        </table>
      </div>
    `;

    await resend.emails.send({
      from: "Wedding RSVP <onboarding@resend.dev>",
      to: process.env.NOTIFY_EMAIL,
      subject: `RSVP: ${displayName}`,
      html,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ success: false }, { status: 500 });
  }
}