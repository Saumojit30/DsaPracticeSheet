/**
 * Background Service Worker
 * Configures Chrome Side Panel behavior
 */
chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => console.error('Error setting panel behavior:', error));
  }
});
