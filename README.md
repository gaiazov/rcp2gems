# rcp2gems
A utility to convert RaceCapture/Pro logs into a format that can be imported into GEMS Data Analysis software.

## Installation

    npm install -g rcp2gems
    
## Usage

    rcp2gems input.log output.itlog
    
Then just drag and drop the `output.itlog` file into GEMS Data Analysis

## How it works

The `.itlog` format is used by AEM Infinity. 
AEM has a habit of rebranding existing products, so AEMData is a rebranded version of GEMS Data Analysis and AEM Infinity ECU itself is actualy an EngineLab EL129.

So it turns out GEMS Data Analysis is perfectly happy importing AEM Infinity `.itlog` files.
So I decoded the `.itlog` format and now we have this tool.