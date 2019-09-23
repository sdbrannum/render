/* eslint-disable no-console */
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const process = require('process');
const libConfig = require('../lib');
const packageConfig = require('../package');
const _ = require('lodash');
const parseComponent = require('@vue/component-compiler-utils').parse;

// Update the index file
console.info('Building entry point');
require('./build-entry');

// Get the names of all components in the src directory by folder name
const componentNames = require('./component-names');

fs.emptyDirSync(getPath('../packages'));
fs.emptyDirSync(getPath('../dist'));

// Build the main lib, with all components packaged into a plugin
console.info('Building main library');
execSync('rollup --config build/rollup.config.js');

// TODO: generate this package.json so we can leave the dev dependencies and other fluff out
console.info('Genearting package.json for main library');
fs.writeFileSync(
    path.resolve('dist/renderless/package.json'),
    generatePackageJson(packageConfig)
);

console.info('Copying license for main library');
copyLicense('./dist/renderless');

console.info('Copying readme for main library');
copyReadme('./', 'dist/renderless');

// // Rename the CommonJS build so that it can be imported with
// // ${libConfig}/dist
// renameIndex();

// // For each component in the src directory...
for (const componentName of componentNames) {
    // Build the component individually
    console.info(`🏗 Building ${componentName}`);
    const componentKebabCased = _.kebabCase(componentName);
    const packageName = _.compact([libConfig.name, componentKebabCased]).join(
        '.'
    );

    execSync(
        `rollup --config src/components/${componentName}/rollup.config.js`
    );

    const destPackageFolder = path.resolve(
        __dirname,
        `../dist/renderless/${componentKebabCased}`
    );

    // console.log('destPackageFolder', destPackageFolder);
    // // write package.json
    // const packageConfig = {
    //     name: componentKebabCased,
    //     moduleName: componentName || _.upperFirst(_.camelCase(packageName)),
    //     description: libConfig.packages[componentKebabCased].description,
    //     // example,
    // };

    console.info(`Writing package.json for ${componentKebabCased}`);
    fs.writeFileSync(
        path.resolve(destPackageFolder, 'package.json'),
        generatePackageJson(packageConfig)
    );

    // copy readme
    console.info(`Writing readme for ${packageConfig.moduleName}`);
    copyReadme(`src/components/${componentName}`, destPackageFolder);

    // write license
    console.info(`Adding license for ${packageConfig.moduleName}`);
    copyLicense(destPackageFolder);

    // build package
    // console.info(`Building package for ${packageConfig.moduleName}`);
    // process.chdir(`./packages/${packageName}`);
    // execSync(`npm pack`);
    // process.chdir('../../');

    // Rename the CommonJS build so that it can be imported with
    // ${libConfig}/dist/ComponentName
    // renameIndex(componentName);
}

// build the package
console.info('Packing library');
process.chdir(`./dist/renderless`);
execSync(`npm pack`);
process.chdir('../../');
// move the package to packages
const tgz = fs
    .readdirSync('./dist/renderless')
    .filter(fn => fn.endsWith('.tgz'))[0];

fs.moveSync(`./dist/renderless/${tgz}`, `./packages/${tgz}`);

function copyLicense(destination) {
    fs.copySync(getPath('../LICENSE'), path.resolve(destination, 'LICENSE'));
}

function copyReadme(source, destination) {
    fs.copySync(
        path.resolve(source, 'README.md'),
        path.resolve(destination, 'README.md')
    );
}

function copyFile(source, destination, file) {
    fs.copySync(path.resolve(source, file), path.resolve(destination, file));
}

function generatePackageJson(package) {
    return JSON.stringify(
        {
            name: package.name,
            description: package.description,
            author: package.author,
            version: package.version,
            license: package.license,
            homepage: package.homepage,
            repository: package.repository,
            bugs: package.bugs,
            module: 'index.esm.js',
            main: 'index.umd.js',
            unpkg: 'index.min.js',
            jsdelivr: 'index.min.js',
            peerDependencies: {
                vue: '>=2.0.0',
            },
        },
        null,
        2
    );
}

function getPath(...args) {
    return path.resolve(__dirname, ...args);
}
