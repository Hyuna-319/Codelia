#!/bin/bash

# Install dependencies
pip3 install -r requirements.txt

# Clean previous builds
rm -rf build dist

# Build Python executable
# --onedir: Create a directory with the executable (faster startup than --onefile)
# --noconsole: Don't show a terminal window
# --add-data: Include prompts directory
pyinstaller --noconfirm --onedir --noconsole --clean \
    --name api \
    --add-data "prompts:prompts" \
    api.py

echo "Python build complete. Executable is in dist/api/api"
