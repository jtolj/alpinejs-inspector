declare global {
  interface Window {
    Alpine?: {
      nextTick(arg0: () => void): unknown;
      version: string;
      effect: (fn: Function) => void;
    };
  }

  interface Element {
    _x_dataStack?: Array<any>;
    __x?: any;
    __alpineDeveloperTools?: {
      id: number;
    };
  }
}

const detectAlpine = async (tabId: number): Promise<string | null> => {
  return new Promise((resolve) => {
    let attemptsRemaining = 10;
    const i = setInterval(() => {
      if (attemptsRemaining <= 0) {
        clearInterval(i);
        resolve(null);
        return;
      }
      attemptsRemaining--;

      chrome.scripting
        .executeScript({
          target: { tabId: tabId },
          func: () => {
            return window.Alpine?.version;
          },
          world: "MAIN",
        })
        .then((results) => {
          const result = results[0]?.result;
          if (result === undefined || result === null) {
            return;
          }
          clearInterval(i);
          resolve(result);
        })
        .catch((err) => console.error(err));
    }, 100);
  });
};

export default detectAlpine;
