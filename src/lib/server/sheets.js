// src/lib/server/sheets.js

import { browser } from '$app/environment';
if (browser) throw new Error('Google Sheets csak szerveren használható');

import { env } from '$env/dynamic/private';
import { google } from 'googleapis';

// --- CONFIG ---
const spreadsheetId = env.GSHEET_ID;
const sheetName     = env.GSHEET_SHEET;
const sheetId       = Number(env.GSHEET_SHEET_ID);

// --- GOOGLE AUTH (BASE64 credentials) ---
let sheetsClient = null;
async function getSheetsClient() {
  if (sheetsClient) return sheetsClient;

  const credentials = JSON.parse(
    Buffer.from(env.GOOGLE_CREDENTIALS_B64, 'base64').toString('utf8')
  );

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

// --- UTIL: 0-alapú oszlop index -> A1 betű jelölés ---
function colToA1(colIdx0) {
  let n = colIdx0 + 1;
  let s = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

// --- Fejléc lekérése ---
export async function getHeader() {
  const sheets = await getSheetsClient();
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!1:1`,
  });
  return (resp.data.values?.[0] ?? []).map(h => String(h ?? '').trim());
}

// --- Rang sorrend ---
const rangSorrend = [
  'Akadémista','Őrmester','Törzsőrmester','Főtörzsőrmester','Zászlós',
  'Törzszászlós','Főtörzszászlós','Hadnagy','Főhadnagy','Százados',
  'Őrnagy','Alezredes','Ezredes','Dandártábornok','Vezérőrnagy','Altábornagy'
];
function getRangIndex(rang) {
  const ix = rangSorrend.indexOf(rang);
  return ix === -1 ? 9999 : ix;
}

// --- Rendezés ---
export async function sortByColumn(columnIndex, sortOrder = 'ASCENDING') {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        sortRange: {
          range: { sheetId, startRowIndex: 1, startColumnIndex: 0 },
          sortSpecs: [{ dimensionIndex: columnIndex, sortOrder }]
        }
      }]
    }
  });
}

// --- Minden sor lekérése ---
export async function getAllRows() {
  const sheets = await getSheetsClient();
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: sheetName,
  });
  return resp.data.values ?? [];
}

// --- Sor törlése ---
export async function deleteRowAt(rowIndex) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: { sheetId, dimension: 'ROWS', startIndex: rowIndex - 1, endIndex: rowIndex }
        }
      }]
    }
  });
}

// --- Sor frissítése ---
export async function updateRowAt(rowIndex, newRowObj) {
  const sheets = await getSheetsClient();
  const header = await getHeader();
  if (header.length === 0) throw new Error('Üres fejléc');

  const cKey = header[2]; // pl. "Rendfokozat"
  const rendfokozat = newRowObj[cKey] ?? newRowObj['Rendfokozat'] ?? '';

  const newRowArr = header.map((rawKey, i) => {
    const key = String(rawKey).trim();
    if (i === 0) return '=SOR()-1';
    if (i === 3) return `=HA(B${rowIndex}="";IFNA(FKERES(C${rowIndex};HELPER!$A:$B;2;HAMIS);"");IFNA(FKERES(C${rowIndex};HELPER!$A:$B;2;HAMIS);""))`;
    if (key === 'RangIndex') return getRangIndex(rendfokozat);
    return newRowObj[key] ?? '';
  });

  const lastColA1 = colToA1(header.length - 1);
  const range = `${sheetName}!A${rowIndex}:${lastColA1}${rowIndex}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [newRowArr] }
  });

  const rangIndexCol = header.findIndex(h => String(h).trim() === 'RangIndex');
  if (rangIndexCol !== -1) await sortByColumn(rangIndexCol);
}

// --- Új sor hozzáadása ---
export async function addRow(newRowObj) {
  const sheets = await getSheetsClient();
  const header = await getHeader();
  if (header.length === 0) throw new Error('Üres fejléc');

  const allRows = await getAllRows();
  const nextRowIndex = (allRows?.length ?? 0) + 1;

  const newRowArr = header.map((rawKey, i) => {
    const key = String(rawKey).trim();
    if (i === 0) return '=SOR()-1';
    if (i === 3) return `=HA(B${nextRowIndex}="";IFNA(FKERES(C${nextRowIndex};HELPER!$A:$B;2;HAMIS);"");IFNA(FKERES(C${nextRowIndex};HELPER!$A:$B;2;HAMIS);""))`;
    if (key === 'RangIndex') return getRangIndex(newRowObj['Rendfokozat'] ?? '');
    return newRowObj[key] ?? '';
  });

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A1:1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [newRowArr] }
  });

  const rangIndexCol = header.findIndex(h => String(h).trim() === 'RangIndex');
  if (rangIndexCol !== -1) await sortByColumn(rangIndexCol);
}
