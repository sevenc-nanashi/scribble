import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { loadDb } from '../../data';

export const load = (async ({ params }) => {
	const { pages, rootCache } = await loadDb();
	const page = pages.find(({ id }) => id === `scribble/${params.page}.md`);
	if (!page) {
		return error(404, 'Not Found');
	}
	return {
		page: {
			content: page.content.replace(/!\[\[(.+?)\]\]/g, (_match, p1) => {
				const image = rootCache.images.find(([id]) => id.endsWith(p1));
				if (!image) return `\`\`\`\nUnknown image: ${p1}\n\`\`\``;
				const [, rev] = image;
				return `![\`${p1}\`](/images/${rev})`;
			}),
			title: page.id.replace(/^scribble\//, '').replace(/\.md$/, ''),
			rev: page.rev,
			revNo: parseInt(page.rev.split('-')[0])
		}
	};
}) satisfies PageServerLoad;
