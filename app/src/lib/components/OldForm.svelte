<script>
    import { onMount } from "svelte";
    import { browser } from "$app/environment";

    import { validatePhoneNumber, convertPrivacyTextToHtml } from "$lib/lib";
    import axios from "axios";
    import { back_api, back_api_origin, consentInfo } from "$lib/const";

    let { siteData } = $props();

    let customerName = $state("");
    let customerPhone = $state("");
    let inviteChk = $state(false);
    let rightFixPhone = $state([]);

    let chk_modal;
    let personalInfo;
    let eventEle;

    onMount(() => {
        if (siteData.ld_phone_num) {
            rightFixPhone = siteData.ld_phone_num.split("-");
        }
    });

    // 공통 함수
    function closePopup() {
        Cookies.set("popup_close", "ok", { expires: 1 });
        showPopup = false;
    }

    async function customerSubmit(name, phone, siteName) {
        try {
            const res = await axios.post(`${back_api}/update_customer`, {
                name,
                phone,
                siteName,
            });

            window.location.href = "/thankyou?return=true";
        } catch (error) {
            console.error(error.message);

            alert("에러가 발생했습니다. 관리자에게 문의해주세요");
        }
    }
</script>

<dialog id="chk_modal" class="modal suit-font" bind:this={chk_modal}>
    <div class="modal-box">
        <h3 class="text-lg font-bold">초대장 발급이 확인 되었습니다.</h3>
        <h3 class="text-lg font-bold">배정된 담당자가 연락 드릴 예정입니다.</h3>
        <div class="modal-action">
            <form method="dialog">
                <!-- if there is a button in form, it will close the modal -->
                <button class="btn">닫기</button>
            </form>
        </div>
    </div>
</dialog>

<dialog class="modal" bind:this={personalInfo}>
    <div class="modal-box pretendard">
        {@html convertPrivacyTextToHtml(consentInfo)}
        <!-- <h3 class="text-lg font-bold">개인 정보 보호 동의 전문</h3>
        <div>
            <p class="py-4">- 개인정보수집주체 : 애드피크</p>
            <p>- 수집 목적 및 항목</p>
            <p>&nbsp;1) 수집목적 : 홍보 및 분양정보 안내</p>
            <p>&nbsp;2) 수집항목 : 이름, 연락처, 거주지</p>
            <p>&nbsp;3) 수집기간 : 1년 또는 분양 완료 시까지</p>
            <br />
            <p>정보 제공을 위한 목적이 소멸되면 자료를 파기합니다.</p>
            <br />
            <p>
                개인정보의 수집 및 이용에 대한 동의를 거부할 수 있으며, 이 경우
                신청에 제한이 될 수 있음을 알려드립니다.
            </p>
            <br />
            <p>동의하시려면 체크박스에 체크해주세요</p>
            <br />
            <br />
            <br />
            <p class="text-lg font-semibold">
                ■ 개인정보 수집, 이용, 위탁, 양도 동의
            </p>
            <p><br /></p>
            <p>
                애드피크는 고객님의 원활한 서비스 이용을 위해 필요한 최소한의
                개인정보를 수집하고 있습니다.
            </p>
            <p>개인정보 제공받는 자 : 애드피크</p>
            <p>
                직방 호갱노노는 고객님의 개인정보를 수집하거나 분양상담에 직접
                관여하지 않습니다.
            </p>
            <p>
                제공되는 부동산 정보는 각 콘텐츠 제공업체로부터 받는 정보로
                참고용입니다.
            </p>
            <p>
                정보의 정확성이나 신뢰성을 보증하지 않으며, 서비스 이용의 결과에
                대해서 어떠한 법적인 책임을 지지 않습니다.
            </p>
            <p>고객님은 개인정보 수집에 동의하지 않을 권리가 있습니다.</p>
            <p>
                다만, 필수 항목에 대한 동의를 거부하실 경우 관심고객 등록이
                불가능합니다.
            </p>
            <p><br /></p>
            <p>1. 수집하는 개인정보 항목</p>
            <p>관심고객 등록을 통해 다음과 같은 개인정보를 수집합니다.</p>
            <p>개인정보 제공 필수 항목 : 이름, 휴대전화번호</p>
            <p>
                개인정보 제공 선택 항목 : 주소 (시/도, 시/군/구), 관심 타입,
                연령대
            </p>
            <p><br /></p>
            <p>2. 개인정보의 수집 및 이용 목적</p>
            <p>수집된 개인정보는 다음의 목적으로 이용됩니다.</p>
            <p>
                이름, 휴대전화번호 : 분양 정보 안내, 상담, 고지사항 전달, 불만
                처리, 이벤트 정보 제공
            </p>
            <p>관심 타입: 맞춤형 정보 제공</p>
            <p>연령대: 통계 분석 및 맞춤형 서비스 제공</p>
            <p><br /></p>
            <p>3. 개인정보의 보유 및 이용 기간</p>
            <p>
                수집된 개인정보는 원칙적으로 관심고객 등록 시점부터 분양 완료
                시까지 보유 및 이용합니다. 단, 마케팅 활용 동의 시에는 별도의
                보유 기간을 따릅니다.
            </p>
            <p>
                파기 절차: 분양 완료 후 별도 DB로 이관하여 일정 기간 보관 후
                파기
            </p>
        </div> -->

        <div class="modal-action">
            <form method="dialog">
                <!-- if there is a button in form, it will close the modal -->
                <!-- svelte-ignore event_directive_deprecated -->
                <button
                    class="btn"
                    onclick={() => {
                        inviteChk = true;
                    }}
                >
                    확인 및 닫기
                </button>
            </form>
        </div>
    </div>
</dialog>

<!-- 공통으로 들어가는 이미지!! -->
<div
    class="max-w-[860px] mx-auto md:flex md:justify-center md:items-stretch"
    bind:this={eventEle}
>
    {#if siteData.ld_event_img}
        <div class="md:w-1/2">
            <a href="/sms">
                <img
                    src={siteData["ld_event_img"].includes("http")
                        ? siteData["ld_event_img"]
                        : `${back_api_origin}${siteData["ld_event_img"]}`}
                    alt=""
                />
            </a>
        </div>
    {/if}

    <div class="md:w-1/2 md:px-5 suit-font flex items-stretch pretendard">
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
                        bind:value={customerName}
                    />
                </div>
                <div class="mb-3">
                    <input
                        type="text"
                        class="w-full text-lg p-2.5 rounded-xl bg-white focus:outline-none"
                        placeholder="전화번호"
                        bind:value={customerPhone}
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
                                        bind:checked={inviteChk}
                                    />
                                    <span style="color:black !important;"
                                        >개인정보 보호동의</span
                                    >
                                </label>
                            </div>
                            <button
                                class=" text-blue-600"
                                onclick={() => {
                                    personalInfo.showModal();
                                }}
                            >
                                [보기]
                            </button>
                        </div>
                    {/if}

                    {#if siteData.ld_invite_bool != "off"}
                        <div class="flex items-center gap-3 mb-2 text-sm">
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
                                        모델하우스는 초대장이 있으신분만 방문
                                        가능합니다.
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
                                미 예약시 관람을 제한하는 점 양해 부탁드립니다.
                            </div>
                        </div>
                    {/if}
                </div>

                <!-- svelte-ignore legacy_code -->
                <div class="w-full">
                    <a
                        href="book:"
                        onclick={(e) => {
                            e.preventDefault();

                            const siteName = siteData.ld_site;

                            if (!customerName) {
                                alert("성함을 입력 해주세요.");
                                return;
                            }

                            if (!customerPhone) {
                                alert("전화번호를 입력 해주세요.");
                                return;
                            }

                            if (
                                !inviteChk &&
                                siteData.ld_personal_info_view == "on"
                            ) {
                                alert(
                                    "개인정보 보호동의에 체크해주셔야 합니다.",
                                );
                                return;
                            }

                            if (!validatePhoneNumber(customerPhone)) {
                                alert("정상적인 휴대폰 번호만 가능합니다.");
                                return false;
                            }
                            const resSend = customerSubmit(
                                customerName,
                                customerPhone,
                                siteName,
                            );

                            if (resSend) {
                                customerName = "";
                                customerPhone = "";
                                inviteChk = false;
                            }
                        }}
                    >
                        <button
                            class="w-full bg-[#ff5f11] text-white p-3 text-lg rounded-lg cursor-pointer"
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

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="hidden md:block fixed bottom-52 right-0 z-999 rounded-l overflow-hidden bg-[#f7f4ec]"
>
    <div
        class="text-center leading-none font-semibold text-xl pt-3"
        style="color:#595959;"
    >
        {#each rightFixPhone as num}
            <p>{num}</p>
        {/each}
    </div>

    <div
        class="p-1 cursor-pointer"
        onclick={() => {
            goto("/");
        }}
    >
        <img src="/right-fix/fix-1.jpg" alt="" />
    </div>
    <div
        class="p-1 cursor-pointer"
        onclick={() => {
            eventEle.scrollIntoView({ behavior: "smooth" });
        }}
    >
        <img src="/right-fix/fix-3.jpg" alt="" />
    </div>
</div>

<div class="fixed bottom-0 left-0 w-full z-999 block md:hidden">
    <div class="flex">
        {#if siteData.ld_phone_num && siteData["ld_mobile_bt_phone_img"]}
            <a href="/tel" data-sveltekit-reload>
                {#if siteData.ld_mobile_bt_phone_img}
                    <div>
                        <img
                            src={siteData["ld_mobile_bt_phone_img"].includes(
                                "http",
                            )
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
                            src={siteData["ld_mobile_bt_phone_img"].includes(
                                "http",
                            )
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

        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            class="cursor-pointer"
            onclick={() => {
                if (browser) {
                    const y =
                        eventEle.getBoundingClientRect().top +
                        window.pageYOffset -
                        135;

                    window.scrollTo({ top: y, behavior: "smooth" });
                }
            }}
        >
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
