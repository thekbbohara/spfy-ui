import puppeteer from "puppeteer";
import { getSvgPathData } from "./spfyUtils.js";
// Or import puppeteer from 'puppeteer-core';

type pathType = {
  [key: string]: string;
  d: string;
  fill: string;
};
type svgReturnType = {
  path: pathType[];
  viewBox: string;
  [key: string]: any;
};
const scrapeIconify = async (url: string): Promise<svgReturnType | null> => {
  const browser = await puppeteer.launch({ headless: false });
  // const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  // await page.goto("https://icon-sets.iconify.design/material-symbols/10mp/");
  await page.goto(url);
  await page.setViewport({ width: 1080, height: 1024 });
  const textarea = await page.locator("textarea").waitHandle();
  const svg = await textarea?.evaluate((el) => el.value);
  let d: svgReturnType | null = getSvgPathData(svg.toString());
  await browser.close();
  if (d === null) return null;
  // d = d.map((dt) => `"${dt}"`);
  return d;
};

export default scrapeIconify;
