<script>
    import { aosStyleList } from "$lib/const.js";
    import { customerSubmit } from "$lib/lib";
    import { back_api_origin } from "$lib/const";
    import { browser } from "$app/environment";
    import { onMount } from "svelte";

    console.log("slug 들어옴!!!!!!!!!!!");

    let { data } = $props();

    // 공통 변수
    let allSiteData = {};

    // 구버전 변수
    let imgList = [];
    let dataAosList = [];
    let customerName = "";
    let customerPhone = "";

    // 신버전 변수
    let menuData = {};
    let imgArr = [];
    let observer;
    let elementsToObserve;
    let x;

    onMount(() => {
        if (
            !allSiteData["ld_view_type"] ||
            allSiteData["ld_view_type"] == "old"
        ) {
        } else {
            if (browser) {
                elementsToObserve =
                    document.querySelectorAll(".observe-fade-up");
            }
            observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.remove("observe-hidden");
                        entry.target.classList.add("fade-up-active");
                    } else {
                        entry.target.classList.remove("fade-up-active");
                        entry.target.classList.add("observe-hidden");
                    }
                });
            });

            elementsToObserve.forEach((element) => {
                // 초기 숨김 클래스 추가
                element.classList.add("observe-hidden");
                observer.observe(element);

                // data-delay 속성이 있는 경우 CSS 변수로 전달
                const delay = element.dataset.delay;
                if (delay) {
                    element.style.setProperty("--fade-up-delay", `${delay}ms`);
                }
            });
        }
    });

    allSiteData = data.subView;
    const nowPage = data.nowPage;
    // 구버전 코드
    if (!allSiteData.ld_view_type || allSiteData.ld_view_type == "old") {
        if (allSiteData[`ld_pg${data.index}`]) {
            imgList = allSiteData[`ld_pg${data.index}`].split(",");
        } else {
            imgList = [];
        }
    } else {
        // 신버전 코드
        try {
            const getmenuData = JSON.parse(allSiteData.ld_json_menus);
            menuData = getmenuData.menus.find((item) => item.link === nowPage);

            console.log("menuData");

            console.log(menuData);

            if (menuData.imgArr && menuData.imgArr.length > 0) {
                imgArr = menuData.imgArr.map((e) => {
                    let res = "";
                    if (e.includes("youtube")) {
                        res = generateYouTubeEmbed(e);
                    } else {
                        res = e;
                    }

                    return res;
                });
                console.log(menuData);
                console.log(imgArr);
            }
        } catch (error) {
            console.error("JSON 파싱 오류:", error);
        }
    }

    // $: x, set_x();
    // function set_x() {
    //     // setEmodelRatio();
    // }

    function changTab() {
        console.log(this.value);

        // 일단 tab-active 클래스 다 없애기
        if (browser) {
            const tabList = document.querySelectorAll(".tab");
            const contentList = document.querySelectorAll(".emodel-area");

            for (let i = 0; i < tabList.length; i++) {
                const element = tabList[i];
                element.classList.remove("tab-active");
            }

            for (let i = 0; i < contentList.length; i++) {
                contentList[i].classList.add("hidden");
            }
            for (let i = 0; i < contentList.length; i++) {
                if (i == this.value) {
                    contentList[i].classList.remove("hidden");
                }
            }
        }
        this.classList.add("tab-active");
    }

    // 썸네일에서 유튜브 아이디 뽑아내기!
    function generateYouTubeEmbed(imageUrl) {
        const match = imageUrl.match(/\/vi\/([^/]+)\//);
        if (!match) {
            return "유효한 YouTube 썸네일 URL이 아닙니다.";
        }

        const videoId = match[1];
        const iframe = `<iframe width="100%" height="512" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;

        return iframe;
    }

    // function setEmodelRatio() {
    //     if (browser) {
    //         const youtubeContents =
    //             document.querySelectorAll(".emodel-area");

    //         for (let i = 0; i < youtubeContents.length; i++) {
    //             youtubeContents[i].style.width = "90%";
    //             const elementWidth = youtubeContents[i].offsetWidth;
    //             youtubeContents[i].style.height = `${elementWidth / 1.7778}px`;
    //         }
    //     }
    // }
</script>

<svelte:window bind:innerWidth={x} />

{#if !allSiteData.ld_view_type || allSiteData.ld_view_type == "old"}
    <!-- 구버전 -->
    {#each imgList as img, idx}
        {#if idx == 0}
            <div class="mb-5">
                <img
                    src={img.includes("http")
                        ? img
                        : `${back_api_origin}${img}`}
                    alt=""
                    class="w-full"
                />
            </div>
        {:else}
            <div class="mb-5" data-aos={dataAosList[idx]}>
                <img
                    src={img.includes("http")
                        ? img
                        : `${back_api_origin}${img}`}
                    alt=""
                    class="w-full"
                />
            </div>
        {/if}
    {/each}
{:else if menuData.link == "emodel"}
    <!-- 신버전 emdel -->
    <div class="pt-5">
        <div
            role="tablist"
            class="tabs tabs-lift tabs-xl justify-center pretendard"
        >
            {#each menuData.emenu as emodel, idx}
                {#if idx == 0}
                    <button
                        role="tab"
                        class="tab tab-active"
                        value={idx}
                        on:click={changTab}
                    >
                        {emodel.type}
                    </button>
                {:else}
                    <button
                        role="tab"
                        class="tab"
                        value={idx}
                        on:click={changTab}
                    >
                        {emodel.type}
                    </button>
                {/if}
            {/each}
        </div>

        <div class="border">
            {#each menuData.emenu as emodel, idx}
                {#if idx == 0}
                    <div class="emodel-area w-full type{idx}">
                        <!-- svelte-ignore a11y-missing-attribute -->
                        <iframe
                            src={emodel.iframe_link}
                            frameborder="0"
                            width="100%"
                            height="800px"
                        ></iframe>
                    </div>
                {:else}
                    <div class="emodel-area w-full type{idx} hidden">
                        <!-- svelte-ignore a11y-missing-attribute -->
                        <iframe
                            src={emodel.iframe_link}
                            frameborder="0"
                            width="100%"
                            height="800px"
                        ></iframe>
                    </div>
                {/if}
            {/each}
        </div>
    </div>
{:else}
    <!-- 신버전 -->
    <div class="mt-5">
        {#each imgArr as img}
            {#if img.includes("iframe")}
                <div
                    class="mb-3"
                    class:observe-hidden={menuData.effect == "on"}
                    class:observe-fade-up={menuData.effect == "on"}
                    data-delay="100"
                >
                    {@html img}
                </div>
            {:else}
                <div
                    class="mb-3"
                    class:observe-hidden={menuData.effect == "on"}
                    class:observe-fade-up={menuData.effect == "on"}
                    data-delay="100"
                >
                    <img
                        src={img.includes("http")
                            ? img
                            : `${back_api_origin}${img}`}
                        alt=""
                        class="w-full"
                    />
                </div>
            {/if}
        {/each}
    </div>
{/if}

<style>
    /* 신버전 CSS */
    .observe-hidden {
        opacity: 0;
        transform: translateY(40px); /* 초기 위치를 아래로 10px 이동 */
    }
    .observe-fade-up {
        transition:
            opacity 0.8s ease-out,
            /* opacity 애니메이션 속도 조절 (더 짧게) */ transform 0.8s ease-out; /* transform 애니메이션 속도 조절 (더 짧게) */
        transition-delay: var(--fade-up-delay, 0ms);
    }
    .fade-up-active {
        opacity: 1;
        transform: translateY(0);
    }
</style>
