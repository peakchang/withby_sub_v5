<script>
    import OneImageUpload from "$lib/components/OneImageUpload.svelte";
    import axios from "axios";
    import { page } from "$app/stores";

    import SectionEdit from "$lib/components/SectionEdit.svelte";
    import {
        back_api,
        back_api_origin,
        back_api_sub,
        gcs_img,
        consentInfo,
    } from "$lib/const";

    // 메뉴 이미지용 (다중 선택 가능)
    import SortableImgMovie from "$lib/components/SortableImgMovie.svelte";

    import { goto, invalidateAll } from "$app/navigation";
    import { onMount } from "svelte";

    import { browser } from "$app/environment";
    import Modal from "$lib/components/Modal.svelte";

    import { toast } from "$lib/store.js";
    import { removeNulls } from "$lib/lib.js";

    let { data } = $props();

    let getId = $state("");
    let getDomain = $state("");
    let siteData = $state({});

    // 헤더 부분!!!
    let headerObj = $state({
        logo_width: "180",
        header_padding: "15",
        header_color: "black",
    });

    // 메뉴 부분!!
    let menuObj = $state({
        color: "white",
        padding_y: "15",
        menus: [],
    });

    // 메인 컨텐츠 주요 변수!
    let mainContents = $state([]); // 전체 메인페이지 컨텐츠 총괄! sectionObj 객체가 내부 배열 요소로 들어가야함!!

    let sectionObj = $state({ contentList: [] }); // 각 섹션을 보여줌! contentList 에는 배열 요소로 contentObj 가 들어가야함!
    let sectionIdx = $state(undefined); // 추가 및 수정 진행 할 섹션 index! (undefined 일 경우 섹션 추가 / 숫자일 경우 섹션 수정)
    let sectionMessage = $state("섹션 추가"); // 현재 하는 작업이 섹션을 추가 하는건지 아니면 n 번째 섹션을 수정하는건지 위에 표시 해주는 변수

    let contentObj = $state({}); // 각각의 컨텐츠 요소!
    let addContentType = $state("blank"); // 컨텐츠 넣을때 각각의 선택값 (radio)
    let contentIdx = $state(undefined);

    let contentModifyStatus = $state(false); // 컨텐츠 수정 및 추가 상태값 (기본값 - 추가 : false)
    let sectionModifyStatus = $state(false); // 섹션 수정 상태값 (기본값 - 추가 : false)

    let sectionModalOpen = $state(false); // 전체 섹션 수정 조정 모달

    // 사이트 복사 기능!!
    let siteCopyAreaShow = $state(false);
    let copyDomain = $state("");

    let menuName = $state("");
    let menuLink = $state("");
    let eModelType = $state("");
    let eModelLink = $state("");
    let eModelBool = $state("");

    let isOpen = $state(false);
    let selectedFont = $state({ name: "프리텐다드", class: "pretendard" });

    const fonts = [
        { name: "프리텐다드", class: "pretendard" },
        { name: "에스코어 드림", class: "escoredream" },
        { name: "페이퍼로지", class: "paperozi" },
    ];

    onMount(() => {
        getId = data.getId;
        getDomain = data.allData.ld_domain;

        siteData = data.allData;

        // 기본 변수에 값이 있어야 하는 경우 (처음 만들었을때) 기본값 지정.
        siteData.ld_invite_message ??=
            "모델하우스는 초대장이 있으신분만 방문 가능합니다.";
        siteData.ld_db_input_subject ??= "초대장 발급 확인";
        siteData.ld_invite_bool ??= "on";
        siteData.ld_reserve_msg_bool ??= "on";
        siteData.ld_btn_message ??= "예약 확인";

        // 개인정보 보호동의 전문 없을시 기본값
        if (!siteData.ld_consent_info) {
            siteData.ld_consent_info = consentInfo;
        }

        // 상단 인터랙션 기본값 없을시 기본값
        if (!siteData.ld_Interaction) {
            siteData.ld_Interaction = "fix";
        }

        console.log(siteData.ld_Interaction);

        if (siteData.ld_font) {
            selectedFont = fonts.find((v) => v.class == siteData.ld_font);
        }

        // ---------------------------------------

        if (data.ld_json_header) {
            headerObj = data.ld_json_header;
        }

        if (data.ld_json_menus) {
            menuObj = data.ld_json_menus;

            // e-모델하우스가 있으면 e-모델하우스 추가 버튼 없애기
            for (let i = 0; i < menuObj["menus"].length; i++) {
                const data = menuObj["menus"][i];
                if (data["link"] == "emodel") {
                    eModelBool = true;
                }
            }
        }
        if (data.ld_json_main) mainContents = data.ld_json_main;

        if (!siteData.ld_complete_msg) {
            siteData.ld_complete_msg = `초대장 발급이 확인 되었습니다.
배정된 담당자가 연락 드릴 예정입니다.
            `;
        }
    });

    // 섹션 완료 후 모달 닫힐때 mainContents 에 섹션 push 또는 수정 하면서 업데이트!!!
    function sectionUpdate(e) {
        // sectionModifyStatus 가 false 일 경우는 추가
        // sectionModifyStatus 가 true 인 경우는 수정
        if (!sectionModifyStatus) {
            mainContents.push(sectionObj);
        } else {
            mainContents[sectionIdx] = sectionObj;
        }

        sectionModalOpen = false;
    }

    async function updateSiteSet() {
        for (let i = 0; i < menuObj.menus.length; i++) {
            let imgArr = menuObj.menus[i].imgArr;
            if (imgArr) {
                menuObj.menus[i].imgArr = removeNulls(imgArr);
            }
        }

        for (let l = 0; l < mainContents.length; l++) {
            let tempArr = mainContents[l]["contentList"];
            if (tempArr) {
                mainContents[l]["contentList"] = removeNulls(tempArr);
            }
        }

        const ld_json_header = JSON.stringify(headerObj);
        const ld_json_main = JSON.stringify(mainContents);
        const ld_json_menus = JSON.stringify(menuObj);

        const uploadDataObj = {
            ld_json_header,
            ld_json_main,
            ld_json_menus,

            ld_font: selectedFont.class,
            ld_Interaction: siteData.ld_Interaction,

            ld_popup_img: siteData.ld_popup_img,
            ld_event_img: siteData.ld_event_img,
            ld_phone_num: siteData.ld_phone_num,
            ld_sms_num: siteData.ld_sms_num,
            ld_sms_content: siteData.ld_sms_content,
            ld_personal_info_view: siteData.ld_personal_info_view,
            ld_footer: siteData.ld_footer,
            ld_card_image: siteData.ld_card_image,

            ld_name: siteData.ld_name,
            ld_mobile_bt_phone_img: siteData.ld_mobile_bt_phone_img,
            ld_mobile_bt_event_img: siteData.ld_mobile_bt_event_img,
            ld_db_input_subject: siteData.ld_db_input_subject,

            ld_description: siteData.ld_description,
            ld_add_scripts: siteData.ld_add_scripts,
            ld_invite_message: siteData.ld_invite_message,
            ld_invite_image: siteData.ld_invite_image,
            ld_invite_bool: siteData.ld_invite_bool,

            ld_reserve_msg_bool: siteData.ld_reserve_msg_bool,
            ld_btn_message: siteData.ld_btn_message,

            ld_consent_info: siteData.ld_consent_info,
            ld_complete_msg: siteData.ld_complete_msg,
        };

        try {
            const res = await axios.post(`${back_api}/update_site_set`, {
                get_id: getId,
                uploadDataObj,
            });

            toast.set({ show: true, text: "업데이트가 완료 되었습니다." });
        } catch (err) {
            const m = err.response.data.message;

            toast.set({
                show: true,
                text: `업데이트에 실패했습니다. 에러를 확인해 주세요 ${m}`,
            });
        }
    }

    function updateImgArr(imgArr, idx) {
        const imgList = imgArr.map((e) => e.src);
        menuObj.menus[idx]["imgArr"] = imgList;
    }

    /*
    섹션 추가 및 수정시에 모달 열기
    여는 버튼의 value 가 none 일 경우 섹션 추가 / 아닐 경우 수정으로!!
    */
    function openSectionModal() {
        sectionModalOpen = true;

        if (this.value == "none") {
            // 섹션 추가일 경우 sectionModifyStatus = false / sectionObj 초기화
            sectionMessage = "섹션 추가";
            sectionModifyStatus = false;
            sectionObj = { contentList: [] };
        } else {
            // 센션 수정일 경우 sectionModifyStatus = true / 현재 섹션 값 mainContents[idx] 로 지정
            sectionIdx = this.value;
            sectionMessage = `${Number(sectionIdx) + 1}번째 섹션 수정`;
            sectionModifyStatus = true;
            sectionObj = mainContents[sectionIdx];
        }
    }

    async function deleteSection() {
        if (
            !confirm(
                "삭제하시겠습니까? 이미지는 바로 삭제되므로 삭제 후 반드시 작업 업로드를 해주세요",
            )
        ) {
            return;
        }

        sectionIdx = this.value;

        // 섹션 삭제시 섹션 내 이미지가 있으면 전부 삭제 GOGO!!! deleteImgArr 에 backgroundImg / contentList 돌면서 imgPath 있으면 넣기

        console.log(mainContents[sectionIdx]);

        const deleteImgArr = [];

        const section = mainContents[sectionIdx];

        // 배경 이미지 추가
        section.backgroundImg && deleteImgArr.push(section.backgroundImg);

        // 컨텐츠 내부 이미지 추가 (단일 이미지 : imgPath / 다중 이미지 : imgList)
        section.contentList.forEach((d) => {
            d.imgPath && deleteImgArr.push(d.imgPath);
            d.imgList?.forEach((img) => deleteImgArr.push(img.url));
        });

        if (deleteImgArr.length > 0) {
            console.log(deleteImgArr);

            console.log("이제 삭제 고고!!!");
            console.log(`${back_api_sub}/image/delete_gcs_img_many`);

            try {
                const res = await axios.post(
                    `${back_api_sub}/image/delete_gcs_img_many`,
                    {
                        delImgList: deleteImgArr,
                    },
                );
            } catch (error) {}
        }

        const tempArr = [...mainContents];

        tempArr.splice(sectionIdx, 1);
        mainContents = tempArr;

        toast.set({
            show: true,
            text: "섹션이 삭제 되었습니다. 작업 업로드를 해주세요",
        });
    }

    // 컨텐츠 이미지 업로드 함수
    function contentImageUpload(e) {
        contentObj["imgPath"] = e.detail.imgPath;
    }

    async function backgroundImageUpload(e) {
        sectionObj["backgroundImg"] = e.detail.imgPath;
        sectionObj["backgroundWidth"] = e.detail.width;
        sectionObj["backgroundHeight"] = e.detail.height;
    }

    /*
    최종적으로 들어갈 데이터 : mainContents
    
    각 섹션의 데이터 : sectionObj // mainContents 는 배열로 각각의 요소는 sectionObj 가 되어야 함
    sectionObj 는 contentList 여백 / 텍스트 / 이미지 / 유튜브 등 으로 이루어져 있는 배열로
    각각의 요소는 contentObj 객체가 되어야 함

    sectionObj 는 contentList 외적으로 backgroundImg (배경 이미지) / bgType (백그라운드 타입, 비율 또는 높이 맞춤) / paddingTopVal (상단 여백) / paddingBottomVal (하단 여백)
    으로 이루어져 있음
    */

    function add_eModel() {
        // eModelBool
        const tempArr = [...menuObj.menus];
        tempArr.push({ name: "e-모델하우스", link: "emodel", emenu: [] });
        menuObj.menus = tempArr;
        eModelBool = true;
    }

    function add_emodel_ele() {
        // menuObj.menus[this.value]['emenu']
        const emodelObj = { type: eModelType, iframe_link: eModelLink };
        const tempArr = [...menuObj.menus[this.value]["emenu"]];
        tempArr.push(emodelObj);
        menuObj.menus[this.value]["emenu"] = tempArr;
        eModelType = "";
        eModelLink = "";
    }

    async function copySite() {
        if (!copyDomain) {
            alert("복사할 도메인을 입력 해주세요");
            return;
        }

        try {
            const res = await axios.post(`${back_api}/copy_site`, {
                oldDomain: getDomain,
                copyDomain,
            });

            alert("복사 완료! 관리자 페이지에서 확인 해주세요!");
        } catch (err) {
            console.log("에러 들어와야징");

            const m = err.response.data.message;
            alert(m ? m : "사이트 카피 실패 다시 시도해주세요.");
        }
        siteCopyAreaShow = false;
    }

    function sortSection() {
        console.log(this.value);
        console.log(this.dataset.direct);
        console.log(mainContents);

        const index = Number(this.value);

        if (this.dataset.direct === "up" && index > 0) {
            [mainContents[index - 1], mainContents[index]] = [
                mainContents[index],
                mainContents[index - 1],
            ];
        } else if (
            this.dataset.direct === "down" &&
            index < mainContents.length - 1
        ) {
            [mainContents[index + 1], mainContents[index]] = [
                mainContents[index],
                mainContents[index + 1],
            ];
        } else {
            console.log("더이상 이동 불가 ㅠ");
        }
    }

    function sortMenu() {
        const index = Number(this.value);
        const direct = this.dataset.direct;
        console.log(index);
        console.log(direct);
        console.log(menuObj["menus"]);

        if (index == 0 && direct == "up") {
            toast.set({
                show: true,
                text: `순서 변경이 불가합니다.`,
            });
        } else if (index == menuObj["menus"].length - 1 && direct == "down") {
            toast.set({
                show: true,
                text: `순서 변경이 불가합니다.`,
            });
        } else if (direct == "up") {
            [menuObj["menus"][index - 1], menuObj["menus"][index]] = [
                menuObj["menus"][index],
                menuObj["menus"][index - 1],
            ];
        } else {
            [menuObj["menus"][index + 1], menuObj["menus"][index]] = [
                menuObj["menus"][index],
                menuObj["menus"][index + 1],
            ];
        }
    }
</script>

<!-- svelte-ignore event_directive_deprecated -->
<Modal bind:isOpen={sectionModalOpen} maxWidth={"90%"}>
    <SectionEdit
        {sectionObj}
        {sectionUpdate}
        {getDomain}
        closeModal={() => {
            sectionModalOpen = false;
        }}
    ></SectionEdit>
</Modal>

<!-- svelte-ignore event_directive_deprecated -->

<div class="fixed top-11 right-1/12 lg:right-1/9 xl:right-1/6 w-[200px]">
    <div class="mx-auto flex justify-end">
        <div
            class=" bg-white text-center p-3 border border-gray-300 rounded-md"
        >
            <button class="btn btn-primary btn-sm" on:click={updateSiteSet}>
                작업 업로드
            </button>
            <button
                class="btn btn-secondary btn-sm"
                on:click={() => {
                    window.open(`${$page.url.protocol}//${$page.url.host}`);
                }}
            >
                미리보기
            </button>
        </div>
    </div>
</div>

<!-- svelte-ignore event_directive_deprecated -->
<div class="container max-w-[900px] py-10 px-3 mx-auto pretendard">
    <div>
        <table class=" w-[350px]">
            <tbody>
                <tr class="text-sm">
                    <th class="in-th">도메인</th>
                    <td class="in-td text-center">{getId} </td>
                    <td class="in-td text-center">
                        <button
                            class=" bg-orange-600 px-3 py-1.5 rounded-md text-white text-xs active:bg-orange-700"
                            on:click={() => {
                                siteCopyAreaShow = !siteCopyAreaShow;
                            }}
                        >
                            사이트 복사
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>

        {#if siteCopyAreaShow}
            <div
                class="w-[350px] border border-gray-400 mt-3 flex justify-between items-center p-3"
            >
                <div class="w-full">
                    <input
                        type="text"
                        class="input-base text-xs w-full"
                        placeholder="도메인주소를 입력하세요 (영어 소문자/숫자만)"
                        bind:value={copyDomain}
                    />
                </div>
                <div class="w-[100px] text-center">
                    <button
                        class="text-sm bg-lime-700 text-white px-4 py-1.5 active:bg-lime-800 rounded-lg"
                        on:click={copySite}
                    >
                        적용
                    </button>
                </div>
            </div>
        {/if}
    </div>

    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div class="mt-3">
        <span class="text-sm font-semibold">※ 상단 헤더 스타일 </span>

        <div class=" bg-gray-100 flex items-center p-4 gap-4 text-sm">
            <label class="flex items-center gap-2">
                <input
                    type="radio"
                    class="radio radio-info radio-sm"
                    value="fix"
                    bind:group={siteData.ld_Interaction}
                />
                <span>상단 고정</span>
            </label>

            <label class="flex items-center gap-2">
                <input
                    type="radio"
                    class="radio radio-info radio-sm"
                    value="Interaction"
                    bind:group={siteData.ld_Interaction}
                />
                <span>스크롤 상호 작용</span>
            </label>
        </div>

        <span class="text-sm font-semibold">※ 폰트</span>

        <div class=" bg-gray-100 flex items-center p-4">
            <div class="w-full max-w-md">
                <!-- 커스텀 Select 드롭다운 -->
                <div class="relative">
                    <ul
                        class="bg-white border-2 border-gray-300 rounded-lg shadow-sm"
                    >
                        <!-- 선택된 항목 (항상 보이는 부분) -->
                        <li
                            class="px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg"
                            on:click={() => (isOpen = !isOpen)}
                        >
                            <span
                                class="font-medium text-gray-800 {selectedFont.class}"
                            >
                                {selectedFont.name}
                            </span>
                            <svg
                                class="w-5 h-5 text-gray-600 transition-transform duration-300 {isOpen
                                    ? 'rotate-180'
                                    : ''}"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </li>

                        <!-- 드롭다운 옵션들 -->
                        <div
                            class="overflow-hidden transition-all duration-300 ease-in-out"
                            style="max-height: {isOpen
                                ? `${fonts.length * 48}px`
                                : '0px'};"
                        >
                            <div class="border-t border-gray-200">
                                {#each fonts as font}
                                    <li
                                        class="px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors {selectedFont ===
                                        font
                                            ? 'bg-blue-100 text-blue-700 font-semibold'
                                            : 'text-gray-700'}"
                                        style="font-family: {font.class};"
                                        on:click={() => {
                                            selectedFont = {
                                                name: font.name,
                                                class: font.class,
                                            };
                                            isOpen = false;
                                        }}
                                    >
                                        {font.name}
                                    </li>
                                {/each}
                            </div>
                        </div>
                    </ul>
                </div>

                <!-- 미리보기 -->
                <!-- <div
                    class="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200"
                >
                    <p class="text-sm text-gray-500 mb-2">미리보기</p>
                    <p class="text-2xl" style="font-family: {selectedFont};">
                        안녕하세요! Hello World 123
                    </p>
                </div> -->
            </div>
        </div>
        <!-- <div class="mt-2">
            <select class="input-base text-sm px-3">
                <option value="">선택하세요</option>
                <option value="">에스코어드림</option>
                <option value="">수트</option>
                <option value="">페이퍼로지</option>
            </select>
        </div> -->
    </div>

    <div class="mt-3">
        <span class="text-sm font-semibold">※ 사이트 설명</span>
        <div class="mt-2">
            <textarea
                rows="3"
                class="input-base w-full"
                bind:value={siteData.ld_description}
            ></textarea>
        </div>
    </div>

    <div class="mt-3">
        <span class="text-sm font-semibold">※ 추가 스크립트 </span>
        <div class="mt-2">
            <textarea
                rows="3"
                class="input-base w-full"
                bind:value={siteData.ld_add_scripts}
            ></textarea>
        </div>
    </div>

    <div class="mb-5">
        <span class="text-sm font-semibold">※ 헤더 </span>
        <table class="w-full text-sm">
            <tbody>
                <tr>
                    <th class="in-th w-1/6">로고 이미지</th>
                    <td class="in-td p-2 w-2/6">
                        <OneImageUpload
                            imgPath={headerObj["logo_img"]}
                            sendImgPath={(e) => {
                                if (!e) {
                                    headerObj["logo_img"] = e;
                                } else {
                                    headerObj["logo_img"] = e.imgPath;
                                }
                            }}
                            domainFolder={getDomain}
                        />
                        <div class="mt-3">
                            사이즈 : <input
                                type="text"
                                class="input-base"
                                placeholder="미설정시 30%"
                                bind:value={headerObj["logo_width"]}
                            /> %
                        </div>
                    </td>
                    <th class="in-th w-1/6">상단 전화번호<br />이미지</th>
                    <td class="in-td p-2 w-2/6">
                        <OneImageUpload
                            imgPath={headerObj["phone_img"]}
                            sendImgPath={(e) => {
                                if (!e) {
                                    headerObj["phone_img"] = e;
                                } else {
                                    headerObj["phone_img"] = e.imgPath;
                                }
                            }}
                            domainFolder={getDomain}
                        />

                        <div class="mt-3">
                            사이즈 : <input
                                type="text"
                                class="input-base"
                                placeholder="미설정시 30%"
                                bind:value={headerObj["top_phone_width"]}
                            /> %
                        </div>
                    </td>
                </tr>

                <tr>
                    <th class="in-th w-1/6">헤더 색상</th>
                    <td class="in-td p-2 w-2/6">
                        <div class="flex">
                            <label class="mr-3 flex items-center gap-1">
                                <input
                                    type="radio"
                                    class="radio radio-primary radio-xs"
                                    value="black"
                                    bind:group={headerObj["header_color"]}
                                />
                                <span>블랙</span>
                            </label>

                            <label class="mr-3 flex items-center gap-1">
                                <input
                                    type="radio"
                                    class="radio radio-primary radio-xs"
                                    value="white"
                                    bind:group={headerObj["header_color"]}
                                />
                                <span>화이트</span>
                            </label>
                        </div>
                    </td>

                    <th class="in-th w-1/6">위아래 여백</th>
                    <td class="in-td p-2 w-2/6">
                        <input
                            type="text"
                            class="input-base"
                            bind:value={headerObj["header_padding"]}
                        />PX
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="mb-4 p-3 border border-gray-300">
        <div class="mb-3">
            ※ 메인 페이지 섹션!! <button
                class="btn btn-info btn-sm text-white ml-5"
                value="none"
                on:click={openSectionModal}
            >
                섹션 추가
                <i class="fa fa-plus-circle" aria-hidden="true"></i>
            </button>
        </div>

        {#if mainContents.length != 0}
            {#each mainContents as content, idx}
                <div
                    class="border border-gray-300 rounded-md p-2 mb-1 flex items-center"
                >
                    <div class="w-[280px] flex items-center gap-3">
                        <span>
                            {idx + 1} 번째 섹션
                        </span>

                        <button
                            class="btn btn-soft btn-accent btn-sm"
                            value={idx}
                            on:click={openSectionModal}
                        >
                            자세히 보기
                        </button>

                        <button
                            class="btn btn-soft btn-error btn-sm"
                            value={idx}
                            on:click={deleteSection}
                        >
                            섹션 삭제
                        </button>
                    </div>

                    <!-- svelte-ignore a11y_consider_explicit_label -->
                    <div class="flex items-center gap-2">
                        <button
                            class="text-blue-500"
                            value={idx}
                            data-direct="up"
                            on:click={sortSection}
                        >
                            <i
                                class="fa fa-chevron-circle-up"
                                aria-hidden="true"
                            ></i>
                        </button>

                        <button
                            class="text-blue-500"
                            value={idx}
                            data-direct="down"
                            on:click={sortSection}
                        >
                            <i
                                class="fa fa-chevron-circle-down"
                                aria-hidden="true"
                            ></i>
                        </button>
                    </div>
                </div>
            {/each}
        {/if}
    </div>

    <div class="border border-gray-300 p-3 rounded-sm">
        <div class="text-sm flex flex-wrap items-center gap-1.5">
            ※ 하부 메뉴들!! / <span class="text-sm">배경색상 :</span>
            <input
                type="text"
                class="input-base w-24"
                bind:value={menuObj["color"]}
            />

            <span class="text-sm">/ 위아래 여백 :</span>
            <input
                type="text"
                class="input-base w-24"
                bind:value={menuObj["padding_y"]}
            />

            <span class="text-sm">px / 메뉴</span>
            <input
                type="text"
                class="input-base w-24"
                placeholder="메뉴이름(한글)"
                bind:value={menuName}
            />
            <input
                type="text"
                class="input-base w-24"
                placeholder="링크주소(영어)"
                bind:value={menuLink}
            />
            <button
                class="btn btn-outline btn-success btn-sm"
                on:click={() => {
                    const menuSubObj = {
                        name: menuName,
                        link: menuLink,
                    };

                    // menuObj["menus"] 는 메뉴 리스트!! 그냥 추가 하기!!
                    menuObj["menus"].push(menuSubObj);
                    menuName = "";
                    menuLink = "";
                }}
            >
                메뉴 추가
            </button>

            {#if !eModelBool}
                <button
                    class="btn btn-outline btn-secondary btn-sm"
                    on:click={add_eModel}
                >
                    e-모델하우스
                </button>
            {/if}
        </div>

        <div class="mt-4">
            <table class="w-full">
                <tbody>
                    {#each menuObj["menus"] as menu, idx}
                        <tr>
                            <!-- e모델하우스 관련 -->
                            {#if menu.link == "emodel"}
                                <td class="w-[120px] in-td">
                                    <div>{menu.name}</div>
                                    <button
                                        class="btn btn-soft btn-secondary btn-xs"
                                        on:click={() => {
                                            menuObj["menus"].splice(idx, 1);
                                            eModelBool = false;
                                        }}
                                    >
                                        삭제
                                    </button>
                                </td>
                                <td class="border p-2">
                                    <div
                                        class="text-xs flex items-center gap-3"
                                    >
                                        <label>
                                            타입 :
                                            <input
                                                type="text"
                                                class="py-1 px-2 border focus:outline-none focus:border-blue-500 w-28"
                                                bind:value={eModelType}
                                            />
                                        </label>
                                        /
                                        <label>
                                            링크 :
                                            <input
                                                type="text"
                                                class="py-1 px-2 border focus:outline-none focus:border-blue-500"
                                                bind:value={eModelLink}
                                            />
                                        </label>

                                        <button
                                            class="btn btn-info btn-xs text-white"
                                            value={idx}
                                            on:click={add_emodel_ele}
                                        >
                                            추가하기
                                        </button>
                                    </div>

                                    <div>
                                        {#each menu["emenu"] as emenu, idx}
                                            <div class="p-1 text-xs">
                                                <span>{idx + 1}</span> -
                                                <span>타입 : {emenu.type}</span>
                                                /
                                                <span
                                                    >링크 : {emenu.iframe_link}</span
                                                >
                                            </div>
                                        {/each}
                                    </div>
                                </td>
                            {:else}
                                <!-- 기타 일반 -->
                                <td class="w-[100px] in-td text-center">
                                    <div class="relative">
                                        <div
                                            class="absolute top-0 left-0 w-full h-full bg-white hidden z-50 text-xs"
                                        >
                                            <input
                                                type="text"
                                                class="input-base w-24"
                                                placeholder="메뉴이름(한글)"
                                                bind:value={
                                                    menuObj["menus"][idx][
                                                        "name"
                                                    ]
                                                }
                                            />
                                            <input
                                                type="text"
                                                class="input-base w-24"
                                                placeholder="링크주소(영어)"
                                                bind:value={
                                                    menuObj["menus"][idx][
                                                        "link"
                                                    ]
                                                }
                                            />
                                            <button
                                                class="btn btn-success btn-xs"
                                                on:click={(e) => {
                                                    e.target.parentNode.classList.add(
                                                        "hidden",
                                                    );
                                                }}
                                            >
                                                적용
                                            </button>
                                        </div>

                                        <div class="p-2">
                                            <div>{menu.name}</div>
                                            <div>
                                                <button
                                                    class="btn btn-soft btn-secondary btn-xs"
                                                    on:click={() => {
                                                        // 삭제 부분! 배열에서 해당 부분 삭제!!
                                                        menuObj["menus"].splice(
                                                            idx,
                                                            1,
                                                        );
                                                    }}
                                                >
                                                    삭제
                                                </button>
                                                <button
                                                    class="btn btn-soft btn-success btn-xs"
                                                    on:click={(e) => {
                                                        e.target.parentNode.parentNode.firstChild.classList.remove(
                                                            "hidden",
                                                        );
                                                    }}
                                                >
                                                    수정
                                                </button>
                                            </div>

                                            <!-- svelte-ignore a11y_consider_explicit_label -->
                                            <div>
                                                <button
                                                    class="text-blue-500"
                                                    value={idx}
                                                    data-direct="up"
                                                    on:click={sortMenu}
                                                >
                                                    <i
                                                        class="fa fa-chevron-circle-up"
                                                        aria-hidden="true"
                                                    ></i>
                                                </button>

                                                <button
                                                    class="text-blue-500"
                                                    value={idx}
                                                    data-direct="down"
                                                    on:click={sortMenu}
                                                >
                                                    <i
                                                        class="fa fa-chevron-circle-down"
                                                        aria-hidden="true"
                                                    ></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="in-td">
                                    <div
                                        class="p-2 text-xs flex items-center gap-2"
                                    >
                                        <span>해당 메뉴 효과 :</span>
                                        <label class="mr-2">
                                            <input
                                                type="radio"
                                                value="on"
                                                class="radio radio-error radio-xs mr-1"
                                                bind:group={
                                                    menuObj["menus"][idx][
                                                        "effect"
                                                    ]
                                                }
                                            />
                                            <span>켜기</span>
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                value="off"
                                                class="radio radio-error radio-xs mr-1"
                                                bind:group={
                                                    menuObj["menus"][idx][
                                                        "effect"
                                                    ]
                                                }
                                            />
                                            <span>끄기</span>
                                        </label>

                                        <span>(미선택시 자동 켜짐)</span>
                                    </div>
                                    <div class="p-2">
                                        <SortableImgMovie
                                            updateImgeList={(e) => {
                                                const imgArr = e;
                                                updateImgArr(imgArr, idx);
                                            }}
                                            modifyImageList={menuObj["menus"][
                                                idx
                                            ]["imgArr"]}
                                            domainFolder={getDomain}
                                        />
                                    </div>
                                </td>
                            {/if}
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>

    <div class="border border-gray-300 rounded-md p-3 mt-5">
        <div>※팝업 이미지</div>
        <div class="mt-5">
            <OneImageUpload
                imgPath={siteData.ld_popup_img}
                sendImgPath={(e) => {
                    if (!e) {
                        // 이건 삭제시
                        siteData.ld_popup_img = e;
                    } else {
                        siteData.ld_popup_img = e.imgPath;
                    }

                    console.log(siteData.ld_popup_img);
                }}
                domainFolder={getDomain}
            />
        </div>
    </div>

    <div class="border border-gray-300 p-3 mt-5 rounded-md">
        <div>
            ※이벤트 이미지 (문자 이미지) <span class=" text-xs text-red-600">
                (이벤트 이미지 사이즈는 900 X 900!!!!)</span
            >
        </div>
        <div class="mt-5">
            <OneImageUpload
                imgPath={siteData.ld_event_img}
                sendImgPath={(e) => {
                    if (!e) {
                        // 이미지 삭제시
                        siteData.ld_event_img = e;
                    } else {
                        // 이미지 업로드시
                        siteData.ld_event_img = e.imgPath;
                    }
                }}
                domainFolder={getDomain}
            />
        </div>
    </div>

    <div class="border border-gray-300 p-3 mt-5 rounded-md">
        <div>※기타 정보</div>
        <div>
            <table class="w-full text-sm">
                <tbody>
                    <tr>
                        <th class="in-th" style="width:15%"> 사이트명 </th>
                        <td class="in-th" style="width:35%">
                            <input
                                type="text"
                                class="input-base w-full"
                                bind:value={siteData.ld_name}
                            />
                        </td>
                        <th class="in-th" style="width:15%"> DB 접수 제목 </th>
                        <td class="in-th" style="width:35%">
                            <input
                                type="text"
                                class="input-base w-full"
                                bind:value={siteData.ld_db_input_subject}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th class="in-th" style="width:15%"> 전화번호 </th>
                        <td class="in-th" style="width:35%">
                            <input
                                type="text"
                                class="input-base w-full"
                                bind:value={siteData.ld_phone_num}
                            />
                        </td>
                        <th class="in-th" style="width:15%"> 문자 전화번호 </th>
                        <td class="in-th" style="width:35%">
                            <input
                                type="text"
                                class="input-base w-full"
                                bind:value={siteData.ld_sms_num}
                            />
                        </td>
                    </tr>

                    <tr>
                        <th class="in-th text-xs">
                            <span class="font-normal"> 모바일 하단 </span>
                            <br />
                            <span class="font-normal"> 전화번호 이미지 </span>
                            <br />
                            <span class="text-xs text-red-600">
                                (384px X 80px 추천)
                            </span>
                        </th>
                        <td class="in-th">
                            <OneImageUpload
                                imgPath={siteData.ld_mobile_bt_phone_img}
                                sendImgPath={(e) => {
                                    if (!e) {
                                        siteData.ld_mobile_bt_phone_img = e;
                                    } else {
                                        siteData.ld_mobile_bt_phone_img =
                                            e.imgPath;
                                    }
                                }}
                                domainFolder={getDomain}
                            />
                        </td>
                        <th class="in-th text-xs">
                            <span class="font-normal"> 모바일 하단 </span>
                            <br />
                            <span class="font-normal"> 폼 이동 이미지 </span>
                            <br />
                            <span class="text-xs text-red-600">
                                (384px X 80px 추천)
                            </span>
                        </th>
                        <td class="in-th">
                            <OneImageUpload
                                imgPath={siteData.ld_mobile_bt_event_img}
                                sendImgPath={(e) => {
                                    if (!e) {
                                        siteData.ld_mobile_bt_event_img = e;
                                    } else {
                                        siteData.ld_mobile_bt_event_img =
                                            e.imgPath;
                                    }
                                }}
                                domainFolder={getDomain}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td colspan="4">
                            <div class="p-2 text-right text-xs">
                                각 전화번호(문자 전화번호)는 전화번호 및
                                이미지가 모두 있어야 정상 작동 되며, 모바일
                                화면에서만 노출 됩니다.
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th class="in-th" style="width:15%"> 문자내용 </th>
                        <td class="in-th" style="width:35%">
                            <textarea
                                class="input-base w-full"
                                bind:value={siteData.ld_sms_content}
                            ></textarea>
                        </td>
                        <th class="in-th" style="width:15%"> 개인정보 유무 </th>
                        <td class="in-th" style="width:35%">
                            <div class="text-center">
                                <label class="mr-3">
                                    <input
                                        type="radio"
                                        value="on"
                                        class="radio radio-info radio-sm"
                                        bind:group={
                                            siteData.ld_personal_info_view
                                        }
                                    />
                                    있음
                                </label>

                                <label>
                                    <input
                                        type="radio"
                                        value="off"
                                        class="radio radio-info radio-sm"
                                        bind:group={
                                            siteData.ld_personal_info_view
                                        }
                                    />
                                    없음
                                </label>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th class="in-th" style="width:15%"> 초대문구 </th>
                        <td class="in-th" colspan="3">
                            <div class="flex items-center">
                                <div class="w-3/4">
                                    <input
                                        type="text"
                                        class="input-base w-full"
                                        bind:value={siteData.ld_invite_message}
                                    />
                                </div>

                                <div class="text-center w-1/4">
                                    <label class="mr-3">
                                        <input
                                            type="radio"
                                            value="on"
                                            class="radio radio-info radio-sm z-10"
                                            bind:group={siteData.ld_invite_bool}
                                        />
                                        있음
                                    </label>

                                    <label>
                                        <input
                                            type="radio"
                                            value="off"
                                            class="radio radio-info radio-sm"
                                            bind:group={siteData.ld_invite_bool}
                                        />
                                        없음
                                    </label>
                                </div>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <th class="in-th" style="width:15%">
                            초대 아래 유무
                        </th>
                        <td class="in-th">
                            <div class="text-center">
                                <label class="mr-3">
                                    <input
                                        type="radio"
                                        value="on"
                                        class="radio radio-info radio-sm"
                                        bind:group={
                                            siteData.ld_reserve_msg_bool
                                        }
                                    />
                                    있음
                                </label>

                                <label>
                                    <input
                                        type="radio"
                                        value="off"
                                        class="radio radio-info radio-sm"
                                        bind:group={
                                            siteData.ld_reserve_msg_bool
                                        }
                                    />
                                    없음
                                </label>
                            </div>
                        </td>
                        <th class="in-th" style="width:15%"> 버튼 문구 </th>
                        <td class="in-th">
                            <input
                                type="text"
                                class="input-base w-full"
                                bind:value={siteData.ld_btn_message}
                            />
                        </td>
                    </tr>

                    <tr>
                        <th class="in-th">
                            <p class="text-sm">명함 이미지</p>
                            <p class="text-xs font-normal">
                                (메세지 발송시 이미지)
                            </p>
                        </th>
                        <td class="in-th">
                            <OneImageUpload
                                imgPath={siteData.ld_card_image}
                                sendImgPath={(e) => {
                                    if (!e) {
                                        siteData.ld_card_image = e;
                                    } else {
                                        siteData.ld_card_image = e.imgPath;
                                    }
                                }}
                                domainFolder={getDomain}
                            />
                        </td>
                        <th class="in-th">
                            <p class="text-sm">우측 고정 이미지</p>
                            <p class="text-xs font-normal">(정사각형 이미지)</p>
                        </th>
                        <td class="in-th">
                            <OneImageUpload
                                imgPath={siteData.ld_invite_image}
                                sendImgPath={(e) => {
                                    if (!e) {
                                        siteData.ld_invite_image = e;
                                    } else {
                                        siteData.ld_invite_image = e.imgPath;
                                    }
                                }}
                                domainFolder={getDomain}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="mt-5 border border-gray-300 p-5 rounded-md">
                <div class="mb-1">푸터 내용</div>
                <div class="mb-5">
                    <textarea
                        class="input-base w-full text-sm"
                        rows="4"
                        bind:value={siteData.ld_footer}
                    ></textarea>
                </div>

                <div class="mb-1">개인정보 보호동의 전문</div>
                <div>
                    <textarea
                        class="input-base w-full text-sm"
                        rows="8"
                        bind:value={siteData.ld_consent_info}
                    ></textarea>
                </div>

                <div class="mb-1">신청접수 완료 메세지</div>
                <div>
                    <textarea
                        class="input-base w-full text-sm"
                        rows="4"
                        bind:value={siteData.ld_complete_msg}
                    ></textarea>
                </div>
            </div>
        </div>
    </div>
</div>
