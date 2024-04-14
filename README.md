# ChrOMORI

OMORI in a browser

![hero_capitalism](.github/assets/hero_capitalism.png)

# Prerequisites

- [OMORI](https://store.steampowered.com/app/1150690/OMORI)
- [Node.js](https://nodejs.org) (Select LTS)
- pnpm: run `npm install -g pnpm` in command line

# Installing

1. Clone this repo

   - With Git: `git clone https://github.com/fifomori/chromori`
   - Or [download .zip](https://github.com/fifomori/chromori/archive/refs/heads/main.zip) and unzip it

1. Install dependencies

   - Run `install.bat` (Windows) or `./install.sh` (Linux, macOS)

# Running

1. Run Steam (if you want to collect achievements)
1. Run `app.bat` (Windows) or `./app.sh` (Linux, macOS)
1. Open `http://localhost:8000` in your browser

# Compatibility

- Chrome (tested with 119)
  - works very well
- Firefox (tested with 119)
  - has some sound stutters on synchronus fs operations (mainly in menu)

# OneLoader ![warning](.github/assets/warning.gif)

- doesn't load .zip mods
  - **WORKAROUND: unzip mods**
  - node_stream_zip using fs.open, which is hard to implement without WebSockets
  - TODO: rewrite fs async api to WebSockets
- dosesn't patch xhr requests (fonts, some assets)
  - OneLoader's vfs_web uses the Chrome Extensions API, which is unavailable for regular website
  - **WORKAROUND: replace these assets manually**

# TODO

- Publish prebuilt package
- Build greenworks for linux and darwin
- Test all greenworks binaries
- Autoextract game path while getting key

# Info

- Steamworks SDK version: v1.58a
