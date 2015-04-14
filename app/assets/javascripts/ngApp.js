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
        controller: 'PostsController',
        resolve: {
          post: ['$stateParams', 'posts', function($stateParams, posts) {
            return posts.get($stateParams.id);
          }]
        }
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

    o.get = function(id) {
      return $http.get('/posts/' + id + '.json')
        .then(function(res) {
          return res.data;
        });
    };

    o.create = function(post) {
      return $http.post('/posts.json', post)
        .success(function(data){
          o.posts.push(data);
        });
    };

    o.upvote = function(post) {
      return $http.put('/posts/' + post.id + '/upvote.json')
        .success(function(data) {
          post.upvotes += 1;
        });
    };

    o.addComment = function(id, comment) {
      return $http.post('/posts/' + id + '/comments.json', comment);
    };

    o.upvoteComment = function(post, comment) {
      return $http.put('/posts/' + post.id + '/comments/' + comment.id + '/upvote.json')
        .success(function(data) {
          comment.upvotes += 1;
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
      posts.upvote(post);
    };
  }
]);

app.controller('PostsController', [
  '$scope',
  'posts',
  'post',

  function($scope, posts, post) {
    $scope.post = post;

    $scope.addComment = function() {
      if ($scope.body === '') {
        return;
      } else {
        posts.addComment(post.id, {
          body: $scope.body,
          author: 'user',
          upvotes: 0
        }).success(function(comment) {
          $scope.post.comments.push(comment);
        });
        $scope.body = '';
      }
    };

    $scope.incrementUpvotes = function(comment) {
      posts.upvoteComment(post, comment);
    };
  }
]);
