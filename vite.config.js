      import { defineConfig } from 'vite'
      import react from '@vitejs/plugin-react' // Use standard Babel-based plugin

      // https://vitejs.dev/config/
      export default defineConfig({
        plugins: [react()], // This line remains the same
      })
      