app.directive('reactions', ['$sce', function($sce) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      // console.log(element);
      element.facebookReactions();
    }
  };
}]);

app.directive('contenteditable', ['$sce', function($sce) {
  return {
    restrict: 'A', // only activate on element attribute
    require: '?ngModel', // get a hold of NgModelController
    link: function(scope, element, attrs, ngModel) {
      if (!ngModel) return; // do nothing if no ng-model

      // Specify how UI should be updated
      ngModel.$render = function() {
        element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
      };

      // Listen for change events to enable binding
      element.on('blur keyup change', function() {
        scope.$evalAsync(read);
      });
      read(); // initialize

      // Write data to the model
      function read() {
        var html = element.html();
        // When we clear the content editable the browser leaves a <br> behind
        // If strip-br attribute is provided then we strip this out
        if ( attrs.stripBr && html == '<br>' ) {
          html = '';
        }
        ngModel.$setViewValue(html);
      }
    }
  };
}]);

app.directive('chatWindow', function() {
  return {
    templateUrl: '/static/ngTemplates/directive.chatWindow.html',
    restrict: 'E',
    replace: true,
    scope: {
      user: '=',
      pos: '=',
      close: '=',
      toggle: '='
    },
    controller: function($scope, $state, $stateParams,$users,$timeout, $http,$sce, Flash) {

      //fetch the messages with $scope.pk
      console.log('in chat dirrrrrrrrrrrrrr', $scope.user, $scope.pos);
      $scope.me = $users.get("mySelf");
      $scope.friend = $users.get($scope.user)

      $scope.toggler = function() {
        $scope.toggle = !$scope.toggle;
      }
      $scope.cancel = function() {
        $scope.close($scope.pos);
      }

      $scope.fetchMessages = function() {
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
            im.message=$sce.getTrustedHtml(im.message)
            $scope.ims.push(im);
            // console.log($scope.ims.length);
          }
        });
      };


      $scope.fetchMessages();

      $scope.messageToSend = "";
      $scope.send = function() {
        // var msg = angular.copy($scope.messageToSend)
        var msg = $scope.messageToSend
        console.log('messssageeeeee', $scope.messageToSend);
        if (msg != "") {
          $scope.status = "M"; // contains message
          var dataToSend = {
            message: msg,
            user: $scope.friend.pk,
            read: false
          };
          $http({
            method: 'POST',
            data: dataToSend,
            url: '/api/PIM/chatMessage/'
          }).
          then(function(response) {
            response.data.message=$sce.getTrustedHtml(response.data.message)
            $scope.ims.push(response.data)
            $scope.senderIsMe.push(true);
            // connection.session.publish('service.chat.' + $scope.friend.username, [$scope.status, response.data.message, $scope.me.username, response.data.pk], {}, {
            //   acknowledge: true
            // }).
            // then(function(publication) {});
            $scope.connection.session.publish('service.chat.'+ $scope.friend.username, [$scope.status , response.data.message , $scope.me.username , response.data.pk], {}, {acknowledge: true}).
            then(function (publication) {});

            $scope.messageToSend = "";
          })
        }
      }

      $scope.connection = new autobahn.Connection({
        url: 'ws://skinstore.monomerce.com:8080/ws',
        realm: 'default'
      });
      $scope.isTyping = false;
      $scope.chatResponse = function (args) {
        console.log('ddddd',args);
        if (args[0]=='T') {
          $timeout(function () {
            $scope.isTyping = true;;
          }, 300);
          $timeout(function () {
            $scope.isTyping = false;
            console.log($scope.isTyping);
          }, 4000);
          // $scope.isTyping = true;
          console.log('typinmgg',args[1],$scope.isTyping);
        }else if (args[0]=='M') {
          console.log('message came', args[1]);
          $http({
            method: "GET",
            url: '/api/PIM/chatMessageBetween/'+ args[3] +'/'
          }).
          then(function(response) {
            console.log('resssssss',response.data);
            response.data.message=$sce.getTrustedHtml(response.data.message)
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

      $scope.$watch('messageToSend', function(newValue, oldValue) {
        $scope.status = "T"; // the sender is typing a message
          if (newValue!="") {
            console.log('typing....');
            console.log($scope.friend.username);
            $scope.connection.session.publish('service.chat.'+$scope.friend.username, [$scope.status , $scope.me.username], {}, {acknowledge: true}).
            then(function (publication) {});
            // $scope.connection.session.publish('service.chat.'+ $scope.friend.username, [$scope.status , $scope.me.username]);
          }
      }, true)

    },
  };
});

app.directive('commentEdit', function() {
  return {
    templateUrl: '/static/ngTemplates/directive.commentEdit.html',
    restrict: 'E',
    replace: true,
    scope: {
      comment :'=',
      send : '=',
      config: '='
    },
    controller: function($scope, $state, $stateParams, $http, Flash, $timeout) {

      //fetch the comment with $scope.pk

      $timeout(function() {
        $('div#auto').tagautocomplete({
          source: function (query, process) {

            var position = getCaretPosition(document.getElementById('auto'));
            query = query.substring(0, position);

            var regex = new RegExp("(^|\\s)([" + this.options.character + "][\\w-]*)$");
            var result = regex.exec(query);

            if(result && result[2]){
              result = result[2].trim().toLowerCase();
            }else {
              result = '';
              return
            }


           return $.get('/api/HR/users/?', { username__contains: result.replace('@', '') }, function (data) {
             var toReturn = [];
             for (var i = 0; i < data.length; i++) {
               toReturn.push('@' +  data[i].username)
             }

             return process(toReturn); //if JSON is [ "options" : { ...}
           });

         }
        });
      },1000)


      if ($scope.config==undefined) {
        $scope.placeholder = 'Write Comment';
        $scope.expansion = true;
      }else {
        $scope.placeholder = $scope.config.placeholder;
        $scope.expansion = $scope.config.expansion;
      }

      $scope.height = '';


      $scope.$watch('comment.txt' , function(newValue , oldValue){
        if (newValue==undefined || $scope.expansion == false) {
          return;
        }

        // return

        if (newValue == '') {
          $scope.height = '';
        } else {

          var cnt = (newValue.match(/<br>/g) || []).length;
          if (cnt > 4) {
            $scope.height = (cnt*2) + 'em';
          }else{
            $scope.height = '8em';
          }

        }
      });

      $scope.checkFile = function() {
        console.log('file sizee');
        if ($scope.fileSize == 0) {
          $scope.attachInComments();
        } else {
          $scope.removeFile();
        }
      }

      $scope.attachInComments = function() {
        console.log('#filePicker'+$scope.comment.parent);
        $('#filePicker'+$scope.comment.parent).click();
      }

      $scope.$watch('comment.file', function(newValue, oldValue) {
        if (newValue == undefined) {
          return;
        }
        if (typeof newValue.name != 'undefined') {
          $scope.fileSize = newValue.size;
          $scope.fileName = newValue.name;
        }
      });

      $scope.removeFile = function() {
        $scope.fileSize = 0;
        $scope.comment.file = emptyFile;
      }

    },
  };
});


app.directive('addressField', function() {
  return {
    templateUrl: '/static/ngTemplates/addressField.html',
    restrict: 'E',
    replace: true,
    scope: {
      address: '=',
      label: '=',
      disable: '=',
    },
    controller: function($scope, $state, $stateParams, $http, Flash) {

      if ($scope.address != undefined) {
        $scope.address.country = 'India'
      }

      $scope.states = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli', 'Daman and Diu', 'Delhi', 'Lakshadweep', 'Puducherry']

      $scope.save = function() {
        var method = 'POST';
        var url = '/api/ERP/address/';

        if ($scope.address.pk != undefined) {
          method = 'PATCH';
          url += $scope.address.pk + '/'
        }

        $http({
          method: method,
          url: url,
          data: $scope.address
        }).
        then(function(response) {
          Flash.create('success', "Saved");
          $scope.address.pk = response.data.pk;
        })
      }


    },
  };
});

app.directive('tabsStrip', function() {
  return {
    templateUrl: '/static/ngTemplates/tabsStrip.html',
    restrict: 'E',
    replace: true,
    scope: {
      tabs: '=',
      active: '='
    },
    controller: function($scope, $state, $stateParams) {
      $scope.changeTab = function(index) {
        for (var i = 0; i < $scope.tabs.length; i++) {
          $scope.tabs[i].active = false;
        }
        $scope.tabs[index].active = true;
        $scope.active = index;
      }

      $scope.$watch('active', function(newValue, oldValue) {
        $scope.changeTab(newValue);
      })
    },
  };
});

app.directive('commentInput', function() {
  return {
    templateUrl: '/static/ngTemplates/inputWithFile.html',
    restrict: 'E',
    replace: true,
    scope: {
      text: '=',
      doc: '=',
      saveNote: '='
    },
    controller: function($scope, $state, $stateParams) {

      $scope.randomKey = '' + new Date().getTime();

      if ($scope.doc == null || $scope.doc == undefined) {
        $scope.doc = emptyFile;
      }
      if ($scope.text == null || $scope.doc == undefined) {
        $scope.text = '';
      }
      $scope.browseForFile = function() {
        if ($scope.doc.size != 0) {
          $scope.doc = emptyFile;
          return;
        }
        $('#noteEditorFile' + $scope.randomKey).click();
      }

      $scope.$watch('doc', function(newValue, oldValue) {
        // console.log(newValue);
      })
    },
  };
});

app.directive('wizard', function() {
  return {
    templateUrl: '/static/ngTemplates/wizard.html',
    restrict: 'E',
    replace: true,
    scope: {
      active: '=',
      editable: '=',
      steps: '=',
      error: '='
    },
    controller: function($scope, $state, $stateParams) {

      $scope.activeBackup = -2;
      $scope.wizardClicked = function(indx) {
        if ($scope.editable) {
          $scope.active = indx;
          $scope.activeBackup = -2;
        }
      }

      $scope.resetHover = function(indx) {
        if ($scope.editable && $scope.activeBackup != -2) {
          $scope.active = $scope.activeBackup;
          $scope.activeBackup = -2;
        }
      }

      $scope.activateTemp = function(indx) {
        if ($scope.editable) {
          $scope.activeBackup = $scope.active;
          $scope.active = indx;
        }
      }

    },
  };
});

app.directive('breadcrumb', function() {
  return {
    templateUrl: '/static/ngTemplates/breadcrumb.html',
    restrict: 'E',
    replace: true,
    scope: false,
    controller: function($scope, $state, $stateParams) {
      var stateName = $state.current.name;
      $scope.stateParts = stateName.split('.');
      for (key in $stateParams) {
        if (typeof $stateParams[key] != 'undefined' && $stateParams[key] != '' && typeof parseInt($stateParams[key]) != 'number') {
          $scope.stateParts.push($stateParams[key]);
        };
      };
    },
  };
});

app.directive('userField', function() {
  return {
    templateUrl: '/static/ngTemplates/userInputField.html',
    restrict: 'E',
    replace: true,
    scope: {
      user: '=',
      url: '@',
      label: '@',
    },
    controller: function($scope, $state, $http, Flash) {
      $scope.userSearch = function(query) {
        return $http.get($scope.url + '?limit=10&username__contains=' + query).
        then(function(response) {
          return response.data.results;
        })
      };
      $scope.getName = function(u) {
        if (typeof u == 'undefined' || u == null) {
          return '';
        }
        return u.first_name + '  ' + u.last_name;
      }
    },
  };
});

app.directive('usersField', function() {
  return {
    templateUrl: '/static/ngTemplates/usersInputField.html',
    restrict: 'E',
    replace: true,
    scope: {
      data: '=',
      url: '@',
      col: '@',
      label: '@',
      viewOnly: '@'
    },
    controller: function($scope, $state, $http, Flash) {
      $scope.d = {
        user: undefined
      };
      if (typeof $scope.col != 'undefined') {
        $scope.showResults = true;
      } else {
        $scope.showResults = false;
      }

      if (typeof $scope.viewOnly != 'undefined') {
        $scope.viewOnly = false;
      }
      // $scope.user = undefined;
      $scope.userSearch = function(query) {
        return $http.get($scope.url + '?limit=10&username__contains=' + query).
        then(function(response) {
          for (var i = 0; i < response.data.results.length; i++) {
            if ($scope.data.indexOf(response.data.results[i]) != -1) {
              response.data.results.splice(i, 1);
            }
          }
          return response.data.results;
        })
      };
      $scope.getName = function(u) {
        if (typeof u == 'undefined') {
          return '';
        }
        return u.first_name + '  ' + u.last_name;
      }

      $scope.removeUser = function(index) {
        $scope.data.splice(index, 1);
      }

      $scope.addUser = function() {
        for (var i = 0; i < $scope.data.length; i++) {
          if ($scope.data[i] == $scope.d.user.pk) {
            Flash.create('danger', 'User already a member of this group')
            return;
          }
        }
        $scope.data.push($scope.d.user.pk);
        $scope.d.user = undefined;
      }
    },
  };
});

app.directive('mediaField', function() {
  return {
    templateUrl: '/static/ngTemplates/mediaInputField.html',
    restrict: 'E',
    replace: true,
    scope: {
      data: '=',
      url: '@',
    },
    controller: function($scope, $state, $http, Flash, $uibModal) {
      $scope.form = {
        mediaType: '',
        url: ''
      }
      $scope.switchMediaMode = function(mode) {
        $scope.form.mediaType = mode;
      }

      $scope.getFileName = function(f) {
        var parts = f.split('/');
        return parts[parts.length - 1];
      }

      $scope.showVideo = function(f) {
        var modalInstance = $uibModal.open({
          template: '<iframe width="100%" style="margin:0px;padding:0px;" height="500" src="https://www.youtube.com/embed/2WdB9CPLibQ" frameborder="0" allowfullscreen></iframe>',
          resolve: {
            file: function() {
              return f;
            }
          },
          controller: function($scope, $uibModalInstance, file) {
            console.log(f);
          },
          size: 'lg',
        });
      }

      $scope.removeMedia = function(index) {
        $http({
          method: 'DELETE',
          url: $scope.url + $scope.data[index].pk + '/'
        }).
        then(function(response) {
          $scope.data.splice(index, 1);
        })
      }
      $scope.postMedia = function() {
        var fd = new FormData();
        fd.append('mediaType', $scope.form.mediaType);
        fd.append('link', $scope.form.url);
        if (['doc', 'image', 'video'].indexOf($scope.form.mediaType) != -1 && $scope.form.file != emptyFile) {
          fd.append('attachment', $scope.form.file);
        } else if ($scope.form.url == '') {
          Flash.create('danger', 'No file to attach');
          return;
        }
        url = $scope.url;
        $http({
          method: 'POST',
          url: url,
          data: fd,
          transformRequest: angular.identity,
          headers: {
            'Content-Type': undefined
          }
        }).
        then(function(response) {
          $scope.data.push(response.data);
          $scope.form.file = emptyFile;
          Flash.create('success', response.status + ' : ' + response.statusText);
        }, function(response) {
          Flash.create('danger', response.status + ' : ' + response.statusText);
        });
      }
    },
  };
});

app.directive('genericForm', function() {
  return {
    templateUrl: '/static/ngTemplates/genericForm.html',
    restrict: 'E',
    replace: true,
    scope: {
      template: '=',
      submitFn: '&',
      data: '=',
      formTitle: '=',
      wizard: '=',
      maxPage: '=',
    },
    controller: function($scope, $state) {
      $scope.page = 1;

      $scope.next = function() {
        $scope.page += 1;
        if ($scope.page > $scope.maxPage) {
          $scope.page = $scope.maxPage;
        }
      }
      $scope.prev = function() {
        $scope.page -= 1;
        if ($scope.page < 1) {
          $scope.page = 1;
        }
      }
    },
  };
});


app.directive('messageStrip', function() {
  return {
    templateUrl: '/static/ngTemplates/messageStrip.html',
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      data: '=',
      openChat: '=',
    },
    controller: function($scope, $users) {
      $scope.me = $users.get('mySelf');
      if ($scope.me.pk == $scope.data.originator) {
        $scope.friend = $scope.data.user;
      } else {
        $scope.friend = $scope.data.originator;
      }
      $scope.clicked = function() {
        $scope.data.count = 0;
        $scope.openChat($scope.friend)
      }
    }
  };
});

app.directive('notificationStrip', function() {
  return {
    templateUrl: '/static/ngTemplates/notificationStrip.html',
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      data: '=',
    },
    controller: function($scope, $http, $users, $aside) {
      var parts = $scope.data.shortInfo.split(':');
      // console.log(parts);
      if (typeof parts[1] == 'undefined') {
        $scope.notificationType = 'default';
      } else {
        $scope.notificationType = parts[0];
      }
      // console.log($scope.data);
      // console.log($scope.notificationType);
      var nodeUrl = '/api/social/' + $scope.notificationType + '/'
      if (typeof parts[1] != 'undefined' && $scope.data.originator == 'social') {
        // console.log(nodeUrl + parts[1]);
        $http({
          method: 'GET',
          url: nodeUrl + parts[1] + '/'
        }).
        then(function(response) {
          $scope.friend = response.data.user;
          if ($scope.notificationType == 'postComment') {
            var url = '/api/social/post/' + response.data.parent + '/';
          } else if ($scope.notificationType == 'pictureComment') {
            var url = '/api/social/picture/' + response.data.parent + '/';
          }
          $http({
            method: 'GET',
            url: url
          }).then(function(response) {
            $scope.notificationData = response.data;
            if ($scope.notificationType == 'pictureComment') {
              $http({
                method: 'GET',
                url: '/api/social/album/' + $scope.data.shortInfo.split(':')[3] + '/?user=' + $users.get($scope.notificationData.user).username
              }).
              then(function(response) {
                $scope.objParent = response.data;
              });
            };
          });
        });
      } else if (typeof parts[1] != 'undefined' && $scope.data.originator == 'git') {
        if (parts[0] == 'codeComment') {
          var url = '/api/git/commitNotification/?sha=' + parts[2];
          $http({
            method: 'GET',
            url: url
          }).
          then(function(response) {
            $scope.commit = response.data[0];
          });
          var url = '/api/git/codeComment/' + parts[1] + '/';
          $http({
            method: 'GET',
            url: url
          }).
          then(function(response) {
            $scope.codeComment = response.data;
          });
        }
      };

      $scope.openAlbum = function(position, backdrop, input) {
        $scope.asideState = {
          open: true,
          position: position
        };

        function postClose() {
          $scope.asideState.open = false;
        }

        $aside.open({
          templateUrl: '/static/ngTemplates/app.social.aside.album.html',
          placement: position,
          size: 'lg',
          backdrop: backdrop,
          controller: 'controller.social.aside.picture',
          resolve: {
            input: function() {
              return input;
            }
          }
        }).result.then(postClose, postClose);
      }

      $scope.openPost = function(position, backdrop, input) {
        $scope.asideState = {
          open: true,
          position: position
        };

        function postClose() {
          $scope.asideState.open = false;
        }

        $aside.open({
          templateUrl: '/static/ngTemplates/app.social.aside.post.html',
          placement: position,
          size: 'md',
          backdrop: backdrop,
          controller: 'controller.social.aside.post',
          resolve: {
            input: function() {
              return input;
            }
          }
        }).result.then(postClose, postClose);
      }

      $scope.openCommit = function() {
        $aside.open({
          templateUrl: '/static/ngTemplates/app.GIT.aside.exploreNotification.html',
          position: 'left',
          size: 'xxl',
          backdrop: true,
          resolve: {
            input: function() {
              return $scope.commit;
            }
          },
          controller: 'projectManagement.GIT.exploreNotification',
        })
      }

      $scope.openNotification = function() {
        $http({
          method: 'PATCH',
          url: '/api/PIM/notification/' + $scope.data.pk + '/',
          data: {
            read: true
          }
        }).
        then(function(response) {
          $scope.$parent.notificationClicked($scope.data.pk);
          $scope.data.read = true;
        });
        if ($scope.notificationType == 'postLike' || $scope.notificationType == 'postComment') {
          $scope.openPost('right', true, {
            data: $scope.notificationData,
            onDelete: function() {
              return;
            }
          })
        } else if ($scope.notificationType == 'pictureLike' || $scope.notificationType == 'pictureComment') {
          $scope.openAlbum('right', true, {
            data: $scope.notificationData,
            parent: $scope.objParent,
            onDelete: ""
          })
        } else if ($scope.notificationType == 'codeComment') {
          $scope.openCommit()
        }
      }
    },
  };
});

//
// app.directive('chatWindow', function ($users) {
//   return {
//     templateUrl: '/static/ngTemplates/chatWindow.html',
//     restrict: 'E',
//     transclude: true,
//     replace:true,
//     scope:{
//       friendUrl : '=',
//       pos : '=',
//       cancel :'&',
//     },
//     controller : function($scope ,$location,  $anchorScroll, $http, $templateCache, $timeout, ngAudio){
//       // console.log($scope.pos);
//       $scope.me = $users.get("mySelf");
//       $scope.friend = $users.get($scope.friendUrl);
//       // console.log($scope.friend);
//       $scope.sound = ngAudio.load("static/audio/notification.mp3");
//
//       $scope.isTyping = false;
//       $scope.toggle = true;
//       $scope.messageToSend = "";
//       $scope.status = "N"; // neutral / No action being performed
//       $scope.send = function(){
//         var msg = angular.copy($scope.messageToSend)
//         if (msg!="") {
//           $scope.status = "M"; // contains message
//           var dataToSend = {message:msg , user: $scope.friend.pk , read:false};
//           $http({method: 'POST', data:dataToSend, url: '/api/PIM/chatMessage/'}).
//           then(function(response){
//             $scope.ims.push(response.data)
//             $scope.senderIsMe.push(true);
//             connection.session.publish('service.chat.'+$scope.friend.username, [$scope.status , response.data.message , $scope.me.username , response.data.pk], {}, {acknowledge: true}).
//             then(function (publication) {});
//             $scope.messageToSend = "";
//           })
//         }
//       }; // send function
//
//       $scope.addMessage = function(msg , url){
//         $scope.sound.play();
//         $http({method : 'PATCH' , url : '/api/PIM/chatMessage/' +url + '/?mode=' , data : {read : true}}).
//         then(function(response) {
//           $scope.ims.push(response.data);
//           $scope.senderIsMe.push(false);
//         });
//       };
//
//       $scope.fetchMessages = function() {
//         $scope.method = 'GET';
//         $scope.url = '/api/PIM/chatMessageBetween/?other='+$scope.friend.username;
//         $scope.ims = [];
//         $scope.imsCount = 0;
//         $scope.senderIsMe = [];
//         $http({method: $scope.method, url: $scope.url}).
//         then(function(response) {
//           $scope.imsCount = response.data.length;
//           for (var i = 0; i < response.data.length; i++) {
//             var im = response.data[i];
//             var sender = $users.get(im.originator)
//             if (sender.username == $scope.me.username) {
//               $scope.senderIsMe.push(true);
//             }else {
//               $scope.senderIsMe.push(false);
//             }
//             $scope.ims.push(im);
//             // console.log($scope.ims.length);
//           }
//         });
//       };
//       $scope.fetchMessages();
//       $scope.scroll = function(){
//         var $id= $("#scrollArea"+$scope.pos);
//         $id.scrollTop($id[0].scrollHeight);
//       }
//     },
//     // attrs is the attrs passed from the main scope
//     link: function postLink(scope, element, attrs) {
      // scope.$watch('messageToSend', function(newValue , oldValue ){
      //   // console.log("changing");
      //   scope.status = "T"; // the sender is typing a message
      //   if (newValue!="") {
      //     connection.session.publish('service.chat.'+ scope.friend.username, [scope.status , scope.messageToSend , scope.me.username]);
      //   }
      //   scope.status = "N";
      // }); // watch for the messageTosend
//       scope.$watch('ims.length', function( ){
//         setTimeout( function(){
//           scope.scroll();
//         }, 500 );
//       });
//       scope.$watch('pos', function( newValue , oldValue){
//         // console.log(newValue);
//         scope.location = 30+newValue*320;
//         // console.log("setting the new position value");
//         // console.log();
//       });
//     } // link
//   };
// });
