    /** @type {import('tailwindcss').Config} */
    export default {
      // Ensure these paths cover all files where you use Tailwind classes
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}", // Scans all relevant files in the src folder
      ],
      theme: {
        extend: {}, // You can add theme customizations here later if needed
      },
      plugins: [], // You can add Tailwind plugins here later if needed
    }
    