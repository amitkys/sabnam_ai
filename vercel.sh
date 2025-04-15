#!/bin/sh

echo "🔍 VERCEL_ENV: $VERCEL_ENV"

git fetch --unshallow 2>/dev/null || echo "⚠️ Git history already complete or fetch failed."

LATEST_COMMIT=$(git log -1 --pretty=oneline --abbrev-commit)
echo "📝 Latest commit: $LATEST_COMMIT"

if [ "$VERCEL_ENV" = "production" ]; then
  echo "✅ Production deployment detected"
  echo "$LATEST_COMMIT" | grep -w "build" >/dev/null

  if [ $? -eq 0 ]; then
    echo "❌ Commit contains 'build' — stopping build."
    exit 1
  else
    echo "✅ Commit does not contain 'build' — proceeding with build."
    exit 0
  fi
else
  echo "🛑 Not a production deployment — exiting with 1."
  exit 1
fi
