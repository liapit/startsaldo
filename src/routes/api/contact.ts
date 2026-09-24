import { createFileRoute } from "@tanstack/react-router";
import { Resend } from "resend";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  firma: z.string().trim().max(200).optional().default(""),
  email: z.string().trim().email().max(320),
  telefon: z.string().trim().max(50).optional().default(""),
  nachricht: z.string().trim().min(1).max(5000),
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Ungültige Anfrage." }, { status: 400 });
        }

        const parsed = contactSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json(
            { error: "Bitte füllen Sie alle Pflichtfelder korrekt aus." },
            { status: 400 },
          );
        }

        const apiKey = process.env["RESEND_API_KEY"];
        const toEmail = process.env["CONTACT_TO_EMAIL"];
        if (!apiKey || !toEmail) {
          console.error("RESEND_API_KEY oder CONTACT_TO_EMAIL fehlt.");
          return Response.json(
            { error: "Der E-Mail-Versand ist momentan nicht verfügbar." },
            { status: 500 },
          );
        }

        const { name, firma, email, telefon, nachricht } = parsed.data;
        const resend = new Resend(apiKey);

        const rows: Array<[string, string]> = [
          ["Name", name],
          ["Firma", firma || "—"],
          ["E-Mail", email],
          ["Telefon", telefon || "—"],
        ];
        const html = `
          <h2 style="font-family:sans-serif;">Neue Kontaktanfrage über die Website</h2>
          <table style="font-family:sans-serif;border-collapse:collapse;">
            ${rows
              .map(
                ([label, value]) =>
                  `<tr><td style="padding:4px 16px 4px 0;font-weight:600;vertical-align:top;">${label}</td><td style="padding:4px 0;">${escapeHtml(value)}</td></tr>`,
              )
              .join("")}
          </table>
          <p style="font-family:sans-serif;font-weight:600;margin-top:16px;">Nachricht</p>
          <p style="font-family:sans-serif;white-space:pre-line;">${escapeHtml(nachricht)}</p>
        `;

        const { error } = await resend.emails.send({
          from: "StartSaldo Website <website@startsaldo.ch>",
          to: [toEmail],
          replyTo: email,
          subject: `Kontaktanfrage von ${name}`,
          html,
        });

        if (error) {
          console.error("Resend-Fehler:", error);
          return Response.json(
            { error: "Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es später erneut." },
            { status: 502 },
          );
        }

        return Response.json({ ok: true });
      },
    },
  },
});
