/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter"],
        superbold: ["Kelson Sans"],
      },
      fontSize: {
        xxs: "0.6rem",
        xxxs: "0.5rem",
      },
      colors: {
        "t-light": "#525252",
        "t-light2": "#717171",
        "t-main": "#1e1e1e",
        "t-scnd": "#444444",
        "t-thrd": "#323232",
      },
    },
  },
  plugins: [],
};
