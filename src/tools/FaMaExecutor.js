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
const fs = require("fs");
const logger = require("../logger/logger");
const globalConfig = require("../configurations/config");
var Promise = require("bluebird");
class FaMaExecutor {
    constructor(problem, option) {
        this.famaDocument = problem.famaDocument;
        this.config = problem.config;
        if (option) {
            this.option = option;
        }
    }
    execute(callback) {
        let promise = this.createMinizincFile();
        return this.executeMinizincFiles(promise, callback);
    }
    createMinizincFile() {
        const date = new Date();
        const random = Math.round(Math.random() * 1000);
        var prevThis = this;
        return new Promise(function (resolve, reject) {
            var fileName = "problem_" + date.getTime() + "_" + random;
            let folderPath = prevThis.config.folder.startsWith("./") ? prevThis.config.folder : "./" + prevThis.config.folder;
            fs.mkdir(folderPath, () => {
                fs.writeFile(folderPath + "/" + fileName + ".xml", prevThis.famaDocument, function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve({
                            fileName: fileName
                        });
                    }
                });
            });
        });
    }
    executeMinizincFiles(promise, callback, options) {
        var prevThis = this;
        promise.then(function (goalObj) {
            var bashCmd = "java -jar /bin/fama-shell.jar ./fama_files/" + goalObj.fileName + ".xml valid";
            require("child_process").exec(bashCmd, (error, stdout, stderr) => {
                if (globalConfig.executor.autoRemoveFiles) {
                    prevThis.removeFileFromPromise(goalObj);
                }
                if (callback) {
                    callback(error, stdout, stderr, prevThis.isSatisfiable(error, stdout), prevThis.famaDocument);
                }
            });
        });
    }
    removeFileFromPromise(promise) {
        let folderPath = this.config.folder.startsWith("./") ? this.config.folder : "./" + this.config.folder;
        fs.unlink(folderPath + "/" + promise.fileName + ".xml", () => {
            return true;
        });
    }
    isSatisfiable(err, sol) {
        if (err) {
            logger.info("Reasoner returned an error:", err);
        }
        return true;
    }
}
exports.default = FaMaExecutor;
