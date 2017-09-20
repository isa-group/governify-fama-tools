const Reasoner = require('./src/model/reasoner/Reasoner').default;
const config = require('./src/configurations/config');
const api = require('./src/api/api');

module.exports = {
    Reasoner: Reasoner,
    config: config,
    api: api
};