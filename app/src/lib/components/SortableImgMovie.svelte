<script>
    import axios from "axios";
    import { dataURItoBlob } from "$lib/lib";
    import Sortable from "sortablejs";
    import { onMount, onDestroy } from "svelte";
    import _cloneDeep from "lodash/cloneDeep";
    import _remove from "lodash/remove";
    import _find from "lodash/find";
    import { setImg } from "$lib/lib";
    // import { createEventDispatcher } from "svelte";
    import {
        back_api,
        back_api_origin,
        back_api_sub,
        gcs_img,
    } from "$lib/const";
    import cryptoRandomString from "crypto-random-string";
    import { uploadImageAct, uploadMultipleImagesAct } from "$lib/uploadImage";

    // const dispatch = createEventDispatcher();

    let {
        updateImgeList,
        modifyImageList = [],
        maxImgCount = 9999999,
        domainFolder = "",
    } = $props();

    const crypto = () => cryptoRandomString({ length: 10 });

    let listsEl; // sortable.js wrapper
    let sortableLists; // sortable.js 지정하는거 (걍 몰랑~~)
    let youtubeLink = $state("");
    let imgArr = $state([]); // 이미지 배열

    // export let modifyImageList = []; // 수정하고 싶은 사항이 있다면 상위 파일에서 src 를 array로 넘겨준다
    // export let maxImgCount = 9999999; // 값이 정해져 있지 않다면 무한대로 이미지를 넣을수 있다.
    // export let domainFolder = "";

    onMount(() => {
        if (modifyImageList) {
            let tempImgArr = [];
            for (let i = 0; i < modifyImageList.length; i++) {
                const imgObj = {
                    src: modifyImageList[i],
                    id: crypto(),
                };
                tempImgArr.push(imgObj);
            }
            imgArr = tempImgArr;
        }

        // For Lists
        sortableLists = new Sortable(listsEl, {
            group: "My Lists", // 한 목록에서 다른 목록으로 요소를 끌어오려면(DnD) 두 목록의 그룹 값이 같아야 합니다.
            handle: ".list", // 드래그 핸들이 될 요소의 선택자를 입력합니다.
            delay: 0, // 클릭이 밀리는 것을 방지하기 위해 약간의 지연 시간을 추가합니다.
            // animation: 0, // 정렬할 때 애니메이션 속도(ms)를 지정합니다.
            forceFallback: true, // 다양한 환경의 일관된 Drag&Drop(DnD)을 위해 HTML5 기본 DnD 동작을 무시하고 내장 기능을 사용합니다.
            animation: 150,
            onEnd: function (e) {
                reorder(e.oldIndex, e.newIndex);
            },
        });
    });

    onDestroy(() => {});

    function reorder(oldIndex, newIndex) {
        const clone = _cloneDeep(imgArr[oldIndex]);
        imgArr.splice(oldIndex, 1);
        imgArr.splice(newIndex, 0, clone);

        updateImgeList(imgArr);
    }

    // 이미지 삭제시 파일에서 삭제 및 배열에서도 삭제
    async function deleteImg() {
        const dataId = this.getAttribute("data-id");
        const delPath = _find(imgArr, { id: dataId }).src;
        try {
            const res = await axios.post(
                `${back_api_sub}/image/delete_gcs_img`,
                {
                    delPath,
                },
            );

            const getImgArrIndx = imgArr.findIndex((img) => img.id === dataId);
            imgArr.splice(getImgArrIndx, 1);
            
            updateImgeList(imgArr);
        } catch (error) {
            console.error(error.message);
            alert("에러가 발생했습니다. 다시 시도해주세요");
        }
    }

    function deleteMovie() {
        const dataId = this.getAttribute("data-id");
        const getImgArrIndx = imgArr.findIndex((img) => img.id === dataId);
        imgArr.splice(getImgArrIndx, 1);
        updateImgeList(imgArr);
    }

    function onFileSelected() {
        uploadMultipleImagesAct(
            `${back_api_sub}/image/gcs_upload_multiple`,
            (err, data) => {
                console.log(err);
                console.log(data);
                console.log(gcs_img);

                const resDataImgArr = data.files;

                console.log(`resDataImgArr~~~~~~~~~~~~`);

                console.log(resDataImgArr);
                for (let i = 0; i < resDataImgArr.length; i++) {
                    imgArr.push({
                        src: resDataImgArr[i].saveUrl,
                        id: crypto(),
                    });
                }

                // imgArr.push({
                //     src: data.saveUrl,
                //     id: crypto(),
                // });
                // imgArr = [...new Set(imgArr)];
                updateImgeList(imgArr);
            },
            { folder: domainFolder },
        );
    }

    function youtubeSelected() {
        if (!youtubeLink) {
            alert("유튜브 링크를 삽입 해주세요");
        }
        const videoId = extractVideoId(youtubeLink);
        console.log(videoId);
        const youtubeThumbnail = `https://img.youtube.com/vi/${videoId}/default.jpg`;

        imgArr.push({
            src: youtubeThumbnail,
            id: crypto(),
        });
        // imgArr = [...new Set(imgArr)];

        updateImgeList(imgArr);

        youtubeLink = "";
    }

    function extractVideoId(url) {
        const regex =
            /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([0-9A-Za-z_-]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }
</script>

<div class="p-2">
    <div class="flex flex-wrap" bind:this={listsEl}>
        {#each imgArr as img (img.id)}
            {#if img.src.includes("youtube")}
                <!-- svelte-ignore legacy_code -->
                <div
                    class="list border border-slate-400 w-24 h-24 rounded-lg flex items-center justify-center overflow-hidden mb-1 ml-1 relative"
                >
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <span
                        class="absolute top-1 right-1 text-red-600 cursor-pointer"
                        data-id={img.id}
                        onclick={deleteMovie}
                    >
                        <i
                            class="fa fa-times-circle-o"
                            aria-hidden="true"
                            data-id={img.id}
                        ></i>
                    </span>

                    <span
                        class="absolute top-5 right-1 text-red-400 cursor-pointer"
                    >
                        <i class="fa fa-file-video-o" aria-hidden="true"></i>
                    </span>

                    <div>
                        <img src={img.src} alt="" />
                    </div>
                </div>
            {:else}
                <!-- svelte-ignore legacy_code -->
                <div
                    class="list border border-slate-400 w-24 h-24 rounded-lg flex items-center justify-center overflow-hidden mb-1 ml-1 relative"
                >
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <span
                        class="absolute top-1 right-1 text-red-600 cursor-pointer"
                        data-id={img.id}
                        onclick={deleteImg}
                    >
                        <i
                            class="fa fa-times-circle-o"
                            aria-hidden="true"
                            data-id={img.id}
                        ></i>
                    </span>
                    <div>
                        <img src={setImg(img.src)} alt="" />
                    </div>
                </div>
            {/if}
        {/each}
    </div>
</div>

<div id="app" class="pretendard mt-3">
    <div class="flex items-center">
        <button
            class="flex justify-center items-center gap-1 text-white btn btn-info btn-xs mr-5"
            onclick={onFileSelected}
        >
            <i class="fa fa-file-image-o" aria-hidden="true"></i>
            이미지 업로드
        </button>

        <button
            class="flex justify-center items-center gap-1 text-white btn btn-success btn-xs mr-2"
            onclick={youtubeSelected}
        >
            <i class="fa fa-file-video-o" aria-hidden="true"></i>
            유튜브 업로드
        </button>
        <input
            type="text"
            class="text-xs border border-gray-400 rounded-md py-1 px-2 w-36 focus:outline-none focus:border-blue-500"
            placeholder="유튜브 주소 입력"
            bind:value={youtubeLink}
        />
    </div>
</div>
