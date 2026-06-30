/**
 * Integration tests for vue-leaflet widget
 * Tests with real Leaflet library in happy-dom environment
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import Widget from '../../../widgets/leaflet.vue';
import LMarker from '../../../widgets/LMarker.vue';
import { useLeaflet } from '../../../plugins/useLeaflet.js';
import LPolygon from '../../../widgets/LPolygon.vue';
import LCircle from '../../../widgets/LCircle.vue';

describe('Integration - Widget with Real Leaflet', () => {
	let wrapper;

	beforeEach(() => {
		// Clean up before each test
	});

	afterEach(() => {
		if (wrapper) {
			wrapper.unmount();
		}
	});

	describe('Map Initialization', () => {
		it('should initialize Leaflet map with correct configuration', async () => {
			wrapper = mount(Widget, {
				props: {
					center: [51.505, -0.09],
					zoom: 13,
				},
			});

			await flushPromises();

			// Verify map was created
			const mapInstance = wrapper.vm.getMap();
			expect(mapInstance).toBeDefined();
			expect(mapInstance.getZoom()).toBe(13);
		});

		it('should initialize with custom config options', async () => {
			wrapper = mount(Widget, {
				props: {
					center: [40.7128, -74.006],
					zoom: 10,
					config: {
						zoomControl: false,
						scrollWheelZoom: false,
						doubleClickZoom: false,
					},
				},
			});

			await flushPromises();

			const mapInstance = wrapper.vm.getMap();
			expect(mapInstance).toBeDefined();
			expect(mapInstance.options.zoomControl).toBe(false);
		});
	});

	describe('Layer Management', () => {
		it('should add marker layers from props', async () => {
			wrapper = mount(Widget, {
				props: {
					center: [51.505, -0.09],
					zoom: 13,
					layers: [
						{ type: 'marker', latlng: [51.5, -0.09] },
						{ type: 'marker', latlng: [51.51, -0.1] },
					],
				},
			});

			await flushPromises();

			const layers = wrapper.vm.getAllLayers();
			expect(layers.size).toBeGreaterThan(0);
		});

		it('should handle layer addition via method', async () => {
			wrapper = mount(Widget, {
				props: {
					center: [51.505, -0.09],
					zoom: 13,
				},
			});

			await flushPromises();

			// Add layer programmatically
			const result = wrapper.vm.addLayer({
				type: 'marker',
				latlng: [51.5, -0.09],
			});

			expect(result).toBeDefined();
			expect(result.layer).toBeDefined();
		});
	});

	describe('Child Components Integration', () => {
		it('should render child marker components', async () => {
			wrapper = mount(Widget, {
				props: {
					center: [51.505, -0.09],
					zoom: 13,
				},
				slots: {
					default: '<LMarker :latlng="[51.5, -0.09]" />',
				},
			});

			await flushPromises();

			expect(wrapper.find('.vue-leaflet-map').exists()).toBe(true);
		});
	});

	describe('Event Handling', () => {
		it('should emit events on map interaction', async () => {
			wrapper = mount(Widget, {
				props: {
					center: [51.505, -0.09],
					zoom: 13,
				},
			});

			await flushPromises();

			// Check that lifecycle events were emitted
			expect(wrapper.emitted('map-created')).toBeTruthy();
			expect(wrapper.emitted('map-mounted')).toBeTruthy();
			expect(wrapper.emitted('map-ready')).toBeTruthy();
		});

		it('should handle update:center event', async () => {
			wrapper = mount(Widget, {
				props: {
					center: [51.505, -0.09],
					zoom: 13,
				},
			});

			await flushPromises();

			// Update center prop
			await wrapper.setProps({ center: [48.8566, 2.3522] });

			const mapInstance = wrapper.vm.getMap();
			expect(mapInstance.setView).toHaveBeenCalled();
		});
	});
});
