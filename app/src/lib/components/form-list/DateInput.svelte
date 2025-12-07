<script>
    import moment from "moment-timezone";

    let { setDate = $bindable(), require } = $props();

    let dateInput;

    let inputFocused = $state(false);

    function openPicker() {
        dateInput.focus();
        dateInput.click();
        dateInput.showPicker?.();
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="input-wrapper" class:focusin={inputFocused}>
    <div class="border-r border-gray-300 w-1/5 text-center">
        <span>날짜</span>
        {#if require}
            <span>*</span>
        {/if}
    </div>

    <div class="w-4/5 px-4 flex justify-between" onclick={openPicker}>
        <div>{setDate}</div>
        <div>
            <i class="fa fa-calendar" aria-hidden="true"></i>
        </div>
    </div>
</div>
<input
    bind:this={dateInput}
    bind:value={setDate}
    type="date"
    class="hidden-input"
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

        padding-top: 0.5rem; /* py-1 */
        padding-bottom: 0.5rem;
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
