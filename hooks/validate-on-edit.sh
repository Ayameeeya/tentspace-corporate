#!/usr/bin/env bash

set -u

project_dir=${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}
payload=$(cat)
file_path=$(
  printf '%s' "$payload" | node -e '
    let input = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => { input += chunk; });
    process.stdin.on("end", () => {
      const parsed = JSON.parse(input);
      process.stdout.write(parsed?.tool_input?.file_path ?? "");
    });
  '
) || {
  printf 'validate-on-edit: invalid Claude Code hook payload\n' >&2
  exit 2
}

case "$file_path" in
  "$project_dir"/content/*.mdx)
    target_path=$file_path
    ;;
  content/*.mdx)
    target_path="$project_dir/$file_path"
    ;;
  *)
    exit 0
    ;;
esac

if ! output=$(cd "$project_dir" && npm run validate-content -- --file "$target_path" 2>&1); then
  printf '%s\n' "$output" >&2
  exit 2
fi

exit 0
