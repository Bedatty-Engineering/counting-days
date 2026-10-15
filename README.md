# Every Day

A static calendar in English with continuous month and year navigation. It highlights the visitor's local date and its position in the year.

## Daily update

The `.github/workflows/daily-calendar.yml` workflow runs at 12:05 a.m. São Paulo time (03:05 UTC) and can also be started manually from the **Actions** tab. It writes the date to `data/current-day.json` and creates a signed commit only when the file changes. The page reads that file to show when the last automated update ran.

Add these repository secrets under **Settings → Secrets and variables → Actions**:

- `USER_TOKEN`: a fine-grained personal access token with **Contents: Read and write** access to this repository.
- `SSH_SIGNING_KEY`: the private SSH key used to sign commits. Add its public key to your GitHub account under **SSH and GPG keys → Signing keys**. Use a dedicated signing key and store only its private half as this secret.

The workflow uses `USER_TOKEN` to identify the account through GitHub's authenticated-user API. It uses your GitHub username as the author name and constructs the account's ID-based `noreply` address, so your personal email is not written into commits. It also uses the token for checkout and push, and the SSH signing key for commit signatures. [GitHub documents the authenticated-user endpoint](https://docs.github.com/en/rest/users/users#get-the-authenticated-user) and the [ID-based `noreply` address format](https://docs.github.com/en/account-and-profile/reference/email-addresses-reference#your-noreply-email-address).

## Publish

No build step is required. Publish the repository root with GitHub Pages: in **Settings → Pages**, select the main branch and the `/ (root)` folder.

The calendar uses the visitor's browser date so it stays current between workflow runs. The versioned data file records the latest automated update.
