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

app.controller("main", function($scope, $state, $rootScope, $uibModal, $users, $http, $sce, $timeout) {
  $scope.me = $users.get('mySelf');
  $scope.people = [];
  $scope.users;
  $scope.friend;
  $scope.isTyping= false;


  $http({
    method: 'GET',
    url: '/api/HR/users/'
  }).
  then(function(response) {
    $scope.users = response.data;
    for (var i = 0; i < response.data.length; i++) {
      if ($scope.me.pk == $scope.users[i].pk) {
        $scope.users.splice(i, 1)
      }
    }
  })




  // $scope.roomID = '123';
  $scope.handleRemoteContent = function(args) {
    console.log('arrgs', args);
  }


  $scope.connection = new autobahn.Connection({
    url: 'ws://skinstore.monomerce.com:8080/ws',
    realm: 'default'
  });

  $scope.chatResponse = function (args) {
    console.log('ddddd',args);
    if (args[0]=='T') {
      console.log('typinmgg',args[1]);
      $timeout(function () {
        $scope.isTyping = true;
        console.log($scope.isTyping);
      }, 500);
      $timeout(function () {
        $scope.isTyping = false;
        console.log($scope.isTyping);
      }, 4000);
    }else if (args[0]=='M') {
      console.log('message came', args[1]);
      $http({
        method: "GET",
        url: '/api/PIM/chatMessageBetween/'+ args[3] +'/'
      }).
      then(function(response) {
        console.log('resssssss',response.data);
        response.data.message = $sce.getTrustedHtml(response.data.message);
        $scope.ims.push(response.data);
        $scope.senderIsMe.push(false);
      });
    }


  }

  $scope.connection.onopen = function(session) {
    $scope.session = session;
    console.log("Connected")
    console.log(wampBindName);



    $scope.session.subscribe('service.chat.'+ wampBindName, $scope.chatResponse).then(
    function (sub) {
      console.log("subscribed to topic 'chatResonse'");
      },
    function (err) {
      console.log("failed to subscribed: " + err);
      }
    );


  }

  $scope.connection.open();

  console.log('coming in ctrl');
  $scope.mode = 'list';
  // $scope.personInView = 0;
  $scope.showCommentBox = false
  $scope.setInView = function(index) {
    $scope.showCommentBox = true
    $scope.commenEdit = {
      txt: '',
      file: emptyFile,
      parent : 0
    }
    $scope.personInView = $scope.users[index];
    console.log($scope.personInView);
  }

  $scope.search = function() {
    $scope.mode = 'search';
  }

  $scope.closeSearch = function() {
    $scope.mode = 'list';
  }


  $scope.config = {
    expansion: false,
    placeholder: 'Type your text here...'
  }

  $scope.fetchMessages = function() {
    $scope.friend = $scope.personInView;
    $scope.method = 'GET';
    $scope.url = '/api/PIM/chatMessageBetween/?other=' + $scope.friend.username;
    $scope.ims = [];
    $scope.imsCount = 0;
    $scope.senderIsMe = [];
    $http({
      method: $scope.method,
      url: $scope.url
    }).
    then(function(response) {
      $scope.imsCount = response.data.length;
      for (var i = 0; i < response.data.length; i++) {
        var im = response.data[i];
        var sender = $users.get(im.originator)
        if (sender.username == $scope.me.username) {
          $scope.senderIsMe.push(true);
        } else {
          $scope.senderIsMe.push(false);
        }
        im.message = $sce.getTrustedHtml(im.message);
        $scope.ims.push(im);
      }
    });
    console.log($scope.ims);
  };



  $scope.$watch('personInView', function(newValue, oldValue) {
    console.log('jhjkhjjkii',$scope.personInView);
    if ($scope.personInView != undefined) {      
      $scope.fetchMessages();
    }
  }, true)

  $scope.$watch('commenEdit.txt', function(newValue, oldValue) {
    $scope.status = "T"; // the sender is typing a message
      if (newValue!="") {
        console.log('typing....');
        console.log($scope.friend.username);
        $scope.connection.session.publish('service.chat.'+$scope.friend.username, [$scope.status , $scope.me.username], {}, {acknowledge: true}).
        then(function (publication) {});
        // $scope.connection.session.publish('service.chat.'+ $scope.friend.username, [$scope.status , $scope.me.username]);
      }
  }, true)

  $scope.sendMessage = function() {
    var msg = $scope.commenEdit.txt;
    var file = $scope.commenEdit.file;
    if (msg != "" || file != "") {
      $scope.status = "M"; // contains message
      var fd = new FormData();
      fd.append('message' , msg);
      fd.append('attachment' , file);
      fd.append('read' , false);
      fd.append('user' , $scope.personInView.pk);
      $http({
        method: 'POST',
        data: fd,
        url: '/api/PIM/chatMessage/',
        transformRequest: angular.identity, headers: {'Content-Type': undefined}
      }).
      then(function(response) {
        response.data.message = $sce.getTrustedHtml(response.data.message);
        $scope.ims.push(response.data)
        $scope.senderIsMe.push(true);
        console.log('heree...',response.data);
        console.log($scope.friend.username);
        $scope.connection.session.publish('service.chat.'+ $scope.friend.username, [$scope.status , response.data.message , $scope.me.username , response.data.pk], {}, {acknowledge: true}).
        then(function (publication) {});
        $scope.commenEdit.txt = "";
        $scope.commenEdit.file = emptyFile;
      })
    }
  };

  // $scope.sendMessage = function() {
  //   console.log("outside the directive");
  //   if ($scope.commenEdit.txt != '' && $scope.commenEdit.file.size != 0) {
  //     $scope.people[$scope.peopleInView].messages.push({
  //       msg: $scope.commenEdit.txt
  //     });
  //     $scope.people[$scope.peopleInView].messages.push({
  //       img: "/static/images/screenshot.png"
  //     })
  //   } else if ($scope.commenEdit.txt != '') {
  //     $scope.people[$scope.peopleInView].messages.push({
  //       msg: $scope.commenEdit.txt
  //     });
  //   } else if ($scope.commenEdit.file.size != 0) {
  //     $scope.people[$scope.peopleInView].messages.push({
  //       img: "/static/images/screenshot.png"
  //     })
  //   }
  //
  //   $scope.commenEdit.txt = '';
  //   $scope.commenEdit.file = emptyFile ;
  // }

  $scope.expandImage = function(imageUrl) {
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
