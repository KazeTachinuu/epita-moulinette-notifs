# Epita Moulinette Notifs

A Tampermonkey userscript that sends desktop notifications when moulinette tags
are processed on the [EPITA Forge intranet](https://intra.forge.epita.fr).

Stop refreshing the page — let the page watch for you.

![Screenshot](screenshot.png)

## How it works

1. On any project page with a **Tags** section, a **Watch** button appears.
2. Click it to start watching. The page auto-refreshes every 30 seconds.
3. When a new tag finishes processing, you get a desktop notification with the
   project name, tag name, and success percentage.
4. Already-notified tags are remembered so you won't get duplicate alerts.

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Firefox, Edge, Safari).
2. Click the link below to install the script:

   **[Install epita-moulinette-notifs.user.js](https://github.com/KazeTachinuu/epita-moulinette-notifs/raw/main/epita-moulinette-notifs.user.js)**

3. Navigate to a project page on `intra.forge.epita.fr` — the **Watch** button
   should appear next to the Tags header.

## Requirements

- [Tampermonkey](https://www.tampermonkey.net/) or any userscript manager that
  supports `GM_notification`.
- Access to `intra.forge.epita.fr` (EPITA students/staff).

## License

MIT
