<script>
  import SearchInput from '$lib/components/SearchInput.svelte';
  import StaffTable from '$lib/components/StaffTable.svelte';
  import AuthModal from '$lib/components/AuthModal.svelte';
  import CreateModal from '$lib/components/CreateModal.svelte';
  import UpdateModal from '$lib/components/UpdateModal.svelte';
  import AdminModal from '$lib/components/AdminModal.svelte';
  import { onMount } from 'svelte';
  import { invalidateAll } from '$app/navigation';
  import { showToast } from '$lib/stores/toast.js';

  export let data;

  let kereso = '';
  let userRole = null;
  let currentUser = null;
  let authModalOpen = false;
  let adminOpen = false;

  let showCreate = false;
  let showUpdate = false;
  let selectedRow = null;
  let isSaving = false;

  async function fetchMe() {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const { user } = await res.json();
        currentUser = user ?? null;
        userRole = user?.role ?? null;
      } else {
        currentUser = null; userRole = null;
      }
    } catch {
      currentUser = null; userRole = null;
    }
  }
  onMount(fetchMe);

  const openAuth  = () => { authModalOpen = true; };
  const closeAuth = () => { authModalOpen = false; };
  const handleLogin = async () => { 
    authModalOpen = false; 
    await fetchMe(); 
    showToast('Sikeres bejelentkezés 🎉', 'success');
  };
  async function handleLogout() {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    adminOpen = false;
    await fetchMe();
    showToast('Kijelentkezve', 'info');
  }

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
  $: canEdit = toRoleList(userRole)
    .map(s => s.toLowerCase().trim())
    .some(r => r === 'admin' || r === 'hr' || r.includes('admin') || r.includes('hr'));

  $: matrix = Array.isArray(data) ? data : (data?.data ?? []);
  $: header = matrix?.[0] ?? [];
  $: rows   = matrix?.slice(1) ?? [];

  $: filteredRows = !kereso
    ? rows
    : rows.filter((row) =>
        row.some((cell) =>
          (cell ?? '').toString().toLowerCase().includes(kereso.toLowerCase())
        )
      );

  $: filtered = header.length ? [header, ...filteredRows] : [];

  const fields = [
    { key: 'Név', label: 'Név', required: true, placeholder: 'Add meg a nevet' },
    {
      key: 'Rendfokozat', label: 'Rendfokozat', required: true, placeholder: 'Pl. Őrmester',
      options: [
        'Akadémista','Őrmester','Törzsőrmester','Főtörzsőrmester','Zászlós',
        'Törzszászlós','Főtörzszászlós','Hadnagy','Főhadnagy','Százados',
        'Őrnagy','Alezredes','Ezredes','Dandártábornok','Vezérőrnagy','Altábornagy'
      ]
    },
    { key: 'Beosztás', label: 'Beosztás', required: false, options: ['Vezérkar', 'Vezérkar helyettes', 'Osztályvezető', 'Ov. helyettes', 'Járőr'] },
    { key: 'Osztályok', label: 'Osztályok', required: false, options: ['HR', 'Nyomozó', 'Helyszínelő', 'Kiképző', 'BKO'] },
    { key: 'Egységszám', label: 'Egységszám', required: false },
    { key: 'Telefonszám', label: 'Telefonszám', required: false },
    { key: 'discord ID', label: 'Discord ID', required: false },
    { key: 'Csatlakozás', label: 'Csatlakozás', required: false, type: 'date' },
    { key: 'Előléptetve', label: 'Előléptetve', required: false, type: 'date' },
    { key: 'Aktivitás', label: 'Aktivitás', required: false, options: ['Aktív', 'Inaktív'] },
    { key: 'Inaktivitás kezdete', label: 'Inaktivitás kezdete', required: false, type: 'date' },
    { key: 'Helikopteres Vizsga', label: 'Helikopteres Vizsga', required: false, options: ['Van', 'Nincs'] }
  ];
  const emptyInitial = Object.fromEntries(fields.map(f => [f.key, '']));

  async function parseJSON(res) {
    const text = await res.text();
    try { return text ? JSON.parse(text) : {}; }
    catch { throw new Error(text || `${res.status} ${res.statusText}`); }
  }

  async function handleCreate(e) {
    isSaving = true;
    try {
      const payload = e.detail;
      const form = new FormData();
      for (const [k, v] of Object.entries(payload)) {
        if (header.includes(k)) form.append(k, v ?? '');
      }
      const res = await fetch('?/add', { method: 'POST', body: form });
      const json = await parseJSON(res);
      if (!res.ok || json?.success === false) throw new Error(json?.error || 'Sikertelen felvétel');
      showToast('Rekord létrehozva ✅', 'success');
      showCreate = false;
      await invalidateAll();
    } catch (err) {
      showToast('Hiba felvétel közben: ' + (err?.message || 'Ismeretlen hiba'), 'error');
    } finally { isSaving = false; }
  }

  function openEdit(e) {
    const row = e?.detail ?? null;
    if (!row) return;
    selectedRow = { ...row };
    showUpdate = true;
  }

  async function handleUpdate(e) {
    if (!selectedRow) return;
    isSaving = true;
    try {
      const payload = e.detail;
      const form = new FormData();
      form.append('id', String(selectedRow['#']));
      for (const [k, v] of Object.entries(payload)) {
        if (k !== 'id') form.append(k, v ?? '');
      }
      const res = await fetch('?/update', { method: 'POST', body: form });
      const json = await parseJSON(res);
      if (!res.ok || json?.success === false) throw new Error(json?.error || 'Sikertelen módosítás');
      showToast('Rekord frissítve ✨', 'success');
      showUpdate = false; selectedRow = null;
      await invalidateAll();
    } catch (err) {
      showToast('Hiba a módosítás során: ' + (err?.message || 'Ismeretlen hiba'), 'error');
    } finally { isSaving = false; }
  }

  async function handleDelete(e) {
    const row = e.detail;
    if (typeof window !== 'undefined') {
      if (!confirm(`Biztosan törlöd: ${row['Név']}?`)) return;
    }
    try {
      const form = new FormData();
      form.append('id', String(row['#']));
      const res = await fetch('?/delete', { method: 'POST', body: form });
      const json = await parseJSON(res);
      if (!res.ok || json?.success === false) throw new Error(json?.error || 'Sikertelen törlés');
      showToast('Rekord törölve 🗑️', 'success');
      await invalidateAll();
    } catch (err) {
      showToast('Hiba törlés közben: ' + (err?.message || 'Ismeretlen hiba'), 'error');
    }
  }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      if (authModalOpen) authModalOpen = false;
      if (showCreate) showCreate = false;
      if (showUpdate) { showUpdate = false; selectedRow = null; }
      if (adminOpen) adminOpen = false;
    }
  }
</script>

<svelte:window on:keydown={onKeydown} />

<div class="m-0 flex h-screen w-screen flex-col bg-neutral-950 text-white">
  <header class="w-full px-4 py-4">
    <div class="flex w-full items-center gap-4">
      <h1 class="text-3xl font-extrabold tracking-tight">Állománytábla</h1>

      <div class="flex-1 flex items-center justify-center gap-3">
        <SearchInput bind:value={kereso} placeholder="Keresés…" />
        <span class="text-xs font-semibold text-blue-300">{filteredRows.length} találat</span>
      </div>

      <div class="flex items-center gap-3">
        {#if canEdit}
          <button class="flex items-center gap-2 rounded-full border border-blue-900 bg-gradient-to-r from-blue-700 to-blue-600 px-4 py-2 font-semibold shadow-lg transition hover:from-blue-800 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  on:click={() => showCreate = true}
                  title="Új felvétel">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Felvétel
          </button>
        {/if}

        {#if currentUser?.role === 'admin'}
          <button class="flex items-center gap-2 rounded-full border border-amber-900 bg-gradient-to-r from-amber-700 to-amber-600 px-4 py-2 font-semibold shadow-lg transition hover:from-amber-800 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  on:click={() => adminOpen = true}
                  title="Admin panel">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3l7 4v5c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V7l7-4z"/>
            </svg>
            Admin
          </button>
        {/if}

        {#if currentUser}
          <button class="flex items-center gap-2 rounded-full border border-neutral-900 bg-gradient-to-r from-neutral-800 to-neutral-700 px-4 py-2 font-semibold shadow-lg transition hover:from-neutral-900 hover:to-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-400"
                  on:click={handleLogout}
                  title="Kijelentkezés">
            <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 16v1a4 4 0 01-8 0v-1" />
            </svg>
            <span>Kijelentkezés</span>
            <span class="ml-2 rounded-full bg-red-700 px-2 py-1 text-xs font-bold">{currentUser.username}</span>
          </button>
        {:else}
          <button class="flex items-center gap-2 rounded-full border border-blue-900 bg-gradient-to-r from-blue-700 to-blue-600 px-4 py-2 font-semibold shadow-lg transition hover:from-blue-800 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  on:click={openAuth}
                  title="Bejelentkezés / Regisztráció">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M12 5v14" />
            </svg>
            Bejelentkezés / Regisztráció
          </button>
          {#if authModalOpen}
            <AuthModal show={authModalOpen} on:close={closeAuth} on:login={handleLogin} />
          {/if}
        {/if}
      </div>
    </div>
  </header>

  <main class="flex-1 min-h-0 overflow-auto px-2">
    <StaffTable
      data={filtered}
      userRole={userRole}
      on:edit={openEdit}
      on:delete={handleDelete}
    />
  </main>
</div>

{#if showCreate}
  <CreateModal
    show={showCreate}
    title="Új alkalmazott"
    {fields}
    initial={emptyInitial}
    isLoading={isSaving}
    on:close={() => showCreate = false}
    on:submit={handleCreate}
  />
{/if}

{#if showUpdate}
  <UpdateModal
    show={showUpdate}
    title={selectedRow ? `Szerkesztés: ${selectedRow['Név']}` : 'Szerkesztés'}
    {fields}
    initial={selectedRow ?? {}}
    isLoading={isSaving}
    on:close={() => { showUpdate = false; selectedRow = null; }}
    on:submit={handleUpdate}
  />
{/if}

{#if currentUser?.role === 'admin'}
  <AdminModal
    show={adminOpen}
    on:close={() => (adminOpen = false)}
    on:changed={() => invalidateAll()}
  />
{/if}