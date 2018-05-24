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
  $scope.expandPostData = [];
  $scope.showAll = false;
  // $scope.postDataInit ;
  $scope.activeCard = 0;

  // console.log($scope.postDataInit);

  $scope.fetchAllOffers = function() {
    $scope.offers = [];
    $http({
      method: 'GET',
      url: '/api/social/postLite/?res=' + $scope.me.pk,
    }).
    then(function(response) {

      $scope.offers = response.data;
      console.log($scope.offers);
      for (var i = 0; i < $scope.offers.length; i++) {
        $scope.offers[i].txt = $sce.getTrustedHtml($scope.offers[i].txt).slice(0, 50);
        console.log($scope.offers[i]);

        $http({
          method: 'GET',
          url: '/api/social/post/' + $scope.offers[i].pk + '/',
        }).
        then((function(i) {
          return function(response) {
            $scope.offers[i].postData = response.data;
            console.log(response.data.responses);


            $scope.offers[i].postData.timeline = []
            var imgTypes = ['png', 'svg', 'gif', 'jpg', 'jpeg']
            if ($scope.offers[i].postData.user_reaction.length > 0) {
              $scope.offers[i].postData.reacted = true
            }
            $scope.offers[i].postData.txt = $sce.getTrustedHtml($scope.offers[i].postData.txt);
            for (var j = 0; j < $scope.offers[i].postData.comments.length; j++) {
              $scope.offers[i].postData.comments[j].txt = $sce.getTrustedHtml($scope.offers[i].postData.comments[j].txt);
              $scope.offers[i].postData.timeline.push({
                typ: 'comment',
                created: $scope.offers[i].postData.comments[j].created,
                data: $scope.offers[i].postData.comments[j]
              })
            }
            for (var j = 0; j < $scope.offers[i].postData.responses.length; j++) {
              $scope.offers[i].postData.responses[j].txt = $sce.getTrustedHtml($scope.offers[i].postData.responses[j].txt);
              var imgShow = false
              if ($scope.offers[i].postData.responses[j].fil != null) {
                var filtyp = $scope.offers[i].postData.responses[j].fil.split('.').slice(-1)[0]
                console.log('fileeeeeeeeee', filtyp, imgTypes);
                console.log(imgTypes.indexOf(filtyp));
                if (imgTypes.indexOf(filtyp) >= 0) {
                  var imgShow = true
                }
              }
              $scope.offers[i].postData.timeline.push({
                typ: 'offer',
                created: $scope.offers[i].postData.responses[j].created,
                data: $scope.offers[i].postData.responses[j],
                imgShow: imgShow
              })
            }


            $scope.offers[i].postData.timeline.sort(function(a, b) {
              var dateA = new Date(a.created),
                dateB = new Date(b.created)
              return dateA - dateB //sort by date ascending
            })
          }
        })(i));

      }


    });


  };

  $timeout(function() {
    $scope.postDataInit = $scope.offers[0].postData;
    $scope.showAll = true;
  }, 1500);


  $scope.fetchAllOffers();

  $scope.setInView = function(index) {
    $scope.leadInView = $scope.offers[index];
    $scope.postDataInit = $scope.offers[index].postData;

    $scope.activeCard = index;
    // console.log($scope.postDataInit);

  }

  $scope.reply = function(responsePk, cmt) {
    // console.log($scope.postRes[idx]);
    console.log('resval', responsePk);

    // console.log($scope.postDataInit.timeline);

    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.social.leads.reply.html',
      size: 'md',
      backdrop: true,
      resolve: {
        timeline: function() {
          return $scope.postDataInit.timeline
        }
      },
      controller: function($scope, timeline, $http, Flash, $uibModalInstance) {
        $scope.replyText = '';
        // console.log(data);
        // console.log(cmt);
        console.log(timeline);
        $scope.sendOffer = function() {
          console.log('send offer', $scope.replyText);


          $http({
            method: 'PATCH',
            url: '/api/social/postResponse/' + responsePk + '/',
            data: {
              reply: $scope.replyText
            }
          }).
          then(function(response) {
            console.log('ressssssssssssssssssssss', response.data);
            Flash.create('success', 'Replied')
            for (var i = 0; i < timeline.length; i++) {
              if (timeline[i].data.pk == response.data.pk) {
                timeline[i].data.reply = response.data.reply;
              }
            }
            // timeline.data = response.data.reply;

            // $scope.postDataInit.timeline
            // console.log($scope.postDataInit);
          });

          $uibModalInstance.dismiss();
          $scope.replyText = '';
        }

      }






    })
  }

  $scope.expandImage = function(imageUrl) {
    console.log('expand');
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
