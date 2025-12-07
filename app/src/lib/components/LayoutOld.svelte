<script>
    import { onMount } from "svelte";
    import { validatePhoneNumber } from "$lib/lib";
    import Cookies from "js-cookie";
    import axios from "axios";
    import { back_api, back_api_origin } from "$lib/const";
    import { browser } from "$app/environment";

    let { siteData } = $props();

    let swiperContainer = $state({});
    let menuList = $state([]);
    let bannerList = $state([]);

    let formModalopen = $state(false);
    let eventEle;
    let y = $state(0);
    let lastScrollY = 0;
    let isMenuVisible = $state(true);

    let mainImage = $state([
        "https://images.unsplash.com/photo-1557682260-96773eb01377",
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
        "https://images.unsplash.com/photo-1537498425277-c283d32ef9db",
        "https://images.unsplash.com/photo-1506765515384-028b60a970df",
    ]);

    onMount(async () => {

        console.log('???????');
        
        console.log(siteData);
        

        
        // 메뉴 설정

        menuList = JSON.parse(siteData.ld_menu);
        if (siteData.ld_banner_img) {
            bannerList = siteData.ld_banner_img.split(",");
        }

        // menuList = siteData

        try {
            // const SwiperModule = await import(
            //     "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs"
            // );
            // // 스와이퍼 셋팅
            // imgSwiper = new SwiperModule.default(swiperContainer, {
            //     loop: true,
            //     speed: 600,
            //     navigation: {
            //         nextEl: ".swiper-next",
            //         prevEl: ".swiper-prev",
            //     },
            //     pagination: {
            //         el: ".swiper-pagination",
            //         clickable: true,
            //     },
            //     autoplay: {
            //         delay: 3000,
            //         disableOnInteraction: false,
            //     },
            // });
        } catch (error) {
            console.error(error.message);
        }

        AOS.init();
    });

    $effect(() => {
        if (y) {
            if (y > 200) {
                const currentScrollY = y;
                isMenuVisible = currentScrollY < lastScrollY; // 위로 스크롤이면 보임
                lastScrollY = currentScrollY;
            } else {
                isMenuVisible = true; // 아래로 스크��이면 보임
                lastScrollY = 0; // scrollY ���기화
            }
        }
    });
</script>

<svelte:window bind:scrollY={y} />

<div class="menu {isMenuVisible ? 'visible' : 'hidden'} z-999">
    <div
        class="max-w-4xl w-full mx-auto p-3 pretendard"
        data-sveltekit-preload-data="tap"
    >
        <div class="text-center flex justify-between items-center mb-3 gap-8">
            {#if siteData.ld_logo}
                <a href="/">
                    <img
                        src={siteData["ld_logo"].includes("http")
                            ? siteData["ld_logo"]
                            : `${back_api_origin}${siteData["ld_logo"]}`}
                        alt=""
                        class="w-full max-w-72"
                    />
                </a>
            {:else}
                <a href="/">logo</a>
            {/if}

            {#if siteData.ld_ph_img && siteData.ld_phone_num}
                <a href="/tel">
                    <img
                        src={siteData["ld_ph_img"].includes("http")
                            ? siteData["ld_ph_img"]
                            : `${back_api_origin}${siteData["ld_ph_img"]}`}
                        alt=""
                        class="w-full max-w-72"
                    />
                </a>
            {/if}
        </div>

        <ul
            class="flex justify-around items-center font-semibold text-base md:text-lg"
        >
            {#each menuList as menu}
                {#if menu.pgLink && menu.pgName}
                    <a href="/{menu.pgLink}">
                        <li style="color:black !important;">
                            {menu.pgName}
                        </li>
                    </a>
                {/if}
            {/each}
        </ul>
    </div>
</div>

<!-- <div class="max-w-4xl mx-auto">
    <div class="swiper" bind:this={swiperContainer}>
        <div class="swiper-wrapper items-center">
            {#each mainImage as img, idx}
                <div class="swiper-slide">
                    <div class=" img-area">
                        <img src={`${img}`} class="mx-auto" alt="" />
                    </div>
                </div>
            {/each}
        </div>
        <div class="swiper-next">
            <svg
                width="800px"
                height="800px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="#BDBDBD"
                    stroke-width="1.5"
                    stroke-miterlimit="10"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <path
                    d="M10.74 15.53L14.26 12L10.74 8.46997"
                    stroke="#ABABAB"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        </div>
        <div class="swiper-prev">
            <svg
                width="800px"
                height="800px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="#BDBDBD"
                    stroke-width="1.5"
                    stroke-miterlimit="10"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <path
                    d="M13.26 15.53L9.73999 12L13.26 8.46997"
                    stroke="#ABABAB"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        </div>
    </div>
</div> -->

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore event_directive_deprecated -->

<style>
    .swiper-next {
        position: absolute;
        top: var(--swiper-navigation-top-offset, 50%);
        width: calc(var(--swiper-navigation-size) / 44 * 50);
        height: var(--swiper-navigation-size);
        margin-top: calc(0px - (var(--swiper-navigation-size) / 2));
        z-index: 10;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        right: var(--swiper-navigation-sides-offset, 10px);
        left: auto;
    }

    .swiper-prev {
        position: absolute;
        top: var(--swiper-navigation-top-offset, 50%);
        width: calc(var(--swiper-navigation-size) / 44 * 50);
        height: var(--swiper-navigation-size);
        margin-top: calc(0px - (var(--swiper-navigation-size) / 2));
        z-index: 10;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        right: auto;
        left: var(--swiper-navigation-sides-offset, 10px);
    }

    .menu {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background-color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease-in-out;
    }

    .menu.hidden {
        transform: translateY(-100%);
    }

    .menu.visible {
        transform: translateY(0);
    }
</style>
