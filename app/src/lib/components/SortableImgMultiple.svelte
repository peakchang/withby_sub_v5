<script>
    import Sortable from "sortablejs";
    import imageCompression from "browser-image-compression";
    import axios from "axios";
    import { back_api, back_api_sub, gcs_img } from "$lib/const";
    import { page } from "$app/stores";
    import { uploadMultipleImagesAct } from "$lib/uploadImage.js";

    let {
        updateImg,
        imgModifyList = [],
        maxImgCount = 999999,
        detailShow = true,
        imgFolder = "test",
        btnLocation = "center",
    } = $props();

    let imgArr = $state([]);

    let sortable = $state(null);

    console.log(imgModifyList);
    if (imgModifyList && imgModifyList.length > 0) {
        const tempImgArr = [];
        for (let i = 0; i < imgModifyList.length; i++) {
            const con = imgModifyList[i];
            const imgObj = { id: i + 1, href: con };
            tempImgArr.push(imgObj);
        }
        imgArr = tempImgArr;
    }

    // function addVal(getHerf) {
    //     const newId =
    //         imgArr.length > 0
    //             ? Math.max(...imgArr.map((fruit) => fruit.id)) + 1
    //             : 1;
    //     const newObj = {
    //         id: newId, // 가장 큰 id 값 + 1
    //         href: getHerf, // 새로운 text 값
    //     };
    //     imgArr = [...imgArr, newObj];
    // }

    function addVals(getHerfs) {
        for (let i = 0; i < getHerfs.length; i++) {
            const newId =
                imgArr.length > 0
                    ? Math.max(...imgArr.map((fruit) => fruit.id)) + 1
                    : 1;
            const newObj = {
                id: newId, // 가장 큰 id 값 + 1
                href: getHerfs[i], // 새로운 text 값
            };

            imgArr.push(newObj);
        }

        updateImg(imgArr);

        console.log(imgArr);
    }

    async function deleteImg() {
        const delTarget = imgArr[this.value];
        const delTargetArr = delTarget.href.split("/");
        const delFolder = delTargetArr[delTargetArr.length - 2];
        const delFile = delTargetArr[delTargetArr.length - 1];
        try {
            const res = await axios.post(`${back_api}/delete_sort_img`, {
                delFolder,
                delFile,
            });
        } catch (error) {}
        imgArr.splice(this.value, 1);
        updateImg(imgArr);
    }

    function onFileSelected() {
        console.log("클릭클릭!!!");

        uploadMultipleImagesAct(
            `${back_api_sub}/image/gcs_upload_multiple`,
            (err, data) => {
                console.log(err);
                if (err) {
                    alert("에러 발생!!");
                    return;
                }

                console.log(data);

                const saveUrlTempArr = [];

                data.files.forEach((e) => {
                    console.log(e.saveUrl);
                    saveUrlTempArr.push(e.saveUrl);
                });

                addVals(saveUrlTempArr);
                updateImg(imgArr);
            },
            {
                folder: imgFolder,
            },
        );
    }

    // 아래는 sortable 관련 함수! 건드리지 말기!!

    useSortable(() => sortable, {
        animation: 200,
        handle: ".my-handle",
        ghostClass: "opacity-0",
        onEnd(evt) {
            console.log("*******************************");
            console.log(evt);

            imgArr = reorder(imgArr, evt);
            console.log(imgArr);

            updateImg(imgArr);
        },
    });

    function useSortable(getter, options) {
        $effect(() => {
            const sortableEl = getter();
            const sortable = sortableEl
                ? Sortable.create(sortableEl, options)
                : null;
            return () => sortable?.destroy();
        });
    }

    function reorder(array, evt) {
        console.log("여기 안들어오는겨?");

        // should have no effect on stores or regular array
        const workArray = $state.snapshot(array);

        // get changes
        const { oldIndex, newIndex } = evt;

        if (oldIndex === undefined || newIndex === undefined) {
            return workArray;
        }
        if (newIndex === oldIndex) {
            return workArray;
        }

        // move elements
        const target = workArray[oldIndex];
        const increment = newIndex < oldIndex ? -1 : 1;

        for (let k = oldIndex; k !== newIndex; k += increment) {
            workArray[k] = workArray[k + increment];
        }
        workArray[newIndex] = target;
        return workArray;
    }
</script>

<div class="hidden opacity-0"></div>

<ul class="flex flex-wrap m-2 gap-2" bind:this={sortable}>
    {#each imgArr as img, idx (img)}
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <!-- svelte-ignore event_directive_deprecated -->
        <li
            class="flex w-24 h-24 items-center justify-center border border-gray-400 my-handle rounded-lg overflow-hidden relative"
            data-idx={idx}
        >
            <button
                class="absolute top-0 right-1 text-red-400 cursor-pointer"
                type="button"
                value={idx}
                on:click={deleteImg}
            >
                <i class="fa fa-times-circle-o" aria-hidden="true"></i>
            </button>

            <img src={gcs_img + "/" + img.href} alt="" />
        </li>
    {/each}
</ul>

<!-- svelte-ignore event_directive_deprecated -->
<div class:text-center={btnLocation == "center"}>
    <button
        class="btn btn-info btn-sm text-white pretendard"
        type="button"
        on:click={onFileSelected}
    >
        이미지 추가하기
    </button>
</div>
