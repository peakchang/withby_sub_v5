<script>
    import { onMount } from "svelte";
    import { browser } from "$app/environment";

    let observer;
    let elementsToObserve;
    let mainContents = [];

    if (browser) {
        const urlParams = new URLSearchParams(window.location.search);
        const receivedMainDataString = urlParams.get("mainData");

        if (receivedMainDataString) {
            try {
                mainContents = JSON.parse(receivedMainDataString);
                console.log(mainContents);

                // 받은 JSON 데이터 처리
            } catch (error) {
                console.error("JSON 파싱 오류:", error);
            }
        }
    }

    onMount(() => {
        if (browser) {
            elementsToObserve = document.querySelectorAll(".observe-fade-up");
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
    });
</script>

<div>
    {#each mainContents as mainContent}
        <div
            style="background-image: url({mainContent[
                'backgroundImg'
            ]}); height:{mainContent[
                'height'
            ]}px; background-repeat: no-repeat; background-size: 100% auto;"
        >
            {#each mainContent.contentList as content}
                {#if content.text}
                    <div
                        class="px-3 pretendard"
                        class:observe-hidden={content.effect == "on"}
                        class:observe-fade-up={content.effect == "on"}
                        data-delay={content.delay}
                        style="text-align : {content.align}; color :{content.fontColor};  font-size : {content.fontSize}px; white-space: pre-line;"
                    >
                        {content.text}
                    </div>
                {:else if content.imgPath}
                    <div
                        class="flex"
                        class:justify-center={content.align == "center"}
                        class:justify-start={content.align == "left"}
                        class:justify-end={content.align == "right"}
                        class:observe-hidden={content.effect == "on"}
                        class:observe-fade-up={content.effect == "on"}
                        data-delay={content.delay}
                    >
                        <div style="width:{content.width}%;">
                            <img src={content.imgPath} alt="" />
                        </div>
                    </div>
                {:else if content.marginHeight}
                    <div style="height: {content.marginHeight}px;"></div>
                {/if}
            {/each}
        </div>
    {/each}
</div>

<div style="height: 1000px;"></div>

<style>
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
