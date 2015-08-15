'use strict';

var EventEmitter = require('events').EventEmitter,
    util = require('util');

/**
 *
 * @param options {Object} {name, dependencies, fnc}
 * @constructor
 */
function AgilifyTask(options) {
    options = options || {};

    this.name = options.name || (options.fnc.name.length > 0 ? options.fnc.name : undefined);
    this.dependencies = options.dependencies;
    this.fnc = options.fnc;

    this.reset();
}

util.inherits(AgilifyTask, EventEmitter);

AgilifyTask.prototype.reset = function () {
    this.requirements = this.dependencies.concat();
    this.results = new Array(this.dependencies.length);
};

AgilifyTask.prototype.embraceDependency = function (depName, result) {
    var depIndex = this.dependencies.indexOf(depName);
    var reqIndex = this.requirements.indexOf(depName);

    // if dependency is not registered, ignore it
    if (depIndex === -1) {
        console.warn('task ' + this.name + 'does not depend on ' + depName);
        return;
    }

    // if requirement is removed, callback is called twice
    if (reqIndex === -1) {
        throw new Error('Result callback already called for dependency: ' + depName);
    }

    // remove the element
    this.requirements.splice(reqIndex, 1);

    // add the result
    this.results[depIndex] = result;

    if (this.dependenciesFulfilled()) {
        this.emit('fulfilled');
    }
};

AgilifyTask.prototype.dependenciesFulfilled = function () {
    return this.requirements.length === 0;
};

AgilifyTask.prototype.toObject = function () {
    return {
        name: this.name,
        dependencies: this.dependencies,
        fnc: this.fnc
    };
};

AgilifyTask.prototype.clone = function () {
    return new AgilifyTask(this.toObject());
};

module.exports = AgilifyTask;
