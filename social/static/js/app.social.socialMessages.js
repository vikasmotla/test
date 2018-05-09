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

app.controller("app.social.socialMessages", function($scope, $state, $rootScope) {
  console.log('coming in ctrl');

  $scope.peopleInView = 0;
  $scope.textReply = '';
  $scope.peoples = [
    {name : 'Vikas Motla', profileImage:"abc.jpg", id:123 , messages : [{msg : "hi"},{img: "/static/images/screenshot.png"}]},
    {name : 'Ashish Shah', profileImage:"abc.jpg", id:234 , messages : [{msg : "dfg"}]},
    {name : 'Sai Kiran', profileImage:"abc.jpg", id:345, messages : [{msg : "sai hi"}]},
    {name : 'Ankita Sharma', profileImage:"abc.jpg", id:456, messages : [{msg : "ank hi"}]},
    {name : 'Amit Kumar', profileImage:"abc.jpg", id:567, messages : [{msg : "ami t hi"}]}
    ];


  $scope.setInView = function(index) {
    $scope.peopleInView = index;
  }

  $scope.sendMessage = function() {
    $scope.peoples[$scope.peopleInView].messages.push({msg : $scope.textReply});
    $scope.textReply = '';
  }

  // $scope.peoples[0].messages.push({img : "/static/images/screenshot.png"})
  // console.log('herer',$scope.peoples[0].messages);


  $scope.addFile = function() {
    console.log("will add file");
    $('#filePicker').click();
  }

  document.getElementById('filePicker').onchange = function(e) {
    var reader = new FileReader();

    reader.onload = function(event) {
      var imgObj = new Image();
      imgObj.src = event.target.result;
      console.log('source....');

      $scope.peoples[0].messages.push({img : "/static/images/screenshot.png"})
      console.log('herer',$scope.peoples[0].messages);
    }
    reader.readAsDataURL(e.target.files[0]);
    }

});
