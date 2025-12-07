<script>
    import axios from "axios";
    import { back_api, back_api_origin } from "$lib/const";
    import SortableImg from "$lib/components/SortableImg.svelte";
    import { uploadImageAct } from "$lib/uploadImage";
    import _remove from "lodash/remove";
    import _some from "lodash/some";
    import _pullAt from "lodash/pullAt";
    import { page } from "$app/stores";
    import { goto, invalidateAll } from "$app/navigation";

    let ld_id = "";
    let allData = {};

    let nowIdx = 0;

    let menuArr = [
        { pgName: "사업소개", pgLink: "introduction" },
        { pgName: "입지환경", pgLink: "environ" },
        { pgName: "프리미엄", pgLink: "premium" },
        { pgName: "상품안내", pgLink: "product" },
        {},
    ];

    let locationArr = [
        "전체",
        "서울시",
        "경기북부",
        "경기남부",
        "인천광역시",
        "충청도",
        "경상도",
        "전라도",
        "강원도",
    ];
    let tempSaveImgs = []; // 임시저장 이미지 리스트, 새로고침 / 뒤로가기시 싹 삭제됨
    let mainImgs = [];
    let bannerImgs = [];

    let modifyVal = {};
    let getId = "";

    let imgActType = "";
    export let data;

    $: data, setData();
    function setData() {
        modifyVal = data.modifyVal;
        getId = data.getId;
        if (data.modifyVal) {
            ld_id = modifyVal.ld_id;
            allData = data.modifyVal;
            console.log(allData);

            if (!allData["ld_db_location"]) {
                allData["ld_db_location"] = "";
            }
            if (allData["ld_menu"]) {
                menuArr = JSON.parse(allData["ld_menu"]);
            }

            mainImgs = modifyVal.ld_main_img
                ? modifyVal.ld_main_img.split(",")
                : [];

            bannerImgs = modifyVal.ld_banner_img
                ? modifyVal.ld_banner_img.split(",")
                : [];
            for (let i = 0; i < 5; i++) {
                if (allData[`ld_pg${i}`]) {
                    allData[`ld_pg${i}_img`] = allData[`ld_pg${i}`].split(",");
                }
            }

            if (!modifyVal.ld_sms_content) {
                allData["ld_sms_content"] = `${allData["ld_name"]} 이벤트 참여`;
            }
        }
    }

    async function deleteImageAct() {
        let imgUrlArr = [];

        switch (imgActType) {
            case "ld_logo":
                imgUrlArr = allData["ld_logo"].split("/");
                break;
            case "ld_ph_img":
                imgUrlArr = allData["ld_ph_img"].split("/");
                break;
            case "ld_popup_img":
                imgUrlArr = allData["ld_popup_img"].split("/");
                break;
            case "ld_mobile_bt_phone_img":
                console.log("여기로 들어옴?");

                imgUrlArr = allData["ld_mobile_bt_phone_img"].split("/");
                break;
            case "ld_mobile_bt_event_img":
                imgUrlArr = allData["ld_mobile_bt_event_img"].split("/");
                break;
            case "ld_event_img":
                imgUrlArr = allData["ld_event_img"].split("/");
        }

        console.log(imgUrlArr);

        const deleteImagePath = `subuploads/img/${imgUrlArr[imgUrlArr.length - 2]}/${imgUrlArr[imgUrlArr.length - 1]}`;
        console.log(deleteImagePath);

        try {
            const res = await axios.post(`${back_api}/delete_single_image`, {
                deleteImagePath,
                imgActType,
                ld_id,
            });
            if (res.status == 200) {
                if (imgActType == "ld_logo") {
                    alert("로고가 삭제 되었습니다.");
                    allData["ld_logo"] = "";
                } else if (imgActType == "ld_ph_img") {
                    alert("번호 이미지가 삭제 되었습니다.");
                    allData["ld_ph_img"] = "";
                } else if (imgActType == "ld_popup_img") {
                    alert("팝업 이미지가 삭제 되었습니다.");
                    allData["ld_popup_img"] = "";
                } else if (imgActType == "ld_mobile_bt_phone_img") {
                    alert("하단 폰 이미지가 삭제 되었습니다.");
                    allData["ld_mobile_bt_phone_img"] = "";
                } else if (imgActType == "ld_mobile_bt_event_img") {
                    alert("하단 이벤트 이미지가 삭제 되었습니다.");
                    allData["ld_mobile_bt_event_img"] = "";
                } else if (imgActType == "ld_event_img") {
                    alert("이벤트 이미지가 삭제 되었습니다.");
                    allData["ld_event_img"] = "";
                }

                invalidateAll();
            }
        } catch (error) {
            alert("에러가 발생 했습니다.");
        }
    }

    async function uploadData(e) {
        allData["ld_main_img"] = mainImgs.join(",");
        allData["ld_banner_img"] = bannerImgs.join(",");

        for (let i = 0; i < 5; i++) {
            if (allData[`ld_pg${i}_img`]) {
                allData[`ld_pg${i}`] = allData[`ld_pg${i}_img`].join(",");
            }
            delete allData[`ld_pg${i}_img`];
        }

        allData["ld_menu"] = JSON.stringify(menuArr);

        const type = e.target.value;
        console.log(type);
        const res = await axios.post(`${back_api}/upload_data`, {
            allData,
            type,
        });
        if (res.data.status) {
            let alertMessage = "";
            if (e.target.value == "upload") {
                alertMessage = "업로드가 완료 되었습니다.";
            } else {
                alertMessage = "업데이트가 완료 되었습니다.";
            }

            alert(alertMessage);
            invalidateAll();
        } else {
            alert("에러 발생 다시 시도해주세요 (중복된 도메인)");
        }
    }

    function updateMainImgList(e) {
        const imgList = e.detail.imgArr;
        mainImgs = setImgArr(imgList);
    }

    function updateBannerImgList(e) {
        const imgList = e.detail.imgArr;
        bannerImgs = setImgArr(imgList);
    }

    function updateImgList(e) {
        const imgList = e.detail.imgArr;
        allData[`ld_pg${nowIdx}_img`] = setImgArr(imgList);
    }

    function setImgArr(imgList) {
        const imgArr = imgList;
        let tempImgArr = [];

        let tempSaveImgsTemp = [...tempSaveImgs];
        for (let i = 0; i < imgArr.length; i++) {
            const imgObj = imgArr[i];
            tempImgArr.push(imgObj["src"]);
            if (!tempSaveImgsTemp.includes(imgObj["src"])) {
                tempSaveImgsTemp.push(imgObj["src"]);
            }
        }
        tempSaveImgs = tempSaveImgsTemp;
        return tempImgArr;
    }

    function uploadImageoAct() {
        console.log("일단 들어는 와?!?!?!?!");

        uploadImageAct(
            `${back_api}/img_upload_set`,
            (err, data) => {
                console.log(err);
                console.log(data);

                if (imgActType == "ld_logo") {
                    allData["ld_logo"] = data.saveUrl;
                } else if (imgActType == "ld_ph_img") {
                    allData["ld_ph_img"] = data.saveUrl;
                } else if (imgActType == "ld_popup_img") {
                    allData["ld_popup_img"] = data.saveUrl;
                } else if (imgActType == "ld_mobile_bt_phone_img") {
                    allData["ld_mobile_bt_phone_img"] = data.saveUrl;
                } else if (imgActType == "ld_mobile_bt_event_img") {
                    allData["ld_mobile_bt_event_img"] = data.saveUrl;
                } else if (imgActType == "ld_event_img") {
                    allData["ld_event_img"] = data.saveUrl;
                }
            },
            { folder: allData.ld_domain },
        );
    }

    // 사이트 복사 기능!!
    let siteCopyAreaShow = false;
    let copyDomain = "";

    async function copySite() {
        if (!copyDomain) {
            alert("복사할 도메인을 입력 해주세요");
            return;
        }

        try {
            const res = await axios.post(`${back_api}/copy_site`, {
                oldDomain: allData["ld_domain"],
                copyDomain,
            });

            alert("복사 완료! 관리자 페이지에서 확인 해주세요!");
        } catch (err) {
            console.log("에러 들어와야징");

            const m = err.response.data.message;
            alert(m ? m : "사이트 카피 실패 다시 시도해주세요.");
            return;
        }
    }
</script>

<div class="container max-w-[900px] py-10 px-3 mx-auto pretendard">
    <div>
        <table class="w-[350px] text-sm">
            <tbody>
                <tr>
                    <th class="in-th">도메인</th>
                    <td class="in-th text-center">{getId} </td>
                    <td class="in-th text-center">
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
                class="w-[350px] border mt-3 flex justify-between items-center p-3"
            >
                <div>
                    <input
                        type="text"
                        class="border w-[250px] px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500 rounded-md"
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

    <div class="mt-3">
        <span class="text-sm font-semibold">※ 사이트 설명</span>
        <div class="mt-2">
            <textarea
                rows="3"
                class="input-base w-full text-sm"
                bind:value={allData["ld_description"]}
            ></textarea>
        </div>
    </div>

    <div class="mt-3">
        <span class="text-sm font-semibold">※ 추가 스크립트 </span>
        <div class="mt-2">
            <textarea
                rows="3"
                class="input-base w-full text-sm"
                bind:value={allData["ld_add_scripts"]}
            ></textarea>
        </div>
    </div>

    <div class="w-full mt-5">
        <div class="mb-3">
            <span class="text-sm font-semibold">※ 기본 정보</span>
        </div>

        <table class="w-full text-sm">
            <tbody>
                <tr>
                    <th class="in-th w-1/6">사이트명</th>
                    <td class="in-th w-2/6">
                        <input
                            type="text"
                            class="input-base w-full"
                            bind:value={allData["ld_name"]}
                        />
                    </td>

                    <th class="in-th w-1/6">카톡 링크</th>
                    <td class="in-th w-2/6">
                        <input
                            type="text"
                            class="input-base w-full"
                            bind:value={allData["ld_kakao"]}
                        />
                    </td>
                </tr>
                <tr>
                    <th class="in-th">
                        상담 전화번호<br />
                        <span class="text-red-500">하이픈(-)필수!!!</span>
                    </th>
                    <td class="in-th">
                        <input
                            type="text"
                            class="input-base w-full"
                            bind:value={allData["ld_phone_num"]}
                        />
                    </td>
                    <th class="in-th">
                        상담 문자번호<br />
                        <span class="text-red-500"> 하이픈(-)필수!!! </span>
                    </th>
                    <td class="in-th">
                        <input
                            type="text"
                            class="input-base w-full"
                            bind:value={allData["ld_sms_num"]}
                        />
                    </td>
                </tr>

                <tr>
                    <th class="in-th"
                        >문자 내용<br />
                        <span class="text-xs font-light">
                            미입력시 기본 내용으로
                        </span>
                    </th>
                    <td class="in-th">
                        <textarea
                            rows="3"
                            class="input-base w-full"
                            bind:value={allData["ld_sms_content"]}
                        ></textarea>
                        <!-- <select
                        bind:value={allData["ld_db_location"]}
                        class="text-sm border py-2 w-full rounded-md border-gray-300"
                    >
                        <option value="">선택하세요</option>
                        <option value="up">상단</option>
                        <option value="down">하단</option>
                        <option value="both">둘다</option>
                    </select> -->
                    </td>
                    <th class="in-th">개인정보</th>
                    <td class="in-th">
                        <div
                            class="text-center flex justify-center items-center"
                        >
                            <label class="mr-3">
                                <input
                                    type="radio"
                                    value="on"
                                    class="radio radio-info radio-xs"
                                    bind:group={
                                        allData["ld_personal_info_view"]
                                    }
                                />
                                있음
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    value="off"
                                    class="radio radio-info radio-xs"
                                    bind:group={
                                        allData["ld_personal_info_view"]
                                    }
                                />
                                없음
                            </label>
                        </div>
                    </td>
                </tr>
                <tr>
                    <th class="in-th">로고이미지</th>
                    <td class="in-th">
                        <div>
                            {#if allData["ld_logo"]}
                                <div class="mb-3 border p-1 rounded-md">
                                    <img
                                        src={allData["ld_logo"].includes("http")
                                            ? allData["ld_logo"]
                                            : `${back_api_origin}${allData["ld_logo"]}`}
                                        alt=""
                                    />
                                </div>
                            {:else}
                                <div class="mb-3">이미지를 추가해주세요</div>
                            {/if}

                            {#if allData["ld_logo"]}
                                <button
                                    class="py-1 px-3 text-xs text-white rounded-md bg-red-500 active:bg-red-600"
                                    on:click={(e) => {
                                        imgActType = "ld_logo";
                                        deleteImageAct(e);
                                    }}
                                >
                                    로고 삭제
                                </button>
                            {:else}
                                <button
                                    class="py-1 px-3 text-xs text-white rounded-md bg-blue-500 active:bg-blue-600"
                                    on:click={(e) => {
                                        imgActType = "ld_logo";
                                        uploadImageoAct(e);
                                    }}
                                >
                                    로고 업로드
                                </button>
                            {/if}
                        </div>
                    </td>

                    <th class="in-th"> 전화번호 이미지 </th>
                    <td class="in-th">
                        <div>
                            {#if allData["ld_ph_img"]}
                                <div class="mb-3 border p-1 rounded-md">
                                    <img
                                        src={allData["ld_ph_img"].includes(
                                            "http",
                                        )
                                            ? allData["ld_ph_img"]
                                            : `${back_api_origin}${allData["ld_ph_img"]}`}
                                        alt=""
                                    />
                                </div>
                            {:else}
                                <div class="mb-3">이미지를 추가해주세요</div>
                            {/if}

                            {#if allData["ld_ph_img"]}
                                <button
                                    class="py-1 px-3 text-xs text-white rounded-md bg-red-500 active:bg-red-600"
                                    on:click={(e) => {
                                        imgActType = "ld_ph_img";
                                        deleteImageAct(e);
                                    }}
                                >
                                    상단 폰 이미지 삭제
                                </button>
                            {:else}
                                <button
                                    class="py-1 px-3 text-xs text-white rounded-md bg-blue-500 active:bg-blue-600"
                                    on:click={(e) => {
                                        imgActType = "ld_ph_img";
                                        uploadImageoAct(e);
                                    }}
                                >
                                    상단 폰 이미지 업로드
                                </button>
                            {/if}
                        </div>
                    </td>
                </tr>

                <tr>
                    <th class="in-th">
                        모바일 하단<br />전화번호 이미지<br />
                        <span class="text-xs text-red-600">
                            (384px X 80px 추천)
                        </span>
                    </th>
                    <td class="in-th">
                        <div>
                            {#if allData["ld_mobile_bt_phone_img"]}
                                <div class="mb-3 border p-1 rounded-md">
                                    <img
                                        src={allData[
                                            "ld_mobile_bt_phone_img"
                                        ].includes("http")
                                            ? allData["ld_mobile_bt_phone_img"]
                                            : `${back_api_origin}${allData["ld_mobile_bt_phone_img"]}`}
                                        alt=""
                                    />
                                </div>
                            {:else}
                                <div class="mb-3">이미지를 추가해주세요</div>
                            {/if}

                            {#if allData["ld_mobile_bt_phone_img"]}
                                <button
                                    class="py-1 px-3 text-xs text-white rounded-md bg-red-500 active:bg-red-600"
                                    on:click={(e) => {
                                        imgActType = "ld_mobile_bt_phone_img";
                                        deleteImageAct(e);
                                    }}
                                >
                                    모바일 하단 전화번호 이미지 삭제
                                </button>
                            {:else}
                                <button
                                    class="py-1 px-3 text-xs text-white rounded-md bg-blue-500 active:bg-blue-600"
                                    on:click={(e) => {
                                        imgActType = "ld_mobile_bt_phone_img";
                                        uploadImageoAct(e);
                                    }}
                                >
                                    모바일 하단 전화번호 이미지 업로드
                                </button>
                            {/if}
                        </div>
                    </td>

                    <th class="in-th">
                        모바일 하단<br />이벤트 이미지 <br />
                        <span class="text-xs text-red-600">
                            (384px X 80px 추천)
                        </span>
                    </th>
                    <td class="in-th">
                        <div>
                            {#if allData["ld_mobile_bt_event_img"]}
                                <div class="mb-3 border p-1 rounded-md">
                                    <img
                                        src={allData[
                                            "ld_mobile_bt_event_img"
                                        ].includes("http")
                                            ? allData["ld_mobile_bt_event_img"]
                                            : `${back_api_origin}${allData["ld_mobile_bt_event_img"]}`}
                                        alt=""
                                    />
                                </div>
                            {:else}
                                <div class="mb-3">이미지를 추가해주세요</div>
                            {/if}

                            {#if allData["ld_mobile_bt_event_img"]}
                                <button
                                    class="py-1 px-3 text-xs text-white rounded-md bg-red-500 active:bg-red-600"
                                    on:click={(e) => {
                                        imgActType = "ld_mobile_bt_event_img";
                                        deleteImageAct(e);
                                    }}
                                >
                                    모바일 하단 이벤트 이미지 삭제
                                </button>
                            {:else}
                                <button
                                    class="py-1 px-3 text-xs text-white rounded-md bg-blue-500 active:bg-blue-600"
                                    on:click={(e) => {
                                        imgActType = "ld_mobile_bt_event_img";
                                        uploadImageoAct(e);
                                    }}
                                >
                                    모바일 하단 이벤트 이미지 업로드
                                </button>
                            {/if}
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="mt-5">
        <div class="text-sm font-semibold mb-3">
            ※ 이벤트 이미지
            <span class="text-red-500">
                (이벤트 이미지 사이즈는 900 X 900!!!!)
            </span>
        </div>

        <div>
            {#if allData["ld_event_img"]}
                <div class="mb-3 border p-1 rounded-md">
                    <img
                        src={allData["ld_event_img"].includes("http")
                            ? allData["ld_event_img"]
                            : `${back_api_origin}${allData["ld_event_img"]}`}
                        alt=""
                    />
                </div>
            {:else}
                <div class="mb-3">이미지를 추가해주세요</div>
            {/if}

            {#if allData["ld_event_img"]}
                <button
                    class="py-1 px-3 text-xs text-white rounded-md bg-red-500 active:bg-red-600"
                    on:click={(e) => {
                        imgActType = "ld_event_img";
                        deleteImageAct(e);
                    }}
                >
                    이벤트 이미지 삭제
                </button>
            {:else}
                <button
                    class="py-1 px-3 text-xs text-white rounded-md bg-blue-500 active:bg-blue-600"
                    on:click={(e) => {
                        imgActType = "ld_event_img";
                        uploadImageoAct(e);
                    }}
                >
                    이벤트 이미지 업로드
                </button>
            {/if}
        </div>
    </div>

    <div class="mt-5">
        <div class="text-sm font-semibold mb-3">※ 팝업 이미지</div>
        {#if allData["ld_popup_img"]}
            <div>
                <img
                    src={allData["ld_popup_img"].includes("http")
                        ? allData["ld_popup_img"]
                        : `${back_api_origin}${allData["ld_popup_img"]}`}
                    alt=""
                />
            </div>
        {/if}

        <div>
            {#if allData["ld_popup_img"]}
                <button
                    class="py-1 px-3 text-xs text-white rounded-md bg-red-500 active:bg-red-600"
                    on:click={(e) => {
                        imgActType = "ld_popup_img";
                        deleteImageAct(e);
                    }}
                >
                    팝업 이미지 삭제
                </button>
            {:else}
                <button
                    class="py-1 px-3 text-xs text-white rounded-md bg-blue-500 active:bg-blue-600"
                    on:click={(e) => {
                        imgActType = "ld_popup_img";
                        uploadImageoAct(e);
                    }}
                >
                    팝업 이미지 업로드
                </button>
            {/if}
        </div>
    </div>

    <div class="mt-5">
        <div class="text-sm font-semibold mb-3">
            ※ 메뉴
            <span class=" font-light text-xs">
                (기본 5개 / 이름과 링크를 넣으면 아래 이미지란 자동 생성)
            </span>
        </div>
        <table class="w-full text-xs md:text-sm">
            <tbody>
                <tr>
                    <th class="in-th">메뉴이름</th>
                    <th class="in-th">링크</th>
                </tr>

                {#each menuArr as menu, idx}
                    <tr>
                        <td class="in-th">
                            <input
                                type="text"
                                class="input-base w-full"
                                bind:value={menuArr[idx]["pgName"]}
                            />
                        </td>
                        <td class="in-th">
                            <input
                                type="text"
                                class="input-base w-full"
                                bind:value={menuArr[idx]["pgLink"]}
                            />
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <div class="py-5 px-3 border border-gray-300 rounded-md mt-5">
        <span class="text-sm">▣ 배너 이미지</span>
        <SortableImg
            on:updateImgeList={updateBannerImgList}
            modifyImageList={bannerImgs}
            domainFolder={allData.ld_domain}
        />
    </div>

    <div class="py-5 px-3 border border-gray-300 rounded-md mt-5">
        <span class="text-sm">▣ 메인 이미지</span>
        <SortableImg
            on:updateImgeList={updateMainImgList}
            modifyImageList={mainImgs}
            domainFolder={allData.ld_domain}
        />
    </div>

    {#each menuArr as menu, idx}
        {#if menuArr[idx]["pgName"] && menuArr[idx]["pgLink"]}
            <div class="py-5 px-3 border border-gray-300 rounded-md mt-5">
                <span class="text-sm">▣ {menuArr[idx]["pgName"]} 이미지</span>
                <SortableImg
                    on:updateImgeList={(e) => {
                        nowIdx = idx;
                        updateImgList(e);
                    }}
                    modifyImageList={allData[`ld_pg${idx}_img`]}
                    domainFolder={allData.ld_domain}
                />
            </div>
        {/if}
    {/each}

    <div class="w-full mt-5">
        <div class="mb-3">
            <span class="text-sm font-semibold">※ 푸터 정보</span>
        </div>

        <div>
            <textarea
                class="input-base w-full"
                rows="4"
                bind:value={allData["ld_footer"]}
            ></textarea>
        </div>
    </div>

    <div class="mt-5 pb-20 text-center">
        <button
            class=" text-xl bg-blue-500 active:bg-blue-600 py-2 px-10 rounded-lg text-white"
            value="update"
            on:click={uploadData}
        >
            업데이트
        </button>
    </div>
</div>
