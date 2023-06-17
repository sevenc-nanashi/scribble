<script lang="ts">
	import type { PageServerData } from './$types';
	import Markdown from 'svelte-exmarkdown';
	import prism from 'prismjs';
	import { onMount } from 'svelte';
	import 'prism-themes/themes/prism-material-light.css';

	export let data: PageServerData;
	if (data.page) {
		onMount(async () => {
			if (!data.page) return;
			const languages = data.page.content.match(/```([a-z]+)/g)?.map((s) => s.slice(3));
			if (languages) {
				languages.sort();
				for (const lang of languages) {
					await import(
						/* @vite-ignore */
						`/node_modules/prismjs/components/prism-${lang}.js`
					);
				}
			}
			prism.highlightAll();
		});
	}
</script>

<svelte:head>
	<title>{data.page?.title || '404'} - 名前のない走り書き。</title>
</svelte:head>

{#if data.page}
	<article>
		<header>
			<h1>{data.page.title}</h1>
			<span class="rev">版：{data.page.revNo} (<span class="monospace">{data.page.rev}</span>)</span
			>
		</header>
		<Markdown md={data.page.content} />
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

			.monospace {
				font-family: monospace;
			}
		}
	}

	:global(article) {
		line-height: 1.5;
		:global(ul) {
			padding: 0;
			padding-left: 1rem;
			margin: 0;
			line-height: 1.75;
		}
		:global(code) {
			font-size: 0.9rem;
		}
    :global(pre:not([class])) {
      display: none;
    }
	}
</style>
