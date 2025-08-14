<script>
  import { createEventDispatcher } from 'svelte';
  import RankImage from '$lib/components/RankImage.svelte';
  import { formatDate, copyToClipboard } from '$lib/utils/helpers.js';

  export let columns = [];
  export let records = [];
  export let sortKey = '';
  export let sortAsc = false;

  const dispatch = createEventDispatcher();
  const emit = (name, detail) => dispatch(name, detail);

  function handleSort(key)   { emit('sort', key); }
  function handleEdit(row)   { emit('edit', row); }
  function handleDelete(row) { emit('delete', row); }
</script>

<table class="w-full min-w-[1100px] table-fixed border-separate border-spacing-0">
  <thead>
    <tr>
      {#each columns as col}
        <th
          class="sticky top-0 z-10 select-none border-y border-blue-700 bg-blue-700 px-4 py-3 font-semibold uppercase text-white"
          style="width:{col.width};text-align:{col.align || 'left'}"
          on:click={() => handleSort(col.key)}
        >
          <span class="flex items-center gap-1" style="justify-content:{col.align === 'center' ? 'center' : 'flex-start'};">
            {col.label}
            {#if sortKey === col.key}
              <svg class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                {#if sortAsc}
                  <path d="M7 10l5 5 5-5H7z"></path>
                {:else}
                  <path d="M7 15l5-5 5 5H7z"></path>
                {/if}
              </svg>
            {/if}
          </span>
        </th>
      {/each}
    </tr>
  </thead>

  <tbody>
    {#if records.length > 0}
      {#each records as row}
        <tr class="transition odd:bg-neutral-900 even:bg-neutral-950 hover:bg-blue-900/40">
          {#each columns as col}
            {#if col.key === 'Rendfokozat'}
              <td class="whitespace-nowrap px-4 py-2 text-left align-middle">
                <div class="flex items-center gap-2">
                  <RankImage rang={row['Rendfokozat']} />
                  <span class="font-semibold">{row['Rendfokozat']}</span>
                </div>
              </td>

            {:else if col.key === 'Név'}
              <td class="px-4 py-2 text-left">{row[col.key]}</td>

            {:else if col.key === 'Aktivitás'}
              <td class="px-4 py-2 text-center">
                {#if row[col.key]?.trim().toLowerCase() === 'aktív'}
                  <span class="inline-block rounded-full bg-green-600/90 px-3 py-1 text-xs font-semibold text-white">Aktív</span>
                {:else if row[col.key]?.trim().toLowerCase() === 'inaktív'}
                  <span class="inline-block rounded-full bg-red-600/90 px-3 py-1 text-xs font-semibold text-white">Inaktív</span>
                {:else}
                  <span class="text-xs text-gray-500">{row[col.key]}</span>
                {/if}
              </td>

            {:else if col.key === 'Csatlakozás' || col.key === 'Előléptetve' || col.key === 'Inaktivitás kezdete'}
              <td class="px-4 py-2 text-center">{formatDate(row[col.key])}</td>

            {:else if col.key === 'Telefonszám' || col.key === 'discord ID'}
              <td class="group relative cursor-pointer whitespace-nowrap px-4 py-2 text-center" on:click={() => copyToClipboard(row[col.key])}>
                <span>{row[col.key]}</span>
                <span class="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-black/90 px-2 py-1 text-xs text-white opacity-0 shadow transition group-hover:opacity-100">
                  Másolás!
                </span>
              </td>

            {:else if col.key === '__actions'}
              <td class="px-2 py-2 text-center">
                <div class="flex justify-center gap-3">
                  <!-- svelte-ignore a11y_consider_explicit_label -->
                  <button title="Módosítás" class="inline-flex items-center justify-center rounded-full bg-blue-700 p-1 transition hover:bg-blue-600" on:click={() => handleEdit(row)}>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.364-6.364a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L5 11.828a2 2 0 010-2.828l6.364-6.364z" />
                    </svg>
                  </button>
                  <!-- svelte-ignore a11y_consider_explicit_label -->
                  <button title="Törlés" class="inline-flex items-center justify-center rounded-full bg-red-700 p-1 transition hover:bg-red-600" on:click={() => handleDelete(row)}>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-6 0h6" />
                    </svg>
                  </button>
                </div>
              </td>

            {:else}
              <td
                class="px-4 py-2"
                class:text-left={col.align === 'left'}
                class:text-center={col.align === 'center' || !col.align}
                class:text-right={col.align === 'right'}
              >
                {row[col.key]}
              </td>
            {/if}
          {/each}
        </tr>
      {/each}
    {:else}
      <tr>
        <td colspan={columns.length} class="py-10 text-center text-gray-400">Nincs találat.</td>
      </tr>
    {/if}
  </tbody>
</table>
