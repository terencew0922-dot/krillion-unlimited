// Builds the CATS array from data/*.txt and splices it into index.html.
// Each data file: "key: value" header lines, then "---", then one answer per line,
// most common first. "Name|alias|alias" lists accepted spellings.
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const GROUPS = ["Geography", "Science & Nature", "Food & Drink", "Pop Culture", "Sports & Games", "Arts & History", "Tech & Machines"];

function norm(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ").replace(/\+\+/g, "pp").replace(/#/g, "sharp")
    .replace(/\bst\.?\s/g, "saint ").replace(/\([^)]*\)/g, m => " " + m + " ")
    .replace(/[^a-z0-9 ]/g, "").trim().replace(/^(the|a|an) /, "").replace(/\s+/g, "");
}

const cats = [];
let warnings = 0;
for (const file of fs.readdirSync(path.join(root, "data")).filter(f => f.endsWith(".txt")).sort()) {
  const id = file.replace(/\.txt$/, "");
  const [head, body] = fs.readFileSync(path.join(root, "data", file), "utf8").split(/^---$/m);
  const cat = { id, nope: {} };
  for (const line of head.split("\n").filter(Boolean)) {
    const [, k, v] = line.match(/^(\w+):\s*(.*)$/) || [];
    if (k === "nope") { const [w, msg] = v.split("=>").map(s => s.trim()); cat.nope[w] = msg; }
    else if (k === "suffix") cat.suffix = v === "true";
    else if (k) cat[k] = v;
  }
  if (!GROUPS.includes(cat.group)) { console.warn(`${id}: unknown group "${cat.group}"`); warnings++; }
  const lines = body.split("\n").map(s => s.trim()).filter(Boolean);
  const seen = new Map(), keep = [];
  for (const line of lines) {
    const names = line.split("|");
    const main = norm(names[0]);
    if (!main) { console.warn(`${id}: empty key for "${line}"`); warnings++; continue; }
    if (seen.has(main)) { console.warn(`${id}: duplicate "${names[0]}" (same as "${seen.get(main)}"), dropped`); warnings++; continue; }
    for (const n of names) { const k = norm(n); if (k && !seen.has(k)) seen.set(k, names[0]); }
    keep.push(line);
  }
  cat.items = keep.join(";");
  if (!Object.keys(cat.nope).length) delete cat.nope;
  cats.push(cat);
}
cats.sort((a, b) => GROUPS.indexOf(a.group) - GROUPS.indexOf(b.group) || a.name.localeCompare(b.name));

const html = path.join(root, "index.html");
const src = fs.readFileSync(html, "utf8");
const start = src.indexOf("const CATS = [");
const end = src.indexOf("\n];", start) + 3;
const json = "const CATS = [\n" + cats.map(c => JSON.stringify(c)).join(",\n") + "\n];";
fs.writeFileSync(html, src.slice(0, start) + json + src.slice(end));
const total = cats.reduce((s, c) => s + c.items.split(";").length, 0);
console.log(`${cats.length} categories, ${total} answers, ${warnings} warnings`);
for (const c of cats) process.stdout.write(`${c.id}:${c.items.split(";").length} `);
console.log();
