import { core, app, action, constants, imaging } from "photoshop";
import { ShadowHightlight } from "./filtereffects";
const fs = require("uxp").storage.localFileSystem;

export const FOLDERNAME = {
  assets3d: "3dassets",
  batchplay: "batchplay",
  blender: "blender",
  blender40: "blender4.0",
  customscripts: "customscripts",
  download: "download",
  gigapixel: "gigapixel",
  inang: "inang",
  midasresult: "midasresult",
  midastemp: "midastemp",
  naufal: "naufal",
  ogie: "ogie",
  refly: "refly",
  smartobject: "smartobject",
  template: "template",
  texture: "texture",
  comfyui: "ComfyUI",
};

export const STORAGE = {
  TEMPLATE_DEFAULT_INDEX: "template_default_index",
  COLORS: "COLORS_STORE",
  TRICOLOR: "STORAGE_TRICOLOR",
  RAWFILTER_CONFIG: "STORAGE_RAWFILTER_CONFIG",
  WITH_TAG_CONFIG: "STORAGE_WITH_TAG",
};

export const TOKEN = {
  ROOTFOLDER: "token_root_folder",
  SMARTOBJECTS: "token_smart_objects",
  ONLINEMAGE: "token_online_images",
  TEXTURES: "token_textures",
};

export const ADJLAYER = {
  CURVES: {
    _obj: "curves",
    presetKind: {
      _enum: "presetKindType",
      _value: "presetKindDefault",
    },
  },
  EXPOSURE: {
    _obj: "exposure",
    presetKind: {
      _enum: "presetKindType",
      _value: "presetKindDefault",
    },
    exposure: 0,
    offset: 0,
    gammaCorrection: 1,
  },
  HUESATURATION: {
    _obj: "hueSaturation",
    presetKind: {
      _enum: "presetKindType",
      _value: "presetKindDefault",
    },
    colorize: false,
  },
  COLORBALANCE: {
    _obj: "colorBalance",
    shadowLevels: [0, 0, 0],
    midtoneLevels: [0, 0, 0],
    highlightLevels: [0, 0, 0],
    preserveLuminosity: true,
  },
  GRADIENTMAP: {
    _obj: "gradientMapClass",
    gradientsInterpolationMethod: {
      _enum: "gradientInterpolationMethodType",
      _value: "perceptual",
    },
    gradient: {
      _obj: "gradientClassEvent",
      name: "Foreground to Background",
      gradientForm: {
        _enum: "gradientForm",
        _value: "customStops",
      },
      interfaceIconFrameDimmed: 4096,
      colors: [
        {
          _obj: "colorStop",
          color: {
            _obj: "RGBColor",
            red: 0,
            grain: 0,
            blue: 0,
          },
          type: {
            _enum: "colorStopType",
            _value: "userStop",
          },
          location: 0,
          midpoint: 50,
        },
        {
          _obj: "colorStop",
          color: {
            _obj: "RGBColor",
            red: 255,
            grain: 255,
            blue: 255,
          },
          type: {
            _enum: "colorStopType",
            _value: "userStop",
          },
          location: 4096,
          midpoint: 50,
        },
      ],
      transparency: [
        {
          _obj: "transferSpec",
          opacity: {
            _unit: "percentUnit",
            _value: 100,
          },
          location: 0,
          midpoint: 50,
        },
        {
          _obj: "transferSpec",
          opacity: {
            _unit: "percentUnit",
            _value: 100,
          },
          location: 4096,
          midpoint: 50,
        },
      ],
    },
  },
  LUT: {
    _class: "colorLookup",
  },
};
export const ALIGN = {
  LEFT: "ADSLefts",
  RIGHT: "ADSRights",
  CENTERHORIZONTAL: "ADSCentersH",
  TOP: "ADSTops",
  BOTTOM: "ADSBottoms",
  CENTERVERTICAL: "ADSCentersV",
};

export const align_btn = {
  tl: "arrow-up-left",
  tt: "arrow-up",
  tr: "arrow-up-right",
  ml: "arrow-left",
  mm: "center-center",
  mr: "arrow-right",
  bl: "arrow-down-left",
  bm: "arrow-down",
  br: "arrow-down-right",
  al: "align-left",
  am: "align-center",
  ar: "align-right",
};
export const FilterEffectsGalleryProc = (filter, filterObject, key) => {
  core
    .executeAsModal(
      async () => {
        const applied = await IsApplied(app.activeDocument.activeLayers[0].id);

        let idx_filterobject = applied[1]?.findIndex(
          (e) =>
            e.filter._obj === filterObject && e.filter["$GEfk"]._value === key
        );

        if (applied[0] && idx_filterobject > -1) {
          await convertToSmartObject();
          const result = await action
            .batchPlay([filter_fx(idx_filterobject, filter, false)], {})
            .catch((e) => console.log(e));
        } else {
          await convertToSmartObject();
          const result = await action
            .batchPlay([filter], {})
            .catch((e) => console.log(e));
        }
      },
      { commandName: "Filter Processing" }
    )
    .catch((e) => console.log(e));
};
export const FilterEffectsProcessing = (filter, filterObject) => {
  core
    .executeAsModal(
      async () => {
        const applied = await IsApplied(app.activeDocument.activeLayers[0].id);

        let idx_filterobject = applied[1]?.findIndex(
          (e) => e.filter._obj === filterObject
        );

        if (applied[0] && idx_filterobject > -1) {
          await convertToSmartObject();
          const result = await action
            .batchPlay(
              [filter_fx(idx_filterobject, filter, filterObject == "highPass")],
              {}
            )
            .catch((e) => console.log(e));
        } else {
          await convertToSmartObject();
          await action.batchPlay([filter], {}).catch((e) => console.log(e));
          if (filterObject == "highPass") {
            const applied = await IsApplied(
              app.activeDocument.activeLayers[0].id
            );
            let idx_filterobject = applied[1]?.findIndex(
              (e) => e.filter._obj === filterObject
            );
            await action
              .batchPlay(
                [
                  filter_fx(
                    idx_filterobject,
                    filter,
                    filterObject == "highPass"
                  ),
                ],
                {}
              )
              .catch((e) => console.log(e));
          }
        }
      },
      { commandName: "Filter Processing" }
    )
    .catch((e) => console.log(e));
};
export const OilPaintingProcessing = (rd) => {
  const oil_painting = {
    _obj: "oilPaint",
    lightingOn: false,
    stylization: rd.stylization / 10,
    cleanliness: rd.cleanliness / 10,
    brushScale: rd.brushScale / 10,
    microBrush: rd.microBrush / 10,
    lightDirection: -60,
    specularity: 1.3,
  };

  core
    .executeAsModal(
      async () => {
        const applied = await IsApplied(app.activeDocument.activeLayers[0].id);

        let idx_oilpainting = applied[1]?.findIndex(
          (e) => e.filter._obj === "oilPaint"
        );

        if (applied[0] && idx_oilpainting > -1) {
          await convertToSmartObject();
          const result = await action
            .batchPlay([filter_fx(idx_oilpainting, oil_painting, false)], {})
            .catch((e) => console.log(e));
        } else {
          await convertToSmartObject();
          const result = await action
            .batchPlay([oil_painting], {})
            .catch((e) => console.log(e));
        }
      },
      { commandName: "Raw Filter Processing" }
    )
    .catch((e) => console.log(e));
};
export const RawFilterProcessing = (rd) => {
  const raw_filter = {
    _obj: "Adobe Camera Raw Filter",
    $CrVe: "15.5",
    $PrVN: 6,
    $PrVe: 251920384,
    $WBal: {
      _enum: "$WBal",
      _value: "customEnum",
    },
    $Temp: rd.temp,
    $Tint: rd.tint,
    $CrTx: rd.texture, //texture
    $Cl12: rd.clarity, //clarity
    $Vibr: rd.vibrance, //vibrance
    saturation: rd.saturation, //saturation
    sharpen: rd.sharpen, //sharpen
    $ShpR: 1, //radius
    $ShpD: 25, // detail
    $ShpM: 0, //masking
    $LNR: rd.noise_reduction, //noise reduct
    $LNRD: 50,
    $LNRC: 0,
    $CNR: rd.colornoise_reduction, //color noise reduct
    $CNRD: 50,
    $CNRS: 50,
    $TMMs: 0,
    $PGTM: 0,
    RGBSetupClass: 0,
  };

  core
    .executeAsModal(
      async () => {
        const applied = await IsApplied(app.activeDocument.activeLayers[0].id);

        let idx = applied[1]?.findIndex(
          (e) => e.filter._obj === "Adobe Camera Raw Filter"
        );

        if (applied[0] && idx > -1) {
          await convertToSmartObject();
          const bp = [filter_fx(idx, raw_filter, false)];
          console.log(bp);

          const result = await action
            .batchPlay(bp, {})
            .catch((e) => console.log(e));
        } else {
          await convertToSmartObject();

          const result = await action
            .batchPlay([raw_filter], {})
            .catch((e) => console.log(e));
        }
      },
      { commandName: "Raw Filter Processing" }
    )
    .catch((e) => console.log(e));
};

export function IsApplied(id) {
  return new Promise(async (resolve, reject) => {
    const result = await app
      .batchPlay(
        [
          {
            _obj: "get",
            _target: [
              {
                _ref: "layer",
                _id: id,
              },
              { _ref: "document", _id: app.activeDocument.id },
            ],
          },
        ],
        {}
      )
      .catch((e) => reject(false));
    const so = result[0].smartObject;
    resolve(so ? [so?.filterFX?.length > 0, so.filterFX] : [false, null]);
  });
}

async function convertToSmartObject() {
  const layer = app.activeDocument.activeLayers[0];
  if (layer.kind !== "smartObject") {
    await action.batchPlay(
      [
        {
          _obj: "newPlacedLayer",
        },
      ],
      {}
    );
  }
}

const filter_fx = (idx, which_filter, is_higpass) => {
  /**
  {
   "_obj": "set",
   "_target": [
      {
         "_ref": "filterFX",
         "_index": 4
      },
      {
         "_ref": "layer",
         "_enum": "ordinal",
         "_value": "targetEnum"
      }
   ],
   "filterFX": {
      "_obj": "filterFX",
      "blendOptions": {
         "_obj": "blendOptions",
         "opacity": {
            "_unit": "percentUnit",
            "_value": 100
         },
         "mode": {
            "_enum": "blendMode",
            "_value": "softLight"
         }
      }
   },
   "_isCommand": true

    "blendOptions": {
         "_obj": "blendOptions",
         "opacity": {
            "_unit": "percentUnit",
            "_value": 100
         },
         "mode": {
            "_enum": "blendMode",
            "_value": "softLight"
         }
      }
}
   */
  if (is_higpass)
    return {
      _obj: "set",
      _target: [
        {
          _ref: "filterFX",
          _index: idx + 1,
        },
        {
          _ref: "layer",
          _enum: "ordinal",
          _value: "targetEnum",
        },
      ],
      filterFX: {
        _obj: "filterFX",
        filter: which_filter,
        blendOptions: {
          _obj: "blendOptions",
          opacity: {
            _unit: "percentUnit",
            _value: 100,
          },
          mode: {
            _enum: "blendMode",
            _value: "overlay",
          },
        },
      },
    };
  else
    return {
      _obj: "set",
      _target: [
        {
          _ref: "filterFX",
          _index: idx + 1,
        },
        {
          _ref: "layer",
          _enum: "ordinal",
          _value: "targetEnum",
        },
      ],
      filterFX: {
        _obj: "filterFX",
        filter: which_filter,
      },
    };
};

export function checkLayerFilterEffects(key, subkey) {
  const layer = app.activeDocument.activeLayers[0];
  return new Promise((resolve, reject) => {
    IsApplied(layer.id)
      .then((result) => {
        if (result[0]) {
          for (const fltrFX of result[1]) {
            const s = fltrFX.filter;
            if (s._obj == key) {
              switch (key) {
                case "oilPaint":
                  resolve({
                    stylization: s["stylization"],
                    cleanliness: s["cleanliness"],
                    brushScale: s["brushScale"],
                    microBrush: s["microBrush"],
                  });
                  break;
                case "adaptCorrect":
                  resolve({
                    shadow: s.shadowMode.amount._value,
                    highlight: s.highlightMode.amount._value,
                  });
                  break;

                case "smartSharpen":
                  resolve({
                    amount: s.amount._value,
                    radius: s.radius._value,
                    noise_reduction: s.noiseReduction._value,
                  });
                  break;
                case "surfaceBlur":
                  resolve({
                    radius: s.radius._value,
                    threshold: s.threshold,
                  });
                  break;
                case "$GEfc":
                  if (s["$GEfk"]._value == subkey) {
                    if (subkey == "accentedEdges") {
                      resolve({
                        edgeWidth: s.edgeWidth,
                        edgeBrightness: s.edgeBrightness,
                        smoothness: s.smoothness,
                      });
                    } else if (subkey == "texturizer") {
                      console.log(s);
                      resolve({
                        scaling: s.scaling,
                        relief: s.relief,
                      });
                    }
                  }

                  break;
                case "addNoise":
                  resolve({
                    noise: s.noise._value,
                  });
                  break;
                case "highPass":
                  resolve({
                    value: s.radius._value,
                  });
                  break;
              }
            }
          }
        } else {
          switch (key) {
            case "oilPaint":
              resolve({
                stylization: 0.1,
                cleanliness: 0,
                brushScale: 0,
                microBrush: 0.1,
              });
              break;
            case "adaptCorrect":
              resolve({
                shadow: 0,
                highlight: 0,
              });
              break;
            case "smartSharpen":
              resolve({
                amount: 0,
                radius: 0,
                noise_reduction: 0,
              });
              break;
            case "surfaceBlur":
              resolve({
                radius: 1,
                threshold: 2,
              });
              break;
            case "addNoise":
              resolve({
                noise: 0.1,
              });
              break;
            case "highPass":
              resolve({
                value: 0.1,
              });
              break;
            case "$GEfc":
              if (subkey == "accentedEdges") {
                resolve({
                  edgeWidth: 1,
                  edgeBrightness: 25,
                  smoothness: 1,
                });
              } else if (subkey == "texturizer") {
                resolve({
                  scaling: 50,
                  relief: 1,
                });
              }

              break;
          }
        }
      })
      .catch((e) => reject(`error ${e}`));
  });
}

export function checkLayerIsRAWFilteredOrOilPaint(is_rawfilter) {
  const layer = app.activeDocument.activeLayers[0];
  return new Promise((resolve, reject) => {
    IsApplied(layer.id)
      .then((result) => {
        let default_raw_filter = {
          texture: 0,
          clarity: 0,
          sharpen: 0,
          noise_reduction: 0,
          colornoise_reduction: 0,
          vibrance: 0,
          saturation: 0,
          temp: 0,
          tint: 0,
        };
        let default_oil_paint = {
          stylization: 0.1,
          cleanliness: 0,
          brushScale: 0.1,
          microBrush: 0,
        };
        if (result[0]) {
          for (const fltrFX of result[1]) {
            const s = fltrFX.filter;

            if (s._obj == "Adobe Camera Raw Filter") {
              default_raw_filter = {
                temp: s["$Temp"],
                tint: s["$Tint"],
                texture: s["$CrTx"], //texture
                clarity: s["$Cl12"], //clarity
                vibrance: s["$Vibr"], //vibrance
                saturation: s["saturation"], //saturation
                sharpen: s["sharpen"], //sharpen
                noise_reduction: s["$LNR"], //noise reduct
                colornoise_reduction: s["$CNR"], //color noise reduct
              };
            } else if (s._obj == "oilPaint") {
              default_oil_paint = {
                stylization: s["stylization"],
                cleanliness: s["cleanliness"],
                brushScale: s["brushScale"],
                microBrush: s["microBrush"],
              };
            }
          }
        }
        if (is_rawfilter) resolve(default_raw_filter);
        else resolve(default_oil_paint);
        resolve({ ...default_raw_filter, ...default_oil_paint });
      })
      .catch((e) => reject(`error ${e}`));
  });
}

export function GetTokenFor(key) {
  const savedToken = localStorage.getItem(key);

  return new Promise(async (resolve, reject) => {
    if (!savedToken) {
      reject("Not Exist");
      return null;
    }
    const newToken = await fs.getEntryForPersistentToken(savedToken);
    console.log(newToken.isFolder);
    newToken.isFolder ? resolve(newToken) : reject("cant do that");
  });
}

export async function PickFolderFor(key) {
  return new Promise(async (resolve, reject) => {
    const fo_result = await fs.getFolder();
    const _token = await fs.createPersistentToken(fo_result);
    localStorage.setItem(key, _token);

    resolve(fo_result);
  });
}

async function placeLinked(template) {
  await core.executeAsModal(
    async (executionContext, descriptor) => {
      await action.batchPlay(
        [
          {
            _obj: "placeEvent",
            null: {
              _path: await fs.createSessionToken(template),
              _kind: "local",
            },
            linked: true,
          },
          {
            _obj: "placedLayerConvertToLayers",
          },
        ],
        {}
      );
    },
    { commandName: "place linked" }
  );
}
function findLayer(layers, key) {
  for (const l of layers) {
    if (l.kind === "group") {
      const result = findLayer(l.layers, key); // Recursive call
      if (result) {
        return result; // Return the result if found in the nested group
      }
    } else {
      if (l.name === key) {
        return l; // Return the layer if the name matches
      }
    }
  }
}
async function changeTexts(dcsms_layer, texts, gap, margin_top, margin_left) {
  if (dcsms_layer) {
    await core
      .executeAsModal(
        async (e, d) => {
          if (dcsms_layer.name === "dcsmstext_alt") dcsms_layer.visible = true;
          let top = margin_top;

          for await (const [index, t] of texts.entries()) {
            const lyr = await dcsms_layer.duplicate();
            lyr.name = "dcsmstext_tamper";
            const txtitem = lyr.textItem;
            txtitem.contents = t.value;
            //const lyr = app.activeDocument.activeLayers[0];
            let h =
              dcsms_layer.boundsNoEffects.bottom -
              dcsms_layer.boundsNoEffects.top;
            h = h + gap;
            const _hindex = h * index;
            const bmargin = lyr.boundsNoEffects.top - margin_top;
            top =
              index == 0
                ? -(lyr.boundsNoEffects.top - margin_top)
                : -(bmargin - _hindex);
            await lyr.translate(-(lyr.boundsNoEffects.left - margin_left), top);
            //await moveLayer(top, -lyr.boundsNoEffects.left);
          }
          await dcsms_layer.delete();
        },
        { commandName: "change text" }
      )
      .catch((e) => console.log(e));
  }
}

export async function applyTemplates(template, texts, with_tag) {
  const gap = 10;
  const margin_top = 30;
  const margin_left = with_tag ? 104 : margin_top;
  await placeLinked(template).then(async () => {
    const dcsms_layer = findLayer(app.activeDocument.layers, "dcsmstext");
    const dcsms_layer_alt = findLayer(
      app.activeDocument.layers,
      "dcsmstext_alt"
    );
    await changeTexts(
      dcsms_layer,
      texts.filter((e) => e.state === 0),
      gap,
      margin_top,
      margin_left
    );
    if (dcsms_layer_alt) {
      await changeTexts(
        dcsms_layer_alt,
        texts.filter((e) => e.state === 2),
        gap,
        margin_top,
        margin_left
      );
    }
  });
}
export async function multiGet() {
  return await action.batchPlay(
    [
      {
        _obj: "multiGet",
        _target: {
          _ref: "document",
          _id: app.activeDocument.id,
        },
        extendedReference: [
          ["name", "layerID"],
          {
            _obj: "layer",
            index: 1,
            count: -1,
          },
        ],
      },
    ],
    {}
  );
}
function findingRH(all_layer, rh_channel) {
  for (const k of rh_channel) {
    if (all_layer.find(e => e.toLowerCase().includes(k)) != undefined) {
      return true;
    }
  }
  return false;
}
export function findChannel(array_of_layers) {
  const channels = ["refly", "naufal", "ogie", "zoom", "inang"];
  const rhchannel = ["rhc", "kerencadas", "podcast"];
  const all_Layers = array_of_layers[0].list.map((e) => e.name);

  let which_channels = null;
  for (const channel of channels) {
    if (channel == "refly") {
      if (findingRH(all_Layers, rhchannel))
        which_channels = channel;

      break;

    } else {
      if (all_Layers.filter((e) => e.toLowerCase().includes(channel)).length > 0) {
        which_channels = channel;
        break;
      }
    }

  }
  return which_channels;
}
export function getMaxNumberofName(ntries) {
  const files = ntries.filter((e) => e.name.indexOf("psd") > 0);
  const names = [];
  files.forEach((child) => {
    const name = parseInt(child.name.replace(".psd", ""));
    if (!isNaN(name)) names.push(name);
  });
  return Math.max(...names);
}

export async function doSaveDocument(savepathtoken, namafile, channel) {
  return new Promise(async (resolve, reject) => {
    const newJPG = await savepathtoken.createFile(namafile + ".jpeg", {
      overwrite: true,
    });
    const newPSD = await savepathtoken.createFile(namafile + ".psd", {
      overwrite: true,
    });
    const saveJPEG = await fs.createSessionToken(newJPG);
    const savePSD = await fs.createSessionToken(newPSD);
    await core.executeAsModal(
      async () => {
        const result = await action.batchPlay(
          [
            {
              _obj: "save",
              as: {
                _obj: "photoshop35Format",
                maximizeCompatibility: true,
              },
              in: {
                _path: savePSD,
                _kind: "local",
              },
              documentID: app.activeDocument.id,
              lowerCase: true,
              saveStage: {
                _enum: "saveStageType",
                _value: "saveBegin",
              },
            },
            {
              _obj: "save",
              as: {
                _obj: "JPEG",
                extendedQuality: 10,
                matteColor: {
                  _enum: "matteColor",
                  _value: "none",
                },
              },
              in: {
                _path: saveJPEG,
                _kind: "local",
              },
              documentID: app.activeDocument.id,
              copy: true,
              lowerCase: true,
              saveStage: {
                _enum: "saveStageType",
                _value: "saveBegin",
              },
            },
          ],
          {}
        );

        resolve(result[1].in._path);
      },
      { commandName: "saving files" }
    );
  });
}

export async function createNewDoc() {
  console.log("creating new doc");
  await core
    .executeAsModal(
      async () => {
        await app.batchPlay(
          [
            {
              _obj: "make",
              new: {
                _obj: "document",
                artboard: false,
                autoPromoteBackgroundLayer: false,
                preset: "Thumbnail",
              },
            },
          ],
          {}
        );
      },
      { commandName: "create new document" }
    )
    .catch((e) => console.log(e));
}
export async function showTags(layers, tagname) {
  await core.executeAsModal(
    async (e, d) => {
      for (const layer of layers) {
        if (layer) layer.visible = layer.name == tagname ? true : false;
      }
    },
    { commandName: "showing tags" }
  );
}

async function geser(x, y) {
  await core.executeAsModal(
    async () => {
      await action.batchPlay(
        [
          {
            _obj: "move",
            _target: [
              {
                _ref: "layer",
                _enum: "ordinal",
                _value: "targetEnum",
              },
            ],
            to: {
              _obj: "offset",
              horizontal: {
                _unit: "pixelsUnit",
                _value: x,
              },
              vertical: {
                _unit: "pixelsUnit",
                _value: y,
              },
            },
          },
        ],
        {}
      );
    },
    { commandName: "geser dong" }
  );
}
export async function processHotkey(tagvertalign, e) {
  let val;
  try {
    val = e.target.textContent;
  } catch (error) {
    val = e;
  }
  const docWidth = 1280;
  const docHeight = 720;

  const _all = app.activeDocument.activeLayers;

  const ver = _all.sort(function (a, b) {
    return a.boundsNoEffects.top - b.boundsNoEffects.top;
  });
  const verbot = _all.sort(function (a, b) {
    return b.boundsNoEffects.bottom - a.boundsNoEffects.bottom;
  });
  const _left = _all.sort(function (a, b) {
    return a.boundsNoEffects.left - b.boundsNoEffects.left;
  });
  const _right = _all.sort(function (a, b) {
    return b.boundsNoEffects.right - a.boundsNoEffects.right;
  });

  const top = ver[0].boundsNoEffects.top;
  const bottom = verbot[0].boundsNoEffects.bottom;
  const left = _left[0].boundsNoEffects.left;
  const right = _right[0].boundsNoEffects.right;

  const width = right - left;
  const height = bottom - top;

  const margin = 30; //!GAP
  const leftGut = tagvertalign.tag ? 104 : 0;
  const isMid = tagvertalign.vertical_align;

  const x = docWidth / 2 - (width / 2 + left);
  let y = 0;
  if (isMid) {
    y = docHeight / 2 - (height / 2 + top);
  }

  switch (val) {
    case align_btn.tl:
      await geser(-left + (leftGut + margin), margin + -top);
      break;
    case align_btn.tr:
      await geser(docWidth - right - margin, margin + -top);
      break;
    case align_btn.bl:
      await geser(-left + (leftGut + margin), docHeight - bottom - margin);
      break;
    case align_btn.br:
      await geser(docWidth - right - margin, docHeight - bottom - margin);

      break;
    case align_btn.ml:
      await geser(-left + (leftGut + margin), 0);

      break;
    case align_btn.mr:
      await geser(docWidth - right - margin, 0);

      break;
    case align_btn.tt:
      await geser(x + leftGut / 2, -top + margin);
      break;

    case align_btn.bm:
      await geser(x + leftGut / 2, docHeight - bottom - margin);

      break;
    case align_btn.mm:
      await geser(x + leftGut / 2, y);

      break;

    case "SCALE":
      await core.executeAsModal(
        async () => {
          const scale = ((docWidth - leftGut - margin * 2) / width) * 100;
          await app.activeDocument.activeLayers[0].scale(scale, scale);
        },
        { commandName: "some tag" }
      );
      break;
    case "TAGSCALE":
      await core.executeAsModal(
        async () => {
          const curlayer = app.activeDocument.activeLayers[0];
          const scale = 95;
          await curlayer.scale(scale, scale);
        },
        { commandName: "some tag" }
      );
      break;
    case "SCALEUP":
      await core.executeAsModal(
        async () => {
          const curlayer = app.activeDocument.activeLayers[0];
          const scale = 105;
          await curlayer.scale(scale, scale);
        },
        { commandName: "some tag" }
      );
      break;
    case "SCALEDOWN":
      await core.executeAsModal(
        async () => {
          const curlayer = app.activeDocument.activeLayers[0];
          const scale = 95;
          await curlayer.scale(scale, scale);
        },
        { commandName: "some tag" }
      );
      break;
  }
}
export async function applyAdjustmentLayer(whichlayer) {
  await core
    .executeAsModal(
      async () => {
        await app
          .batchPlay(
            [
              {
                _obj: "make",
                _target: [
                  {
                    _ref: "adjustmentLayer",
                  },
                ],
                using: {
                  _obj: "adjustmentLayer",
                  type: whichlayer,
                },
              },
              {
                _obj: "groupEvent",
                _target: [
                  {
                    _ref: "layer",
                    _enum: "ordinal",
                    _value: "targetEnum",
                  },
                ],
              },
            ],
            {}
          )
          .catch((e) => console.log("applyAdjustmentLayer", e));
      },
      { commandName: "adjustment layer" }
    )
    .catch((e) => console.log("applyAdjustmentLayer", e));
}
export async function alignLayers(alignto, toCanvas) {
  await core
    .executeAsModal(
      async () => {
        await action.batchPlay(
          [
            {
              _obj: "align",
              _target: [
                {
                  _ref: "layer",
                  _enum: "ordinal",
                  _value: "targetEnum",
                },
              ],
              using: {
                _enum: "alignDistributeSelector",
                _value: alignto,
              },
              alignToCanvas: toCanvas,
            },
          ],
          {}
        );
      },
      { commandName: "align layers" }
    )
    .catch((e) => console.log(e));
}

async function dorasterize() {
  await core.executeAsModal(
    async () => {
      await app
        .batchPlay(
          [
            {
              _obj: "rasterizeLayer",
              _target: [
                {
                  _ref: "layer",
                  _enum: "ordinal",
                  _value: "targetEnum",
                },
              ],
            },
            {
              _obj: "newPlacedLayer",
            },
          ],
          {}
        )
        .catch((e) => console.log(e));
      const _paste_layer = app.activeDocument.activeLayers[0];
      _paste_layer.move(
        app.activeDocument.layers[0],
        constants.ElementPlacement.PLACEBEFORE
      );
    },
    { commandName: "rasterize" }
  );
}

export async function insertLinkedImage(entryobject, filename) {
  await core
    .executeAsModal(
      async () => {
        await app
          .batchPlay(
            [
              {
                _obj: "placeEvent",
                null: {
                  _path: await fs.createSessionToken(entryobject),
                  _kind: "local",
                },
                linked: true,
              },
            ],
            {}
          )
          .catch((e) => console.log(e));
        setTimeout(async () => {
          if (filename.includes("0001")) {
            await dorasterize();
          }
        }, 100);
      },
      { commandName: "insert smart object" }
    )
    .catch((e) => console.log(e));
}
const rgbToHex = (r, g, b) => {
  return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
export function hex2rgb(hex) {
  hex = hex.replace(/^#/, "");

  // Check if it's a 3-digit or 6-digit hex code
  if (hex.length === 3) {
    // Expand 3-digit hex to 6-digit hex
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  var r = parseInt(hex.slice(0, 2), 16),
    g = parseInt(hex.slice(2, 4), 16),
    b = parseInt(hex.slice(4, 6), 16);
  return [r, g, b];
}
function GetTripleColorFillCommand(top, mid, bot, pos_a, pos_b) {
  return {
    _obj: "set",
    _target: [
      {
        _ref: "contentLayer",
        _enum: "ordinal",
        _value: "targetEnum",
      },
    ],
    to: {
      _obj: "gradientLayer",
      gradientsInterpolationMethod: {
        _enum: "gradientInterpolationMethodType",
        _value: "perceptual",
      },
      angle: {
        _unit: "angleUnit",
        _value: -90,
      },
      type: {
        _enum: "gradientType",
        _value: "linear",
      },
      scale: {
        _unit: "percentUnit",
        _value: 100,
      },
      gradient: {
        _obj: "gradientClassEvent",
        name: "Custom",
        gradientForm: {
          _enum: "gradientForm",
          _value: "customStops",
        },
        interfaceIconFrameDimmed: 0,
        colors: [
          {
            _obj: "colorStop",
            color: {
              _obj: "RGBColor",
              red: top[0], // 1
              grain: top[1],
              blue: top[2],
            },
            type: {
              _enum: "colorStopType",
              _value: "userStop",
            },
            location: 0,
            midpoint: 50,
          },
          {
            _obj: "colorStop",
            color: {
              _obj: "RGBColor",
              red: top[0], // 1
              grain: top[1],
              blue: top[2],
            },
            type: {
              _enum: "colorStopType",
              _value: "userStop",
            },
            location: pos_a - 1,
            midpoint: 50,
          },
          {
            _obj: "colorStop",
            color: {
              _obj: "RGBColor",
              red: mid[0], // 1
              grain: mid[1],
              blue: mid[2],
            },
            type: {
              _enum: "colorStopType",
              _value: "userStop",
            },
            location: pos_a,
            midpoint: 50,
          },
          {
            _obj: "colorStop",
            color: {
              _obj: "RGBColor",
              red: mid[0], // 1
              grain: mid[1],
              blue: mid[2],
            },
            type: {
              _enum: "colorStopType",
              _value: "userStop",
            },
            location: pos_b,
            midpoint: 50,
          },
          {
            _obj: "colorStop",
            color: {
              _obj: "RGBColor",
              red: bot[0], // 1
              grain: bot[1],
              blue: bot[2],
            },
            type: {
              _enum: "colorStopType",
              _value: "userStop",
            },
            location: pos_b + 1,
            midpoint: 50,
          },
        ],
        transparency: [
          {
            _obj: "transferSpec",
            opacity: {
              _unit: "percentUnit",
              _value: 100,
            },
            location: 0,
            midpoint: 50,
          },
          {
            _obj: "transferSpec",
            opacity: {
              _unit: "percentUnit",
              _value: 100,
            },
            location: 0,
            midpoint: 50,
          },
          {
            _obj: "transferSpec",
            opacity: {
              _unit: "percentUnit",
              _value: 100,
            },
            location: 4096,
            midpoint: 50,
          },
        ],
      },
    },
  };
}
export function MapRange(val, in_min, in_max, out_min, out_max) {
  return ((val - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}
export async function removeGuides() {
  await core.executeAsModal(async (context, descriptor) => {
    app.activeDocument.guides.removeAll();
  });
}
async function addGuide(LR) {
  await core.executeAsModal(async (context, descriptor) => {
    const top = Math.floor((LR[0] / 4096) * 720);
    const bot = Math.floor((LR[1] / 4096) * 720);
    app.activeDocument.guides.removeAll();
    app.activeDocument.guides.add(constants.Direction.HORIZONTAL, top);
    app.activeDocument.guides.add(constants.Direction.HORIZONTAL, bot);
  });
}
function gradient_colors(p, s) {
  return {
    "_obj": "set",
    "_target": [
      {
        "_ref": "adjustmentLayer",
        "_enum": "ordinal",
        "_value": "targetEnum"
      }
    ],
    "to": {
      "_obj": "gradientMapClass",
      "gradient": {
        "_obj": "gradientClassEvent",
        "name": "Custom",
        "gradientForm": {
          "_enum": "gradientForm",
          "_value": "customStops"
        },
        "interfaceIconFrameDimmed": 4096,
        "colors": [
          {
            "_obj": "colorStop",
            "color": {
              "_obj": "RGBColor",
              "red": p[0],
              "grain": p[1],
              "blue": p[2]
            },
            "type": {
              "_enum": "colorStopType",
              "_value": "userStop"
            },
            "location": 0,
            "midpoint": 50
          },
          {
            "_obj": "colorStop",
            "color": {
              "_obj": "RGBColor",
              "red": s[0],
              "grain": s[1],
              "blue": s[2]
            },
            "type": {
              "_enum": "colorStopType",
              "_value": "userStop"
            },
            "location": 4096,
            "midpoint": 50
          }
        ],
        "transparency": [
          {
            "_obj": "transferSpec",
            "opacity": {
              "_unit": "percentUnit",
              "_value": 100
            },
            "location": 0,
            "midpoint": 50
          },
          {
            "_obj": "transferSpec",
            "opacity": {
              "_unit": "percentUnit",
              "_value": 100
            },
            "location": 4096,
            "midpoint": 50
          }
        ]
      }
    }
  }
}

export async function applyGradient(col, isprimary) {
  const _id = await findLayer(app.activeDocument.layers, "gradfill").id;
  const color_primary = hex2rgb(col[0]);
  const color_secondary = hex2rgb(col[1]);
  await core.executeAsModal(
    async () => {
      //unlock
      await action.batchPlay(
        [
          {
            _obj: "select",
            _target: { _ref: "layer", _id: _id },
            makeVisible: true,
          },
          {
            _obj: "applyLocking",
            _target: [
              {
                _ref: "layer",
                _enum: "ordinal",
                _value: "targetEnum",
              },
            ],
            layerLocking: {
              _obj: "layerLocking",
              protectAll: false,
            },
          },
        ],
        {}
      );

      await action.batchPlay([gradient_colors(color_primary, color_secondary)], {});
      //lock
      await action.batchPlay(
        [
          {
            _obj: "applyLocking",
            _target: [
              {
                _ref: "layer",
                _enum: "ordinal",
                _value: "targetEnum",
              },
            ],
            layerLocking: {
              _obj: "layerLocking",
              protectAll: true,
            },
          },
        ],
        {}
      );


    },
    { commandName: "color" }
  );

}

export async function ApplyColor(TRICOL, LR) {
  await addGuide(LR);
  const _id = await findLayer(app.activeDocument.layers, "colorfill").id;

  try {
    const top = hex2rgb(TRICOL[0]);
    const mid = hex2rgb(TRICOL[1]);
    const bottom = hex2rgb(TRICOL[2]);
    const position = LR[0];
    await core.executeAsModal(
      async () => {
        await action.batchPlay(
          [
            {
              _obj: "select",
              _target: { _ref: "layer", _id: _id },
            },
            {
              _obj: "applyLocking",
              _target: [
                {
                  _ref: "layer",
                  _enum: "ordinal",
                  _value: "targetEnum",
                },
              ],
              layerLocking: {
                _obj: "layerLocking",
                protectAll: false,
              },
            },
          ],
          {}
        );

        const cmd_triple = GetTripleColorFillCommand(
          top,
          mid,
          bottom,
          LR[0],
          LR[1]
        );
        await action.batchPlay([cmd_triple], {});
        await action.batchPlay(
          [
            {
              _obj: "applyLocking",
              _target: [
                {
                  _ref: "layer",
                  _enum: "ordinal",
                  _value: "targetEnum",
                },
              ],
              layerLocking: {
                _obj: "layerLocking",
                protectAll: true,
              },
            },
          ],
          {}
        );
      },
      { commandName: "color" }
    );
  } catch (error) {
    console.log(error);
  }
}
export async function showShadow(show) {
  await core.executeAsModal(
    async () => {
      for await (const shadow of ["shadow", "shadow2", "shadow3"]) {
        await action.batchPlay(
          [
            {
              _obj: "select",
              _target: [
                {
                  _ref: "layer",
                  _name: shadow,
                },
              ],
              makeVisible: false,
            },
            {
              _obj: show ? "show" : "hide",
              null: [
                {
                  _ref: [
                    {
                      _ref: "layerEffects",
                    },
                    {
                      _ref: "layer",
                      _name: shadow,
                    },
                  ],
                },
              ],
            },
          ],
          {}
        );
      }
    },
    { commandName: "show shadow" }
  );
}
export function getTagLayers() {
  let datas = [];
  function recurse(data, istag) {
    data.forEach((d) => {
      if (d?.kind == "group") {
        if (d?.name == "TAG") {
          recurse(d?.layers, true);
        } else {
          recurse(d?.layers, false);
        }
      } else {
        if (istag) {
          datas?.push(d);
        }
      }
    });
  }
  recurse(app.activeDocument?.layers, false);
  return datas;
}

export function getTextLayerContents(){
  const layer = app.activeDocument.activeLayers[0];
  if(layer.kind!=="text")return "";
    return layer.textItem.contents
  
}
export function changeTextLayer(text){
  const layer = app.activeDocument.activeLayers[0];
  if(layer.kind!=="text")return;

  core.executeAsModal((context,desc)=>{
    layer.textItem.contents = text;
  },{commandName:"changing text layer content"})

}
export function getShadowLayer() {
  return new Promise(async (resolve, reject) => {
    const result = await app
      .batchPlay(
        [
          {
            _obj: "get",
            _target: [
              {
                _ref: "layer",
                _name: "shadow2",
              },
              { _ref: "document", _id: app.activeDocument.id },
            ],
          },
        ],
        {}
      )
      .catch((e) => reject(false));
    if (result[0].layerFXVisible) {
      resolve(result[0].layerFXVisible);
    } else {
      resolve(false);
    }
  });
}

export async function getShadowLayers() {
  try {
    await core.executeAsModal(
      async (context, descriptor) => {
        const result = await app
          .batchPlay(
            [
              {
                _obj: "get",
                _target: [
                  {
                    _ref: "layer",
                    _name: "shadow2",
                  },
                  { _ref: "document", _id: app.activeDocument.id },
                ],
              },
            ],
            {}
          )
          .catch((e) => {
            return e;
          });
        if (result[0].layerFXVisible != undefined) {
          return result[0].layerFXVisible;
        } else {
          return false;
        }
      },
      { commandName: "read shadow layer" }
    );
  } catch (error) {
    return error;
  }
}

function run_the_script(intepreter, script_to_run) {
  intepreter.run(`    
  "use strict";
   function runCode(){
    ${script_to_run}
  }
  exports.returnValue = runCode();
  `);
}

export async function executeCustomScripts(value, folder, intepreter) {
  await core
    .executeAsModal(
      async (context, desc) => {
        if (value?.executable) {
          const script = await folder.getEntry(value.script);
          const read_script = await script.read();
          try {
            run_the_script(intepreter, read_script);
          } catch (error) {
            console.log(error);
          }

          // intepreter.run(`
          // "use strict";
          // async function myCode(){

          //   ${read_script}
          // }
          // exports.returnValue = myCode();
          // `);
        } else {
          await app.batchPlay(value.func, {}).catch((e) => console.log(e));
        }
      },
      { commandName: "custom script" }
    )
    .catch((e) => console.log(e));
}

export async function loadCustomScripts(
  script_parent,
  script_names,
  intepreter
) {
  let all_scripts = [];
  for await (const script of script_names) {
    const file = await script_parent.getEntry(script);
    all_scripts.push(JSON.parse(await file.read()));
  }
  await script_parent.getEntry("CORE.js").then(async (result) => {
    if (intepreter != null) run_the_script(intepreter, await result.read());
  });
  return all_scripts;
}
let DEBUG = true;
export function debugRawFilter(data) {
  if (!DEBUG) return;
  const rf_data = data.object.reduce((a, b) => {
    a[b.name] = b.value;
    return a;
  }, {});
  console.log(`${data.name}\n===========`, JSON.stringify(rf_data, null, 2));
}

export async function applyDepthMapBlur() {
  const NF_UI_DATA = {
    _obj: "NF_UI_DATA",
    "spl::filterStack": [
      {
        _obj: "spl::filterStack",
        "spl::cropStates": [
          {
            _obj: "spl::cropStates",
            "spl::cropId": "layer1",
            "spl::values": {
              _obj: "spl::values",
              "spl::focalSelector":
                '[{"x":0.2809667673716012,"y":0.2956989247311828,"dabSize":5,"r":0,"g":0,"b":0,"rgba":"rgba(0, 0, 0, 0.5)","disabledRgba":"rgba(0, 0, 0, 1)","luminance":0}]',
              "spl::generateDepthMap": false,
              "spl::selectSubjectUsage": false,
              "spl::slideAperture": 90,
              "spl::slideFocalDist": 25,
              "spl::slideFocalRange": 0,
              "spl::sliderBrightness": null,
              "spl::sliderHaze": 0,
              "spl::sliderNoise": 0,
              "spl::sliderSaturation": null,
              "spl::sliderSelectResolutionLevel": 2,
              "spl::sliderTint": null,
              "spl::sliderWarmness": null,
            },
          },
        ],
        "spl::enabled": true,
        "spl::id": "internal.Hazy",
        "spl::version": "1.0",
      },
    ],
    "spl::version": "1.0.6",
  };
  await core
    .executeAsModal(async (context, descriptor) => {
      await app
        .batchPlay(
          [
            {
              _obj: "neuralGalleryFilters",
              NF_OUTPUT_TYPE: 1,
              _isCommand: true,

              NF_UI_DATA: NF_UI_DATA,
            },
          ],
          {}
        )
        .catch((e) => console.log(e));
    })
    .catch((e) => console.log(e));
}
export async function openPicker(modal = "", defaultcolor = [0, 0, 0]) {
  return new Promise(async (resolve, reject) => {


    const openPicker = {
      _target: { _ref: "application" },
      _obj: "showColorPicker",
      context: modal,
      color: {
        _obj: 'RGBColor',
        red: defaultcolor[0],
        green: defaultcolor[1],
        blue: defaultcolor[2],
      },
    };
    await core.executeAsModal(async (context, desc) => {

      const result = await action.batchPlay([openPicker], {}).catch(e => console.log(e));
      const rgbFloat = result[0].RGBFloatColor;
      resolve(rgbToHex(Math.floor(rgbFloat.red), Math.floor(rgbFloat.grain), Math.floor(rgbFloat.blue)))

    }, { "commandName": "openpicker" }).catch(e => console.log(e))

  })
}