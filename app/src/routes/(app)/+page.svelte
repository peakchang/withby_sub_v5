<script>
    import { onMount } from "svelte";
    import PageOld from "$lib/components/PageOld.svelte";
    import PageNew from "$lib/components/PageNew.svelte";

    let { data } = $props();

    let siteData = $derived(data.subView);

</script>

{#if siteData.ld_view_type == "old"}
    <PageOld {siteData}></PageOld>
{:else}
    <PageNew {siteData}></PageNew>
{/if}
