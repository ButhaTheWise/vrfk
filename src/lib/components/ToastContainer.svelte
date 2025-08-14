<script>
  import { toasts } from '$lib/stores/toast.js';
  import { fly, fade } from 'svelte/transition';

  function dismiss(id) {
    toasts.update(all => all.filter(t => t.id !== id));
  }
</script>

<div class="fixed bottom-4 left-4 z-[9999] flex flex-col gap-2"
     role="status" aria-live="polite">
  {#each $toasts.slice(-4) as t (t.id)}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="group relative max-w-sm rounded-lg px-4 py-2 shadow-lg text-white
             backdrop-blur-sm border border-white/10"
      class:bg-green-600={t.type === 'success'}
      class:bg-red-600={t.type === 'error'}
      class:bg-yellow-700={t.type === 'info'}
      in:fly={{ x: -200, duration: 200 }}
      out:fade={{ duration: 150 }}
      on:click={() => dismiss(t.id)}
      title="Kattints a bezáráshoz"
    >
      <div class="pr-6">{t.message}</div>

      <!-- Bezáró gomb -->
      <button
        class="absolute right-1 top-1 rounded px-1 text-white/80 hover:text-white
               focus:outline-none"
        aria-label="Toast bezárása"
        on:click|stopPropagation={() => dismiss(t.id)}
      >×</button>

      <!-- Progress csík (3s példa) -->
      <div class="absolute left-0 bottom-0 h-0.5 w-full bg-black/20 overflow-hidden">
        <div class="h-full bg-white/70 animate-progress"></div>
      </div>
    </div>
  {/each}
</div>

<style>
  @keyframes progress {
    from { transform: translateX(0); }
    to   { transform: translateX(-100%); }
  }
  .animate-progress {
    animation: progress 3s linear forwards;
  }
</style>
