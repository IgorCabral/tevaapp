'use strict'
angular.module('teva.directives', [])

.directive('starRating', function() {
  return {

    restrict: 'A',
    template: '<ul class="rating">' + ' <li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)">' + '  <i class="ion-star"></i>' + ' </li>' + '</ul>',
    scope: {
      ratingValue: '=',
      max: '=',
      onRatingSelected: '&'
    },

    link: function(scope, elem, attrs) {
      console.log('link');
      var updateStars = function() {
        console.log('updateStars');
        scope.stars = [];
        for (var i = 0; i < scope.max; i++) {
          console.log('i:'+i);
          scope.stars.push({
            filled: i < scope.ratingValue
          });
          if (scope.ratingValue == 0)
          {

          }
        }
      };

      scope.toggle = function(index) {
        scope.ratingValue = index + 1;
        scope.onRatingSelected({
          rating: index + 1
        });
      };

      scope.$watch('ratingValue',
        function(oldVal, newVal) {
          if (newVal) {
            updateStars();
          }
        }
      );
    }
  };

});
