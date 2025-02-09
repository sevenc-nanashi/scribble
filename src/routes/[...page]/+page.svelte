<script lang="ts">
	import type { PageServerData } from './$types';
	import MarkdownIt from 'markdown-it';
	import prism from 'prismjs';
	import { onMount } from 'svelte';
	import 'prismjs/components/prism-c.min.js';
	import 'prismjs/components/prism-cpp.min.js';
	import 'prismjs/components/prism-typescript.min.js';
	import 'prismjs/components/prism-bash.min.js';
	import 'prismjs/components/prism-json.min.js';
	import 'prismjs/components/prism-ruby.min.js';
	import 'prismjs/components/prism-python.min.js';

	export let data: PageServerData;
	if (data.page) {
		onMount(async () => {
			if (!data.page) return;
			prism.highlightAll();
		});
	}

	const description = data.page.content
		.replace(/!\[.*?\]\(.*?\)/g, '')
		.split('\n')
		.slice(0, 3)
		.join('\n')
		.trim();

	const markdownIt = new MarkdownIt();
	const markdownHtml = markdownIt.render(data.page.content);
</script>

<svelte:head>
	<title>{data.page.title} - 名前のない走り書き。</title>

	<meta property="twitter:card" content="summary" />
	<meta property="og:site_name" content="名前のない走り書き。" />
	<meta property="og:title" content={data.page?.title || '404'} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="theme-color" content="#48b0d5" />
</svelte:head>

{#if data.page}
	<article>
		<header>
			<h1>{data.page.title}</h1>
			<span class="rev">版：{data.page.revNo} (<span class="monospace">{data.page.rev}</span>)</span
			>
		</header>
		{@html markdownHtml}
	</article>
{:else}
	<p>ページが見つかりませんでした。</p>
{/if}

<style lang="scss">
	header {
		padding-bottom: 1rem;
		margin-bottom: 1rem;
		border-bottom: 1px solid #ccc;
		h1 {
			font-size: 1.5rem;
			padding: 0;
			margin: 0;
			display: inline-block;
		}
		.rev {
			font-size: 0.8rem;
			color: #666;
			margin-left: 1rem;
			display: inline-block;
			@media (prefers-color-scheme: dark) {
				color: #888;
			}

			.monospace {
				font-family: monospace;
			}
		}
	}

	:global(article) {
		line-height: 1.5;
		:global(ul) {
			padding: 0;
			padding-left: 2rem;
			margin: 0;
			line-height: 1.75;
		}
		:global(code) {
			font-size: 0.9rem;
		}
		:global(pre:not([class])) {
			display: none;
		}
		:global(p) {
			word-break: break-all;
			white-space: pre-wrap;
		}
		:global(a) {
			color: #48b0d5;

			&:hover {
				filter: drop-shadow(0 0 0.5rem #48b0d588);
				@media (prefers-color-scheme: dark) {
					filter: drop-shadow(0 0 0.5rem #48b0d5cc);
				}
			}
		}
		:global(img) {
			width: 100%;
			box-sizing: border-box;
			filter: drop-shadow(0 0 0.5rem #ddd);
			padding: 1rem 0;
			display: block;

			@media (min-width: 768px) {
				width: 50%;
			}

			@media (prefers-color-scheme: dark) {
				filter: drop-shadow(0 0 0.5rem #333);
			}
		}
	}
</style>
