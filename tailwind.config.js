/** @type {import('tailwindcss').Config} */
// リポジトリのルートに置く。旧インライン設定（brand色・フォント）を移したもの。
// ページごとに違う設定が残っていないか、移行時に全ページ分を目視で突き合わせること。
module.exports = {
  content: [
    "./html/**/*.html",
    "./html/js/**/*.js",
    "./html/articles/**/*.md",
    "./html/config/*.json",
    "./html/*.json",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: '#fca73f',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
