<script>
  import IconButton from "./IconButton.svelte";
  import { createEventDispatcher, onMount } from "svelte";
  const dispatch = createEventDispatcher();
  let showMenu = false;
  /**
   * name : string
   * object : any
   */
  export let dropdown_items = null;
  export let selected_index = 0;
  export let active_template = null;
  export let label = "default";
  $: if (selected_index > -1 && dropdown_items != null) {
    active_template = dropdown_items[selected_index];
  }

  let timerid;
  function onEnter() {
    clearTimeout(timerid);
  }
  function onLeave() {
    timerid = setTimeout(() => {
      if (showMenu) showMenu = false;
    }, 100);
  }
  export let hidden;
</script>

<div class={$$restProps.class || ""}>
  <div
    on:click={() => (showMenu = !showMenu)}
    class="cursor-pointer relative border-none w-full rounded-sm px-2 py-1 bg-t-main hover:bg-t-scnd active:bg-t-thrd text-white flex flex-row justify-between"
  >
    <div
      class="font-bold whitespace-nowrap text-ellipsis overflow-hidden w-full"
    >
      {dropdown_items[selected_index] != null
        ? dropdown_items[selected_index]?.name
            .replace(".psd", "")
            .replace("template ", "")
            .toUpperCase()
        : "None"}
    </div>
    <div class="tex">
      {#if showMenu}
        <IconButton icon="up" />
      {:else}
        <IconButton icon="down" />
      {/if}
    </div>
  </div>
  <div
    on:mouseleave={onLeave}
    on:mouseenter={onEnter}
    class="absolute left-0 z-10 w-full flex flex-row flex-wrap bg-t-main justify-center"
  >
    {#if showMenu && dropdown_items}
      {#each dropdown_items as item, i}
        <div
          on:click={() => {
            showMenu = false;
            selected_index = i;

            dispatch("valuechange", { data: item, index: selected_index });
          }}
          class={`cursor-pointer w-fit p-1 grow text-center text-white hover:bg-t-scnd active:bg-t-thrd`}
        >
          <div class="odd:bg-t-thrd py-1 px-4 font-extrabold">
            {item.name
              .replace(".psd", "")
              .replace("template ", "")
              .toUpperCase()}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
