agilify 
=======

[![Build Status](https://secure.travis-ci.org/mrcrgl/agilify.png)](http://travis-ci.org/mrcrgl/agilify) [![Coverage Status](https://coveralls.io/repos/mrcrgl/agilify/badge.svg?branch=master&service=github)](https://coveralls.io/github/mrcrgl/agilify?branch=master)


## What is agilify?

`agilify` handles dependencies between tasks and resolves them in an specific tree of requirements according to 
your call.

## Quick Examples

```javascript
// register some tasks
var jar = agilify([
    define('task1', ['dep2', 'dep3'], function () { ... }),
    define('task2', ['dep1'], function () { ... }),
    define('task3', function () { ... }),
    define(function task4() { ... }),
    ...
]);

// it will resolve all deep dependencies itself
jar.run(['task1'], function (err, task1Result) {
    // your code here
});

// add tasks on the fly
jar.register(define(function anotherOne() { ... }));

```

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

# Documentation

## agilify(arrayOfTasks)

`agilify()` is a short hand method for creating a new `Agilify` instance with predefined tasks. 

### Examples

```javascript
var agilify = require('agilify'),
    define = agilify.define;

// creates an empty instance
var agilifyJar = agilify();

// with predefined tasks. The array must contain instances of `AgilifyTask`
var agilifyJar = agilify([
    define(function task1() { ... })
]);

```

## define([name], [dependencies], function)

With `define` you can create instances of `AgilifyTask` which can be applied to the task jar. Tasks must have an
unique name and a function to call. If you skip the name it will try to it from the given function. 
Tasks can have dependencies which must be fulfilled before the task can be executed.

### Examples

```javascript
// named function without dependencies
var task = define(function fncName(callback) { ... });

// set an explicit name
var task = define('explicitName', function (callback) { ... });

// function with dependencies, both lines create the same task
var task = define(fncName, ['fnc1', 'fnc2'], function (fnc1Result, fnc2Result, callback) { ... });
var task = define(['fnc1', 'fnc2'], function fncName(fnc1Result, fnc2Result, callback) { ... });
```

## Agilify object

The `Agilify` object is a container of tasks. For different types of tasks you can create instances for each.

```javascript
// load the object
var Agilify = require('agilify').Agilify;
```

### constructor([tasks])

You can set up `Agilify` immediately by passing an array of AgilifyTask instances.

#### Arguments

* `tasks` Array of AgilifyTask instances, optional.

#### Example

```javascript
var myTaskJar = new Agilify([task1, task2]);
```

### taskByName(name)

Returns a task by given name. If it doesn't match, `undefined` will be returned.

#### Arguments

* `name` Name of task to search for

#### Example

```javascript
var myTaskJar = new Agilify([task1]);
myTaskJar.taskByName('task1'); // returns task -> task1
```

### register(name, dependencies, function)

Register adds a task to your `Agilify` instance. You can call `register` in different ways:

* register(name, [dependencies], function)
* register([name], [dependencies], named function)
* register(task instance)

#### Arguments

* `name` the name of the new task or task instance
* `dependencies` list of task names, order of names specifies the order of results in your function
* `function(dep1, dep2, ..., callback)` your function to execute, list of arguments is defined by the list of dependencies plus the callback
  * `callback(err, result)` result will be passed to the dependent in current execution process

#### Examples

Ways to register a new task without dependencies
```javascript
myTaskJar.register(define(function myName(callback) { ... })); // use define to create a task and pass it to register
myTaskJar.register(function myName(callback) { ... }); // use a named function
myTaskJar.register('myName', function myName(callback) { ... }); // override the name explicit
myTaskJar.register('myName', [], function myName(callback) { ... }); // with (empty) dependencies
```

Example of passing results of dependencies
```javascript
myTaskJar.register('wait-a-second', function (callback) {
    setTimeout(function () {
        callback(null, 'A');
    }, 1000);
});

myTaskJar.register('do-something', ['wait-a-second'], function (arg1, callback) {
    // arg1 === 'A'
    callback(null, 'B');
});
```

### addTask(task)

Just only to add a task to the `Agilify` instance. It will raise an Error if a task with a given name already exits or
not a name is defined. `addTask()` is called internally when using `register()`.

#### Arguments

* `task` `AgilifyTask` instance to add

### run([dependencies], [context], fnc)

With `run()`, you can invoke an execution of some code which relies on dependencies in this jar.

Quick example
```javascript
myTaskJar.run(['do-something'], function (err, resultOfDep) {
    // your code here
});
```

#### Arguments

* `dependencies` array of task names which are required, optional but recommended :)
* `context` an object which is bound to any task function in execution. You can access the `context` in those functions via `this`, optional
* `function(err, res1, res2, ...)` your function to execute when all dependencies are fulfilled. If something went wrong in this chain, the error will be passed there, otherwise it's `null`

#### Examples

Basic example
```javascript
myTaskJar.run(['do-something'], function (err, resultOfDep) {
    // your code here
});
```

Express app middleware: Make `req` and `res` available to the tasks.
```javascript
var context = {
    req: req,
    res: res
};

myTaskJar.run(['session-data'], context, function (err, sessionData) {
    this.res.send(sessionData);
});
```

# TODO

* write proper documentation
* agilify.discover('./tasks', callback);
* debug() integration
* time measurement
* caching of generated dependency list
* check if dependency list is in theory resolvable (detect circular dependencies)
