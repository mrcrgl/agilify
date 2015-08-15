'use strict';

var chai = require('chai'),
    expect = chai.expect,
    tasks = require('./tasks');

var agilify = require('../index'),
    define = agilify.define,
    Agilify = agilify.Agilify,
    AgilifyTask = agilify.AgilifyTask;

describe('Public api', function () {
    describe('agilify()', function () {
        it('returns a new task jar', function (done) {
            var jar = agilify();
            expect(jar).to.be.instanceof(Agilify);
            expect(jar.tasks).to.have.length(0);
            done();
        });

        it('returns a new task with provided task list', function (done) {
            var jar = agilify([
                define(function foo() {})
            ]);
            expect(jar).to.be.instanceof(Agilify);
            expect(jar.tasks).to.have.length(1);
            done();
        });

        it('throws an error if task list is not an Array', function (done) {
            var doIt = function () {
                agilify('string');
            };
            expect(doIt).to.throw(Error);
            done();
        });
    });

    describe('define()', function () {
        it('returns an instance of AgilifyTask', function (done) {
            var task = define('foo', [], function foo() {});
            expect(task).to.be.instanceof(AgilifyTask);
            expect(task).to.have.property('name', 'foo');
            done();
        });

        it('allows define([], fnc) for named functions', function (done) {
            var task = define([], function foo() {});
            expect(task).to.be.instanceof(AgilifyTask);
            expect(task).to.have.property('name', 'foo');
            done();
        });

        it('throws an error on define([], fnc) for unnamed functions', function (done) {
            var doIt = function () {
                define([], function () {});
            };
            expect(doIt).to.throw(Error);
            done();
        });

        it('allows define(fnc) for named functions without dependencies', function (done) {
            var task = define(function foo() {});
            expect(task).to.be.instanceof(AgilifyTask);
            expect(task).to.have.property('name', 'foo');
            done();
        });

        it('throws an error on define(fnc) for unnamed functions without dependencies', function (done) {
            var doIt = function () {
                define(function () {});
            };
            expect(doIt).to.throw(Error);
            done();
        });

        it('throws an error if task function is not provided', function (done) {
            var doIt = function () {
                define();
            };
            expect(doIt).to.throw(Error);
            done();
        });
    });
});