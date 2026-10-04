import { defineConfig } from 'vite';
import { env } from 'node:process';

export default defineConfig({
	base: env['VITE_BASE'],
	build: {
		// Build referenced assets as siblings of index.html; not within a separate assets directory.
		assetsDir: '.',

		// Support browers from 2024+ (allows nested CSS).
		// https://vite.dev/config/build-options#build-target
		// https://web-platform-dx.github.io/supported-browsers/?targetYear=2024
		target: ['chrome130', 'firefox132', 'safari18.2', 'ios18.2'],
	},
});
