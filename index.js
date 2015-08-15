'use strict';

var Agilify = require('./lib/agilify'),
    AgilifyTask = require('./lib/task'),
    AgilifyProcess = require('./lib/process');

/**
 *
 * @param [name]         {String}        Name of Task, defaults to function.name
 * @param [dependencies] {Array<String>} List of dependency names
 * @param fnc            {Function}      Function to call
 * @returns {AgilifyTask}
 */
function define(name, dependencies, fnc) {
    if (arguments.length !== 3) {
        dependencies = Array.isArray(dependencies) && dependencies || [];
        name = !Array.isArray(arguments[0]) && arguments[0];
        fnc = arguments[arguments.length - 1];
    }

    return new AgilifyTask({
        name: name,
        dependencies: dependencies,
        fnc: fnc
    });
}

/**
 * Get a new agilify task jar
 *
 * @param [tasks] {Array<AgilifyTask>}
 * @returns {Agilify}
 */
function agilify(tasks) {
    if (tasks && !Array.isArray(tasks)) {
        throw new Error('expected array task list');
    }

    return new Agilify(tasks);
}

agilify.define = define;
agilify.Agilify = Agilify;
agilify.AgilifyTask = AgilifyTask;
agilify.AgilifyProcess = AgilifyProcess;

module.exports = agilify;
