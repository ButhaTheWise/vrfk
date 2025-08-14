<script>
  import { createEventDispatcher } from 'svelte';
  import { showToast } from '$lib/stores/toast.js';

  export let show = false;

  const dispatch = createEventDispatcher();
  let loading = false;
  let error = '';
  let users = [];

  // védett JSON olvasó: ha nem JSON jön, a nyers szöveg alapján dob hibát
  async function apiJSON(url, init) {
    const res = await fetch(url, init);
    const text = await res.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; }
    catch { throw new Error(text || `${res.status} ${res.statusText}`); }
    if (!res.ok || data?.success === false) {
      throw new Error(data?.error || `${res.status} ${res.statusText}`);
    }
    return data;
  }

  // Csak nyitáskor töltsön (és minden újranyitáskor)
  let wasOpen = false;
  $: if (show && !wasOpen) {
    wasOpen = true;
    loadUsers();
  }
  $: if (!show && wasOpen) {
    wasOpen = false;
  }

  async function loadUsers() {
    loading = true;
    error = '';
    try {
      const data = await apiJSON('/api/admin/users');
      users = data.users ?? [];
    } catch (e) {
      error = e.message;
      showToast(error, 'error');
    } finally {
      loading = false;
    }
  }

  async function setRole(id, role) {
    try {
      await apiJSON(`/api/admin/users/${id}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      showToast('Szerepkör sikeresen frissítve!', 'success');
      await loadUsers();
      dispatch('changed');
    } catch (e) {
      showToast(e.message || 'Sikertelen mentés', 'error');
    }
  }

  async function removeUser(id, username) {
    if (!confirm(`Biztosan törlöd: ${username}?`)) return;
    try {
      await apiJSON(`/api/admin/users/${id}`, { method: 'DELETE' });
      showToast('Felhasználó törölve', 'success');
      await loadUsers();
      dispatch('changed');
    } catch (e) {
      showToast(e.message || 'Sikertelen törlés', 'error');
    }
  }

  function close() {
    show = false;
    dispatch('close');
  }

  const ROLES = ['user', 'admin'];
</script>

<!-- svelte-ignore a11y_interactive_supports_focus -->
{#if show}
  <!-- háttér -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    on:click={close}
    aria-modal="true"
    role="dialog"
  >
    <!-- doboz -->
    <div class="mx-4 w-full max-w-4xl rounded-xl bg-neutral-900 shadow-xl" on:click|stopPropagation>
      <div class="flex items-center justify-between border-b border-neutral-800 p-4">
        <h2 class="text-lg font-semibold">Admin panel – Felhasználók</h2>
        <button class="btn btn-xs" on:click={close}>X</button>
      </div>

      <div class="space-y-4 p-4">
        {#if error}
          <div class="alert alert-error">{error}</div>
        {/if}

        {#if loading}
          <div class="text-sm opacity-80">Betöltés…</div>
        {:else}
          <div class="overflow-auto rounded-lg border border-neutral-800">
            <table class="w-full text-sm">
              <thead class="sticky top-0 bg-neutral-800">
                <tr>
                  <th class="p-2 text-left">ID</th>
                  <th class="p-2 text-left">Felhasználónév</th>
                  <th class="p-2 text-left">Szerep</th>
                  <th class="p-2 text-left">Létrehozva</th>
                  <th class="p-2 text-right">Művelet</th>
                </tr>
              </thead>
              <tbody>
                {#each users as u}
                  <tr class="border-t border-neutral-800">
                    <td class="p-2">{u.id}</td>
                    <td class="p-2">{u.username}</td>
                    <td class="p-2">
                      <select
                        class="select select-sm select-bordered w-40
                               bg-neutral-800 text-neutral-100 border-neutral-600
                               focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                        bind:value={u.role}
                        on:change={(e) => setRole(u.id, e.currentTarget.value)}
                      >
                        {#each ROLES as r}
                          <option value={r}>{r}</option>
                        {/each}
                      </select>
                    </td>
                    <td class="p-2">{new Date(u.createdAt).toLocaleString()}</td>
                    <td class="p-2 text-right">
                      <button
                        class="btn btn-xs bg-red-500 hover:bg-red-600"
                        on:click={() => removeUser(u.id, u.username)}
                        title="Törlés"
                      >🗑️</button>
                    </td>
                  </tr>
                {/each}
                {#if users.length === 0}
                  <tr>
                    <td colspan="5" class="p-4 text-center opacity-70">Nincs felhasználó.</td>
                  </tr>
                {/if}
              </tbody>
            </table>
          </div>
        {/if}
      </div>

      <div class="border-t border-neutral-800 p-4 text-right">
        <button class="btn btn-primary" on:click={close}>Bezár</button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* DaisyUI select-sm néha túl lapos táblában – emeljük meg kicsit */
  :global(.select.select-sm) {
    min-height: 2rem;
    height: 2rem;
    line-height: 2rem;
    padding-top: 0;
    padding-bottom: 0;
  }
</style>
