<p align="center">
  <img src="assets/bedatty-engineering.png" alt="Bedatty Engineering" width="88" />
</p>

<h1 align="center">Every Day</h1>

<p align="center">An endless calendar that keeps today in view.</p>

<p align="center">
  <a href="https://calendar.bedatty.com/">Open the live calendar</a>
  ·
  <a href="https://github.com/Bedatty-Engineering">Bedatty Engineering</a>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-GPL--3.0--only-blue.svg" alt="License: GPL-3.0-only" /></a>
</p>

## Overview

Every Day is a lightweight calendar for following the passage of time. It highlights the visitor's local date, shows progress through the year, and lets you browse months without a fixed end date.

## Features

- Today's date and day of the year, based on the visitor's local clock.
- A month grid with previous, next, and **Today** navigation.
- A daily repository record updated automatically by GitHub Actions.
- Signed commits attributed to the GitHub account configured for the workflow.
- No build step or application dependencies.

## Run locally

Serve the repository root with any static file server. For example:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Daily update workflow

The `daily-calendar` workflow runs every day at 03:05 UTC and can also be started manually from the **Actions** tab. It writes the current date in the `America/Sao_Paulo` time zone to `data/current-day.json`. It creates a signed commit only when that file changes.

Configure these repository Actions secrets:

| Secret | Purpose |
| --- | --- |
| `USER_TOKEN` | Fine-grained personal access token with **Contents: Read and write** access to this repository. |
| `USER_SSH_SIGNING_KEY` | Private SSH key used to sign the workflow's commits. The matching public key must be registered on GitHub as a **Signing key**. |

The workflow gets the commit author name and ID-based `noreply` email from the authenticated GitHub account, so it does not put a personal email address in the commit. GitHub documents the [authenticated-user endpoint](https://docs.github.com/en/rest/users/users#get-the-authenticated-user) and the [ID-based `noreply` address format](https://docs.github.com/en/account-and-profile/reference/email-addresses-reference#your-noreply-email-address).

## Publishing

GitHub Pages publishes the repository root from the `main` branch. The live site uses the custom domain [calendar.bedatty.com](https://calendar.bedatty.com/).

The calendar renders the visitor's local date directly in the browser, so the display advances even between automated repository updates. The data file records the latest scheduled update.

## Project files

| Path | Description |
| --- | --- |
| `index.html` | Calendar page structure and metadata. |
| `styles.css` | Responsive layout and Bedatty Engineering visual identity. |
| `app.js` | Date calculations, month navigation, and calendar rendering. |
| `data/current-day.json` | Date and timestamp from the latest automated update. |
| `.github/workflows/daily-calendar.yml` | Scheduled signed update workflow. |

## License

Distributed under the GNU General Public License v3.0 only. See [LICENSE](LICENSE). SPDX identifier: `GPL-3.0-only`.
