var ngApp = angular.module('flapperNews', ['ui.router', 'templates', 'Devise']);

ngApp.config([
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
      })
      .state('login', {
        url: '/login',
        templateUrl: '/login.html',
        controller: 'AuthController',
        onEnter: ['$state', 'Auth', function($state, Auth) {
          Auth.currentUser().then(function() {
            $state.go('home');
          });
        }]
      })
      .state('register', {
        url: '/register',
        templateUrl: '/register.html',
        controller: 'AuthController',
        onEnter: ['$state', 'Auth', function($state, Auth) {
          Auth.currentUser().then(function() {
            $state.go('home');
          });
        }]
      });

    $urlRouterProvider.otherwise('home');
  }
]);

ngApp.factory('posts', [
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

ngApp.controller('NavController', [
  '$scope',
  'Auth',
  function($scope, Auth) {
    Auth.currentUser().then(function (user) {
      $scope.user = user;
    });
    $scope.signedIn = Auth.isAuthenticated;
    $scope.logout = Auth.logout;

    $scope.$on('devise:new-registration', function (e, user){
      $scope.user = user;
    });

    $scope.$on('devise:login', function (e, user){
      $scope.user = user;
    });

    $scope.$on('devise:logout', function (e, user){
      $scope.user = {};
    });
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

ngApp.controller('PostsController', [
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

ngApp.controller('AuthController', [
  '$scope',
  '$state',
  'Auth',
  function($scope, $state, Auth) {
    $scope.login = function() {
      Auth.login($scope.user).then(function() {
        $state.go('home');
      });
    };

    $scope.register = function() {
      Auth.register($scope.user).then(function() {
        console.log('Register!');
        $state.go('home');
      });
    };
  }
]);
