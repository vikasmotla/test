app.directive('reactions', ['$sce', function($sce) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.facebookReactions(attrs.pk);
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
        if (attrs.stripBr && html == '<br>') {
          html = '';
        }
        ngModel.$setViewValue(html);
      }
    }
  };
}]);

app.directive('socialPost', function() {
  return {
    templateUrl: '/static/ngTemplates/directive.socialPost.html',
    restrict: 'E',
    replace: true,
    scope: {
      data: '=',
      index: '=',
      me: '=',
      particularpost: '='
    },
    controller: function($scope, $state, $stateParams, $http, Flash, $timeout, $sce, $users, $uibModal) {

      // console.log($scope.data);
      $scope.p = $scope.data;
      // console.log('Mypk', $scope.me);

      $scope.showIntrestedButtons = false;

      if ($scope.particularpost != undefined) {
        $scope.showIntrestedButtons = true;
        $scope.p.showComments = true;

        $scope.reply = function(responsePk, cmt) {
          console.log('resval', responsePk);
          $uibModal.open({
            templateUrl: '/static/ngTemplates/app.social.leads.reply.html',
            size: 'md',
            backdrop: true,
            resolve: {
              timeline: function() {
                return $scope.p.timeline
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

      }

      $scope.showComments = false;
      $scope.allComments = function(indx) {
        console.log('open all cmts....', indx);
        $scope.p.showComments = !$scope.p.showComments
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
              return $scope.p;
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
              return $scope.p;
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
            post: function() {
              return $scope.p;
            }
          },
          controller: function($scope, $rootScope, $state, post, $uibModal, $uibModalInstance) {
            console.log('modal img ctrl', post);
            $scope.showBtn = ''
            $scope.input = {
              num: '',
              email: ''
            }
            $scope.send = function(typ) {
              console.log('send Type is ', typ, $scope.input);
              console.log('data issss', post);
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
            post: function() {
              return $scope.p;
            },
            typ: function() {
              return typ;
            }
          },
          controller: function($scope, $rootScope, $state, post, typ, $uibModal, $uibModalInstance) {
            $scope.typ = typ
            $scope.responseForm = {
              txt: '',
              value: 0,
              fil: emptyFile
            }
            $scope.post = function() {
              console.log('send Type is ', typ, $scope.responseForm);
              console.log('data issss', post);
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
              fd.append('parent', post.pk);
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
                var imgTypes = ['png', 'svg', 'gif', 'jpg', 'jpeg']
                if (response.data.fil != null) {
                  var filtyp = response.data.fil.split('.').slice(-1)[0]
                  if (imgTypes.indexOf(filtyp) >= 0) {
                    var imgShow = true
                  }
                }
                post.timeline.push({
                  typ: 'offer',
                  created: response.data.created,
                  data: response.data,
                  imgShow: imgShow
                })
                $uibModalInstance.dismiss();
              })
            }
          }
        })
      }

      // }
      $scope.postCommentConfig = {
        expansion: true,
        placeholder: 'Make An Offer ....'
      }

      $scope.postComment = function(parent) {
        console.log('dataaaaaaaaaaaaaaaa', parent);
        if (($scope.p.podtEditComments.txt == '' || $scope.p.podtEditComments.txt.length == 0 || $scope.p.podtEditComments.txt == '<br>') && ($scope.p.podtEditComments.file == emptyFile)) {
          console.log('emptyyyyyyyyyyyy');
          Flash.create('warning', 'Please Write Some Comment')
          return
        }

        var fd = new FormData();
        if ($scope.p.podtEditComments.txt != '' || $scope.p.podtEditComments.txt.length != 0 || $scope.p.podtEditComments.txt != '<br>') {
          fd.append('txt', $scope.p.podtEditComments.txt);
        }
        if ($scope.p.podtEditComments.file != emptyFile) {
          fd.append('fil', $scope.p.podtEditComments.file);
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
        then(function(response) {
          console.log('commmmmmm', response.data);
          $scope.p.podtEditComments = {
            txt: '',
            file: emptyFile,
            parent: $scope.p.pk
          }
          $scope.p.comments.push(response.data)
          $scope.p.timeline.push({
            typ: 'comment',
            created: response.data.created,
            data: response.data
          })

          console.log('post pk', $scope.p.pk);
          console.log('comment pk', response.data.pk);
        })

      };

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


    },
  };
});


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
    controller: function($scope, $state, $uibModal, $stateParams, $users, $timeout, $http, $sce, Flash) {

      //fetch the messages with $scope.pk
      console.log('in chat dirrrrrrrrrrrrrr', $scope.user, $scope.pos);
      $scope.me = $users.get("mySelf");
      $scope.friend = $users.get($scope.user)

      $scope.toggler = function() {
        $scope.toggle = !$scope.toggle;
        $scope.scroll();
      }
      $scope.cancel = function() {
        $scope.close($scope.pos);
      }

      $scope.expandImage = function(imageUrl) {
        console.log('asddddddddd');
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

      $scope.fetchMessages = function() {
        $scope.method = 'GET';
        $scope.url = '/api/PIM/chatMessageBetween/?other=' + $scope.friend.username;

        $scope['abc' + $scope.friend.pk] = [1, 2, 3];
        console.log($scope['abc' + $scope.friend.pk]);

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
            im.message = $sce.getTrustedHtml(im.message)
            $scope.ims.push(im);
            // console.log($scope.ims.length);
          }
          $scope.scroll(1000);
        });
      };
      $scope.fetchMessages();

      $scope.scroll = function(delay) {
        if (delay == undefined) {
          delay = 100;
        }
        $timeout(function() {
          var $id = $("#scrollArea" + $scope.friend.pk);
          console.log($id);
          console.log($id[0].scrollTop, $id[0].scrollHeight);
          $id.scrollTop($id[0].scrollHeight);
          console.log($id[0].scrollTop, $id[0].scrollHeight);
        }, delay)
      }


      // $scope.attachInComments = function() {
      //   console.log('attach file');
      //   console.log('#filePicker' + $scope.comment.parent);
      //   $('#filePicker' + $scope.comment.parent).click();
      // }

      $scope.fileSize = 0;

      $scope.chat = {
        messageToSend: '',
        fileToSend: emptyFile
      }

      $scope.$watch('chat.fileToSend', function(newValue, oldValue) {
        if (newValue == emptyFile) {
          return;
        }
        $scope.fileSize = newValue.size;
        $scope.fileName = newValue.name;
      });

      $scope.checkFile = function() {
        console.log('file sizee');
        if ($scope.fileSize == 0) {
          $scope.attach();
        } else {
          $scope.removeFile();
        }
      }

      $scope.attach = function() {
        console.log('add');
        $('#filePickerChat' + $scope.friend.pk).click();
        console.log('attach...');
      }

      $scope.removeFile = function() {
        console.log('remove');
        $scope.fileSize = 0;
        $scope.chat.fileToSend = emptyFile;
      }

      $scope.chat.messageToSend = "";
      $scope.chat.fileToSend = emptyFile;

      $scope.send = function() {
        console.log('sending');


        // var msg = angular.copy($scope.messageToSend)
        var msg = $scope.chat.messageToSend;
        var file = $scope.chat.fileToSend;

        console.log('messssageeeeee', $scope.chat.messageToSend, $scope.chat.fileToSend);
        if (msg != "" || file != emptyFile) {
          var fd = new FormData();
          if (msg != "" && file != emptyFile) {
            fd.append('message', msg);
            fd.append('attachment', file);
            fd.append('read', false);
            fd.append('user', $scope.friend.pk);
          } else if (file == emptyFile) {
            console.log('send only msg');
            fd.append('message', msg);
            fd.append('read', false);
            fd.append('user', $scope.friend.pk);
          } else {
            console.log('send only image');
            fd.append('attachment', file);
            fd.append('read', false);
            fd.append('user', $scope.friend.pk);
          }
          $scope.status = "M"; // contains message
          console.log('patch');
          $scope.isTyping = false;
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
            response.data.message = $sce.getTrustedHtml(response.data.message)
            $scope.ims.push(response.data)
            $scope.senderIsMe.push(true);
            $scope.scroll(50);

            $scope.chat = {
              messageToSend: '',
              fileToSend: emptyFile
            }
            $scope.fileSize = 0;

            $scope.connection.session.publish('service.chat.' + $scope.friend.username, [$scope.status, $scope.me.username, response.data.message, response.data.pk], {}, {
              acknowledge: true
            }).
            then(function(publication) {});

          })
        }
      }


      $scope.isTyping = false;
      $scope.chatResponse = function(args) {
        console.log(args[0]);
        if (args[1] != $scope.friend.username) {
          return;
        }

        if (args[0] == 'T') {
          $timeout(function() {
            $scope.isTyping = true;
          }, 300);
          $timeout(function() {
            $scope.isTyping = false;
            console.log($scope.isTyping);
          }, 3000);
          // $scope.isTyping = true;
          // console.log('typinmgg', args[1], $scope.isTyping);
        } else if (args[0] == 'M') {
          console.log('message came', args[1]);
          $http({
            method: "GET",
            url: '/api/PIM/chatMessageBetween/' + args[3] + '/'
          }).
          then(function(response) {
            console.log('resssssss', response.data);
            response.data.message = $sce.getTrustedHtml(response.data.message)
            $scope.ims.push(response.data);
            $scope.senderIsMe.push(false);
            $scope.scroll(50);
          });
        }


      }

      $scope.connection = new autobahn.Connection({
        url: 'ws://skinstore.monomerce.com:8080/ws',
        realm: 'default'
      });

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

      $scope.$watch('chat.messageToSend', function(newValue, oldValue) {
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

    },
  };
});

app.directive('commentEdit', function() {
  return {
    templateUrl: '/static/ngTemplates/directive.commentEdit.html',
    restrict: 'E',
    replace: true,
    scope: {
      comment: '=',
      send: '=',
      config: '='
    },
    controller: function($scope, $state, $stateParams, $http, Flash, $timeout) {
      $scope.backupTxt = angular.copy($scope.comment.txt);
      $timeout(function() {
        $scope.comment.txt = $scope.backupTxt;
        if (typeof $scope.comment.file == 'string') {
          $scope.isImage = true;
          $scope.fileSize = 10;
          $scope.fileName = $scope.comment.file.split('postMedia/')[1];
          // document.getElementById("filePreview"  + $scope.comment.parent ).src = $scope.comment.file;
        }
      }, 1000);



      $timeout(function() {
        $('div#auto').tagautocomplete({
          source: function(query, process) {

            var position = getCaretPosition(document.getElementById('auto'));
            query = query.substring(0, position);

            var regex = new RegExp("(^|\\s)([" + this.options.character + "][\\w-]*)$");
            var result = regex.exec(query);

            if (result && result[2]) {
              result = result[2].trim().toLowerCase();
            } else {
              result = '';
              return
            }


            return $.get('/api/HR/users/?', {
              username__contains: result.replace('@', '')
            }, function(data) {
              var toReturn = [];
              for (var i = 0; i < data.length; i++) {
                toReturn.push('@' + data[i].username)
              }

              return process(toReturn); //if JSON is [ "options" : { ...}
            });

          }
        });
      }, 1000)


      if ($scope.config == undefined) {
        $scope.placeholder = 'Write Comment';
        $scope.expansion = true;
      } else {
        $scope.placeholder = $scope.config.placeholder;
        $scope.expansion = $scope.config.expansion;
      }

      $scope.height = '';
      $scope.isImage = false;
      $scope.fileSize = 0;


      $scope.$watch('comment.txt', function(newValue, oldValue) {
        if (newValue == undefined || $scope.expansion == false) {
          return;
        }

        // return

        if (newValue == '') {
          $scope.height = '';
        } else {

          var cnt = (newValue.match(/<br>/g) || []).length;
          if (cnt > 4) {
            $scope.height = (cnt * 2) + 'em';
          } else {
            $scope.height = '8em';
          }

        }
      });

      $scope.focus = function() {
        console.log($scope.comment.txt);
        $scope.comment.txt = $scope.comment.txt.replace('<!-- ngIf: !focused -->', '')
        $scope.focused = true;
      }

      $scope.blurr = function() {
        if ($scope.comment.txt == '<br>') {
          console.log($scope.comment.txt);
          $scope.comment.txt = '';
        }
        $scope.focused = false;
      }

      $scope.checkFile = function() {
        console.log('file sizee');
        if ($scope.fileSize == 0) {
          $scope.attachInComments();
        } else {
          $scope.removeFile();
        }
      }

      $scope.attachInComments = function() {
        console.log('#filePicker' + $scope.comment.parent);
        $('#filePicker' + $scope.comment.parent).click();
      }

      $scope.$watch('comment.file', function(newValue, oldValue) {
        if (newValue == emptyFile) {
          $scope.fileSize = 0;
          return;
        }
        if (typeof newValue == 'string') {
          console.log($scope.comment.file, $scope.comment.parent);
          $timeout(function() {
            document.getElementById("filePreview" + $scope.comment.parent).src = $scope.comment.file;
          }, 1000)
        }
        if (typeof newValue.name != 'undefined') {
          $scope.fr = new FileReader();
          $scope.fr.readAsDataURL(newValue);

          var fileType = $scope.comment.file.type.split('/')[0];

          if (fileType == 'image') {
            console.log('its image');
            $scope.isImage = true;
            $scope.fr.onload = function(oFREvent) {
              document.getElementById("filePreview" + $scope.comment.parent).src = oFREvent.target.result;
            };
          } else {
            $scope.isImage = false;
          }

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
        $scope.openChat($scope.friend, $scope.data.count)
        $scope.data.count = 0;
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
      type: '='
    },
    controller: function($scope, $http, $users, $aside, $window) {

      console.log($scope.type);

      if ($scope.type == 'follow') {
        console.log('folllllllllllloooooowwwww');
        $scope.notificationType = $scope.type;
        // $scope.notificationPost =
        var friendPk = $scope.data.shortInfo.split(':');
        $scope.friend = parseInt(friendPk[0]);
        $scope.openFollower = function(friendPk, notifPk) {


          $http({
            method: 'PATCH',
            url: '/api/PIM/notification/' + notifPk + '/',
            data: {
              read: true
            }
          }).
          then(function(response) {
            console.log('reaaaaaaaaaad', response.data);
            $window.location.href = ('/social/profile/' + friendPk);
            // console.log($scope.data.read);
          });


        }
      } else {
        console.log($scope.data.originator);
        var type = $scope.data.originator.split('||');

        $scope.notificationType = type[0];
        $scope.notificationPost = parseInt(type[1]);

        var friendPk = $scope.data.shortInfo.split(':');

        $scope.friend = parseInt(friendPk[0]);
        $scope.openNotification = function(postPk, notifPk) {
          console.log('pos', postPk);
          $http({
            method: 'PATCH',
            url: '/api/PIM/notification/' + notifPk + '/',
            data: {
              read: true
            }
          }).
          then(function(response) {
            console.log('reaaaaaaaaaad', response.data);
            $window.location.href = ('/social/posts/' + postPk);
            // console.log($scope.data.read);
          });
        }
      }

    },
  };
});

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
//       scope.$watch('messageToSend', function(newValue , oldValue ){
//         // console.log("changing");
//         scope.status = "T"; // the sender is typing a message
//         if (newValue!="") {
//           connection.session.publish('service.chat.'+ scope.friend.username, [scope.status , scope.messageToSend , scope.me.username]);
//         }
//         scope.status = "N";
//       }); // watch for the messageTosend
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
