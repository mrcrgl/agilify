'use strict';

module.exports = {
    a: function a() {
        var done = arguments[arguments.length - 1];
        setTimeout(function () {
            done(null, 'a');
        }, 100);
    },

    b: function b() {
        var done = arguments[arguments.length - 1];
        setTimeout(function () {
            done(null, 'b');
        }, 100);
    },

    c: function c() {
        var done = arguments[arguments.length - 1];
        setTimeout(function () {
            done(null, 'c');
        }, 100);
    },

    d: function d() {
        var done = arguments[arguments.length - 1];
        setTimeout(function () {
            done(null, 'd');
        }, 100);
    },

    e: function e() {
        var done = arguments[arguments.length - 1];
        setTimeout(function () {
            done(null, 'e');
        }, 100);
    },

    f: function f() {
        var done = arguments[arguments.length - 1];
        setTimeout(function () {
            done(null, 'f');
        }, 100);
    },

    g: function g() {
        var done = arguments[arguments.length - 1];
        setTimeout(function () {
            done(null, 'g');
        }, 100);
    }
};
