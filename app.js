console.clear();

const nfs = require("fs");
const getKey = require("./getKey");

if (!nfs.existsSync("key")) {
  console.log("Looks like you running chromori first time");
  console.log("Chromori needs to get a decryption key");
  console.log("Launch OMORI from Steam");
  console.log();

  const interval = setInterval(() => {
    console.log("Waiting for OMORI process...");
    const key = getKey.windows();
    if (key) {
      console.log("Found the OMORI process. Now you can close OMORI and start chromori");
      nfs.writeFileSync("key", key);
      clearInterval(interval);
    }
  }, 2000);
} else {
  const api = require("./api");
  const static = require("./static");

  api.listen(8080, () => {
    console.log(`chromori api is running`);
  });

  static.listen(80, () => {
    console.log("chromori static is running on http://localhost");
  });
}
