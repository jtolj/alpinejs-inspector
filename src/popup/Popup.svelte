<script lang="ts">
  import detectAlpine from "../utils/detect-alpine";

  let loading: boolean = $state(true);
  let alpineVersion: string | null = $state(null);

  chrome.tabs
    .query({ active: true, currentWindow: true })
    .then(([activeTab]) => {
      if (activeTab?.id) {
        detectAlpine(activeTab.id).then((version) => {
          alpineVersion = version;
          loading = false;
        });
      } else {
        loading = false;
      }
    });
</script>

<main style="width:200px">
  <div>
    {#if alpineVersion}
      <p>Alpine.js detected v{alpineVersion}.</p>
      {#if alpineVersion.toString().startsWith("3")}
        <p>Open Developer Tools to inspect.</p>
      {:else}
        <p>
          Alpine.js v{alpineVersion} is not supported. Please use Alpine.js v3.
        </p>
      {/if}
    {:else if loading}
      <p>Checking for Alpine.js...</p>
    {:else}
      <p>Alpine.js not detected.</p>
    {/if}
  </div>
</main>
