<script>
    import { onMount } from "svelte";

    import { browser } from "$app/environment";

    import LayoutOld from "$lib/components/LayoutOld.svelte";
    import OldForm from "$lib/components/OldForm.svelte";
    import LayoutNew from "$lib/components/LayoutNew.svelte";

    import DateInput from "$lib/components/form-list/DateInput.svelte";
    import DateTimeInput from "$lib/components/form-list/DateTimeInput.svelte";
    import MemoInput from "$lib/components/form-list/MemoInput.svelte";
    import NameInput from "$lib/components/form-list/NameInput.svelte";
    import PhoneInput from "$lib/components/form-list/PhoneInput.svelte";
    import PreForm from "$lib/components/PreForm.svelte";

    import moment from "moment-timezone";

    import { back_api, back_api_origin } from "$lib/const";

    import {
        validatePhoneNumber,
        convertPrivacyTextToHtml,
        setImg,
    } from "$lib/lib";

    import Cookies from "js-cookie";
    import axios from "axios";

    let { data, children } = $props();

    let siteData = $derived(data.subView);

    let mainPageMarginTop = $state(0);
    let screenWidth = $state(0);

    // 팝업은 그냥 나오게 하기!!!
    let showPopup = $state(false);

    // 폼 관련 변수!!
    let bottomFixFormData = $state(null); // 하단 고정 폼 유무 및 데이터 정보 담기
    let customerName = $state("");
    let phone1 = $state("010");
    let phone2 = $state("");
    let phone3 = $state("");
    let memos = $state([]);
    let formDate = $state(moment().format("YYYY-MM-DD"));
    let formTime = $state("base");
    let inviteChk = $state(false);

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

        // 하단 고정 폼 처리용
        if (siteData.ld_json_main) {
            const mainData = JSON.parse(siteData.ld_json_main);
            for (let i = 0; i < mainData.length; i++) {
                const mdata = mainData[i];

                if (mdata.contentList) {
                    for (let j = 0; j < mdata.contentList.length; j++) {
                        if (
                            mdata.contentList[j]["formList"] &&
                            mdata.contentList[j]["fixedBottom"]
                        ) {
                            bottomFixFormData = mdata.contentList[j];
                            console.log(bottomFixFormData);
                        }
                    }
                }
            }
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

    async function formUpdate(e) {
        e.preventDefault();
        const siteName = siteData.ld_site;
        let formVal = {};

        // 구버전 폼 검사
        if (hasSectionFormList.length == 0) {
            if (!customerName) {
                alert("성함을 입력 해주세요.");
                return;
            }

            if (!customerPhone) {
                alert("전화번호를 입력 해주세요.");
                return;
            }

            formVal = {
                siteName: siteName,
                name: customerName,
                phone: customerPhone,
            };
        } else {
            customerPhone = phone1 + phone2 + phone3;

            const nameRequireChk = findFormByType(hasSectionFormList, "name");

            if (nameRequireChk && nameRequireChk.require == true) {
                if (!customerName) {
                    alert("성함을 입력 해주세요.");
                    return;
                }
            }

            const phoneRequireChk = findFormByType(hasSectionFormList, "phone");

            if (phoneRequireChk.require) {
                if (!customerPhone || customerPhone == "010") {
                    alert("전화번호를 입력 해주세요.");
                    return;
                }
            }

            const dateRequireChk = findFormByType(hasSectionFormList, "date");

            if (dateRequireChk && dateRequireChk.require) {
                if (!formDate) {
                    alert("날짜를 입력 해 주세요.");
                    return;
                }
            }

            const dateTimeRequireChk = findFormByType(
                hasSectionFormList,
                "datetime",
            );

            if (dateTimeRequireChk && dateTimeRequireChk.require) {
                if (!formDate || formTime == "base") {
                    alert("날짜 및 시간을 입력 해 주세요.");
                    return;
                }
            }

            const memoFormArr = hasSectionFormList.filter(
                (item) => item.type === "memo",
            );
            const memoValArr = memos.filter(Boolean);

            for (let i = 0; i < memoFormArr.length; i++) {
                const memoForm = memoFormArr[i];
                const memoVal = memoValArr[i];
                if (memoForm.require) {
                    if (!memoVal) {
                        alert("필수 메모 항목을 입력 해 주세요!");
                        return;
                    }
                }
            }

            formVal = {
                siteName: siteName,
                name: customerName,
                phone: customerPhone,
                date: formDate,
                time: formTime,
            };

            for (let i = 0; i < memoValArr.length; i++) {
                const memo = memoValArr[i];
                const num = i + 1;
                formVal[`memo_${num}_question`] = memoFormArr[i].word;
                formVal[`memo_${num}_answer`] = memo;
            }
        }

        if (!inviteChk && siteData.ld_personal_info_view == "on") {
            alert("개인정보 보호동의에 체크해주셔야 합니다.");
            return;
        }

        if (!validatePhoneNumber(customerPhone)) {
            alert("정상적인 휴대폰 번호만 가능합니다.");
            return false;
        }

        try {
            const res = await axios.post(
                `${back_api}/update_customer`,
                formVal,
            );

            if (res.status == 200) {
                customerName = "";
                customerPhone = "";
                phone1 = "010";
                phone2 = "";
                phone3 = "";
                memos = [];
                formDate = moment().format("YYYY-MM-DD");
                formTime = "base";
                inviteChk = false;
            }

            window.location.href = "/thankyou?return=true";
        } catch (error) {
            console.error(error.message);

            alert("에러가 발생했습니다. 관리자에게 문의해주세요");
        }
    }

    function moveForm() {
        if (browser) {
            let y;
            let moveEle;
            const eventEle = document.querySelectorAll(".event-ele");
            const formEle = document.querySelectorAll(".form-ele");

            if (eventEle.length > 0) {
                moveEle = eventEle[eventEle.length - 1];
            } else {
                moveEle = formEle[formEle.length - 1];
            }

            y = moveEle.getBoundingClientRect().top + window.pageYOffset - 150;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
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
                onclick={closePopup}
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

    <!-- 모바일 하단 고정 이미지 -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="fixed bottom-0 left-0 w-full z-999 block md:hidden">
        <div class="flex">
            {#if siteData.ld_phone_num && siteData["ld_mobile_bt_phone_img"]}
                <a href="/tel" data-sveltekit-reload>
                    {#if siteData.ld_mobile_bt_phone_img}
                        <div>
                            <img
                                src={siteData[
                                    "ld_mobile_bt_phone_img"
                                ].includes("http")
                                    ? siteData["ld_mobile_bt_phone_img"]
                                    : `${back_api_origin}${siteData["ld_mobile_bt_phone_img"]}`}
                                alt=""
                            />
                        </div>
                    {:else}
                        <div>
                            <img src="/bottom-fix/left-phone.jpg" alt="" />
                        </div>
                    {/if}
                </a>
            {:else}
                <a href="/tel" data-sveltekit-reload>
                    {#if siteData.ld_mobile_bt_phone_img}
                        <div>
                            <img
                                src={siteData[
                                    "ld_mobile_bt_phone_img"
                                ].includes("http")
                                    ? siteData["ld_mobile_bt_phone_img"]
                                    : `${back_api_origin}${siteData["ld_mobile_bt_phone_img"]}`}
                                alt=""
                            />
                        </div>
                    {:else}
                        <div>
                            <img src="/bottom-fix/left-phone.jpg" alt="" />
                        </div>
                    {/if}
                </a>
            {/if}

            <div class="cursor-pointer" onclick={moveForm}>
                {#if siteData.ld_mobile_bt_event_img}
                    <img
                        src={siteData["ld_mobile_bt_event_img"].includes("http")
                            ? siteData["ld_mobile_bt_event_img"]
                            : `${back_api_origin}${siteData["ld_mobile_bt_event_img"]}`}
                        alt=""
                    />
                {:else}
                    <img src="/bottom-fix/right-form.jpg" alt="" />
                {/if}
            </div>
        </div>
    </div>

    <!-- 우측 고정 버튼 -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="fixed bottom-16 md:bottom-1/3 right-5 z-999 cursor-pointer"
        onclick={moveForm}
    >
        <div class="w-20 md:w-24 animate-pulse rounded-full overflow-hidden">
            {#if siteData.ld_invite_image}
                <img src={setImg(siteData.ld_invite_image)} alt="" />
            {:else}
                <img src="/move-icon.png" alt="" />
            {/if}
        </div>
    </div>
{/if}

<div>layout</div>
{#if bottomFixFormData}
    <div
        class="max-w-[860px] mx-auto {siteData.ld_font
            ? siteData.ld_font
            : 'pretendard'}"
    >
        <div class="">
            <!-- 문자 고정 이미지 -->
            {#if bottomFixFormData.formInviteImg}
                <div class="w-full event-ele">
                    <a href="/sms" data-sveltekit-reload>
                        <img
                            src={setImg(bottomFixFormData.formInviteImg)}
                            alt=""
                        />
                    </a>
                </div>
            {/if}

            <div class="form-box form-ele">
                <div class="mb-5">
                    {#if bottomFixFormData.formInviteType == "text"}
                        <div
                            class="text-2xl font-bold mb-2 text-center"
                            style="color : black !important;"
                        >
                            {bottomFixFormData.formSubjectText}
                        </div>
                    {:else}
                        <img
                            src={setImg(bottomFixFormData.formSubjectImg)}
                            alt=""
                            class="mx-auto"
                        />
                    {/if}
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {#each bottomFixFormData.formList as form, idx}
                        {#if form.type == "name"}
                            <NameInput
                                bind:val={customerName}
                                require={form.require}
                            />
                        {:else if form.type == "phone"}
                            <PhoneInput
                                bind:val1={phone1}
                                bind:val2={phone2}
                                bind:val3={phone3}
                                require={form.require}
                            />
                        {:else if form.type == "date"}
                            <DateInput
                                word={form.word}
                                bind:setDate={formDate}
                                require={form.require}
                            />
                        {:else if form.type == "datetime"}
                            <DateTimeInput
                                word={form.word}
                                bind:setDate={formDate}
                                bind:setTime={formTime}
                                require={form.require}
                            />
                        {:else if form.type == "memo"}
                            <MemoInput
                                word={form.word}
                                bind:val={memos[idx]}
                                require={form.require}
                            />
                        {/if}
                    {/each}
                </div>

                <div class="flex justify-between items-center my-5">
                    <div>
                        <label>
                            <input
                                type="checkbox"
                                class="checkbox checkbox-sm mr-1"
                                bind:checked={inviteChk}
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

                <div class="mb-3 text-sm">
                    {#each bottomFixFormData.formAgreeAddWord as agreeWord}
                        <p>{agreeWord}</p>
                    {/each}
                </div>

                <div class="text-center">
                    {#if bottomFixFormData.formButtonType == "text"}
                        <button
                            class="w-full bg-[#ff5f11] text-white p-3 text-lg rounded-lg cursor-pointer"
                            onclick={formUpdate}
                        >
                            {bottomFixFormData.formButtonText}
                        </button>
                    {:else}
                        <button onclick={formUpdate}>
                            <img
                                src={setImg(bottomFixFormData.formButtonImg)}
                                alt=""
                                class="mx-auto"
                            />
                        </button>
                    {/if}
                </div>
            </div>
        </div>
    </div>
{/if}

<div
    class="max-w-[860px] mx-auto mb-16 md:mb-0 md:flex md:justify-center md:items-stretch pb-5 pt-3 mt-3 border-t px-3 pretendard"
>
    {#if siteData.ld_footer}
        {siteData.ld_footer}
    {/if}
</div>

<style>
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
