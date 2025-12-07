<script>
    import { fade } from "svelte/transition";
    import { toast } from "$lib/store.js";

    $: $toast["show"], setToast();

    function setToast() {
        if ($toast["show"] == true) {
            setTimeout(() => {
                $toast["show"] = false;
            }, 2000);
        }
    }
</script>

{#if $toast["show"]}
    <div class="toasts pretendard" transition:fade>
        <div class="alert alert-error text-center">
            <span class="text-white">{$toast["text"]}</span>
        </div>
    </div>
{/if}

<style>
    .toasts {
        position: fixed;
        bottom: 20px;
        right: 30px;
        z-index: 1000;
        backdrop-filter: blur(4px);
    }
</style>
