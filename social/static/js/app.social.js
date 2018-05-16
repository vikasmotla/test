var app = angular.module('app', ['ui.router', 'ui.bootstrap', 'ngSanitize', 'ngAside', 'ngDraggable', 'flash', 'ngTagsInput', 'mwl.confirm', 'ngAudio', 'uiSwitch']);

app.config(function($stateProvider, $urlRouterProvider, $httpProvider, $provide) {

  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;


});

app.run(['$rootScope', '$state', '$stateParams', '$permissions', function($rootScope, $state, $stateParams, $permissions) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  $rootScope.$on("$stateChangeError", console.log.bind(console));
}]);

app.controller("main", function($scope, $state,$http,$sce, Flash,$users,$uibModal) {


  $scope.me = $users.get('mySelf');

  $scope.fetchAllPosts = function() {
    $scope.posts = [];
    $http({
      method: 'GET',
      url: '/api/social/post/',
    }).
    then(function(response) {
      $scope.posts = response.data;
      for (var i = 0; i < $scope.posts.length; i++) {
        $scope.posts[i].txt = $sce.getTrustedHtml($scope.posts[i].txt);
        for (var j = 0; j < $scope.posts[i].comments.length; j++) {
          $scope.posts[i].comments[j].txt = $sce.getTrustedHtml($scope.posts[i].comments[j].txt);
        }
        $scope.posts[i].podtEditComments = {
          txt: '',
          file: emptyFile,
          parent:$scope.posts[i].pk
        }

      }
    });
    console.log($scope.posts);
  };
  $scope.fetchAllPosts();

  $scope.postData = {
    txt: '',
    file: emptyFile,
    parent : 0
  }
  $scope.postConfig = {
    expansion: true,
    placeholder: 'Post Your Requirement Here...'
  }

  $scope.sendPost = function() {
    console.log('dataaaaaaaaaaaaaaaa', $scope.postData, $scope.postData.file.name, typeof $scope.postData.file);
    if (($scope.postData.txt == '' || $scope.postData.txt.length == 0 || $scope.postData.txt == '<br>') && ($scope.postData.file == emptyFile)) {
      console.log('emptyyyyyyyyyyyy');
      Flash.create('warning', 'Please Mention Some Post')
      return
    }

    var postData = {txt : $scope.postData.txt}
    $http({
      method: "POST",
      url: '/api/social/post/',
      data: postData
    }).
    then(function(response) {
      console.log('resssssss',response.data);
      $scope.posts.splice(0,0,response.data)
      $scope.posts[0].txt = $sce.getTrustedHtml($scope.posts[0].txt)
      $scope.postData.txt = ''

      if ($scope.postData.file != emptyFile){
        var posatMediaData = new FormData();
        posatMediaData.append('parent' , response.data.pk);
        posatMediaData.append('fil' , $scope.postData.file);
        $http({
          method: "POST",
          url: '/api/social/postMedia/',
          data: posatMediaData,
          transformRequest: angular.identity,
          headers: {'Content-Type': undefined}
        }).
        then(function(response) {
          console.log('resssssss',response.data);
          Flash.create('success', 'Posted Successfully')
          $scope.posts[0].mediaPost = [response.data];
          $scope.postData = {
            txt: '',
            file: emptyFile
          }
        });
      }
    });

  };

  // $scope.postCommentData = {
  //   txt: '',
  //   file: emptyFile
  // }
  $scope.postCommentConfig = {
    expansion: true,
    placeholder: 'Post Your Requirement Here...'
  }

  $scope.postComment = function(parent) {
    console.log('dataaaaaaaaaaaaaaaa', parent);
    for (var i = 0; i < $scope.posts.length; i++) {
      console.log(i);
      if ($scope.posts[i].pk == parent) {
        console.log('yesssssssssssss');
        if (($scope.posts[i].podtEditComments.txt == '' || $scope.posts[i].podtEditComments.txt.length == 0 || $scope.posts[i].podtEditComments.txt == '<br>') && ($scope.posts[i].podtEditComments.file == emptyFile)) {
          console.log('emptyyyyyyyyyyyy');
          Flash.create('warning', 'Please Write Some Comment')
          return
        }

        var fd = new FormData();
        if ($scope.posts[i].podtEditComments.txt != '' || $scope.posts[i].podtEditComments.txt.length != 0 || $scope.posts[i].podtEditComments.txt != '<br>'){
          fd.append('txt' , $scope.posts[i].podtEditComments.txt);
        }
        if ($scope.posts[i].podtEditComments.file != emptyFile){
          fd.append('fil' , $scope.posts[i].podtEditComments.file);
        }
        fd.append('parent' , parent);

        $http({
          method: 'POST',
          data: fd,
          url: '/api/social/postComment/',
          transformRequest: angular.identity, headers: {'Content-Type': undefined}
        }).
        then(function(i) {
          return function(response){
            console.log('commmmmmm',response.data);
            $scope.posts[i].podtEditComments = {
              txt: '',
              file: emptyFile,
              parent:$scope.posts[i].pk
            }
            $scope.posts[i].comments.push(response.data)
          }
        }(i))
      }
    }

  };


  // $scope.fileName;
  // $scope.fileSize = 0;
  $scope.showComments = false;
  $scope.allComments = function(indx) {
    $scope.posts[indx].showComments = !$scope.posts[indx].showComments
  }

  $scope.expandImage = function(imageUrl) {
    console.log('dddddddddddddd', imageUrl);
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.social.expandImage.html',
      size: 'md',
      backdrop: true,
      resolve: {
        data: function() {
          return imageUrl;
        }
      },
      controller: "app.social.expandImage",

    }).result.then(function() {
      console.log('here...');
    }, function() {

    });
  }



});
app.controller("app.social.expandImage", function($scope, $rootScope, data, $state, $uibModal, $uibModalInstance) {
  console.log('modal img ctrl');
  $scope.imageUrl = data;
})
