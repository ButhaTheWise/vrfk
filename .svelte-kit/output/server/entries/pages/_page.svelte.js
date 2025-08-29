import { B as push, S as fallback, T as attr, M as push_element, P as pop_element, U as bind_props, G as pop, I as FILENAME, J as ensure_array_like, V as attr_style, W as stringify, O as escape_html, N as attr_class, X as copy_payload, Y as assign_payload } from "../../chunks/index.js";
import "../../chunks/client.js";
import { d as derived, w as writable } from "../../chunks/index2.js";
SearchInput[FILENAME] = "src/lib/components/SearchInput.svelte";
function SearchInput($$payload, $$props) {
  push(SearchInput);
  let value = fallback($$props["value"], "");
  let onInput = fallback($$props["onInput"], () => {
  });
  $$payload.out.push(`<input class="w-full px-3 py-2 rounded border border-gray-400 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-600 transition" type="text"${attr("value", value)} placeholder="Keresés... (pl. név, rang, egységszám, ...)"/>`);
  push_element($$payload, "input", 6, 0);
  pop_element();
  bind_props($$props, { value, onInput });
  pop();
}
SearchInput.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
RankImage[FILENAME] = "src/lib/components/RankImage.svelte";
function RankImage($$payload, $$props) {
  push(RankImage);
  let showImage;
  let rang = fallback($$props["rang"], "");
  function getRankSrc(rang2) {
    if (!rang2 || typeof rang2 !== "string") return "";
    let alapnev = rang2.replace(/[Áá]/g, "a").replace(/[Éé]/g, "e").replace(/[Íí]/g, "i").replace(/[ÓóÖöŐő]/g, "o").replace(/[ÚúÜüŰű]/g, "u").replace(/ /g, "").toLowerCase();
    return `/rendfokozatok/${alapnev}.jpeg`;
  }
  showImage = !!rang && !rang.toLowerCase().includes("akadémista");
  if (showImage) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<img${attr("src", getRankSrc(rang))}${attr("alt", rang)} class="inline h-6 w-auto rounded shadow" style="min-width: 32px; max-width: 40px;"${attr("data-nev", rang?.toLowerCase() || "")}/>`);
    push_element($$payload, "img", 18, 4);
    pop_element();
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<span style="display:inline-block; min-width:32px; max-width:40px; height:24px;">`);
    push_element($$payload, "span", 27, 4);
    $$payload.out.push(`</span>`);
    pop_element();
  }
  $$payload.out.push(`<!--]-->`);
  bind_props($$props, { rang });
  pop();
}
RankImage.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
const rankOrder = [
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
const rankOrderIndex = Object.fromEntries(rankOrder.map((r, i) => [r.toLowerCase(), i]));
function normalizeDate(v) {
  if (!v) return "";
  return typeof v === "string" ? v.slice(0, 10) : v;
}
function formatDate(date) {
  return normalizeDate(date);
}
function sortRecords(data, sortKey, sortAsc) {
  const arr = [...data];
  {
    return arr.sort((a, b) => {
      const ai = rankOrderIndex[a["Rendfokozat"]?.toLowerCase() ?? ""] ?? -1;
      const bi = rankOrderIndex[b["Rendfokozat"]?.toLowerCase() ?? ""] ?? -1;
      return bi - ai;
    });
  }
}
function mapHeaderRow(data) {
  return (data?.[0] ?? []).filter(Boolean);
}
function mapDataRows(data, header) {
  return data.slice(1).filter((row) => row?.[1]?.toString().trim()).map((row) => {
    let src = [...row];
    if (src.length === header.length + 1) {
      src.splice(3, 1);
    }
    const entry = Object.fromEntries(header.map((k, i) => [k, src[i]]));
    return { "#": row[0], ...entry };
  });
}
TableCore[FILENAME] = "src/lib/components/TableCore.svelte";
function TableCore($$payload, $$props) {
  push(TableCore);
  let columns = fallback($$props["columns"], () => [], true);
  let records = fallback($$props["records"], () => [], true);
  let sortKey = fallback($$props["sortKey"], "");
  let sortAsc = fallback($$props["sortAsc"], false);
  const each_array = ensure_array_like(columns);
  $$payload.out.push(`<table class="w-full min-w-[1100px] table-fixed border-separate border-spacing-0">`);
  push_element($$payload, "table", 19, 0);
  $$payload.out.push(`<thead>`);
  push_element($$payload, "thead", 20, 2);
  $$payload.out.push(`<tr>`);
  push_element($$payload, "tr", 21, 4);
  $$payload.out.push(`<!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let col = each_array[$$index];
    $$payload.out.push(`<th class="sticky top-0 z-10 select-none border-y border-blue-700 bg-blue-700 px-4 py-3 font-semibold uppercase text-white"${attr_style(`width:${stringify(col.width)};text-align:${stringify(col.align || "left")}`)}>`);
    push_element($$payload, "th", 23, 8);
    $$payload.out.push(`<span class="flex items-center gap-1"${attr_style(`justify-content:${stringify(col.align === "center" ? "center" : "flex-start")};`)}>`);
    push_element($$payload, "span", 28, 10);
    $$payload.out.push(`${escape_html(col.label)} `);
    if (sortKey === col.key) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<svg class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">`);
      push_element($$payload, "svg", 31, 14);
      if (sortAsc) {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`<path d="M7 10l5 5 5-5H7z">`);
        push_element($$payload, "path", 33, 18);
        $$payload.out.push(`</path>`);
        pop_element();
      } else {
        $$payload.out.push("<!--[!-->");
        $$payload.out.push(`<path d="M7 15l5-5 5 5H7z">`);
        push_element($$payload, "path", 35, 18);
        $$payload.out.push(`</path>`);
        pop_element();
      }
      $$payload.out.push(`<!--]--></svg>`);
      pop_element();
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--></span>`);
    pop_element();
    $$payload.out.push(`</th>`);
    pop_element();
  }
  $$payload.out.push(`<!--]--></tr>`);
  pop_element();
  $$payload.out.push(`</thead>`);
  pop_element();
  $$payload.out.push(`<tbody>`);
  push_element($$payload, "tbody", 45, 2);
  if (records.length > 0) {
    $$payload.out.push("<!--[-->");
    const each_array_1 = ensure_array_like(records);
    $$payload.out.push(`<!--[-->`);
    for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
      let row = each_array_1[$$index_2];
      const each_array_2 = ensure_array_like(columns);
      $$payload.out.push(`<tr class="transition odd:bg-neutral-900 even:bg-neutral-950 hover:bg-blue-900/40">`);
      push_element($$payload, "tr", 48, 8);
      $$payload.out.push(`<!--[-->`);
      for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
        let col = each_array_2[$$index_1];
        if (col.key === "Rendfokozat") {
          $$payload.out.push("<!--[-->");
          $$payload.out.push(`<td class="whitespace-nowrap px-4 py-2 text-left align-middle">`);
          push_element($$payload, "td", 51, 14);
          $$payload.out.push(`<div class="flex items-center gap-2">`);
          push_element($$payload, "div", 52, 16);
          RankImage($$payload, { rang: row["Rendfokozat"] });
          $$payload.out.push(`<!----> <span class="font-semibold">`);
          push_element($$payload, "span", 54, 18);
          $$payload.out.push(`${escape_html(row["Rendfokozat"])}</span>`);
          pop_element();
          $$payload.out.push(`</div>`);
          pop_element();
          $$payload.out.push(`</td>`);
          pop_element();
        } else {
          $$payload.out.push("<!--[!-->");
          if (col.key === "Név") {
            $$payload.out.push("<!--[-->");
            $$payload.out.push(`<td class="px-4 py-2 text-left">`);
            push_element($$payload, "td", 59, 14);
            $$payload.out.push(`${escape_html(row[col.key])}</td>`);
            pop_element();
          } else {
            $$payload.out.push("<!--[!-->");
            if (col.key === "Aktivitás") {
              $$payload.out.push("<!--[-->");
              $$payload.out.push(`<td class="px-4 py-2 text-center">`);
              push_element($$payload, "td", 62, 14);
              if (row[col.key]?.trim().toLowerCase() === "aktív") {
                $$payload.out.push("<!--[-->");
                $$payload.out.push(`<span class="inline-block rounded-full bg-green-600/90 px-3 py-1 text-xs font-semibold text-white">`);
                push_element($$payload, "span", 64, 18);
                $$payload.out.push(`Aktív</span>`);
                pop_element();
              } else {
                $$payload.out.push("<!--[!-->");
                if (row[col.key]?.trim().toLowerCase() === "inaktív") {
                  $$payload.out.push("<!--[-->");
                  $$payload.out.push(`<span class="inline-block rounded-full bg-red-600/90 px-3 py-1 text-xs font-semibold text-white">`);
                  push_element($$payload, "span", 66, 18);
                  $$payload.out.push(`Inaktív</span>`);
                  pop_element();
                } else {
                  $$payload.out.push("<!--[!-->");
                  $$payload.out.push(`<span class="text-xs text-gray-500">`);
                  push_element($$payload, "span", 68, 18);
                  $$payload.out.push(`${escape_html(row[col.key])}</span>`);
                  pop_element();
                }
                $$payload.out.push(`<!--]-->`);
              }
              $$payload.out.push(`<!--]--></td>`);
              pop_element();
            } else {
              $$payload.out.push("<!--[!-->");
              if (col.key === "Csatlakozás" || col.key === "Előléptetve" || col.key === "Inaktivitás kezdete") {
                $$payload.out.push("<!--[-->");
                $$payload.out.push(`<td class="px-4 py-2 text-center">`);
                push_element($$payload, "td", 73, 14);
                $$payload.out.push(`${escape_html(formatDate(row[col.key]))}</td>`);
                pop_element();
              } else {
                $$payload.out.push("<!--[!-->");
                if (col.key === "Telefonszám" || col.key === "discord ID") {
                  $$payload.out.push("<!--[-->");
                  $$payload.out.push(`<td class="group relative cursor-pointer whitespace-nowrap px-4 py-2 text-center">`);
                  push_element($$payload, "td", 76, 14);
                  $$payload.out.push(`<span>`);
                  push_element($$payload, "span", 77, 16);
                  $$payload.out.push(`${escape_html(row[col.key])}</span>`);
                  pop_element();
                  $$payload.out.push(` <span class="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-black/90 px-2 py-1 text-xs text-white opacity-0 shadow transition group-hover:opacity-100">`);
                  push_element($$payload, "span", 78, 16);
                  $$payload.out.push(`Másolás!</span>`);
                  pop_element();
                  $$payload.out.push(`</td>`);
                  pop_element();
                } else {
                  $$payload.out.push("<!--[!-->");
                  if (col.key === "__actions") {
                    $$payload.out.push("<!--[-->");
                    $$payload.out.push(`<td class="px-2 py-2 text-center">`);
                    push_element($$payload, "td", 84, 14);
                    $$payload.out.push(`<div class="flex justify-center gap-3">`);
                    push_element($$payload, "div", 85, 16);
                    $$payload.out.push(`<button title="Módosítás" class="inline-flex items-center justify-center rounded-full bg-blue-700 p-1 transition hover:bg-blue-600">`);
                    push_element($$payload, "button", 87, 18);
                    $$payload.out.push(`<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">`);
                    push_element($$payload, "svg", 88, 20);
                    $$payload.out.push(`<path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.364-6.364a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L5 11.828a2 2 0 010-2.828l6.364-6.364z">`);
                    push_element($$payload, "path", 89, 22);
                    $$payload.out.push(`</path>`);
                    pop_element();
                    $$payload.out.push(`</svg>`);
                    pop_element();
                    $$payload.out.push(`</button>`);
                    pop_element();
                    $$payload.out.push(` <button title="Törlés" class="inline-flex items-center justify-center rounded-full bg-red-700 p-1 transition hover:bg-red-600">`);
                    push_element($$payload, "button", 93, 18);
                    $$payload.out.push(`<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">`);
                    push_element($$payload, "svg", 94, 20);
                    $$payload.out.push(`<path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-6 0h6">`);
                    push_element($$payload, "path", 95, 22);
                    $$payload.out.push(`</path>`);
                    pop_element();
                    $$payload.out.push(`</svg>`);
                    pop_element();
                    $$payload.out.push(`</button>`);
                    pop_element();
                    $$payload.out.push(`</div>`);
                    pop_element();
                    $$payload.out.push(`</td>`);
                    pop_element();
                  } else {
                    $$payload.out.push("<!--[!-->");
                    $$payload.out.push(`<td${attr_class("px-4 py-2", void 0, {
                      "text-left": col.align === "left",
                      "text-center": col.align === "center" || !col.align,
                      "text-right": col.align === "right"
                    })}>`);
                    push_element($$payload, "td", 102, 14);
                    $$payload.out.push(`${escape_html(row[col.key])}</td>`);
                    pop_element();
                  }
                  $$payload.out.push(`<!--]-->`);
                }
                $$payload.out.push(`<!--]-->`);
              }
              $$payload.out.push(`<!--]-->`);
            }
            $$payload.out.push(`<!--]-->`);
          }
          $$payload.out.push(`<!--]-->`);
        }
        $$payload.out.push(`<!--]-->`);
      }
      $$payload.out.push(`<!--]--></tr>`);
      pop_element();
    }
    $$payload.out.push(`<!--]-->`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<tr>`);
    push_element($$payload, "tr", 115, 6);
    $$payload.out.push(`<td${attr("colspan", columns.length)} class="py-10 text-center text-gray-400">`);
    push_element($$payload, "td", 116, 8);
    $$payload.out.push(`Nincs találat.</td>`);
    pop_element();
    $$payload.out.push(`</tr>`);
    pop_element();
  }
  $$payload.out.push(`<!--]--></tbody>`);
  pop_element();
  $$payload.out.push(`</table>`);
  pop_element();
  bind_props($$props, { columns, records, sortKey, sortAsc });
  pop();
}
TableCore.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
StaffTable[FILENAME] = "src/lib/components/StaffTable.svelte";
function StaffTable($$payload, $$props) {
  push(StaffTable);
  let header, indexed, roleList, canEditByRole, canEdit, columns, records;
  let data = fallback($$props["data"], () => [], true);
  let userRole = fallback($$props["userRole"], null);
  let forceActions = fallback($$props["forceActions"], false);
  const baseColumns = [
    { key: "#", label: "#", width: "40px", align: "center" },
    { key: "Név", label: "Név", width: "180px", align: "left" },
    {
      key: "Rendfokozat",
      label: "Rendfokozat",
      width: "160px",
      align: "left"
    },
    {
      key: "Beosztás",
      label: "Beosztás",
      width: "130px",
      align: "center"
    },
    {
      key: "Osztály",
      label: "Osztály",
      width: "130px",
      align: "center"
    },
    {
      key: "Egységszám",
      label: "Egységszám",
      width: "90px",
      align: "center"
    },
    {
      key: "Telefonszám",
      label: "Telefon",
      width: "120px",
      align: "center"
    },
    {
      key: "Csatlakozás",
      label: "Csatlakozás",
      width: "100px",
      align: "center"
    },
    {
      key: "Előléptetve",
      label: "Előléptetve",
      width: "100px",
      align: "center"
    },
    {
      key: "Aktivitás",
      label: "Státusz",
      width: "110px",
      align: "center"
    },
    {
      key: "Inaktivitás kezdete",
      label: "Inaktívóta",
      width: "110px",
      align: "center"
    },
    {
      key: "Helikopteres Vizsga",
      label: "Heli V.",
      width: "100px",
      align: "center"
    },
    {
      key: "discord ID",
      label: "Discord ID",
      width: "170px",
      align: "center"
    }
  ];
  function toRoleList(input) {
    if (!input) return [];
    if (typeof input === "object" && !Array.isArray(input)) {
      const out = [];
      if (input.role) out.push(input.role);
      if (input.roles) out.push(...Array.isArray(input.roles) ? input.roles : [input.roles]);
      return out.map(String);
    }
    if (Array.isArray(input)) return input.map(String);
    return [String(input)];
  }
  let sortKey = "Rendfokozat";
  let sortAsc = false;
  header = mapHeaderRow(data);
  indexed = mapDataRows(data, header);
  roleList = toRoleList(userRole).map((s) => s.toLowerCase().trim());
  canEditByRole = roleList.some((r) => r === "admin" || r === "hr" || r.includes("admin") || r.includes("hr") || r.includes("human resources"));
  canEdit = forceActions || canEditByRole;
  columns = canEdit ? [
    ...baseColumns,
    { key: "__actions", label: "", width: "80px", align: "center" }
  ] : baseColumns;
  records = sortRecords(indexed);
  TableCore($$payload, { columns, records, sortKey, sortAsc });
  bind_props($$props, { data, userRole, forceActions });
  pop();
}
StaffTable.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
const user = writable(null);
derived(user, ($user) => !!$user);
derived(user, ($user) => $user?.role ?? null);
_page[FILENAME] = "src/routes/+page.svelte";
function _page($$payload, $$props) {
  push(_page);
  let canEdit, matrix, header, rows, filteredRows, filtered;
  let data = $$props["data"];
  let kereso = "";
  let userRole = null;
  function toRoleList(input) {
    return [];
  }
  const fields = [
    {
      key: "Név",
      label: "Név",
      required: true,
      placeholder: "Add meg a nevet"
    },
    {
      key: "Rendfokozat",
      label: "Rendfokozat",
      required: true,
      placeholder: "Pl. Őrmester",
      options: [
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
      ]
    },
    {
      key: "Beosztás",
      label: "Beosztás",
      required: false,
      options: [
        "Vezérkar",
        "Vezérkar helyettes",
        "Osztályvezető",
        "Ov. helyettes",
        "Járőr"
      ]
    },
    {
      key: "Osztályok",
      label: "Osztályok",
      required: false,
      options: ["HR", "Nyomozó", "Helyszínelő", "Kiképző", "BKO"]
    },
    { key: "Egységszám", label: "Egységszám", required: false },
    { key: "Telefonszám", label: "Telefonszám", required: false },
    { key: "discord ID", label: "Discord ID", required: false },
    {
      key: "Csatlakozás",
      label: "Csatlakozás",
      required: false,
      type: "date"
    },
    {
      key: "Előléptetve",
      label: "Előléptetve",
      required: false,
      type: "date"
    },
    {
      key: "Aktivitás",
      label: "Aktivitás",
      required: false,
      options: ["Aktív", "Inaktív"]
    },
    {
      key: "Inaktivitás kezdete",
      label: "Inaktivitás kezdete",
      required: false,
      type: "date"
    },
    {
      key: "Helikopteres Vizsga",
      label: "Helikopteres Vizsga",
      required: false,
      options: ["Van", "Nincs"]
    }
  ];
  Object.fromEntries(fields.map((f) => [f.key, ""]));
  canEdit = toRoleList().map((s) => s.toLowerCase().trim()).some((r) => r === "admin" || r === "hr" || r.includes("admin") || r.includes("hr"));
  matrix = Array.isArray(data) ? data : data?.data ?? [];
  header = matrix?.[0] ?? [];
  rows = matrix?.slice(1) ?? [];
  filteredRows = !kereso ? rows : rows.filter((row) => row.some((cell) => (cell ?? "").toString().toLowerCase().includes(kereso.toLowerCase())));
  filtered = header.length ? [header, ...filteredRows] : [];
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out.push(`<div class="m-0 flex h-screen w-screen flex-col bg-neutral-950 text-white">`);
    push_element($$payload2, "div", 190, 0);
    $$payload2.out.push(`<header class="w-full px-4 py-4">`);
    push_element($$payload2, "header", 191, 2);
    $$payload2.out.push(`<div class="flex w-full items-center gap-4">`);
    push_element($$payload2, "div", 192, 4);
    $$payload2.out.push(`<h1 class="text-3xl font-extrabold tracking-tight">`);
    push_element($$payload2, "h1", 193, 6);
    $$payload2.out.push(`Állománytábla</h1>`);
    pop_element();
    $$payload2.out.push(` <div class="flex-1 flex items-center justify-center gap-3">`);
    push_element($$payload2, "div", 195, 6);
    SearchInput($$payload2, {
      placeholder: "Keresés…",
      get value() {
        return kereso;
      },
      set value($$value) {
        kereso = $$value;
        $$settled = false;
      }
    });
    $$payload2.out.push(`<!----> <span class="text-xs font-semibold text-blue-300">`);
    push_element($$payload2, "span", 197, 8);
    $$payload2.out.push(`${escape_html(filteredRows.length)} találat</span>`);
    pop_element();
    $$payload2.out.push(`</div>`);
    pop_element();
    $$payload2.out.push(` <div class="flex items-center gap-3">`);
    push_element($$payload2, "div", 200, 6);
    if (canEdit) {
      $$payload2.out.push("<!--[-->");
      $$payload2.out.push(`<button class="flex items-center gap-2 rounded-full border border-blue-900 bg-gradient-to-r from-blue-700 to-blue-600 px-4 py-2 font-semibold shadow-lg transition hover:from-blue-800 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400" title="Új felvétel">`);
      push_element($$payload2, "button", 202, 10);
      $$payload2.out.push(`<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">`);
      push_element($$payload2, "svg", 205, 12);
      $$payload2.out.push(`<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4">`);
      push_element($$payload2, "path", 206, 14);
      $$payload2.out.push(`</path>`);
      pop_element();
      $$payload2.out.push(`</svg>`);
      pop_element();
      $$payload2.out.push(` Felvétel</button>`);
      pop_element();
    } else {
      $$payload2.out.push("<!--[!-->");
    }
    $$payload2.out.push(`<!--]--> `);
    {
      $$payload2.out.push("<!--[!-->");
    }
    $$payload2.out.push(`<!--]--> `);
    {
      $$payload2.out.push("<!--[!-->");
      $$payload2.out.push(`<button class="flex items-center gap-2 rounded-full border border-blue-900 bg-gradient-to-r from-blue-700 to-blue-600 px-4 py-2 font-semibold shadow-lg transition hover:from-blue-800 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400" title="Bejelentkezés / Regisztráció">`);
      push_element($$payload2, "button", 235, 10);
      $$payload2.out.push(`<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">`);
      push_element($$payload2, "svg", 238, 12);
      $$payload2.out.push(`<path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M12 5v14">`);
      push_element($$payload2, "path", 239, 14);
      $$payload2.out.push(`</path>`);
      pop_element();
      $$payload2.out.push(`</svg>`);
      pop_element();
      $$payload2.out.push(` Bejelentkezés / Regisztráció</button>`);
      pop_element();
      $$payload2.out.push(` `);
      {
        $$payload2.out.push("<!--[!-->");
      }
      $$payload2.out.push(`<!--]-->`);
    }
    $$payload2.out.push(`<!--]--></div>`);
    pop_element();
    $$payload2.out.push(`</div>`);
    pop_element();
    $$payload2.out.push(`</header>`);
    pop_element();
    $$payload2.out.push(` <main class="flex-1 min-h-0 overflow-auto px-2">`);
    push_element($$payload2, "main", 251, 2);
    StaffTable($$payload2, { data: filtered, userRole });
    $$payload2.out.push(`<!----></main>`);
    pop_element();
    $$payload2.out.push(`</div>`);
    pop_element();
    $$payload2.out.push(` `);
    {
      $$payload2.out.push("<!--[!-->");
    }
    $$payload2.out.push(`<!--]--> `);
    {
      $$payload2.out.push("<!--[!-->");
    }
    $$payload2.out.push(`<!--]--> `);
    {
      $$payload2.out.push("<!--[!-->");
    }
    $$payload2.out.push(`<!--]-->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { data });
  pop();
}
_page.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
export {
  _page as default
};
