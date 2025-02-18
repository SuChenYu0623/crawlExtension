import {parseNews as parseNewsNytimes} from './parseNews/nytimes.js'
import {parseNews as parseNewsBBC} from './parseNews/bbc.js'

function parseNews(press, doc) {
  let item = undefined
  switch (press) {
    case 'nytimes':
      item = parseNewsNytimes(doc)
      break
    case 'bbc':
      item = parseNewsBBC(doc)
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
  const { action } = message
  if (action === 'parseHTMLV2') {
    const { press, text } = message
    const doc = parseDoc(text)
    const item = parseNews(press, doc)
    sendResponse({ item });
  }
});


