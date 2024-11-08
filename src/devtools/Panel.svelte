<script lang="ts">
  import { getContext } from "svelte";
  import type { AlpineComponent, Message } from "../types";
  import "./panel.css";
  import AlpineData from "./components/AlpineData.svelte";

  const alpineVersion = getContext("alpineVersion");
  let alpineComponents: { [key: number]: AlpineComponent } = $state({});
  let selectedComponent: AlpineComponent | null = $state(null);

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.source !== "alpine-devtools-connector") return;
    const { type, payload } = message.data;
    switch (type) {
      case "initComponents":
        alpineComponents = payload;
        break;
      case "updateComponent":
        alpineComponents[payload.id].state = payload.value.state;
        alpineComponents[payload.id].attributes = payload.value.attributes;
        alpineComponents[payload.id].tagName = payload.value.tagName;
        break;
      case "addComponent":
        alpineComponents[payload.id] = payload.value;
        break;
      case "removeComponent":
        delete alpineComponents[payload.id];
        if (selectedComponent?.id === payload.id) {
          selectedComponent = null;
        }
        break;
    }
  });

  const tabId: number = getContext("tabId");
  const sendMessage = (message: Message) => {
    chrome.tabs.sendMessage(tabId, {
      source: "alpine-devtools-panel",
      data: message,
    });
  };

  const inspect = (component: AlpineComponent) => () => {
    selectedComponent = component;
    sendMessage({ type: "inspectComponent", data: component.id });
  };
</script>

<main class="h-screen text-gray-200 bg-gray-900">
  {#if !alpineVersion}
    <div class="p-8 text-center text-gray-500">Alpine.js not detected</div>
  {:else if !alpineVersion.toString().startsWith("3")}
    <div class="p-8 text-center text-gray-500">
      Alpine.js v{alpineVersion} is not supported. Please use Alpine.js v3.
    </div>
  {:else}
    <header class="p-2 border-b border-gray-700">
      <h1 class="font-medium">Alpine.js v{alpineVersion}</h1>
    </header>

    <div class="grid grid-cols-[400px_1fr] h-[calc(100vh-64px)]">
      <div class="overflow-y-auto border-r border-gray-700">
        <h2 class="p-4 text-base font-medium border-b border-gray-700">
          Components
        </h2>
        <ul>
          {#each Object.values(alpineComponents) as component}
            <li id="component-{component.id}">
              <button
                onclick={inspect(component)}
                class="px-4 py-3 flex flex-col items-start gap-1 w-full border-b border-gray-800 cursor-pointer font-mono text-sm hover:bg-gray-800
          {selectedComponent?.id === component.id ? 'bg-blue-900' : ''}"
              >
                <span class="text-blue-400">{component.tagName}</span>
                {#if component.attributes["x-data"]}
                  <pre
                    class="w-full overflow-y-auto text-xs text-left text-orange-300">{component
                      .attributes["x-data"]}</pre>
                {/if}
              </button>
            </li>
          {/each}
        </ul>
      </div>

      <div class="overflow-y-auto bg-gray-900">
        <h2 class="p-4 text-base font-medium border-b border-gray-700">
          Inspector
        </h2>
        {#if selectedComponent}
          <div class="p-4">
            <div class="mb-6">
              <h3 class="mb-2 text-sm text-blue-300">Element</h3>
              <div
                class="grid grid-cols-[175px_1fr] p-2 border-b border-gray-800 font-mono text-sm"
              >
                <span class="text-blue-300">Tag</span>
                <span class="text-orange-300">{selectedComponent.tagName}</span>
                <span class="text-blue-300">Attributes</span>
                <span class="text-orange-300">
                  <ul>
                    {#each Object.entries(selectedComponent.attributes) as [key, value]}
                      {#if key !== "x-data"}
                        <li>{key}: "{value}"</li>
                      {/if}
                    {/each}
                  </ul>
                </span>
              </div>
            </div>

            <div class="mb-6">
              <h3 class="mb-2 text-sm text-blue-300">Alpine.js Data</h3>
              {#each Object.entries(selectedComponent.state) as [key, value]}
                <AlpineData
                  classes="grid grid-cols-[175px_1fr] p-2 border-b border-gray-800 font-mono text-sm"
                  {key}
                  {value}
                />
              {/each}
            </div>
          </div>
        {:else}
          <div class="p-8 text-center text-gray-500">
            Select a component to inspect
          </div>
        {/if}
      </div>
    </div>
  {/if}
</main>
