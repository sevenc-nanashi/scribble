import { pathcat } from 'pathcat';
import * as env from '$env/static/private';
import { fromByteArray } from 'base64-js';
const currentTimestamp = Date.now();

const leafCache = new Map<string, string>();
const revCache = new Map<string, string[]>();

export type Page = {
	id: string;
	rev: string;
	content: string;
};

const rootCache: {
	time: number;
	pages: [id: string, rev: string][];
	images: [id: string, rev: string][];
} = {
	time: 0,
	pages: [],
	images: []
};

const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
export const loadDb = async () => {
	if (currentTimestamp - rootCache.time > 60 * 1000) {
		rootCache.time = currentTimestamp;
		const pagesResp = await fetch(pathcat(env.SYNC_ROOT, '/_all_docs'), {
			headers: {
				Authorization: `Basic ${btoa(`${env.SYNC_USER}:${env.SYNC_PASS}`)}`
			}
		}).then((res) => res.json() as Promise<{ rows: { id: string; value: { rev: string } }[] }>);
		const pageRevs = pagesResp.rows
			.filter(({ id }) => id.startsWith('scribble/') && id.endsWith('.md'))
			.map(({ id, value: { rev } }) => [id, rev] as [string, string]);
		rootCache.pages = pageRevs;
		const imageRevs = pagesResp.rows
			.filter(({ id }) => imageExtensions.some((ext) => id.endsWith(`.${ext}`)))
			.map(({ id, value: { rev } }) => [id, rev] as [string, string]);
		rootCache.images = imageRevs;
	}
	const uncachedRevs = [...rootCache.pages, ...rootCache.images].filter(
		([, rev]) => !revCache.has(rev)
	);
	if (uncachedRevs.length) {
		const revsResp = await fetch(pathcat(env.SYNC_ROOT, '/_bulk_get'), {
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
				rootCache.images = rootCache.images.filter(([, rev]) => rev !== docs[0].ok._rev);
				return;
			}
			revCache.set(docs[0].ok._rev, docs[0].ok.children);
		});
	}

	const uncachedLeaves = Array.from(revCache.values())
		.flat()
		.filter((id) => !leafCache.has(id));
	if (uncachedLeaves.length) {
		const leavesResp = await fetch(pathcat(env.SYNC_ROOT, '/_bulk_get'), {
			method: 'POST',
			headers: {
				Authorization: `Basic ${fromByteArray(new TextEncoder().encode(`${env.SYNC_USER}:${env.SYNC_PASS}`))}`,
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

	const pages = rootCache.pages.map(
		([id, rev]): Page => ({
			id,
			rev,
			content: revCache
				.get(rev)!
				.map((id) => leafCache.get(id)!)
				.join('')
		})
	);

	return { pages, revCache, leafCache, rootCache };
};
