import {parseNews as parseNewsNytimes} from './parseNews/nytimes.js'

function parseNews(press, doc) {
  let item = undefined
  switch (press) {
    case 'nytimes':
      item = parseNewsNytimes(doc)
      break
    default:
      break
  }
  return item
}

function parseDoc(text) {
  return new DOMParser().parseFromString(text, 'text/html')
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { action, press, text } = message
  if (action === 'parseHTMLV2') {
    const doc = parseDoc(text)
    const item = parseNews(press, doc)
    sendResponse({ item });
  }
});


