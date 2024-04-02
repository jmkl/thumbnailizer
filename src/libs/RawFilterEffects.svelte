<script>
  export let items = [];
  export let update;
  export let filter_effect_key = "";
  export let filter_subkey = null;
  export let multiplier = 1;
</script>

<div class="relative odd:bg-t-main px-2 py-1">
  <div
    class="w-fit absolute text-white -top-1 px-1 bg-teal-800 text-xxxs font-inter"
  >
    {filter_subkey != null
      ? filter_subkey.toUpperCase()
      : filter_effect_key.toUpperCase()}
  </div>
  <div class="flex flex-row w-full flex-wrap">
    {#each items as rf, i}
      <div class="w-1/2 px-1 text-t-light relative">
        <sp-slider
          class="z-10"
          on:input={(e) => {
            rf.value = parseFloat(e.target.value.toFixed(1));
          }}
          on:contextmenu={() => {
            rf.value = 0;
          }}
          on:change={(e) => {
            if (update && filter_effect_key != "")
              update(filter_effect_key, filter_subkey);
          }}
          value={rf.value}
          min={rf.min}
          max={rf.max}
          step={rf.step}
          size="s"
        >
        </sp-slider>

        <div
          class="flex flex-row text-xxxs absolute z-0 right-0 -top-1 pointer-events-none select-none"
        >
          <p class="font-bold z-0 pointer-events-none select-none">{rf.name}</p>
          <p class="ml-1 z-0 pointer-events-none select-none">
            {rf.value}
          </p>
        </div>
      </div>
    {/each}
  </div>
</div>
