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
        name = 'string' === typeof arguments[0] && arguments[0];
        fnc = arguments[arguments.length - 1];
    }

    if (!fnc) {
        throw new Error('argument fnc is required');
    }

    var task = new AgilifyTask({
        name: name,
        dependencies: dependencies,
        fnc: fnc
    });

    if (!task.name) {
        throw new Error('AgilifyTask name is required, either a string or a named function');
    }

    return task;
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
