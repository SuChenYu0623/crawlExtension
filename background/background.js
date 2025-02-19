import { collectUrls as collectUrlsNytimes } from "./newsUrls/collectUrls/nytimes.js";
import { collectUrls as collectUrlsBBC } from "./newsUrls/collectUrls/bbc.js";

chrome.runtime.onInstalled.addListener(async () => {
  console.log("Extension installed!");
});

async function TaskListener(details) {
  console.log('增加一次', details.url)
  // 初步檢查 (不符就直接丟掉)
  if (details.method !== 'POST' ||
    !(details.url.includes('127.0.0.1') || details.url.includes('localhost'))
  ) return

  // 在 MV3 中解析請求 Body
  const requestBody = details.requestBody ? details.requestBody.raw : null;
  if (!requestBody) {
    console.log('details', details)
    throw Error('Warning Request')
  }
  const decodedBody = JSON.parse(
    String.fromCharCode.apply(null, new Uint8Array(requestBody[0].bytes))
  );

  // 分配工作
  const loopUrlPaths = ['/v2/task/loopUrlTask/', '/api/scheduler/loopUrlTask']
  const isLoopUrlTask = loopUrlPaths.find(pathname => details.url.includes(pathname))

  const collectUrlsPaths = ['/v1/task/collectUrlsTask/', '/api/scheduler/collectUrlsTask']
  const isCollectUrlsTask = collectUrlsPaths.find(pathname => details.url.includes(pathname))

  // 依照不同task工作
  if (isLoopUrlTask) {
    console.log("=== Begin Loop Url ===")
    const { workType, taskUrls } = decodedBody;
    console.log('workType', workType, 'taskUrls', taskUrls)
    let items = []
    for (let taskUrl of taskUrls) {
      const { newsId, url, press, postTime } = taskUrl
      let text = await getNewsHtmlText(url);
      let { item } = await parseHTMLV2(press, text);
      console.log('item', item)

      if (!item) {
        console.group('get item failed.')
        console.log(taskUrl)
        console.groupEnd()
        continue
      }
      items.push({
        ...item,
        url: url,
        press: press,
        newsId: newsId,
        postTime: postTime
      })
      await sleep(1000);
    }
    console.log('items', items)
    let res = await saveNewsItems(items)
    console.log('res', res)
  }

  if (isCollectUrlsTask) {
    console.log("=== Begin Collect Urls ===")
    const { workType, press } = decodedBody;
    console.log('workType', workType, press, decodedBody)


    let urlsList = await collectUrls(press)
    console.log('urlsList', urlsList)
    // 分批存
    while (1) {
      if (!urlsList?.length) break
      let res = await saveNewsUrls(urlsList.splice(urlsList.length - 100))
      console.log('saveNewsUrls', res)
      await sleep(1000)
    }
  }
  console.log('Finish Task.')
  chrome.webRequest.onBeforeRequest.removeListener(TaskListener);
}

chrome.webRequest.onBeforeRequest.addListener(
  TaskListener,
  { urls: ["http://127.0.0.1:3000/api/scheduler/loopUrlTask", "http://127.0.0.1:3000/api/scheduler/collectUrlsTask"] }, // 設置監聽範圍
  ["requestBody"]
);



// loopUrl
async function getNewsHtmlText(url) {
  // "https://www.nytimes.com/2024/10/29/science/animals-death-monso.html"
  return fetch(url, {
    "headers": {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "cache-control": "max-age=0",
    },
    "mode": "cors",
    "credentials": "include"
  }).then(res => res.text());
}

// parseHTML v1 傳到瀏覽器做處理
async function postHtmlTextToContent(tabId, press, htmlText) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { type: "PARSE_HTML", press: press, htmlText: htmlText }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

async function saveNewsItems(items) {
  return await fetch("http://127.0.0.1:8000/v1/save/newsItems/", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
    },
    "body": JSON.stringify(items),
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
  }).then(res => res.json())
}

function collectUrls(press) {
  let urlsList = []
  switch (press) {
    case 'nytimes':
      urlsList = collectUrlsNytimes()
      break
    case 'bbc':
      urlsList = collectUrlsBBC()
      break
    default:
      break
  }
  return urlsList
}

async function saveNewsUrls(urlsList) {
  return await fetch("http://127.0.0.1:8000/v1/save/newsUrls/", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
    },
    "body": JSON.stringify(urlsList),
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
  }).then(res => res.json())
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// ---

async function ensureOffscreen() {
  if (await chrome.offscreen.hasDocument()) {
    return;
  }
  await chrome.offscreen.createDocument({
    url: 'offscreen/offscreen.html',
    reasons: ['DOM_PARSER'], // 你可以自訂原因
    justification: '需要 DOMParser 來解析 HTML',
  });
}

async function parseHTMLV2(press, text) {
  await ensureOffscreen();
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: 'parseHTMLV2', press: press, text: text },
      (response) => {
        resolve(response);
      }
    );
  });
}


