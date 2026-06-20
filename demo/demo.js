const ErrorMonitor = require('../index.js'); // Use relative path for local testing, or require('node-error-monitor') once installed

// 1. Initialize the SDK with your keys
const monitor = new ErrorMonitor({
    workspaceKey: 'd58ec0ddb5f74376ae3973cb4a59d808',
    projectKey: 'B04F2CA9CF4049F0AF645A4396E73305',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiIxNzYxRUUxQTU1Nzg0QTJCQkRFQjhGRUMwRDkwN0NDQyIsImlhdCI6MTc4MTk2MzQ4MSwiZXhwIjoxNzg0NTU1NDgxfQ.4oCgXwinXr1hHyl1hGB5X0C8PNBsIewaUg2Hv5lMKAk'
});

monitor.init();

console.log('Demo running. Triggering an unhandled promise rejection in 1 second...');

// 2. Trigger an unhandled promise rejection
setTimeout(() => {
    Promise.reject(new Error('This is a simulated unhandled promise rejection!'));
}, 1000);

// 3. Trigger an uncaught exception (uncomment to test process crash behavior)
setTimeout(() => {
    throw new Error('This is a simulated uncaught exception! (Will crash process)');
}, 2000);
