# ChrOMORI

OMORI in a browser

![hero_capitalism](.github/assets/hero_capitalism.png)

# IMPORTANT

If you want to leave OMORI, do **NOT** close the tab instantly! Send me a log

- Open DevTools (Ctrl+Shift+I)
- Click RMB on any line
- Click 'Save as...' and save it on Desktop
- Send it to @cafeed28 in Discord

# Prerequisites

- [OMORI](https://store.steampowered.com/app/1150690/OMORI)
- [Node.js](https://nodejs.org) (Select LTS)
- pnpm: run `npm install -g pnpm` in command line

# Installing

1. Clone this repo

   - With Git: `git clone https://github.com/cafeed28/chromori`
   - Or [download .zip](https://github.com/cafeed28/chromori/archive/refs/heads/main.zip) and unzip it

1. Install dependencies

   - Open command line in `chromori` directory
   - Run these commands
   - `pnpm i`
   - `cd chromori_web && pnpm i && pnpm build && cd ..`

1. Copy the `OMORI/www` folder to `chromori/www`

# Running

1. Open command line in `chromori` directory
1. `pnpm app`
1. Open `http://localhost` in your browser

# Compatibility

Tested with Chrome 118.0.5993.118 and Firefox 119.0

OneLoader isn't supported yet

OneLoader state:

- boots
- patches all Node.js fs requests
- patches all XHR requests
- doesn't patches resource requests (fonts, some assets)
  - OneLoader's vfs_web uses the `chrome.debugger` API, which is available only for extensions/nw.js
  - workaround: replace this assets manually
- doesn't load .zip mods
