/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./context/**/*.{js,ts,jsx,tsx}",
        "./utils/**/*.{js,ts,jsx,tsx}"
    ],
    darkMode: 'class', // IMPORTANTE: Esto habilita el cambio manual de modo oscuro
    theme: {
        extend: {},
    },
    plugins: [],
}
