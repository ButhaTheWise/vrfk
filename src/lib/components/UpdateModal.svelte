<script>
  import Modal from './Modal.svelte';
  import { createEventDispatcher } from 'svelte';

  export let show = false;
  export let title = 'Rekord szerkesztése';
  export let fields = [];
  export let initial = {};
  export let isLoading = false;
  const dispatch = createEventDispatcher();

  let form = {};
  $: form = { ...initial };

  function handleInput(e, key) {
    form[key] = e.target.value;
  }

  function handleSubmit(e) {
    e.preventDefault();
    dispatch('submit', { ...form });
  }
</script>

<Modal {show} {title} on:close={() => dispatch('close')}>
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div class="flex flex-wrap gap-6">
      <div class="flex-1 min-w-[220px] space-y-4">
        {#each fields.slice(0, Math.ceil(fields.length / 2)) as field, i}
          <div>
            <label class="block mb-1 font-semibold" for={field.key + '-update'}>{field.label}</label>
            {#if field.options}
              <select
                class="select select-bordered w-full bg-neutral-800 border-neutral-600 text-white"
                id={field.key + '-update'}
                bind:value={form[field.key]}
                required={field.required}
                on:input={(e) => handleInput(e, field.key)}>
                <option value="" disabled selected hidden>Válassz...</option>
                {#each field.options as opt}
                  <option value={opt}>{opt}</option>
                {/each}
              </select>
            {:else}
              <input
                class="input input-bordered w-full bg-neutral-800 border-neutral-600 text-white"
                id={field.key + '-update'}
                type={field.type || 'text'}
                bind:value={form[field.key]}
                required={field.required}
                placeholder={field.placeholder}
                on:input={(e) => handleInput(e, field.key)}
              />
            {/if}
          </div>
        {/each}
      </div>
      <div class="flex-1 min-w-[220px] space-y-4">
        {#each fields.slice(Math.ceil(fields.length / 2)) as field, i}
          <div>
            <label class="block mb-1 font-semibold" for={field.key + '-update'}>{field.label}</label>
            {#if field.options}
              <select
                class="select select-bordered w-full bg-neutral-800 border-neutral-600 text-white"
                id={field.key + '-update'}
                bind:value={form[field.key]}
                required={field.required}
                on:input={(e) => handleInput(e, field.key)}>
                <option value="" disabled selected hidden>Válassz...</option>
                {#each field.options as opt}
                  <option value={opt}>{opt}</option>
                {/each}
              </select>
            {:else}
              <input
                class="input input-bordered w-full bg-neutral-800 border-neutral-600 text-white"
                id={field.key + '-update'}
                type={field.type || 'text'}
                bind:value={form[field.key]}
                required={field.required}
                placeholder={field.placeholder}
                on:input={(e) => handleInput(e, field.key)}
              />
            {/if}
          </div>
        {/each}
      </div>
    </div>
    <div class="flex justify-end gap-2 pt-2">
      <button type="button" class="btn btn-error" on:click={() => dispatch('close')}>Mégsem</button>
      <button type="submit" class="btn btn-success" disabled={isLoading}>
        {#if isLoading}
          <span class="loading loading-spinner loading-sm mr-2"></span>
        {/if}
        Mentés
      </button>
    </div>
  </form>
</Modal>