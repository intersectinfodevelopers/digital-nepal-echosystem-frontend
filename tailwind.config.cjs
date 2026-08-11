module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        success: "#17B26A",
        danger: "#F04438",
        warning: "#F79009",
        muted: "#667085",
        surface: "#FFFFFF",
      },

      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },

      boxShadow: {
        card: "0 1px 3px rgba(16,24,40,.10)",
        hover: "0 4px 12px rgba(16,24,40,.12)",
      },

      fontFamily: {
        sans: ["Geist", "sans-serif"],
      },

      fontSize: {
        xs: ["12px", "18px"],
        sm: ["14px", "20px"],
        base: ["16px", "24px"],
        lg: ["18px", "28px"],
        xl: ["20px", "30px"],
        "2xl": ["24px", "32px"],
      },

      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        65: "16.25rem",
      },

      transitionDuration: {
        250: "250ms",
      },
    },
  },

  plugins: [],
};
