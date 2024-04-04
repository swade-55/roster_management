/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  mytheme: {
          
    "primary": "#9700ff",
             
    "secondary": "#cf0000",
             
    "accent": "#00a3ff",
             
    "neutral": "#0c041a",
             
    "base-100": "#fffde9",
             
    "info": "#0077f2",
             
    "success": "#98d300",
             
    "warning": "#f0a100",
             
    "error": "#ff396b",
             },
  plugins: [require("daisyui")],
}