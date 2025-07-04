# Setting up Vercel Secrets for GitHub Actions

To enable Vercel deployment in your GitHub Actions workflow, you need to add the following secrets to your GitHub repository:

## Required Secrets

1. **VERCEL_TOKEN**
   - Go to [Vercel Dashboard](https://vercel.com/account/tokens)
   - Create a new token with appropriate permissions
   - Copy the token value

2. **VERCEL_ORG_ID**
   - Go to [Vercel Dashboard](https://vercel.com/account)
   - Click on your organization
   - Copy the Organization ID from the URL or settings

3. **VERCEL_PROJECT_ID**
   - Go to your project in Vercel Dashboard
   - Go to Settings > General
   - Copy the Project ID

## How to Add Secrets

1. Go to your GitHub repository
2. Click on "Settings" tab
3. Click on "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Add each secret with the exact names above

## Testing the Setup

Once you've added the secrets:

1. Create a PR from your `test-actions` branch to `main`
2. The GitHub Actions should automatically run
3. You should see the following checks:
   - Lint Check
   - Type Check
   - Format Check
   - Test
   - Build Check
   - Vercel Deployment (for PRs)

## Troubleshooting

If the checks are still not running:

1. Make sure the workflow file is in the correct branch
2. Check that the PR is targeting the `main` branch
3. Verify that the workflow file is properly committed and pushed
4. Check the "Actions" tab in your GitHub repository to see if workflows are being triggered
