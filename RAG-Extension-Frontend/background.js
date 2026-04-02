console.log("BACKGROUND STARTED");

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension Installed");
});

chrome.action?.onClicked.addListener((tab) => {
  console.log("ICON CLICKED");

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["inject.js"]
  });
});