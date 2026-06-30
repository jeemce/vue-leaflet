/**
 * End-to-End tests for vue-leaflet widget
 * Uses Playwright for real browser testing
 */

import { test, expect } from '@playwright/test';

test.describe('Widget - Basic Functionality', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to the test page
		await page.goto('/test.html');
		// Wait for the map to be initialized
		await page.waitForSelector('.vue-leaflet-map', { state: 'visible' });
	});

	test('should render the map container', async ({ page }) => {
		const mapContainer = await page.locator('.vue-leaflet-map');
		await expect(mapContainer).toBeVisible();
	});

	test('should have correct initial center and zoom', async ({ page }) => {
		// Get the map instance from the window object
		const mapInfo = await page.evaluate(() => {
			const map = window.testMap;
			return {
				center: map.getCenter(),
				zoom: map.getZoom(),
			};
		});

		expect(mapInfo.center.lat).toBeCloseTo(51.505, 2);
		expect(mapInfo.center.lng).toBeCloseTo(-0.09, 2);
		expect(mapInfo.zoom).toBe(13);
	});

	test('should render tile layer', async ({ page }) => {
		// Wait for tile layer to be added
		await page.waitForTimeout(1000);

		// Check for tile images
		const tiles = await page.locator('.leaflet-tile').count();
		expect(tiles).toBeGreaterThan(0);
	});
});

test.describe('Widget - Layer Management', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/test-layers.html');
		await page.waitForSelector('.vue-leaflet-map', { state: 'visible' });
	});

	test('should add markers to the map', async ({ page }) => {
		// Click button to add marker
		await page.click('[data-testid="add-marker-btn"]');

		// Wait for marker to be added
		await page.waitForTimeout(500);

		// Check for marker element
		const markers = await page.locator('.leaflet-marker-icon').count();
		expect(markers).toBeGreaterThan(0);
	});

	test('should add polygon to the map', async ({ page }) => {
		// Click button to add polygon
		await page.click('[data-testid="add-polygon-btn"]');

		// Wait for polygon to be added
		await page.waitForTimeout(500);

		// Check for SVG path elements (polygons are rendered as SVG paths)
		const paths = await page.locator('.leaflet-overlay-pane svg path').count();
		expect(paths).toBeGreaterThan(0);
	});

	test('should clear all layers', async ({ page }) => {
		// Add some layers first
		await page.click('[data-testid="add-marker-btn"]');
		await page.waitForTimeout(500);

		// Then clear all
		await page.click('[data-testid="clear-layers-btn"]');
		await page.waitForTimeout(500);

		// Check that markers are removed
		const markers = await page.locator('.leaflet-marker-icon').count();
		expect(markers).toBe(0);
	});
});

test.describe('Widget - Interactions', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/test.html');
		await page.waitForSelector('.vue-leaflet-map', { state: 'visible' });
	});

	test('should handle map click events', async ({ page }) => {
		// Click on the map
		await page.click('.vue-leaflet-map', { position: { x: 400, y: 300 } });

		// Check if click event was recorded (assuming test page has a log)
		const clickLog = await page.locator('[data-testid="click-log"]').textContent();
		expect(clickLog).toContain('click');
	});

	test('should zoom in and out', async ({ page }) => {
		// Get initial zoom
		const initialZoom = await page.evaluate(() => window.testMap.getZoom());

		// Click zoom in button
		await page.click('.leaflet-control-zoom-in');
		await page.waitForTimeout(500);

		// Check zoom increased
		const newZoom = await page.evaluate(() => window.testMap.getZoom());
		expect(newZoom).toBe(initialZoom + 1);

		// Zoom out
		await page.click('.leaflet-control-zoom-out');
		await page.waitForTimeout(500);

		// Check zoom returned to initial
		const finalZoom = await page.evaluate(() => window.testMap.getZoom());
		expect(finalZoom).toBe(initialZoom);
	});
});

test.describe('Widget - Responsive', () => {
	test('should adapt to mobile viewport', async ({ page }) => {
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });

		await page.goto('/test.html');
		await page.waitForSelector('.vue-leaflet-map', { state: 'visible' });

		// Check map container is visible and has correct size
		const mapContainer = await page.locator('.vue-leaflet-map');
		const box = await mapContainer.boundingBox();

		expect(box.width).toBeLessThanOrEqual(375);
		expect(box.height).toBeGreaterThan(0);
	});

	test('should handle window resize', async ({ page }) => {
		await page.goto('/test.html');
		await page.waitForSelector('.vue-leaflet-map', { state: 'visible' });

		// Initial size
		const initialBox = await page.locator('.vue-leaflet-map').boundingBox();

		// Resize window
		await page.setViewportSize({ width: 800, height: 600 });
		await page.waitForTimeout(500);

		// Check map adapted to new size
		const newBox = await page.locator('.vue-leaflet-map').boundingBox();
		expect(newBox.width).toBe(800);
		expect(newBox.height).toBe(600);
	});
});
