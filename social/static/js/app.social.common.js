app.controller("header", function($scope, $http, $state, $rootScope, $uibModal, $users) {

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
    console.log('chart details',chatDetails);
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
    console.log("recieved" , input);
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
});
