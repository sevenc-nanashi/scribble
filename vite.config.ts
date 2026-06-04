import vue from "@vitejs/plugin-vue";
import unocss from "unocss/vite";
/// <reference types="@batijs/core/types" />

import vike from "vike/plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vike(), vue(), unocss()],
});
