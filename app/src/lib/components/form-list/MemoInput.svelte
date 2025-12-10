<script>
    let { val = $bindable(), word, require } = $props();
    let inputFocused = $state(false);
</script>

<div class="input-wrapper" class:focusin={inputFocused}>
    <div
        class=" pl-2 pr-3 border-r border-gray-300 text-sm text-center whitespace-nowrap"
    >
        <span>{word}</span>
        {#if require}
            <span>*</span>
        {/if}
    </div>
    <div class="w-full">
        <input
            type="text"
            class="w-full border-none rounded-full focus:outline-none px-3 py-1"
            bind:value={val}
            onfocusin={() => {
                inputFocused = true;
            }}
            onfocusout={() => {
                inputFocused = false;
            }}
        />
    </div>
</div>

<style>
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
        width: 100%;
        margin-left: auto; /* mx-auto */
        margin-right: auto;
    }
    .focusin {
        border: 1px solid #5587ed;
    }
</style>
