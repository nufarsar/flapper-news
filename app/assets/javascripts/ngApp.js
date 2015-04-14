var ngApp = angular.module('flapperNews', ['ui.router', 'templates']);

ngApp.config([
  '$stateProvider',
  '$urlRouterProvider',

  function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: 'home/_home.html',
        controller: 'MainController'
      })
      .state('posts', {
        url: '/posts/{id}',
        templateUrl: 'posts/_posts.html',
        controller: 'PostsController'
      });

    $urlRouterProvider.otherwise('home');
  }
]);

ngApp.factory('posts', [
  function() {
    var o = {
      posts: []
    };
    return o;
  }
]);

ngApp.controller('MainController', [
  '$scope',
  'posts',

  function($scope, posts) {
    $scope.posts = posts.posts;

    $scope.addPost = function() {
      if (!$scope.title || $scope.title === '') {
        return;
      } else {
        $scope.posts.push({
          title: $scope.title,
          link: $scope.link,
          upvotes: 0,
          comments: [
            { author: 'Joe', body: 'Cool post!', upvotes: 0 },
            { author: 'Bob', body: 'Bad post!',  upvotes: 0 }
          ]
        });
        $scope.title = '';
        $scope.link = '';
      }
    };

    $scope.incrementUpvotes = function(post) {
      post.upvotes += 1;
    };
  }
]);

ngApp.controller('PostsController', [
  '$scope',
  '$stateParams',
  'posts',

  function($scope, $stateParams, posts) {
    $scope.post = posts.posts[$stateParams.id];

    $scope.addComment = function() {
      if ($scope.body === '') {
        return;
      } else {
        $scope.post.comments.push({
          body: $scope.body,
          author: 'user',
          upvotes: 0
        });
        $scope.body = '';
      }
    };

    $scope.incrementUpvotes = function(post) {
      post.upvotes += 1;
    };
  }
]);
