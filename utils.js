const fs = require("fs");
const crypto = require("crypto");

module.exports = {
  encrypt(file) {
    // copied from OneLoader
    const iv = Buffer.from("EpicGamerMoment!");
    const cipherStream = crypto.createCipheriv(
      "aes-256-ctr",
      fs.readFileSync("key", { encoding: "ascii" }),
      iv
    );

    return Buffer.concat([
      iv,
      cipherStream.update(Buffer.from(file, "utf8")),
      cipherStream.final(),
    ]);
  },
};
