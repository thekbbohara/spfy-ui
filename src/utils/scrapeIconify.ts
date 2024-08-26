import puppeteer from "puppeteer";
import { getSvgPathData } from "./spfyUtils.js";
// Or import puppeteer from 'puppeteer-core';

const scrapeIconify = async (url: string): Promise<string | null> => {
  // const browser = await puppeteer.launch({ headless: false });
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  // await page.goto("https://icon-sets.iconify.design/material-symbols/10mp/");
  await page.goto(url);
  await page.setViewport({ width: 1080, height: 1024 });
  const textarea = await page.locator("textarea").waitHandle();
  const svg = await textarea?.evaluate((el) => el.value);
  const d = getSvgPathData(svg.toString());
  await browser.close();
  return d ? d : null;
};

export default scrapeIconify;
