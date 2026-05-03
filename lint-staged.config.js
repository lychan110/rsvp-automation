// lint-staged.config.js
// Runs on staged files during pre-commit. TypeScript check is fast enough to run on all files.
export default {
  "*.{ts,tsx}": ["npx tsc --noEmit"],
};
