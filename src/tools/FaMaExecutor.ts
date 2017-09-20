/*!
governify-fama-tools 0.0.1, built on: 2017-09-20
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


import Problem from "../model/reasoner/Problem";

const fs = require("fs");
const logger = require("../logger/logger");
const globalConfig = require("../configurations/config");
var Promise = require("bluebird");

export default class FaMaExecutor {

    famaDocument: any;
    config: any;
    option: string;

    constructor(problem: Problem, option?: string) {
        this.famaDocument = problem.famaDocument;
        this.config = problem.config;

        if (option) {
            this.option = option;
        }
    }

    execute(callback: () => void) {
        let promise = this.createMinizincFile();
        return this.executeMinizincFiles(promise, callback);
    }

    /**
     * Obtain a promise that creates a MiniZinc problem file.
     */
    private createMinizincFile(): typeof Promise {

        // Specify minizinc file name
        const date = new Date();
        const random = Math.round(Math.random() * 1000);
        var prevThis = this;

        return new Promise(function (resolve: any, reject: any) {

            // Create MiniZinc files
            var fileName = "problem_" + date.getTime() + "_" + random;
            let folderPath = prevThis.config.folder.startsWith("./") ? prevThis.config.folder : "./" + prevThis.config.folder;

            fs.mkdir(folderPath, () => {
                fs.writeFile(folderPath + "/" + fileName + ".xml", prevThis.famaDocument, function (err: any) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            fileName: fileName
                        });
                    }
                });
            });

        });

    }

    /**
     * Execute Minizinc files
     */
    private executeMinizincFiles(promise: typeof Promise,
        callback: (error: any, stdout: string, stderr: string, isSatisfiable: boolean, document: string) => void, options?: {}) {

        var prevThis = this;

        promise.then(function (goalObj: any) {

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

    private removeFileFromPromise(promise: any) {

        let folderPath = this.config.folder.startsWith("./") ? this.config.folder : "./" + this.config.folder;

        fs.unlink(folderPath + "/" + promise.fileName + ".xml", () => {
            return true;
        });

    }

    private isSatisfiable(err: any, sol: any): boolean {

        if (err) {
            logger.info("Reasoner returned an error:", err);
        }

        // return (typeof sol === "string" && sol.indexOf("----------") !== -1) ||
        //     (typeof sol === "object" && sol.status === "OK" && sol.message.indexOf("----------") !== -1);

        return true;

    }

}