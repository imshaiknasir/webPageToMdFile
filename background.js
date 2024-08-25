debugger;

function log(message) {
  console.log(`[URL to Markdown Downloader] ${message}`);
}

chrome.action.onClicked.addListener(async (tab) => {
  try {
    log('Extension icon clicked');
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    const currentTab = tabs[0];
    const currentUrl = currentTab.url;
    const finalUrl = `https://r.jina.ai/${currentUrl}`;
    const pageTitle = currentTab.title;

    log(`Processing URL: ${currentUrl}`);
    await showToast('Processing page...', tab.id);

    fetch(finalUrl, {
      method: 'POST'
    })
    .then(response => {
      log('Received response from r.jina.ai');
      return response.text();
    })
    .then(markdown => {
      log('Markdown generated');
      const date = new Date();
      const fileName = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}-${date.getHours().toString().padStart(2, '0')}-${date.getMinutes().toString().padStart(2, '0')}-${date.getSeconds().toString().padStart(2, '0')}-${pageTitle.replace(/[^a-z0-9]/gi, '_')}.md`;

      log(`Preparing to download file: ${fileName}`);
      showToast('Downloading Markdown...', tab.id);

      // Send markdown content to content script for download
      chrome.tabs.sendMessage(tab.id, {
        action: "downloadMarkdown",
        markdown: markdown,
        fileName: fileName
      }, (response) => {
        if (chrome.runtime.lastError) {
          log(`Download failed: ${chrome.runtime.lastError.message}`);
          showToast('Download failed', tab.id);
        } else if (response && response.success) {
          log(`File downloaded successfully.`);
          showToast('Download complete!', tab.id);
        } else {
          log('Download failed');
          showToast('Download failed', tab.id);
        }
      });
    })
    .catch(error => {
      console.error('Fetch Error:', error);
      log(`Error occurred: ${error.message}`);
      showToast('An error occurred', tab.id);
    });
  } catch (error) {
    console.error('Listener Error:', error);
    log(`Error in onClicked listener: ${error.message}`);
    await showToast('An error occurred', tab.id);
  }
});

async function showToast(message, tabId) {
  return chrome.tabs.sendMessage(tabId, {action: "showToast", message: message});
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveFile') {
    sendResponse({success: true});
  }
});