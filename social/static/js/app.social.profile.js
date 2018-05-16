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

app.controller("main", function($scope, $state, $rootScope, $uibModal, $users) {

  $scope.me = $users.get('mySelf');
  // console.log($scope.me);

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

  // related to the chatter
  $scope.commenEdit = {txt : '' , file : emptyFile}
  $scope.config={expansion: true , placeholder: 'Type your comment here...'}

  $scope.addComment = function() {
    console.log("outside the directive");
  }


  // related to the chatter


  $scope.expandImage = function(imageUrl) {
    console.log('fdg',imageUrl);

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
  $scope.sendFollow = function(obj){
    // url = '/api/HR/profile/'+ $scope.me.profile.pk +'/?follow=4'
    $http({
      method: 'PATCH',
      url: '/api/HR/profile/'+ $scope.me.profile.pk +'/?following=' + obj + '/'
    }).
    then(function(response) {
      console.log(reponse.data);
    })

  }
  $scope.msgRequest = function(obj){
    console.log(obj,typeof obj);
    $rootScope.$broadcast('msgRequestData', {
      data: parseInt(obj)
    });
  }

});

app.controller("app.social.expandImage", function($scope, $rootScope, data, $state, $uibModal, $uibModalInstance) {
  $scope.imageUrl = data;

});
