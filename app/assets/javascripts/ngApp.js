var app = angular.module('flapperNews', ['ui.router', 'templates']);

app.config([
  '$stateProvider',
  '$urlRouterProvider',

  function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: '/home.html',
        controller: 'MainController',
        resolve: {
          postPromise: ['posts', function(posts) {
            return posts.getAll();
          }]
        }
      })
      .state('posts', {
        url: '/posts/{id}',
        templateUrl: '/posts.html',
        controller: 'PostsController'
      });

    $urlRouterProvider.otherwise('home');
  }
]);

app.factory('posts', [
  '$http',
  function($http) {
    var o = {
      posts: []
    };
    o.getAll = function() {
      return $http.get('/posts.json')
        .success(function(data) {
          angular.copy(data, o.posts);
        });
    };
    o.create = function(post) {
      return $http.post('/posts.json', post)
        .success(function(data){
          o.posts.push(data);
        });
    };
    return o;
  }
]);

app.controller('MainController', [
  '$scope',
  'posts',

  function($scope, posts) {
    $scope.posts = posts.posts;

    $scope.addPost = function() {
      if (!$scope.title || $scope.title === '') {
        return;
      } else {
        posts.create({
          title: $scope.title,
          link: $scope.link,
          upvotes: 0
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

app.controller('PostsController', [
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
