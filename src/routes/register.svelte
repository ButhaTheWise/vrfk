<script>
  import { goto } from '$app/navigation';
  let username = '';
  let password = '';
  let passwordConfirm = '';
  let role = 'user';
  let error = '';
  let loading = false;

  async function register() {
    error = '';

    // Ellenőrzés még elküldés előtt
    if (password !== passwordConfirm) {
      error = 'A jelszavak nem egyeznek!';
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
      goto('/login');
    } else {
      error = data.error || 'Hiba';
    }
  }
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white">
  <form class="bg-neutral-900 p-8 rounded shadow-md w-full max-w-sm" on:submit|preventDefault={register}>
    <h2 class="text-2xl font-bold mb-6">Regisztráció</h2>
    <input class="input input-bordered w-full mb-3" type="text" placeholder="Felhasználónév" bind:value={username} required />
    <input class="input input-bordered w-full mb-3" type="password" placeholder="Jelszó" bind:value={password} required />
    <input class="input input-bordered w-full mb-3" type="password" placeholder="Jelszó megerősítés" bind:value={passwordConfirm} required />

    {#if error}
      <div class="text-red-400 mb-3">{error}</div>
    {/if}

    <button class="btn btn-primary w-full" type="submit" disabled={loading}>
      {loading ? '...' : 'Regisztráció'}
    </button>

    <div class="mt-4 text-sm text-center">
      Van már fiókod? <a href="/login" class="text-blue-400 underline">Bejelentkezés</a>
    </div>
  </form>
</div>
