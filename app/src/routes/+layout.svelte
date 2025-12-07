<script>
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import Toast from "$lib/components/Toast.svelte";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />

	<!-- Swiper JS -->
	<script
		src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"
	></script>
	<!-- Link Swiper's CSS -->
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
	/>

	<!-- SUIT 폰트 CSS -->
	<link
		href="https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/static/woff2/SUIT.css"
		rel="stylesheet"
	/>

	<link
		rel="stylesheet"
		as="style"
		href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard-dynamic-subset.css"
	/>

	<link
		rel="stylesheet"
		href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
	/>
	<!-- Include stylesheet -->

	<!-- Include stylesheet -->
	<!-- Include stylesheet -->
	<script
		src="https://cdnjs.cloudflare.com/ajax/libs/quill/2.0.0-dev.3/quill.min.js"
		type="text/javascript"
	></script>

	<link
		href="https://cdnjs.cloudflare.com/ajax/libs/quill/2.0.0-dev.3/quill.snow.min.css"
		rel="stylesheet"
	/>
	<link
		href="https://unpkg.com/quill-table-ui@1.0.5/dist/index.css"
		rel="stylesheet"
	/>
</svelte:head>

{@render children()}

<Toast></Toast>

<style>
	:global(.max_screen) {
		max-width: 900px;
	}

	:global(.pretendard) {
		font-family: "Pretendard";
	}

	:global(.escoredream) {
		font-family: "Escoredream";
	}

	:global(.paperozi) {
		font-family: "Paperozi";
	}

	:global(.input-base) {
		border-radius: 6px;
		padding: 7px 5px;
		border: 1px solid #cfcfcf;
		background-color: #f6f6f6;
	}

	:global(.input-base:focus) {
		border: 1px solid #40a9ff;
		outline: none;
		background-color: #ffffff;
	}
	:global(.in-th) {
		padding: 10px 5px;
		border: 1px solid #cfcfcf;
	}
	:global(.in-td) {
		border: 1px solid #cfcfcf;
	}
</style>
