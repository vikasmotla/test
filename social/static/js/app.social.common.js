app.controller("header", function($scope, $http, $state, $rootScope, $uibModal, $users) {

  $scope.me = $users.get('mySelf');

  // console.log($scope.me);


  if ($.cookie("chatDetails") == undefined || $.cookie("chatDetails") == null || $.cookie("chatDetails").length == 0) {
    $scope.chatWindows = [];
    $scope.maximaStatus = [];
    // $scope.chatWindows = [1, 2, 3, 4]
    // $scope.maximaStatus = [true, true, true, true]
  } else {
    $scope.chatWindows = [];
    var prts = $.cookie("chatDetails").split(',');
    for (var i = 0; i < prts.length; i++) {
      $scope.chatWindows.push(parseInt(prts[i]));
    }

    $scope.maximaStatus = [];
    var prts = $.cookie("toggleDetails").split(',');
    for (var i = 0; i < prts.length; i++) {
      // console.log(prts[i],typeof prts[i]);
      if (prts[i] == '1') {
        $scope.maximaStatus.push(true);
      } else {
        $scope.maximaStatus.push(false);
      }
    }
  }

  $scope.closeChatWindow = function(indx) {
    $scope.chatWindows.splice(indx, 1);
    $scope.maximaStatus.splice(indx, 1)
    $scope.updateCookie()
    $scope.updateToggleCookie();
    // updated
  }
  $scope.updateCookie = function() {
    var arr = $scope.chatWindows;
    var chatDetails = ''
    console.log(arr);
    for (var i = 0; i < arr.length; i++) {
      if (i == arr.length - 1) {
        chatDetails += arr[i]
      } else {
        chatDetails += arr[i] + ','
      }
    }
    console.log('chart details', chatDetails);
    $.cookie("chatDetails", chatDetails);
  }
  $scope.updateToggleCookie = function() {
    $scope.$watch('maximaStatus', function(newValue, oldValue) {
      // console.log($scope.maximaStatus);
      var arr = $scope.maximaStatus;
      var toggleDetails = ''
      for (var i = 0; i < arr.length; i++) {
        if (i == arr.length - 1) {
          if (arr[i]) {
            toggleDetails += 1
          } else {
            toggleDetails += 0
          }
        } else {
          if (arr[i]) {
            toggleDetails += 1 + ','
          } else {
            toggleDetails += 0 + ','
          }
        }
      }
      console.log(toggleDetails);
      $.cookie("toggleDetails", toggleDetails)
    }, true)
  }

  // $scope.chatWindows = [1,2,3,4]
  // $scope.maximaStatus = [true , true , true , true]
  $scope.updateCookie();
  $scope.updateToggleCookie();

  $scope.$on('msgRequestData', function(event, input) {
    console.log("recievedddddddddddddddddddd", input);
    for (var i = 0; i < $scope.chatWindows.length; i++) {
      if ($scope.chatWindows[i] == input.data) {
        return
      }
    }
    console.log('enddddd');
    $scope.chatWindows.push(input.data);
    $scope.maximaStatus.push(true);
  });

  $scope.header = {
    userSearch: ''
  }
  $scope.userSearch = function(val) {
    return $http.get('/api/HR/users/?username__contains=' + val).
    then(function(response) {
      return response.data;
    })
  };
  $scope.$watch('header.userSearch', function(newValue, oldValue) {
    if (typeof newValue == 'object') {
      window.location = "/social/profile/" + newValue.username
    }
  })
  // $.removeCookie('toggleDetails');
  // $.removeCookie('chatDetails');

  $scope.totalUnread = 0;

  $scope.refreshMessages = function() {
    $scope.ims = [];
    $scope.instantMessagesCount = 0;
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
          $scope.totalUnread += count;
          $scope.ims.push(im);
          break;
        }
      }
    }
  }

  $scope.fetchMessages = function() { //fetching only last messages
    // This is because the chat system is build along with the notification system. Since this is the part whcih is common accros all the modules
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
      console.log();
      $scope.refreshMessages();
      console.log($scope.totalUnread);
    });
  };

  $scope.fetchMessages();

  $scope.imWindows = []

  $scope.addIMWindow = function(pk , readCount) {
    $scope.totalUnread-=readCount;
    console.log('adding windowwwwwww',pk);
    // console.log("recievedddddddddddddddddddd", input);
    for (var i = 0; i < $scope.chatWindows.length; i++) {
      if ($scope.chatWindows[i] == pk) {
        return
      }
    }
    console.log('enddddd');
    $scope.chatWindows.push(pk);
    $scope.maximaStatus.push(true);
  }


  $scope.fetchNotifications = function() {
    $scope.unreadNotif = 0;
    $scope.unreadFollNotif = 0;
    $scope.notif = [];
    $scope.followNotif = [];
    $scope.method = 'GET';
    $scope.url = '/api/PIM/notification/';
    $http({
      method: $scope.method,
      url: $scope.url
    }).
    then(function(response) {
      // $scope.notif = response.data;
      console.log('nnnnnnnnnnnnnnn',response.data , response.data.length);
      // $scope.refreshNotifications();
      for (var i = 0; i < response.data.length; i++) {
        console.log('ddd',response.data[i].originator);
        if (response.data[i].originator!="follow") {
          console.log('sddddddddddddddddddd');
          $scope.notif.push(response.data[i]);
          if (response.data[i].read==false) {
            console.log('nottttttt',response.data[i].read);
            $scope.unreadNotif+=1;
          }
        }
        else {
          $scope.followNotif.push(response.data[i]);
          if (response.data[i].read==false) {
            console.log('follllllll',response.data[i].read);
            $scope.unreadFollNotif+=1;
          }
        }
      }

    });
  };

  $scope.fetchNotifications();


});
