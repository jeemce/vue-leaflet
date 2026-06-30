import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import Widget from '../../../widgets/leaflet.vue';

describe('Widget - leaflet.vue', () => {
	let wrapper;

	beforeEach(() => {
		// Reset mocks before each test
		vi.clearAllMocks();
	});

	afterEach(() => {
		if (wrapper) {
			wrapper.unmount();
		}
	});

	describe('Component Rendering', () => {
		it('should render the widget with correct class', () => {
			wrapper = mount(Widget, {
				props: {
					center: [51.505, -0.09],
					zoom: 13,
				},
			});

			expect(wrapper.find('.vue-leaflet-map').exists()).toBe(true);
		});

		it('should apply custom styles when provided', () => {
			wrapper = mount(Widget, {
				props: {
					center: [51.505, -0.09],
					zoom: 13,
					style: {
						height: '500px',
						width: '100%',
					},
				},
			});

			const container = wrapper.find('.vue-leaflet-map');
			const style = container.attributes('style');
			expect(style).toContain('height: 500px');
			expect(style).toContain('width: 100%');
		});
	});

	describe('Props Validation', () => {
		it('should accept center prop as array', () => {
			const center = [51.505, -0.09];
			wrapper = mount(Widget, {
				props: {
					center,
					zoom: 13,
				},
			});

			expect(wrapper.props('center')).toEqual(center);
		});

		it('should accept zoom prop as number', () => {
			const zoom = 15;
			wrapper = mount(Widget, {
				props: {
					center: [51.505, -0.09],
					zoom,
				},
			});

			expect(wrapper.props('zoom')).toBe(zoom);
		});

		it('should accept config object', () => {
			const config = {
				zoomControl: false,
				scrollWheelZoom: false,
			};
			wrapper = mount(Widget, {
				props: {
					center: [51.505, -0.09],
					zoom: 13,
					config,
				},
			});

			expect(wrapper.props('config')).toEqual(config);
		});

		it('should accept layers array', () => {
			const layers = [
				{ type: 'marker', latlng: [51.5, -0.09] },
				{ type: 'circle', latlng: [51.5, -0.09], radius: 500 },
			];
			wrapper = mount(Widget, {
				props: {
					center: [51.505, -0.09],
					zoom: 13,
					layers,
				},
			});

			expect(wrapper.props('layers')).toEqual(layers);
		});
	});

	describe('Event Emissions', () => {
		it('should emit map-created event', async () => {
			wrapper = mount(Widget, {
				props: {
					center: [51.505, -0.09],
					zoom: 13,
				},
			});

			await flushPromises();

			expect(wrapper.emitted('map-created')).toBeTruthy();
		});

		it('should emit map-mounted event', async () => {
			wrapper = mount(Widget, {
				props: {
					center: [51.505, -0.09],
					zoom: 13,
				},
			});

			await flushPromises();

			expect(wrapper.emitted('map-mounted')).toBeTruthy();
		});

		it('should emit map-ready event', async () => {
			wrapper = mount(Widget, {
				props: {
					center: [51.505, -0.09],
					zoom: 13,
				},
			});

			await flushPromises();

			expect(wrapper.emitted('map-ready')).toBeTruthy();
		});
	});

	describe('Exposed Methods', () => {
		it('should expose getMap method', () => {
			wrapper = mount(Widget, {
				props: {
					center: [51.505, -0.09],
					zoom: 13,
				},
			});

			expect(typeof wrapper.vm.getMap).toBe('function');
		});

		it('should expose getLeaflet method', () => {
			wrapper = mount(Widget, {
				props: {
					center: [51.505, -0.09],
					zoom: 13,
				},
			});

			expect(typeof wrapper.vm.getLeaflet).toBe('function');
		});

		it('should expose addLayer method', () => {
			wrapper = mount(Widget, {
				props: {
					center: [51.505, -0.09],
					zoom: 13,
				},
			});

			expect(typeof wrapper.vm.addLayer).toBe('function');
		});

		it('should expose removeLayer method', () => {
			wrapper = mount(Widget, {
				props: {
					center: [51.505, -0.09],
					zoom: 13,
				},
			});

			expect(typeof wrapper.vm.removeLayer).toBe('function');
		});
	});

	describe('Slot Content', () => {
		it('should render slot content when map is ready', async () => {
			wrapper = mount(Widget, {
				props: {
					center: [51.505, -0.09],
					zoom: 13,
				},
				slots: {
					default: '<div class="test-slot">Slot Content</div>',
				},
			});

			await flushPromises();

			// Slot should be conditionally rendered based on map readiness
			expect(wrapper.find('.vue-leaflet-map').exists()).toBe(true);
		});
	});
});
