# Release and store updates

The **Create release** GitHub Actions workflow prepares and publishes a release from `main`. Open **Actions → Create release → Run workflow**, enter the next tag (for example `v1.3.0`), and keep **Submit to Chrome Web Store and Firefox Add-ons** enabled. The workflow:

1. Updates both manifest versions and moves `Unreleased` to a dated changelog section when the requested version is new.
2. Checks the tag, manifests and release notes, runs the test suite, builds both packages and lints Firefox.
3. Commits prepared release metadata to `main` only after both builds pass. A concurrent branch update stops the push instead of overwriting work.
4. Publishes a GitHub release with both ZIPs and SHA-256 checksums.
5. Submits those exact packages to the existing Chrome and Firefox listings in independent jobs.

Store review is asynchronous. `PENDING_REVIEW`, `SUBMITTED`, and `APPROVED` are not proof that users have received an update. The job summary reports the API state; only a confirmed public version is reported as `PUBLISHED`. Browsers deliver approved store updates through their existing update mechanism.

Pre-releases and runs with the store checkbox disabled create only a GitHub release. A pushed `v*` tag also runs the pipeline, but its commit must already contain matching versions and an empty `Unreleased` section. A repeat of a prepared release checks out its tag, preserving the release commit from the first attempt. Its source must match the existing GitHub release target. Re-running compares package bytes and never replaces public release assets; only temporary CI artifacts are recreated. Re-run only failed store jobs after resolving a failure.

For local preparation, `node scripts/prepare-release.mjs v1.3.0` updates the two manifests and changelog without committing, tagging, or publishing. Release notes always come from `CHANGELOG.md`.

## One-time Chrome connection

Chrome uses the official [Web Store API v2](https://developer.chrome.com/docs/webstore/api/reference/rest/v2/publishers.items) with a [publisher-linked service account](https://developer.chrome.com/docs/webstore/service-accounts) and [GitHub Workload Identity Federation](https://github.com/google-github-actions/auth#workload-identity-federation-through-a-service-account). No long-lived Google key or refresh token is stored in this repository.

With the publisher's approval:

1. Select a Google Cloud project, enable the Chrome Web Store and IAM Service Account Credentials APIs, and create a service account dedicated to this publisher.
2. Add that service account's email in **Chrome Web Store Developer Dashboard → Account → Service account**. Confirm it is the publisher owning `bagfcickffpfkgecknaepmfleikeojik`.
3. Create a Workload Identity Pool and OIDC provider for `https://token.actions.githubusercontent.com`. Map `google.subject=assertion.sub` and `attribute.repository_id=assertion.repository_id`.
4. Restrict the provider's attribute condition to this repository's numeric ID, this release workflow, the `chrome-web-store` environment and release sources (`main` or `v*` tags). Check the numeric repository/owner IDs with GitHub rather than trusting names alone. Grant `roles/iam.workloadIdentityUser` on the dedicated service account only to that repository principal. Follow the official auth guide for the precise provider and IAM commands.
5. In the GitHub **chrome-web-store** environment, set the three variables below. Restrict the environment's deployment sources to `main` and `v*` tags. Optional required reviewers add a per-release click; omit that gate when unattended publishing is intended.

| Variable | Value |
| --- | --- |
| `CWS_PUBLISHER_ID` | Publisher ID from the developer dashboard |
| `CWS_SERVICE_ACCOUNT` | Dedicated service account email |
| `CWS_WORKLOAD_IDENTITY_PROVIDER` | `projects/.../locations/global/workloadIdentityPools/.../providers/...` |

The action requests a 30-minute token scoped to `https://www.googleapis.com/auth/chromewebstore`. It creates no credential file. The publisher script uses v2 upload/status/publish endpoints, waits for asynchronous uploads, and blocks warnings, takedowns, downgrades, staged releases, or another version under review. Already public or pending versions are not uploaded twice. It does not cancel submissions or change listing visibility.

## One-time Firefox connection

Confirm the existing listing is `push-my-tabs`, with manifest ID `push-my-tabs@pengusto.github.io`. Create the publisher's API credentials on the [AMO API keys page](https://addons.mozilla.org/en-US/developers/addon/api/key/), and put them in the GitHub **firefox-addons** environment as secrets:

| Secret | Value |
| --- | --- |
| `AMO_API_KEY` | JWT issuer |
| `AMO_API_SECRET` | JWT secret |

Use the publisher's account; these credentials can act on that account's add-ons. Store and rotate them through the approved secret manager, never in a tracked file, issue, shell history or chat. Use `gh secret set ... --env firefox-addons` with stdin for provisioning. Restrict environment deployment sources to `main` and `v*` tags.

The pipeline checks existing listed versions with fresh per-request JWTs, then uses [Mozilla's pinned web-ext 10.5.0 client](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/#web-ext-sign) with `--channel listed`. Both credentials are inherited as environment variables rather than passed as process arguments. Known approved/pending submissions are not re-uploaded; disabled/rejected/incomplete versions stop with an explicit error. Release notes and MIT license metadata are supplied from the checked release. The package contains readable source, so there is no transpilation bundle to reconstruct.

## Listing artwork and video

Package publication updates the extension binary. It does not promise to update the Chrome listing's text, screenshots, or YouTube link. Those are separate dashboard operations. Firefox offers listing and preview APIs, but this workflow deliberately updates only version metadata and packages.

Use the [store listing copy](store-listing.md) and [media plan](store-media.md) when replacing listing assets. Approve one reusable media template, then generate the five images and video from the same product scenes. Updating assets on every code-only patch is unnecessary.

## Verification and current gate

Unit tests cover version/changelog preparation, asynchronous Chrome uploads, failed uploads, duplicate submissions, warning/review states, and Firefox authentication/status handling. Local builds and a GitHub-only release run validate packaging separately from store acceptance. The live store jobs are unverified until the one-time account connection is configured and a release submission is observed.
