<script>
  export let onclick;
</script>

<div
  on:click={onclick}
  class={`text-white font-bold w-full h-full hover:bg-blue-400 active:bg-orange-500 cursor-pointer bg-blue-600 p-1 text-center rounded-sm ${$$restProps.class}`}
>
  <slot />
</div>
