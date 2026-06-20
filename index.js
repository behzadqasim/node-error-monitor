const os = require('os');
const fs = require('fs');
const path = require('path');

// Dev Server = https://app-fusionsuite.localdevspace.link/local-gateway/browser-plugin-services/api/v1/sdk/submit-bug

class ErrorMonitor {
    constructor(config = {}) {
        this.workspaceKey = config.workspaceKey;
        this.projectKey = config.projectKey;
        this.endpoint = 'https://app-fusionsuite.localdevspace.link/local-gateway/browser-plugin-services/api/v1/sdk/submit-bug';

        // Automatically extract project details
        const projectMeta = this.getProjectMetadata();
        this.projectName = projectMeta.name;
        this.projectVersion = projectMeta.version;
        this.environment = process.env.NODE_ENV || 'development';

        if (!this.workspaceKey || !this.projectKey) {
            console.warn('⚠️ ErrorMonitor: Missing workspaceKey or projectKey. Errors will not be reported.');
        }
    }

    init() {
        if (!this.workspaceKey || !this.projectKey) return;

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
        const payload = {
            workspaceKey: this.workspaceKey,
            projectKey: this.projectKey,
            // Metadata fields added here:
            projectName: this.projectName,
            projectVersion: this.projectVersion,
            environment: this.environment,
            timestamp: new Date().toISOString(),
            type: type,
            error: {
                name: error.name || 'Error',
                message: error.message,
                stack: error.stack
            },
            host: this.getHostSpecs()
        };

        try {
            await fetch(this.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (sendError) {
            console.error('❌ ErrorMonitor failed to report:', sendError.message);
        }
    }
}

module.exports = ErrorMonitor;