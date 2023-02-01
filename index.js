const puppeteer = require("puppeteer");

let url = "http://doc.cs.etc.vn/login";
(async () => {
  const browser = await puppeteer.launch({
    headless: true
  });
  const page = await browser.newPage();
  await page.goto(url);

  await page.type("#txtAccount", "cuongtm");
  await page.type("#txtPassword", "Ctm@113995");
  await page.click(".login100-form-btn");
  await page.waitForNavigation();
  await page.goto('http://doc.cs.etc.vn/mhs/lc/Haiquan/MHS_0010.%20Phan%20cong%20xu%20ly%20ho%20so%20xac%20dinh%20truoc%20ma%20so/index.htm')

  const elementHandle = await page.$(`#tocIFrame`);
  await page.waitForTimeout(2000)
  const frame = await elementHandle.contentFrame();
  console.log(await frame.content())
  const menu = await frame.waitForSelector('#toc0')

  const data = await menu.evaluate(() => {
    const eachMenu = document.querySelectorAll('li')
    let arrData = []
    eachMenu.forEach(() => {
      const ul = document.querySelectorAll('ul')
      arrData.push(ul.innerHTML)

    })
    return {
      arrData
    }
  })
  console.log('data evaluate', data)

  // await browser.close();
})();
