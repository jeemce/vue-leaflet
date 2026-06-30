import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';

// Mock leaflet
vi.mock('leaflet', () => ({
	default: {
		map: vi.fn(() => ({
			setView: vi.fn(),
			getZoom: vi.fn(() => 13),
			getCenter: vi.fn(() => ({ lat: 0, lng: 0 })),
			setZoom: vi.fn(),
			on: vi.fn(),
			remove: vi.fn(),
			removeLayer: vi.fn(),
		})),
		tileLayer: vi.fn(() => ({
			addTo: vi.fn(() => ({
				remove: vi.fn(),
			})),
		})),
	},
}));

import Widget from '../widgets/leaflet.vue';

describe('Widget Leaflet', () => {
	let wrapper;

	beforeEach(() => {
		wrapper = null;
	});

	afterEach(() => {
		if (wrapper) {
			wrapper.unmount();
		}
	});

	it('should render the widget with correct class', () => {
		wrapper = mount(Widget, {
			props: {
				center: [51.505, -0.09],
				zoom: 13,
			},
		});

		expect(wrapper.find('.vue-leaflet-map').exists()).toBe(true);
	});

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

	it('should accept custom tile URL', () => {
		const tileUrl = 'https://example.com/{z}/{x}/{y}.png';
		wrapper = mount(Widget, {
			props: {
				center: [51.505, -0.09],
				zoom: 13,
				tileUrl,
			},
		});

		expect(wrapper.props('tileUrl')).toBe(tileUrl);
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

	it('should apply custom style', () => {
		const style = {
			height: '500px',
			width: '800px',
		};
		wrapper = mount(Widget, {
			props: {
				center: [51.505, -0.09],
				zoom: 13,
				style,
			},
		});

		const element = wrapper.find('.vue-leaflet-map');
		expect(element.attributes('style')).toContain('height: 500px');
		expect(element.attributes('style')).toContain('width: 800px');
	});
});
