'use strict';

/**
 * @ngdoc Promise Button directive - call function that returns angular promise object, displaying progress and result of promise.
 * @name ngPromiseButton.directive:promiseButton
 * @description promise-button attribute expect function call. when button is pressed, function is called and button displays progress and result of the promise.
 * # promiseButton
 * 
 * Addded functionality:
 *  handle ngResource promise and null/empty promises
 *  attribute to submit form - if a promise is supplied the button turns into type="submit"
 *  attributes for button success/error class - defaults to btn-success/btn-danger
 *  attribute to revert to original class after revert period
 *  classes for span elements & use fa-spin class
 *  added dependency injection annotations
 */
angular.module('ngPromiseButton', [])
  .directive('promiseButton', ['$compile', '$timeout' , function ($compile, $timeout) {
    return {
      restrict: 'A',
      template: [
        '<span>',
        '<span class="promise-button-idle" ng-show="state != \'ceaseInterval\'" ng-transclude></span>&nbsp;',
        '<span class="promise-button-countdown" ng-show="state == \'ceaseInterval\'">Cancel in {{ceaseIntervalSec}}s</span>',
        '<span class="promise-button-progress" ng-show="state == \'progress\'"><span class="fa fa-refresh fa-spin"></span> {{labelPending}}</span>',
        '<span class="promise-button-success" ng-show="state == \'success\'"><span class="fa fa-check"></span> {{labelSuccess}}</span>',
        '<span class="promise-button-error" ng-show="state == \'error\'"><span class="fa fa-times"></span> {{labelError}}</span>',
        '</span>'
        ].join(''),
      transclude:true,
      scope: {
        promiseButton: '&',
        promiseCeasePeriod: '@',
        promisePending: '@',
        promiseSuccess: '@',
        promiseError: '@',
        promiseRevert: '@',	// revert attribute
        promiseSuccessClass: '@',	// success class attribute
        promiseErrorClass: '@',	// error class attribute
        promiseSubmit: '@',	 // submit form attribute
      },
      link: function postLink(scope, element, attrs) {
        element.attr('ng-click', 'onClick()');
        element.removeAttr('promise-button');
        element.find('[ng-transclude]').removeAttr('ng-transclude');		

        // store whether to revert
        var revert= scope.promiseRevert == 'none' ? false : true
        
        scope.state = 'idle';
        scope.labelPending = scope.promisePending || '';
        scope.labelSuccess = scope.promiseSuccess || '';
        scope.labelError = scope.promiseError || 'Failed';
        scope.revert = Number(scope.promiseRevert) || 4000;	// revert attribute
        scope.successClass = scope.promiseSuccessClass != null || scope.promiseSuccessClass == "none" ? scope.promiseSuccessClass : 'btn-success';	// success class attribute
        scope.errorClass = scope.promiseErrorClass != null || scope.promiseErrorClass == "none" ? scope.promiseErrorClass : 'btn-danger';	// success class attribute
        
        var ceaseTimer = null;
		
    		// only show cancel if there's cease-period attribute
    		var ceaseButton = scope.promiseCeasePeriod ? true : false;
    		
    		// change button to type="submit" if there's submit attribute
    		var submit= scope.promiseSubmit == 'true' ? true: false;
        
        var intervalTick = function() {
          if (ceaseButton && scope.state != 'ceaseInterval') {
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

    		  if(ceaseButton){
    			scope.state = 'ceaseInterval';
    		  }
    		  scope.ceaseIntervalSec = Number(scope.promiseCeasePeriod) || 0;
    		  scope.ceaseIntervalSec += 1;
    		  intervalTick(); 
        }

        scope.start = function() {
          if (scope.state == 'progress') {
            return;
          }

          var promise = scope.promiseButton();
    		  if(promise){
    			
    			promise = promise.$promise ? promise.$promise : promise; // handle ngResource
    			if(submit){	element.attr('type', 'submit'); }
    			
    			scope.state = 'progress';
    			
    			// check if success/error classes are already applied
    			var originalClass= {};
    			originalClass.success= element.hasClass(scope.successClass) ? true : false;
    			originalClass.error= element.hasClass(scope.errorClass) ? true : false;
    			
    			promise
      			.then(function() {
      			  scope.state = 'success';	
      			  
      			  // remove error class & add success class
      			  element.removeClass(scope.errorClass);
      			  element.addClass(scope.successClass);
      			  element[0].blur();
      			  
      			  // revert to orginal class
      			  if(revert){
        			  $timeout(function() {
          				scope.state = 'idle';
          				if(originalClass.error)  element.addClass(scope.errorClass);
          				if(!originalClass.success)  element.removeClass(scope.successClass);
        			  }, scope.revert);  
      			  }
      			})
      			.catch(function() {
      			  scope.state = 'error';
      			  
      			  // remove success class & add error class
      			  element.removeClass(scope.successClass);
      			  element.addClass(scope.errorClass);
      			  element[0].blur();

      			  // revert to orginal class
      			  if(revert){
        			  $timeout(function() {
          				scope.state = 'idle';
          				if(originalClass.success)  element.addClass(scope.successClass);
          				if(!originalClass.error)  element.removeClass(scope.errorClass);
        			  }, scope.revert);
      			  }
      			})
    		  }
        }
        $compile(element)(scope);
      }
    };
  }]);
