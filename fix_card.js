const fs = require("fs");
const p = "C:/Users/75624/tennis-coach/index.html";
let c = fs.readFileSync(p, "utf-8");
let l = c.split("\n");
console.log("Lines:", l.length);
for (let i = 0; i < l.length; i++) {
  if (l[i].includes("selectAiVideo") && l[i].includes("v.url") && l[i].includes("onclick")) {
    console.log("Found L" + (i + 1));
    l[i] = l[i].replace(/onclick="[^"]+"/, "onclick=\"clickVideo(this)\"");
    console.log("Fixed onclick");
    break;
  }
}
for (let i = 0; i < l.length; i++) {
  if (l[i].includes("function selectAiVideo")) {
    l.splice(i, 0, "", "function clickVideo(el) { selectAiVideo(el.dataset.url, el.dataset.vid, el.dataset.note || ''); }");
    console.log("Added clickVideo at L" + (i + 1));
    break;
  }
}
fs.writeFileSync(p, l.join("\n"), "utf-8");
console.log("Done");
