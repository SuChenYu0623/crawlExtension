chrome.runtime.onInstalled.addListener(async () => {
  console.log("Extension installed!");
});

chrome.webRequest.onBeforeRequest.addListener(
  async (details) => {
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
      const tabs = await chrome.tabs.query({ url: 'http://127.0.0.1:8000/' });
      const tab = tabs[0]
      const tabId = tab.id; // 保存初始的 Tab ID

      console.log('taskUrls', taskUrls)
      let items = []
      for (let taskUrl of taskUrls) {
        const { newsId, url, press, postTime } = taskUrl
        let text = await getNewsHtmlText(url);
        let item = await postHtmlTextToContent(tabId, press, text);
        console.log('item', item)
        if (!item) continue
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
      const { workType } = decodedBody;
      console.log('workType', workType, decodedBody)

      let urlsList = await collectUrls()
      console.log('urlsList', urlsList)
      let res = await saveNewsUrls(urlsList)
      console.log('saveNewsUrls', res)
      // if (workType === 'collectUrls') {
      //   let urlsList = await collectUrls()
      //   console.log('urlsList', urlsList)
      //   let res = await saveNewsUrls(urlsList)
      //   console.log('saveNewsUrls', res)
      // }
    }
    console.log('Finish Task.')
  },
  { urls: ["<all_urls>"] }, // 設置監聽範圍
  ["requestBody"]
);


chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  const { urls, press } = message;
  console.log('urls', urls)
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabId = tab.id; // 保存初始的 Tab ID
  if (press === 'nytimes') {
    // process news  
    let items = []
    for (let url of urls) {
      let text = await getNewsHtmlText(url);
      let item = await postHtmlTextToContent(tabId, press, text);
      let newsId = url.match(/\/([a-zA-Z0-9-]+)\.html/)
      items.push({
        ...item,
        newsId: newsId,
        url: url,
        press: press
      })
      await sleep(1000);
    }
    console.log(items)
  }
  return true; // Indicates that the response will be sent asynchronously
});

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

// nytimes
async function getNewsUrls(cateId, page) {
  let operationName = 'CollectionsQuery';
  let variables = {
    "id": `/section/${cateId}`, // 類別 格式 /section/<cate>
    "first": 10, // 影響數量
    "streamQuery": {
      "sort": "newest"
    },
    "exclusionMode": "HIGHLIGHTS_AND_EMBEDDED",
    "isFetchMore": true,
    "isHighEnd": false,
    "highlightsListUri": "nyt://per/personalized-list/__null__",
    "highlightsListFirst": 0,
    "hasHighlightsList": false,
    "cursor": btoa(`arrayconnection:${page * 10 - 1}`) // 控制頁數 0, 9, 19 可以研究 但都是送10筆回來
  }

  let extensions = {
    "persistedQuery": {
      "version": 1,
      "sha256Hash": "f86f6eaea6769bf05fc23200adf83dc8e98af9355be7461b21c948f16f83b88c"
    }
  }

  let apiUrl = new URL('https://samizdat-graphql.nytimes.com/graphql/v2')
  apiUrl.searchParams.set('operationName', operationName)
  apiUrl.searchParams.set('variables', JSON.stringify(variables))
  apiUrl.searchParams.set('extensions', JSON.stringify(extensions))

  return fetch(`${apiUrl.href}`, {
    "headers": {
      "accept": "*/*",
      "content-type": "application/json",
      "nyt-app-type": "project-vi",
      "nyt-app-version": "0.0.5",
      "nyt-token": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs+/oUCTBmD/cLdmcecrnBMHiU/pxQCn2DDyaPKUOXxi4p0uUSZQzsuq1pJ1m5z1i0YGPd1U1OeGHAChWtqoxC7bFMCXcwnE1oyui9G1uobgpm1GdhtwkR7ta7akVTcsF8zxiXx7DNXIPd2nIJFH83rmkZueKrC4JVaNzjvD+Z03piLn5bHWU6+w+rA+kyJtGgZNTXKyPh6EC6o5N+rknNMG5+CdTq35p8f99WjFawSvYgP9V64kgckbTbtdJ6YhVP58TnuYgr12urtwnIqWP9KSJ1e5vmgf3tunMqWNm6+AnsqNj8mCLdCuc5cEB74CwUeQcP2HQQmbCddBy2y0mEwIDAQAB",
      "pragma": "no-cache",
      "priority": "u=1, i",
      "x-nyt-internal-meter-override": "undefined",
      "x-nyt-targeting-dimensions-map": "newsTenure=anon_user"
    },
    "body": null,
    "method": "GET",
    "mode": "cors",
    "credentials": "include"
  }).then(res => res.json())
    .then(res => res.data.legacyCollection.collectionsPage.stream.edges
      .map(edge => ({
        newsId: edge.node.url?.match(/\/([^/]+)\.html/)?.[1],
        url: edge.node.url,
        title: edge.node.headline.default,
        postTime: new Date(edge.node.firstPublished),
        press: "nytimes"
      }))
    )
    .catch(() => [])
}

async function collectUrls() {
  const cateIds = ['world', 'business', 'arts', 'opinion', 'food', 'well', 'travel']
  let urlsList = []
  for (let cateId of cateIds) {
    console.group(`== cateId: ${cateId} ==`)
    for (let page = 1; page < 10; page++) {
      let urls = await getNewsUrls(cateId, page)
      urlsList.push(...urls)
      console.log(`page: ${page}, urls: ${urls.length}, total: ${urlsList.length}`)
      await sleep(2 * 1000)
    }
    console.groupEnd()
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


async function main() {
  console.log(123)
  let url = 'https://www.nytimes.com/2024/10/29/science/animals-death-monso.html'
  let text = await getNewsHtmlText(url);
  console.log('getNewsHtmlText finish')
  let item = await postHtmlTextToContent('nytimes', text);
  console.log('postHtmlTextToContent finish')
  console.log(item)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
