<script>
  import Modal from './Modal.svelte';
  import { createEventDispatcher } from 'svelte';

  export let show = false;
  export let title = 'Új rekord létrehozása';
  export let fields = [];   // [{ key, label, required?, type?, placeholder?, options? }]
  export let initial = {};  // kezdeti értékek
  export let isLoading = false;

  const dispatch = createEventDispatcher();

  let form = {};

  // csak nyitáskor töltsd be az initial-t, hogy ne írd felül gépelés közben
  let wasOpen = false;
  $: if (show && !wasOpen) {
    wasOpen = true;
    // alap állapot: minden field kulcsa jelenjen meg (üres string), majd initial ráterít
    form = Object.fromEntries(fields.map(f => [f.key, '']));
    form = { ...form, ...initial };
  }
  $: if (!show && wasOpen) {
    wasOpen = false;
  }

  function handleSubmit(e) {
    e.preventDefault();
    // egyszerű kötelező-mező ellenőrzés (kliensoldal)
    for (const f of fields) {
      if (f.required && !String(form[f.key] ?? '').trim()) {
        // fókusz a hiányzó mezőre
        const el = document.getElementById(`${f.key}-create`);
        el?.focus();
        return;
      }
    }
    dispatch('submit', { ...form });
  }

  // normalizált options: string vagy {value,label}
  const normOptions = (opts = []) =>
    opts.map(o => (typeof o === 'string' ? { value: o, label: o } : o));
</script>

<Modal {show} {title} on:close={() => dispatch('close')}>
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <fieldset class="flex flex-wrap gap-6" disabled={isLoading}>
      <div class="flex-1 min-w-[220px] space-y-4">
        {#each fields.slice(0, Math.ceil(fields.length / 2)) as field}
          <div>
            <label class="mb-1 block font-semibold" for={field.key + '-create'}>{field.label}</label>

            {#if field.options}
              <select
                class="select select-bordered w-full bg-neutral-800 border-neutral-600 text-white"
                id={field.key + '-create'}
                name={field.key}
                bind:value={form[field.key]}
                required={field.required}
              >
                <option value="" disabled hidden>Válassz…</option>
                {#each normOptions(field.options) as opt}
                  <option value={opt.value}>{opt.label}</option>
                {/each}
              </select>
            {:else}
              <input
                class="input input-bordered w-full bg-neutral-800 border-neutral-600 text-white"
                id={field.key + '-create'}
                name={field.key}
                type={field.type || 'text'}
                bind:value={form[field.key]}
                required={field.required}
                placeholder={field.placeholder}
                autocomplete="off"
              />
            {/if}
          </div>
        {/each}
      </div>

      <div class="flex-1 min-w-[220px] space-y-4">
        {#each fields.slice(Math.ceil(fields.length / 2)) as field}
          <div>
            <label class="mb-1 block font-semibold" for={field.key + '-create'}>{field.label}</label>

            {#if field.options}
              <select
                class="select select-bordered w-full bg-neutral-800 border-neutral-600 text-white"
                id={field.key + '-create'}
                name={field.key}
                bind:value={form[field.key]}
                required={field.required}
              >
                <option value="" disabled hidden>Válassz…</option>
                {#each normOptions(field.options) as opt}
                  <option value={opt.value}>{opt.label}</option>
                {/each}
              </select>
            {:else}
              <input
                class="input input-bordered w-full bg-neutral-800 border-neutral-600 text-white"
                id={field.key + '-create'}
                name={field.key}
                type={field.type || 'text'}
                bind:value={form[field.key]}
                required={field.required}
                placeholder={field.placeholder}
                autocomplete="off"
              />
            {/if}
          </div>
        {/each}
      </div>
    </fieldset>

    <div class="flex justify-end gap-2 pt-2">
      <button type="button" class="btn btn-error" on:click={() => dispatch('close')}>Mégsem</button>
      <button type="submit" class="btn btn-success" disabled={isLoading}>
        {#if isLoading}
          <span class="loading loading-spinner loading-sm mr-2"></span>
        {/if}
        Létrehozás
      </button>
    </div>
  </form>
</Modal>