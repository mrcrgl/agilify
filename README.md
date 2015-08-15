agilify [![Build Status](https://secure.travis-ci.org/mrcrgl/agilify.png)](http://travis-ci.org/mrcrgl/agilify)
=======

## What is agilify?

`agilify` handles dependencies between tasks and resolves them in an specific tree of requirements according to 
your call.

## Do I need agilify?

Probably, it can

* handle different processes with changing requirements
* speedup your `middlewares` by using non blocking / parallel execution
* visualize easily your dependencies by it's structure

E.g. you have some components, let's say:

* A) connect database
* B) fetch user information (depends on A)
* C) fetch users shopping cart (depends on B)
* D) check blacklist (depends on A)
* E) check rate limit (api call, no dependency)

Most systems would execute those tasks in *series*, but task A and E, and after A has responded, B and D can executed 
in *parallel*.

# Installation

```bash
npm install agilify --save
```

# Usage

`agilify` consists of three parts, a _container_, some _tasks_ and a _runtime process_ to handle the execution.

## Simple usage example

```javascript
var agilify = require('agilify'),
    define = agilify.define;

// setup task 1
var dependencyA = define(function dependencyA(callback) {
    // my stuff here
    callback(err, result);
});

// setup task 2 which depends on 1
var myTask = define('myTaskName', ['dependencyA'], function (resultOfDepA, callback) {
    // my stuff here
    callback(err, result);
});

// register them in a jar
var taskJar = agilify([
    dependencyA,
    myTask
]);

// now you can start calls
taskJar.run(['myTaskName'], function (err, myTasResult) {
    // this will resolve the dependency chain (executes both tasks in the right order)
});

```

# TODO

* write proper documentation
* agilify.discover('./tasks', callback);
* debug() integration
* time measurement
* caching of generated dependency list
* check if dependency list is in theory resolvable (detect circular dependencies)
