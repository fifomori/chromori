# ChrOMORI

OMORI in a browser

![hero_capitalism](.github/assets/hero_capitalism.png)

# Prerequisites

- [OMORI](https://store.steampowered.com/app/1150690/OMORI)
- [Node.js](https://nodejs.org) (Select LTS)
- pnpm: run `npm install -g pnpm` in command line

# Installing

1. Clone this repo

   - With Git: `git clone https://github.com/cafeed28/chromori`
   - Or [download .zip](https://github.com/cafeed28/chromori/archive/refs/heads/main.zip) and unzip it

1. Install dependencies

   - Run `install.bat` or `./install.sh`

# Running

1. Run Steam (if you want to collect achievements)
1. Run `app.bat` or `./app.sh`
1. Open `http://localhost:8000` in your browser

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
- will not update itself
- game decryption not working

# TODO

- Publish prebuilt package
- Test all greenworks binaries
- Support darwin and linux
  - Build greenworks

# Info

- Steamworks SDK version: v1.58a
