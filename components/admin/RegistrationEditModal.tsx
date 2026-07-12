"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import Modal, { ModalBody, ModalFooter, ModalHeader } from "@/components/ui/Modal";
import AuthField from "@/components/auth/AuthField";
import type { RegistrationItem } from "@/lib/registrations-client";
import { updateAdminRegistrationData } from "@/lib/registrations-client";

type Props = {
  open: boolean;
  registration: RegistrationItem | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function RegistrationEditModal({
  open,
  registration,
  onClose,
  onSaved,
}: Props) {
  const [childName, setChildName] = useState("");
  const [childSurname, setChildSurname] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState("M");
  const [weight, setWeight] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!registration) return;

    setChildName(registration.child_name);
    setChildSurname(registration.child_surname);
    setBirthYear(registration.child_birth_year);
    setGender(registration.child_gender || "M");
    setWeight(registration.child_weight);
    setParentPhone(registration.parent_phone || "");
  }, [registration]);

  if (!open || !registration) return null;

  async function handleSave() {
    if (!childName.trim() || !childSurname.trim() || !birthYear.trim() || !weight.trim()) {
      toast.error("Uzupełnij wymagane pola zawodnika.");
      return;
    }

    try {
      setSaving(true);
      await updateAdminRegistrationData(registration!.id, {
        child_name: childName,
        child_surname: childSurname,
        child_birth_year: birthYear,
        child_gender: gender,
        child_weight: weight,
        parent_phone: parentPhone.trim() || null,
      });
      toast.success("Dane zgłoszenia zaktualizowane.");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się zapisać zmian.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open}>
      <ModalHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold uppercase text-white">
              Edytuj zgłoszenie
            </h2>
            <p className="mt-2 text-sm text-zks-text-muted">
              Zmiana danych zawodnika na liście startowej.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zks-gold-mid/20 p-2 text-zks-text-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </ModalHeader>

      <ModalBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField
              label="Imię"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
            />
            <AuthField
              label="Nazwisko"
              value={childSurname}
              onChange={(e) => setChildSurname(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField
              label="Rok urodzenia"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
            />
            <label className="block space-y-2">
              <span className="text-xs font-medium uppercase tracking-[0.15em] text-zks-gold-mid">
                Płeć
              </span>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3 text-sm text-white outline-none"
              >
                <option value="M">M</option>
                <option value="K">K</option>
              </select>
            </label>
          </div>

          <AuthField
            label="Kategoria wagowa (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />

          <AuthField
            label="Telefon rodzica"
            value={parentPhone}
            onChange={(e) => setParentPhone(e.target.value)}
            placeholder="Opcjonalnie"
          />
      </ModalBody>

      <ModalFooter>
        <button type="button" onClick={onClose} className="zks-btn-outline px-5 py-2.5 text-sm">
          Anuluj
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="zks-btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Zapisz zmiany
        </button>
      </ModalFooter>
    </Modal>
  );
}
