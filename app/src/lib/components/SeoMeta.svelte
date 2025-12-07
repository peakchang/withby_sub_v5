<script>
    export let seoValue;
</script>

<meta http-equiv="X-UA-Compatible" content="IE=edge, chrome=1" />
<meta http-equiv="content-type" content="text/html; charset=UTF-8" />

<title>{seoValue.title}</title>

<meta name="author" content="Creatorlink" />
<meta name="title" content={seoValue.title} />
<meta name="description" content={seoValue.description} />
<link rel="icon" href={seoValue.icon} />
<meta property="og:title" content={seoValue.title} />
<meta property="og:url" content={seoValue.url} />
<meta property="og:type" content="website" />
<meta property="og:description" content={seoValue.description} />
<meta property="og:url" content={seoValue.url} data-dynamic="true" />
<meta
    property="og:image"
    content={seoValue.og_image ? seoValue.og_image : seoValue.image}
/>

<meta
    property="twitter:card"
    content="summary_large_image"
    data-dynamic="true"
/>
<meta property="twitter:domain" content={seoValue.url} data-dynamic="true" />
<meta property="twitter:url" content={seoValue.url} data-dynamic="true" />
<meta property="twitter:title" content={seoValue.title} data-dynamic="true" />
<meta
    property="twitter:description"
    content={seoValue.description}
    data-dynamic="true"
/>
<meta
    property="twitter:image"
    content={seoValue.og_image ? seoValue.og_image : seoValue.image}
    data-dynamic="true"
/>

<meta name="googlebot" content="archive" />
