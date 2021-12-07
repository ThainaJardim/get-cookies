const puppeteer = require("puppeteer");
const ceps = ['22630011','22280070','22270030','22051020','20070000','22411000','22231130','22260002','22776070','22621200'];

var fs = require("fs").promises;

const table = [];

async function run() {
  for (var i = 0; i < ceps.length; i++) {
    var vtex_segment = await getCookies(ceps[i]);
    table.push({ cep: ceps[i], vtex_segment: vtex_segment });

    await fs.writeFile(
      "teste.json",
      JSON.stringify(table),
      { flag: "w" },
      function (err) {
        if (err) throw err;
        console.log(`Salvo - ${i + 1} de ${ceps.length}`);
      }
    );
  }
}

run();


async function getCookies(cep) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewport({ width: 1366, height: 768 });
  await page.goto("https://www.zonasul.com.br/", {
    waitUntil: "load",
    timeout: 0,
  });
  await page.waitForSelector(".zonasul-region-selector-0-x-userLocalization");
  await page.click(
    "body > div.render-container.render-route-store-home > div > div.vtex-store__template.bg-base > div > div.vtex-sticky-layout-0-x-wrapper.vtex-sticky-layout-0-x-wrapper--desktop.vtex-sticky-layout-0-x-wrapper--always-stuck > div > div.zonasul-region-selector-0-x-modalContainerFather.zonasul-region-selector-0-x-modalContainerFather--region-selector > div > div > svg"
  );
  await page.waitForSelector("#input-cep");

  await page.type("#input-cep", cep);

  await page.$eval(".button-region-selector p", elem => elem.click());
  await page.waitForSelector(".zonasul-region-selector-0-x-newModalDeliveryWrapper");

//   const element = await page.evaluate(() => {
//     return document.querySelector('div.zonasul-region-selector-0-x-OptionsModalContainer.zonasul-region-selector-0-x-OptionsModalContainer--region-selector > div:nth-child(2) > div > button');
//  });
  const [element] = await page.$$("div.zonasul-region-selector-0-x-OptionsModalContainer.zonasul-region-selector-0-x-OptionsModalContainer--region-selector > div:nth-child(2) > div > button")


 console.log(element)
  if (element != null){

    await element.click();

  } else {

    await page.click("div.zonasul-region-selector-0-x-OptionsModalContainer.zonasul-region-selector-0-x-OptionsModalContainer--region-selector > div:nth-child(1) > div > button");

  }

  
  await page.waitForTimeout(4000)

  const cookies = await page.cookies();

  const cookieJson = cookies.find(element => element.name == "vtex_segment");

  const vtex_segment = cookieJson["value"];

  await browser.close();

  return vtex_segment;
}