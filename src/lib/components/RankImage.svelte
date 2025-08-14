<script>
    export let rang = '';

    function getRankSrc(rang) {
        if (!rang || typeof rang !== 'string') return '';
        let alapnev = rang
            .replace(/[Áá]/g, 'a').replace(/[Éé]/g, 'e').replace(/[Íí]/g, 'i')
            .replace(/[ÓóÖöŐő]/g, 'o').replace(/[ÚúÜüŰű]/g, 'u')
            .replace(/ /g, '').toLowerCase();
        return `/rendfokozatok/${alapnev}.jpeg`;
    }

    // feltétel: csak akkor jelenjen meg, ha NEM akadémista és van rang
    $: showImage = !!rang && !rang.toLowerCase().includes('akadémista');
</script>

{#if showImage}
    <img
        src={getRankSrc(rang)}
        alt={rang}
        class="inline h-6 w-auto rounded shadow"
        style="min-width: 32px; max-width: 40px;"
        data-nev={rang?.toLowerCase() || ''}
        on:error="{e => e.target.style.display = 'none'}"
    />
{:else}
    <span style="display:inline-block; min-width:32px; max-width:40px; height:24px;"></span>
{/if}
