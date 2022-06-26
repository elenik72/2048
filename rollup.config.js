import css from "rollup-plugin-import-css"
import htmlTemplate from 'rollup-plugin-generate-html-template'
import { terser } from 'rollup-plugin-terser'

export default {
  input: "src/app.js",
  output: {
    file: "dist/index.js",
  },
  plugins: [
    terser(),
    htmlTemplate({
      template: 'src/index.html',
      target: 'index.html',
    }),
    css(),
  ]
}
