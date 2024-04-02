<script>
  import { app, action } from "photoshop";
  import { onDestroy, onMount } from "svelte";
  import Dropdown from "./libs/Dropdown.svelte";
  import TextArea from "./libs/TextArea.svelte";
  import ColorTool from "./libs/ColorTool.svelte";
  import Checkbox from "./libs/Checkbox.svelte";
  import Button from "./libs/Button.svelte";
  import Spacer from "./libs/Spacer.svelte";
  import RawFilter from "./libs/RawFilter.svelte";
  import Sval from "sval";
  import {
    FOLDERNAME,
    GetTokenFor,
    PickFolderFor,
    STORAGE,
    TOKEN,
    applyTemplates,
    multiGet,
    findChannel,
    doSaveDocument,
    createNewDoc,
    applyGradient,
    showTags,
    processHotkey,
    applyAdjustmentLayer,
    alignLayers,
    insertLinkedImage,
    showShadow,
    getTagLayers,
    align_btn,
    ALIGN,
    ADJLAYER,
    executeCustomScripts,
    loadCustomScripts,
    getMaxNumberofName,
    applyDepthMapBlur,
    getShadowLayer,
    getTextLayerContents,
    changeTextLayer,
    openPicker,
  } from "./utils/psutils";
  import IconButton from "./libs/IconButton.svelte";
  import EditableText from "./libs/EditableText.svelte";
  let count = 0;
  let lines = [];
  let event_notif = "none";
  let template_name;
  let with_tag =
    localStorage.getItem(STORAGE.WITH_TAG_CONFIG) != null
      ? localStorage.getItem(STORAGE.WITH_TAG_CONFIG) == "true"
      : false;
  let show_style = false;
  let select;
  let root_folder = null;
  let is_loading = false;
  let on_set_select = false;
  let listen_to_text = false;
  let text_layer_text = "";

  function checkAll() {
    checkShadow();
    text_layer_text = getTextLayerContents();
    on_set_select = !on_set_select;
    select.onSelectionChange("select");
  }

  function photoshopActionListener(event, descriptor) {
    event_notif = "event:" + event + JSON.stringify(descriptor);
    if (event == "set" || event == "select") {
      console.log("event");
      checkShadow();
      if (listen_to_text) text_layer_text = getTextLayerContents();
      on_set_select = !on_set_select;
      //select.onSelectionChange(event);
    }
    if (event == "save") {
    }
    if (event == "neuralGalleryFilters") {
      console.log();
    }
  }

  function checkShadow() {
    notifyMe("check shadow");
    try {
      getShadowLayer()
        .then((result) => {
          notifyMe(result);
          show_style = result;
        })
        .catch((e) => {
          notifyMe(e);
          show_style = false;
        });
    } catch (error) {
      notifyMe(error);
    }
    notifyMe("done shadow");
  }

  let active_template = null;
  let template_items = [];
  let custom_scripts = null;
  let customscripts_folder = null;

  $: if (root_folder) {
    root_folder.getEntry(FOLDERNAME.template).then(async (folder) => {
      let template = await folder.getEntries();
      template_items = template
        .filter((t) => t.isFile)
        .map((e) => {
          return { name: e.name, object: e };
        });
    });
  }
  let tag_layers = [];
  $: showShadow(show_style);

  $: {
    const is_set = on_set_select;
    multiGet().then((r) => {
      const all_layers = r[0].list;
      const which = all_layers.find((l) => l.name == "TAG");
      if (which) {
        tag_layers = [{ name: "None", object: null }].concat(
          getTagLayers().map((e) => {
            return { name: e.name, object: e };
          })
        );
      } else {
        tag_layers = [{ name: "None", object: null }];
      }
    });
  }

  $: {
    localStorage.setItem(STORAGE.WITH_TAG_CONFIG, with_tag);
  }

  function notifyMe(msg) {
    event_notif = JSON.stringify(msg);
  }
  function notify(msg) {
    document.querySelector(".log_text").textContent = JSON.stringify(msg);
  }

  const interpreter = new Sval({
    ecmaVer: 9,
    sandBox: true,
  });

  interpreter.import({
    uxp: require("uxp"),
    os: require("os"),
    photoshop: require("photoshop"),
    app: require("photoshop").app,
    batchPlay: require("photoshop").action.batchPlay,
    executeAsModal: require("photoshop").core.executeAsModal,
    interpreter: interpreter,
    notify: notify,
  });

  function initCustomScripts() {
    root_folder.getEntry(FOLDERNAME.customscripts).then(async (cs_folder) => {
      const all_scripts = await cs_folder.getEntries();
      customscripts_folder = cs_folder;
      if (!all_scripts) return;
      custom_scripts = await loadCustomScripts(
        cs_folder,
        all_scripts
          .reduce((accumulator, ext) => {
            if (ext.name.includes(".json")) {
              accumulator.push(ext);
            }
            return accumulator;
          }, [])
          .map((e) => e.name),
        interpreter
      );
    });
  }

  function getRootFolder() {
    GetTokenFor(TOKEN.ROOTFOLDER)
      .then((result) => {
        root_folder = result;
        initCustomScripts();
      })
      .catch(async (e) => {
        root_folder = await PickFolderFor(TOKEN.ROOTFOLDER);
        initCustomScripts();
      });
  }

  async function handleSavingFile() {
    const all_layers = await multiGet();
    const channel = findChannel(all_layers);
    if (channel) {
      const channel_token = await root_folder.getEntry(channel);
      let message;

      if (app.activeDocument.title.includes("Untitled")) {
        let num = 0;
        const files = await channel_token.getEntries();
        let max_num = getMaxNumberofName(files);
        if (max_num == -Infinity) max_num = 0;
        num = max_num + 1;
        message = await doSaveDocument(channel_token, num, channel);
      } else if (app.activeDocument.title.includes(".psd")) {
        message = await doSaveDocument(
          channel_token,
          app.activeDocument.title.replace(".psd", ""),
          channel
        );
      } else {
        message = null;
      }

      if (message) {
        sendJSONMessage({
          type: "filepath",
          channel: channel,
          fromserver: false,
          data: message,
          textdata: "", //!video id for inang
        });
      }
    }
  }

  async function switchMargin() {
    with_tag = !with_tag;
  }

  async function handleHotkeys(params) {
    const tagvert = { tag: with_tag, vertical_align: false };

    switch (params) {
      case "rawfilter":
        // props?.activatePanel(0, 0, 1);
        // accRef?.current?.showIndex(1);
        break;
      case "save":
        await handleSavingFile();
        break;
      case "newdoc":
        await createNewDoc();
        break;
      case "topleft":
        await processHotkey(tagvert, align_btn.tl);
        break;
      case "toptop":
        await processHotkey(tagvert, align_btn.tt);
        break;
      case "topright":
        await processHotkey(tagvert, align_btn.tr);
        break;
      case "midleft":
        await processHotkey(tagvert, align_btn.ml);
        break;
      case "midmid":
        await processHotkey(tagvert, align_btn.mm);
        break;
      case "midright":
        await processHotkey(tagvert, align_btn.mr);
        break;
      case "botleft":
        await processHotkey(tagvert, align_btn.bl);
        break;
      case "botbot":
        await processHotkey(tagvert, align_btn.bm);
        break;
      case "botright":
        await processHotkey(tagvert, align_btn.br);
        break;
      case "LEFT":
        await alignLayers(ALIGN.LEFT, false);
        break;
      case "MID":
        await alignLayers(ALIGN.CENTERHORIZONTAL, false);
        break;
      case "RIGHT":
        await alignLayers(ALIGN.RIGHT, false);
        break;
      case "adj_curves":
        await applyAdjustmentLayer(ADJLAYER.CURVES);
        break;
      case "adj_huesaturation":
        await applyAdjustmentLayer(ADJLAYER.HUESATURATION);
        break;
      case "adj_exposure":
        await applyAdjustmentLayer(ADJLAYER.EXPOSURE);
        break;
      case "adj_colorbalance":
        await applyAdjustmentLayer(ADJLAYER.COLORBALANCE);
        break;
      case "adj_gradientmap":
        await applyAdjustmentLayer(ADJLAYER.GRADIENTMAP);
        break;
      case "adj_lut":
        await applyAdjustmentLayer(ADJLAYER.LUT);
        break;
      case "scalelayer":
        await processHotkey(tagvert, "SCALE");
        break;
      case "deleteandfill":
        await require("photoshop").core.performMenuCommand({ commandID: 5280 });
        break;
      case "SCALE":
        await processHotkey(tagvert, "SCALE");
        break;
      case "TAGSCALE":
        await processHotkey(tagvert, "TAGSCALE");
        break;
      case "SCALEUP":
        await processHotkey(tagvert, "SCALEUP");
        break;
      case "SWITCHMARGIN":
        await switchMargin();
        break;
      case "SCALEDOWN":
        await processHotkey(tagvert, "SCALEDOWN");
        break;

      case "deleteandfill":
        await core.executeAsModal(
          async () => {
            await action.batchPlay(
              [
                {
                  _obj: "invokeCommand",
                  commandID: 5280,
                },
              ],
              {}
            );
          },
          { commandName: "delete n fill" }
        );
    }
  }

  let socket = new WebSocket("ws://localhost:7898/Server");
  let current_todo = "";

  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);

    if (data.fromserver) {
      window.dispatchEvent(new CustomEvent("server_message", { detail: data }));
      switch (data.type) {
        case "customscript":
          // sendJSONMessage({
          //   fromserver: false,
          //   type: "execute_customscript",
          //   data: "done",
          // });

          const result = custom_scripts.filter((c) =>
            data.data.includes(c.name)
          );

          if (result[0]) {
            (async () => {
              await executeCustomScripts(
                result[0],
                customscripts_folder,
                interpreter
              )
                .then((result) => {
                  notifyMe(result);
                })
                .catch((e) => notifyMe(e));
              sendJSONMessage({
                fromserver: false,
                type: "execute_customscript",
                data: "done",
              });
            })();
          }

          break;
        case "save":
          break;
        case "fromcomfy":
        case "todo_clipboard":
          current_todo = data.data;
          break;
          break;
        case "sendtextclipboard":
          break;
        case "customscript":
          break;
        case "createemblem":
          root_folder.getEntry(FOLDERNAME.gigapixel).then((ggp) => {
            setTimeout(async () => {
              const namafile = data?.data?.split("\\").pop();
              console.log(namafile);

              const _fileentry = await ggp.getEntry(namafile);
              await insertLinkedImage(_fileentry, namafile);
              is_loading = false;
            }, 1000);
          });
          break;

        case "url":
          root_folder.getEntry(FOLDERNAME.gigapixel).then((ggp) => {
            setTimeout(async () => {
              const namafile = data?.data?.split("\\").pop();
              const _fileentry = await ggp.getEntry(namafile);
              await insertLinkedImage(_fileentry, namafile);
              is_loading = false;
            }, 1000);
          });
          break;
        case "hotkey":
          handleHotkeys(data.data);
          break;
      }
    }
  });

  function sendJSONMessage(message) {
    if (socket.readyState <= 1) {
      socket.send(JSON.stringify(message));
    }
  }

  onMount(() => {
    getRootFolder();
    action.addNotificationListener(
      ["set", "select", "save", "neuralGalleryFilters"],
      photoshopActionListener
    );
  });

  onDestroy(() => {
    action.removeNotificationListener(
      ["set", "select", "save", "neuralGalleryFilters"],
      photoshopActionListener
    );
  });

  export let src;
  export let onmouseenter;
  let emblem_text = "";
  let show_emblem = false;
</script>

<div class="font-inter">
  <div
    class={`${
      is_loading
        ? "flex w-screen h-screen bg-[#2f2e33] flex-row items-center justify-center font-bold text-lg font-mono"
        : "hidden"
    }`}
  >
    <img src="../icons/loading.gif" alt="loading" />
  </div>

  <div class="container p-2 overflow-y-auto h-screen">
    <div class="flex flex-row flex-wrap">
      <Dropdown
        label="Template"
        class="hidden"
        bind:active_template
        selected_index={localStorage.getItem(STORAGE.TEMPLATE_DEFAULT_INDEX)}
        dropdown_items={template_items}
        on:valuechange={(e) => {
          if (e.detail.index) {
            localStorage.setItem(
              STORAGE.TEMPLATE_DEFAULT_INDEX,
              e.detail.index
            );
          }
        }}
      />
      <Spacer w="5px" />

      {#each template_items as template, i}
        <div
          on:click={async () => {
            await applyTemplates(template.object, lines, with_tag);
            const emblems = lines.filter((e) => e.state === 1);

            if (emblems.length > 0) {
              is_loading = true;
              for (const emblem of emblems) {
                sendJSONMessage({
                  type: "createemblem",
                  fromserver: false,
                  data: emblem.value,
                  textdata: emblem.value,
                });
              }
            } else {
              is_loading = false;
            }
          }}
          class="cursor-pointer text-center active:bg-orange-500 font-bold rounded-sm w-fit grow my-1 bg-blue-600 py-1 mx-[1px] first:mr-[1px] first:ml-0 last:ml-[1px] last:mr-0 text-white hover:bg-red-600"
        >
          {template.name.replace(".psd", "")}
        </div>
      {/each}
    </div>

    <Spacer h="5px" />
    <div class="flex flex-row">
      <Checkbox bind:state={with_tag}>Margin</Checkbox>
      <Spacer w="5px" />
      <Checkbox bind:state={show_style}>Style</Checkbox>
      <Spacer w="5px" />
      <Dropdown
        class="w-1/2 "
        on:valuechange={(e) => {
          showTags(
            tag_layers.map((e) => e.object),
            e.detail.data.name
          );
        }}
        selected_index={0}
        dropdown_items={tag_layers}
      />
      <Spacer w="5px" />
      <Button
        class="w-fit"
        onclick={async () => {
          await createNewDoc();
        }}
      >
        New
      </Button>
      <!-- 
      <Button
        class="font-superbold font-extrabold"
        onclick={async () => {
          is_loading = true;
          await applyTemplates(active_template.object, lines, with_tag);
          const emblems = lines.filter((e) => e.state === 1);

          if (emblems.length > 0) {
            for (const emblem of emblems) {
              sendJSONMessage({
                type: "createemblem",
                fromserver: false,
                data: emblem.value,
                textdata: emblem.value,
              });
            }
          } else {
            is_loading = false;
          }
        }}>CREATE</Button
      > -->
    </div>
    <Spacer h="5px" />
    <TextArea
      copyThisText={(v) => {
        emblem_text = v.value;
        console.log(v.value);
      }}
      {current_todo}
      bind:lines
    />
    <Spacer h="5px" />
    <div class="flex flex-row items-center">
      <EditableText bind:tf_value={emblem_text} />
      <Spacer w="5px" />
      <IconButton
        icon="play"
        onclick={() => {
          if (emblem_text == "") return;
          is_loading = true;
          sendJSONMessage({
            type: "createemblem",
            fromserver: false,
            data: emblem_text,
            textdata: emblem_text,
          });
        }}
      />
    </div>
    <Spacer h="5px" />
    <div class="flex">
      <Checkbox bind:state={listen_to_text}></Checkbox>
      <EditableText
        onTextChange={() => {
          changeTextLayer(text_layer_text);
        }}
        bind:tf_value={text_layer_text}
      />
    </div>
    <ColorTool />
    <Spacer h="5px" />
    <RawFilter bind:this={select} />

    <div class="text-white font-inter log_text">{event_notif}</div>
  </div>
</div>

<style>
</style>
