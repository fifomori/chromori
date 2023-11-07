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

   - Run `install.bat`

1. Copy the `OMORI/www` folder to `chromori/www`

# Running

1. Run Steam (if you want to collect an achievements)
1. Run `app.bat`
1. Open `http://localhost` in your browser

# Compatibility

- Chrome (tested with 119)
  - works very well
- Firefox (tested with 119)
  - has some sound stutters on synchronus fs operations (mainly in menu)

OneLoader is mostly supported

OneLoader state:

- patches all Node.js fs requests
- patches all XHR requests
- doesn't patch resource requests (fonts, some assets)
  - OneLoader's vfs_web uses the Chrome Extensions API, which is unavailable for regular website
  - workaround: replace these assets manually
- doesn't load .zip mods
  - node_stream_zip using fs.open, which is hard to implement without WebSockets
  - however, using WebSockets makes it impossible to implement synchronous fs
  - workaround: unzip mods
  - TODO: patch OneLoader to prevent loading zips
- maybe it will not update itself (but if it will, please don't do that)

# TODO

- Publish prebuilt package
- Test all greenworks binaries
- Support darwin and linux
  - Build greenworks
  - Write a getKey.js

# Info

- Steamworks SDK version: v1.58a
