<!-- src/routes/upload/+page.svelte -->
<script>
    import Sortable from "sortablejs";
    import { back_api, back_api_sub, gcs_img } from "$lib/const";
    import { isValidHttpUrl } from "$lib/lib";
    import imageCompression from "browser-image-compression";
    import axios from "axios";
    import { toast } from "$lib/store";

    let imgArr = $state([]);
    let isDragging = $state(false);
    let isUploading = $state(false);
    let uploadProgress = $state(0);
    let successMessage = $state("");
    let errorMessage = $state("");
    let sortable = $state(null);
    let imglinkUpdateStatus = $state(false);
    let imglink = $state(""); // 이미지에 씌워질 링크
    let imgIdx = $state(0);

    let fileInput;

    // 파일 처리 및 바로 업로드
    async function handleFiles(files) {
        errorMessage = "";
        successMessage = "";

        const validFiles = [];

        for (const file of files) {
            // 파일 크기 체크
            if (file.size > 5 * 1024 * 1024) {
                errorMessage = `${file.name}은(는) 5MB를 초과합니다.`;
                continue;
            }

            // 이미지 파일만 허용
            if (!file.type.startsWith("image/")) {
                errorMessage = `${file.name}은(는) 이미지 파일이 아닙니다.`;
                continue;
            }

            validFiles.push(file);
        }

        if (validFiles.length > 0) {
            await uploadImages(validFiles);
        }
    }

    // 드래그 이벤트
    function handleDragOver(e) {
        e.preventDefault();
        isDragging = true;
    }

    function handleDragLeave() {
        isDragging = false;
    }

    function handleDrop(e) {
        e.preventDefault();
        isDragging = false;

        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    }

    // 파일 선택
    function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        handleFiles(files);
        // 파일 입력 초기화 (같은 파일 다시 선택 가능하게)
        e.target.value = "";
    }

    // 업로드된 파일 삭제
    async function removeUploadedFile(index) {
        const delPath = imgArr[index].url;
        try {
            const res = await axios.post(
                `${back_api_sub}/image/delete_gcs_img`,
                {
                    delPath,
                },
            );
            console.log(res.data);
        } catch (error) {
            console.log(error.message);
        }
        imgArr.splice(index, 1);
        imglinkUpdateStatus = false;
    }

    // 전체 삭제
    async function clearAll() {
        const delImgList = imgArr.map((v) => v.url);
        try {
            const res = await axios.post(
                `${back_api_sub}/image/delete_gcs_img_many`,
                {
                    delImgList,
                },
            );
            console.log(res.data);
        } catch (error) {
            console.log(error.message);
        }

        imgArr = [];
        imglinkUpdateStatus = false;
        errorMessage = "";
        successMessage = "";
    }

    // 즉시 업로드
    async function uploadImages(filesToUpload) {
        isUploading = true;
        uploadProgress = 0;
        errorMessage = "";
        successMessage = "";
        imglinkUpdateStatus = false;

        try {
            // 이미지 압축
            const compressionOptions = {
                maxSizeMB: 1,
                useWebWorker: true,
            };

            const compressedFiles = [];
            for (let i = 0; i < filesToUpload.length; i++) {
                uploadProgress = Math.round((i / filesToUpload.length) * 50);
                const compressed = await imageCompression(
                    filesToUpload[i],
                    compressionOptions,
                );
                compressedFiles.push(compressed);
            }

            // FormData 생성
            const formData = new FormData();
            formData.append("folder", "test-images");

            compressedFiles.forEach((file, index) => {
                const timestamp = new Date().getTime();
                const randomStr = Math.random().toString(36).substring(2, 11);
                const extension = file.name.split(".").pop();
                const fileName = `${timestamp}_${index}_${randomStr}.${extension}`;

                formData.append("onimg", file, fileName);
            });

            // 업로드 요청
            uploadProgress = 60;

            const response = await fetch(
                `${back_api_sub}/image/gcs_upload_multiple`,
                {
                    method: "POST",
                    body: formData,
                },
            );

            uploadProgress = 100;

            const result = await response.json();

            if (response.ok) {
                successMessage = `✅ ${result.count}개 파일이 성공적으로 업로드되었습니다!`;

                // 업로드된 파일 목록에 추가
                result.files.forEach((file, index) => {
                    const newId =
                        imgArr.length > 0
                            ? Math.max(...imgArr.map((fruit) => fruit.id)) + 1
                            : 1;
                    imgArr.push({
                        id: newId,
                        name: file.originalName,
                        url: file.saveUrl,
                        size: filesToUpload[index]?.size || 0,
                        uploadedAt: new Date().toLocaleString("ko-KR"),
                    });
                });

                // 3초 후 성공 메시지 제거
                setTimeout(() => {
                    successMessage = "";
                    uploadProgress = 0;
                }, 3000);
            } else {
                throw new Error(result.error || "업로드 실패");
            }
        } catch (error) {
            errorMessage = `❌ 업로드 실패: ${error.message}`;
            uploadProgress = 0;
        } finally {
            isUploading = false;
        }
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    }

    useSortable(() => sortable, {
        animation: 200,
        handle: ".my-handle",
        ghostClass: "opacity-0",
        onEnd(evt) {
            imgArr = reorder(imgArr, evt);
            imglinkUpdateStatus = false;
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

    function imgLinkUpdate() {
        console.log(imgIdx);
        console.log(imgArr);
        console.log(imglink);

        if (!isValidHttpUrl(imglink)) {
            alert("올바른 URL 형식이 아닙니다.");
            return;
        }
        imgArr[imgIdx]["link"] = imglink;
        imglink = "";
        imglinkUpdateStatus = false;

        toast.set({
            show: true,
            text: "이미지 링크 업데이트가 완료 되었습니다.",
        });
    }
</script>

<div class="container">
    <!-- 업로드된 파일 목록 (정사각형 그리드) -->
    {#if imgArr.length > 0}
        <div class="uploaded-section mb-5 pretendard">
            <div class="section-header">
                <h2>업로드된 파일 ({imgArr.length}개)</h2>
                <button class="btn-clear-all" onclick={clearAll}>
                    전체 삭제
                </button>
            </div>

            <ul class="uploaded-grid my-handle" bind:this={sortable}>
                {#each imgArr as file, index (file)}
                    <li class="uploaded-item">
                        <img
                            src={`${gcs_img}/${file.url}`}
                            alt={file.name}
                            class="uploaded-image"
                        />
                        <div class="uploaded-overlay">
                            <!-- <div class="file-info">
                                <div class="file-name">{file.name}</div>
                                <div class="file-size">
                                    {formatFileSize(file.size)}
                                </div>
                            </div> -->

                            <div class="flex flex-col justify-end gap-1">
                                <button
                                    class="btn btn-error btn-xs text-white"
                                    onclick={() => removeUploadedFile(index)}
                                >
                                    삭제
                                </button>
                                <button
                                    class="btn btn-info btn-xs text-white"
                                    onclick={() => {
                                        imglinkUpdateStatus = true;
                                        imgIdx = index;
                                        if (imgArr[imgIdx]["link"]) {
                                            imglink = imgArr[imgIdx]["link"];
                                        } else {
                                            imglink = "";
                                        }
                                    }}
                                >
                                    URL 입력
                                </button>
                            </div>
                        </div>
                    </li>
                {/each}
            </ul>
        </div>
    {/if}

    <!-- imgUrlUpdateStatus -->
    {#if imglinkUpdateStatus}
        <div
            class="border border-gray-300 p-2 rounded-lg mb-3 pretendard flex items-center gap-2"
        >
            <div
                class=" bg-blue-400 text-center py-2 px-2 text-sm rounded-lg min-w-20 text-white"
            >
                URL 입력
            </div>
            <div class="w-full">
                <input
                    type="text"
                    class="input-base w-full"
                    bind:value={imglink}
                />
            </div>
            <div>
                <button
                    class="btn btn-accent text-white min-w-24"
                    onclick={imgLinkUpdate}
                >
                    URL 등록
                </button>
            </div>
        </div>
    {/if}

    <!-- 업로드 영역 -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="upload-area pretendard"
        class:drag-over={isDragging}
        class:uploading={isUploading}
        ondragover={handleDragOver}
        ondragleave={handleDragLeave}
        ondrop={handleDrop}
        onclick={() => !isUploading && fileInput?.click()}
    >
        {#if isUploading}
            <div class="upload-icon">⏳</div>
            <div class="upload-text">업로드 중...</div>
        {:else}
            <div class="upload-icon">📁</div>
            <div class="upload-text">
                이미지를 여기에 드래그하거나 클릭하세요
            </div>
            <div class="upload-hint">
                선택 즉시 자동 업로드됩니다 (PNG, JPG, JPEG, WEBP, 최대 5MB)
            </div>
        {/if}
        <input
            bind:this={fileInput}
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            multiple
            onchange={handleFileSelect}
            disabled={isUploading}
            style="display: none;"
        />
    </div>

    <!-- 업로드 진행률 -->
    {#if isUploading}
        <div class="upload-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: {uploadProgress}%">
                    {uploadProgress}%
                </div>
            </div>
        </div>
    {/if}

    <!-- 성공 메시지 -->
    {#if successMessage}
        <div class="success-message">{successMessage}</div>
    {/if}

    <!-- 에러 메시지 -->
    {#if errorMessage}
        <div class="error-message">{errorMessage}</div>
    {/if}
</div>

<style>
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    h1 {
        margin-bottom: 2rem;
        color: #333;
    }

    .upload-area {
        border: 3px dashed #ddd;
        border-radius: 12px;
        padding: 1rem;
        text-align: center;
        transition: all 0.3s;
        cursor: pointer;
        background: #fafafa;
    }

    .upload-area.drag-over {
        border-color: #4caf50;
        background: #e8f5e9;
    }

    .upload-area.uploading {
        border-color: #2196f3;
        background: #e3f2fd;
        cursor: not-allowed;
    }

    .upload-icon {
        font-size: 2rem;
        margin-bottom: 1rem;
    }

    .upload-text {
        font-size: 1rem;
        color: #666;
        margin-bottom: 0.3rem;
    }

    .upload-hint {
        font-size: 0.9rem;
        color: #999;
    }

    .upload-progress {
        margin-top: 1rem;
        padding: 1rem;
        background: #e3f2fd;
        border-radius: 8px;
    }

    .progress-bar {
        width: 100%;
        height: 24px;
        background: #ddd;
        border-radius: 12px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #4caf50, #45a049);
        transition: width 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 0.8rem;
        font-weight: bold;
    }

    .success-message {
        margin-top: 1rem;
        padding: 1rem;
        background: #e8f5e9;
        color: #2e7d32;
        border-radius: 8px;
        text-align: center;
        animation: slideIn 0.3s ease-out;
    }

    .error-message {
        margin-top: 1rem;
        padding: 1rem;
        background: #ffebee;
        color: #c62828;
        border-radius: 8px;
        text-align: center;
        animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .uploaded-section {
        margin-top: 3rem;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .section-header h2 {
        font-size: 1.5rem;
        color: #333;
    }

    .btn-clear-all {
        padding: 0.5rem 1rem;
        background: #f5f5f5;
        color: #666;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.3s;
    }

    .btn-clear-all:hover {
        background: #e0e0e0;
    }

    /* 정사각형 그리드 */
    .uploaded-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: 1rem;
    }

    .uploaded-item {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        background: #f5f5f5;
        aspect-ratio: 1;
        animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    .uploaded-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .uploaded-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        flex-direction: column;
        justify-content: end;
        padding: 1rem;
        opacity: 0;
        transition: opacity 0.3s;
    }

    .uploaded-item:hover .uploaded-overlay {
        opacity: 1;
    }

    .file-info {
        color: white;
    }

    .file-name {
        font-size: 0.9rem;
        font-weight: 500;
        margin-bottom: 0.25rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .file-size {
        font-size: 0.75rem;
        opacity: 0.8;
    }

    .btn-view,
    .btn-delete {
        flex: 1;
        padding: 0.5rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.85rem;
        font-weight: 500;
        transition: all 0.3s;
        text-decoration: none;
        text-align: center;
    }

    .btn-view {
        background: #2196f3;
        color: white;
    }

    .btn-view:hover {
        background: #1976d2;
    }

    .btn-delete {
        background: #f44336;
        color: white;
    }

    .btn-delete:hover {
        background: #d32f2f;
    }

    @media (max-width: 768px) {
        .uploaded-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        }
    }
</style>
