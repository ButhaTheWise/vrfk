// src/routes/+page.server.js
import { getAllRows, updateRowAt, deleteRowAt, addRow } from '$lib/server/sheets.js';

// Segédfüggvények
const ok = (extra = {}) => ({ success: true, ...extra });
const fail = (msg = 'Váratlan hiba') => ({ success: false, error: String(msg ?? 'Hiba') });

/**
 * UI '#' (1,2,3,...) -> lapi sorindex (2,3,4,...)
 * Mert a táblában A oszlop: =SOR()-1, tehát UI# = sheetRow - 1
 */
function parseUiIdToSheetRow(form) {
  const raw = form.get('id');
  const uiId = Number(raw);
  if (!Number.isFinite(uiId) || uiId < 1) {
    return { error: 'Érvénytelen sor' };
  }
  return { uiId, row: uiId + 1 };
}

/** Fejléc lekérése és trimelése */
async function getHeader() {
  const all = await getAllRows();
  const header = (all?.[0] ?? []).map((h) => String(h ?? '').trim());
  return header;
}

export async function load() {
  const data = await getAllRows(); // [header, ...rows]
  if (!Array.isArray(data) || data.length === 0) return { data: [] };

  const header = data[0];
  const nevIdx = header.findIndex(h => String(h ?? '').trim().toLowerCase() === 'név');

  // Ha nincs "Név" oszlop, visszaadjuk az eredeti adatot
  if (nevIdx === -1) return { data };

  // Csak azok a sorok maradnak, ahol a "Név" cella nem üres
  const trimmed = [
    header,
    ...data.slice(1).filter(row => String(row?.[nevIdx] ?? '').trim() !== '')
  ];

  return { data: trimmed };
}

export const actions = {
  delete: async ({ request }) => {
    try {
      const form = await request.formData();
      const { row, error } = parseUiIdToSheetRow(form);
      if (error) return fail(error);

      await deleteRowAt(row); // lapi index
      return ok();
    } catch (err) {
      return fail(err?.message);
    }
  },

  update: async ({ request }) => {
    try {
      const form = await request.formData();
      const { row, error } = parseUiIdToSheetRow(form);
      if (error) return fail(error);

      const header = await getHeader();
      if (header.length === 0) return fail('Üres fejléc');

      const updatedRow = {};
      for (const [key, value] of form.entries()) {
        if (key === 'id') continue;
        const k = String(key).trim();
        if (header.includes(k)) updatedRow[k] = value;
      }

      await updateRowAt(row, updatedRow); // lapi index
      return ok();
    } catch (err) {
      return fail(err?.message);
    }
  },

  add: async ({ request }) => {
    try {
      const form = await request.formData();
      const header = await getHeader();
      if (header.length === 0) return fail('Üres fejléc');

      // Csak a fejlécben szereplő kulcsokat engedjük át
      const newRow = {};
      for (const k of header) {
        const v = form.get(k);
        if (v != null) newRow[k] = v;
      }

      await addRow(newRow);
      return ok();
    } catch (err) {
      return fail(err?.message);
    }
  }
};