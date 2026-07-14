"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { contactTopics } from "./contact-content";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState(contactTopics[0]);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Uzupełnij imię, e-mail i wiadomość.");
      return;
    }

    setSending(true);

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          topic,
          message: message.trim(),
          website,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Nie udało się wysłać wiadomości.");
      }

      toast.success(
        result.simulated
          ? "Wiadomość zapisana — skonfiguruj RESEND_API_KEY, aby wysyłać e-maile."
          : "Dziękujemy! Wiadomość została wysłana."
      );

      setName("");
      setEmail("");
      setPhone("");
      setTopic(contactTopics[0]);
      setMessage("");
      setWebsite("");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Nie udało się wysłać wiadomości.";
      toast.error(errorMessage);
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="zks-card space-y-5 p-6 sm:p-8">
      <div>
        <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold uppercase text-white sm:text-2xl">
          Formularz kontaktowy
        </h3>
        <p className="mt-2 text-sm text-zks-text-muted">
          Odpowiadamy zwykle w ciągu 1–2 dni roboczych.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-zks-gold-mid">
            Imię i nazwisko *
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jan Kowalski"
            className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zks-text-muted focus:border-zks-gold-mid focus:shadow-gold-glow-sm"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-zks-gold-mid">
            E-mail *
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jan@example.com"
            className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zks-text-muted focus:border-zks-gold-mid focus:shadow-gold-glow-sm"
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-zks-gold-mid">
            Telefon
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="790 000 000"
            className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zks-text-muted focus:border-zks-gold-mid focus:shadow-gold-glow-sm"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-zks-gold-mid">
            Temat
          </span>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-sm text-white outline-none transition focus:border-zks-gold-mid focus:shadow-gold-glow-sm"
          >
            {contactTopics.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-zks-gold-mid">
          Wiadomość *
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="Napisz, w czym możemy pomóc..."
          className="w-full resize-none rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zks-text-muted focus:border-zks-gold-mid focus:shadow-gold-glow-sm"
        />
      </label>

      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <button
        type="submit"
        disabled={sending}
        className="zks-btn-primary inline-flex w-full items-center justify-center gap-2 px-10 py-3.5 text-sm disabled:opacity-60"
      >
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Wyślij wiadomość
      </button>
    </form>
  );
}
