//import configFileTest from '../config/config-test.json';

// Use this on production
//import configFileProduction from '../config/files/config.json';

// Using this due to CI error
import configFileProduction from './config.json';
import configFileIEOProduction from './config-ieo.json';
import configTemplateFile from './config-template.json';
import configFileTest from './config-test.json';
import configTipBot from './settingsAssets.json';
import configTipBotWhitelistAddresses from './settingsAssetsWhitelistAddresses.json';

// import configFileTest from './config-test.json';

let configFile: any;
let configFileIEO: any;

if (process.env.NODE_ENV === 'test') {
    configFile = configFileProduction;
}
if (process.env.NODE_ENV === 'production') {
    configFile = configFileProduction;
}
if (process.env.NODE_ENV === 'development') {
    configFile = configFileProduction;
}

configFileIEO = configFileIEOProduction;

export { configFile, configFileIEO, configTipBot, configTipBotWhitelistAddresses, configTemplateFile };
