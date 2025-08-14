  <script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  export let show = false;
  export let title = '';
  export let onClose = () => {};

  const dispatch = createEventDispatcher();
  let modalRef;
  let previouslyFocused;
  let cleanup;

  function close() {
    onClose();
    dispatch('close');
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
    // Focus trap
    if (e.key === 'Tab' && show && modalRef) {
      const focusable = modalRef.querySelectorAll('a, button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    }
  }

  // SSR-safe: only client-side
  onMount(() => {
    if (show) {
      previouslyFocused = document.activeElement;
      setTimeout(() => modalRef?.focus?.(), 0);
    }
    window.addEventListener('keydown', handleKeydown);
    cleanup = () => {
      window.removeEventListener('keydown', handleKeydown);
      previouslyFocused?.focus?.();
    };
    return cleanup;
  });
  
  onDestroy(() => {
    cleanup?.();
  });
</script>

{#if show}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in" aria-modal="true" role="dialog" tabindex="-1">
    <div class="absolute inset-0" on:click={close} aria-hidden="true"></div>
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="relative bg-neutral-900 rounded-lg shadow-lg max-w-lg w-full mx-4 p-0 animate-fade-in-up outline-none"
      role="document"
      tabindex="0"
      bind:this={modalRef}
      on:click|stopPropagation
    >
      <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-700">
        <h2 class="text-xl font-bold text-white" id="modal-title">{title}</h2>
        <button type="button" class="ml-4 p-1 rounded hover:bg-neutral-800 text-neutral-300 hover:text-white transition" aria-label="Bezárás" on:click={close}>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div class="px-6 py-4">
        <slot />
      </div>
    </div>
  </div>
{/if}

<style>
  .animate-fade-in {
    animation: fadeIn 0.18s cubic-bezier(.4,0,.2,1);
  }
  .animate-fade-in-up {
    animation: fadeInUp 0.23s cubic-bezier(.4,0,.2,1);
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(32px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
