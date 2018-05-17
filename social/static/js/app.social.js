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

  $scope.emojiClicked = function(inp, pk) {
    console.log("clicked", inp, pk);
  }



  $scope.me = $users.get('mySelf');

  $scope.fetchAllPosts = function() {
    $scope.posts = [];
    $http({
      method: 'GET',
      url: '/api/social/post/',
    }).
    then(function(response) {
      $scope.posts = response.data;
      for (var i = 0; i < $scope.posts.length; i++) {
        $scope.posts[i].txt = $sce.getTrustedHtml($scope.posts[i].txt);
        for (var j = 0; j < $scope.posts[i].comments.length; j++) {
          $scope.posts[i].comments[j].txt = $sce.getTrustedHtml($scope.posts[i].comments[j].txt);
        }
        $scope.posts[i].podtEditComments = {
          txt: '',
          file: emptyFile,
          parent: $scope.posts[i].pk
        }

      }
    });
    console.log($scope.posts);
  };
  $scope.fetchAllPosts();

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
    placeholder: 'Post Your Requirement Here...'
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
          return $scope.posts;
        },
        index: function() {
          return indx;
        }
      },
      controller: function($scope, post, index, $http, Flash, $uibModalInstance) {
        $scope.posts = post;
        console.log('in this ctrll');
        $scope.changingType = function(type) {
          console.log($scope.posts[index].pk);
          $scope.typeOfPost = type;
          console.log('type of post', $scope.typeOfPost);
          $scope.typeData = {
            'typ': $scope.typeOfPost
          }
          $http({
            method: 'PATCH',
            url: '/api/social/post/' + $scope.posts[index].pk +'/',
            data: $scope.typeData
          }).
          then(function(response) {
            console.log('res typ', response.data.typ);
            $scope.posts[index].typ = response.data.typ;
            Flash.create('success', 'Type Changed')
          })
          $uibModalInstance.dismiss();
        }
      }
    })
  }

$scope.editPost = function (indx) {
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
        $scope.post = post;
        console.log('file isss', $scope.post);

        // $scope.fileSize = 10;
        // $scope.isImage = true;

        $scope.editPostData = {
          txt: $scope.post.txt,
          file: $scope.post.mediaPost[0].fil,
          parent: 'postEditModal'
        }

        console.log('edit post data',$scope.editPostData.file);


        $scope.editPostConfig = {
          expansion: true,
          placeholder: 'Edit Your Post...'
        }

        $scope.sendEditPost = function() {

          $scope.editPostDataText = {
            'txt' : $scope.editPostData.txt,
          }
          console.log('it comes here...');
          $http({
            method: 'PATCH',
            url: '/api/social/post/' + $scope.post.pk +'/',
            data: $scope.editPostDataText
          }).
          then(function(response) {
            console.log('resssssss', response.data);
            $scope.posts[index] = response.data;
            Flash.create('success', 'Edited Successfully')
            $scope.posts[index].txt = $sce.getTrustedHtml($scope.posts[index].txt)

            // $scope.posts.splice(0, 0, response.data)
            // $scope.posts[0].txt = $sce.getTrustedHtml($scope.posts[0].txt)
            // $scope.postData.txt = ''

            console.log($scope.editPostData.file, $scope.posts[index].pk);
            if ($scope.editPostData.file != emptyFile) {
              var posatMediaData = new FormData();
              posatMediaData.append('parent', $scope.posts[index].pk);
              posatMediaData.append('fil', $scope.editPostData.file);
              $http({
                method: "PATCH",
                url: '/api/social/postMedia/' + $scope.posts[index].pk + '/',
                data: posatMediaData,
                transformRequest: angular.identity,
                headers: {
                  'Content-Type': undefined
                }
              }).
              then(function(response) {
                console.log('resssssss', response.data);
                Flash.create('success', 'Image Edited Successfully')
                $scope.posts[index].mediaPost = [response.data];
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
