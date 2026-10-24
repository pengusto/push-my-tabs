#!/usr/bin/env bash
# One-time, keyless Chrome publisher setup. No billing or project roles added.
set -euo pipefail

project_id=${1:?Usage: connect-google-cloud.sh PROJECT_ID EXPECTED_GOOGLE_ACCOUNT}
expected_account=${2:?Pass the explicitly approved Google account email}
[[ "$project_id" =~ ^[a-z][a-z0-9-]{4,28}[a-z0-9]$ ]] || { echo 'Invalid Google Cloud project ID.' >&2; exit 1; }
repo=pengusto/push-my-tabs
repo_id=1309289503
owner_id=106893073
# Verified with GitHub's actions/oidc/customization/sub endpoint; this repository
# uses immutable subjects. Do not fall back to a name-only subject.
subject_prefix="repo:pengusto@$owner_id/push-my-tabs@$repo_id"
pool_id=github-releases
provider_id=github
service_account="cws-publisher@$project_id.iam.gserviceaccount.com"

command -v gcloud >/dev/null || { echo 'Google Cloud CLI is required (Cloud Shell includes it).' >&2; exit 1; }
active_account=$(gcloud auth list --filter=status:ACTIVE --format='value(account)')
[[ "$active_account" == "$expected_account" ]] || { echo 'Active Google account differs from the approved account; no changes made.' >&2; exit 1; }
billing=$(gcloud billing projects describe "$project_id" --format='value(billingEnabled)')
[[ "$billing" == False || "$billing" == false ]] || { echo 'This setup requires a verified project without billing; no changes made.' >&2; exit 1; }
project_number=$(gcloud projects describe "$project_id" --format='value(projectNumber)')
[[ "$project_number" =~ ^[0-9]+$ ]] || { echo 'Cannot resolve project number.' >&2; exit 1; }

gcloud services enable chromewebstore.googleapis.com iam.googleapis.com iamcredentials.googleapis.com sts.googleapis.com --project="$project_id"
if ! gcloud iam service-accounts describe "$service_account" --project="$project_id" >/dev/null 2>&1; then
  gcloud iam service-accounts create cws-publisher --display-name='Push My Tabs Chrome publisher' --project="$project_id"
fi
if ! gcloud iam workload-identity-pools describe "$pool_id" --location=global --project="$project_id" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools create "$pool_id" --location=global --display-name='Push My Tabs releases' --project="$project_id"
fi

condition="assertion.repository_id == '$repo_id' && assertion.repository_owner_id == '$owner_id' && assertion.sub == '$subject_prefix:environment:chrome-web-store' && (assertion.workflow_ref == '$repo/.github/workflows/release.yml@refs/heads/main' || assertion.workflow_ref.startsWith('$repo/.github/workflows/release.yml@refs/tags/v')) && (assertion.event_name == 'push' || assertion.event_name == 'workflow_dispatch')"
mapping='google.subject=assertion.sub,attribute.repository_id=assertion.repository_id,attribute.repository_owner_id=assertion.repository_owner_id,attribute.workflow_ref=assertion.workflow_ref,attribute.event_name=assertion.event_name'
if gcloud iam workload-identity-pools providers describe "$provider_id" --workload-identity-pool="$pool_id" --location=global --project="$project_id" >/dev/null 2>&1; then
  existing_condition=$(gcloud iam workload-identity-pools providers describe "$provider_id" --workload-identity-pool="$pool_id" --location=global --project="$project_id" --format='value(attributeCondition)')
  existing_issuer=$(gcloud iam workload-identity-pools providers describe "$provider_id" --workload-identity-pool="$pool_id" --location=global --project="$project_id" --format='value(oidc.issuerUri)')
  [[ "$existing_condition" == "$condition" && "$existing_issuer" == https://token.actions.githubusercontent.com ]] || { echo 'Existing provider differs. Review it explicitly before changing access.' >&2; exit 1; }
else
  gcloud iam workload-identity-pools providers create-oidc "$provider_id" --workload-identity-pool="$pool_id" --location=global --issuer-uri=https://token.actions.githubusercontent.com --attribute-mapping="$mapping" --attribute-condition="$condition" --project="$project_id"
fi

gcloud iam service-accounts add-iam-policy-binding "$service_account" --project="$project_id" --role=roles/iam.workloadIdentityUser --member="principalSet://iam.googleapis.com/projects/$project_number/locations/global/workloadIdentityPools/$pool_id/attribute.repository_id/$repo_id" --condition=None >/dev/null
printf 'CWS_SERVICE_ACCOUNT=%s\nCWS_WORKLOAD_IDENTITY_PROVIDER=projects/%s/locations/global/workloadIdentityPools/%s/providers/%s\n' "$service_account" "$project_number" "$pool_id" "$provider_id"
printf '\nNext: link this service account in the existing Chrome publisher account, then set its publisher ID in GitHub. No long-lived Google key was created.\n'
