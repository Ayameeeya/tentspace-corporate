# Blog publication, cutover, and rollback runbook

External and production changes in this runbook are performed by HIRO. The
repository workflow only prepares and verifies the deployment.

## Before merge

1. Confirm `npm run content:validate`, `npm test`, `npm run typecheck`, and
   `npm run build` pass.
2. Confirm generated content files have no uncommitted diff.
3. Open the Vercel preview and verify `/blog`, one category, and at least three
   representative articles including tables, code, and multiple images.
4. Confirm `/feed`, `/sitemap.xml`, `/robots.txt`, canonical metadata, Open
   Graph metadata, and BlogPosting JSON-LD.
5. Confirm no network request targets the retired content service.

## Publish and cutover

1. Merge the approved PR to `main`.
2. Wait for both CI and the production Vercel deployment to succeed.
3. Check the home page, `/blog`, `/feed`, `/sitemap.xml`, and representative
   article URLs in production.
4. Confirm GA4 and Vercel Analytics requests after consent is granted.
5. Remove retired service environment variables only after the production
   checks pass. Do not change DNS as part of the repository workflow.
6. Resubmit `/sitemap.xml` in Search Console and verify an RSS reader can fetch
   `/feed`.

## Thirty-day safety window

- Keep the retired content service read-only for 30 days.
- Do not delete articles, media, databases, or hosting during this window.
- Record any missing URL or asset against the published MDX slug.

## Rollback conditions

Rollback when any of the following is confirmed:

- Multiple previously public article URLs return an error.
- Article bodies or images are materially incomplete.
- RSS or sitemap generation fails in production.
- The production deployment cannot complete and no forward fix is immediately
  available.

## Rollback procedure

1. In Vercel, promote the last known-good deployment created before the MDX
   cutover.
2. Revert the migration merge commit with a new PR. Do not force-push `main`.
3. Wait for CI and deployment checks, then repeat the production smoke checks.
4. Keep the failed deployment and logs for diagnosis.
5. Restore retired-service environment variables only if the promoted legacy
   deployment requires them; HIRO performs this external change.

## Automated publication prerequisites

Before enabling content-only auto-merge, a separate human-reviewed change must
provide all of the following:

- A dedicated writer identity distinct from the reviewer/critic.
- Branch protection with required build, content validation, and critic checks.
- A semantic critic with a human-owned rubric and fact source.
- A fail-closed path for mixed content/code diffs.
- Slack notification and a tested revert procedure.
- Tests proving a content-only PR merges and a mixed-code PR does not.
