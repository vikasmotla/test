var app = angular.module('app', ['ui.router', 'ui.bootstrap', 'ngSanitize', 'ngAside', 'ngDraggable', 'flash', 'ngTagsInput', 'mwl.confirm', 'ngAudio', 'uiSwitch']);

app.config(function($stateProvider, $urlRouterProvider, $httpProvider, $provide) {

  $urlRouterProvider.otherwise('/home');
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;


});

app.run(['$rootScope', '$state', '$stateParams', '$permissions', function($rootScope, $state, $stateParams, $permissions) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  $rootScope.$on("$stateChangeError", console.log.bind(console));
}]);

app.controller("main", function($scope, $state, $rootScope, $uibModal) {
  console.log('coming in ctrl');
  $scope.mode = 'list';
  $scope.peopleInView = 0;
  $scope.textReply = '';
  $scope.peoples = [
    {name : 'Vikas Motla', profileImage:"/static/images/img_avatar.png",  messages : [{msg : "hi"},{img: "/static/images/food.png"}]},
    {name : 'Ashish Shah', profileImage:"/static/images/img_avatar.png", messages : [{msg : "dfg"}]},
    {name : 'Sai Kiran', profileImage:"/static/images/img_avatar.png", messages : [{msg : "sai hi"}]},
    {name : 'Ankita Sharma', profileImage:"/static/images/img_avatar.png", messages : [{msg : "ank hi"}]},
    {name : 'Amit Kumar', profileImage:"/static/images/img_avatar.png", messages : [{msg : "ami t hi"}]},
    {name : 'Amit Kumar', profileImage:"/static/images/img_avatar.png", messages : [{msg : "ami t hi"}]},
    {name : 'Amit Kumar', profileImage:"/static/images/img_avatar.png", messages : [{msg : "ami t hi"}]},
    {name : 'Vikas Motla', profileImage:"/static/images/img_avatar.png", messages : [{msg : "hi"},{img: "/static/images/food.png"}]},
    {name : 'Ashish Shah', profileImage:"/static/images/img_avatar.png", messages : [{msg : "dfg"}]},
    {name : 'Sai Kiran', profileImage:"/static/images/img_avatar.png", messages : [{msg : "sai hi"}]},
    {name : 'Ashish Shah', profileImage:"/static/images/img_avatar.png", messages : [{msg : "dfg"}]},
    {name : 'Sai Kiran', profileImage:"/static/images/img_avatar.png", messages : [{msg : "sai hi"}]},
    {name : 'Ashish Shah', profileImage:"/static/images/img_avatar.png", messages : [{msg : "dfg"}]},
    {name : 'Sai Kiran', profileImage:"/static/images/img_avatar.png", messages : [{msg : "sai hi"}]},
    {name : 'Ashish Shah', profileImage:"/static/images/img_avatar.png", messages : [{msg : "dfg"}]},
    {name : 'Sai Kiran', profileImage:"/static/images/img_avatar.png", messages : [{msg : "sai hi"}]},
    {name : 'Ashish Shah', profileImage:"/static/images/img_avatar.png", messages : [{msg : "dfg"}]},
    {name : 'Sai Kiran', profileImage:"/static/images/img_avatar.png", messages : [{msg : "sai hi"}]},
    {name : 'Ashish Shah', profileImage:"/static/images/img_avatar.png", messages : [{msg : "dfg"}]},
    {name : 'Sai Kiran', profileImage:"/static/images/img_avatar.png", messages : [{msg : "sai hi"}]},
    {name : 'Ashish Shah', profileImage:"/static/images/img_avatar.png", messages : [{msg : "dfg"}]},
    {name : 'Sai Kiran', profileImage:"/static/images/img_avatar.png", messages : [{msg : "sai hi"}]}

    ];


  $scope.setInView = function(index) {
    $scope.peopleInView = index;
  }

  $scope.search =function() {
    $scope.mode = 'search';
  }

  $scope.closeSearch =function() {
    $scope.mode = 'list';
  }

  $scope.commenEdit = {txt : '' , file : emptyFile}
  $scope.config={expansion: false , placeholder: 'Type your text here...'}

  $scope.addComment = function() {
    console.log("outside the directive");
    if ($scope.commenEdit.txt!='' && $scope.commenEdit.file.size!=0) {
      console.log('push both.....');
      $scope.peoples[$scope.peopleInView].messages.push({msg : $scope.commenEdit.txt});
      $scope.peoples[$scope.peopleInView].messages.push({img : "/static/images/screenshot.png"})
    }
    else if ($scope.commenEdit.txt!='') {
      console.log('push only cmmnt');
       $scope.peoples[$scope.peopleInView].messages.push({msg : $scope.commenEdit.txt});
    }
    else if ($scope.commenEdit.file.size!=0) {
      console.log('push only file');
      console.log($scope.commenEdit.file.url);
       $scope.peoples[$scope.peopleInView].messages.push({img : "/static/images/screenshot.png"})
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
});
