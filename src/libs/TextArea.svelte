<script>
  let show = false;
  let ref = null;
  let value = "tag this line!\rsome sentence!!!\rthis is second line!";
  let timerid;
  function handleMouseLeave() {
    if (timerid) clearTimeout(timerid);
    timerid = setTimeout(() => {
      show = false;
    }, 300);
  }
  function handleMouseEnter() {
    if (timerid) clearTimeout(timerid);
  }
  $: if (show && ref != null) ref.focus();

  export let lines = [];
  $: lines = value
    .split("\r")
    .map((e, i) => ({ index: i, value: e, state: 0 }));

  const state_color = ["#fff", "#fd0", "#0f0", "#444"];

  export let current_todo = "";
  $: {
    console.log("update");
    value = current_todo;
  }
  export let copyThisText = null;
</script>

<div class="w-full min-h-20">
  {#if show}
    <sp-textarea
      quiet={true}
      size="s"
      bind:this={ref}
      on:input={(e) => (value = ref.value)}
      on:mouseenter={() => handleMouseEnter()}
      on:mouseleave={handleMouseLeave}
      class="w-full h-20 text-white [&>*]:text-red-900">{value}</sp-textarea
    >
  {:else}
    <div class="w-full min-h-20 h-full text-white p-2 bg-t-main relative">
      <div class="text">
        {#each lines as v, i}
          <div
            class="cursor-pointer"
            style="color:{state_color[v.state]}"
            on:contextmenu={() => {
              v.state = v.state == 0 ? state_color.length - 1 : 0;
            }}
            on:click={(e) => {
              if (e.shiftKey) {
                if (copyThisText) copyThisText(v);
                return;
              }
              v.state = v.state + 1;
              if (v.state > state_color.length - 1) v.state = 0;
            }}
          >
            {v.value}
          </div>
        {/each}
      </div>
      <div
        on:click={() => (show = true)}
        class="cursor-pointer absolute top-2 right-2 [&>*]:fill-white [&>*]:hover:fill-red-400"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          class="w-4 h-4"
        >
          <path
            d="M3 4.75a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM6.25 3a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5h-7ZM6.25 7.25a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5h-7ZM6.25 11.5a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5h-7ZM4 12.25a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM3 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
          />
        </svg>
      </div>
    </div>
  {/if}
</div>
