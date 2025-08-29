import { google } from "googleapis";
const spreadsheetId = process.env.GSHEET_ID;
const sheetName = process.env.GSHEET_SHEET;
const sheetId = Number(process.env.GSHEET_SHEET_ID);
const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
let sheetsClient = null;
async function getSheetsClient() {
  if (sheetsClient) return sheetsClient;
  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });
  sheetsClient = google.sheets({ version: "v4", auth });
  return sheetsClient;
}
function colToA1(colIdx0) {
  let n = colIdx0 + 1;
  let s = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}
async function getHeader$1() {
  const sheets = await getSheetsClient();
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!1:1`
  });
  const header = (resp.data.values?.[0] ?? []).map((h) => String(h ?? "").trim());
  return header;
}
const rangSorrend = [
  "Akadémista",
  "Őrmester",
  "Törzsőrmester",
  "Főtörzsőrmester",
  "Zászlós",
  "Törzszászlós",
  "Főtörzszászlós",
  "Hadnagy",
  "Főhadnagy",
  "Százados",
  "Őrnagy",
  "Alezredes",
  "Ezredes",
  "Dandártábornok",
  "Vezérőrnagy",
  "Altábornagy"
];
function getRangIndex(rang) {
  const ix = rangSorrend.indexOf(rang);
  return ix === -1 ? 9999 : ix + 1;
}
async function sortByColumn(columnIndex, sortOrder = "ASCENDING") {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          sortRange: {
            range: {
              sheetId,
              startRowIndex: 1,
              // 0-alapú: 1 = header után
              startColumnIndex: 0
            },
            sortSpecs: [{ dimensionIndex: columnIndex, sortOrder }]
          }
        }
      ]
    }
  });
}
async function getAllRows() {
  const sheets = await getSheetsClient();
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:Z`
    // ha biztosan Z-ig tart; ha nem, átírható `${sheetName}`
  });
  return resp.data.values ?? [];
}
async function deleteRowAt(rowIndex) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowIndex - 1,
              // 0-alapú kezdő
              endIndex: rowIndex
              // exkluzív
            }
          }
        }
      ]
    }
  });
}
async function updateRowAt(rowIndex, newRowObj) {
  const sheets = await getSheetsClient();
  const header = await getHeader$1();
  if (header.length === 0) throw new Error("Üres fejléc");
  const cKey = header[2];
  const rendfokozat = newRowObj[cKey] ?? newRowObj["Rendfokozat"] ?? "";
  const newRowArr = header.map((rawKey, i) => {
    const key = String(rawKey).trim();
    if (i === 0) return "=SOR()-1";
    if (i === 3) {
      return `=HA(B${rowIndex}="";IFNA(FKERES(C${rowIndex};HELPER!$A:$B;2;HAMIS);"");IFNA(FKERES(C${rowIndex};HELPER!$A:$B;2;HAMIS);""))`;
    }
    if (key === "RangIndex") return getRangIndex(rendfokozat);
    return newRowObj[key] ?? "";
  });
  const lastColA1 = colToA1(header.length - 1);
  const range = `${sheetName}!A${rowIndex}:${lastColA1}${rowIndex}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [newRowArr] }
  });
  const rangIndexCol = header.findIndex((h) => String(h).trim() === "RangIndex");
  if (rangIndexCol !== -1) {
    await sortByColumn(rangIndexCol);
  }
}
async function addRow(newRowObj) {
  const sheets = await getSheetsClient();
  const header = await getHeader$1();
  if (header.length === 0) throw new Error("Üres fejléc");
  const allRows = await getAllRows();
  const nextRowIndex = (allRows?.length ?? 0) + 1;
  const newRowArr = header.map((rawKey, i) => {
    const key = String(rawKey).trim();
    if (i === 0) return "=SOR()-1";
    if (i === 3) {
      return `=HA(B${nextRowIndex}="";IFNA(FKERES(C${nextRowIndex};HELPER!$A:$B;2;HAMIS);"");IFNA(FKERES(C${nextRowIndex};HELPER!$A:$B;2;HAMIS);""))`;
    }
    if (key === "RangIndex") return getRangIndex(newRowObj["Rendfokozat"] ?? "");
    return newRowObj[key] ?? "";
  });
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A1:1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [newRowArr] }
  });
  const rangIndexCol = header.findIndex((h) => String(h).trim() === "RangIndex");
  if (rangIndexCol !== -1) {
    await sortByColumn(rangIndexCol);
  }
}
const ok = (extra = {}) => ({ success: true, ...extra });
const fail = (msg = "Váratlan hiba") => ({ success: false, error: String(msg ?? "Hiba") });
function parseUiIdToSheetRow(form) {
  const raw = form.get("id");
  const uiId = Number(raw);
  if (!Number.isFinite(uiId) || uiId < 1) {
    return { error: "Érvénytelen sor" };
  }
  return { uiId, row: uiId + 1 };
}
async function getHeader() {
  const all = await getAllRows();
  const header = (all?.[0] ?? []).map((h) => String(h ?? "").trim());
  return header;
}
async function load() {
  const data = await getAllRows();
  if (!Array.isArray(data) || data.length === 0) return { data: [] };
  const header = data[0];
  const nevIdx = header.findIndex((h) => String(h ?? "").trim().toLowerCase() === "név");
  if (nevIdx === -1) return { data };
  const trimmed = [
    header,
    ...data.slice(1).filter((row) => String(row?.[nevIdx] ?? "").trim() !== "")
  ];
  return { data: trimmed };
}
const actions = {
  delete: async ({ request }) => {
    try {
      const form = await request.formData();
      const { row, error } = parseUiIdToSheetRow(form);
      if (error) return fail(error);
      await deleteRowAt(row);
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
      if (header.length === 0) return fail("Üres fejléc");
      const updatedRow = {};
      for (const [key, value] of form.entries()) {
        if (key === "id") continue;
        const k = String(key).trim();
        if (header.includes(k)) updatedRow[k] = value;
      }
      await updateRowAt(row, updatedRow);
      return ok();
    } catch (err) {
      return fail(err?.message);
    }
  },
  add: async ({ request }) => {
    try {
      const form = await request.formData();
      const header = await getHeader();
      if (header.length === 0) return fail("Üres fejléc");
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
export {
  actions,
  load
};
