#!/usr/bin/env bash

set -u

payload=$(cat)
command=$(
  printf '%s' "$payload" | node -e '
    let input = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => { input += chunk; });
    process.stdin.on("end", () => {
      const parsed = JSON.parse(input);
      process.stdout.write(parsed?.tool_input?.command ?? "");
    });
  '
) || {
  printf 'guard-bash: invalid Claude Code hook payload\n' >&2
  exit 2
}

deny() {
  printf 'guard-bash: %s\n' "$1" >&2
  exit 2
}

command_boundary='(^|[[:space:];|&])'
gh_approve_pattern="${command_boundary}gh[[:space:]]+pr[[:space:]]+review([^;|&]*[[:space:]])--approve([[:space:]]|$)"
force_push_pattern="${command_boundary}git[[:space:]]+push([^;|&]*[[:space:]])(--force|-f)([=[:space:]]|$)"
force_with_lease_pattern="${command_boundary}git[[:space:]]+push([^;|&]*[[:space:]])--force-with-lease([=[:space:]]|$)"
main_push_pattern="${command_boundary}git[[:space:]]+push([^;|&]*[[:space:]])(main|HEAD:main|refs/heads/main)([[:space:]]|$)"
implicit_push_pattern='^[[:space:]]*git[[:space:]]+push([[:space:]]+[^[:space:];|&]+)?[[:space:]]*$'
wrangler_pattern="${command_boundary}wrangler[[:space:]]+(deploy|publish|secret)([[:space:]]|$)"
env_read_pattern="${command_boundary}(cat|less|more|head|tail|grep|rg|sed|awk)[[:space:]][^;|&]*(\\.env([^/[:space:];|&]*)?|\\.dev\\.vars)([/[:space:];|&]|$)"

if [[ "$command" =~ $gh_approve_pattern ]]; then
  deny "self-approval is prohibited"
fi

if [[ "$command" =~ $force_push_pattern ]] ||
  [[ "$command" =~ $force_with_lease_pattern ]]; then
  deny "force push is prohibited"
fi

if [[ "$command" =~ $main_push_pattern ]]; then
  deny "direct push to main is prohibited"
fi

if [[ "$command" =~ $implicit_push_pattern ]]; then
  current_branch=$(git branch --show-current 2>/dev/null || true)
  if [[ "$current_branch" == "main" ]]; then
    deny "direct push from main is prohibited"
  fi
fi

if [[ "$command" =~ $wrangler_pattern ]]; then
  deny "direct Wrangler deployment and secret mutation are prohibited"
fi

if [[ "$command" =~ $env_read_pattern ]]; then
  deny "reading local environment files is prohibited"
fi

exit 0
