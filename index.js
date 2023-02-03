const puppeteer = require("puppeteer");
const {printJson} = require("./src/utils/jsonUtils");

let url = "http://doc.cs.etc.vn/login";
(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
  });
  let page = await browser.newPage();
  await page.goto(url);

  await page.type("#txtAccount", "cuongtm");
  await page.type("#txtPassword", "Ctm@113995");
  await page.click(".login100-form-btn");
  await page.waitForNavigation();
  await page.goto('http://doc.cs.etc.vn/mhs/lc/Haiquan/MHS_0010.%20Phan%20cong%20xu%20ly%20ho%20so%20xac%20dinh%20truoc%20ma%20so/index.htm')

  let tabList = await page.waitForSelector("#tocIFrame")
  let frameSelect = await tabList.contentFrame();

  let menuLeft = await (await frameSelect.waitForSelector('#toc0')).$$("li")

  for (const item of menuLeft) {
    if ((await toTextContent(item)).indexOf('Dữ liệu đầu vào') < 1) {
      continue;
    }

    const aTagMenu = await item.$$('a')
    for (const aItem of aTagMenu) {
      if ((await toTextContent(aItem)).indexOf('Dữ liệu đầu vào') < 1) {
        continue;
      }

      await aItem.click()

      page = (await browser.pages())[1];
    }
    break;
  }


  tabList = await page.waitForSelector("#tocIFrame")
  frameSelect = await tabList.contentFrame();
  menuLeft = await (await frameSelect.waitForSelector('#toc0')).$$("li")

  for (const item of menuLeft) {
    if ((await toTextContent(item)).indexOf('Dữ liệu đầu vào') < 1) {
      continue;
    }

    const aTagMenu = await item.$$("ul")
    for (const aItem of aTagMenu) {
      if ((await toTextContent(item)).indexOf('Dữ liệu đầu vào') < 1) {
        continue;
      }
      await aItem.click()
      page = (await browser.pages())[1];
      break;
    }
    break;
  }

  tabList = await page.waitForSelector("#contentIFrame")
  frameSelect = await tabList.contentFrame();

  tabList = await frameSelect.waitForSelector("#linkDocIFrame")
  frameSelect = await tabList.contentFrame();

  const tableData = (await frameSelect.$$("table"))[0]

  const rows = await tableData.$$("tr")
  const listJsonData = []
  const headerRow = (await getTdValue(rows[1])).map((e, idx) => '[' + idx + '] ' + e)
  console.log('Cột header', headerRow);
  let form = {
    data: []
  }
  for (const idx in rows) {
    if (idx == 0 || idx == 1) continue
    const row = rows[idx]
    const tdData = await getTdValue(row)
    let jsonData = {}
    if (tdData.length == 1) {
      form = {
        title: tdData[0],
        data: []
      }
      listJsonData.push(form)
      continue
    }
    jsonData.label = tdData[1]
    jsonData.type = tdData[3]
    jsonData.maxLength = tdData[4]
    jsonData.repeat1 = tdData[5]
    jsonData.required = tdData[7] === 'M'
    jsonData.component = tdData[8].toLowerCase()
    jsonData.describe = tdData[9]
    jsonData.max = tdData[10]
    jsonData.autoFill = tdData[11] === 'Y'
    jsonData.defaultValue = tdData[13] === 'Y'
    jsonData.validate = tdData[14]
    jsonData.errMsg = tdData[15]
    form.data.push(jsonData)
  }
  await printJson(listJsonData)

  // await browser.close();
})();

const LST_TD_VAL = ['i', 'b', 'font', 'div > font']
const getTdValue = async (row) => {
  let listColValue = [], conValue = ''
  for (const col of await row.$$("td")) {
    conValue = ''
    for (const tag of LST_TD_VAL) {
      if ((await col.$$(tag)).length < 1) continue

      const arrElement = await col.$$(tag)
      for (const ele of arrElement) {
        conValue += ' ' + await toTextContent(ele)
      }

      conValue = conValue
        .replace('\n', '')
        .replace(/\s+/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace('&nbsp;', '')
        .replace('<br>', ' ')
        .trim()
      break
    }
    listColValue.push(conValue)
  }

  return listColValue
}


const toTextContent = async (element, propertyTag = 'innerHTML') => {
  if (typeof element !== 'object') {
    return element
  }

  try {
    const tabListContent = await element?.getProperty(propertyTag);
    return await tabListContent?.jsonValue();
  } catch (error) {
    return await element.content()
  }

}
