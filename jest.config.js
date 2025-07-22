module.exports = {
	preset: "react-native",
	setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
	testMatch: [
		"**/__tests__/**/*.test.(ts|tsx|js)",
		"**/*.(test|spec).(ts|tsx|js)",
	],
	collectCoverageFrom: [
		"src/**/*.{ts,tsx}",
		"!src/**/*.d.ts",
		"!src/__tests__/**",
		"!src/types/**",
	],
	coverageDirectory: "coverage",
	coverageReporters: ["text", "lcov", "html"],
	moduleNameMapping: {
		"^@/(.*)$": "<rootDir>/src/$1",
	},
	transformIgnorePatterns: [
		"node_modules/(?!(react-native|@react-native|react-native-vector-icons|react-native-qrcode-svg|react-native-svg)/)",
	],
	testEnvironment: "node",
};
