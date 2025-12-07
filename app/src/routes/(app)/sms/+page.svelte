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

        if (!siteData["ld_sms_clickcount"]) {
            siteData["ld_sms_clickcount"] = 0;
        }

        try {
            const res = axios.post(`${back_api}/add_sms_count`, {
                ld_id: siteData["ld_id"],
                smsCount: siteData["ld_sms_clickcount"],
            });
        } catch (error) {
            console.error(error.message);
        }

        // let smsHref = "";
        let smsBody = "";
        if (siteData.ld_sms_content && siteData["ld_event_img"]) {
            // smsHref = `sms:${siteData.ld_sms_num}?body=${siteData.ld_name} ${siteData.ld_sms_content}`;
            smsBody = `${siteData.ld_name} ${siteData.ld_sms_content}`;
        } else if (siteData.ld_event_img) {
            // smsHref = `sms:${siteData.ld_sms_num}?body=${siteData.ld_name} 이벤트 참여!`;
            smsBody = `${siteData.ld_name} 이벤트 참여!`;
        }

        const smsHref = `sms:${siteData.ld_sms_num}?body=${smsBody}`;
        window.location.href = smsHref;

        setTimeout(() => {
            history.back();
        }, 1500); // 2초 후 이전 페이지로 복귀
    });
</script>

<div class="text-center">
    <span class="loading loading-spinner loading-xl my-10"></span>
</div>
