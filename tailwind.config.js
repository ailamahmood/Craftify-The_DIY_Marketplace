/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brown: "#704F38",
        lightblack: "#282932",
        lightgray: "#E6E6E6",
        darkgray: "#A0A0A0",
      },
      fontFamily: {
        ink_bold: ["inknutantiqua_bold"],

        // Poppins fonts
        pthin: ["Poppins-Thin", "sans-serif"],
        pextralight: ["Poppins-ExtraLight", "sans-serif"],
        plight: ["Poppins-Light", "sans-serif"],
        pregular: ["Poppins-Regular", "sans-serif"],
        pmedium: ["Poppins-Medium", "sans-serif"],
        psemibold: ["Poppins-SemiBold", "sans-serif"],
        pbold: ["Poppins-Bold", "sans-serif"],
        pextrabold: ["Poppins-ExtraBold", "sans-serif"],
        pblack: ["Poppins-Black", "sans-serif"],

        // Inter fonts (18pt, 24pt, 28pt variants)
        i18_bold: ["inter_18pt_bold"],
        i18_extrabold: ["inter_18pt_extrabold"],
        i18_medium: ["inter_18pt_medium"],
        i18_regular: ["inter_18pt_regular"],
        i18_semibold: ["inter_18pt_semibold"],
        i24_bold: ["inter_24pt_bold"],
        i24_extrabold: ["inter_24pt_extrabold"],
        i24_medium: ["inter_24pt_medium"],
        i24_regular: ["inter_24pt_regular"],
        i24_semibold: ["inter_24pt_semibold"],
        i28_bold: ["inter_28pt_bold"],
        i28_extrabold: ["inter_28pt_extrabold"],
        i28_italic: ["inter_28pt_italic"],
        i28_light: ["inter_28pt_light"],
        i28_medium: ["inter_28pt_medium"],
        i28_regular: ["inter_28pt_regular"],
        i28_semibold: ["inter_28pt_semibold"],

        // Set default font to Inter (18pt regular)
        sans: ['inter_18pt_regular', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
