<script>
  import {
    STORAGE,
    ApplyColor,
    applyGradient,
    MapRange,
    removeGuides,
    openPicker,
    hex2rgb,
  } from "../utils/psutils";
  import IconButton from "./IconButton.svelte";
  import ColorSort from "../utils/ColorSort";
  import Spacer from "./Spacer.svelte";
  let show_text = false;
  let textarea_value = "";
  let colors = [];

  const color_sort = new ColorSort();
  function load_all_colors() {
    const c = JSON.parse(localStorage.getItem(STORAGE.COLORS));
    if (c != undefined) {
      colors = color_sort.sort(c);
    }
  }

  const colpattern = /(?:[0-9a-fA-F]{3}){1,2}/gm;
  let currentvalue = JSON.parse(localStorage.getItem(STORAGE.TRICOLOR));
  let current_gradient_value = JSON.parse(
    localStorage.getItem(STORAGE.GRADIENTCOLOR)
  );
  load_all_colors();
  let tri_color = currentvalue != null ? currentvalue : ["fff", "fff", "fff"];
  let gradient_color =
    current_gradient_value != null ? current_gradient_value : ["fff", "fff"];

  let slider_top_value = 50;
  let slider_bottom_value = 50;

  function onSliderTopChange() {
    if (slider_bottom_value < slider_top_value) {
      slider_bottom_value = slider_top_value;
    }
  }
  function onSliderBottomChange() {
    if (slider_bottom_value < slider_top_value) {
      slider_top_value = slider_bottom_value;
    }
  }
  function sliderOnChange() {
    const top = Math.floor(MapRange(slider_top_value, 0, 100, 0, 4096));
    const bottom = Math.floor(MapRange(slider_bottom_value, 0, 100, 0, 4096));
    ApplyColor(tri_color, [top, bottom]);
    deleteGuides();
  }

  $: {
    const t = tri_color;

    sliderOnChange();
  }

  let removeguidetimer;
  function deleteGuides() {
    if (removeguidetimer) clearTimeout(removeguidetimer);
    removeguidetimer = new setTimeout(async () => {
      removeGuides();
    }, 3000);
  }
</script>

<div class="flex flex-col items-start w-full">
  <div class="w-full flex flex-row">
    {#if show_text}
      <sp-textarea
        class="grow"
        size="s"
        quiet
        value={textarea_value}
        on:input={(e) => (textarea_value = e.target.value)}
      />
      <IconButton
        class="items-center p-2"
        icon="play"
        onclick={() => {
          show_text = false;
          const all_colors = textarea_value.match(colpattern);
          if (!all_colors) {
            textarea_value = "";
            return;
          }

          colors.push(...all_colors);
          const trim_cols = Array.from(
            new Set(colors.map((e) => e.toLowerCase()))
          );
          localStorage.setItem(STORAGE.COLORS, JSON.stringify(trim_cols));
          colors = trim_cols;
        }}
      />
    {:else}
      <div class="flex w-full">
        <div class="slider grow">
          <sp-slider
            on:input={(e) => {
              slider_top_value = e.target.value;
              onSliderTopChange();
            }}
            on:change={sliderOnChange}
            value={slider_top_value}
            min={0}
            max={100}
            step={1}
            size="s"
          />
          <sp-slider
            on:input={(e) => {
              slider_bottom_value = e.target.value;
              onSliderBottomChange();
            }}
            on:change={sliderOnChange}
            value={slider_bottom_value}
            min={0}
            max={100}
            step={1}
            size="s"
          />
        </div>
        <IconButton
          class="items-center p-2"
          icon="add2"
          onclick={() => {
            show_text = true;
          }}
        />
      </div>
    {/if}
  </div>

  <div class="flex flex-col grow">
    <Spacer h="5px" />
    <div class="flex flex-row">
      <div class="flex flex-row flex-wrap w-4/6">
        {#each colors as c, i}
          <div
            on:click={(e) => {
              if (e.shiftKey && e.altKey) {
                console.log(c);
                gradient_color[0] = c;
                gradient_color = gradient_color;
                applyGradient(gradient_color, true);

                localStorage.setItem(
                  STORAGE.GRADIENTCOLOR,
                  JSON.stringify(gradient_color)
                );
                return;
              }
              let idx = 0;
              if (e.shiftKey) idx = 1;
              else if (e.altKey) idx = 2;
              else idx = 0;
              tri_color[idx] = c;
              tri_color = tri_color;
              localStorage.setItem(STORAGE.TRICOLOR, JSON.stringify(tri_color));
            }}
            on:contextmenu={(e) => {
              if (e.shiftKey && e.altKey) {
                gradient_color[1] = c;
                gradient_color = gradient_color;
                applyGradient(gradient_color, true);
                localStorage.setItem(
                  STORAGE.GRADIENTCOLOR,
                  JSON.stringify(gradient_color)
                );

                return;
              }
              const idx = colors.findIndex((x) => x == c);
              colors.splice(idx, 1);
              colors = colors;
              localStorage.setItem(STORAGE.COLORS, JSON.stringify(colors));
            }}
            class="w-5 h-5 hover:border-4 active:border-[10px] border-[#323232] border-2 cursor-pointer"
            style="background:#{c}"
          ></div>
        {/each}
      </div>
      <div
        class="color_preview flex flex-col flex-grow border-2 border-[#323232]"
      >
        {#each tri_color as c, i}
          <div
            class="w-full h-5 border-2 border-[#323232]"
            style="background:#{c}"
          ></div>
        {/each}
      </div>
    </div>
    <Spacer h="5px" />
    <div class="flex">
      <div
        style="background-color: #{gradient_color[0]};"
        on:click={() => {
          openPicker("Primary Color", hex2rgb(gradient_color[0])).then(
            (result) => {
              gradient_color[0] = result;
              gradient_color = gradient_color;
              applyGradient(gradient_color, true);
              localStorage.setItem(
                STORAGE.GRADIENTCOLOR,
                JSON.stringify(gradient_color)
              );
            }
          );
        }}
        class="w-1/2 h-4 cursor-pointer color_primary"
      ></div>
      <div
        style="background-color: #{gradient_color[1]};"
        on:click={() => {
          openPicker("Secondary Color", hex2rgb(gradient_color[1])).then(
            (result) => {
              gradient_color[1] = result;
              gradient_color = gradient_color;
              applyGradient(gradient_color, false);
              localStorage.setItem(
                STORAGE.GRADIENTCOLOR,
                JSON.stringify(gradient_color)
              );
            }
          );
        }}
        class="w-1/2 h-4 color_primary cursor-pointer"
      ></div>
    </div>
    <Spacer h="5px" />
  </div>
</div>
