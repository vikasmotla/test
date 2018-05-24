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

app.controller("main", function($scope, $state, $http, $sce, Flash, $users, $uibModal, $timeout, $interval) {

  $scope.me = $users.get('mySelf');

  $scope.index = 0;
  $scope.incr = true;
  // $scope.myFollowing = [];

  $scope.fetchFeaturedPage = function() {
    $scope.featuredPageAll = []
    $scope.featuredPageFirst;
    $http({
      method: 'GET',
      url: '/api/ERP/featuredPage/?active=true',
    }).
    then(function(response) {
      $scope.featuredPageAll = response.data;
      console.log('all', $scope.featuredPageAll);
      $scope.fpInView = $scope.featuredPageAll[$scope.index];
      if ($scope.fpInView.typ == 'event') {
        $scope.eventUrl = $scope.fpInView.event.name.replace(/ /g, "_") + '_' + $scope.fpInView.event.pk;
      }
      $scope.index = 1;
      // $http({
      //   method: 'GET',
      //   url: '/api/HR/profile/' + $scope.me.profile.pk + '/'
      // }).
      // then(function(response) {
      //   $scope.myFollowing = response.data.following;
      //   console.log($scope.myFollowing);
      // })
    });
  }
  $scope.fetchFeaturedPage();


  $interval(function() {
    if ($scope.featuredPageAll.length>1) {
      console.log($scope.featuredPageAll.length);
      $scope.fpInView = $scope.featuredPageAll[$scope.index];
      if ($scope.fpInView.typ == 'event') {
        $scope.eventUrl = $scope.fpInView.event.name.replace(/ /g, "_") + '_' + $scope.fpInView.event.pk;
      }
      // for (var i = 0; i < $scope.myFollowing.length; i++) {
      //   console.log('insideeeee for loopppp',$scope.fpInView.person.pk , $scope.myFollowing[i] );
      //   if ($scope.fpInView.person.pk==$scope.myFollowing[i]) {
      //     $scope.fpInView.following = true;
      //     console.log('following......',$scope.fpInView.following);
      //   }else {
      //     $scope.fpInView.following = false;
      //   }
      // }
      $scope.index += 1;
      if ($scope.index == $scope.featuredPageAll.length) {
        $scope.index = 0;
      }
    }
  }, 5000);

  $scope.nextFp = function () {
    if ($scope.featuredPageAll.length>1) {
      $scope.index += 1;
      $scope.fpInView = $scope.featuredPageAll[$scope.index];
      if ($scope.index == $scope.featuredPageAll.length) {
        $scope.index = 0;
      }
    }
  }

  $scope.prevFp = function () {
    if ($scope.featuredPageAll.length>1) {
      $scope.index -= 1;
      $scope.fpInView = $scope.featuredPageAll[$scope.index];
      if ($scope.index == 0) {
        $scope.index = $scope.featuredPageAll.length;
      }
    }
  }


  $scope.fpFollow = function(pk) {
    console.log($scope.me.profile.pk, pk);
    $http({
      method: 'PATCH',
      url: '/api/HR/profile/' + $scope.me.profile.pk + '/?following=' + pk + '&mode=follow'
    }).
    then(function(response) {
      console.log(response.data);
      Flash.create('success', 'Following')
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


  $scope.fetchAllPosts = function() {
    $scope.posts = [];
    $http({
      method: 'GET',
      url: '/api/social/post/',
    }).
    then(function(response) {
      $scope.posts = response.data;
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
            // console.log('fileeeeeeeeee', filtyp, imgTypes);
            // console.log(imgTypes.indexOf(filtyp));
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
      console.log('possssss', $scope.posts);
    });
  };
  $scope.fetchAllPosts();

  $scope.fetchAllOffers = function() {
    $scope.offers = [];
    $http({
      method: 'GET',
      url: '/api/social/postLite/?res=' + $scope.me.pk,
    }).
    then(function(response) {
      console.log('resssssssssssss', response.data);
      $scope.totalPostRes = response.data;
      console.log($scope.totalPostRes);
      if ($scope.totalPostRes.length > 2) {
        $scope.showMoreBtn = true;
      }
      $scope.postRes = $scope.totalPostRes.slice(0, 2);
      // $scope.postRes.countForResp = 0;
      console.log('post respppppppp',$scope.postRes);
      for (var i = 0; i < $scope.postRes.length; i++) {
        $scope.postRes[i].txt = $sce.getTrustedHtml($scope.postRes[i].txt).slice(0, 40);
        // console.log($scope.postRes[i].txt);
        $scope.postRes[i].responseValue = $scope.postRes[i].responses[0];
        $scope.postRes[i].showPrev = false;
        $scope.postRes[i].showNext = false;
        $scope.postRes[i].intrestTxt = '';
        $scope.postRes[i].countForResp = 0;
        if ($scope.postRes[i].responses.length > 1) {
          $scope.postRes[i].showNext = true;
        }


        // $scope.postRes[i].minVal = 10000
        // for (var j = 0; j < $scope.postRes[i].responses.length; j++) {
        //   if ($scope.postRes[i].responses[j].value < $scope.postRes[i].minVal) {
        //     $scope.postRes[i].minVal = $scope.postRes[i].responses[j].value
        //   }
        // }
      }

    });

  };
  $scope.fetchAllOffers();
  // $scope.countForResp = 0;

  $scope.expandLeads = function(expandPostpk) {
    console.log('expand post pk', expandPostpk);
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.social.expandLeads.html',
      size: 'lg',
      backdrop: true,
      controller: function($scope, $http, Flash) {
        $http({
          method: 'GET',
          url: '/api/social/post/' + expandPostpk + '/',
        }).
        then(function(response) {
          console.log(response.data);
          $scope.expandPostData = response.data;
          $scope.expandPostData.timeline = []
          var imgTypes = ['png', 'svg', 'gif', 'jpg', 'jpeg']
          if ($scope.expandPostData.user_reaction.length > 0) {
            $scope.expandPostData.reacted = true
          }
          $scope.expandPostData.txt = $sce.getTrustedHtml($scope.expandPostData.txt);
          for (var j = 0; j < $scope.expandPostData.comments.length; j++) {
            $scope.expandPostData.comments[j].txt = $sce.getTrustedHtml($scope.expandPostData.comments[j].txt);
            $scope.expandPostData.timeline.push({
              typ: 'comment',
              created: $scope.expandPostData.comments[j].created,
              data: $scope.expandPostData.comments[j]
            })
          }
          for (var j = 0; j < $scope.expandPostData.responses.length; j++) {
            $scope.expandPostData.responses[j].txt = $sce.getTrustedHtml($scope.expandPostData.responses[j].txt);
            var imgShow = false
            if ($scope.expandPostData.responses[j].fil != null) {
              var filtyp = $scope.expandPostData.responses[j].fil.split('.').slice(-1)[0]
              console.log('fileeeeeeeeee', filtyp, imgTypes);
              console.log(imgTypes.indexOf(filtyp));
              if (imgTypes.indexOf(filtyp) >= 0) {
                var imgShow = true
              }
            }
            $scope.expandPostData.timeline.push({
              typ: 'offer',
              created: $scope.expandPostData.responses[j].created,
              data: $scope.expandPostData.responses[j],
              imgShow: imgShow
            })
          }

          console.log('timeline', $scope.expandPostData.timeline);

          $scope.expandPostData.timeline.sort(function(a, b) {
            var dateA = new Date(a.created),
              dateB = new Date(b.created)
            return dateA - dateB //sort by date ascending
          })
        })

        // $scope.showComments = false;
        // $scope.allComments = function() {
        //   $scope.expandPostData.showComments = !$scope.expandPostData.showComments
        // }

      }
    })
  }

  $scope.sendOffer = function(resVal, idx) {
    console.log($scope.postRes[idx]);
    console.log('resval', resVal);

    $http({
      method: 'PATCH',
      url: '/api/social/postResponse/' + resVal.pk + '/',
      data: {
        reply: $scope.postRes[idx].intrestTxt
      }
    }).
    then(function(idx) {
      return function(response) {
        console.log('res', response.data, $scope.posts);
        $scope.postRes[idx].intrestTxt = ''
        Flash.create('success', 'Successfully Send Your Response')
        for (var i = 0; i < $scope.posts.length; i++) {
          if ($scope.posts[i].pk == response.data.parent) {
            for (var j = 0; j < $scope.posts[i].timeline.length; j++) {
              if ($scope.posts[i].timeline[j].typ == 'offer' && $scope.posts[i].timeline[j].data.pk == response.data.pk) {
                $scope.posts[i].timeline[j].data = response.data
              }
            }
          }
        }
      }
    }(idx))

  }

  $scope.prevOfferRes = function(indx) {
    $scope.postRes[indx].countForResp --;
    console.log($scope.postRes[indx].responses[$scope.postRes[indx].countForResp]);
    if ($scope.postRes[indx].responses[$scope.postRes[indx].countForResp] != undefined) {
      if ($scope.postRes[indx].countForResp == 0) {
        $scope.postRes[indx].showNext = true;
        $scope.postRes[indx].showPrev = false;
      } else {
        $scope.postRes[indx].showNext = true;
        $scope.postRes[indx].showPrev = true;
      }
      $scope.postRes[indx].responseValue = $scope.postRes[indx].responses[$scope.postRes[indx].countForResp];
      console.log($scope.postRes[indx].countForResp);
    }
  }

  $scope.nextOfferRes = function(indx) {
    $scope.postRes[indx].countForResp++;
    console.log($scope.postRes[indx].responses[$scope.postRes[indx].countForResp]);
    if ($scope.postRes[indx].responses[$scope.postRes[indx].countForResp] != undefined) {
      if ($scope.postRes[indx].countForResp + 1 == $scope.postRes[indx].responses.length) {
        $scope.postRes[indx].showNext = false;
        $scope.postRes[indx].showPrev = true;
      } else {
        $scope.postRes[indx].showNext = true;
        $scope.postRes[indx].showPrev = true;
      }
      $scope.postRes[indx].responseValue = $scope.postRes[indx].responses[$scope.postRes[indx].countForResp];
      console.log($scope.postRes[indx].countForResp);
    }
  }

  $scope.postData = {
    txt: '',
    file: emptyFile,
    parent: 0
  }
  $scope.postConfig = {
    expansion: true,
    placeholder: 'Post Your Requirement Here...'
  }

  $scope.sendPost = function() {
    console.log('dataaaaaaaaaaaaaaaa', $scope.postData, $scope.postData.file.name, typeof $scope.postData.file);
    if (($scope.postData.txt == '' || $scope.postData.txt.length == 0 || $scope.postData.txt == '<br>') && ($scope.postData.file == emptyFile)) {
      console.log('emptyyyyyyyyyyyy');
      Flash.create('warning', 'Please Mention Some Post')
      return
    }

    var postData = {
      txt: $scope.postData.txt
    }
    $http({
      method: "POST",
      url: '/api/social/post/',
      data: postData
    }).
    then(function(response) {
      console.log('resssssss', response.data);
      $scope.posts.splice(0, 0, response.data)
      $scope.posts[0].txt = $sce.getTrustedHtml($scope.posts[0].txt)
      $scope.postData.txt = ''

      if ($scope.postData.file != emptyFile) {
        var posatMediaData = new FormData();
        posatMediaData.append('parent', response.data.pk);
        posatMediaData.append('fil', $scope.postData.file);
        $http({
          method: "POST",
          url: '/api/social/postMedia/',
          data: posatMediaData,
          transformRequest: angular.identity,
          headers: {
            'Content-Type': undefined
          }
        }).
        then(function(response) {
          console.log('resssssss', response.data);
          Flash.create('success', 'Posted Successfully')
          $scope.posts[0].mediaPost = [response.data];
          $scope.postData = {
            txt: '',
            file: emptyFile
          }
        });
      }
    });

  };


  // $scope.fileName;
  // $scope.fileSize = 0;
});
