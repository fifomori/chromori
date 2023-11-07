// code for dumping achievements list from steamdb and steam
// don't touch this

// steamdb part
// https://steamdb.info/app/1150690/stats
const achievements = [];

for (const el of document.querySelectorAll("[id^='achievement']")) {
  const id = el.id.slice("achievement-".length);
  const name = el.children[1].innerText.split("\n")[0];
  achievements[id] = { name };
}

// stolen somewhere from stackoverflow
JSON.stringify(
  { hello: "world", achievements },
  function replacer(key, value) {
    if (Array.isArray(value) && value.length === 0) {
      return { ...value }; // Converts empty array with string properties into a POJO
    }
    return value;
  },
  4
);

// steamcommunity part
// https://steamcommunity.com/id/cafeed28/stats/1150690/achievements
for (const el of document.querySelectorAll(".achieveRow")) {
  const txt = el.children[1].children[0];
  const name = txt.children[0].innerText;
  const description = txt.children[1].innerText;

  const img = el.children[0].children[0].src;
  for (let id in achievements) {
    if (achievements[id].name == name) {
      achievements[id].description = description;
      achievements[id].img = img;
    }
  }
}
JSON.stringify(achievements, null, 4);
