<table><tr>
<td><img src="https://github.com/Bedatty-Engineering.png" alt="Bedatty Engineering" width="80" /></td>
<td><h1>Counting Days</h1></td>
</tr></table>

An endless calendar that highlights today's local date and tracks the year's progress. Browse months with no fixed end date. [Open the live calendar](https://calendar.bedatty.com/).

## Features

- Shows today's date and day of the year using the visitor's local clock.
- Lets you navigate between months or return to today.
- Records the latest automated update in `data/current-day.json`.
- Runs as a static site with no build step or application dependencies.

## Seasonal theme previews

Holiday themes activate automatically on their calendar dates. To preview a theme at any time, add one of these values to the live calendar URL:

| Theme | Preview URL |
| --- | --- |
| Christmas | <https://calendar.bedatty.com/?preview=christmas> |
| New Year | <https://calendar.bedatty.com/?preview=new-year> |
| Valentine's Day | <https://calendar.bedatty.com/?preview=valentines> |
| Halloween | <https://calendar.bedatty.com/?preview=halloween> |
| Easter | <https://calendar.bedatty.com/?preview=easter> |

Preview mode changes the seasonal visuals and label; it does not change today's date or the calendar events.

## Local development

Serve the repository root with a static file server:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Daily update

The `daily-calendar` workflow runs every day at **06:00 and 17:00 São Paulo time**. It writes the date and update time in the `America/Sao_Paulo` time zone to `data/current-day.json` and creates a signed commit for each run, including runs on the same day. You can also start the workflow manually from the **Actions** tab.

Configure these repository Actions secrets:

| Secret | Configuration |
| --- | --- |
| `USER_TOKEN` | Fine-grained personal access token with **Contents: Read and write** access to this repository. |
| `USER_SSH_SIGNING_KEY` | Private SSH signing key. Register the matching public key on GitHub as a **Signing key**. |

The workflow derives the commit author name and ID-based `noreply` email from the authenticated GitHub account, so it does not use a personal email address. See GitHub's documentation for the [authenticated-user endpoint](https://docs.github.com/en/rest/users/users#get-the-authenticated-user) and [noreply email addresses](https://docs.github.com/en/account-and-profile/reference/email-addresses-reference#your-noreply-email-address).

## Deployment

GitHub Pages publishes the repository root from the `main` branch. The site is available at [calendar.bedatty.com](https://calendar.bedatty.com/) with HTTPS enforced.

The calendar reads the visitor's local date directly in the browser, so the displayed day advances independently of the daily repository update.

## License

Copyright (C) 2026 Lucas C. Bedatty. Licensed under the [GNU General Public License v3.0 only](LICENSE) (`GPL-3.0-only`).
