const fs = require('fs');
const path = require('path');

['package-lock.json', 'yarn.lock'].forEach((file) => {
  const filePath = path.resolve(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
});

const userAgent = process.env.npm_config_user_agent;
// When running inside CI (GitHub Actions) the environment can differ;
// skip this check in CI to avoid false positives in runners.
if (!process.env.GITHUB_ACTIONS) {
  if (userAgent && !/^pnpm\//.test(userAgent)) {
    console.error('Use pnpm instead');
    process.exit(1);
  }
} else {
  // In CI, prefer to log the user agent for debugging but do not fail.
  console.log('CI detected, skipping pnpm user-agent enforcement. npm_config_user_agent=', userAgent);
}
