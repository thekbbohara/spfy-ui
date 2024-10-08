import { XMLParser } from "fast-xml-parser";
import { appendFile, writeFile, readdir, mkdir, readFile } from "fs/promises";
import { resolve } from "path";
import writeSetupFiles from "../lib/writeSetupFiles.js";
import { execSync as exec } from "child_process";

type pathType = {
  [key: string]: string;
  d: string;
  fill: string;
};
type svgType = {
  path: pathType | pathType[];
  viewBox: string;
  [key: string]: any;
};
type svgReturnType = {
  path: pathType[];
  viewBox: string;
  [key: string]: any;
};
const ensureDirsExist = async (dirs: string[]): Promise<void> => {
  dirs.forEach(async (dir) => {
    await mkdir(resolve(dir), { recursive: true });
  });
};
export const getSvgPathData = (svg: string): svgReturnType | null => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
  });
  const jsonObj: { svg: svgType } = parser.parse(svg);
  const { viewBox, path } = jsonObj.svg;
  if (!Array.isArray(path)) {
    const data: svgReturnType = { viewBox, path: [path] } ?? null;
    return data;
  } else {
    const data: svgReturnType = { viewBox, path } ?? null;
    return data;
  }
};
export const getSrcDir = async (cwd: string): Promise<string> => {
  cwd = cwd || process.cwd();
  const files = await readdir(cwd);
  if (files.includes("src")) return resolve(cwd, "src");
  if (files.includes("package.json")) {
    await mkdir(resolve(cwd, "src"));
    return resolve(cwd, "src");
  }
  return await getSrcDir(resolve(cwd, ".."));
};

export const toComponentName = (name: string, provider: string): string => {
  if (!isNaN(Number(name[0]))) {
    name = provider + name;
    return toComponentName(name, provider);
  }
  if (!name.includes("-")) return name[0].toUpperCase() + name.substring(1);
  const nameArr: string[] = name.split("-");
  return nameArr.reduce(
    (acc, curr) => acc + curr[0].toUpperCase() + curr.substring(1),
    "",
  );
};
// add chalk as well
export const logAndExit = (msg: string): void => {
  console.log(msg);
  process.exit(1);
};
export const appendIcon = async (
  spfyiconsdir: string,
  name: string,
  data: string[],
) => {
  await appendFile(
    spfyiconsdir,
    `export const ${name}=createIcon(${JSON.stringify(data)});`,
    "utf8",
  );
};
export const addFromCache = async (
  spfyiconsPath: string,
  ComponentName: string,
  localIcons: { [key: string]: string[] },
): Promise<void> => {
  console.log("cheaking cache...");
  if (Object.keys(localIcons).length != 0) {
    const availableIcons = Object.keys(localIcons);
    if (availableIcons.includes(ComponentName)) {
      console.log("adding from local cache...");
      const d: string[] = localIcons[ComponentName];
      await appendIcon(spfyiconsPath, ComponentName, d);
      console.log("Icon added:", "<" + ComponentName, "/>");
      process.exit(0);
    }
  }
};

export const scrapeAndAdd = async (
  scrapper: (url: string) => Promise<string[] | null>,
  provider: string,
  iconName: string,
  spfyiconsPath: string,
  ComponentName: string,
  localIcons: { [key: string]: string[] },
  filePath: string,
): Promise<void> => {
  console.log("scraping icon ...");
  const d: string[] | null = await scrapper(
    `https://icon-sets.iconify.design/${provider}/${iconName}/`,
  );
  if (!d) {
    console.error("unable to scrape...");
    process.exit(1);
  }
  const newlocalIcons = { ...localIcons, [ComponentName]: d };
  await appendIcon(spfyiconsPath, ComponentName, d);
  console.log("adding icon to local cache..");
  await writeFile(filePath, JSON.stringify(newlocalIcons), "utf8");
  console.log("Icon added:", "<" + ComponentName, "/>");
  process.exit(0);
};

const getPackageManager = async (srcDir: string): Promise<string> => {
  try {
    const files = await readdir(srcDir);
    if (files.includes("bun.lockb")) return "bun";
    if (files.includes("package-lock.json")) return "npm";
    if (files.includes("yarn.lock")) return "yarn";
    if (files.includes("pnpm-lock.yaml")) return "pnpm";
    return "unknown"; // Return 'unknown' if no known lock files are found
  } catch (error) {
    console.error(`Failed to read directory '${srcDir}':`, error);
    return "error"; // Return 'error' in case of failure to read directory
  }
};

export const initProject = async (
  CACHE: string,
  srcdir: string,
  spfyiconpath: string,
): Promise<void> => {
  console.log("initialing spfyui project..");
  await ensureDirsExist([CACHE]);
  const pkgm: string = await getPackageManager(resolve(srcdir, ".."));
  const commands: { [key: string]: string } = {
    bun: "i",
    pnpm: "add",
    yarn: "add",
    npm: "i",
  };
  const pkgmCommand = commands[pkgm];
  if (pkgmCommand) {
    console.log(`${pkgm} ${pkgmCommand} tailwind-merge -D`);
    exec(`${pkgm} ${pkgmCommand} tailwind-merge -D`, {
      cwd: resolve(srcdir, ".."),
    });
    console.log(`${pkgm} ${pkgmCommand} clsx -D`);
    exec(`${pkgm} ${pkgmCommand} clsx -D`, {
      cwd: resolve(srcdir, ".."),
    });
    const utilsdir = resolve(srcdir, "utils");
    console.log("writing necessary utils..");
    await ensureDirsExist([utilsdir, resolve(spfyiconpath, "..")]);
    await writeSetupFiles(utilsdir, spfyiconpath);
    process.exit(0);
  } else {
    console.error("Unable to detect package manager...");
    process.exit(1);
  }
};
/* export const getInstalledIconName = async (path: string): Promise<string[]> => {
  const installedIconsData: string = await readFile(path, "utf8");
  const installedIcons: string[] = installedIconsData.split("const ");
  installedIcons.shift();
  const installedIconsArr: string[] = installedIcons.reduce(
    (acc: string[], curr): string[] => (acc = [...acc, curr.split("=")[0]]),
    [],
  );
  return installedIconsArr;
}; */
type iconsData = { [key: string]: string[] };
export const getIcons = async (path: string): Promise<iconsData> => {
  let localIcons: iconsData = {};
  try {
    const filedata = await readFile(path, "utf8");
    localIcons = JSON.parse(filedata);
  } catch (err: any) {
    await writeFile(path, "{}", "utf8");
    localIcons = {};
  }
  return localIcons;
};

export const logAllIcons = async (CACHE: string): Promise<void> => {
  const files = await readdir(CACHE);
  const installedIconsG: { [key: string]: string[] }[] = [];
  for (let i = 0; i < files.length; i++) {
    const iconData: { [key: string]: string } = await JSON.parse(
      await readFile(resolve(CACHE, files[i]), "utf8"),
    );
    const iconNames: string[] = Object.keys(iconData);
    if (iconNames.length !== 0) {
      let provider: string | string[] = files[i].split(".")[0];
      provider = provider.split("/");
      const providerName: string = provider[provider.length - 1];
      installedIconsG.push({ [providerName]: iconNames });
    }
  }
  console.log(installedIconsG);
  process.exit(0);
};
