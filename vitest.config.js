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
		name: 'unit',
		globals: true,
		environment: 'jsdom',
		include: ['tests/unit/**/*.spec.js', 'tests/unit/**/*.test.js'],
		exclude: ['tests/e2e/**', 'tests/browser/**', 'tests/integration/**', 'node_modules/**'],
		snapshotFormat: {
			escapeString: true,
			printBasicPrototype: true,
		},
		coverage: {
			provider: 'v8',
			reporter: ['text', 'text-summary', 'html', 'lcov'],
			exclude: [
				'node_modules/',
				'tests/',
				'docs/',
				'**/*.d.ts',
				'**/index.js',
			],
			thresholds: {
				lines: 80,
				functions: 80,
				branches: 70,
				statements: 80,
			},
		},
		setupFiles: ['./tests/unit/setup.js'],
		mockReset: true,
		restoreMocks: true,
		clearMocks: true,
	},
});
