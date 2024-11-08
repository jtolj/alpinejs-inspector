import { mount, unmount } from "svelte";
import App from "./Panel.svelte";
import detectAlpine from "../utils/detect-alpine";

let app: ReturnType<typeof mount> | null = null;

const start = () => {
  if (chrome.devtools.inspectedWindow?.tabId) {
    detectAlpine(chrome.devtools.inspectedWindow.tabId).then((version) => {
      if (version?.toString().startsWith("3")) {
        chrome.scripting
          .executeScript({
            target: { tabId: chrome.devtools.inspectedWindow.tabId },
            files: ["/messageProxy.js"],
            world: "ISOLATED",
          })
          .then(() =>
            chrome.devtools.inspectedWindow.eval(
              "console.log('loaded content script')"
            )
          )
          .catch((err) =>
            chrome.devtools.inspectedWindow.eval(
              `console.error(${err.message})`
            )
          );

        chrome.scripting.executeScript({
          target: { tabId: chrome.devtools.inspectedWindow.tabId },
          files: ["assets/devtoolsConnector.js"],
          world: "MAIN",
        });
      }

      app = mount(App, {
        target: document.getElementById("app")!,
        context: new Map<any, any>([
          ["alpineVersion", version],
          ["tabId", chrome.devtools.inspectedWindow.tabId],
        ]),
      });
    });
  }
};

const tearDown = () => {
  if (app) {
    unmount(app);
  }
};

const navigated = () => {
  tearDown();
  start();
};

chrome.devtools.network.onNavigated.addListener(navigated);
start();
