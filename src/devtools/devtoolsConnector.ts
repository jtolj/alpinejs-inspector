import deepClone from "../utils/clone";
import type { AlpineComponent, Message } from "../types";
import beautify from "../utils/beautify";

(function () {
  /**
   * Stores the current state of all components.
   */
  let State: {
    components: { [key: number]: AlpineComponent };
    lastUuid: number;
  } = {
    components: {},
    lastUuid: 1,
  };

  /**
   * Whether the initial set of components has been sent to the devtools panel.
   */
  let initialized = false;

  /** Start Helper functions */

  /**
   * Scroll the inspected component into view.
   *
   * @param componentId The id of the component to scroll into view.
   */
  const scrollToComponent = (componentId: number) => {
    document.querySelectorAll("[x-data]").forEach((el) => {
      if (el.__alpineDeveloperTools?.id === componentId) {
        el.scrollIntoView({
          block: "center",
        });
        const originalOpacity = (el as HTMLElement).style.opacity ?? 1;
        const animation = (el as HTMLElement).animate(
          [{ opacity: 1 }, { opacity: 0.25 }, { opacity: 1 }],
          {
            duration: 300,
            easing: "ease-in-out",
            iterations: 3,
          }
        );
        animation.onfinish = () => {
          (el as HTMLElement).style.opacity = originalOpacity;
        };
      }
    });
  };

  /**
   * Send a message to the devtools panel.
   */
  function sendToDevTools(message: Message) {
    window.postMessage(
      {
        source: "alpine-devtools-connector",
        data: {
          type: message.type,
          payload: message.data,
        },
      },
      "*"
    );
  }

  /**
   * Get the Alpine data instance of an element.
   */
  function getAlpineDataInstance(node: Element): any {
    if (typeof node._x_dataStack !== "undefined") {
      return node._x_dataStack?.[0];
    }
    return node.__x;
  }

  /**
   * Gets the details of the component to send to the devtools panel.
   */
  function getComponentDetails(element: Element): AlpineComponent {
    if (typeof element.__alpineDeveloperTools === "undefined") {
      element.__alpineDeveloperTools = {
        id: State.lastUuid++,
      };
    }
    return {
      id: element.__alpineDeveloperTools!.id,
      tagName: element.tagName.toLowerCase(),
      attributes: Object.fromEntries(
        [...element.attributes].map((attr) => {
          if (attr.name === "x-data") {
            return ["x-data", beautify(attr.value)];
          }
          return [attr.name, attr.value];
        })
      ),
      state: deepClone(getAlpineDataInstance(element)),
    };
  }

  /** End Helper functions */

  /** Begin register event listeners  */

  /**
   * Listen for messages from the devtools panel.
   */
  window.addEventListener("message", (event) => {
    if (event.data.source !== "alpine-devtools-panel") return;
    switch (event.data.payload.type) {
      case "inspectComponent":
        scrollToComponent(event.data.payload.data);
        break;
    }
  });

  /** End register event listeners */

  /**
   * Start up the connector when the script is loaded.
   */
  function start() {
    const alpineComponents = Array.from(document.querySelectorAll("[x-data]"));

    alpineComponents.forEach((rootEl, index) => {
      if (!getAlpineDataInstance(rootEl)) {
        return;
      }
      if (typeof rootEl.__alpineDeveloperTools === "undefined") {
        rootEl.__alpineDeveloperTools = {
          id: State.lastUuid++,
        };
      }

      State.components[rootEl.__alpineDeveloperTools.id] =
        getComponentDetails(rootEl);

      const componentData = getAlpineDataInstance(rootEl);

      window.Alpine!.effect(() => {
        for (const key in componentData) {
          void componentData[key];
        }

        if (!initialized) {
          return;
        }

        window.Alpine!.nextTick(() => {
          for (const key in componentData) {
            const currentState =
              State.components[rootEl.__alpineDeveloperTools!.id].state;
            if (
              // This is a new key
              !currentState.hasOwnProperty(key) ||
              // or the value has changed
              currentState[key] !== componentData[key]
            ) {
              State.components[rootEl.__alpineDeveloperTools!.id] =
                getComponentDetails(rootEl);
              return sendToDevTools({
                type: "updateComponent",
                data: {
                  id: rootEl.__alpineDeveloperTools!.id,
                  value: State.components[rootEl.__alpineDeveloperTools!.id],
                },
              });
            }
          }
        });
      });
    });

    sendToDevTools({
      type: "initComponents",
      data: State.components,
    });

    /**
     * Watch for Alpine components being added or removed and respond accordingly.
     */
    const observer = new MutationObserver((list) => {
      list.forEach((mutation) => {
        mutation.addedNodes.forEach((node: Node) => {
          if (!(node instanceof Element)) {
            return;
          }
          if (node.getAttribute("x-data")) {
            node.__alpineDeveloperTools = { id: State.lastUuid++ };
            State.components[node.__alpineDeveloperTools.id] =
              getComponentDetails(node);
            sendToDevTools({
              type: "addComponent",
              data: {
                id: node.__alpineDeveloperTools!.id,
                value: State.components[node.__alpineDeveloperTools!.id],
              },
            });
          }
        });
        mutation.removedNodes.forEach((node: Node) => {
          if (!(node instanceof Element)) {
            return;
          }
          if (node.getAttribute("x-data")) {
            if (node.__alpineDeveloperTools) {
              sendToDevTools({
                type: "removeComponent",
                data: {
                  id: node.__alpineDeveloperTools!.id,
                },
              });
              delete State.components[node.__alpineDeveloperTools!.id];
            }
          }
        });
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    initialized = true;
  }

  start();
})();
