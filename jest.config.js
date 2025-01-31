module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    testEnvironmentOptions: {
        url: 'http://localhost/',
        userAgent: 'Agent/007',
        resources: undefined,
    },
    testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.build.json',
        },
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
