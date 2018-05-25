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
  $scope.users = [];
  $scope.friend;
  $scope.isTyping = false;
  $scope.activeCard = 0;


  // $http({
  //   method: 'GET',
  //   url: '/api/HR/users/'
  // }).
  // then(function(response) {
  //   $scope.users = response.data;
  //   for (var i = 0; i < response.data.length; i++) {
  //     if ($scope.me.pk == $scope.users[i].pk) {
  //       $scope.users.splice(i, 1)
  //     }
  //   }
  // })

  $scope.refreshMessages = function() {
    $scope.lastMsg = [];
    peopleInvolved = [];
    for (var i = 0; i < $scope.rawMessages.length; i++) {
      var im = $scope.rawMessages[i];
      if (im.originator == $scope.me.pk) {
        if (peopleInvolved.indexOf(im.user) == -1) {
          peopleInvolved.push(im.user)
        }
      } else {
        if (peopleInvolved.indexOf(im.originator) == -1) {
          peopleInvolved.push(im.originator)
        }
      }
    }
    for (var i = 0; i < peopleInvolved.length; i++) {
      for (var j = 0; j < $scope.rawMessages.length; j++) {
        var im = $scope.rawMessages[j];
        var friend = peopleInvolved[i];
        if (friend == im.originator || friend == im.user) {
          count = 0;
          for (var k = 0; k < $scope.rawMessages.length; k++) {
            im2 = $scope.rawMessages[k]
            if ((im2.originator == friend || im2.user == friend) && im2.read == false) {
              count += 1;
            }
          }
          if (count != 0) {
            $scope.instantMessagesCount += 1;
          }
          im.count = count;
          $scope.lastMsg.push(im);
          break;
        }
      }
    }
  }

  $scope.fetchLastMessages = function() {
    $scope.method = 'GET';
    $scope.url = '/api/PIM/chatMessage/';
    $scope.ims = [];
    var senders = [];

    $http({
      method: $scope.method,
      url: $scope.url
    }).
    then(function(response) {
      $scope.rawMessages = response.data;
      $scope.refreshMessages();
    });
  };

  $scope.fetchLastMessages();


  $scope.connection = new autobahn.Connection({
    url: 'ws://skinstore.monomerce.com:8080/ws',
    realm: 'default'
  });

  $scope.chatResponse = function(args) {
    console.log('ddddd', args);
    if (args[0] == 'T') {
      console.log('typinmgg', args[1]);
      $timeout(function() {
        $scope.isTyping = true;
        console.log($scope.isTyping);
      }, 500);
      $timeout(function() {
        $scope.isTyping = false;
        console.log($scope.isTyping);
      }, 4000);
      $scope.scroll();
    } else if (args[0] == 'M') {
      console.log('message came', args[1]);
      $http({
        method: "GET",
        url: '/api/PIM/chatMessageBetween/' + args[3] + '/'
      }).
      then(function(response) {
        console.log('resssssss', response.data);
        response.data.message = $sce.getTrustedHtml(response.data.message);
        $scope.ims.push(response.data);
        $scope.senderIsMe.push(false);
        $scope.scroll(500);
      });
    }


  }

  $scope.connection.onopen = function(session) {
    $scope.session = session;
    console.log("Connected")
    console.log(wampBindName);


    $scope.session.subscribe('service.chat.' + wampBindName, $scope.chatResponse).then(
      function(sub) {
        console.log("subscribed to topic 'chatResonse'");
      },
      function(err) {
        console.log("failed to subscribed: " + err);
      }
    );

  }

  $scope.connection.open();

  $scope.mode = 'list';
  // $scope.personInView = 0;
  $scope.showCommentBox = false
  $scope.setInView = function(index) {
    console.log(index);
    $scope.activeCard = index;
    $scope.showCommentBox = true
    $scope.commenEdit = {
      txt: '',
      file: emptyFile,
      parent: 0
    }
    $scope.personInView = $scope.lastMsg[index].originator;
    console.log($scope.personInView);
  }

  $timeout(function () {
    $scope.setInView(0);
  }, 1000);


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
    $scope.friendPk = $scope.personInView;
    $scope.method = 'GET';
    $scope.url = '/api/PIM/chatMessageBetween/?other=' + $scope.friendPk;
    $scope.ims = [];
    $scope.imsCount = 0;
    $scope.senderIsMe = [];
    $http({
      method: $scope.method,
      url: $scope.url
    }).
    then(function(response) {
      $scope.imsCount = response.data.length;
      // for (var i = 0; i < response.data.length; i++) {
      //   var im = response.data[i];
      //   var sender = $users.get(im.originator)
      //   if (sender.username == $scope.me.username) {
      //     $scope.senderIsMe.push(true);
      //   } else {
      //     $scope.senderIsMe.push(false);
      //   }
      //   im.message = $sce.getTrustedHtml(im.message);
      //   $scope.ims.push(im);
      // }
      $scope.ims = response.data;
      $scope.scroll(1000);
    });
    console.log($scope.ims);
  };

  $scope.scroll = function(delay) {
    if (delay == undefined) {
      delay = 100;
    }
    $timeout(function() {
      var $id = $("#scrollArea" + $scope.friendPk);

      console.log($id);
      $id.scrollTop($id[0].scrollHeight);
    }, delay)
  }



  $scope.$watch('personInView', function(newValue, oldValue) {
    console.log('jhjkhjjkii', $scope.personInView);
    if ($scope.personInView != undefined) {
      $scope.fetchMessages();
    }

  }, true)

  $scope.$watch('commenEdit.txt', function(newValue, oldValue) {
    console.log(newValue);
    if (newValue == undefined) {
      return;
    }
    $scope.status = "T"; // the sender is typing a message
    if (newValue != "") {
      console.log('typing....');
      console.log($scope.friend.username);
      $scope.connection.session.publish('service.chat.' + $scope.friend.username, [$scope.status, $scope.me.username], {}, {
        acknowledge: true
      }).
      then(function(publication) {});
      // $scope.connection.session.publish('service.chat.'+ $scope.friend.username, [$scope.status , $scope.me.username]);
    }
  }, true)

  $scope.sendMessage = function() {
    var msg = $scope.commenEdit.txt;
    var file = $scope.commenEdit.file;
    if (msg != "" || file != "") {
      $scope.status = "M"; // contains message
      var fd = new FormData();
      fd.append('message', msg);
      fd.append('attachment', file);
      fd.append('read', false);
      fd.append('user', $scope.personInView.pk);
      $http({
        method: 'POST',
        data: fd,
        url: '/api/PIM/chatMessage/',
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        }
      }).
      then(function(response) {
        response.data.message = $sce.getTrustedHtml(response.data.message);
        $scope.ims.push(response.data)
        $scope.senderIsMe.push(true);
        console.log('heree...', response.data);
        console.log($scope.friend.username);
        $scope.connection.session.publish('service.chat.' + $scope.friend.username, [$scope.status, response.data.message, $scope.me.username, response.data.pk], {}, {
          acknowledge: true
        }).
        then(function(publication) {});
        $scope.commenEdit.txt = "";
        $scope.commenEdit.file = emptyFile;
        $scope.scroll(500);
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
      template: '<div class="modal-body">' +
        '<img ng-src="{{imageUrl}}" alt="" width="100%;">' +
        '</div>',
      size: 'md',
      backdrop: true,
      controller: function($scope, $http, Flash) {
        $scope.imageUrl = imageUrl;
      }
    })
  }


});
