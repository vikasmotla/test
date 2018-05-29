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

  $scope.postPk = postPk;
  console.log(postPk);

  $scope.me = $users.get('mySelf');
  console.log($scope.me);

  $scope.fetchAllPosts = function() {
    // console.log('pkkkkkkkkkkkkkkkkk',$scope.profileUserPk,typeof $scope.profileUserPk);
    $scope.posts = [];
    $http({
      method: 'GET',
      url: '/api/social/post/' + $scope.postPk + '/',
    }).
    then(function(response) {
      $scope.posts = [response.data];
      console.log('ressssssssssssssssssssss', response.data);
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
      if ($scope.posts.length == 0) {
        $scope.noPosts = true;
      }
    });
  };
  $scope.fetchAllPosts();

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



});
