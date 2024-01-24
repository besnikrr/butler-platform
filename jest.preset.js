const nxPreset = require('@nrwl/jest/preset');

let presets = { ...nxPreset };

if (process.env.STAGE !== 'local') {
    presets = {
        ...presets,
    }
};

module.exports = presets;
