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

app.controller("main", function($scope, $state, $http, $sce, Flash, $users, $uibModal, $timeout) {

  $scope.me = $users.get('mySelf');

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
      var imgTypes = ['png' , 'svg' , 'gif' , 'jpg' , 'jpeg']
      for (var i = 0; i < $scope.posts.length; i++) {
        $scope.posts[i].reacted = false
        $scope.posts[i].timeline = []
        if ($scope.posts[i].user_reaction.length > 0) {
          $scope.posts[i].reacted = true
        }
        $scope.posts[i].txt = $sce.getTrustedHtml($scope.posts[i].txt);
        for (var j = 0; j < $scope.posts[i].comments.length; j++) {
          $scope.posts[i].comments[j].txt = $sce.getTrustedHtml($scope.posts[i].comments[j].txt);
          $scope.posts[i].timeline.push({typ:'comment',created:$scope.posts[i].comments[j].created,data:$scope.posts[i].comments[j]})
        }
        for (var j = 0; j < $scope.posts[i].responses.length; j++) {
          $scope.posts[i].responses[j].txt = $sce.getTrustedHtml($scope.posts[i].responses[j].txt);
          var imgShow = false
          if ($scope.posts[i].responses[j].fil != null) {
            var filtyp = $scope.posts[i].responses[j].fil.split('.').slice(-1)[0]
            console.log('fileeeeeeeeee',filtyp,imgTypes);
            console.log(imgTypes.indexOf(filtyp));
            if (imgTypes.indexOf(filtyp) >= 0) {
              var imgShow = true
            }
          }
          $scope.posts[i].timeline.push({typ:'offer',created:$scope.posts[i].responses[j].created,data:$scope.posts[i].responses[j],imgShow:imgShow})
        }
        $scope.posts[i].podtEditComments = {
          txt: '',
          file: emptyFile,
          parent: $scope.posts[i].pk
        }
        $scope.posts[i].timeline.sort(function(a, b){
          var dateA=new Date(a.created), dateB=new Date(b.created)
          return dateA-dateB //sort by date ascending
        })
      }
      console.log('possssss',$scope.posts);
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
      $scope.postRes = response.data
      for (var i = 0; i < $scope.postRes.length; i++) {
        $scope.postRes[i].txt = $sce.getTrustedHtml($scope.postRes[i].txt).slice(0, 40);
        console.log($scope.postRes[i].txt);
        $scope.postRes[i].responseValue = $scope.postRes[i].responses[0];
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
  $scope.countForResp = 0;
  $scope.offerComment = {
    txt: ''
  };

  $scope.sendOffer = function (resVal) {
    console.log('resval', resVal.pk );
    console.log($scope.offerComment.txt);

    $http({
      method: 'PATCH',
      url: '/api/social/postResponse/' + resVal.pk + '/',
      data: {reply: $scope.offerComment.txt}
    }).
    then(function(response) {
      console.log('res', response.data);
      resval = response.data;
      Flash.create('success', 'Offer Comment Changed')
    })

  }



  $scope.prevOfferRes = function(indx) {
    if ($scope.countForResp > 0) {
      $scope.countForResp--;
      $scope.postRes[indx].responseValue = $scope.postRes[indx].responses[$scope.countForResp];
      console.log($scope.countForResp);
    }
  }

  $scope.nextOfferRes = function(indx) {
    if ($scope.countForResp < $scope.postRes[indx].responses.length-1) {
      $scope.countForResp++;
      $scope.postRes[indx].responseValue = $scope.postRes[indx].responses[$scope.countForResp];
      console.log($scope.countForResp);
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

  // $scope.postCommentData = {
  //   txt: '',
  //   file: emptyFile
  // }
  $scope.postCommentConfig = {
    expansion: true,
    placeholder: 'Make An Offer ....'
  }

  $scope.postComment = function(parent) {
    console.log('dataaaaaaaaaaaaaaaa', parent);
    for (var i = 0; i < $scope.posts.length; i++) {
      console.log(i);
      if ($scope.posts[i].pk == parent) {
        console.log('yesssssssssssss');
        if (($scope.posts[i].podtEditComments.txt == '' || $scope.posts[i].podtEditComments.txt.length == 0 || $scope.posts[i].podtEditComments.txt == '<br>') && ($scope.posts[i].podtEditComments.file == emptyFile)) {
          console.log('emptyyyyyyyyyyyy');
          Flash.create('warning', 'Please Write Some Comment')
          return
        }

        var fd = new FormData();
        if ($scope.posts[i].podtEditComments.txt != '' || $scope.posts[i].podtEditComments.txt.length != 0 || $scope.posts[i].podtEditComments.txt != '<br>') {
          fd.append('txt', $scope.posts[i].podtEditComments.txt);
        }
        if ($scope.posts[i].podtEditComments.file != emptyFile) {
          fd.append('fil', $scope.posts[i].podtEditComments.file);
        }
        fd.append('parent', parent);

        $http({
          method: 'POST',
          data: fd,
          url: '/api/social/postComment/',
          transformRequest: angular.identity,
          headers: {
            'Content-Type': undefined
          }
        }).
        then(function(i) {
          return function(response) {
            console.log('commmmmmm', response.data);
            $scope.posts[i].podtEditComments = {
              txt: '',
              file: emptyFile,
              parent: $scope.posts[i].pk
            }
            $scope.posts[i].comments.push(response.data)
            $scope.posts[i].timeline.push({typ:'comment',created:response.data.created,data:response.data})
          }
        }(i))
      }
    }

  };


  // $scope.fileName;
  // $scope.fileSize = 0;
  $scope.showComments = false;
  $scope.allComments = function(indx) {
    $scope.posts[indx].showComments = !$scope.posts[indx].showComments
  }

  $scope.changeType = function(indx) {
    // console.log($scope.posts[indx]);
    $scope.typeOfPost;
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.social.changeType.html',
      size: 'md',
      backdrop: true,
      resolve: {
        post: function() {
          return $scope.posts[indx];
        }
      },
      controller: function($scope, post, $http, Flash, $uibModalInstance) {
        console.log('in this ctrll');
        $scope.changingType = function(type) {
          console.log(post.pk);
          $scope.typeOfPost = type;
          console.log('type of post', $scope.typeOfPost);
          $scope.typeData = {
            'typ': $scope.typeOfPost
          }
          $http({
            method: 'PATCH',
            url: '/api/social/post/' + post.pk + '/',
            data: $scope.typeData
          }).
          then(function(response) {
            console.log('res typ', response.data.typ);
            post.typ = response.data.typ;
            Flash.create('success', 'Type Changed')
          })
          $uibModalInstance.dismiss();
        }
      }
    })
  }

  $scope.editPost = function(indx) {
    $uibModal.open({
      template: '<comment-Edit comment="editPostData" send="sendEditPost" config="editPostConfig" style="border: 2px solid #eeeeee;"></comment-Edit>',
      // templateUrl:'/static/ngTemplates/app.social.editPost.html',
      size: 'md',
      backdrop: true,
      resolve: {
        post: function() {
          return $scope.posts[indx];
        }
      },
      controller: function($scope, post, $http, Flash, $uibModalInstance) {

        // $scope.fileSize = 10;
        // $scope.isImage = true;

        $scope.editPostData = {
          txt: post.txt,
          file: post.mediaPost[0].fil,
          parent: 'postEditModal'
        }

        console.log('edit post data', $scope.editPostData.file);


        $scope.editPostConfig = {
          expansion: true,
          placeholder: 'Edit Your Post...'
        }

        $scope.sendEditPost = function() {

          console.log($scope.editPostData);

          console.log('it comes here...');
          $http({
            method: 'PATCH',
            url: '/api/social/post/' + post.pk + '/',
            data: {
              txt: $scope.editPostData.txt
            }
          }).
          then(function(response) {
            console.log('resssssss', response.data);
            post.txt = response.data.txt;
            Flash.create('success', 'Edited Successfully')
            post.txt = $sce.getTrustedHtml(post.txt)

            if ($scope.editPostData.file != emptyFile && typeof $scope.editPostData.file != 'string') {
              var posatMediaData = new FormData();
              posatMediaData.append('parent', post.pk);
              posatMediaData.append('fil', $scope.editPostData.file);
              $http({
                method: "PATCH",
                url: '/api/social/postMedia/' + post.mediaPost[0].pk + '/',
                data: posatMediaData,
                transformRequest: angular.identity,
                headers: {
                  'Content-Type': undefined
                }
              }).
              then(function(response) {
                console.log('resssssss', response.data);
                Flash.create('success', 'Image Edited Successfully')
                post.mediaPost = [response.data];
                $scope.editPostData = {
                  txt: '',
                  file: emptyFile,
                }

              });
            }
          });

          $uibModalInstance.dismiss();
        }

      }
    })
  }



  $scope.sharePost = function(idx) {
    console.log('dddddddddddddd', idx);
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.social.sharePost.html',
      size: 'md',
      backdrop: true,
      resolve: {
        posts: function() {
          return $scope.posts[idx];
        }
      },
      controller: function($scope, $rootScope, $state, posts, $uibModal, $uibModalInstance) {
        console.log('modal img ctrl', posts);
        $scope.showBtn = ''
        $scope.input = {
          num: '',
          email: ''
        }
        $scope.send = function(typ) {
          console.log('send Type is ', typ, $scope.input);
          console.log('data issss', posts);
        }
      }
    })
  }


  $scope.postResponse = function(idx, typ) {
    console.log('dddddddddddddd', idx);
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.social.postResponse.html',
      size: 'md',
      backdrop: true,
      resolve: {
        posts: function() {
          return $scope.posts[idx];
        },
        typ: function() {
          return typ;
        }
      },
      controller: function($scope, $rootScope, $state, posts, typ, $uibModal, $uibModalInstance) {
        $scope.responseForm = {
          txt: '',
          value: 0,
          fil: emptyFile
        }
        $scope.post = function() {
          console.log('send Type is ', typ, $scope.responseForm);
          console.log('data issss', posts);
          if ($scope.responseForm.txt.length == 0 || $scope.responseForm.txt == null) {
            Flash.create('warning', 'Please Write Some Message')
            return
          }
          if ($scope.responseForm.value < 0 || $scope.responseForm.value == null) {
            Flash.create('warning', 'Please Mention The Amount')
            return
          }
          var fd = new FormData();
          fd.append('txt', $scope.responseForm.txt);
          fd.append('value', $scope.responseForm.value);
          fd.append('parent', posts.pk);
          fd.append('typ', typ);
          if ($scope.responseForm.fil != emptyFile) {
            fd.append('fil', $scope.responseForm.fil);
          }
          console.log(fd);

          $http({
            method: 'POST',
            data: fd,
            url: '/api/social/postResponse/',
            transformRequest: angular.identity,
            headers: {
              'Content-Type': undefined
            }
          }).
          then(function(response) {
            console.log('commmmmmm', response.data);
            Flash.create('success', 'Successfully Posted')
            var imgShow = false
            var imgTypes = ['png' , 'svg' , 'gif' , 'jpg' , 'jpeg']
            if (response.data.fil != null) {
              var filtyp = response.data.fil.split('.').slice(-1)[0]
              if (imgTypes.indexOf(filtyp) >= 0) {
                var imgShow = true
              }
            }
            posts.timeline.push({typ:'offer',created:response.data.created,data:response.data,imgShow:imgShow})
            $uibModalInstance.dismiss();
          })
        }
      }
    })
  }


  $scope.expandImage = function(imageUrl) {
    $uibModal.open({
      template: '<div class="modal-body">' +
        '<img ng-src="{{imageUrl}}" alt="" width="100%;">' +
        '</div>',
      size: 'md',
      backdrop: true,
      controller: function($scope, $http, Flash) {
        console.log(imageUrl);
        $scope.imageUrl = imageUrl;
      }
    })
  }


});
