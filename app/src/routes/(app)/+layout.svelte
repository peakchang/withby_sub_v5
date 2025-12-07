<script>
    import { onMount } from "svelte";
    import LayoutOld from "$lib/components/LayoutOld.svelte";
    import OldForm from "$lib/components/OldForm.svelte";

    import LayoutNew from "$lib/components/LayoutNew.svelte";

    import { back_api, back_api_origin } from "$lib/const";

    import Cookies from "js-cookie";
    import axios from "axios";

    let { data, children } = $props();

    let siteData = $derived(data.subView);

    let mainPageMarginTop = $state(0);
    let screenWidth = $state(0);

    // 팝업은 그냥 나오게 하기!!!
    let showPopup = $state(false);

    // 방문 기록은 공통으로 나오게 하기!!
    onMount(async () => {
        const getVisitedCookie = Cookies.get("topby_visited");
        const referrer = document.referrer;
        if (!getVisitedCookie) {
            const res = await axios.post(`${back_api}/update_visit_count`, {
                ld_id: siteData["ld_id"],
                ld_domain: siteData["ld_domain"],
                ld_visit_count: siteData["ld_visit_count"],
                referrer,
            });

            Cookies.set("topby_visited", "ok", { expires: 1 });
        }
    });

    function closePopup() {
        Cookies.set("popup_close", "ok", { expires: 1 });
        showPopup = false;
    }

    // LayoutNew 컴포넌트에서 전달 받아 헤더 부분의 높이로 아래 요소에 margin을 보이게 만들기!!
    function mainPageMarginSet(e) {
        mainPageMarginTop = e.mainPageMarginTop;
        screenWidth = e.screenWidth;
    }
</script>

<!-- 공통!! (팝업) -->
<!-- svelte-ignore a11y_consider_explicit_label -->
<!-- svelte-ignore event_directive_deprecated -->
{#if siteData.ld_popup_img && showPopup}
    <div
        class="fixed border left-5 md:left-56 top-44 z-99 max-w-[450px] w-2/3 bg-white suit-font"
    >
        <div class="p-1 text-xs flex justify-end items-center gap-2">
            <span>24시간 동안 보지 않기</span>

            <button
                class="text-lg flex justify-center items-center"
                on:click={closePopup}
            >
                <i class="fa fa-times" aria-hidden="true"></i>
            </button>
        </div>
        <img
            src={siteData["ld_popup_img"].includes("http")
                ? siteData["ld_popup_img"]
                : `${back_api_origin}${siteData["ld_popup_img"]}`}
            alt=""
        />
    </div>
{/if}

{#if siteData.ld_view_type == "old"}
    <LayoutOld {siteData}></LayoutOld>
    <div class="mt-40 md:mt-48 max-w-[960px] mx-auto">
        {@render children()}
    </div>
    <OldForm {siteData}></OldForm>
{:else}
    <LayoutNew {siteData} {mainPageMarginSet}></LayoutNew>

    <div
        class="mx-auto"
        style="margin-top: {mainPageMarginTop + 10}px; max-width:{screenWidth};"
    >
        {@render children()}
    </div>
{/if}

<div
    class="max-w-[860px] mx-auto mb-16 md:mb-0 md:flex md:justify-center md:items-stretch pb-5 pt-3 mt-3 border-t px-3 pretendard"
>
    {#if siteData.ld_footer}
        {siteData.ld_footer}
    {/if}
</div>
