/**
 * Listen for messages from the connector and forward them to the devtools panel.
 */
window.addEventListener("message", (event) => {
  if (event.data.source !== "alpine-devtools-connector") return;
  chrome.runtime.sendMessage({
    source: "alpine-devtools-connector",
    data: event.data.data,
  });
});

/**
 * Listen for messages from the devtools panel and forward them to the connector.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.source !== "alpine-devtools-panel") return;
  window.postMessage(
    {
      source: "alpine-devtools-panel",
      payload: message.data,
    },
    "*"
  );
});
