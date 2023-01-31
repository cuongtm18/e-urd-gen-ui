const puppeteer = require("puppeteer");

let url = "http://doc.cs.etc.vn/login";
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--use-gl=egl"],
    ignoreDefaultArgs: ["--disable-extensions"],
  });
  const page = await browser.newPage();
  await page.goto(url);

  try {
    await page.type("#txtAccount", "cuongtm");
    await page.type("#txtPassword", "Ctm@113995");
    await page.click(".login100-form-btn");
    await page.waitForNavigation();
    await page.goto('http://doc.cs.etc.vn/mhs/lc/Haiquan/MHS_0010.%20Phan%20cong%20xu%20ly%20ho%20so%20xac%20dinh%20truoc%20ma%20so/index.htm')

    const elementHandle = await page.$(`#tocIFrame`);
    const frame = await elementHandle.contentFrame();
    const body = await frame.$('body')
    const tocRoot = await body.$$('ul')
    tocRoot.forEach(e => {
      console.log(e)
    })
    console.log(tocRoot)
  } catch (e) {
    console.log(e);
  }

  // await browser.close();
})();
