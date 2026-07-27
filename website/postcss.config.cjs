// The website uses plain CSS (no Tailwind). This local config prevents Vite from
// walking up to the repo-root postcss.config.js, which would pull in Tailwind.
module.exports = { plugins: {} };
