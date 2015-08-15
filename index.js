'use strict';

var Agilify = require('./lib/agilify'),
    AgilifyTask = require('./lib/task');

function a() {
    var done = arguments[arguments.length - 1];
    setTimeout(function () {
        done(null, 300);
    }, 100);
}

function b(done) {
    setTimeout(arguments[arguments.length - 1], 100);
}

function c(done) {
    setTimeout(arguments[arguments.length - 1], 100);
}

function d(done) {
    setTimeout(arguments[arguments.length - 1], 100);
}

function e(done) {
    setTimeout(arguments[arguments.length - 1], 100);
}

function f(done) {
    setTimeout(arguments[arguments.length - 1], 100);
}

function g() {
    setTimeout(arguments[arguments.length - 1], 100);
}

var agilify = new Agilify();
agilify.register('a', ['b', 'c'], a);
agilify.register('b', ['e', 'd'], b);
agilify.register('c', ['d', 'f'], c);
agilify.register('d', [], d);
agilify.register('e', [], e);
agilify.register('f', ['g'], f);
agilify.register('g', [], g);

agilify.run(['a'], function (result) {
    console.log('done', result);
});

agilify.run(['a'], function (result) {
    console.log('done2', result);
});

/*setTimeout(function () {
    console.log(agilify.tasks.filter(function (t) {
        return t.dependenciesFulfilled();
    }).length, 'tasks not fulfilled');
}, 1000);*/

console.log('a.name', a.name);

function define(name, dependencies, fnc) {

}
