<script lang="ts">
  import Dropdown from "./Dropdown.svelte";
  import Spacer from "./Spacer.svelte";
  import IconButton from "./IconButton.svelte";
  import type { oilpaint_data, rawfilter_data } from "../global";
  import RAWFilterConfig from "../utils/rawfilter";
  import {
    FilterEffectsGalleryProc,
    FilterEffectsProcessing,
    RawFilterProcessing,
    checkLayerFilterEffects,
    checkLayerIsRAWFilteredOrOilPaint,
  } from "../utils/psutils.js";
  import { onMount } from "svelte";
  import {
    AccentedEdges,
    AddNoise,
    HighPass,
    OilPaint,
    RawFilter,
    ShadowHightlight,
    SmartSharpen,
    SurfaceBlur,
    Texturize,
  } from "../utils/filtereffects";
  import RawFilterEffects from "./RawFilterEffects.svelte";
  /**
   {
   "_obj": "oilPaint",
   "lightingOn": false,
   "stylization": 10,
   "cleanliness": 10,
   "brushScale": 10,
   "microBrush": 10,
   "lightDirection": -60,
   "specularity": 1.3,
   "_isCommand": true
}
   */
  const default_value = [
    { name: "texture", min: 0, max: 100, value: 0, step: 1 },
    { name: "clarity", min: 0, max: 100, value: 0, step: 1 },
    { name: "sharpen", min: 0, max: 150, value: 0, step: 1 },
    { name: "noise_reduction", min: 0, max: 100, value: 0, step: 1 },
    // { name: "colornoise_reduction", min: 0, max: 100, value: 0, step: 1 },
    // { name: "vibrance", min: -100, max: 100, value: 0, step: 1 },
    // { name: "saturation", min: -100, max: 100, value: 0, step: 1 },
    // { name: "temp", min: -100, max: 100, value: 0, step: 1 },
    // { name: "tint", min: -100, max: 100, value: 0, step: 1 },
  ];

  const oilpaint_default_value = [
    { name: "stylization", min: 1, max: 100, value: 1, step: 1 },
    { name: "cleanliness", min: 0, max: 100, value: 0, step: 1 },
    // { name: "brushScale", min: 1, max: 100, value: 1, step: 1 },
    // { name: "microBrush", min: 0, max: 100, value: 0, step: 1 },
  ];
  const shadowhilight_value = [
    { name: "shadow", min: 0, max: 100, value: 1, step: 1 },
    { name: "highlight", min: 0, max: 100, value: 1, step: 1 },
  ];
  const sharpren_value = [
    { name: "amount", min: 0, max: 500, value: 1, step: 1 },
    { name: "radius", min: 0, max: 4, value: 0, step: 0.1 },
    { name: "noise_reduction", min: 0, max: 100, value: 0, step: 1 },
  ];
  const surfaceblur_value = [
    { name: "radius", min: 1, max: 100, value: 1, step: 1 },
    { name: "threshold", min: 2, max: 40, value: 2, step: 1 },
  ];
  const accentEdge_value = [
    { name: "edgeWidth", min: 1, max: 14, value: 1, step: 1 },
    { name: "edgeBrightness", min: 20, max: 30, value: 25, step: 1 },
    { name: "smoothness", min: 1, max: 15, value: 1, step: 1 },
  ];
  const noise_value = [
    { name: "noise", min: 0.1, max: 20, value: 0.1, step: 0.1 },
  ];
  const highpass_value = [
    { name: "value", min: 0.1, max: 10, value: 0.1, step: 0.1 },
  ];
  const texturize_value = [
    { name: "scaling", min: 50, max: 200, value: 50, step: 1 },
    { name: "relief", min: 0, max: 10, value: 0, step: 1 },
  ];

  let slider_value = default_value;
  let slider_value_oilpaint = oilpaint_default_value;
  let sv_shadowhighlight = shadowhilight_value;
  let sv_sharpren = sharpren_value;
  let sv_surfaceblur = surfaceblur_value;
  let sv_accentEdge = accentEdge_value;
  let sv_noise = noise_value;
  let sv_highpass = highpass_value;
  let sv_texturize = texturize_value;

  let rawconfig_index = -1;
  const rf_config = new RAWFilterConfig();

  export function onSelectionChange(ev) {
    if (ev == "select") {
      checkLayerIsRAWFilteredOrOilPaint(true)
        .then((result: rawfilter_data) => {
          slider_value.forEach((filter) => {
            filter.value = result[filter.name];
          });
          slider_value = slider_value;
        })
        .catch((e) => {
          console.log(e, "error");
        });

      checkLayerFilterEffects("oilPaint").then((result) => {
        slider_value_oilpaint.forEach((filter) => {
          filter.value = result[filter.name];
        });
        slider_value_oilpaint = slider_value_oilpaint;
      });

      checkLayerFilterEffects("adaptCorrect").then((result) => {
        sv_shadowhighlight.forEach((filter) => {
          filter.value = result[filter.name];
        });
        sv_shadowhighlight = sv_shadowhighlight;
      });
      checkLayerFilterEffects("smartSharpen").then((result) => {
        sv_sharpren.forEach((filter) => {
          filter.value = result[filter.name];
        });
        sv_sharpren = sv_sharpren;
      });

      checkLayerFilterEffects("surfaceBlur").then((result) => {
        sv_surfaceblur.forEach((filter) => {
          filter.value = result[filter.name];
        });
        sv_surfaceblur = sv_surfaceblur;
      });
      checkLayerFilterEffects("$GEfc", "accentedEdges").then((result) => {
        sv_accentEdge.forEach((filter) => {
          filter.value = result[filter.name];
        });
        sv_accentEdge = sv_accentEdge;
      });
      checkLayerFilterEffects("$GEfc", "texturizer").then((result) => {
        sv_texturize.forEach((filter) => {
          filter.value = result[filter.name];
        });
        sv_texturize = sv_texturize;
      });
      checkLayerFilterEffects("addNoise").then((result) => {
        sv_noise.forEach((filter) => {
          filter.value = result[filter.name];
        });
        sv_noise = sv_noise;
      });
      checkLayerFilterEffects("highPass").then((result) => {
        sv_highpass.forEach((filter) => {
          filter.value = result[filter.name];
        });
        sv_highpass = sv_highpass;
      });
    }
  }

  let showeditor = false;
  let config_name = "";
  let rawfilters_config_items = null;
  let selected_preset = null;

  function loadConfig() {
    rawfilters_config_items = rf_config.get();
  }

  onMount(() => {
    loadConfig();
  });

  function update_layer_rawfilter() {
    RawFilterProcessing(
      slider_value.reduce((a, b) => {
        a[b.name] = b.value;
        return a;
      }, {})
    );
  }

  function update_layer_filter_effects(key, subkey) {
    switch (key) {
      case "Adobe Camera Raw Filter":
        FilterEffectsProcessing(
          RawFilter(
            slider_value.reduce((a, b) => {
              a[b.name] = b.value;
              return a;
            }, {})
          ),
          key
        );
        break;
      case "oilPaint":
        FilterEffectsProcessing(
          OilPaint(
            slider_value_oilpaint.reduce((a, b) => {
              a[b.name] = b.value;
              return a;
            }, {})
          ),
          key
        );
        break;
      case "adaptCorrect":
        FilterEffectsProcessing(
          ShadowHightlight(
            sv_shadowhighlight.find((e) => e.name == "shadow").value,
            sv_shadowhighlight.find((e) => e.name == "highlight").value
          ),

          key
        );

        break;
      case "smartSharpen":
        FilterEffectsProcessing(
          SmartSharpen(
            sv_sharpren.find((e) => e.name == "amount").value,
            sv_sharpren.find((e) => e.name == "radius").value,
            sv_sharpren.find((e) => e.name == "noise_reduction").value
          ),
          key
        );
        break;
      case "surfaceBlur":
        FilterEffectsProcessing(
          SurfaceBlur(
            sv_surfaceblur.find((e) => e.name == "radius").value,
            sv_surfaceblur.find((e) => e.name == "threshold").value
          ),
          key
        );
        break;
      case "addNoise":
        FilterEffectsProcessing(
          AddNoise(sv_noise.find((e) => e.name == "noise").value),
          key
        );
        break;
      case "highPass":
        FilterEffectsProcessing(
          HighPass(sv_highpass.find((e) => e.name == "value").value),
          key
        );
        break;
      case "$GEfc":
        if (subkey == "texturizer") {
          const texturize = Texturize(
            sv_texturize.find((e) => e.name == "scaling").value,
            sv_texturize.find((e) => e.name == "relief").value
          );
          FilterEffectsGalleryProc(texturize, "$GEfc", "texturizer");
        } else if (subkey == "accentedEdges") {
          const accentedges = AccentedEdges(
            sv_accentEdge.find((e) => e.name == "edgeWidth").value,
            sv_accentEdge.find((e) => e.name == "edgeBrightness").value,
            sv_accentEdge.find((e) => e.name == "smoothness").value
          );
          FilterEffectsGalleryProc(accentedges, "$GEfc", "accentedEdges");
        }
        break;
    }
  }

  function updateSliders(T, result) {
    switch (T) {
      case "slider_value":
        slider_value.forEach((item) => {
          const propName = item.name;
          if (result.hasOwnProperty(propName)) {
            item.value = result[propName];
          }
        });
        slider_value = slider_value;
        update_layer_filter_effects("Adobe Camera Raw Filter", null);
        break;
      case "slider_value_oilpaint":
        slider_value_oilpaint.forEach((item) => {
          const propName = item.name;
          if (result.hasOwnProperty(propName)) {
            item.value = result[propName];
          }
        });

        slider_value_oilpaint = slider_value_oilpaint;
        update_layer_filter_effects("oilPaint", null);
        break;
      case "sv_shadowhighlight":
        sv_shadowhighlight.forEach((item) => {
          const propName = item.name;
          if (result.hasOwnProperty(propName)) {
            item.value = result[propName];
          }
        });

        sv_shadowhighlight = sv_shadowhighlight;
        update_layer_filter_effects("adaptCorrect", null);
        break;
      case "sv_sharpren":
        sv_sharpren.forEach((item) => {
          const propName = item.name;
          if (result.hasOwnProperty(propName)) {
            item.value = result[propName];
          }
        });

        sv_sharpren = sv_sharpren;
        update_layer_filter_effects("smartSharpen", null);
        break;
      case "sv_surfaceblur":
        sv_surfaceblur.forEach((item) => {
          const propName = item.name;
          if (result.hasOwnProperty(propName)) {
            item.value = result[propName];
          }
        });

        sv_surfaceblur = sv_surfaceblur;
        update_layer_filter_effects("surfaceBlur", null);
        break;
      case "sv_accentEdge":
        sv_accentEdge.forEach((item) => {
          const propName = item.name;
          if (result.hasOwnProperty(propName)) {
            item.value = result[propName];
          }
        });

        sv_accentEdge = sv_accentEdge;
        update_layer_filter_effects("$GEfc", "accentedEdges");
        break;
      case "sv_noise":
        sv_noise.forEach((item) => {
          const propName = item.name;
          if (result.hasOwnProperty(propName)) {
            item.value = result[propName];
          }
        });

        sv_noise = sv_noise;
        update_layer_filter_effects("addNoise", null);
        break;
      case "sv_highpass":
        sv_highpass.forEach((item) => {
          const propName = item.name;
          if (result.hasOwnProperty(propName)) {
            item.value = result[propName];
          }
        });

        sv_highpass = sv_highpass;
        update_layer_filter_effects("highPass", null);
        break;
      case "sv_texturize":
        sv_texturize.forEach((item) => {
          const propName = item.name;
          if (result.hasOwnProperty(propName)) {
            item.value = result[propName];
          }
        });

        sv_texturize = sv_texturize;
        update_layer_filter_effects("$GEfc", "texturizer");
        break;
    }
  }
</script>

<div class="panel flex flex-row items-center">
  {#if rawfilters_config_items}
    <Dropdown
      bind:selected_index={rawconfig_index}
      label="RawFilter"
      class="grow"
      on:valuechange={(item) => {
        if (item.detail.data.data) {
          const result = item.detail.data.data;
          selected_preset = result;
          for (const sldr of result) {
            updateSliders(sldr.name, sldr.data);
          }
        }
        // if (item.detail.data.data) {
        //   const result = item.detail.data.data;
        //   selected_preset = result;

        //   slider_value.forEach((item) => {
        //     const propName = item.name;
        //     if (result.hasOwnProperty(propName)) {
        //       item.value = result[propName];
        //     }
        //   });
        //   slider_value = slider_value;

        //   update_layer_rawfilter();
        // }
      }}
      bind:dropdown_items={rawfilters_config_items}
    />
  {/if}
  <Spacer w="5px" />
  <IconButton
    class=""
    icon="play"
    onclick={() => {
      if (selected_preset != null) {
        for (const sldr of selected_preset) {
          updateSliders(sldr.name, sldr.data);
        }

        // slider_value.forEach((item) => {
        //   const propName = item.name;
        //   if (selected_preset.hasOwnProperty(propName)) {
        //     item.value = selected_preset[propName];
        //   }
        // });
        // slider_value = slider_value;
        // update_layer_rawfilter();
      }
      // if (rawconfig_index >= 0) {
      //   const selected = rawfilters_config_items[rawconfig_index];
      //   rawfilters_config_items = rf_config.delete(selected);
      // }
    }}
  />
  <Spacer w="5px" />
  <IconButton
    class=""
    icon="delete"
    onclick={() => {
      if (rawconfig_index >= 0) {
        const selected = rawfilters_config_items[rawconfig_index];
        rawfilters_config_items = rf_config.delete(selected);
      }
    }}
  />
  <Spacer w="5px" />

  <IconButton
    class=""
    icon="add"
    onclick={() => {
      if (showeditor && config_name != "") {
        const storeditems = rf_config.get();
        const config = {
          name: config_name,
          id: storeditems.length + 1,
          object: [
            { name: "slider_value", data: slider_value },
            { name: "slider_value_oilpaint", data: slider_value_oilpaint },
            { name: "sv_shadowhighlight", data: sv_shadowhighlight },
            { name: "sv_sharpren", data: sv_sharpren },
            { name: "sv_surfaceblur", data: sv_surfaceblur },
            { name: "sv_accentEdge", data: sv_accentEdge },
            { name: "sv_noise", data: sv_noise },
            { name: "sv_highpass", data: sv_highpass },
            { name: "sv_texturize", data: sv_texturize },
          ],
        };
        const concated_items = rf_config.insert(config);
        rawfilters_config_items = concated_items;
      }

      showeditor = !showeditor;
    }}
  />
  <Spacer w="5px"/>
  <IconButton icon="reload" onclick={()=>{
      onSelectionChange("select");
    }}/>
</div>
<Spacer h="5px" />
{#if showeditor}
  <div class="flex flex-col">
    <sp-textfield
      value={config_name}
      class="w-full"
      quiet
      size="s"
      on:input={(e) => (config_name = e.target.value)}
    />
  </div>
{/if}
<Spacer h="5px" />
<!-- <div class="flex flex-row w-full flex-wrap">
  {#each slider_value as rf, i}
    <div class="w-1/2 px-1 text-t-light relative">
      <div class="z-10">
        <sp-slider
          class=""
          on:input={(e) => {
            rf.value = e.target.value;
          }}
          on:contextmenu={() => {
            rf.value = 0;
          }}
          on:change={(e) => {
            update_layer_rawfilter();
          }}
          value={rf.value}
          min={rf.min}
          max={rf.max}
          step={rf.step}
          size="s"
        >
        </sp-slider>
      </div>
      <div class="flex flex-row text-xxxs absolute z-0 right-0 top-0">
        <p class="font-bold z-0 pointer-events-none select-none">{rf.name}</p>
        <p class="ml-1 z-0 pointer-events-none select-none">
          {rf.value}
        </p>
      </div>
    </div>
  {/each}
</div> -->
<!-- <div class="flex flex-row w-full flex-wrap">
  {#each slider_value_oilpaint as rf, i}
    <div class="w-1/2 px-1 text-t-light relative">
      <div class="z-10">
        <sp-slider
          class=""
          on:input={(e) => {
            rf.value = e.target.value;
          }}
          on:contextmenu={() => {
            rf.value = 0;
          }}
          on:change={(e) => {
            update_layer_oilpaint();
          }}
          value={rf.value}
          min={rf.min}
          max={rf.max}
          step={rf.step}
          size="s"
        >
        </sp-slider>
      </div>
      <div
        class="flex flex-row text-xxxs absolute z-0 right-0 top-0 pointer-events-none select-none"
      >
        <p class="font-bold z-0 pointer-events-none select-none">{rf.name}</p>
        <p class="ml-1 z-0 pointer-events-none select-none">
          {rf.value}
        </p>
      </div>
    </div>
  {/each}
</div> -->
<!-- <div class="flex flex-row w-full flex-wrap">
  {#each sv_sh as rf, i}
    <div class="w-1/2 px-1 text-t-light relative">
      <div class="z-10">
        <sp-slider
          class=""
          on:input={(e) => {
            rf.value = e.target.value;
          }}
          on:contextmenu={() => {
            rf.value = 0;
          }}
          on:change={(e) => {
            update_layer_filter_effects("adaptCorrect");
          }}
          value={rf.value}
          min={rf.min}
          max={rf.max}
          step={rf.step}
          size="s"
        >
        </sp-slider>
      </div>
      <div
        class="flex flex-row text-xxxs absolute z-0 right-0 top-0 pointer-events-none select-none"
      >
        <p class="font-bold z-0 pointer-events-none select-none">{rf.name}</p>
        <p class="ml-1 z-0 pointer-events-none select-none">
          {rf.value}
        </p>
      </div>
    </div>
  {/each}
</div> -->
<!-- <div class="flex flex-row w-full flex-wrap">
  {#each sv_sharpren as rf, i}
    <div class="w-1/2 px-1 text-t-light relative">
      <div class="z-10">
        <sp-slider
          class=""
          on:input={(e) => {
            rf.value = e.target.value;
          }}
          on:contextmenu={() => {
            rf.value = 0;
          }}
          on:change={(e) => {
            update_layer_filter_effects("smartSharpen");
          }}
          value={rf.value}
          min={rf.min}
          max={rf.max}
          step={rf.step}
          size="s"
        >
        </sp-slider>
      </div>
      <div
        class="flex flex-row text-xxxs absolute z-0 right-0 top-0 pointer-events-none select-none"
      >
        <p class="font-bold z-0 pointer-events-none select-none">{rf.name}</p>
        <p class="ml-1 z-0 pointer-events-none select-none">
          {rf.value}
        </p>
      </div>
    </div>
  {/each}
</div> -->
<RawFilterEffects
  items={slider_value}
  update={(e) => {
    update_layer_filter_effects(e, null);
  }}
  filter_effect_key="Adobe Camera Raw Filter"
/>
<RawFilterEffects
  items={slider_value_oilpaint}
  update={(e) => {
    update_layer_filter_effects(e, null);
  }}
  filter_effect_key="oilPaint"
/>
<RawFilterEffects
  items={sv_shadowhighlight}
  update={(e) => {
    update_layer_filter_effects(e, null);
  }}
  filter_effect_key="adaptCorrect"
/>
<RawFilterEffects
  items={sv_sharpren}
  update={(e) => {
    update_layer_filter_effects(e, null);
  }}
  filter_effect_key="smartSharpen"
/>
<RawFilterEffects
  items={sv_surfaceblur}
  update={(e) => {
    update_layer_filter_effects(e, null);
  }}
  filter_effect_key="surfaceBlur"
/>
<RawFilterEffects
  items={sv_noise}
  update={(e) => {
    update_layer_filter_effects(e, null);
  }}
  filter_effect_key="addNoise"
/>
<RawFilterEffects
  items={sv_highpass}
  update={(e) => {
    update_layer_filter_effects(e, null);
  }}
  filter_effect_key="highPass"
/>
<RawFilterEffects
  items={sv_accentEdge}
  update={(e, sub) => {
    update_layer_filter_effects(e, sub);
  }}
  filter_effect_key="$GEfc"
  filter_subkey="accentedEdges"
/>
<RawFilterEffects
  items={sv_texturize}
  update={(e, sub) => {
    update_layer_filter_effects(e, sub);
  }}
  filter_effect_key="$GEfc"
  filter_subkey="texturizer"
/>
