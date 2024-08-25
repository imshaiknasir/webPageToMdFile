function createToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #333;
    color: #fff;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '1';
  }, 10);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 800);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showToast") {
    createToast(request.message);
    sendResponse({success: true});
  } else if (request.action === "downloadMarkdown") {
    try {
      const blob = new Blob([request.markdown], {type: 'text/markdown'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = request.fileName;
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      sendResponse({success: true});
    } catch (error) {
      console.error('Download Error:', error);
      sendResponse({success: false, error: error.message});
    }
  }
  return true; // Indicates that the response will be sent asynchronously
});

console.log('[URL to Markdown Downloader] Content script loaded');