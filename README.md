# Standalone Cellbrowser Creator
These are simple scripts that use node.js and electron to create an executable that runs a local UCSC Cellbrowser instance

## Requirements
- The file output of cbBuild must be moved into the empty cb folder after cloning this repository.
- You may want to replace the default UCSF Immunoprofiler Logo in the assets folder.

## Building
- Install package dependencies using `npm install`
- After copying files into the cb folder you can simply run `npm run make`
- This should create an `out` folder containing the executables

## Optional
- Configure the `mainWindow.setTitle('Cell Browser');` in `main.js` to rename the window if desired. 

