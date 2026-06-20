const ErrorMonitor = require('../index.js'); // Use relative path for local testing, or require('node-error-monitor') once installed

// 1. Initialize the SDK with your keys
const monitor = new ErrorMonitor({
    workspaceKey: 'demo-workspace-key',
    projectKey: 'demo-project-key'
});

monitor.init();

console.log('🚀 Demo running. Triggering an unhandled promise rejection in 1 second...');

// 2. Trigger an unhandled promise rejection
setTimeout(() => {
    Promise.reject(new Error('This is a simulated unhandled promise rejection!'));
}, 1000);

// 3. Trigger an uncaught exception (uncomment to test process crash behavior)
setTimeout(() => {
    throw new Error('This is a simulated uncaught exception! (Will crash process)');
}, 2000);
