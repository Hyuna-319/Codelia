import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
import waitOn from 'wait-on';

/**
 * Application Manager for Electron
 * Manages backend server and window lifecycle
 */
class ApplicationManager {
    private mainWindow: BrowserWindow | null = null;
    private backendProcess: ChildProcess | null = null;

    /**
     * Create the main Electron window
     */
    createWindow(): void {
        this.mainWindow = new BrowserWindow({
            width: 1200,
            height: 900,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        this.mainWindow.loadFile('index.html');

        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
    }

    /**
     * Start the TypeScript backend server
     */
    startBackendServer(): void {
        let executable: string;
        let args: string[] = [];

        if (app.isPackaged) {
            // Production: Use bundled executable
            const exeName = process.platform === 'win32' ? 'server.exe' : 'server';
            executable = path.join(process.resourcesPath, 'backend', exeName);
            console.log(`[PACKAGED] Using bundled executable: ${executable}`);
            console.log(`[PACKAGED] resourcesPath: ${process.resourcesPath}`);

            // Check if file exists
            const fs = require('fs');
            if (fs.existsSync(executable)) {
                console.log(`[PACKAGED] ✓ Backend executable found`);
            } else {
                console.error(`[PACKAGED] ✗ Backend executable NOT found at: ${executable}`);
                console.log(`[PACKAGED] Listing resourcesPath contents:`);
                try {
                    const files = fs.readdirSync(process.resourcesPath);
                    console.log(files);
                } catch (err) {
                    console.error(`[PACKAGED] Error listing directory:`, err);
                }
                return;
            }
        } else {
            // Development: Use tsx to run TypeScript directly
            executable = 'npx';
            // __dirname is dist/main/src/main, so go up 4 levels to project root
            const scriptPath = path.join(__dirname, '../../../../src/backend/server.ts');
            args = ['tsx', scriptPath];
            console.log(`[DEV] Using TypeScript script: ${executable} ${args.join(' ')}`);
        }

        console.log(`Starting backend server: ${executable} ${args.join(' ')}`);

        this.backendProcess = spawn(executable, args, {
            stdio: 'inherit',
            shell: true
        });

        this.backendProcess.on('close', (code) => {
            console.log(`Backend process exited with code ${code}`);
        });

        this.backendProcess.on('error', (err) => {
            console.error(`Failed to start backend process: ${err.message}`);
            console.error(`Error details:`, err);
        });
    }

    /**
     * Wait for backend server to be ready and create window
     */
    async waitForBackendAndCreateWindow(): Promise<void> {
        setTimeout(async () => {
            console.log('Waiting for backend server at http://localhost:8000/health...');

            try {
                await waitOn({
                    resources: ['http://localhost:8000/health'],
                    timeout: 5000,
                    interval: 1000,
                    verbose: true
                });

                console.log('✓ Backend server is ready!');
                this.createWindow();
            } catch (err: any) {
                console.error('✗ Error waiting for backend server:', err.message);
                console.log('Creating window anyway...');
                this.createWindow();
            }
        }, 2000);
    }

    /**
     * Cleanup: Kill backend process
     */
    cleanup(): void {
        if (this.backendProcess) {
            this.backendProcess.kill();
        }
    }
}

// Create application manager instance
const appManager = new ApplicationManager();

// App lifecycle events
app.on('ready', () => {
    console.log('Electron app ready, starting backend server...');
    appManager.startBackendServer();
    appManager.waitForBackendAndCreateWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (appManager['mainWindow'] === null) {
        appManager.createWindow();
    }
});

app.on('will-quit', () => {
    appManager.cleanup();
});
