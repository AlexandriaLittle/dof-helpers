var yaml = require('js-yaml');
var fs   = require('fs');
var Liquid = require('liquidjs');
var engine = Liquid();

var argv = require('minimist')(process.argv.slice(2));

// declare configurable variables with default values
var topComponentPath = process.cwd();
var outputDirName = 'dist';
var componentModel = 'component.yaml'

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

// Dictionary to store counts
var flatPartBOM = {};
var flatToolBOM = {};

function traverseParts(component) {

    for (p in component.parts) {
        var part = component.parts[p];
        //console.log(part);
        //console.log(part.selectedOption);
        let selectedComponent = part.options[part.selectedOption];
        //console.log(selectedPart);
        let selectedComponentDetails = component.components[selectedComponent];
        

        //TODO add component data to flatPartBOM
        if (flatPartBOM.hasOwnProperty(selectedComponent)){
            if (flatPartBOM[selectedComponent].hasOwnProperty('count')){
                flatPartBOM[selectedComponent]['count'] += part.quantity;
            } else {
                flatPartBOM[selectedComponent]['count'] = part.quantity;
            };
        } else {
            flatPartBOM[selectedComponent] = {};

            if (flatPartBOM[selectedComponent].hasOwnProperty('count')){
                flatPartBOM[selectedComponent]['count'] += part.quantity;
            } else {
                flatPartBOM[selectedComponent]['count'] = part.quantity;
            };
        }
        
        
        
        
        //currentCount = part.quantity

        //flatPartBOM[selectedComponent].TryGetValue(count, out currentCount);
        //TODO RECURSE
    }


    //TODO add the name and description to the flatPartBOM data

}


// Get model :)

var model = yaml.safeLoad(fs.readFileSync(topComponentPath + '/' + outputDirName + '/' + componentModel, 'utf8'));


traverseParts(model);


console.log(flatPartBOM);