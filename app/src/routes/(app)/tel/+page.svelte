<script>
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import axios from "axios";
    import {
        back_api,
        back_api_origin,
        gcs_img,
        consentInfo,
    } from "$lib/const";

    let { data } = $props();
    let siteData = $state({});

    onMount(() => {
        siteData = data.subView;

        if (!siteData["ld_call_clickcount"]) {
            siteData["ld_call_clickcount"] = 0;
        }

        try {
            const res = axios.post(`${back_api}/add_call_count`, {
                ld_id: siteData["ld_id"],
                callCount: siteData["ld_call_clickcount"],
            });
        } catch (error) {
            console.error(error.message);
        }

        const telHref = `tel:${siteData.ld_phone_num}`;
        window.location.href = telHref;

        setTimeout(() => {
            history.back();
        }, 1500); // 2초 후 이전 페이지로 복귀
    });
</script>

<div class="text-center">
    <span class="loading loading-spinner loading-xl my-10"></span>
</div>
