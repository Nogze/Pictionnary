import { sveltekit, vitePreprocess } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		port: 3000
	},
	plugins: [sveltekit()],
	preprocess: vitePreprocess()
});
