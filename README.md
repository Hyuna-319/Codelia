# Requirement Analyzer (Electron App)

This directory contains the Electron version of the Requirement Analyzer tool.

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)

## Setup (macOS)

1.  **Install Python Dependencies**:
    ```bash
    pip3 install -r requirements.txt
    ```

2.  **Install Node.js Dependencies**:
    ```bash
    npm install
    ```

## Running the App

Start the application with:

```bash
npm start
```

This command will:
1.  Launch the Electron application window.
2.  Automatically start the Python Flask backend server (using `python3`).

## Troubleshooting

-   If the API key is not saved, check if the `.requirement_improver` folder exists in your home directory.
-   If the backend fails to start, try running `python api.py` manually to see any error messages.
