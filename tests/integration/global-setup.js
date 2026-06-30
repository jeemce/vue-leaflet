/**
 * Global setup for integration tests
 * Runs once before all test suites
 */

export default async function () {
	console.log('🚀 Starting integration test global setup...');

	// Set environment variables for tests
	process.env.NODE_ENV = 'test';
	process.env.VITE_TEST_MODE = 'integration';

	// Validate test environment
	const requiredEnvVars = ['NODE_ENV'];
	for (const envVar of requiredEnvVars) {
		if (!process.env[envVar]) {
			console.warn(`⚠️  Environment variable ${envVar} is not set`);
		}
	}

	console.log('✅ Global setup complete');
}
