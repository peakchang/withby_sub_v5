<script>
    import { onMount, tick } from "svelte";
    import { browser } from "$app/environment";
    import { slide } from "svelte/transition";
    import { quintOut } from "svelte/easing";

    import axios from "axios";
    import { back_api, back_api_origin, gcs_img } from "$lib/const";

    import { setImg } from "$lib/lib";

    let { siteData, mainPageMarginSet } = $props();

    // 신버전 변수!!!
    let headerData = $state({});
    let menuData = $state({});
    let mainPageMarginTop = $state(0);
    let screenWidth = $state("860px");
    let callImgWidth = $state(0);
    let callImgMarginBlank = $state(0);

    // 요소 변수
    let logoArea;
    let headerArea;
    let menuArea = $state({});

    let headerHeight = $state(0);
    let menuHeight = $state(0);

    let y = $state(0);
    let lastScrollY = $state(0);
    let isMenuVisible = $state(true);

    onMount(async () => {
        try {
            if (siteData.ld_json_header) {
                headerData = JSON.parse(siteData.ld_json_header);
            }

            if (siteData.ld_json_menus) {
                menuData = JSON.parse(siteData.ld_json_menus);
            }
        } catch (error) {
            console.error("JSON 파싱 오류:", error);
        }
    });

    onMount(() => {
        isMenuVisible = true;
    });

    $effect(() => {
        if (y) {
            if (y > lastScrollY) {
                if (y > 200) {
                    isMenuVisible = false;
                }
            } else if (y < lastScrollY) {
                isMenuVisible = true;
            }
            lastScrollY = y;
        }
    });

    // 헤더 및 메뉴의 높이를 구하는 경우 이미지가 로드 된 뒤에 구한다!!
    // 이미지 로드가 완료 되면 layout 으로 값 전달 후 element 의 margin 값 등 구함
    function handleImageLoad() {
        if (headerArea) {
            headerHeight = headerArea.offsetHeight;

            mainPageMarginTop = headerHeight + menuHeight;

            if (menuData.menus && menuData.menus.length > 0) {
                menuHeight = menuArea.offsetHeight;
            }
        }
        mainPageMarginSet({
            mainPageMarginTop,
            screenWidth,
        });
    }
</script>

<svelte:window bind:scrollY={y} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->

<div
    class="header-wrapper fixed top-0 left-0 w-full z-50 {siteData.ld_font
        ? siteData.ld_font
        : 'pretendard'} {isMenuVisible ? 'visible' : 'nonvisible'} z-400"
>
    <div
        bind:this={headerArea}
        class="header-area"
        style="background-color: {headerData.header_color}; padding: {headerData.header_padding}px; "
    >
        <div
            bind:this={logoArea}
            class="flex items-center justify-between logo-area mx-auto max-w-[860px] relative text-white"
            data-sveltekit-reload
        >
            <div
                style="width: {headerData.logo_width
                    ? `${headerData.logo_width}%`
                    : '30%'}"
            >
                {#if headerData.logo_img}
                    <a href="/">
                        <img
                            src={setImg(headerData.logo_img)}
                            alt=""
                            onload={handleImageLoad}
                        />
                    </a>
                {/if}
            </div>

            <div
                style="width: {headerData.top_phone_width
                    ? `${headerData.top_phone_width}%`
                    : '30%'}"
            >
                {#if siteData.ld_phone_num && headerData.phone_img}
                    <a href="/tel" data-sveltekit-reload>
                        <img
                            src={setImg(headerData.phone_img)}
                            alt=""
                            onload={handleImageLoad}
                        />
                    </a>
                {/if}
            </div>
        </div>
    </div>

    <!-- 메뉴 부분!!! -->

    {#if menuData.menus && menuData.menus.length > 0}
        <div
            bind:this={menuArea}
            class="border-b mx-auto menu-area"
            style="padding: {menuData.padding_y}px; max-width:{screenWidth}; background-color:white !important;"
        >
            <ul
                class="flex justify-around"
                data-sveltekit-preload-data="tap"
                data-sveltekit-reload
            >
                {#if menuData.menus}
                    {#each menuData.menus as menu}
                        <a
                            href="/{menu.link}"
                            class=" dark:text-white"
                            style="color: black !important;"
                        >
                            <li
                                class="menu-list"
                                style="color: black !important;"
                            >
                                {menu.name}
                            </li>
                        </a>
                    {/each}
                {/if}
            </ul>
        </div>
    {/if}
</div>

<style>
    .header-wrapper {
        /* position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background-color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); */
        transition: transform 0.3s ease-in-out;
    }

    .header-wrapper.nonvisible {
        transform: translateY(-100%);
    }

    .header-wrapper.visible {
        transform: translateY(0);
    }
</style>
