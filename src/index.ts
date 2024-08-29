import iconProviders from "./lib/iconsProviders.js";
// import scrapeIconify from "./utils/scrapeIconify.js";

import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import {
  addFromCache,
  getInstalledIconName,
  getIcons,
  getSrcDir,
  initProject,
  logAllIcons,
  logAndExit,
  scrapeAndAdd,
  toComponentName,
} from "./utils/spfyUtils.js";

const args: string[] = process.argv;
// console.log(args);
if (args.length < 2) {
  logAndExit(
    "No arguments passed..\nuse: add provider:iconname\neg:npx spfyui add ri:github-line",
  );
  process.exit(1);
}
// /* //for now
if (args.length > 4) {
  logAndExit("Invalid args..\nspfyui --help");
  process.exit(1);
}
// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOTDIR = resolve(__dirname, "..");
const CACHE = resolve(ROOTDIR, ".cache");
const srcdir = await getSrcDir(process.cwd());
const spfyiconsPath = resolve(srcdir, "assets", "spfyicons", "index.ts");
// */
const validCmd: string[] = ["init", "list"];
if (args.length === 3 && !validCmd.includes(args[args.length - 1])) {
  logAndExit("Invalid argument..\nhint:spyfui init");
  process.exit(1);
}
if (args.length === 3 && args[args.length - 1] === "init") {
  await initProject(srcdir, spfyiconsPath);
  process.exit(0);
}
const installedIconsArr: string[] = await getInstalledIconName(spfyiconsPath);

if (args.length === 3 && args[args.length - 1] === "list") {
  console.log("Icons:", installedIconsArr);
  process.exit(0);
}

validCmd.push("a", "add", "rm", "remove");

const [, , cmd, icon] = args;
if (!validCmd.includes(cmd)) {
  console.log("invalid command");
  console.log("try:", validCmd);
  process.exit(1);
}
if (cmd === "rm" || cmd === "remove") {
  logAndExit("feature not added\ntry: 'add' || 'a' to add icon");
  process.exit(1);
}
let provider: string;
if (cmd === "list") {
  provider = icon;
} else {
  provider = icon.split(":")[0];
}

if (cmd !== "list" && provider !== "-g") {
  if (!iconProviders.includes(provider)) {
    logAndExit(
      "invalid provider name\ntry: https://icon-sets.iconify.design/?category=General",
    );
    process.exit(1);
  }
} else {
  console.log("List of all installed icon.");
  await logAllIcons(CACHE);
  process.exit(0);
}
const iconName: string = icon.split(":")[1];
const filePath = resolve(CACHE, `${provider}.json`);
console.log(filePath);
let localIcons: { [key: string]: string[] } = await getIcons(filePath);

if (cmd === "list") {
  console.log(Object.keys(localIcons));
  process.exit(0);
}
const ComponentName = toComponentName(iconName, provider);
//exit if component already exists
if (installedIconsArr.includes(ComponentName)) {
  logAndExit(`${ComponentName} already exists..`);
  process.exit(0);
}
// check on localCACHE
addFromCache(spfyiconsPath, ComponentName, localIcons);
// scrape

const { default: scrapeIconify } = (await import(
  "./utils/scrapeIconify.js"
)) as { default: (url: string) => Promise<string[] | null> };

await scrapeAndAdd(
  scrapeIconify,
  provider,
  iconName,
  spfyiconsPath,
  ComponentName,
  localIcons,
  filePath,
);
