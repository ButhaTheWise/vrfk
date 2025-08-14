export const rankOrder = [
  'Akadémista','Őrmester','Törzsőrmester','Főtörzsőrmester','Zászlós','Törzszászlós','Főtörzszászlós',
  'Hadnagy','Főhadnagy','Százados','Őrnagy','Alezredes','Ezredes','Dandártábornok','Vezérőrnagy','Altábornagy'
];
export const rankOrderIndex = Object.fromEntries(rankOrder.map((r, i) => [r.toLowerCase(), i]));

export function normalizeDate(v) {
  if (!v) return '';
  return typeof v === 'string' ? v.slice(0, 10) : v;
}
export function toTime(v) {
  if (!v) return 0;
  const s = normalizeDate(v);
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : 0;
}
export function formatDate(date) { return normalizeDate(date); }

export function copyToClipboard(val) {
  if (!val) return;
  if (typeof navigator === 'undefined' || !navigator?.clipboard) return;
  navigator.clipboard.writeText(val).catch(() => {});
}

export function sortRecords(data, sortKey, sortAsc) {
  if (!sortKey) return data;
  const arr = [...data];
  if (sortKey === 'Rendfokozat') {
    return arr.sort((a,b) => {
      const ai = rankOrderIndex[a['Rendfokozat']?.toLowerCase() ?? ''] ?? -1;
      const bi = rankOrderIndex[b['Rendfokozat']?.toLowerCase() ?? ''] ?? -1;
      return sortAsc ? ai - bi : bi - ai;
    });
  }
  if (sortKey === '#' || sortKey === 'Egységszám') {
    return arr.sort((a,b) => {
      const av = Number(a[sortKey]) || 0;
      const bv = Number(b[sortKey]) || 0;
      return sortAsc ? av - bv : bv - av;
    });
  }
  if (['Csatlakozás','Előléptetve','Inaktivitás kezdete'].includes(sortKey)) {
    return arr.sort((a,b) => {
      const at = toTime(a[sortKey]);
      const bt = toTime(b[sortKey]);
      return sortAsc ? at - bt : bt - at;
    });
  }
  return arr.sort((a,b) => {
    const av = (a[sortKey] ?? '').toString().toLowerCase();
    const bv = (b[sortKey] ?? '').toString().toLowerCase();
    return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
  });
}

export function mapHeaderRow(data) {
  return (data?.[0] ?? []).filter(Boolean);
}

export function mapDataRows(data, header) {
  return data
    .slice(1)
    .filter((row) => row?.[1]?.toString().trim())
    .map((row) => {
      let src = [...row];
      if (src.length === header.length + 1) {
        src.splice(3, 1); // gyakori extra oszlop, ha előfordul
      }
      const entry = Object.fromEntries(header.map((k,i) => [k, src[i]]));
      return { '#': row[0], ...entry };
    });
}