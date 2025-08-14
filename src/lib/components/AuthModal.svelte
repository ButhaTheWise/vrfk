<script>
  import { createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';
  import { fetchUser } from '$lib/stores/user.js';
  import { showToast } from '$lib/stores/toast.js';

  export let show = false;
  let tab = 'login';
  let username = '';
  let password = '';
  let password2 = ''; // Új mező
  let role = 'user';
  let error = '';
  let loading = false;
  const dispatch = createEventDispatcher();

  function open() {
    show = true;
    error = '';
    loading = false;
  }
  function close() {
    show = false;
    error = '';
    loading = false;
    dispatch('close');
  }

  async function handleLogin() {
  error = '';
  loading = true;

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  loading = false;

  if (!res.ok || data?.success === false) {
    showToast(error, 'error');
    return;
  }

  if (data.success) {
    await fetchUser();
    dispatch('login');
    close();
    goto('/');
  } else {
    showToast(error, 'error');
  }
}

async function handleRegister() {
  error = '';

  // Ellenőrzés: jelszavak egyeznek-e
  if (password !== password2) {
    error = 'A jelszavak nem egyeznek!';
    showToast(error, 'error');
    return;
  }

  loading = true;
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role })
  });
  const data = await res.json();
  loading = false;

  if (data.success) {
    await fetchUser();
    tab = 'login';
  } else {
    tab = 'register';
    showToast(error, 'error');
  }
}

</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if show}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" on:click={close}>
    <div class="bg-neutral-900 rounded-lg shadow-lg w-full max-w-md p-8 relative" on:click|stopPropagation>
      <button class="absolute top-2 right-2 text-gray-400 hover:text-white" on:click={close}>&times;</button>
      <div class="flex mb-6">
        <button class="flex-1 py-2 font-bold rounded-l-lg transition-colors"
          class:bg-blue-700={tab === 'login'} class:bg-neutral-800={tab !== 'login'}
          on:click={() => { tab = 'login'; error = ''; }}>
          Belépés
        </button>
        <button class="flex-1 py-2 font-bold rounded-r-lg transition-colors"
          class:bg-blue-700={tab === 'register'} class:bg-neutral-800={tab !== 'register'}
          on:click={() => { tab = 'register'; error = ''; }}>
          Regisztráció
        </button>
      </div>

      {#if tab === 'login'}
        <!-- Belépés -->
        <form on:submit|preventDefault={handleLogin}>
          <input class="w-full border border-gray-700 bg-neutral-800 text-white rounded px-3 py-2 mb-3" type="text" placeholder="Felhasználónév" bind:value={username} required />
          <input class="w-full border border-gray-700 bg-neutral-800 text-white rounded px-3 py-2 mb-3" type="password" placeholder="Jelszó" bind:value={password} required />
          {#if error}
            <div class="text-red-400 mb-2">{error}</div>
          {/if}
          <button class="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded" type="submit" disabled={loading}>
            {#if loading}Belépés...{:else}Belépés{/if}
          </button>
        </form>
      {:else}
        <!-- Regisztráció -->
        <form on:submit|preventDefault={handleRegister}>
          <input class="w-full border border-gray-700 bg-neutral-800 text-white rounded px-3 py-2 mb-3" type="text" placeholder="Felhasználónév" bind:value={username} required />
          <input class="w-full border border-gray-700 bg-neutral-800 text-white rounded px-3 py-2 mb-3" type="password" placeholder="Jelszó" bind:value={password} required />
          <input class="w-full border border-gray-700 bg-neutral-800 text-white rounded px-3 py-2 mb-3" type="password" placeholder="Jelszó újra" bind:value={password2} required />
          {#if error}
            <div class="text-red-400 mb-2">{error}</div>
          {/if}
          <button class="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded" type="submit" disabled={loading}>
            {#if loading}Regisztráció...{:else}Regisztráció{/if}
          </button>
        </form>
      {/if}
    </div>
  </div>
{/if}
