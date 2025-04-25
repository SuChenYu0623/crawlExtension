function parseScript(doc) {
  try {
    let scriptText = Array.from(doc.querySelectorAll('script')).find(tmp => tmp.innerText.includes('window.__preloadedData = ')).innerText
    let text = scriptText
      .replace(/window.__preloadedData = /, '')
      .slice(0, -1) // 排除字尾的 ;
      .replace(/\\u002F/gm, '/')
      .replace(/\\u003C/gm, '<')
      .replace(/\\u003E/gm, '>')
      .replace(/\\&#34;/gm, `"`)
      .replace(/\\&gt;/gm, `>`)
      .replace(/\\&lt;/gm, `<`)
      .replace(/\\\\/gm, `\\`)
      .replace(/\\\\"/gm, `\\"`)
      .replace(/undefined/gm, `false`)
    return JSON.parse(text)
  } catch (error) {
    console.log(`parseScript failed. ${error}`)
    return {}
  }
}

export function parseNews(doc) {
  let item = {}
  try {
    let mainDom = doc.querySelector('article[id="story"]') || doc.querySelector('article[id="story"] header')
    // let title = mainDom.querySelector('[data-testid="headline"]')?.innerText
    let title = doc.querySelector('head title')?.innerText
    // 從頁面上 但不全面，改用從 window 變數
    // let summary = mainDom?.querySelector('[id="article-summary"]')?.innerText || mainDom?.querySelector('[data-testid="headline"]+p')?.innerText    
    // let images_with_desc = Array.from(mainDom.querySelectorAll('[data-testid="imageblock-wrapper"] > figure'))
    //   .map(dom => ({
    //     src: dom.querySelector('img')?.getAttribute('src'),
    //     alt: dom.querySelector('img')?.getAttribute('alt'),
    //     desc: dom.querySelector('figcaption')?.innerText
    //   }))
    //   .filter(tmp => tmp.src && (tmp.alt || tmp.desc))

    // 多圖 和 src
    let srcSet = new Set()
    let images_with_desc = []
    let summary = ''

    // window 變數
    let __preloadedData = parseScript(doc)
    if (__preloadedData?.initialData?.data) {
      __preloadedData.initialData.data.article.sprinkledBody.content
        .filter(d => d.__typename === 'ImageBlock')
        .map(tmp => tmp.media)
        .forEach(media => {
          let src = media.crops
            .map(crop => crop.renditions).flat()
            .find(crop => crop.name === 'superJumbo')
            .url
          let alt = media.altText
          let desc = media.caption.text

          if (src && !srcSet.has(src)) {
            srcSet.add(src)
            images_with_desc.push({ src, alt, desc })
          }
        })
      
      // get image from from <head>
      let src = doc.querySelector('[property="og:image"]')?.getAttribute('content')
      let alt = doc.querySelector('[property="og:image:alt"]')?.getAttribute('content')
      let desc = doc.querySelector('[property="og:description"]')?.getAttribute('content')
      images_with_desc.push({ src, alt, desc })
      summary = __preloadedData?.initialData?.data?.article?.summary || 'tmp'
    } else if (__preloadedData?.interactiveConfig?.interactive?.summary) {
      // https://www.nytimes.com/2024/12/29/world/asia/afghanistan-taliban-tourism.html
      Array.from(doc.querySelectorAll('.g-item-img > .g-image'))
        .forEach(dom => {
          let src = dom.querySelector('picture img').getAttribute('src')
          let alt = dom.querySelector('picture img').getAttribute('alt')
          let desc = dom.querySelector('.g-image-caption-wrapper').innerText
          if (src && !srcSet.has(src)) {
            srcSet.add(src)
            images_with_desc.push({ src, alt, desc })
          }
        })
        summary = __preloadedData?.interactiveConfig?.interactive?.summary || 'tmp'
    }

    // check news
    if (!title) throw Error('Missing title.');
    if (!summary) throw Error('Missing summary.');
    if (!images_with_desc?.length) throw Error('Missing images_with_desc.');

    item.title = title
    item.summary = summary
    item.images_with_desc = images_with_desc
  } catch (error) {
    item = undefined
    console.log(error)
    console.log(doc)
  }
  return item
}


// 未處理的連結
/*
https://www.nytimes.com/2024/12/27/realestate/home-lifts-flooding-climate-change.html

*/