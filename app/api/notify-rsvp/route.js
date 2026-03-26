import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY");
      return Response.json(
        { success: false, error: "Missing RESEND_API_KEY" },
        { status: 500 }
      );
    }

    if (!process.env.NOTIFY_EMAIL) {
      console.error("Missing NOTIFY_EMAIL");
      return Response.json(
        { success: false, error: "Missing NOTIFY_EMAIL" },
        { status: 500 }
      );
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error("Missing NEXT_PUBLIC_SUPABASE_URL");
      return Response.json(
        { success: false, error: "Missing NEXT_PUBLIC_SUPABASE_URL" },
        { status: 500 }
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
      return Response.json(
        { success: false, error: "Missing SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 }
      );
    }

    const body = await req.json();

    const {
      invite_name,
      family,
      rsvp_status,
      attending_count,
      men_count,
      women_count,
      max_guests,
    } = body;

    const displayName = invite_name || family || "Guest";

    const { data: attendingGuests, error: attendingError } = await supabase
      .from("guests")
      .select(
        "invite_name, family, attending_count, men_count, women_count, max_guests"
      )
      .eq("rsvp_status", "attending")
      .order("invite_name", { ascending: true });

    if (attendingError) {
      console.error("Error fetching attending list:", attendingError);
    }

    const totalAttendingPeople = (attendingGuests || []).reduce(
      (sum, guest) => sum + Number(guest.attending_count || 0),
      0
    );

    const totalAttendingMen = (attendingGuests || []).reduce(
      (sum, guest) => sum + Number(guest.men_count || 0),
      0
    );

    const totalAttendingWomen = (attendingGuests || []).reduce(
      (sum, guest) => sum + Number(guest.women_count || 0),
      0
    );

    const formattedAttendingList = (attendingGuests || [])
      .map((guest, index) => {
        const name = guest.invite_name || guest.family || "Guest";
        const count = guest.attending_count || 0;
        const men = guest.men_count || 0;
        const women = guest.women_count || 0;
        const invited = guest.max_guests || 1;

        return `
          <tr>
            <td style="padding:8px; border:1px solid #ddd;">${index + 1}</td>
            <td style="padding:8px; border:1px solid #ddd;">${name}</td>
            <td style="padding:8px; border:1px solid #ddd;">${invited}</td>
            <td style="padding:8px; border:1px solid #ddd;">${men}</td>
            <td style="padding:8px; border:1px solid #ddd;">${women}</td>
            <td style="padding:8px; border:1px solid #ddd;">${count}</td>
          </tr>
        `;
      })
      .join("");

    const subject = `RSVP Update: ${displayName}`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
        <h2>RSVP Update</h2>

        <p><strong>Guest:</strong> ${displayName}</p>
        <p><strong>Status:</strong> ${rsvp_status}</p>
        <p><strong>Invited Count:</strong> ${max_guests ?? 1}</p>
        <p><strong>Men Attending:</strong> ${men_count ?? 0}</p>
        <p><strong>Women Attending:</strong> ${women_count ?? 0}</p>
        <p><strong>Total Attending:</strong> ${attending_count ?? 0}</p>

        <hr style="margin: 24px 0;" />

        <h3>Current Attending Summary</h3>
        <p><strong>Total Attending Households:</strong> ${(attendingGuests || []).length}</p>
        <p><strong>Total Men:</strong> ${totalAttendingMen}</p>
        <p><strong>Total Women:</strong> ${totalAttendingWomen}</p>
        <p><strong>Total People:</strong> ${totalAttendingPeople}</p>

        <h3 style="margin-top: 24px;">Current Full Attending List</h3>

        <table style="border-collapse: collapse; width: 100%; margin-top: 12px;">
          <thead>
            <tr>
              <th style="padding:8px; border:1px solid #ddd; background:#f5f5f5;">#</th>
              <th style="padding:8px; border:1px solid #ddd; background:#f5f5f5;">Guest</th>
              <th style="padding:8px; border:1px solid #ddd; background:#f5f5f5;">Invited</th>
              <th style="padding:8px; border:1px solid #ddd; background:#f5f5f5;">Men</th>
              <th style="padding:8px; border:1px solid #ddd; background:#f5f5f5;">Women</th>
              <th style="padding:8px; border:1px solid #ddd; background:#f5f5f5;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${
              formattedAttendingList ||
              `
              <tr>
                <td colspan="6" style="padding:8px; border:1px solid #ddd;">
                  No guests attending yet.
                </td>
              </tr>
            `
            }
          </tbody>
        </table>
      </div>
    `;

    const recipients = (process.env.NOTIFY_EMAIL || "")
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.includes("@"));

    console.log("Recipients:", recipients);

    if (!recipients.length) {
      console.error("No valid recipients found in NOTIFY_EMAIL");
      return Response.json(
        { success: false, error: "No valid recipients found" },
        { status: 500 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "Wedding RSVP <onboarding@resend.dev>",
      to: recipients,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return Response.json({ success: false, error }, { status: 500 });
    }

    console.log("Resend success:", data);
    return Response.json({ success: true, data });
  } catch (error) {
    console.error("Notify RSVP route error:", error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}