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

app.controller("main", function($scope , $state, $uibModal) {

  $scope.postEdit = {txt : '' , file : emptyFile}
  $scope.configPost ={expansion: true , placeholder: 'Post here...'}

  $scope.addPost = function() {
    console.log("outside the directive, post");
  }

  $scope.commenEdit = {txt : '' , file : emptyFile}
  $scope.config = {expansion: true , placeholder: 'Type your comment here...'}

  $scope.addComment = function() {
    console.log("outside the directive, comment");
  }


  // $scope.fileName;
  // $scope.fileSize = 0;
  $scope.showComments = false;

  $scope.allComments = function() {
    if ($scope.showComments == false) {
      $scope.showComments = true;
    } else {
      $scope.showComments = false;
    }

  }

  $scope.expandImage = function(imageUrl) {
    console.log('dddddddddddddd',imageUrl);
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.social.expandImage.html',
      size: 'lg',
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
