const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const waitOn = require('wait-on');

let mainWindow;
let pythonProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

function startPythonServer() {
    let pythonExecutable;
    let args = [];

    if (app.isPackaged) {

        const exeName = process.platform === 'win32' ? 'api.exe' : 'api';
        pythonExecutable = path.join(process.resourcesPath, 'api', exeName);
        console.log(`[PACKAGED] Using bundled executable: ${pythonExecutable}`);
    } else {

        pythonExecutable = process.platform === 'win32' ? 'python' : '/opt/homebrew/bin/python3.11';
        const scriptPath = path.join(__dirname, 'api.py');
        args = [scriptPath];
        console.log(`[DEV] Using Python script: ${pythonExecutable} ${scriptPath}`);
    }

    console.log(`Starting Python server: ${pythonExecutable} ${args.join(' ')}`);

    pythonProcess = spawn(pythonExecutable, args);

    pythonProcess.stdout.on('data', (data) => {
        console.log(`Python stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
    });

    pythonProcess.on('error', (err) => {
        console.error(`Failed to start Python process: ${err.message}`);
    });
}

app.on('ready', () => {
    console.log('Electron app ready, starting Python server...');
    startPythonServer();


    setTimeout(() => {
        console.log('Waiting for Flask server at http://localhost:8000/api/config...');


        waitOn({
            resources: ['http://localhost:8000/api/config'],
            timeout: 5000, // 대기시간
            interval: 1000, //업데이트 주기 
            verbose: true
        })
            .then(() => {
                console.log('✓ Flask server is ready!');
                createWindow();
            })
            .catch((err) => {
                console.error('✗ Error waiting for Python server:', err.message);
                console.log('Creating window anyway...');
                createWindow();
            });
    }, 2000);
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

app.on('will-quit', () => {
    if (pythonProcess) {
        pythonProcess.kill();
    }
});
