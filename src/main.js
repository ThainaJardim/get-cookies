import { launch } from "puppeteer";
import data from "./data.json";
const ceps = data['cep'];

import { promises as fs } from "fs";

const table = [];

async function run() {
  for (var i = 0; i < ceps.length; i++) {
      var vtex_segment = await getCookies(ceps[i]);
      table.push({ cep: ceps[i], vtex_segment: vtex_segment });
  }
  checkCookies(table);
}
async function checkCookies(table) {
  table.forEach((item) => {
      var duplicated = reduce.findIndex(redItem => {
          return item.vtex_segment == redItem.vtex_segment;
      }) > -1;
      if (!duplicated) {
          reduce.push(item);
      }
  });
  await fs.writeFile("teste.json", JSON.stringify(reduce), { flag: "w" }, function (err) {
      if (err)
          throw err;
      console.log(`Salvo`);
  });
}

run();


async function getCookies(cep) {
  const browser = await launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewport({ width: 1366, height: 768 });
  await page.goto(data['url'], {
    waitUntil: "load",
    timeout: 0,
  });
  await page.waitForSelector(data[loadPageSelector]);
  await page.click(
    data['chooseLocaleSelector']
  );
  await page.waitForSelector(data[inputCepSelector]);

  await page.type("#input-cep", cep);

  await page.$eval(data['submitCepSelector'], elem => elem.click());
  await page.waitForSelector(data['loadPageSelector2']);


  const [element] = await page.$$(data['chooseDeliveryWay']);


 console.log(element)
  if (element != null){

    await element.click();

  } else {

    await page.click(data['chooseDeliveryWayScheduled']);

  }

  
  await page.waitForTimeout(4000)

  const cookies = await page.cookies();

  const cookieJson = cookies.find(element => element.name == "vtex_segment");

  const vtex_segment = cookieJson["value"];

  await browser.close();

  return vtex_segment;
}