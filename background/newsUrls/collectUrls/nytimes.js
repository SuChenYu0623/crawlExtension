import { sleep } from "../../commonFunc/commonFunc.js";

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

export async function collectUrls() {
  const cateIds = ['world', 'business', 'arts', 'opinion', 'food', 'well', 'travel']
  let urlsList = []
  for (let cateId of cateIds) {
    console.group(`== cateId: ${cateId} ==`)
    for (let page = 1; page < 3; page++) {
      let urls = await getNewsUrls(cateId, page)
      urlsList.push(...urls)
      console.log(`page: ${page}, urls: ${urls.length}, total: ${urlsList.length}`)
      await sleep(2 * 1000)
    }
    console.groupEnd()
  }
  return urlsList
}