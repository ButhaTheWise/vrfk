<script>
    export let value = '';
    export let onInput = () => {};
</script>

<input
    class="w-full px-3 py-2 rounded border border-gray-400 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
    type="text"
    bind:value
    placeholder="Keresés... (pl. név, rang, egységszám, ...)"
    on:input={onInput}
/>