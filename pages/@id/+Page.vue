<template>
  <article class="scribble-page">
    <header un-border-b="1 slate-200" un-mb="4" un-pb="2">
      <h1 un-text="lg primary">
        <template
          v-for="(line, index) in data.segments.slice(
            0,
            data.segments.length - 1,
          )"
          :key="index"
        >
          {{ line }}
          <span un-text="slate-500/50"> / </span>
        </template>
        <span un-font="bold">
          {{ data.segments[data.segments.length - 1] }}
        </span>
      </h1>
      <p un-text="slate-500 xs">版：{{ data.revision }}</p>
    </header>

    <div class="markdown-body" v-html="renderedContent" />
  </article>
</template>

<script setup lang="ts">
import MarkdownIt from "markdown-it";
import { computed } from "vue";
import { useData } from "vike-vue/useData";
import type { Data } from "./+data";

const data = useData<Data>();
const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

const defaultLinkOpen =
  markdown.renderer.rules.link_open ??
  ((tokens, index, options, _env, self) =>
    self.renderToken(tokens, index, options));

markdown.renderer.rules.link_open = (tokens, index, options, env, self) => {
  const token = tokens[index];
  if (token === undefined) {
    throw new Error("Link token is undefined");
  }
  token.attrSet("rel", "nofollow noopener noreferrer");
  return defaultLinkOpen(tokens, index, options, env, self);
};

const renderedContent = computed(() => markdown.render(data.content));
</script>

<style scoped>
.scribble-page {
  max-width: 72ch;
  margin-left: auto;
  margin-right: auto;
}
.markdown-body {
  color: theme("colors.slate.900");
  line-height: 1.9;
  overflow-wrap: anywhere;

  &:deep(*) {
    margin-block: 0;
  }

  &:deep(* + *) {
    margin-block-start: 0.85rem;
  }

  &:deep(h1),
  &:deep(h2),
  &:deep(h3),
  &:deep(h4),
  &:deep(h5),
  &:deep(h6) {
    color: theme("colors.slate.900");
    font-weight: 700;
    line-height: 1.35;
    margin-block-start: 1.75rem;
  }

  &:deep(h1) {
    font-size: 1.8rem;
  }

  &:deep(h2) {
    border-bottom: 1px solid theme("colors.slate.200");
    font-size: 1.45rem;
    padding-bottom: 0.25rem;
  }

  &:deep(h3) {
    font-size: 1.2rem;
  }

  &:deep(a) {
    color: theme("colors.primary");
    text-decoration: underline;
    text-underline-offset: 0.18em;
  }

  &:deep(blockquote) {
    background: theme("colors.slate.50");
    border: 1px solid theme("colors.slate.200");
    border-radius: 0.5rem;
    color: theme("colors.slate.600");
    padding: 0.8rem 1rem;
  }

  &:deep(ul),
  &:deep(ol) {
    padding-inline-start: 1.45rem;
    list-style: initial;
    line-height: 1.5;
  }

  &:deep(li + li) {
    margin-block-start: 0.25rem;
  }

  &:deep(code) {
    background: theme("colors.slate.100");
    border-radius: 0.25rem;
    color: theme("colors.slate.900");
    font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    font-size: 0.92em;
    padding: 0.12em 0.35em;
  }

  &:deep(pre) {
    background: theme("colors.slate.900");
    border-radius: 0.5rem;
    color: theme("colors.slate.200");
    line-height: 1.7;
    overflow-x: auto;
    padding: 1rem;
  }

  &:deep(pre code) {
    background: transparent;
    color: inherit;
    padding: 0;
  }

  &:deep(hr) {
    border: 0;
    border-top: 1px solid theme("colors.slate.200");
    margin-block: 1.75rem;
  }

  &:deep(table) {
    border-collapse: collapse;
    display: block;
    overflow-x: auto;
    width: 100%;
  }

  &:deep(th),
  &:deep(td) {
    border: 1px solid theme("colors.slate.200");
    padding: 0.45rem 0.65rem;
  }

  &:deep(th) {
    background: theme("colors.slate.50");
    font-weight: 700;
  }

  &:deep(img) {
    border-radius: 0.5rem;
    max-width: 100%;
  }
}
</style>
