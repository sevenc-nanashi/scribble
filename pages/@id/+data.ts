// https://vike.dev/data

import type { PageContextServer } from "vike/types";
import { useConfig } from "vike-vue/useConfig";
import { render } from "vike/abort";
import * as v from "valibot";

export type Data = Awaited<ReturnType<typeof data>>;

const pagePathPattern = /^scribble\/(.*)\.md$/;
const pageRootSchema = v.object({
  _id: v.string(),
  _rev: v.string(),
  children: v.array(v.string()),
  path: v.pipe(v.string(), v.regex(pagePathPattern)),
  deleted: v.optional(v.boolean()),
});
const pageContentSchema = v.object({
  results: v.array(
    v.object({
      id: v.string(),
      docs: v.tuple([
        v.object({
          ok: v.object({
            _id: v.string(),
            _rev: v.string(),
            data: v.string(),
          }),
        }),
      ]),
    }),
  ),
});

type PageData = {
  segments: string[];
  revision: number;
  content: string;
};

export async function data(pageContext: PageContextServer): Promise<PageData> {
  // https://vike.dev/useConfig
  const config = useConfig();
  const pagePath = pageContext.routeParams["*"].toLowerCase();

  const response = await fetch(
    `${process.env.SYNC_ROOT}/${encodeURIComponent(
      `scribble/${pageContext.routeParams["*"].toLowerCase()}`,
    )}.md`,
    {
      headers: {
        Authorization: `Basic ${btoa(`${process.env.SYNC_USER}:${process.env.SYNC_PASS}`)}`,
      },
    },
  );
  if (!response.ok) {
    throw render(404);
  }
  const rawData = await response.json();
  const page = v.safeParse(pageRootSchema, rawData);
  if (!page.success) {
    console.error("Failed to parse page data:", page.issues);
    throw render(404);
  }
  if (page.output.deleted) {
    throw render(404);
  }

  const contents = await fetch(`${process.env.SYNC_ROOT}/_bulk_get`, {
    method: "POST",
    body: JSON.stringify({
      docs: page.output.children.map((child) => ({
        id: child,
      })),
    }),
    headers: {
      Authorization: `Basic ${btoa(`${process.env.SYNC_USER}:${process.env.SYNC_PASS}`)}`,
      "Content-Type": "application/json",
    },
  });
  if (!contents.ok) {
    throw render(404);
  }
  const contentsData = await contents.json();
  const parsedContents = v.safeParse(pageContentSchema, contentsData);
  if (!parsedContents.success) {
    console.error("Failed to parse page contents:", parsedContents.issues);
    throw render(404);
  }
  const content = parsedContents.output.results
    .map((result) => {
      const doc = result.docs[0].ok;
      return doc.data;
    })
    .join("");
  const segments =
    page.output.path.match(pagePathPattern)?.[1].split("/") || [];
  if (segments.length === 0) {
    throw new Error("Invalid page path");
  }
  const revision = parseInt(page.output._rev.split("-")[0], 10);

  return {
    content,
    segments,
    revision,
  };
}
