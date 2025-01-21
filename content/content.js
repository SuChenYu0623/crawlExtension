// window.onload = async function () {
//   const extensionContainer = document.querySelector('.my-extension-container')
//   const displayBtn = document.querySelector('#display')
//   const nytimesBtn = document.querySelector('#nytimes')

//   const postUrlToBg = async (urls, press) => {
//     console.log(urls, press)
//     chrome.runtime.sendMessage({ press: press, urls: urls });
//   }

//   displayBtn.addEventListener('click', async () => {
//     if (!extensionContainer.getAttribute('style')) {
//       extensionContainer.setAttribute('style', 'background-color: #c0c0c0;')
//       displayBtn.textContent = "關閉"
//     } else {
//       extensionContainer.removeAttribute('style')
//       displayBtn.textContent = "顯示"
//     }      
//   })

//   nytimesBtn.addEventListener('click', async() => {
//     console.log('nytimes')
//     const urls = [
//       'https://www.nytimes.com/2024/10/29/science/animals-death-monso.html',
//       'https://www.nytimes.com/2024/12/12/us/politics/tech-sales-china-huawei.html',
//       'https://www.nytimes.com/2024/12/11/technology/social-media-goodreads-reddit-tiktok.html',
//       'https://www.nytimes.com/2024/12/11/business/energy-environment/exxon-mobil-data-centers-power-plant.html',
//       'https://www.nytimes.com/2024/12/10/business/gm-cruise-robotaxi.html'
//     ]
//     const press = 'nytimes'
//     await postUrlToBg(urls, press)
//   })
// };
 
// const container = document.createElement('div')
// container.classList.add('my-extension-container')
// container.innerHTML = `
//   <div>
//     <div class="button-block">
//       <a id="display" class="button-dom">顯示</a>
//       <a id="nytimes" class="button-dom">nytimes</a>
//     </div>
//   </div>
// `
// document.body.prepend(container)


/* === other === */
function parseNews(doc) {
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, htmlText } = message;
  console.log('type:', type)
  if (type === "PARSE_HTML") {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");
    const item = parseNews(doc);
    sendResponse(item);
  }
  return true; // Indicates the response will be sent asynchronously
});