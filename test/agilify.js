'use strict';

var chai = require('chai'),
    expect = chai.expect,
    tasks = require('./tasks');

var Agilify = require('../lib/agilify'),
    AgilifyTask = require('../lib/task');

describe('Agilify', function () {

    describe('registers Tasks', function () {
        var agilify;

        beforeEach(function (done) {
            agilify = new Agilify();
            agilify.register('a', ['b', 'c'], tasks.a);
            agilify.register('b', ['e', 'd'], tasks.b);
            agilify.register('c', ['d', 'f'], tasks.c);
            agilify.register('d', [], tasks.d);
            agilify.register('e', [], tasks.e);
            agilify.register('f', ['g'], tasks.f);
            agilify.register('g', [], tasks.g);

            done();
        });

        it('registers given tasks', function (done) {
            expect(agilify.tasks).to.have.length(7);

            done();
        });

        it('converts tasks to {AgilifyTask}', function (done) {
            agilify.tasks.forEach(function (task) {
                expect(task).to.be.instanceof(AgilifyTask);
            });

            done();
        });

        it('accepts Task instances, too', function (done) {
            expect(agilify.tasks).to.have.length(7);
            agilify.register(new AgilifyTask({
                name: 'z',
                dependencies: [],
                fnc: function () {}
            }));
            expect(agilify.tasks).to.have.length(8);

            done();
        });

    });

    describe('taskByName', function () {
        var agilify;

        beforeEach(function (done) {
            agilify = new Agilify();
            agilify.register('a', [], tasks.a);

            done();
        });

        it('returns {AgilifyTask} by name', function (done) {
            expect(agilify.taskByName('a')).to.be.instanceof(AgilifyTask);
            expect(agilify.taskByName('a')).to.have.property('name', 'a');

            done();
        });

        it('returns undefined if task is not found', function (done) {
            expect(agilify.taskByName('not there')).to.be.undefined;

            done();
        });

    });

    describe('makeTask', function () {
        var agilify;

        beforeEach(function (done) {
            agilify = new Agilify();

            done();
        });

        it('creates an {AgilifyTask} with args (name, dependencies, fnc)', function (done) {
            var deps = [],
                task = agilify.makeTask('b', deps, function () {});
            expect(task).to.be.instanceof(AgilifyTask);
            expect(task).to.have.property('name', 'b');
            expect(task).to.have.property('dependencies', deps);
            expect(task).to.have.property('fnc');

            done();
        });

        it('uses function.name if name is not provided', function (done) {
            var deps = [],
                task = agilify.makeTask(deps, function fncName() {});
            expect(task).to.be.instanceof(AgilifyTask);
            expect(task).to.have.property('name', 'fncName');
            expect(task).to.have.property('dependencies', deps);
            expect(task).to.have.property('fnc');

            done();
        });
    });

    describe('addTask', function () {
        var agilify;

        beforeEach(function (done) {
            agilify = new Agilify();

            done();
        });

        it('adds an instance of {AgilifyTask} to task list', function (done) {
            var deps = [],
                task = agilify.makeTask('b', deps, function () {});

            agilify.addTask(task);

            expect(agilify.taskByName('b')).to.be.instanceof(AgilifyTask);
            expect(agilify.taskByName('b')).to.have.property('name', 'b');

            done();
        });

        it('throws an Error if task is already registered', function (done) {
            var deps = [],
                task = agilify.makeTask('b', deps, function () {});

            agilify.addTask(task);

            var doIt = function () {
                agilify.addTask(task);
            };

            expect(doIt).to.throw(Error);

            done();
        });

        it('throws an Error if task does not provide an name', function (done) {
            var deps = [],
                task = agilify.makeTask(deps, function () {});

            var doIt = function () {
                agilify.addTask(task);
            };

            expect(doIt).to.throw(Error);

            done();
        });
    });

    describe('taskDependencyList', function () {
        var agilify;

        beforeEach(function (done) {
            agilify = new Agilify();

            // relevant tasks
            agilify.register('a', ['b', 'c'], tasks.a);
            agilify.register('b', ['d'], tasks.b);
            agilify.register('c', ['d'], tasks.c);
            agilify.register('d', [], tasks.d);

            // unused tasks
            agilify.register('e', [], tasks.e);
            agilify.register('f', ['g'], tasks.f);
            agilify.register('g', [], tasks.g);

            done();
        });

        it('returns an Array of all direct dependency tasks', function (done) {
            var emitter = new AgilifyTask({ dependencies: ['a'], fnc: function () {} });

            var list = agilify.taskDependencyList(emitter),
                taskNames = list.map(function (t) { return t.name; });

            expect(taskNames).to.have.members(['a']);
            expect(taskNames).to.not.have.members(['e', 'f', 'g', 'b', 'c', 'd']);

            done();
        });

        it('returns an Array of all required tasks to fulfill the need', function (done) {
            var emitter = new AgilifyTask({ dependencies: ['a'], fnc: function () {} });

            var list = agilify.taskDependencyList(emitter, true),
                taskNames = list.map(function (t) { return t.name; });

            expect(taskNames).to.have.members(['a', 'b', 'c', 'd']);
            expect(taskNames).to.not.have.members(['e', 'f', 'g']);

            done();
        });

    });

    describe('run', function () {
        var agilify;

        beforeEach(function (done) {
            agilify = new Agilify();

            // relevant tasks
            agilify.register('a', ['b', 'c'], function (b, c, callback) {
                callback(null, [(this && this.plus || '') + 'a'].concat(b, c));
            });
            agilify.register('b', ['d'], function (d, callback) {
                callback(null, [(this && this.plus || '') + 'b'].concat(d));
            });
            agilify.register('c', ['d'], function (d, callback) {
                callback(null, [(this && this.plus || '') + 'c'].concat(d));
            });
            agilify.register('d', [], function (callback) {
                callback(null, [(this && this.plus || '') + 'd']);
            });

            agilify.register('err', [], function (callback) {
                callback(new Error('Dummy error'));
            });

            agilify.register('err2', [], function () {
                throw new Error('Dummy error');
            });

            agilify.register('double', [], function (callback) {
                callback();
                callback();
            });

            done();
        });

        it('dissolves the chain of tasks without an context', function (done) {
            agilify.run(['a'], function (err, a) {
                a.sort();

                expect(err).to.be.not.ok;
                expect(a).to.deep.equal(['a', 'b', 'c', 'd', 'd']);
                done();
            });
        });

        it('dissolves the chain of tasks with an context', function (done) {
            agilify.run(['a'], { plus: '+' }, function (err, a) {
                a.sort();

                expect(err).to.be.not.ok;
                expect(a).to.deep.equal(['+a', '+b', '+c', '+d', '+d']);
                expect(this.plus).to.equal('+');
                done();
            });
        });

        it('executes the emitter, even if it does not depend on something', function (done) {
            agilify.run(function (err) {

                expect(err).to.be.instanceof(Error);
                done();
            });
        });

        it('provides an error if a task reports one', function (done) {
            agilify.run(['err'], function (err) {

                expect(err).to.be.instanceof(Error);
                done();
            });
        });

        it('provides an error if a task throws one', function (done) {
            agilify.run(['err2'], function (err) {

                expect(err).to.be.instanceof(Error);
                done();
            });
        });

        it('provides an error if a task calls its callback twice', function (done) {
            agilify.run(['double'], function (err) {
                expect(err).to.be.instanceof(Error);
                done();
            });
        });

    });
});