import * as parseNewsNytimes from './parseNews/nytimes'

function parseNews(press, doc) {
  switch (press) {
    case 'nytimes':
      return parseNewsNytimes(doc)
  }
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


