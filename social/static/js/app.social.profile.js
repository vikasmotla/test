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

app.controller("main", function($scope, $state,$http, $rootScope, $uibModal, $users) {

  $scope.me = $users.get('mySelf');
  console.log($scope.me);

  $scope.following = following;
  $scope.followersCount = followersCount;
  console.log('ffffffffffff',$scope.following, $scope.followersCount);
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
      $uibModal.open({
        template: '<div class="modal-body">'+
           '<img ng-src="{{imageUrl}}" alt="" width="100%;">'+
        '</div>',
        size: 'md',
        backdrop : true,
        controller : function($scope , $http , Flash) {
          $scope.imageUrl = imageUrl;
        }
      })
  }

  $scope.sendFollow = function(obj,mod){
    $scope.following = ! $scope.following
    if (mod == 'follow') {
      $scope.followersCount = $scope.followersCount + 1
    }else {
      $scope.followersCount = $scope.followersCount - 1
    }
    console.log(obj,typeof obj,mod, typeof mod);
    url = '/api/HR/profile/'+ $scope.me.profile.pk +'/?follow=4'
    $http({
      method: 'PATCH',
      url: '/api/HR/profile/'+ $scope.me.profile.pk +'/?following=' + parseInt(obj) +'&mode=' + mod
    }).
    then(function(response) {
      console.log(response.data);
      // $scope.me = response.data
    })

  }
  $scope.msgRequest = function(obj){
    console.log(obj,typeof obj);
    $rootScope.$broadcast('msgRequestData', {
      data: parseInt(obj)
    });
  }

});
