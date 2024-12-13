import { error, type RequestHandler } from '@sveltejs/kit';
import { loadDb } from '../../../data';
import { decodeBinary } from 'octagonal-wheels/binary';

const detectImageTypeFromBuffer = (buffer: Uint8Array) => {
	if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
		return 'image/jpeg';
	}
	if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
		return 'image/png';
	}
	return 'image/webp';
};

export const GET: RequestHandler = async ({ params }) => {
	const rev = params.rev;
	if (!rev) return error(400, 'Bad request');

	const { revCache, leafCache } = await loadDb();

	const leafIds = revCache.get(rev);
	if (!leafIds) return error(404, 'Not found');
	const leaves = leafIds.map((id) => leafCache.get(id));
	if (!leaves.every((leaf) => leaf != undefined)) return error(404, 'Not found');

	const image = decodeBinary(leaves);

	const imageBuffer = new Uint8Array(image);
	return new Response(imageBuffer, {
		headers: {
			'Content-Type': detectImageTypeFromBuffer(imageBuffer),
			'Cache-Control': 'public, max-age=31536000'
		}
	});
};
