<script>
    import { onMount } from "svelte";
    import { browser } from "$app/environment";

    let logoData = {};
    let menuData = {};

    let mainPageMarginTop = 0;
    let screenWidth = "860px";

    if (browser) {
        const urlParams = new URLSearchParams(window.location.search);
        const receivedLogoDataString = urlParams.get("logoData");
        const receivedMenuDataString = urlParams.get("menuData");

        if (receivedMenuDataString) {
            try {
                menuData = JSON.parse(receivedMenuDataString);
                console.log(menuData);
            } catch (error) {
                console.error("JSON 파싱 오류:", error);
            }
        }

        if (receivedLogoDataString) {
            try {
                logoData = JSON.parse(receivedLogoDataString);
                console.log(logoData);
            } catch (error) {
                console.error("JSON 파싱 오류:", error);
            }
        }

        console.log(menuData.padding_y);
        console.log(logoData.header_height);

        mainPageMarginTop =
            Number(menuData.padding_y) * 2 + Number(logoData.header_height);
        console.log(mainPageMarginTop);
    }

    onMount(() => {});
</script>

<div class="fixed top-0 left-0 w-full z-50">
    <div
        style="background-color: {logoData.header_color}; height:{logoData.header_height}px; padding: {logoData.header_padding}px"
    >
        <div
            class="flex"
            class:justify-start={logoData.logo_location == "left"}
            class:justify-center={logoData.logo_location == "center"}
        >
            <img src={logoData.logo_img} alt="" width={logoData.logo_width} />
        </div>
    </div>

    <div
        class="pretendard border-b mx-auto"
        style="padding: {menuData.padding_y}px; pretendard; background-color:white; max-width:{screenWidth};"
    >
        <ul class="flex justify-around">
            {#if menuData.menus}
                {#each menuData.menus as menu}
                    <a href="">
                        <li>{menu.name}</li>
                    </a>
                {/each}
            {/if}
        </ul>
    </div>
</div>

<div
    class="mx-auto"
    style="margin-top: {mainPageMarginTop}px; max-width:{screenWidth};"
>
    <slot />
</div>
