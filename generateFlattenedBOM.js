var yaml = require('js-yaml');
var fs   = require('fs');
var Liquid = require('liquidjs');
var engine = Liquid();

var argv = require('minimist')(process.argv.slice(2));

// declare configurable variables with default values
var topComponentPath = process.cwd();
var outputDirName = 'dist';
var componentModel = 'component.yaml'
var flattenedPartsBOMFileName = 'flatPartsBOM.yaml'
var flattenedToolsBOMFileName = 'flatToolsBOM.yaml'

// handle arguments
if (argv['h'] || argv['help']) {  // if asked for help, print it and exit
    console.log('Usage: node generateFlattenedBOM.js [options]');
    console.log('--help, -h                                         Print the usage message and exit');
    console.log('--componentPath=<Path/To/Component/>               (default=CWD)');
    console.log('--outputDirName=<directory_to_write_output_files>  (default=dist)');
    console.log('--componentModel=<filename_of_component_model>     (default=component.yaml)');
    process.exit();
} else { // otherwise process arguments
    if ('componentPath' in argv) 
        topComponentPath = argv['componentPath'];
    
    if ('outputDirName' in argv)
        outputDirName = argv['outputDirName'];
    
    if ('componentModel' in argv)
        componentModel = argv['componentModel'];
}

// Dictionary to store quantities
var flatPartBOM = {};
var flatToolBOM = {};

function traverseParts(component) {
    for (p in component.parts) {
        var part = component.parts[p];
        
        let componentName = part.options[part.selectedOption];
        
        let selectedComponent = component.components[componentName];
        
        //console.log(selectedComponent);

        if (Object.keys(selectedComponent.parts).length === 0) {

            if (flatPartBOM.hasOwnProperty(componentName)){
                if (flatPartBOM[componentName].hasOwnProperty('quantity')){
                    flatPartBOM[componentName]['quantity'] += part.quantity;
                } else {
                    flatPartBOM[componentName]['quantity'] = part.quantity;
                };
            } else {
                flatPartBOM[componentName] = {};

                if (flatPartBOM[componentName].hasOwnProperty('quantity')){
                    flatPartBOM[componentName]['quantity'] += part.quantity;
                } else {
                    flatPartBOM[componentName]['quantity'] = part.quantity;
                };
            }
            flatPartBOM[componentName]['name'] = selectedComponent.name;
            flatPartBOM[componentName]['description'] = selectedComponent.description;
            flatPartBOM[componentName]['quantityUnits'] = part.quantityUnits;
        };
        traverseParts(selectedComponent);

    };

};



function traverseTools(component) {
    for (t in component.tools) {
        var tool = component.tools[t];
        
        //console.log(tool);

        let componentName = tool.options[tool.selectedOption];
        
        let selectedComponent = component.components[componentName];
        


        //console.log(selectedComponent);

        if (flatToolBOM.hasOwnProperty(componentName)){
            if (flatToolBOM[componentName].hasOwnProperty('quantity')){
                if (flatToolBOM[componentName]['quantity'] < tool.quantity){
                    flatToolBOM[componentName]['quantity'] = tool.quantity;
                }
            }
        } else {
                flatToolBOM[componentName] = {};
                flatToolBOM[componentName]['quantity'] = tool.quantity;
        }

        flatToolBOM[componentName]['name'] = selectedComponent.name;
        flatToolBOM[componentName]['description'] = selectedComponent.description;
        flatToolBOM[componentName]['quantityUnits'] = tool.quantityUnits;


        traverseTools(selectedComponent);

    };
    for (p in component.parts) {
        var part = component.parts[p];
        
        let componentName = part.options[part.selectedOption];
        
        let selectedComponent = component.components[componentName];

        traverseTools(selectedComponent);
    }

};



// Get model :)

var model = yaml.safeLoad(fs.readFileSync(topComponentPath + '/' + outputDirName + '/' + componentModel, 'utf8'));


traverseParts(model);
//console.log(flatPartBOM);
var flattenedPartsBOMFilePath = topComponentPath + '/' + outputDirName + '/' + flattenedPartsBOMFileName;
fs.writeFileSync(flattenedPartsBOMFilePath, yaml.safeDump(flatPartBOM));

traverseTools(model);
//console.log(flatToolBOM);
var flattenedToolsBOMFilePath = topComponentPath + '/' + outputDirName + '/' + flattenedToolsBOMFileName;
fs.writeFileSync(flattenedToolsBOMFilePath, yaml.safeDump(flatToolBOM));