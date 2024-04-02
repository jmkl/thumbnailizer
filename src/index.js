import "./global.css";
import App from "./App.svelte";
//const { entrypoints } = require("uxp");
import { entrypoints } from "uxp";
import { STORAGE } from "./utils/psutils";

const app = new App({ target: document.body });
console.log("hello index");
entrypoints.setup({
  plugin: {
    create(e) {},
  },
  panels: {
    mainpanel: {
      create(node) {},
      show(node, app) {},
      menuItems: [
        {
          id: "reload",
          label: "Reload Plugin",
        },
        {
          id: "reset",
          label: "Reset Config",
        },
      ],
      invokeMenu(id) {
        switch (id) {
          case "reload":
            location.reload();
            break;
          case "reset":
            localStorage.removeItem(STORAGE.TEMPLATE_DEFAULT_INDEX);
            localStorage.removeItem(STORAGE.RAWFILTER_CONFIG);
            location.reload();
            break;
        }
      },
    },
  },
});
