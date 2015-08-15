'use strict';

var AgilifyTask = require('./task'),
    AgilifyProcess = require('./process'),
    EventEmitter = require('events').EventEmitter,
    util = require('util'),
    arrayConcat = Array.prototype.concat;

/**
 *
 * @constructor
 */
function Agilify(tasks) {
    this.tasks = [];

    if (tasks) {
        tasks.forEach(this.register.bind(this));
    }
}

util.inherits(Agilify, EventEmitter);

/**
 *
 * @param name
 * @returns {AgilifyTask}
 */
Agilify.prototype.taskByName = function (name) {
    return this.tasks.filter(function (t) { return t.name === name; })[0];
};

/**
 *
 * .register({AgilifyTask});
 * .register('taskName', [deps], function);
 *
 * @param name          {String|AgilifyTask} Even a name or an instance of AgilifyTask
 * @param dependencies  {Array}              Array of dependencies, not required if name is an instance
 * @param fnc           {Function}           Function to call, not required if name is an instance
 */
Agilify.prototype.register = function (name, dependencies, fnc) {
    var task;

    if (name instanceof AgilifyTask) {
        task = name;
    } else {
        task = this.makeTask(name, dependencies, fnc);
    }

    this.addTask(task);
};

/**
 *
 * @param task
 */
Agilify.prototype.addTask = function (task) {
    if ('string' !== typeof task.name) {
        throw new Error('Cannot register unnamed tasks');
    }

    if (this.taskByName(task.name)) {
        throw new Error('Task already registered: ' + task.name);
    }

    this.tasks.push(task);
};

/**
 *
 * @param [name]
 * @param dependencies
 * @param fnc
 * @returns {AgilifyTask}
 */
Agilify.prototype.makeTask = function (name, dependencies, fnc) {
    if (arguments.length === 2) {
        name = null;
        dependencies = arguments[0];
        fnc = arguments[1];
    }

    return new AgilifyTask({
        name: name,
        dependencies: dependencies,
        fnc: fnc
    });
};

/**
 *
 * @param fromTask
 * @param deep
 * @returns {*}
 */
Agilify.prototype.taskDependencyList = function (fromTask, deep) {
    var dependents = fromTask.dependencies.map(this.taskByName.bind(this));

    if (!deep) {
        return dependents;
    }

    dependents = arrayConcat.apply(dependents, dependents.map(function (d) {
        return this.taskDependencyList(d, deep);
    }.bind(this)));

    return dependents.filter(function (leave, i) {
        return dependents.indexOf(leave) === i;
    });
};

/**
 *
 * @param [dependencies]
 * @param [context]
 * @param fnc
 */
Agilify.prototype.run = function (dependencies, context, fnc) {
    if (arguments.length !== 3) {
        dependencies = Array.isArray(dependencies) && dependencies || [];
        context = !Array.isArray(arguments[0]) ? arguments[0] : null;
        fnc = arguments[arguments.length - 1];
    }

    var task = this.makeTask(null, dependencies, fnc),
        deepList = this.taskDependencyList(task, true);

    var opts = {
        emitter: task,
        dependencyChain: deepList.map(function (d) { return d.clone(); }),
        context: context
    };

    var p = new AgilifyProcess(opts);
    p.dissolve();

    return p;
};

module.exports = Agilify;
