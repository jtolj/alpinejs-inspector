<script lang="ts">
  import TreeView from "svelte-tree-view";
  const theme = {
    base00: "rgb(17 24 39)", // Default Background
    base01: "rgb(17 24 39)", // Lighter Background
    base02: "rgb(17 24 39)", // Selection Background
    base03: "rgb(253 186 116)", // Comments, Invisibles, Line Highlighting
    base04: "rgb(253 186 116)", // Dark Foreground
    base05: "rgb(253 186 116)", // Default Foreground, Caret, Delimiters, Operators
    base06: "rgb(253 186 116)", // Light Foreground
    base07: "rgb(17 24 39)", // Light Background
    base08: "rgb(253 186 116)", // Variables, XML Tags, Markup Link Text, Markup Lists, Diff Deleted
    base09: "rgb(253 186 116)", // Integers, Boolean, Constants, XML Attributes, Markup Link Url
    base0A: "rgb(253 186 116)", // Classes, Markup Bold, Search Text Background
    base0B: "rgb(253 186 116)", // Strings, Inherited Class, Markup Code, Diff Inserted
    base0C: "rgb(253 186 116)", // Support, Regular Expressions, Escape Characters, Markup Quotes
    base0D: "rgb(253 186 116)", // Functions, Methods, Attribute IDs, Headings
    base0E: "rgb(253 186 116)", // Keywords, Storage, Selector, Markup Italic, Diff Changed
    base0F: "rgb(253 186 116)", // Deprecated, Opening/Closing Embedded Language Tags
  };
  let { key, value, classes }: any = $props();
</script>

<div class={classes || ""}>
  <span class="text-blue-300">{key}</span>
  {#if typeof value === "object" && value !== null}
    <TreeView data={value} {theme} />
  {:else}
    <pre class="text-orange-300">{value}</pre>
  {/if}
</div>
