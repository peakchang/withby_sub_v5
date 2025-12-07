<script>
    import { onMount } from "svelte";
    import { back_api, back_api_origin } from "$lib/const";

    let { siteData } = $props();

    // 구버전 변수
    let mainImgList = $state([]);
    let dataAosList = [];
    let bannerImgList = [];
    let bannerSwiper;
    let customerName = "";
    let customerPhone = "";

    onMount(() => {
        console.log("inner page mounted!!!");

        console.log(siteData);
        if (siteData.ld_main_img) {
            mainImgList = siteData.ld_main_img.split(",");
            console.log(mainImgList);
        }
    });
</script>

{#each mainImgList as mainImg, idx}
    {#if mainImg}
        <div class="mb-5">
            {#if mainImg.includes("http")}
                <img src={mainImg} alt="" class="w-full" />
            {:else if mainImg.includes("subimg")}
                <img
                    src={`${back_api_origin}${mainImg}`}
                    alt=""
                    class="w-full"
                />
            {/if}
        </div>
    {/if}
{/each}
