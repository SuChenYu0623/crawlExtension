export function parseNews(doc) {
  let item = {}
  try {
    let mainDom = doc.querySelector('article[id="story"]') || doc.querySelector('article[id="story"] header')
    let title = mainDom.querySelector('[data-testid="headline"]')?.innerText
    let summary = mainDom.querySelector('[id="article-summary"]')?.innerText || mainDom.querySelector('[data-testid="headline"]+p')?.innerText
    let images_with_desc = Array.from(mainDom.querySelectorAll('[data-testid="imageblock-wrapper"] > figure'))
      .map(dom => ({
        src: dom.querySelector('img')?.getAttribute('src'),
        alt: dom.querySelector('img')?.getAttribute('alt'),
        desc: dom.querySelector('figcaption')?.innerText
      }))
      .filter(tmp => tmp.src && (tmp.alt || tmp.desc))

    if (!title) throw Error('Missing title.');
    if (!summary) throw Error('Missing title.');
    if (!images_with_desc?.length) throw Error('Missing title.');

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