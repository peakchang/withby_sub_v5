<script>
    import moment from "moment-timezone";

    let { setDate = $bindable(), setTime = $bindable(), require } = $props();

    let dateInput;
    let inputFocused = $state(false);
    
    function openPicker() {
        dateInput.focus();
        dateInput.click();
        dateInput.showPicker?.();
    }
</script>

<!-- 날짜 + 시간(시만) 입력 -->
<!-- svelte-ignore event_directive_deprecated -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="input-wrapper justify-between" class:focusin={inputFocused}>
    <div
        class="border-r border-gray-300 text-center text-sm whitespace-nowrap w-[25%]"
    >
        <span>날짜 및 시간</span>
        {#if require}
            <span>*</span>
        {/if}
    </div>
    <div class="flex gap-2 px-3 w-[75%]">
        <div class="flex justify-center items-center text-sm w-[65%]">
            <div onclick={openPicker}>
                <span class="mr-2">{setDate}</span>
                <i class="fa fa-calendar" aria-hidden="true"></i>
            </div>
            <span class="ml-4 mr-1">|</span>
            <input
                type="date"
                bind:this={dateInput}
                bind:value={setDate}
                class="hidden-input"
                placeholder="날짜 선택"
                onfocusin={() => {
                    inputFocused = true;
                }}
                onfocusout={() => {
                    inputFocused = false;
                }}
                onchange={() => {
                    inputFocused = false;
                }}
            />
        </div>

        <div class="w-[35%]">
            <select
                class="border-none focus:outline-none py-1 cursor-pointer text-sm w-full"
                bind:value={setTime}
                onfocusin={() => {
                    inputFocused = true;
                }}
                onfocusout={() => {
                    inputFocused = false;
                }}
                onchange={() => {
                    inputFocused = false;
                }}
            >
                <option value="base">시간 선택</option>
                {#each Array(24) as _, i}
                    <option value={i}>{i}시</option>
                {/each}
            </select>
        </div>
    </div>
</div>

<style>
    .hidden-input {
        width: 0;
        height: 0;
        opacity: 0;
        position: absolute;
    }

    .input-wrapper {
        display: flex;
        align-items: center;

        border: 1px solid #d1d5db; /* border-gray-300 */
        border-radius: 9999px; /* rounded-full */

        overflow: hidden;

        padding-top: 0.25rem; /* py-1 */
        padding-bottom: 0.25rem;
        padding-left: 0.75rem; /* px-3 */
        padding-right: 0.75rem;

        font-size: 1rem; /* text-base */

        max-width: 42rem; /* max-w-2xl */
        margin-left: auto; /* mx-auto */
        margin-right: auto;
    }
    .focusin {
        border: 1px solid #5587ed;
    }
</style>
