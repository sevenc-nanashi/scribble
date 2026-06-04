import {
  defineConfig,
  presetAttributify,
  presetWind4,
  PresetWind4Theme,
  transformerDirectives,
} from "unocss";

export default defineConfig<PresetWind4Theme>({
  presets: [
    presetWind4({
      dark: "media",
    }),
    presetAttributify(),
  ],
  transformers: [transformerDirectives()],
  theme: {
    colors: {
      primary: "#48b0d5",
    },
    font: {
      sans: "'M PLUS 1p', sans-serif",
    },
  },
});
