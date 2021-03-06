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


import Problem from "./Problem";

export default class Reasoner {

    private _config: any;

    constructor(config: any) {
        this._config = config;
    }

    get config() {
        return this._config;
    }

    set config(config: any) {
        this._config = config;
    }

    /**
     * Solve a FaMa problem and return string solution
     */
    solve(famaDocument: string, callback: () => void) {
        let problem: Problem = new Problem(famaDocument, this.config);
        problem.getSolution(callback);
    }
}