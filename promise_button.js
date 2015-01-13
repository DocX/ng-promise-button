'use strict';

/**
 * @ngdoc Promise Button directive - call function that returns angular promise object, displaying progress and result of promise.
 * @name ngPromiseButton.directive:promiseButton
 * @description promise-button attribute expect function call. when button is pressed, function is called and button displays progress and result of the promise.
 * # promiseButton
 */
angular.module('ngPromiseButton', [])
  .directive('promiseButton', function ($compile, $timeout) {
    return {
      restrict: 'A',
      template: [
        '<span>',
        '<span ng-show="state != \'ceaseInterval\'" ng-transclude></span>&nbsp;',
        '<span ng-show="state == \'ceaseInterval\'">Cancel in {{ceaseIntervalSec}}s</span>',
        '<span ng-show="state == \'progress\'"><span class="spinner fa fa-refresh"></span> {{labelPending}}</span>',
        '<span ng-show="state == \'success\'"><span class="fa fa-check"></span> {{labelSuccess}}</span>',
        '<span ng-show="state == \'error\'"><span class="fa fa-times"></span> {{labelError}}</span>',
        '</span>'
        ].join(''),
      transclude:true,
      scope: {
        promiseButton: '&',
        promiseCeasePeriod: '@',
        promisePending: '@',
        promiseSuccess: '@',
        promiseError: '@',
      },
      link: function postLink(scope, element, attrs) {
        element.attr('ng-click', 'onClick()');
        element.removeAttr('promise-button');
        element.find('[ng-transclude]').removeAttr('ng-transclude');

        scope.state = 'idle';
        scope.labelPending = scope.promisePending || '';
        scope.labelSuccess = scope.promiseSuccess || 'OK!';
        scope.labelError = scope.promiseError || 'Failed!';

        var ceaseTimer = null;

        var intervalTick = function() {
          if (scope.state != 'ceaseInterval') {
            return;
          }

          scope.ceaseIntervalSec -= 1;
          if (scope.ceaseIntervalSec <= 0) {
            scope.start();
          } else {
            ceaseTimer = $timeout(intervalTick, 1000);
          }
        }

        scope.onClick = function() {
          if (scope.state == 'progress') {
            return;
          }

          if (scope.state == 'ceaseInterval') {
            scope.state = 'idle';
            $timeout.cancel(ceaseTimer);
            return;
          }

          scope.state = 'ceaseInterval';
          scope.ceaseIntervalSec = Number(scope.promiseCeasePeriod) || 0;
          scope.ceaseIntervalSec += 1;
          intervalTick();
        }

        scope.start = function() {
          if (scope.state == 'progress') {
            return;
          }

          var promise = scope.promiseButton();
          scope.state = 'progress';

          promise
          .then(function() {
            scope.state = 'success';
          })
          .catch(function() {
            scope.state = 'error';
          });
        }
        $compile(element)(scope);
      }
    };
  });
