<script>
    import NameInput from "$lib/components/form-list/NameInput.svelte";
    import PhoneInput from "$lib/components/form-list/PhoneInput.svelte";
    import DateInput from "$lib/components/form-list/DateInput.svelte";
    import DateTimeInput from "$lib/components/form-list/DateTimeInput.svelte";
    import MemoInput from "$lib/components/form-list/MemoInput.svelte";

    import OneImageUpload from "$lib/components/OneImageUpload.svelte";

    import SortableImg from "$lib/components/SortableImg.svelte";
    import { toast } from "$lib/store.js";
    import moment from "moment-timezone";

    let { getDomain, closeModal, sectionUpdate, sectionObj } = $props();

    // let sectionObj = $state({ contentList: [] }); // 각 섹션을 보여줌! contentList 에는 배열 요소로 contentObj 가 들어가야함!

    // let sectionIdx = $state(undefined); // 추가 및 수정 진행 할 섹션 index! (undefined 일 경우 섹션 추가 / 숫자일 경우 섹션 수정)
    let sectionMessage = $state("섹션 추가"); // 현재 하는 작업이 섹션을 추가 하는건지 아니면 n 번째 섹션을 수정하는건지 위에 표시 해주는 변수

    let contentObj = $state({}); // 각각의 컨텐츠 요소!
    let addContentType = $state("blank"); // 컨텐츠 넣을때 각각의 선택값 (radio)
    let contentIdx = $state(undefined);

    let contentModifyStatus = $state(false); // 컨텐츠 수정 및 추가 상태값 (기본값 - 추가 : false)
    let sectionModifyStatus = $state(false); // 섹션 수정 상태값 (기본값 - 추가 : false)

    let tempForm = $state("");
    let tempRequire = $state("require");

    let setDate = moment().format("YYYY-MM-DD");

    let memoFormWord = $state("");
    let formAgreeAddWord = $state("");

    // --------------------- 섹션 내 컨텐츠 관련 --------------------
    /*
    변수 정리
    - 여백
    marginHeight

    - 텍스트
    text
    fontSize
    fontColor
    align
    effect
    delay

    - 이미지
    imgPath
    width
    align
    effect
    delay

    - 유튜브
    youtubeTag

    */

    // 컨텐츠 수정 함수
    function modifyContentFunc() {
        /*
        업로드 되어 있는 컨텐츠 수정 함수!
        기본 정리!
        contentModifyStatus (컨텐츠 추가 상태) 를 수정으로 변경 해줌 (true)
        addContentType (추가 할 컨텐츠 타입) 을 수정하는 값 기준으로 맞춤
        contentObj (컨텐츠의 정보) 를 리셋 {} 한 뒤 해당 값을 넣어줌
        contentIdx 는 this.value 로 맞춰줌 (수정한 index 값)
        */

        if (contentModifyStatus) {
            toast.set({
                show: true,
                text: "현재 컨텐츠 수정 작업을 완료 해주세요",
            });
            return;
        }

        contentObj = {};

        contentModifyStatus = true;

        addContentType = this.dataset.type;

        contentIdx = this.value;
        contentObj = sectionObj.contentList[this.value];

        console.log(contentObj);
    }

    async function deleteContentFunc() {
        /*
        컨텐츠를 삭제 하는 함수!!
        sectionObj 의 contentList 의 배열에서 해당 컨텐츠를 삭제 하면 됨! 단, 이미지일 경우 이미지 삭제까지!
        */

        if (contentModifyStatus) {
            toast.set({
                show: true,
                text: "현재 컨텐츠 수정 작업을 완료 해주세요",
            });
            return;
        }

        if (!confirm("컨텐츠 삭제를 진행합니다.")) {
            return;
        }

        const dataType = this.dataset.type;
        if (dataType == "image") {
            const imgPath = sectionObj.contentList[this.value]["imgPath"];
            const imgUrlArr = imgPath.split("/");
            const deleteImagePath = `subuploads/img/${imgUrlArr[4]}/${imgUrlArr[5]}`;

            try {
                const res = await axios.post(
                    `${back_api}/delete_single_image_only`,
                    {
                        deleteImagePath,
                    },
                );
            } catch (err) {
                console.error(err.message);
            }
        }

        sectionObj.contentList.splice(this.value, 1);
    }

    // 컨텐츠 추가 또는 수정!!!!
    function addOrUpdateContent() {
        if (addContentType == "blank") {
            if (!contentObj["marginHeight"]) {
                toast.set({ show: true, text: "여백 값을 입력 해주세요" });
                return;
            }
        } else if (addContentType == "text") {
            if (!contentObj["text"]) {
                toast.set({ show: true, text: "텍스트를 입력 해주세요" });
                return;
            }
            contentObj["text"] = contentObj["text"].replace(
                /\r\n|\r|\n/g,
                "\n",
            );
        } else if (addContentType == "image") {
            if (!contentObj["imgPath"]) {
                toast.set({ show: true, text: "이미지를 업로드 해주세요" });
                return;
            }
        } else if (addContentType == "image_list") {
            if (!contentObj["imgList"] || contentObj["imgList"].length == 0) {
                toast.set({ show: true, text: "이미지를 업로드 해주세요" });
                return;
            }
        } else if (addContentType == "youtube") {
            if (!contentObj["youtubeTag"]) {
                toast.set({ show: true, text: "유튜브 링크를 입력 해주세요" });
                return;
            }
        } else if (addContentType == "form") {
            if (!contentObj["formList"] || contentObj["formList"].length == 0) {
                toast.set({ show: true, text: "폼을 선택해 주세요" });
                return;
            }

            if (
                contentObj["formInviteType"] == "text" &&
                !contentObj["formSubjectText"]
            ) {
                toast.set({
                    show: true,
                    text: "폼 상단 문구를 입력해 주세요",
                });
                return;
            }

            if (
                contentObj["formButtonType"] == "text" &&
                !contentObj["formButtonText"]
            ) {
                toast.set({
                    show: true,
                    text: "버튼 문구를 입력해 주세요",
                });
                return;
            }
        }

        /*
        contentIdx 가 undefined / contentModifyStatus 가 false 면 새로 추가 (맨 뒤에 push)
        contentIdx 가 숫자 / contentModifyStatus 가 false 면 중간에 추가
        contentIdx 가 숫자 / contentModifyStatus 가 true 면 해당 요소 수정
        contentIdx 가 undefined / contentModifyStatus false 인 경우는 없음 (수정시에 무조건 contentIdx 에 값 부여)
        */
        if (contentIdx == undefined && contentModifyStatus == false) {
            // 컨텐츠 삽입시 contentList 에 push
            sectionObj.contentList.push(contentObj);
        } else if (contentIdx && contentModifyStatus == false) {
            // 컨텐츠 중간에 삽입시
            sectionObj.contentList.splice(contentIdx, 0, contentObj);
        } else if (contentIdx && contentModifyStatus == true) {
            // 컨텐츠 수정시 해당 내용 변경 후 contentModifyStatus false 로 만들기
            sectionObj.contentList[contentIdx] = contentObj;
            contentModifyStatus = false;
        }

        // 작업 완료 후 contentIdx / contentObj 초기화
        contentIdx = undefined;
        contentObj = {};
    }

    function cancleUpdateContent() {
        /*
        현재 컨텐츠 수정중이라면 수정 작업 취소하는 함수!
        contentModifyStatus (컨텐츠 추가 상태) 를 기본(추가) 로 변경
        addContentType (추가 할 컨텐츠 타입) 을 기본값 "blank" 로 맞춤
        contentObj (컨텐츠의 정보) 를 리셋 {}
        */
        contentModifyStatus = false;
        addContentType = "blank";
        contentObj = {};
    }

    function generateYouTubeIframe(url) {
        const match = url.match(
            /(?:youtu\.be\/|v=|\/embed\/)([a-zA-Z0-9_-]{11})/,
        );
        const videoId = match ? match[1] : null;

        if (!videoId) {
            return false;
        }

        return `<iframe class="youtube-iframe" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }

    function iframeToWatchURL(iframeString) {
        const match = iframeString.match(
            /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        );
        const videoId = match ? match[1] : null;

        return `https://www.youtube.com/watch?v=${videoId}`;
    }

    function addFormList() {
        // contentObj["formList"] 가 undefined 일수 있으니 없으면 일단 배열 생성
        if (!contentObj["formList"]) {
            contentObj["formList"] = [
                { type: "name", require: true },
                { type: "phone", require: true },
            ];
        }

        // 메모면 문구 필수! 아니면 type 에 넣어서 push

        const obj = {};
        let requireBool;
        if (tempRequire == "require") {
            requireBool = true;
        } else {
            requireBool = false;
        }
        if (!tempForm) {
            toast.set({
                show: true,
                text: "추가 할 타입을 선택 해 주세요",
            });
            return;
        } else if (tempForm == "memo" && !memoFormWord) {
            toast.set({
                show: true,
                text: "문구를 작성 해 주세요.",
            });
            return;
        } else if (tempForm == "memo") {
            obj["type"] = tempForm;
            obj["word"] = memoFormWord;
            obj["require"] = requireBool;
        } else {
            obj["type"] = tempForm;
            obj["require"] = requireBool;
        }

        const isExist = contentObj["formList"].some(
            (item) => item.type === tempForm,
        );
        if (tempForm != "memo" && isExist) {
            toast.set({
                show: true,
                text: "선택하신 항목이 이미 존재합니다. 삭제 후 진행 해 주세요",
            });
            return;
        }

        contentObj["formList"].push(obj);
        memoFormWord = "";
    }

    function deleteFormList() {
        if (!contentObj["formList"] || contentObj["formList"].length == 0) {
            toast.set({
                show: true,
                text: "더이상 삭제할 내용이 없습니다.",
            });
            return;
        }

        if (tempForm == "memo" && !memoFormWord) {
            toast.set({
                show: true,
                text: "메모 타입 삭제시에는 삭제하실 메모의 문구도 함께 입력 해주세요",
            });
            return;
        }

        let index = 0;
        if (tempForm != "memo") {
            index = contentObj["formList"].findIndex(
                (item) => item.type === tempForm,
            );
        } else {
            index = contentObj["formList"].findIndex(
                (item) => item.type === tempForm && item.word === memoFormWord,
            );
        }

        if (index === -1) {
            toast.set({
                show: true,
                text: "선택한 조건에 삭제할 내용이 없습니다.",
            });
            return;
        } else {
            contentObj["formList"].splice(index, 1);
        }
    }

    function formTabInitial() {
        // contentObj["formList"] 기본값 부여
        if (!contentObj["formList"]) {
            contentObj["formList"] = [{ type: "name" }, { type: "phone" }];
        }
        if (!contentObj["formList"]) {
            contentObj["formAgreeAddWord"] = [];
        }

        if (!contentObj["formInviteType"]) {
            contentObj["formInviteType"] = "image";
        }

        if (!contentObj["formButtonType"]) {
            contentObj["formButtonType"] = "image";
        }

        if (!contentObj["fixedBottom"]) {
            contentObj["fixedBottom"] = "nonfixed";
        }
    }

    function formTabOut() {
        // contentObj["formList"] = null;
        // contentObj["formAgreeAddWord"] = null;
    }

    function addFormAgreeAddWord() {
        if (!contentObj["formAgreeAddWord"]) {
            contentObj["formAgreeAddWord"] = [];
        }
        contentObj["formAgreeAddWord"].push(formAgreeAddWord);
        formAgreeAddWord = "";
    }

    function deleteFormAddgreeAddWord() {}
</script>

<div class="mt-4">
    <div class="text-2xl font-bold mb-4">
        {sectionMessage}
    </div>
    <table class="w-full text-sm">
        <tbody>
            <tr>
                <th class="in-th">백그라운드 이미지</th>
                <td class="in-td w-3/4 p-2">
                    <OneImageUpload
                        imgPath={sectionObj["backgroundImg"]}
                        sendImgPath={(e) => {
                            sectionObj["backgroundImg"] = e.imgPath;
                            sectionObj["backgroundWidth"] = e.width;
                            sectionObj["backgroundHeight"] = e.height;
                        }}
                        domainFolder={getDomain}
                    />
                </td>
            </tr>
            <tr>
                <th class="in-th">섹션 타입</th>
                <td class="in-td w-3/4">
                    <div class="p-1.5">
                        <label class="mr-3">
                            <input
                                type="radio"
                                value="ratio"
                                class="radio radio-success mr-1 radio-sm"
                                bind:group={sectionObj["bgType"]}
                            />
                            <span class="text-sm">비율 맞춤</span>
                            <span class="text-xs">(메인 이미지용)</span>
                        </label>

                        <label>
                            <input
                                type="radio"
                                value="height"
                                class="radio radio-success mr-1 radio-sm"
                                checked="checked"
                                bind:group={sectionObj["bgType"]}
                            />
                            <span class="text-sm">높이 맞춤</span>
                            <span class="text-xs">(하부 이미지용)</span>
                        </label>

                        /

                        <span class="text-sm">상단 여백 : </span>
                        <input
                            type="text"
                            class="input-base w-16"
                            bind:value={sectionObj["paddingTopVal"]}
                        />

                        <span class="text-sm">하단 여백 : </span>
                        <input
                            type="text"
                            class="input-base w-16"
                            bind:value={sectionObj["paddingBottomVal"]}
                        />
                    </div>

                    <div class="text-right text-xs pr-8 text-red-400">
                        ※ 상단 / 하단 여백은 높이 맞춤용이므로, 비율맞춤에선
                        적용 안됨!
                    </div>
                </td>
            </tr>

            <tr>
                <td class="in-td p-2" colspan="2">
                    여기가 컨텐츠 리스트 부분!
                    {#if sectionObj.contentList.length != 0}
                        {#each sectionObj.contentList as content, idx}
                            {#if content["marginHeight"]}
                                <div class="border border-gray-300 p-2">
                                    <span>({idx + 1})</span>
                                    <button
                                        class="btn btn-outline btn-info btn-sm mr-1"
                                        value={idx}
                                        data-type="blank"
                                        onclick={modifyContentFunc}
                                    >
                                        수정
                                    </button>

                                    <button
                                        class="btn btn-outline btn-error btn-sm mr-3"
                                        value={idx}
                                        data-type="blank"
                                        onclick={deleteContentFunc}
                                    >
                                        삭제
                                    </button>
                                    여백 : {content.marginHeight} px
                                </div>
                            {:else if content["text"]}
                                <div class="border border-gray-300 p-2">
                                    <span>({idx + 1})</span>
                                    <button
                                        class="btn btn-outline btn-info btn-sm mr-1"
                                        value={idx}
                                        data-type="text"
                                        onclick={modifyContentFunc}
                                    >
                                        수정
                                    </button>

                                    <button
                                        class="btn btn-outline btn-error btn-sm mr-3"
                                        value={idx}
                                        data-type="text"
                                        onclick={deleteContentFunc}
                                    >
                                        삭제
                                    </button>
                                    <span>텍스트 : {content.text}</span> /
                                    <span>사이즈 : {content.fontSize}</span>
                                    /
                                    <span>정렬 : {content.align}</span> /
                                    <span>효과 : {content.effect}</span> /
                                    <span>딜레이 : {content.delay}</span>
                                </div>
                            {:else if content["imgPath"]}
                                <div class="border border-gray-300 p-2">
                                    <span>({idx + 1})</span>
                                    <button
                                        class="btn btn-outline btn-info btn-sm mr-1"
                                        value={idx}
                                        data-type="image"
                                        onclick={modifyContentFunc}
                                    >
                                        수정
                                    </button>

                                    <button
                                        class="btn btn-outline btn-error btn-sm mr-3"
                                        value={idx}
                                        data-type="image"
                                        onclick={deleteContentFunc}
                                    >
                                        삭제
                                    </button>
                                    이미지 :

                                    <div class="m-2 p-2 bg-gray-400">
                                        {#if content.imgPath.includes("http")}
                                            <img
                                                src={content.imgPath}
                                                alt=""
                                                width="150"
                                                height="150"
                                            />
                                            <!-- `${back_api_origin}${content.imgPath}` -->
                                        {:else}
                                            <img
                                                src={`${gcs_img}/${content.imgPath}`}
                                                alt=""
                                                width="150"
                                                height="150"
                                            />
                                        {/if}
                                    </div>

                                    <span>가로값 : {content.width}</span> /
                                    <span>정렬 : {content.align}</span> /
                                    <span>효과 : {content.effect}</span> /
                                    <span>딜레이 : {content.delay}</span> /
                                </div>
                            {:else if content["imgList"]}
                                <div class="border border-gray-300 p-2">
                                    <span>({idx + 1})</span>
                                    <button
                                        class="btn btn-outline btn-info btn-sm mr-1"
                                        value={idx}
                                        data-type="image_list"
                                        onclick={modifyContentFunc}
                                    >
                                        수정
                                    </button>

                                    <button
                                        class="btn btn-outline btn-error btn-sm mr-3"
                                        value={idx}
                                        data-type="image_list"
                                        onclick={deleteContentFunc}
                                    >
                                        삭제
                                    </button>
                                    이미지 :여러개
                                </div>
                            {:else if content["youtubeTag"]}
                                <div class="border border-gray-300 p-2">
                                    <span>({idx + 1})</span>
                                    <button
                                        class="btn btn-outline btn-info btn-sm mr-1"
                                        value={idx}
                                        data-type="youtube"
                                        onclick={modifyContentFunc}
                                    >
                                        수정
                                    </button>

                                    <button
                                        class="btn btn-outline btn-error btn-sm mr-3"
                                        value={idx}
                                        data-type="youtube"
                                        onclick={deleteContentFunc}
                                    >
                                        삭제
                                    </button>

                                    <div class=" w-28">
                                        영상 :
                                        {@html content.youtubeTag}
                                    </div>
                                </div>
                            {:else if content["formList"]}
                                <div class="border border-gray-300 p-2">
                                    <span>({idx + 1})</span>
                                    <button
                                        class="btn btn-outline btn-info btn-sm mr-1"
                                        value={idx}
                                        data-type="form"
                                        onclick={modifyContentFunc}
                                    >
                                        수정
                                    </button>

                                    <button
                                        class="btn btn-outline btn-error btn-sm mr-3"
                                        value={idx}
                                        data-type="form"
                                        onclick={deleteContentFunc}
                                    >
                                        삭제
                                    </button>

                                    <span>폼폼</span>
                                </div>
                            {:else}
                                <div class="border border-gray-300 p-2">
                                    <span>({idx + 1})</span>
                                    <button
                                        class="btn btn-outline btn-error btn-sm mr-3"
                                        value={idx}
                                        data-type="youtube"
                                        onclick={deleteContentFunc}
                                    >
                                        삭제
                                    </button>
                                </div>
                            {/if}
                        {/each}
                    {/if}
                    <div class="p-2">
                        <label class="mr-3">
                            <input
                                type="radio"
                                value="blank"
                                class="radio radio-success radio-xs"
                                bind:group={addContentType}
                                disabled={contentModifyStatus}
                            />
                            <span class="ml-0.5">여백</span>
                        </label>

                        <label class="mr-3">
                            <input
                                type="radio"
                                value="text"
                                class="radio radio-success radio-xs"
                                bind:group={addContentType}
                                disabled={contentModifyStatus}
                            />
                            <span class="ml-0.5">텍스트</span>
                        </label>

                        <label class="mr-3">
                            <input
                                type="radio"
                                value="image"
                                class="radio radio-success radio-xs"
                                bind:group={addContentType}
                                disabled={contentModifyStatus}
                            />
                            <span class="ml-0.5">이미지</span>
                        </label>

                        <label class="mr-3">
                            <input
                                type="radio"
                                value="image_list"
                                class="radio radio-success radio-xs"
                                bind:group={addContentType}
                                disabled={contentModifyStatus}
                            />
                            <span class="ml-0.5">여러 이미지</span>
                        </label>

                        <label class="mr-5">
                            <input
                                type="radio"
                                value="youtube"
                                class="radio radio-success radio-xs"
                                bind:group={addContentType}
                                disabled={contentModifyStatus}
                            />
                            <span class="ml-0.5">유튜브</span>
                        </label>

                        <label class="mr-5">
                            <input
                                type="radio"
                                value="form"
                                class="radio radio-success radio-xs"
                                bind:group={addContentType}
                                disabled={contentModifyStatus}
                                onfocusin={formTabInitial}
                                onfocusout={formTabOut}
                            />
                            <span class="ml-0.5">신청폼</span>
                        </label>

                        <input
                            type="text"
                            class="input-base w-16"
                            bind:value={contentIdx}
                        />
                        <span class="text-xs"
                            >(중간에 삽입하려면 원하는 부분 - 1 을 입력하세요)
                        </span>
                    </div>

                    {#if addContentType == "blank"}
                        <div
                            class="my-3 py-2 text-center border border-green-500"
                        >
                            <div class="text-base mb-5">
                                <span>여백 삽입</span>
                            </div>

                            <div class="w-[90%] md:w-1/2 mx-auto">
                                <table class="w-full">
                                    <tbody>
                                        <tr>
                                            <th class="in-th"> 여백 높이 </th>
                                            <td class="in-th">
                                                <input
                                                    type="text"
                                                    class="input-base w-36"
                                                    bind:value={
                                                        contentObj[
                                                            "marginHeight"
                                                        ]
                                                    }
                                                /> px
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    {:else if addContentType == "text"}
                        <div
                            class="my-3 py-2 text-center border border-green-500"
                        >
                            <div class="mb-2 text-base">
                                <span>텍스트 삽입</span>
                                <span class="text-xs"
                                    >(텍스트 넣을때만 입력 해주세요)</span
                                >
                            </div>
                            <div class="w-[90%] md:w-1/2 mx-auto">
                                <table class="w-full">
                                    <tbody>
                                        <tr>
                                            <th class="in-th"> 텍스트 </th>
                                            <td class="in-th">
                                                <textarea
                                                    class="input-base w-full"
                                                    rows="3"
                                                    bind:value={
                                                        contentObj["text"]
                                                    }
                                                ></textarea>
                                            </td>
                                        </tr>

                                        <tr>
                                            <th class="in-th"> 폰트 사이즈 </th>
                                            <td class="in-th">
                                                <input
                                                    type="text"
                                                    class="input-base w-36"
                                                    bind:value={
                                                        contentObj["fontSize"]
                                                    }
                                                />
                                                <span>px</span>
                                            </td>
                                        </tr>

                                        <tr>
                                            <th class="in-th"> 폰트 색상 </th>
                                            <td class="in-th">
                                                <input
                                                    type="text"
                                                    class="input-base w-36"
                                                    bind:value={
                                                        contentObj["fontColor"]
                                                    }
                                                />
                                            </td>
                                        </tr>

                                        <tr>
                                            <th class="in-th"> 정렬 기준 </th>
                                            <td class="in-th">
                                                <label>
                                                    <input
                                                        type="radio"
                                                        class="radio radio-success radio-xs"
                                                        value="left"
                                                        bind:group={
                                                            contentObj["align"]
                                                        }
                                                    />
                                                    <span class="ml-0.5"
                                                        >왼쪽</span
                                                    >
                                                </label>

                                                <label>
                                                    <input
                                                        type="radio"
                                                        class="radio radio-success radio-xs"
                                                        value="center"
                                                        bind:group={
                                                            contentObj["align"]
                                                        }
                                                    />
                                                    <span class="ml-0.5"
                                                        >가운데</span
                                                    >
                                                </label>

                                                <label>
                                                    <input
                                                        type="radio"
                                                        class="radio radio-success radio-xs"
                                                        value="right"
                                                        bind:group={
                                                            contentObj["align"]
                                                        }
                                                    />
                                                    <span class="ml-0.5"
                                                        >오른쪽</span
                                                    >
                                                </label>
                                            </td>
                                        </tr>

                                        <tr>
                                            <th class="in-th"> 효과 </th>
                                            <td class="in-th">
                                                <label class="mr-3"
                                                    ><input
                                                        type="radio"
                                                        class="radio radio-info radio-xs"
                                                        value="on"
                                                        bind:group={
                                                            contentObj["effect"]
                                                        }
                                                    />
                                                    <span>켜기</span>
                                                </label>

                                                <label class="mr-3"
                                                    ><input
                                                        type="radio"
                                                        class="radio radio-info radio-xs"
                                                        value="off"
                                                        bind:group={
                                                            contentObj["effect"]
                                                        }
                                                    />
                                                    <span>끄기</span>
                                                </label>
                                            </td>
                                        </tr>

                                        <tr>
                                            <th class="in-th"> 딜레이 </th>
                                            <td class="in-th">
                                                <input
                                                    type="text"
                                                    class="input-base w-24"
                                                    bind:value={
                                                        contentObj["delay"]
                                                    }
                                                /> (100 = 1초)
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    {:else if addContentType == "image"}
                        <div
                            class="my-3 py-2 text-center border border-blue-500"
                        >
                            <div class="text-base mb-3">
                                <span>이미지 삽입</span>
                                <span class="text-xs">
                                    (이미지 사이즈는 섹션 높이보다 작게
                                    해주세요)
                                </span>
                            </div>

                            <div class="w-[90%] md:w-2/3 mx-auto">
                                <table class="w-full">
                                    <tbody>
                                        <tr>
                                            <th class="in-th"> 이미지 </th>
                                            <td class="in-th">
                                                <OneImageUpload
                                                    imgPath={contentObj[
                                                        "imgPath"
                                                    ]}
                                                    sendImgPath={(e) => {
                                                        contentObj["imgPath"] =
                                                            e.imgPath;
                                                    }}
                                                    domainFolder={getDomain}
                                                />
                                            </td>
                                        </tr>

                                        <tr>
                                            <th class="in-th">
                                                이미지 가로 사이즈
                                            </th>
                                            <td class="in-th">
                                                <input
                                                    type="text"
                                                    class="input-base w-24"
                                                    bind:value={
                                                        contentObj["width"]
                                                    }
                                                /> %
                                            </td>
                                        </tr>

                                        <tr>
                                            <th class="in-th"> 정렬 기준 </th>
                                            <td class="in-th">
                                                <div
                                                    class="flex items-center justify-center gap-3"
                                                >
                                                    <label>
                                                        <input
                                                            type="radio"
                                                            class="radio radio-success radio-xs"
                                                            value="left"
                                                            bind:group={
                                                                contentObj[
                                                                    "align"
                                                                ]
                                                            }
                                                        />
                                                        <span class="ml-0.5">
                                                            왼쪽
                                                        </span>
                                                    </label>

                                                    <label>
                                                        <input
                                                            type="radio"
                                                            class="radio radio-success radio-xs"
                                                            value="center"
                                                            bind:group={
                                                                contentObj[
                                                                    "align"
                                                                ]
                                                            }
                                                        />
                                                        <span class="ml-0.5">
                                                            가운데
                                                        </span>
                                                    </label>

                                                    <label>
                                                        <input
                                                            type="radio"
                                                            class="radio radio-success radio-xs"
                                                            value="right"
                                                            bind:group={
                                                                contentObj[
                                                                    "align"
                                                                ]
                                                            }
                                                        />
                                                        <span class="ml-0.5">
                                                            오른쪽
                                                        </span>
                                                    </label>
                                                </div>
                                            </td>
                                        </tr>

                                        <tr>
                                            <th class="in-th"> 효과 </th>
                                            <td class="in-th">
                                                <div
                                                    class="flex justify-center items-center gap-3"
                                                >
                                                    <label>
                                                        <input
                                                            type="radio"
                                                            class="radio radio-info radio-xs"
                                                            value="on"
                                                            bind:group={
                                                                contentObj[
                                                                    "effect"
                                                                ]
                                                            }
                                                        />
                                                        <span class="ml-0.5">
                                                            켜기
                                                        </span>
                                                    </label>

                                                    <label>
                                                        <input
                                                            type="radio"
                                                            class="radio radio-info radio-xs"
                                                            value="off"
                                                            bind:group={
                                                                contentObj[
                                                                    "effect"
                                                                ]
                                                            }
                                                        />
                                                        <span class="ml-0.5">
                                                            끄기
                                                        </span>
                                                    </label>
                                                </div>
                                            </td>
                                        </tr>

                                        <tr>
                                            <th class="in-th"> 딜레이 </th>
                                            <td class="in-th">
                                                <input
                                                    type="text"
                                                    class="input-base w-36"
                                                    bind:value={
                                                        contentObj["delay"]
                                                    }
                                                /> (100 = 1초)
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    {:else if addContentType == "image_list"}
                        <div
                            class="my-3 py-2 text-center border border-blue-500"
                        >
                            <div class="text-base mb-3">
                                <span>여러 이미지 삽입</span>
                            </div>

                            <div>
                                <SortableImg
                                    loadImgArr={contentObj["imgList"]}
                                    updateImg={(e) => {
                                        contentObj["imgList"] = e.map(
                                            ({ id, ...rest }) => rest,
                                        );
                                    }}
                                    folder={getDomain}
                                ></SortableImg>
                                <!-- <OneImageUpload
                                        imgPath={contentObj["imgPath"]}
                                        sendImgPath={(e) => {
                                            contentObj["imgPath"] = e;
                                        }}
                                        domainFolder={getDomain}
                                    /> -->
                            </div>

                            <div class="w-[90%] md:w-2/3 mx-auto">
                                <table class="w-full">
                                    <tbody>
                                        <tr>
                                            <th class="in-th">
                                                이미지 가로 사이즈
                                            </th>
                                            <td class="in-th">
                                                <input
                                                    type="text"
                                                    class="input-base w-36"
                                                    bind:value={
                                                        contentObj["width"]
                                                    }
                                                /> %
                                            </td>
                                        </tr>

                                        <tr>
                                            <th class="in-th">
                                                이미지 간 여백
                                            </th>
                                            <td class="in-th">
                                                <input
                                                    type="text"
                                                    class="input-base w-36"
                                                    bind:value={
                                                        contentObj["margin"]
                                                    }
                                                /> px
                                            </td>
                                        </tr>

                                        <tr>
                                            <th class="in-th"> 정렬 기준 </th>
                                            <td class="in-th">
                                                <div
                                                    class="flex justify-center items-center gap-3"
                                                >
                                                    <label>
                                                        <input
                                                            type="radio"
                                                            class="radio radio-success radio-xs"
                                                            value="left"
                                                            bind:group={
                                                                contentObj[
                                                                    "align"
                                                                ]
                                                            }
                                                        />
                                                        <span class="ml-0.5"
                                                            >왼쪽</span
                                                        >
                                                    </label>

                                                    <label>
                                                        <input
                                                            type="radio"
                                                            class="radio radio-success radio-xs"
                                                            value="center"
                                                            bind:group={
                                                                contentObj[
                                                                    "align"
                                                                ]
                                                            }
                                                        />
                                                        <span class="ml-0.5"
                                                            >가운데</span
                                                        >
                                                    </label>

                                                    <label>
                                                        <input
                                                            type="radio"
                                                            class="radio radio-success radio-xs"
                                                            value="right"
                                                            bind:group={
                                                                contentObj[
                                                                    "align"
                                                                ]
                                                            }
                                                        />
                                                        <span class="ml-0.5"
                                                            >오른쪽</span
                                                        >
                                                    </label>
                                                </div>
                                            </td>
                                        </tr>

                                        <tr>
                                            <th class="in-th"> 효과 </th>
                                            <td class="in-th">
                                                <div
                                                    class="flex justify-center items-center gap-3"
                                                >
                                                    <label>
                                                        <input
                                                            type="radio"
                                                            class="radio radio-info radio-xs"
                                                            value="on"
                                                            bind:group={
                                                                contentObj[
                                                                    "effect"
                                                                ]
                                                            }
                                                        />
                                                        <span class="ml-0.5"
                                                            >켜기</span
                                                        >
                                                    </label>

                                                    <label>
                                                        <input
                                                            type="radio"
                                                            class="radio radio-info radio-xs"
                                                            value="off"
                                                            bind:group={
                                                                contentObj[
                                                                    "effect"
                                                                ]
                                                            }
                                                        />
                                                        <span class="ml-0.5"
                                                            >끄기</span
                                                        >
                                                    </label>
                                                </div>
                                            </td>
                                        </tr>

                                        <tr>
                                            <th class="in-th"> 딜레이 </th>
                                            <td class="in-th">
                                                <input
                                                    type="text"
                                                    class="input-base w-24"
                                                    bind:value={
                                                        contentObj["delay"]
                                                    }
                                                /> (100 = 1초)
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    {:else if addContentType == "youtube"}
                        <div
                            class="my-3 py-2 text-center border border-blue-500"
                        >
                            <div class="mt-3">
                                {#if contentObj["youtubeTag"]}
                                    <div class="my-5 flex justify-center">
                                        {@html contentObj["youtubeTag"]}
                                    </div>
                                {/if}

                                <div
                                    class="flex justify-center items-center gap-2"
                                >
                                    <span>유튜브 링크 :</span>
                                    <input
                                        type="text"
                                        class="input-base w-full md:w-1/3"
                                        bind:value={contentObj["youtubeTag"]}
                                    />
                                    <button
                                        class="btn btn-info btn-sm text-white"
                                        onclick={() => {
                                            const tempTag =
                                                generateYouTubeIframe(
                                                    contentObj["youtubeTag"],
                                                );
                                            if (!tempTag) {
                                                toast.set({
                                                    show: true,
                                                    text: "유효한 유튜브 링크가 아닙니다.",
                                                });
                                            } else {
                                                contentObj["youtubeTag"] =
                                                    tempTag;
                                            }
                                        }}
                                    >
                                        적용
                                    </button>
                                </div>
                            </div>
                        </div>
                    {:else if addContentType == "form"}
                        <div
                            class="my-3 py-2 text-center border border-blue-500"
                        >
                            <div>
                                <div class="text-lg font-semibold mb-3">
                                    ※ 폼 선택
                                </div>
                                <div
                                    class="flex justify-center items-center gap-5"
                                >
                                    <label>
                                        <input
                                            type="radio"
                                            value="name"
                                            class="radio radio-primary radio-sm"
                                            bind:group={tempForm}
                                        />
                                        <span>이름</span>
                                    </label>

                                    <label>
                                        <input
                                            type="radio"
                                            value="phone"
                                            class="radio radio-primary radio-sm"
                                            bind:group={tempForm}
                                        />
                                        <span>전화번호</span>
                                    </label>

                                    <label>
                                        <input
                                            type="radio"
                                            value="date"
                                            class="radio radio-primary radio-sm"
                                            bind:group={tempForm}
                                        />
                                        <span>날짜</span>
                                    </label>

                                    <label>
                                        <input
                                            type="radio"
                                            value="datetime"
                                            class="radio radio-primary radio-sm"
                                            bind:group={tempForm}
                                        />
                                        <span>날짜/시간</span>
                                    </label>

                                    <label>
                                        <input
                                            type="radio"
                                            value="memo"
                                            class="radio radio-primary radio-sm"
                                            bind:group={tempForm}
                                        />
                                        <span>메모</span>
                                    </label>

                                    <div>
                                        <button
                                            class="btn btn-primary btn-sm"
                                            onclick={addFormList}
                                        >
                                            추가
                                        </button>
                                        <button
                                            class="btn btn-error btn-sm text-white"
                                            onclick={deleteFormList}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>

                                {#if tempForm}
                                    <div class="mt-2">
                                        <div
                                            class="flex justify-center items-center gap-3"
                                        >
                                            <label>
                                                <input
                                                    type="radio"
                                                    value="require"
                                                    class="radio radio-primary radio-sm"
                                                    bind:group={tempRequire}
                                                />
                                                <span>필수</span>
                                            </label>

                                            <label>
                                                <input
                                                    type="radio"
                                                    value="choice"
                                                    class="radio radio-primary radio-sm"
                                                    bind:group={tempRequire}
                                                />
                                                <span>선택</span>
                                            </label>
                                        </div>
                                    </div>
                                {/if}
                                {#if tempForm == "memo"}
                                    <div class="mt-3">
                                        <div>
                                            <span class="mr-2"
                                                >메모 문구 :
                                            </span>
                                            <input
                                                type="text"
                                                class="input-base"
                                                bind:value={memoFormWord}
                                            />
                                        </div>
                                    </div>
                                {/if}

                                <div class="mt-8">
                                    {#each contentObj["formList"] as val}
                                        {#if val.type == "name"}
                                            <NameInput require={val.require} />
                                            <div class="my-2"></div>
                                        {:else if val.type == "phone"}
                                            <PhoneInput require={val.require} />
                                            <div class="my-2"></div>
                                        {:else if val.type == "date"}
                                            <DateInput
                                                {setDate}
                                                require={val.require}
                                            />
                                            <div class="my-2"></div>
                                        {:else if val.type == "datetime"}
                                            <DateTimeInput
                                                {setDate}
                                                require={val.require}
                                            />
                                            <div class="my-2"></div>
                                        {:else if val.type.includes("memo")}
                                            <MemoInput
                                                word={val.word}
                                                require={val.require}
                                            />
                                            <div class="my-2"></div>
                                        {/if}
                                    {/each}
                                </div>
                            </div>

                            <div class="w-[90%] md:w-2/3 mx-auto">
                                <table class="w-full">
                                    <tbody>
                                        <tr>
                                            <th class="in-th text-xs max-w-1/3">
                                                <p>폼 하단 고정 여부</p>
                                            </th>
                                            <td class="in-th">
                                                <div
                                                    class="flex justify-center items-center gap-5"
                                                >
                                                    <label
                                                        class="flex justify-center items-center"
                                                    >
                                                        <input
                                                            type="radio"
                                                            class="radio radio-primary radio-sm"
                                                            value="fixed"
                                                            bind:group={
                                                                contentObj[
                                                                    "fixedBottom"
                                                                ]
                                                            }
                                                        />
                                                        <span class="ml-1.5">
                                                            고정
                                                        </span>
                                                    </label>

                                                    <label
                                                        class="flex justify-center items-center"
                                                    >
                                                        <input
                                                            type="radio"
                                                            class="radio radio-primary radio-sm"
                                                            value="nonfixed"
                                                            bind:group={
                                                                contentObj[
                                                                    "fixedBottom"
                                                                ]
                                                            }
                                                        />
                                                        <span class="ml-1.5">
                                                            비고정
                                                        </span>
                                                    </label>
                                                </div>

                                                {#if contentObj["fixedBottom"] == "fixed"}
                                                    <div class="text-xs mt-3">
                                                        <p>
                                                            ★ 하단 고정 폼일경우
                                                            섹션 전체가 하단에
                                                            고정됩니다.
                                                        </p>
                                                        <p>
                                                            가급적 마지막 섹션 /
                                                            폼 컨텐츠만
                                                            넣어주세요.
                                                        </p>
                                                    </div>
                                                {/if}
                                            </td>
                                        </tr>

                                        <tr>
                                            <th class="in-th text-xs max-w-1/3">
                                                <p>※ 이벤트 (문자) 이미지</p>

                                                <p>
                                                    (500px X 500px 이상 정사각형
                                                    이미지)
                                                </p>
                                            </th>
                                            <td class="in-th">
                                                <OneImageUpload
                                                    imgPath={contentObj[
                                                        "formInviteImg"
                                                    ]}
                                                    sendImgPath={(e) => {
                                                        contentObj[
                                                            "formInviteImg"
                                                        ] = e.imgPath;
                                                    }}
                                                    domainFolder={getDomain}
                                                ></OneImageUpload>
                                            </td>
                                        </tr>

                                        <tr>
                                            <th class="in-th text-sm">
                                                <div class="mb-3">
                                                    ※ 폼 상단 컨텐츠
                                                </div>
                                                <div
                                                    class="flex justify-center items-center gap-3"
                                                >
                                                    <label>
                                                        <input
                                                            type="radio"
                                                            class="radio radio-info radio-sm"
                                                            value="image"
                                                            bind:group={
                                                                contentObj[
                                                                    "formInviteType"
                                                                ]
                                                            }
                                                        />
                                                        <span class="ml-0.5">
                                                            이미지
                                                        </span>
                                                    </label>

                                                    <label>
                                                        <input
                                                            type="radio"
                                                            class="radio radio-info radio-sm"
                                                            value="text"
                                                            bind:group={
                                                                contentObj[
                                                                    "formInviteType"
                                                                ]
                                                            }
                                                        />
                                                        <span class="ml-0.5">
                                                            텍스트
                                                        </span>
                                                    </label>
                                                </div>
                                            </th>
                                            <td class="in-th">
                                                {#if contentObj["formInviteType"] == "image"}
                                                    <OneImageUpload
                                                        imgPath={contentObj[
                                                            "formSubjectImg"
                                                        ]}
                                                        sendImgPath={(e) => {
                                                            contentObj[
                                                                "formSubjectImg"
                                                            ] = e.imgPath;
                                                        }}
                                                        domainFolder={getDomain}
                                                    ></OneImageUpload>
                                                {:else}
                                                    <span>
                                                        폼 상단 문구 :
                                                    </span>
                                                    <input
                                                        type="text"
                                                        class="input-base"
                                                        bind:value={
                                                            contentObj[
                                                                "formSubjectText"
                                                            ]
                                                        }
                                                    />
                                                {/if}
                                            </td>
                                        </tr>

                                        <tr>
                                            <th class="in-th text-sm">
                                                <p>개인정보 보호동의</p>
                                            </th>
                                            <td class="in-th">
                                                <input
                                                    type="text"
                                                    class="input-base w-full"
                                                    bind:value={
                                                        contentObj[
                                                            "formAgreeWord"
                                                        ]
                                                    }
                                                    placeholder="개인정보 보호동의"
                                                />
                                            </td>
                                        </tr>

                                        <tr>
                                            <th class="in-th text-sm">
                                                <p>개인정보 하단문구</p>
                                            </th>
                                            <td class="in-th">
                                                <div class="flex gap-3">
                                                    <input
                                                        type="text"
                                                        class="input-base w-full"
                                                        bind:value={
                                                            formAgreeAddWord
                                                        }
                                                    />
                                                    <button
                                                        class="btn btn-info btn-sm text-white"
                                                        onclick={addFormAgreeAddWord}
                                                    >
                                                        추가
                                                    </button>
                                                </div>

                                                <div>
                                                    {#each contentObj["formAgreeAddWord"] as val, idx}
                                                        <div
                                                            class="flex justify-center items-center gap-2"
                                                        >
                                                            <p>{val}</p>
                                                            <!-- svelte-ignore a11y_consider_explicit_label -->
                                                            <button
                                                                onclick={deleteFormAddgreeAddWord}
                                                                value={idx}
                                                                class="text-red-500 text-lg"
                                                            >
                                                                <i
                                                                    class="fa fa-minus-circle"
                                                                    aria-hidden="true"
                                                                ></i>
                                                            </button>
                                                        </div>
                                                    {/each}
                                                </div>
                                            </td>
                                        </tr>

                                        <tr>
                                            <th class="in-th text-sm">
                                                <div class="mb-3">
                                                    ※ 버튼 컨텐츠
                                                </div>
                                                <div
                                                    class="flex justify-center gap-3"
                                                >
                                                    <label>
                                                        <input
                                                            type="radio"
                                                            class="radio radio-info radio-sm"
                                                            value="image"
                                                            bind:group={
                                                                contentObj[
                                                                    "formButtonType"
                                                                ]
                                                            }
                                                        />
                                                        <span>이미지</span>
                                                    </label>

                                                    <label>
                                                        <input
                                                            type="radio"
                                                            class="radio radio-info radio-sm"
                                                            value="text"
                                                            bind:group={
                                                                contentObj[
                                                                    "formButtonType"
                                                                ]
                                                            }
                                                        />
                                                        <span>텍스트</span>
                                                    </label>
                                                </div>
                                            </th>
                                            <td class="in-th">
                                                {#if contentObj["formButtonType"] == "image"}
                                                    <OneImageUpload
                                                        imgPath={contentObj[
                                                            "formButtonImg"
                                                        ]}
                                                        sendImgPath={(e) => {
                                                            contentObj[
                                                                "formButtonImg"
                                                            ] = e.imgPath;
                                                        }}
                                                        domainFolder={getDomain}
                                                    ></OneImageUpload>
                                                {:else}
                                                    <div class="mb-3">
                                                        <span>
                                                            버튼 문구 :
                                                        </span>
                                                        <input
                                                            type="text"
                                                            class="input-base"
                                                            bind:value={
                                                                contentObj[
                                                                    "formButtonText"
                                                                ]
                                                            }
                                                        />
                                                    </div>

                                                    <div>
                                                        <span>
                                                            버튼 색상 :
                                                        </span>
                                                        <input
                                                            type="text"
                                                            class="input-base"
                                                            bind:value={
                                                                contentObj[
                                                                    "formButtonColor"
                                                                ]
                                                            }
                                                        />
                                                    </div>
                                                {/if}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    {/if}

                    <div class="mt-3 text-center">
                        {#if contentModifyStatus}
                            <button
                                class="btn btn-accent text-white"
                                onclick={addOrUpdateContent}
                            >
                                컨텐츠 수정
                            </button>
                            <button
                                class="btn btn-error text-white"
                                onclick={cancleUpdateContent}
                            >
                                취소
                            </button>
                        {:else}
                            <button
                                class="btn btn-accent text-white"
                                onclick={addOrUpdateContent}
                            >
                                컨텐츠 추가
                            </button>
                        {/if}
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</div>

<div class="w-full text-right mt-3">
    <button
        class="btn btn-info text-white"
        onclick={() => {
            if (sectionObj.contentList.length == 0) {
                toast.set({
                    show: true,
                    text: "추가된 컨텐츠가 없습니다. 컨텐츠를 추가 해 주세요",
                });
                return;
            }

            if (contentModifyStatus == true) {
                toast.set({
                    show: true,
                    text: "컨텐츠 수정을 완료 해주세요.",
                });
                return;
            }
            sectionUpdate();
        }}
    >
        {#if !sectionModifyStatus}
            섹션 추가 완료
        {:else}
            섹션 수정 완료
        {/if}
    </button>

    <button
        class="btn"
        onclick={() => {
            closeModal();
        }}
    >
        닫기
    </button>
</div>
