'use strict';

var AgilifyTask = require('./task'),
    EventEmitter = require('events').EventEmitter,
    util = require('util');

/**
 *
 * @param options {Object} {emitter, dependencyChain, context}
 * @constructor
 */
function AgilifyProcess(options) {
    options = options || {};

    this.emitter = options.emitter;
    this.dependencyChain = options.dependencyChain;
    this.context = options.context || {};

    this.initialize();
}

util.inherits(AgilifyProcess, EventEmitter);

/**
 *
 */
AgilifyProcess.prototype.initialize = function () {
    this.bindTask(this.dependencyChain);
    this.bindTask(this.emitter);

    this.on('task fulfilled', this.runTask.bind(this));
    this.once('error', function (err) {
        // send error
        this.emitter.fnc.call(this.context, err);
    }.bind(this));
};

/**
 *
 * @param task
 */
AgilifyProcess.prototype.runTask = function (task) {
    setImmediate(function () {
        var args = task.results;

        if (task === this.emitter) {
            // prepend null if this is the emitter to fulfill the (err, ...) callback pattern
            args = [null].concat(args);
        } else {
            args.push(this.makeCallback(task));
        }

        try {
            task.fnc.apply(this.context, args);
        } catch(err) {
            this.emit('error', err);
        }
    }.bind(this));
};

/**
 *
 * @param task
 * @returns {Function}
 */
AgilifyProcess.prototype.makeCallback = function (task) {
    var emit = this.emit.bind(this);

    return function taskCallback(err, result) {
        if (err) {
            return emit('error', err);
        }

        emit('task responded', task, result);
        emit('task responded ' + task.name, task, result);
    };
};

/**
 * Allow multiple .on() calls at once.
 *
 * @param events
 * @param fnc
 */
AgilifyProcess.prototype.ons = function (events, fnc) {
    events.forEach(function (e) {
        this.on(e, fnc);
    }.bind(this));
};

/**
 * Bind some events to get information about task fulfillment etc.
 *
 * @param task
 */
AgilifyProcess.prototype.bindTask = function (task) {
    if (Array.isArray(task)) {
        return task.forEach(this.bindTask.bind(this));
    }

    task.on('fulfilled', function () {
        this.emit('task fulfilled', task);
    }.bind(this));

    this.ons(task.dependencies.map(function (d) { return 'task responded ' + d; }), function (dep, result) {
        task.embraceDependency(dep.name, result);
    });
};

/**
 * Get list of tasks which does not have any dependencies.
 *
 * @returns {Array}
 */
AgilifyProcess.prototype.outerLeaves = function () {
    return this.dependencyChain.filter(AgilifyTask.filterIsFulfilled);
};

/**
 * Start tasks which does not depend on something. The rest will emit automatically.
 */
AgilifyProcess.prototype.dissolve = function () {
    var outerLeaves = this.outerLeaves();

    if (!outerLeaves.length) {
        this.runTask(this.emitter);
    } else {
        outerLeaves.forEach(this.runTask.bind(this));
    }
};

module.exports = AgilifyProcess;
