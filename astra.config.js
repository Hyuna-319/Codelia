/**
 * @typedef {Object} Config
 * @property {string} [outFile] - Output file path
 * @property {Object} [esbuild] - esbuild options
 * @property {boolean} [modifyMetadata] - Modify metadata
 * @property {Object} [exe] - Exe metadata
 */

/** @type {Config} */
export default {
	outFile: "resources/backend/server.exe",

	esbuild: {
		platform: 'node',
		target: 'node18',
		bundle: true,
		minify: false,
	},

	modifyMetadata: false,

	exe: {
		companyName: "Codelia",
		productName: "Codelia Backend",
	},
};
