<script>
    import Modal from "$lib/components/Modal.svelte";
    import { onMount } from "svelte";

    let { data } = $props();
    let completeMsgArr = $state([]);
    let chk_modal;
    let getFont = $state("pretendard");
    onMount(() => {
        console.log(data);

        getFont = data.subView.ld_font;
        console.log(getFont);

        console.log(data.subView.ld_complete_msg);

        // SSR 단계에서는 window가 없으므로 onMount 내부에서만 사용

        chk_modal.showModal();

        if (data.subView.ld_complete_msg) {
            completeMsgArr = data.subView.ld_complete_msg.split("\n");
        } else {
            completeMsgArr = [
                "초대장 발급이 확인 되었습니다.",
                "배정된 담당자가 연락 드릴 예정입니다.",
            ];
        }

        // // 1번 페이지에서 준 신호가 있으면 알림 → 복귀
        // if (params.get("return") === "true") {
        //     alert("확인 누르면 이전 페이지로 돌아갑니다");

        //     // ① 직전 히스토리로 복귀 (새로고침 포함)
        //     window.history.back();

        //     /* ② 특정 경로로 확실히 보내고 싶다면
        // 	window.location.href = '/page1';
        // 	*/
        // }
    });

    function goToPrevious() {
        console.log("들어는 와?");

        const params = new URLSearchParams(window.location.search);
        // 1번 페이지에서 준 신호가 있으면 알림 → 복귀
        if (params.get("return") === "true") {
            // ① 직전 히스토리로 복귀 (새로고침 포함)
            window.history.back();

            /* ② 특정 경로로 확실히 보내고 싶다면
        	window.location.href = '/page1';
        	*/
        }
    }
</script>

<div class="text-center">
    <span class="loading loading-spinner loading-xl my-10"></span>
</div>

<dialog id="chk_modal" class="modal" bind:this={chk_modal}>
    <div class="modal-box {getFont}">
        {#each completeMsgArr as val}
            <h3 class="text-lg">{val}</h3>
        {/each}
        <div class="modal-action">
            <form method="dialog">
                <button
                    class="btn btn-success text-white"
                    onclick={goToPrevious}
                >
                    닫기
                </button>
            </form>
        </div>
    </div>
</dialog>
