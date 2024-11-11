<script lang="ts">
  import Self from "./AlpineData.svelte";
  let { key, value, classes }: any = $props();
</script>

<div class={classes || ""}>
  <span class="text-blue-300">{key}</span>
  {#if Array.isArray(value)}
    <pre class="text-orange-300">[{value.join(", ")}]</pre>
  {:else if typeof value === "object"}
    <div>
      {#each Object.entries(value) as [k, v]}
        <Self key={k} value={v} classes="mb-2 font-mono text-sm" />
      {/each}
    </div>
  {:else}
    <pre class="text-orange-300">{value}</pre>
  {/if}
</div>
