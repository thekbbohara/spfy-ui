import iconProviders from "./lib/iconsProviders.js";
// import scrapeIconify from "./utils/scrapeIconify.js";
import { readFile, writeFile } from "fs/promises";

import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import {
  addFromCache,
  getSrcDir,
  logAndExit,
  scrapeAndAdd,
  toComponentName,
} from "./utils/spfyUtils.js";

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOTDIR = resolve(__dirname, "..");
const CACHE = resolve(ROOTDIR, ".cache");
const srcdir = await getSrcDir(process.cwd());
const spfyiconsPath = resolve(srcdir, "assets", "spfyicons", "index.ts");

const installedIconsData: string = await readFile(spfyiconsPath, "utf8");
const installedIcons: string[] = installedIconsData.split("const ");
installedIcons.shift();
const installedIconsArr: string[] = installedIcons.reduce(
  (acc: string[], curr): string[] => (acc = [...acc, curr.split("=")[0]]),
  [],
);
console.log({ installedIconsArr });
const args: string[] = process.argv;
const validCmd: string[] = ["a", "add", "rm", "remove"];

if (args.length <= 2 || args.length > 4) {
  logAndExit(
    "No arguments passed..\nuse: add provide:iconname\neg:npx spfyui add ri:github-line",
  );
  process.exit(0);
}

const [, , cmd, icon] = args;
if (!validCmd.includes(cmd)) {
  console.log("invalid command");
  console.log("try:", validCmd);
  process.exit(1);
}
if (cmd === "rm" || cmd === "remove") {
  logAndExit("invalid command\ntry: 'add' || 'a' to add icon");
  process.exit(1);
}

const provider = icon.split(":")[0];
if (!iconProviders.includes(provider)) {
  logAndExit(
    "invalid provider name\ntry: https://icon-sets.iconify.design/?category=General",
  );
  process.exit(1);
}

const iconName: string = icon.split(":")[1];
const ComponentName = toComponentName(iconName, provider);
//exit if component already exists
if (installedIconsArr.includes(ComponentName)) {
  logAndExit(`${ComponentName} already exists..`);
  process.exit(0);
}

const filePath = resolve(CACHE, `${provider}.json`); //localCachePath

let localIcons: { [key: string]: string } = {};
try {
  const filedata = await readFile(filePath, "utf8");
  localIcons = JSON.parse(filedata);
} catch (err: any) {
  await writeFile(filePath, "{}", "utf8");
  localIcons = {};
}
// check on localCACHE
addFromCache(spfyiconsPath, ComponentName, localIcons);
// scrape

const { default: scrapeIconify } = (await import(
  "./utils/scrapeIconify.js"
)) as { default: (url: string) => Promise<string | null> };

await scrapeAndAdd(
  scrapeIconify,
  provider,
  iconName,
  spfyiconsPath,
  ComponentName,
  localIcons,
  filePath,
);
