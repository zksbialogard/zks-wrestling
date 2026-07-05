import { collection, getDocs } from "firebase/firestore";

import { db } from "@/lib/firebase";

type NotifyEventInput = {
  title: string;
  location: string;
  eventDate: string;
  registrationDeadline: string;
  sendEmail: boolean;
  sendSms: boolean;
};

export async function notifyParentsAboutEvent(input: NotifyEventInput) {
  const snapshot = await getDocs(collection(db, "users"));
  const users = snapshot.docs.map((doc) => doc.data());

  const parents = users.filter(
    (user) => user.email && (user.rola === "rodzic" || !user.rola)
  );

  const message = `ZKS Białogard — nowe zawody: ${input.title}. Miejsce: ${input.location}. Data: ${input.eventDate}. Zapisy do: ${input.registrationDeadline}.`;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
      <h2 style="color:#d4af37">ZKS Białogard — nowe zawody</h2>
      <p><strong>${input.title}</strong></p>
      <p>Miejsce: ${input.location}</p>
      <p>Data zawodów: ${input.eventDate}</p>
      <p>Termin zgłoszeń: ${input.registrationDeadline}</p>
      <p>Zaloguj się do aplikacji, aby zgłosić dziecko.</p>
    </div>
  `;

  let emailsSent = 0;
  let smsSent = 0;

  for (const parent of parents) {
    if (input.sendEmail && parent.email) {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: parent.email,
          subject: `ZKS Białogard — ${input.title}`,
          html,
          text: message,
        }),
      });

      if (response.ok) emailsSent += 1;
    }

    if (input.sendSms && parent.telefon) {
      const response = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: parent.telefon,
          message,
        }),
      });

      if (response.ok) smsSent += 1;
    }
  }

  return { emailsSent, smsSent, totalParents: parents.length };
}
