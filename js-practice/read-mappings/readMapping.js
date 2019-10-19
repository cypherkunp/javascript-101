var typeFieldsFileName = {};
var jsonMappings;
var mappings;

mappings = require('./mappings/requirementTypes.json');
extractMappingFieldFiles(mappings, typeFieldsFileName);

function extractMappingFieldFiles(mappings, typeFieldsFileName) {
  // Fetch the configured documents and their field mapping file names
  for (typeKey in mappings) {
    typeFieldsFileName[typeKey] = require('./mappings/' + mappings[typeKey]);
  }
}
console.log(typeFieldsFileName);
