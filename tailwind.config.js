/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')
module.exports = {
    darkMode: ['class', '[data-theme="dark"]'],
    content: [
        "./*.hbs",
        "./partials/**/**.hbs"
    ],
    theme: {
        extend: {
            colors: {
                btcarg: {
                  500: '#ed5107'
                },
              }
        },
    },
    plugins: [
        require('@tailwindcss/line-clamp'),
    ],
}
