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
      let caption = _dom.querySelector('[data-component="caption-block"] > figcaption')?.innerText
      return {
        ...(src && { src }),
        ...(alt && { alt }),
        ...(caption && { caption }),
      }
    })

  return [...images_with_desc]
    .filter(item => Object.keys(item)?.length)
    .filter((item, index, arr) => arr.map(tmp => tmp.src).indexOf(item.src) === index)
}

export function parseNews(doc) {
  let item = {}
  try {
    let title = doc.querySelector('head title')?.innerText

    // 清理頁面 dom
    let mainDom = doc.querySelector('[id="main-content"] article')
    let dom = cleanHtml(mainDom)
    // 多圖 和 src
    let images_with_desc = parseImagesWithDesc(dom)

    // 拿不到 summary 直接拿內文
    dom.querySelectorAll('figure').forEach(_dom => _dom.remove())
    let summary = dom?.innerText?.trim()

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
