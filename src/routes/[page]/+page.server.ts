import * as env from '$env/static/private';
import type { PageServerLoad } from './$types';
import urlcat from 'urlcat';

const leafCache = new Map<string, string>();
const revCache = new Map<string, string[]>();
const rootCache: {
	time: number;
	pages: [id: string, rev: string][];
} = {
	time: 0,
	pages: []
};

export const load = (async ({ params }) => {
	const currentTimestamp = Date.now();
	if (currentTimestamp - rootCache.time > 60 * 5 * 1000) {
		rootCache.time = currentTimestamp;
		const pagesResp = await fetch(urlcat(env.SYNC_ROOT, '/_all_docs'), {
			headers: {
				Authorization: `Basic ${btoa(`${env.SYNC_USER}:${env.SYNC_PASS}`)}`
			}
		}).then((res) => res.json() as Promise<{ rows: { id: string; value: { rev: string } }[] }>);
		const pageRevs = pagesResp.rows
			.filter(({ id }) => id.startsWith('scribble/') && id.endsWith('.md'))
			.map(({ id, value: { rev } }) => [id, rev] as [string, string]);
		rootCache.pages = pageRevs;
	}
	const uncachedRevs = rootCache.pages.filter(([, rev]) => !revCache.has(rev));
	if (uncachedRevs.length) {
		const revsResp = await fetch(urlcat(env.SYNC_ROOT, '/_bulk_get'), {
			method: 'POST',
			headers: {
				Authorization: `Basic ${btoa(`${env.SYNC_USER}:${env.SYNC_PASS}`)}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				docs: uncachedRevs.map(([id, rev]) => ({ id, rev }))
			})
		}).then(
			(res) =>
				res.json() as Promise<{
					results: {
						docs: { ok: { _rev: string; children: string[]; deleted: boolean } }[];
					}[];
				}>
		);
		revsResp.results.forEach(({ docs }) => {
			if (docs[0].ok.deleted) {
				if (revCache.has(docs[0].ok._rev)) {
					revCache.delete(docs[0].ok._rev);
				}
				rootCache.pages = rootCache.pages.filter(([, rev]) => rev !== docs[0].ok._rev);
				return;
			}
			revCache.set(docs[0].ok._rev, docs[0].ok.children);
		});
	}

	const uncachedLeaves = Array.from(revCache.values())
		.flat()
		.filter((id) => !leafCache.has(id));
	if (uncachedLeaves.length) {
		const leavesResp = await fetch(urlcat(env.SYNC_ROOT, '/_bulk_get'), {
			method: 'POST',
			headers: {
				Authorization: `Basic ${btoa(`${env.SYNC_USER}:${env.SYNC_PASS}`)}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				docs: uncachedLeaves.map((id) => ({ id }))
			})
		}).then(
			(res) =>
				res.json() as Promise<{
					results: { id: string; docs: { ok: { _id: string; _rev: string; data: string } }[] }[];
				}>
		);
		leavesResp.results.forEach(({ id, docs }) => {
			const data = docs[0].ok.data;
			leafCache.set(id, data);
		});
	}

	const pages = rootCache.pages.map(([id, rev]) => ({
		id,
		rev,
		content: revCache
			.get(rev)!
			.map((id) => leafCache.get(id)!)
			.join('')
	}));
	const page = pages.find(({ id }) => id === `scribble/${params.page}.md`);
	if (!page) {
		return {
			page: undefined
		};
	}
	return {
		page: {
			content: page.content,
			title: page.id.replace(/^scribble\//, '').replace(/\.md$/, ''),
			rev: page.rev,
      revNo: parseInt(page.rev.split('-')[0])
		}
	};
}) satisfies PageServerLoad;
