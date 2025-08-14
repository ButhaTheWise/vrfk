<script>
  import { goto } from '$app/navigation';
  import { showToast } from '$lib/stores/toast.js';   // <-- toast
  import { fetchUser } from '$lib/stores/user.js';     // <-- user állapot frissítés (ha van)
  let username = '';
  let password = '';
  let error = '';
  let loading = false;
  let showPw = false;

  // védett JSON olvasó (ha nem JSON jön, a nyers szöveg alapján dob hibát)
  async function parseJSON(res) {
    const text = await res.text();
    try { return text ? JSON.parse(text) : {}; }
    catch { throw new Error(text || `${res.status} ${res.statusText}`); }
  }

  async function login() {
    if (loading) return; // dupla submit védelem
    error = '';
    loading = true;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });

      const data = await parseJSON(res);

      if (!res.ok || data?.success === false) {
        // specifikus 429 üzenet
        if (res.status === 429) {
          throw new Error(data?.error || 'Túl sok próbálkozás. Próbáld később.');
        }
        throw new Error(data?.error || 'Hibás felhasználónév vagy jelszó');
      }

      // siker
      showToast('Sikeres bejelentkezés 🎉', 'success');
      try { await fetchUser?.(); } catch {} // user store frissítése, ha használod
      goto('/');
    } catch (e) {
      error = e?.message || 'Hiba';
      showToast(error, 'error');
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white">
  <form class="bg-neutral-900 p-8 rounded shadow-md w-full max-w-sm space-y-3"
        on:submit|preventDefault={login}>
    <h2 class="text-2xl font-bold mb-3">Bejelentkezés</h2>

    <input
      class="input input-bordered w-full"
      type="text"
      placeholder="Felhasználónév"
      bind:value={username}
      autocomplete="username"
      required
    />

    <div class="relative">
      <input
        class="input input-bordered w-full pr-12"
        type={showPw ? 'text' : 'password'}
        placeholder="Jelszó"
        bind:value={password}
        autocomplete="current-password"
        required
      />
      <button
        type="button"
        class="absolute right-2 top-1/2 -translate-y-1/2 text-sm opacity-80 hover:opacity-100"
        on:click={() => (showPw = !showPw)}
        aria-label={showPw ? 'Jelszó elrejtése' : 'Jelszó megjelenítése'}
      >
        {showPw ? 'Elrejt' : 'Mutat'}
      </button>
    </div>

    {#if error}
      <div class="text-red-400 text-sm">{error}</div>
    {/if}

    <button class="btn btn-primary w-full" type="submit" disabled={loading}>
      {loading ? 'Bejelentkezés…' : 'Belépés'}
    </button>

    <div class="mt-2 text-sm text-center">
      Nincs fiókod? <a href="/register" class="text-blue-400 underline">Regisztráció</a>
    </div>
  </form>
</div>
