import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { normalizeRegistrationStatus } from "./registration-types";
import type { RegistrationRecord } from "./registration-types";

type StartListRow = {
  "Imię i Nazwisko": string;
  "Data urodzenia": string;
  Klub: string;
  "Kat. wagowa": string;
};

function formatBirthDate(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (/^\d{4}$/.test(trimmed)) {
    return trimmed;
  }

  return trimmed;
}

function formatWeight(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  return trimmed.toLowerCase().includes("kg") ? trimmed : `${trimmed} kg`;
}

export function buildStartListRows(
  registrations: Pick<
    RegistrationRecord,
    "child_name" | "child_surname" | "child_birth_year" | "child_weight" | "status"
  >[]
): StartListRow[] {
  return registrations
    .filter((item) => normalizeRegistrationStatus(item.status) === "approved")
    .map((item) => ({
      "Imię i Nazwisko": `${item.child_name} ${item.child_surname}`.trim(),
      "Data urodzenia": formatBirthDate(item.child_birth_year),
      Klub: "ZKS Białogard",
      "Kat. wagowa": formatWeight(item.child_weight),
    }));
}

export function exportStartListToExcel(
  registrations: Pick<
    RegistrationRecord,
    "child_name" | "child_surname" | "child_birth_year" | "child_weight" | "status"
  >[],
  fileName: string
) {
  const rows = buildStartListRows(registrations);

  if (!rows.length) {
    return { ok: false as const, reason: "Brak zaakceptowanych zawodników na liście startowej." };
  }

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [{ wch: 28 }, { wch: 16 }, { wch: 18 }, { wch: 14 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Lista startowa");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const fileData = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(fileData, fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`);

  return { ok: true as const, count: rows.length };
}
