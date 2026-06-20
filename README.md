# Node Error Monitor SDK

[![npm version](https://img.shields.io/npm/v/node-error-monitor.svg?style=flat-square)](https://www.npmjs.com/package/node-error-monitor)
[![license](https://img.shields.io/npm/l/node-error-monitor.svg?style=flat-square)](LICENSE)

An automated global error and host exception tracking SDK for Node.js applications. Seamlessly intercept unhandled exceptions and promise rejections, capture OS metrics, and report them to your centralized tracking dashboard.

---

## Features

- ⚙️ **Automatic Initialization**: Simply initialize with your workspace credentials.
- 🚨 **Global Exception Handling**: Automatically traps `uncaughtException` and `unhandledRejection`.
- 📊 **Host Metrics**: Gathers system specifications including memory, CPUs, operating system, and Node.js version.
- 📦 **Metadata Auto-Extraction**: Automatically reads the host project's `package.json` to tag incoming errors with the proper app name and version.
- 🧪 **Manual Tracking**: Manually report errors/exceptions from catch blocks.
- 🌐 **Clean & Lightweight**: Minimal dependencies, using native Node.js APIs.

---

## Installation

```bash
npm install node-error-monitor
```

---

## Quick Start

Initialize the SDK at the entry point of your Node.js application (e.g., `index.js` or `server.js`):

```javascript
const ErrorMonitor = require('node-error-monitor');

const monitor = new ErrorMonitor({
    workspaceKey: 'YOUR_WORKSPACE_KEY', // Obtain from your dashboard
    projectKey: 'YOUR_PROJECT_KEY'      // Obtain from your dashboard
});

// Start tracking global uncaught errors and promise rejections
monitor.init();
```

---

## API Reference

### `new ErrorMonitor(config)`

Creates an instance of the error monitor.

- `config.workspaceKey` (String, Required): Your dashboard's workspace identifier.
- `config.projectKey` (String, Required): Your dashboard's project identifier.

### `monitor.init()`

Hooks into global error handlers (`uncaughtException` and `unhandledRejection`). Once an uncaught exception is caught, it sends the payload and terminates the process with exit code `1`.

### `monitor.reportError(error, [type])`

Manually send an error to the dashboard.

- `error` (Error object): The error instance to send.
- `type` (String, Optional): Label for the source of the error. Default is `'manual'`.

#### Example:
```javascript
try {
    throw new Error('Database connection failed');
} catch (error) {
    await monitor.reportError(error, 'database_error');
}
```

---

## System Metrics Captured

Every time an error is reported, the SDK automatically collects host specifications:

- **Hostname & Platform** (e.g., `win32`, `linux`, `darwin`)
- **CPU Architecture & Core Count** (e.g., `x64` with 12 CPU cores)
- **Memory Stats** (Total & Free memory)
- **System Uptime** (Hours)
- **Node.js Runtime Version** (e.g., `v18.16.0`)

---

## Development & Publishing

### Test Locally
You can link the package locally to test inside another project:
```bash
npm link
```

### Build & Validate Package
Ensure the package only includes required files:
```bash
npm pack
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
