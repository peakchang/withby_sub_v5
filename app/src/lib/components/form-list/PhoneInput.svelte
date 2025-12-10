<script>
    let {
        val1 = $bindable(),
        val2 = $bindable(),
        val3 = $bindable(),
        require,
    } = $props();
    let inputFocused = $state(false);
</script>

<div class="input-wrapper" class:focusin={inputFocused}>
    <div class="border-r border-gray-300 w-1/5 text-center text-sm">
        <span>전화번호</span>
        {#if require}
            <span>*</span>
        {/if}
    </div>
    <div class="w-4/5 flex">
        <input
            type="text"
            class="border-none px-4 py-1 rounded-md w-1/3 focus:outline-none"
            bind:value={val1}
            onfocusin={() => {
                inputFocused = true;
            }}
            onfocusout={() => {
                inputFocused = false;
            }}
        />
        <span class="flex items-center">-</span>
        <input
            type="text"
            class="border-none px-4 py-1 rounded-md w-1/3 focus:outline-none"
            bind:value={val2}
            onfocusin={() => {
                inputFocused = true;
            }}
            onfocusout={() => {
                inputFocused = false;
            }}
        />
        <span class="flex items-center">-</span>
        <input
            type="text"
            class="border-none px-4 py-1 rounded-md w-1/3 focus:outline-none"
            bind:value={val3}
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
