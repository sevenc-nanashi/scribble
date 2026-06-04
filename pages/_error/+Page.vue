<template>
  <section class="error-page">
    <p class="status-code">{{ statusCode }}</p>
    <h1>{{ heading }}</h1>
    <p>{{ message }}</p>
    <a href="/">トップへ戻る</a>
  </section>
</template>

<script lang="ts" setup>
import { usePageContext } from "vike-vue/usePageContext";

const pageContext = usePageContext();
const { is404, abortReason } = pageContext;
const statusCode = is404 ? "404" : "500";
const heading = is404 ? "ページが見つかりません" : "エラーが発生しました";
const message =
  abortReason ??
  (is404
    ? "指定された走り書きは存在しないか、削除されています。"
    : "時間を置いてもう一度お試しください。");
</script>

<style scoped>
.error-page {
  display: grid;
  gap: 0.75rem;
  max-width: 42rem;
  padding-block: 3rem;
}

.status-code {
  color: theme("colors.primary");
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

h1 {
  color: theme("colors.slate.900");
  font-size: clamp(2rem, 8vw, 4rem);
  line-height: 1.1;
  margin: 0;
}

p {
  color: theme("colors.slate.600");
  line-height: 1.8;
  margin: 0;
}

a {
  align-self: start;
  background: theme("colors.primary");
  border-radius: 0.5rem;
  color: theme("colors.slate.50");
  font-weight: 700;
  padding: 0.65rem 0.9rem;
}
</style>
