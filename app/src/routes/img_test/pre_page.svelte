<script>
    import axios from "axios";
    import {
        back_api,
        back_api_origin,
        back_api_sub,
        gcs_img,
    } from "$lib/const";
    import { uploadImageAct, uploadMultipleImagesAct } from "$lib/uploadImage";
    import SortableImgMultiple from "$lib/components/SortableImgMultiple.svelte";

    console.log(`${back_api_sub}/img/gcs_upload_single`);

    let imgUrl = $state("");
    let imgArr = $state([]);

    const options = { folder: "testgogo", type: "domain", maxSizeMB: 5 };
    function onFileSelected() {
        uploadImageAct(
            `${back_api_sub}/image/upload_single`,
            (err, imgData) => {
                if (err) {
                    let errMessage = "이미지 업로드 실패!";
                    if (err.message) {
                        errMessage = err.message;
                    }
                    alert(`${errMessage} 다시 시도해주세요!`);
                    return;
                }

                try {
                    console.log(imgData);
                    imgUrl = imgData.saveUrl;

                    // addVal(imgData.saveUrl);
                    // setDetailImgCount = imgArr.length - 1;
                    // const type = "add";
                    // updateImg({ imgArr, url: imgData.saveUrl, type });
                } catch (err) {
                    console.error(err.message);
                } finally {
                }
            },
            options,
        );
    }

    const multipleOptions = {
        folder: "testgogo",
        type: "domain",
        maxSizeMB: 5,
        maxFiles: 10,
    };
    function onFileSelectedMulti() {
        uploadMultipleImagesAct(
            `${back_api_sub}/image/gcs_upload_multiple`,
            (err, imgData) => {
                if (err) {
                    let errMessage = "이미지 업로드 실패!";
                    if (err.message) {
                        errMessage = err.message;
                    }
                    alert(`${errMessage} 다시 시도해주세요!`);
                    return;
                }

                try {
                    console.log(imgData);

                    imgData.files.forEach((file, index) => {
                        console.log(`파일 ${index + 1}:`, file.saveUrl);
                        imgArr.push(file.saveUrl);
                    });

                    // addVal(imgData.saveUrl);
                    // setDetailImgCount = imgArr.length - 1;
                    // const type = "add";
                    // updateImg({ imgArr, url: imgData.saveUrl, type });
                } catch (err) {
                    console.error(err.message);
                } finally {
                }
            },
            multipleOptions,
        );
    }

    function updateImg(e) {
        console.log(e);
    }
</script>

<div class="p-3 border">
    <SortableImgMultiple {updateImg} btnLocation="left"></SortableImgMultiple>
</div>

<!-- svelte-ignore event_directive_deprecated -->

{#if imgUrl}
    <img src={`${gcs_img}/${imgUrl}`} alt="" />
{:else}
    이미지를 첨부해 주세요
{/if}

<!-- svelte-ignore event_directive_deprecated -->

<div>
    <div class="">
        <button
            class="btn btn-info btn-sm text-white pretendard"
            type="button"
            on:click={onFileSelected}
        >
            이미지 추가하기
        </button>
        <span class="text-xs">
            GIF 이미지 등록시 1MB 미만 이미지만 등록 가능합니다.
        </span>
    </div>

    <div class="my-10">
        ------------------------------------------------------------
    </div>

    <div class="w-full h-24">
        {#if imgArr.length != 0}
            {#each imgArr as img}
                <img src={`${gcs_img}/${img}`} alt="" />
            {/each}
        {:else}
            이미지를 첨부해 주세요
        {/if}
    </div>
    <div class="">
        <button
            class="btn btn-info btn-sm text-white pretendard"
            type="button"
            on:click={onFileSelectedMulti}
        >
            여러 이미지 추가하기
        </button>
    </div>
</div>
