var path = require('path');
var fs = require('fs-extra');

const nodeDependencies = [
    '@polymer',
    '@webcomponents',
    'ptcs-behavior-binary',
    'ptcs-breadcrumb',
    'ptcs-button',
    'ptcs-carousel',
    'ptcs-chart',
    'ptcs-checkbox',
    'ptcs-collapse',
    'ptcs-data-grid',
    'ptcs-data-list',
    'ptcs-data-table',
    'ptcs-dropdown',
    'ptcs-hbar',
    'ptcs-library',
    'ptcs-menubar',
    'ptcs-page-layout',
    'ptcs-page-select',
    'ptcs-radio',
    'ptcs-tabs',
    'ptcs-textfield',
    'ptcs-toggle-button',
    'ptcs-vbar',
];

const nodeModulesPath = path.resolve('../node_modules');
const polymerComponentsPath = path.resolve('../polymer_components');
const bowerComponentsPath = path.resolve('../bower');

console.log(nodeModulesPath);
console.log(polymerComponentsPath);
console.log(bowerComponentsPath);

function copyPolymerComponents() {
    fs.readdir(polymerComponentsPath, function (error, components) {
        components.forEach(function (component) {
            componentPath = path.resolve(polymerComponentsPath + '/' + component);
            bowerPath = path.resolve(bowerComponentsPath + '/' + component);
            copyToDir(componentPath, bowerPath);
        });
    });

}

function copyToDir(source, target) {
    fs.copy(source, target)
        .then(() => console.log(source + ' copied!'))
        .catch(err => console.error(err))
}

copyPolymerComponents();