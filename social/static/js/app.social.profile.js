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

app.controller("main", function($scope, $state, $http, $rootScope, $uibModal, $users, $sce) {

  $scope.me = $users.get('mySelf');
  console.log($scope.me);
  $scope.noPosts = false;


  $scope.following = following;
  $scope.followersCount = followersCount;
  console.log('ffffffffffff', $scope.following, $scope.followersCount);

  $scope.profileUserPk = profileUserPk;
  console.log('prof user',$scope.profileUserPk);

  $scope.emojiClicked = function(inp, pk) {
    console.log("clicked", inp, pk);
    var method = 'POST'
    var url = '/api/social/postLike/'
    for (var i = 0; i < $scope.posts.length; i++) {
      console.log(i, $scope.posts[i].user_reaction);
      if ($scope.posts[i].pk == pk) {
        var idx = i
      }
      if ($scope.posts[i].pk == pk && $scope.posts[i].user_reaction.length != 0) {
        console.log('yesssssssssssss');
        var method = 'PATCH'
        var url = '/api/social/postLike/' + $scope.posts[i].like_pk + '/'
      }
    }
    var likedData = {
      parent: pk,
      typ: inp
    }
    $http({
      method: method,
      url: url,
      data: likedData
    }).
    then(function(method, idx) {
      return function(response) {
        if (method == 'POST') {
          $scope.posts[idx].likes_count = $scope.posts[idx].likes_count + 1
          $scope.posts[idx].user_reaction = response.data.typ
          $scope.posts[idx].like_pk = response.data.pk
          $scope.posts[idx].reacted = true
        } else {
          $scope.posts[idx].user_reaction = response.data.typ
        }
        console.log(method);
        console.log(response);
      }
    }(method, idx));
  }

  $scope.fetchAllPosts = function() {
    console.log('pkkkkkkkkkkkkkkkkk',$scope.profileUserPk,typeof $scope.profileUserPk);
    $scope.posts = [];
    $http({
      method: 'GET',
      url: '/api/social/post/?user=' + $scope.profileUserPk,
    }).
    then(function(response) {
      $scope.posts = response.data;
      console.log(response.data);
      var imgTypes = ['png', 'svg', 'gif', 'jpg', 'jpeg']
      for (var i = 0; i < $scope.posts.length; i++) {
        $scope.posts[i].reacted = false
        $scope.posts[i].timeline = []
        if ($scope.posts[i].user_reaction.length > 0) {
          $scope.posts[i].reacted = true
        }
        $scope.posts[i].txt = $sce.getTrustedHtml($scope.posts[i].txt);
        for (var j = 0; j < $scope.posts[i].comments.length; j++) {
          $scope.posts[i].comments[j].txt = $sce.getTrustedHtml($scope.posts[i].comments[j].txt);
          $scope.posts[i].timeline.push({
            typ: 'comment',
            created: $scope.posts[i].comments[j].created,
            data: $scope.posts[i].comments[j]
          })
        }
        for (var j = 0; j < $scope.posts[i].responses.length; j++) {
          $scope.posts[i].responses[j].txt = $sce.getTrustedHtml($scope.posts[i].responses[j].txt);
          var imgShow = false
          if ($scope.posts[i].responses[j].fil != null) {
            var filtyp = $scope.posts[i].responses[j].fil.split('.').slice(-1)[0]
            console.log('fileeeeeeeeee', filtyp, imgTypes);
            console.log(imgTypes.indexOf(filtyp));
            if (imgTypes.indexOf(filtyp) >= 0) {
              var imgShow = true
            }
          }
          $scope.posts[i].timeline.push({
            typ: 'offer',
            created: $scope.posts[i].responses[j].created,
            data: $scope.posts[i].responses[j],
            imgShow: imgShow
          })
        }
        $scope.posts[i].podtEditComments = {
          txt: '',
          file: emptyFile,
          parent: $scope.posts[i].pk
        }
        $scope.posts[i].timeline.sort(function(a, b) {
          var dateA = new Date(a.created),
            dateB = new Date(b.created)
          return dateA - dateB //sort by date ascending
        })
      }
      console.log($scope.posts);
      console.log('possssss', $scope.posts.length);
      if ($scope.posts.length==0) {
        $scope.noPosts = true;
      }
    });
  };
  $scope.fetchAllPosts();



  // $scope.fileName;
  // $scope.fileSize = 0;
  // $scope.showComments = false;
  //
  // $scope.allComments = function() {
  //   if ($scope.showComments == false) {
  //     $scope.showComments = true;
  //   } else {
  //     $scope.showComments = false;
  //   }
  //
  // }

  // related to the chatter
  $scope.commenEdit = {
    txt: '',
    file: emptyFile
  }
  $scope.config = {
    expansion: true,
    placeholder: 'Type your comment here...'
  }

  $scope.addComment = function() {
    console.log("outside the directive");
  }


  // related to the chatter


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

  $scope.sendFollow = function(obj, mod) {
    $scope.following = !$scope.following
    if (mod == 'follow') {
      $scope.followersCount = $scope.followersCount + 1
    } else {
      $scope.followersCount = $scope.followersCount - 1
    }
    console.log(obj, typeof obj, mod, typeof mod);
    url = '/api/HR/profile/' + $scope.me.profile.pk + '/?follow=4'
    $http({
      method: 'PATCH',
      url: '/api/HR/profile/' + $scope.me.profile.pk + '/?following=' + parseInt(obj) + '&mode=' + mod
    }).
    then(function(response) {
      console.log(response.data);
      // $scope.me = response.data
    })

  }
  $scope.msgRequest = function(obj) {
    console.log(obj, typeof obj);
    $rootScope.$broadcast('msgRequestData', {
      data: parseInt(obj)
    });
  }

});
