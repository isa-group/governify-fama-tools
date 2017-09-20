/*!
governify-fama-tools 0.3.6, built on: 2017-09-20
Copyright (C) 2017 ISA group
http://www.isa.us.es/
https://github.com/isa-group/governify-fama-tools

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.*/
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FaMaExecutor_1 = require("../../tools/FaMaExecutor");
const logger = require("../../logger/logger");
var request = require("request");
var yaml = require("js-yaml");
class Problem {
    constructor(famaDocument, config) {
        this.famaDocument = famaDocument;
        this.config = config;
    }
    getSolution(callback) {
        if (this.config.type === "api") {
            this.getRemoteSolution(callback);
        }
        else if (this.config.type === "local") {
            this.getLocalSolution(callback);
        }
        else if (this.config.type === "docker") {
            this.getDockerSolution(callback);
        }
        else {
            throw "Unable to get solution for undefined reasoner type. Please, specify reasoner.type \"api\" or \"local\"";
        }
    }
    getLocalSolution(callback) {
        console.log("Executing on local");
        new FaMaExecutor_1.default(this).execute(callback);
    }
    getDockerSolution(callback) {
        console.log("Executing on docker");
        new FaMaExecutor_1.default(this, "docker").execute(callback);
    }
    getRemoteSolution(callback) {
        console.log("Executing on remote");
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
        request({
            url: this.config.api.server + "/api/" + this.config.api.version + "/" + this.config.api.operationPath,
            method: "POST",
            json: [{
                    content: this.famaDocument
                }]
        }, (error, res, body) => {
            process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "1";
            if (error) {
                logger.error(error);
            }
            callback(error || body.error, body.stdout, body.stderr, body.isSatisfiable, body.document);
        });
    }
}
exports.default = Problem;
