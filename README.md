# ngPromiseButton

Simple angular directive for button showing progress and result of promise (eg resource request call)

## What's this?

- Adds visual feedback of progress, success or failure to button that starts async process (API request, ...)
- Disable button during processing to avoid double-requests by mistake clicking on button
- Enables you to make button that waits X seconds to cancel mistake before actually commiting request

All just with this code:

__Simple button__

```<button promise-button='yourFuncThatReturnsPromise()'>Save world</button>```

![alt text](https://raw.githubusercontent.com/DocX/ng-promise-button/master/documentation/save_world_button.gif "Example of button on page")

__Cancelable timeout button__

```<button promise-button='yourFuncThatReturnsPromise()' promise-cease-period='3'>Lunch missile</button>```

![alt text](https://raw.githubusercontent.com/DocX/ng-promise-button/master/documentation/lunch_missile_button.gif "Example of button with cancel period on page")


## Installation

Install via bower:

```bower install ng-promise-button --save```

Add script to your index.html (if not using wiredep or simillar)

```<script src='bower_components/ng-promise-button/promise_button.js'></script>```

Add module to your application module dependencies

```angular.module('YourApp', [..., 'ngPromiseButton'])...```

## Dependencies

- Uses FontAwesome classes for feedback icons
- uses CSS class '.spinner' for icons that should be animated (not included in this package)

## Usage

See #what's this ;)
