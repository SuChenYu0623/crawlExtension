function cleanHtml(dom) {
  // 移除廣告
  dom.querySelectorAll('[data-component="ad-slot"], [data-component="tags"], [data-component="byline-block"], [data-component="headline-block"]')
    .forEach(dom => dom.remove())
  return dom
}

function parseImagesWithDesc(dom) {
  // 第一版
  let images_with_desc = Array.from(dom.querySelectorAll('figure'))
    .map(_dom => {
      const imgDom = _dom.querySelector('[data-component="image-block"] img[srcset]')
      let src = imgDom.getAttribute('src')
      let alt = imgDom.getAttribute('alt')
      let desc = _dom.querySelector('[data-component="caption-block"] > figcaption')?.innerText
      return {
        ...(src && { src }),
        ...(alt && { alt }),
        ...(desc && { desc }),
      }
    })

  return [...images_with_desc]
    .filter(item => Object.keys(item)?.length)
    .filter((item, index, arr) => arr.map(tmp => tmp.src).indexOf(item.src) === index)
}

// ---
function parseVideoPage(doc) {
  const title = doc.querySelector('[property="og:title"]')?.getAttribute('content')
  const src = doc.querySelector('[property="og:image"]')?.getAttribute('content')
  const alt = doc.querySelector('[property="og:image:alt"]')?.getAttribute('content')
  const images_with_desc = [{ src, alt }]

  let mainDom = doc.querySelector('[data-testid="video-page-container"] [data-testid="video-page-video-section"]')
  mainDom?.querySelectorAll('time[datetime]')?.forEach(dom => dom.remove())
  const summary = mainDom?.innerText?.trim()
  return { title, summary, images_with_desc }
}

export function parseNews(doc) {
  let item = {}
  try {
    let title = ''
    let summary = ''
    let images_with_desc = []

    let isVideoPage = doc.querySelector('[data-testid="video-page-container"] [data-testid="video-page-video-section"]')
    let isNormalPage = doc.querySelector('[id="main-content"] article')

    if (isVideoPage) {
      const tmp = parseVideoPage(doc)
      title = tmp.title
      summary = tmp.summary
      images_with_desc = tmp.images_with_desc
    } else if (isNormalPage) {
      title = doc.querySelector('head title')?.innerText
      let mainDom = doc.querySelector('[id="main-content"] article')
      let dom = cleanHtml(mainDom)
      // 多圖 和 src
      images_with_desc = parseImagesWithDesc(dom)
      // get image from from <head>
      let src = doc.querySelector('[property="og:image"]')?.getAttribute('content')
      let alt = doc.querySelector('[property="og:image:alt"]')?.getAttribute('content')
      let desc = doc.querySelector('[property="og:description"]')?.getAttribute('content')
      if (src || alt | desc) {
        images_with_desc.push({
          ...(src && { src }),
          ...(alt && { alt }),
          ...(desc && { desc }),
        })
      }

      // 拿不到 summary 直接拿內文
      dom.querySelectorAll('figure').forEach(_dom => _dom.remove())
      summary = dom?.innerText?.trim()
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
