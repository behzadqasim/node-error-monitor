const os = require('os');
const fs = require('fs');
const path = require('path');
const util = require('util');

// Dev Server = https://app-fusionsuite.localdevspace.link/local-gateway/browser-plugin-services/api/v1/sdk/submit-bug

class ErrorMonitor {
    constructor(config = {}) {
        this.workspaceKey = config.workspaceKey;
        this.projectKey = config.projectKey;
        this.token = config.token;
        this.endpoint = 'https://app-fusionsuite.localdevspace.link/local-gateway/browser-plugin-services/api/v1/sdk/submit-bug';

        // Automatically extract project details
        const projectMeta = this.getProjectMetadata();
        this.projectName = projectMeta.name;
        this.projectVersion = projectMeta.version;
        this.environment = process.env.NODE_ENV || 'development';

        if (!this.workspaceKey || !this.projectKey) {
            console.warn('⚠️ ErrorMonitor: Missing workspaceKey or projectKey. Errors will not be reported.');
        }
        this.logBuffer = [];
        this.maxLogLines = 50;
    }

    setToken(token) {
        this.token = token;
    }

    init() {
        if (!this.workspaceKey || !this.projectKey) return;

        this.setupConsoleInterceptor();

        process.on('uncaughtException', (error) => {
            this.reportError(error, 'uncaughtException')
                .then(() => process.exit(1))
                .catch(() => process.exit(1));
        });

        process.on('unhandledRejection', (reason) => {
            const error = reason instanceof Error ? reason : new Error(String(reason));
            this.reportError(error, 'unhandledRejection');
        });

        console.log(`✅ ErrorMonitor tracking "${this.projectName}" [${this.environment}]`);
    }

    setupConsoleInterceptor() {
        const originalMethods = {
            log: console.log,
            warn: console.warn,
            error: console.error,
            info: console.info,
            debug: console.debug
        };

        const captureLog = (type, args) => {
            try {
                const timestamp = new Date().toISOString();
                const message = args.map(arg => {
                    if (typeof arg === 'string') return arg;
                    return util.inspect(arg, { depth: 2, colors: false });
                }).join(' ');

                this.logBuffer.push(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
                if (this.logBuffer.length > this.maxLogLines) {
                    this.logBuffer.shift();
                }
            } catch (err) {
                // Fail-safe to avoid throwing if something goes wrong in logging
            }
        };

        ['log', 'warn', 'error', 'info', 'debug'].forEach(method => {
            if (typeof console[method] === 'function') {
                console[method] = (...args) => {
                    captureLog(method, args);
                    originalMethods[method].apply(console, args);
                };
            }
        });
    }

    // NEW: Reads the host project's package.json
    getProjectMetadata() {
        try {
            // process.cwd() gives the root directory of the node app running your library
            const packageJsonPath = path.join(process.cwd(), 'package.json');

            if (fs.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                return {
                    name: packageJson.name || 'unnamed-node-project',
                    version: packageJson.version || '0.0.0'
                };
            }
        } catch (e) {
            // Fallback if package.json is inaccessible or malformed
        }
        return { name: 'unknown-project', version: '0.0.0' };
    }

    getHostSpecs() {
        return {
            hostname: os.hostname(),
            platform: os.platform(),
            architecture: os.arch(),
            release: os.release(),
            totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
            freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
            cpuCount: os.cpus().length,
            uptime: `${(os.uptime() / 3600).toFixed(2)} hours`,
            nodeVersion: process.version
        };
    }

    async reportError(error, type = 'manual') {
        const host = this.getHostSpecs();
        const bugDescription = `Stack Trace:
${error.stack || error.message}

Host Details:
- Hostname: ${host.hostname}
- Platform: ${host.platform}
- Architecture: ${host.architecture}
- Release: ${host.release}
- Total Memory: ${host.totalMemory}
- Free Memory: ${host.freeMemory}
- CPU Count: ${host.cpuCount}
- Uptime: ${host.uptime}
- Node Version: ${host.nodeVersion}`;

        const payload = {
            workspace_kuid: this.workspaceKey,
            project_kuid: this.projectKey,
            assignee_kuid: "",
            tag_kuid: "",
            reporteeName: "Node.js SDK",
            reporteeEmail: "sdk@node-error-monitor.com",
            assignedTo: "",
            bugTitle: `${error.name || 'Error'}: ${error.message || 'No message provided'}`,
            bugDescription: bugDescription,
            screenDensity: "",
            screenResolution: "",
            appPermissions: {},
            suggestingAnImprovement: 0,
            test_case_ids: [],
            activeTabTitle: this.projectName || 'Node.js Application',
            activeTabUrl: process.cwd(),
            browserVersion: process.version,
            consoleLogs: this.logBuffer.join('\n'),
            screenShots: "",
            videoAttachment: "",
            operatingSystem: `${host.platform} (${host.architecture}) - Release: ${host.release}`,
            browser: "Node.js",
            viewPortSize: {}
            // networkLogs: ""
        };

        const headers = { 'Content-Type': 'application/json' };
        if (this.token) {
            headers['Authorization'] = this.token;
        }

        try {
            console.log('Sending request:', JSON.stringify({
                url: this.endpoint,
                method: 'POST',
                headers: headers,
                body: { payload: JSON.stringify(payload) }
            }, null, 2));

            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ payload: JSON.stringify(payload) })
            });
            if (!response.ok) {
                const responseText = await response.text();
                console.warn(`⚠️ ErrorMonitor: Failed to report error. Status: ${response.status}. Response: ${responseText}`);
            } else {
                console.log('✅ ErrorMonitor: Error reported successfully');
            }
        } catch (sendError) {
            console.log(sendError);
            console.error('❌ ErrorMonitor failed to report:', sendError.message);
        }
    }
}

module.exports = ErrorMonitor;