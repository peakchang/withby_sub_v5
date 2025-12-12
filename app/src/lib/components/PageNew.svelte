<script>
    import { onMount, tick } from "svelte";
    import { browser } from "$app/environment";
    import { back_api, back_api_origin, gcs_img } from "$lib/const";

    import {
        validatePhoneNumber,
        convertPrivacyTextToHtml,
        setImg,
        isSameArrayKeys,
    } from "$lib/lib";

    import {
        formObj,
        getFormList,
        customerName,
        customerPhone,
        phone1,
        phone2,
        phone3,
        formDate,
        formTime,
        inviteChk,
        formAgree,
    } from "$lib/store";

    import Modal from "$lib/components/Modal.svelte";

    import NameInput from "$lib/components/form-list/NameInput.svelte";
    import PhoneInput from "$lib/components/form-list/PhoneInput.svelte";
    import DateInput from "$lib/components/form-list/DateInput.svelte";
    import DateTimeInput from "$lib/components/form-list/DateTimeInput.svelte";
    import MemoInput from "$lib/components/form-list/MemoInput.svelte";

    import PreForm from "$lib/components/PreForm.svelte";

    import moment from "moment-timezone";
    import axios from "axios";

    let { siteData } = $props();

    let mainContents = $state([]);
    let standbyContentList = $state([]);
    let x = $state(0);
    let y = $state(0);

    let observer;
    let elementsToObserve;

    let backgroundList = $state([]);
    let contentList = $state([]);

    let loading = $state(true);
    let hasSectionFormList = $state([]);

    let modalOpen = $state(false); // 개인 정보 모달

    // 구, 신버전 공통 폼 입력 관련 변수

    onMount(async () => {
        if (siteData.ld_json_main) {
            mainContents = JSON.parse(siteData.ld_json_main);

            /*

            백그라운드 이미지가 전부 페이지에 로드 된 다음에 ratio 실행을 위해서 (그래야 정상적으로 돌아감)
            mainContents 의 백그라운드 이미지들을 전부 로드하기 위해
            standbyContentList 배열에 담은 뒤
            loadBackgroundImage 함수로 이미지 로드 확인하기

            */
            for (let i = 0; i < mainContents.length; i++) {
                const con = mainContents[i];
                const bgImg = con.backgroundImg;

                if (bgImg) {
                    if (bgImg.includes("http")) {
                        standbyContentList.push(bgImg);
                    } else if (bgImg.includes("subimg")) {
                        standbyContentList.push(`${back_api_origin}${bgImg}`);
                    } else {
                        standbyContentList.push(`${gcs_img}/${bgImg}`);
                    }
                }
            }

            await Promise.all(
                standbyContentList.map((url) => loadBackgroundImage(url)),
            );

            loading = false;
        }

        // setSectionHeight();
        // setYoutubeRatio();

        elementsToObserve = document.querySelectorAll(".observe-fade-up");

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

        hasSectionFormList = mainContents
            .flatMap((item) => item.contentList)
            .flatMap((con) => con.formList ?? [])
            .map((f) => ({ type: f.type, word: f.word, require: f.require }));
    });

    $effect(() => {});

    // 유튜브 섹션의 높이 비율 맞추기
    async function setYoutubeRatio() {
        if (browser) {
            await tick();
            const youtubeContents =
                document.querySelectorAll(".youtube-iframe");

            for (let i = 0; i < youtubeContents.length; i++) {
                youtubeContents[i].style.width = "90%";
                const elementWidth = youtubeContents[i].offsetWidth;
                youtubeContents[i].style.height = `${elementWidth / 1.7778}px`;
            }
        }
    }

    function loadBackgroundImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }

    function getRatio(data) {
        if (!data.bgType || data.bgType == "height") {
            return 0;
        } else {
            let ratio = 0;
            ratio = data.backgroundWidth / data.backgroundHeight;
            return ratio;
        }
    }

    async function formUpdate(e) {
        e.preventDefault();

        const siteName = siteData.ld_site;
        let formVal = {};

        // 구버전 폼 검사
        if (hasSectionFormList.length == 0) {
            if (!$customerName) {
                alert("성함을 입력 해주세요.");
                return;
            }
            if (!$customerPhone) {
                alert("전화번호를 입력 해주세요.");
                return;
            }
            if (!validatePhoneNumber($customerPhone)) {
                alert("정상적인 휴대폰 번호만 가능합니다.");
                return false;
            }

            if ($inviteChk == false) {
                alert("개인정보 보호동의에 체크해주셔야 합니다.");
                return;
            }

            formVal = {
                siteName: siteName,
                name: $customerName,
                phone: $customerPhone,
            };
        } else {
            if ($getFormList.length == 0) {
                alert("모든 항목이 비어 있습니다.");
                return;
            }
            if ($phone2 && $phone3) {
                $customerPhone = $phone1 + $phone2 + $phone3;
            }

            for (let i = 0; i < $getFormList.length; i++) {
                const verifyFormChk = $getFormList[i];
                if (
                    verifyFormChk.type == "name" &&
                    verifyFormChk.require &&
                    !$customerName
                ) {
                    alert("성함을 입력 해 주세요");
                    return;
                } else if (
                    verifyFormChk.type == "name" &&
                    verifyFormChk.require &&
                    (!$customerPhone || $customerPhone == "010")
                ) {
                    alert("전화번호를 입력 해 주세요");
                    return;
                } else if (
                    verifyFormChk.type == "date" &&
                    verifyFormChk.require &&
                    !$formDate
                ) {
                    alert("상담 받으실 날짜를 입력 해 주세요");
                    return;
                } else if (
                    verifyFormChk.type == "date" &&
                    verifyFormChk.require &&
                    (!$formDate || $formTime == "base")
                ) {
                    alert("상담 받으실 날짜 및 시간을 입력 해 주세요");
                    return;
                } else if (
                    verifyFormChk.type.includes("memo") &&
                    verifyFormChk.require &&
                    !$formObj[`${verifyFormChk.type}`]
                ) {
                    alert(`${verifyFormChk.word} 항목은 필수 입니다.`);
                    return;
                }

                if (!validatePhoneNumber($customerPhone)) {
                    alert("정상적인 휴대폰 번호만 가능합니다.");
                    return false;
                }

                if ($formAgree == "use" && $inviteChk == false) {
                    alert("개인정보 보호동의에 체크해주셔야 합니다.");
                    return;
                }

                switch (true) {
                    case verifyFormChk.type == "name":
                        formVal["name"] = $customerName;
                        break;
                    case verifyFormChk.type == "phone":
                        formVal["phone"] = $customerPhone;
                        break;
                    case verifyFormChk.type == "date":
                        formVal["date"] = $formDate;
                        break;
                    case verifyFormChk.type == "time":
                        formVal["time"] = $formTime;
                        break;
                    case verifyFormChk.type.includes("memo"):
                        formVal[`${verifyFormChk.type}`] =
                            $formObj[`${verifyFormChk.type}`];
                        break;
                }
            }
            formVal["siteName"] = siteName;
        }

        console.log("통과?");

        try {
            const res = await axios.post(
                `${back_api}/update_customer`,
                formVal,
            );

            if (res.status == 200) {
                $customerName = "";
                $customerPhone = "";
                $phone1 = "010";
                $phone2 = "";
                $phone3 = "";
                $formDate = moment().format("YYYY-MM-DD");
                $formTime = "base";
                $inviteChk = false;
            }

            window.location.href = "/thankyou?return=true";
        } catch (error) {
            console.error(error.message);

            alert("에러가 발생했습니다. 관리자에게 문의해주세요");
        }
    }

    // 폼 만들어주기!! (폼을 만들어서 업데이트 시에 적용)
    function focusAct(e) {
        if (!isSameArrayKeys($getFormList, e.formList)) {
            console.log(e);

            $formAgree = e.formAgree;

            $getFormList = e.formList;
            $formObj = Object.fromEntries(
                e.formList.map((item) => [item.type, ""]),
            );

            $customerName = "";
            $customerPhone = "";
            $phone1 = "010";
            $phone2 = "";
            $phone3 = "";
            $formDate = moment().format("YYYY-MM-DD");
            $formTime = "base";
            $inviteChk = false;
        }
    }
</script>

<svelte:window bind:innerWidth={x} bind:scrollY={y} />

<Modal
    bind:isOpen={modalOpen}
    showCloseButton={true}
    title="개인정보 보호동의 전문"
>
    <div>
        {@html convertPrivacyTextToHtml(siteData.ld_consent_info)}
    </div>

    <div class="text-right">
        <button
            class="btn btn-soft btn-error"
            onclick={() => {
                $inviteChk = true;
                modalOpen = false;
            }}
        >
            닫기
        </button>
    </div>
</Modal>

<!-- <a href="/tel" data-sveltekit-reload> gogogo </a> -->

<div class="mb-5 {siteData.ld_font ? siteData.ld_font : 'pretendard'}">
    {#each mainContents as mainContent, idx}
        <div
            class="bg-box"
            bind:this={backgroundList[idx]}
            style="background-image: url({setImg(
                mainContent['backgroundImg'],
            )}); aspect-ratio: {getRatio(mainContent)};"
        >
            {#each mainContent.contentList as content, idx}
                {#if content.text}
                    <div
                        class="px-3"
                        class:observe-hidden={content.effect == "on"}
                        class:observe-fade-up={content.effect == "on"}
                        data-delay={content.delay}
                        style="text-align : {content.align}; color :{content.fontColor};  font-size : {content.fontSize}px; white-space: pre-line;"
                    >
                        {content.text}
                    </div>
                {:else if content.imgPath}
                    {#if content.imgPath}
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
                                <img
                                    src={setImg(content.imgPath)}
                                    alt=""
                                    class="w-full"
                                />
                            </div>
                        </div>
                    {/if}
                {:else if content.imgList}
                    {#each content.imgList as img}
                        {#if img.link}
                            <a
                                href={img.link}
                                data-sveltekit-reload
                                rel="noopener noreferrer"
                            >
                                <div
                                    class="flex"
                                    class:justify-center={content.align ==
                                        "center"}
                                    class:justify-start={content.align ==
                                        "left"}
                                    class:justify-end={content.align == "right"}
                                    class:observe-hidden={content.effect ==
                                        "on"}
                                    class:observe-fade-up={content.effect ==
                                        "on"}
                                    data-delay={content.delay}
                                >
                                    <div
                                        class="mx-auto"
                                        style="width:{content.width}%;"
                                    >
                                        <img
                                            src={setImg(img.url)}
                                            alt=""
                                            class="w-full"
                                        />
                                    </div>
                                </div>
                            </a>
                        {:else}
                            <div
                                class="flex"
                                class:justify-center={content.align == "center"}
                                class:justify-start={content.align == "left"}
                                class:justify-end={content.align == "right"}
                                class:observe-hidden={content.effect == "on"}
                                class:observe-fade-up={content.effect == "on"}
                                data-delay={content.delay}
                            >
                                <div
                                    class="mx-auto"
                                    style="width:{content.width}%;"
                                >
                                    <img
                                        src={setImg(img.url)}
                                        alt=""
                                        class="w-full"
                                    />
                                </div>
                            </div>
                        {/if}
                    {/each}
                {:else if content.formList && content.fixedBottom != "fixed"}
                    <div class="gap-1 my-3">
                        <!-- 문자 고정 이미지 -->
                        {#if content.formInviteImg}
                            <div class="w-full event-ele mb-3">
                                <a href="/sms" data-sveltekit-reload>
                                    <img
                                        src={setImg(content.formInviteImg)}
                                        alt=""
                                        class="mx-auto"
                                    />
                                </a>
                            </div>
                        {/if}

                        <div class="form-box form-ele">
                            <div class="mb-5">
                                {#if content.formInviteType == "text"}
                                    <div
                                        class="text-2xl font-bold mb-2 text-center"
                                        style="color : black !important;"
                                    >
                                        {content.formSubjectText}
                                    </div>
                                {:else}
                                    <img
                                        src={setImg(content.formSubjectImg)}
                                        alt=""
                                        class="mx-auto"
                                    />
                                {/if}
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {#each content.formList as form, idx}
                                    {#if form.type == "name"}
                                        <NameInput
                                            bind:val={$customerName}
                                            require={form.require}
                                            form={content}
                                            {focusAct}
                                        />
                                    {:else if form.type == "phone"}
                                        <PhoneInput
                                            bind:val1={$phone1}
                                            bind:val2={$phone2}
                                            bind:val3={$phone3}
                                            require={form.require}
                                        />
                                    {:else if form.type == "date"}
                                        <DateInput
                                            word={form.word}
                                            bind:setDate={$formDate}
                                            require={form.require}
                                        />
                                    {:else if form.type == "datetime"}
                                        <DateTimeInput
                                            word={form.word}
                                            bind:setDate={$formDate}
                                            bind:setTime={$formTime}
                                            require={form.require}
                                        />
                                    {:else if form.type.includes("memo")}
                                        <MemoInput
                                            bind:val={$formObj[`${form.type}`]}
                                            word={form.word}
                                            require={form.require}
                                        />
                                    {/if}
                                {/each}
                            </div>

                            {#if !content.formAgree || content.formAgree == "use"}
                                <div
                                    class="flex justify-between items-center my-5"
                                >
                                    <div>
                                        <label>
                                            <input
                                                type="checkbox"
                                                class="checkbox checkbox-sm mr-1"
                                                bind:checked={$inviteChk}
                                            />
                                            <span>개인정보 보호동의</span>
                                        </label>
                                    </div>
                                    <div>
                                        <button
                                            class=" cursor-pointer"
                                            onclick={() => {
                                                modalOpen = true;
                                            }}
                                        >
                                            [보기]
                                        </button>
                                    </div>
                                </div>
                            {/if}

                            <div class="mb-3 text-sm">
                                {#each content.formAgreeAddWord as agreeWord}
                                    <p>{agreeWord}</p>
                                {/each}
                            </div>

                            <div class="text-center">
                                {#if content.formButtonType == "text"}
                                    <button
                                        class="w-full bg-[#ff5f11] text-white p-3 text-lg rounded-lg cursor-pointer"
                                        onclick={formUpdate}
                                    >
                                        {content.formButtonText}
                                    </button>
                                {:else}
                                    <button onclick={formUpdate}>
                                        <img
                                            src={setImg(content.formButtonImg)}
                                            alt=""
                                            class="mx-auto"
                                        />
                                    </button>
                                {/if}
                            </div>
                        </div>
                    </div>
                {:else if content.marginHeight}
                    <div style="height: {content.marginHeight}px;"></div>
                {:else if content.youtubeTag}
                    <div class="youtube-container mt-3 flex justify-center">
                        {@html content.youtubeTag}
                    </div>
                {/if}
            {/each}
        </div>
    {/each}

    <!-- 기존 버전 폼!!!! 기존 사용하던 사이트를 위해 남겨두기!! -->
    {#if !loading && hasSectionFormList.length == 0}
        <div
            class="max-w-[860px] mx-auto md:flex md:justify-center md:items-center"
        >
            {#if siteData.ld_event_img}
                <div class="md:w-1/2 event-ele">
                    <a href="/sms" data-sveltekit-reload>
                        <img src={setImg(siteData["ld_event_img"])} alt="" />
                    </a>
                </div>
            {/if}

            <div class="md:w-1/2 md:px-5 suit-font flex items-stretch form-ele">
                <div
                    class="w-full p-5 flex flex-col justify-center gap-8 rounded-md"
                    style="background-color: #f7f4ec !important;"
                >
                    <div>
                        <div
                            class="text-3xl font-bold mb-2 text-center"
                            style="color : black !important;"
                        >
                            {siteData.ld_db_input_subject
                                ? siteData.ld_db_input_subject
                                : "초대장 발급 확인"}
                        </div>
                        <!-- <div class="text-xs">
					관심고객 등록을 통하여 이름, 전화번호만을 수집하며, 정보 및
					이벤트 등의 안내를 위해서만 사용됩니다. 회사는 상담후
					해당정보를 지체없이 파기합니다. 양식 제출 시
					개인정보수집이용에 동의한 것으로 간주됩니다.
				</div> -->
                    </div>
                    <div>
                        <div class="mb-3">
                            <input
                                type="text"
                                class="w-full text-lg p-2.5 rounded-xl bg-white focus:outline-none"
                                placeholder="이름"
                                bind:value={$customerName}
                            />
                        </div>
                        <div class="mb-3">
                            <input
                                type="text"
                                class="w-full text-lg p-2.5 rounded-xl bg-white focus:outline-none"
                                placeholder="전화번호"
                                bind:value={$customerPhone}
                            />
                        </div>

                        <div class="my-6">
                            {#if siteData.ld_personal_info_view == "on"}
                                <div
                                    class="flex items-center justify-between mb-2 text-sm pr-3"
                                >
                                    <div>
                                        <label class="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                class="checkbox checkbox-neutral checkbox-sm"
                                                bind:checked={$inviteChk}
                                            />
                                            <span
                                                style="color:black !important;"
                                                >개인정보 보호동의</span
                                            >
                                        </label>
                                    </div>
                                    <button
                                        class=" text-blue-600"
                                        onclick={() => {
                                            modalOpen = true;
                                        }}
                                    >
                                        [보기]
                                    </button>
                                </div>
                            {/if}

                            {#if siteData.ld_invite_bool != "off"}
                                <div
                                    class="flex items-center gap-3 mb-2 text-sm"
                                >
                                    <div>
                                        <img
                                            src="/megaphone.png"
                                            alt=""
                                            width="20"
                                            height="20"
                                        />
                                    </div>
                                    <div style="color:black !important;">
                                        {#if siteData.ld_invite_message}
                                            {siteData.ld_invite_message}
                                        {:else}
                                            <span>
                                                모델하우스는 초대장이 있으신분만
                                                방문 가능합니다.
                                            </span>
                                        {/if}
                                    </div>
                                </div>
                            {/if}

                            {#if siteData.ld_reserve_msg_bool != "off"}
                                <div class="flex items-center gap-3 text-sm">
                                    <div>
                                        <img
                                            src="/megaphone.png"
                                            alt=""
                                            width="20"
                                            height="20"
                                        />
                                    </div>
                                    <div style="color:red !important;">
                                        미 예약시 관람을 제한하는 점 양해
                                        부탁드립니다.
                                    </div>
                                </div>
                            {/if}
                        </div>

                        <!-- svelte-ignore legacy_code -->
                        <div class="w-full">
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                            <!-- svelte-ignore a11y-missing-attribute -->
                            <a href="thankyou" data-sveltekit-reload>
                                <button
                                    class="w-full bg-[#ff5f11] text-white p-3 text-lg rounded-lg cursor-pointer"
                                    onclick={formUpdate}
                                >
                                    {#if siteData.ld_btn_message}
                                        {siteData.ld_btn_message}
                                    {:else}
                                        예약 확인
                                    {/if}
                                </button>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>

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

    .background-area {
        background-repeat: no-repeat;
        background-size: 100% auto;
    }

    .bg-box {
        width: 100%; /* 너가 원하는 기준 크기 */
        background-size: cover; /* or contain */
        background-position: center;
    }

    .form-box {
        border: 1px solid #9ca3af; /* border-gray-400 */
        margin-top: 1.75rem; /* mt-7 */

        width: 100%; /* w-full */
        margin-left: auto; /* mx-auto */
        margin-right: auto;

        border-radius: 0.5rem; /* rounded-lg */

        padding: 20px;
    }

    @media (min-width: 768px) {
        .form-box {
            margin-top: 0; /* md:mt-0 */
            /* width: 50%; md:w-1/2 */
        }
    }
</style>
