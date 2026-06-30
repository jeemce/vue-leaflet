import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: {
			'@': resolve(__dirname, './'),
			'~': resolve(__dirname, './widgets'),
		},
	},
	test: {
		name: 'integration',
		globals: true,
		environment: 'happy-dom',
		include: ['tests/integration/**/*.spec.js', 'tests/integration/**/*.test.js'],
		exclude: ['tests/unit/**', 'tests/e2e/**', 'tests/browser/**', 'node_modules/**'],
		pool: 'threads',
		poolOptions: {
			threads: {
				singleThread: false,
			},
		},
		setupFiles: ['./tests/integration/setup.js'],
		globalSetup: ['./tests/integration/global-setup.js'],
		reporters: ['verbose', 'html'],
		outputFile: {
			html: './reports/integration-test-results.html',
		},
		mockReset: true,
		restoreMocks: true,
	},
});
