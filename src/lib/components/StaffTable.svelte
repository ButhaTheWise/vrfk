<script>
  import { createEventDispatcher } from 'svelte';
  import TableCore from './TableCore.svelte'; // fontos: relatív import!
  import { mapHeaderRow, mapDataRows, sortRecords } from '$lib/utils/helpers.js';

  // Régi API (mátrix): [header, ...rows]
  export let data = [];
  // string | string[] | { role?, roles? } | teljes user objektum
  export let userRole = null;
  // debug: ha true, mindig látszik az akció oszlop
  export let forceActions = false;

  const dispatch = createEventDispatcher();

  // mátrix -> objektumok
  $: header  = mapHeaderRow(data);
  $: indexed = mapDataRows(data, header);

  // Oszlopok — használd pontosan a Sheet header kulcsait!
  const baseColumns = [
    { key: '#', label: '#', width: '40px', align: 'center' },
    { key: 'Név', label: 'Név', width: '180px', align: 'left' },
    { key: 'Rendfokozat', label: 'Rendfokozat', width: '160px', align: 'left' },
    { key: 'Beosztás', label: 'Beosztás', width: '130px', align: 'center' },
    { key: 'Osztály', label: 'Osztály', width: '130px', align: 'center' },
    { key: 'Egységszám', label: 'Egységszám', width: '90px', align: 'center' },
    { key: 'Telefonszám', label: 'Telefon', width: '120px', align: 'center' },
    { key: 'Csatlakozás', label: 'Csatlakozás', width: '100px', align: 'center' },
    { key: 'Előléptetve', label: 'Előléptetve', width: '100px', align: 'center' },
    { key: 'Aktivitás', label: 'Státusz', width: '110px', align: 'center' },
    { key: 'Inaktivitás kezdete', label: 'Inaktívóta', width: '110px', align: 'center' },
    { key: 'Helikopteres Vizsga', label: 'Heli V.', width: '100px', align: 'center' },
    { key: 'discord ID', label: 'Discord ID', width: '170px', align: 'center' }
  ];

  // szerepkör normalizálás
  function toRoleList(input) {
    if (!input) return [];
    if (typeof input === 'object' && !Array.isArray(input)) {
      const out = [];
      if (input.role) out.push(input.role);
      if (input.roles) out.push(...(Array.isArray(input.roles) ? input.roles : [input.roles]));
      return out.map(String);
    }
    if (Array.isArray(input)) return input.map(String);
    return [String(input)];
  }
  $: roleList = toRoleList(userRole).map(s => s.toLowerCase().trim());
  $: canEditByRole = roleList.some(r =>
    r === 'admin' || r === 'hr' || r.includes('admin') || r.includes('hr') || r.includes('human resources')
  );
  $: canEdit = forceActions || canEditByRole;

  // akció oszlop csak jogosultnak
  $: columns = canEdit
    ? [...baseColumns, { key: '__actions', label: '', width: '80px', align: 'center' }]
    : baseColumns;

  // rendezés
  let sortKey = 'Rendfokozat';
  let sortAsc = false;
  function onSort(e) {
    const key = e.detail;
    if (sortKey === key) sortAsc = !sortAsc; else { sortKey = key; sortAsc = false; }
  }
  $: records = sortRecords(indexed, sortKey, sortAsc);
</script>

<TableCore
  {columns}
  {records}
  {sortKey}
  {sortAsc}
  on:sort={onSort}
  on:edit={(e) => dispatch('edit', e.detail)}
  on:delete={(e) => dispatch('delete', e.detail)}
/>
