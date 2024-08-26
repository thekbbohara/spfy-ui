import { XMLParser } from "fast-xml-parser";
import { appendFile, writeFile, readdir, mkdir } from "fs/promises";
import { resolve } from "path";

// Function to extract path data from SVG string
export const getSvgPathData = (svg: string): string | null => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
  });
  const jsonObj = parser.parse(svg);
  const pathElement = jsonObj.svg?.path;
  return pathElement?.d ?? null;
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
};
export const appendIcon = async (
  spfyiconsdir: string,
  name: string,
  data: string,
) => {
  await appendFile(
    spfyiconsdir,
    `export const ${name}=createIcon("${data}");`,
    "utf8",
  );
};
export const addFromCache = async (
  spfyiconsPath: string,
  ComponentName: string,
  localIcons: { [key: string]: string },
): Promise<void> => {
  console.log("cheaking cache...");

  if (Object.keys(localIcons).length != 0) {
    const availableIcons = Object.keys(ComponentName);
    if (availableIcons.includes(ComponentName)) {
      console.log("adding from local cache...");
      const d = localIcons[ComponentName];
      await appendIcon(spfyiconsPath, ComponentName, d);
      console.log("Icon added:", "<" + ComponentName, "/>");
      process.exit(0);
    }
  }
};

export const scrapeAndAdd = async (
  scrapper: (url: string) => Promise<string | null>,
  provider: string,
  iconName: string,
  spfyiconsPath: string,
  ComponentName: string,
  localIcons: { [key: string]: string },
  filePath: string,
): Promise<void> => {
  console.log("scraping icon ...");
  const d: string | null = await scrapper(
    `https://icon-sets.iconify.design/${provider}/${iconName}/`,
  );
  if (!d) {
    console.error("unable to scrape...");
    process.exit(1);
  }
  const newlocalIcons = { ...localIcons, [ComponentName]: d };
  await appendIcon(spfyiconsPath, ComponentName, d);
  writeFile(filePath, JSON.stringify(newlocalIcons), "utf8");
  console.log("Icon added:", "<" + ComponentName, "/>");
  process.exit(0);
};
