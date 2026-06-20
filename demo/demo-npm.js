const ErrorMonitor = require('node-error-monitor');

// Initialize the SDK with your credentials
const monitor = new ErrorMonitor({
    workspaceKey: 'd58ec0ddb5f74376ae3973cb4a59d808',
    projectKey: 'B04F2CA9CF4049F0AF645A4396E73305'
});

monitor.init();

console.log('🚀 NPM Package Demo running. Triggering an unhandled rejection...');

setTimeout(() => {
    Promise.reject(new Error('Simulated rejection from installed npm package!'));
}, 1000);
