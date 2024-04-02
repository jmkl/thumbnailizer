<script>
  export let state = true;
</script>

<div
  on:click={() => {
    state = !state;
  }}
  class="flex flex-row text-white p-1 items-center"
>
  <div
    class={`${
      state ? "bg-blue-500" : "bg-gray-700"
    } w-3 h-3 mr-1 rounded-sm cursor-pointer border-2 border-blue-500`}
  ></div>
  <slot />
</div>
