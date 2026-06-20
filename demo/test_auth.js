const endpoint = 'https://app-fusionsuite.localdevspace.link/local-gateway/browser-plugin-services/api/v1/sdk/submit-bug';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiIxNzYxRUUxQTU1Nzg0QTJCQkRFQjhGRUMwRDkwN0NDQyIsImlhdCI6MTc4MTk2MzQ4MSwiZXhwIjoxNzg0NTU1NDgxfQ.4oCgXwinXr1hHyl1hGB5X0C8PNBsIewaUg2Hv5lMKAk';

const payload = {
    workspace_kuid: 'd58ec0ddb5f74376ae3973cb4a59d808',
    project_kuid: 'B04F2CA9CF4049F0AF645A4396E73305',
    assignee_kuid: "",
    tag_kuid: "",
    reporteeName: "Node.js SDK",
    reporteeEmail: "sdk@node-error-monitor.com",
    assignedTo: "",
    bugTitle: "Test Error",
    bugDescription: "Test Description",
    screenDensity: "",
    screenResolution: "",
    appPermissions: {},
    suggestingAnImprovement: 0,
    test_case_ids: [],
    activeTabTitle: 'node-error-monitor',
    activeTabUrl: 'D:\\My Codes\\node-error-monitor',
    browserVersion: 'v22.11.0',
    consoleLogs: "",
    screenShots: "",
    videoAttachment: "",
    operatingSystem: "win32 (x64)",
    browser: "Node.js",
    viewPortSize: {},
    networkLogs: ""
};

async function test(headers, body) {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: typeof body === 'string' ? body : JSON.stringify(body)
        });
        const text = await response.text();
        console.log(`Headers:`, headers);
        console.log(`Status: ${response.status}. Response: ${text}\n`);
        return response.ok;
    } catch (err) {
        console.error(err);
        return false;
    }
}

async function run() {
    console.log("--- Test 1: Authorization Header (Bearer) + Stringified Payload ---");
    await test({ 'Authorization': `Bearer ${token}` }, { payload: JSON.stringify(payload) });

    console.log("--- Test 2: Authorization Header (Raw JWT) + Stringified Payload ---");
    await test({ 'Authorization': token }, { payload: JSON.stringify(payload) });

    console.log("--- Test 3: token Header + Stringified Payload ---");
    await test({ 'token': token }, { payload: JSON.stringify(payload) });

    console.log("--- Test 4: token Header + Plain Payload ---");
    await test({ 'token': token }, { payload: payload });

    console.log("--- Test 5: Authorization (Raw JWT) + Plain Payload ---");
    await test({ 'Authorization': token }, { payload: payload });

    console.log("--- Test 6: Authorization (Bearer) + Plain Payload ---");
    await test({ 'Authorization': `Bearer ${token}` }, { payload: payload });
}

run();
