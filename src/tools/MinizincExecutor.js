/*!
governify-csp-tools 0.3.6, built on: 2017-09-11
Copyright (C) 2017 ISA group
http://www.isa.us.es/
https://github.com/isa-group/governify-csp-tools

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
const CSPModelMinizincTranslator_1 = require("../translator/CSPModelMinizincTranslator");
const fs = require("fs");
const logger = require("../logger/logger");
const globalConfig = require("../configurations/config");
var Promise = require("bluebird");
class MinizincExecutor {
    constructor(problem, option) {
        if (typeof problem.model === "object") {
            this.mznDocument = new CSPModelMinizincTranslator_1.default(problem.model).translate();
        }
        else {
            this.mznDocument = problem.model;
        }
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
                fs.writeFile(folderPath + "/" + fileName + ".xml", prevThis.mznDocument, function (err) {
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
            var bashCmd = "java -jar E:\\Downloads\\FamaSimpleConsole\\FamaSimpleConsole\\FaMaSimpleConsole.jar ./fama_files/" + goalObj.fileName + ".xml valid";
            require("child_process").exec(bashCmd, (error, stdout, stderr) => {
                if (globalConfig.executor.autoRemoveFiles) {
                    prevThis.removeFileFromPromise(goalObj);
                }
                if (callback) {
                    callback(error, stdout, stderr, prevThis.isSatisfiable(error, stdout), prevThis.mznDocument);
                }
            });
        });
    }
    removeFileFromPromise(promise) {
    }
    getMinizincCmd(goalObj, options) {
        var bashCmd = "";
        var prevThis = this;
        if (bashCmd !== "") {
            bashCmd += " && ";
        }
        var echoTitle = (options && typeof options === "object" && "addEchoGoal" in options && options["addEchoGoal"] === false) ?
            "echo \'" + goalObj.goal + ":\''" : echoTitle = "";
        let folderPath = prevThis.config.folder.startsWith("./") ? prevThis.config.folder : "./" + prevThis.config.folder;
        let mzn2fznCmd = "mzn2fzn " + folderPath + "/" + goalObj.fileName + ".mzn";
        let fznGecodeCmd = "fzn-gecode " + folderPath + "/" + goalObj.fileName + ".fzn";
        let oznCmd = "solns2out --search-complete-msg \'\' " + folderPath + "/" + goalObj.fileName + ".ozn";
        let grepFilterBlankLines = " | grep -v \'^$\'";
        if (/^win/.test(process.platform)) {
            grepFilterBlankLines = "";
        }
        if (echoTitle !== "") {
            bashCmd += echoTitle + " && " + mzn2fznCmd + " && " + fznGecodeCmd + " | " + oznCmd + grepFilterBlankLines;
        }
        else {
            bashCmd += mzn2fznCmd + " && " + fznGecodeCmd + " | " + oznCmd + grepFilterBlankLines;
        }
        return bashCmd;
    }
    isSatisfiable(err, sol) {
        if (err) {
            logger.info("Reasoner returned an error:", err);
        }
        return true;
    }
}
exports.default = MinizincExecutor;
