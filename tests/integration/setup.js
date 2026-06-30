import { vi } from 'vitest';

// Integration test setup with actual Leaflet
// This file runs before integration tests

// Set longer timeout for integration tests
vi.setConfig({
	testTimeout: 30000,
});

// Global test utilities
global.testUtils = {
	// Helper to wait for map initialization
	waitForMap: async (wrapper, timeout = 5000) => {
		const start = Date.now();
		while (Date.now() - start < timeout) {
			if (wrapper.vm.map && wrapper.vm.isReady?.()) {
				return true;
			}
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
		throw new Error('Map initialization timeout');
	},

	// Helper to create test GeoJSON
	createTestGeoJSON: () => ({
		type: 'FeatureCollection',
		features: [
			{
				type: 'Feature',
				properties: { name: 'Test Point' },
				geometry: {
					type: 'Point',
					coordinates: [-0.09, 51.5],
				},
			},
		],
	}),

	// Helper to simulate map interactions
	simulateMapEvent: (map, eventType, data = {}) => {
		const event = new CustomEvent(eventType, { detail: data });
		map.getContainer().dispatchEvent(event);
	},
};

// Log integration test mode
console.log('🔧 Integration test mode - Using real Leaflet library');
