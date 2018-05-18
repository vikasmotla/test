var app = angular.module('app', ['ui.router', 'ui.bootstrap', 'ngSanitize', 'ngAside', 'ngDraggable', 'flash', 'chart.js', 'ngTagsInput', 'ui.tinymce', 'hljs', 'mwl.confirm', 'ngAudio', 'uiSwitch', 'rzModule', 'ngMap' ]);

app.config(function($stateProvider, $urlRouterProvider, $httpProvider, $provide, hljsServiceProvider) {
  hljsServiceProvider.setOptions({
    // replace tab with 4 spaces
    tabReplace: '    '
  });

  $urlRouterProvider.otherwise('/home');
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;


});

app.run(['$rootScope', '$state', '$stateParams', '$permissions', function($rootScope, $state, $stateParams, $permissions) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  $rootScope.$on("$stateChangeError", console.log.bind(console));
}]);


// Main controller is mainly for the Navbar and also contains some common components such as clipboad etc
app.controller('main', function($scope, $state, $users, $aside, $http, $timeout, $uibModal, $permissions, ngAudio) {
  $scope.me = $users.get('mySelf');
  $scope.headerUrl = '/static/ngTemplates/header.html',
    $scope.sideMenu = '/static/ngTemplates/sideMenu.html',
    $scope.themeObj = {
      main: '#005173',
      highlight: '#04414f'
    };
  $scope.dashboardAccess = false;
  $scope.brandLogo = BRAND_LOGO;

  $scope.sound = ngAudio.load("/static/audio/notification.ogg");


  $scope.terminal = {
    command: '',
    show: false,
    showCommandOptions: false
  };

  $scope.about = function() {
    var modalInstance = $uibModal.open({
      templateUrl: '/static/ngTemplates/about.html',
      size: 'lg',
      controller: function($scope) {},
    });
  };

  $scope.commandOptionsClicked = function(action) {
    if (action == 'im') {
      $scope.addIMWindow($scope.terminal.command.pk)
    } else if (action == 'social') {
      $state.go('home.social', {
        id: $scope.terminal.command.pk
      })
    }
    $scope.terminal = {
      command: '',
      show: false,
      showCommandOptions: false
    };
  }

  $scope.userSearch = function(query) {
    if (!query.startsWith('@')) {
      return;
    }
    var searchQuery = query.split('@')[1]
    if (searchQuery.length == 0) {
      return;
    }
    return $http.get('/api/HR/userSearch/?username__contains=' + searchQuery).
    then(function(response) {
      return response.data;
    })
  };
  $scope.getName = function(u) {
    if (typeof u == 'undefined' || u == null || u.username == null || typeof u.first_name == 'undefined') {
      return '';
    }
    return '@ ' + u.first_name + '  ' + u.last_name;
  }

  $scope.$watch('terminal.command.username', function(newValue, oldValue) {
    console.log(newValue);
    if (typeof newValue != 'undefined') {
      $scope.terminal.showCommandOptions = true;
    }
  });

  $scope.parseCommand = function() {
    if ($scope.terminal.command == '') {
      $scope.terminal.show = false;
      return;
    }
    // parse the command
    // possible commands for the calendar app :
    // 'remind me to ask bill for the report on the project'
    // arrange a meeting with @team ELMS at 2 pm on alternate working day
    // todo code review by EOD
    var cmd = $scope.terminal.command;
    if (typeof cmd == 'string' && cmd.startsWith('@')) {
      // user is searching for a user



    }

  };


  $scope.$watch('terminal.show', function(newValue, oldValue) {
    // once the termial is visible the timer starts , after 150 seconds is there is no command
    // in the termial then the terminal is closed
    if (newValue == false) {
      return;
    }
    $timeout(function() {
      if ($scope.terminal.command.length == 0) {
        $scope.closeTerminal();
      }
    }, 150000);
  });

  $scope.closeTerminal = function() {
    if ($scope.terminal.command.length == 0) {
      $scope.terminal.show = false;
    }
  }



  settings = {
    theme: $scope.themeObj,
    mobile: $scope.me.profile.mobile
  };
  $scope.openSettings = function(position, backdrop, data) {
    $scope.asideState = {
      open: true,
      position: position
    };

    function postClose() {
      $scope.asideState.open = false;
      $scope.me = $users.get('mySelf', true)
    }

    $aside.open({
      templateUrl: '/static/ngTemplates/settings.html',
      placement: position,
      size: 'md',
      backdrop: backdrop,
      controller: function($scope, $uibModalInstance, $users, $http, Flash) {
        emptyFile = new File([""], "");
        $scope.settings = settings;
        $scope.settings.displayPicture = emptyFile;
        $scope.me = $users.get('mySelf');
        $scope.statusMessage = '';
        $scope.settings.oldPassword = '';
        $scope.settings.password = '';
        $scope.settings.password2 = '';
        $scope.cancel = function(e) {
          $uibModalInstance.dismiss();
          // e.stopPropagation();
        };

        $scope.changePassword = function() {
          if ($scope.settings.password != '' && $scope.settings.password2 == $scope.settings.password && $scope.settings.oldPassword != '') {
            $http({
              method: 'PATCH',
              url: '/api/HR/users/' + $scope.me.pk + '/',
              data: {
                password: $scope.settings.password,
                oldPassword: $scope.settings.oldPassword
              }
            }).
            then(function(response) {
              Flash.create('success', response.status + ' : ' + response.statusText);
            }, function(response) {
              Flash.create('danger', response.status + ' : ' + response.statusText);
            });
          }
        }

        $scope.saveSettings = function() {
          var fdProfile = new FormData();
          if ($scope.settings.displayPicture != emptyFile) {
            fdProfile.append('displayPicture', $scope.settings.displayPicture);
          }
          if (isNumber($scope.settings.mobile)) {
            fdProfile.append('mobile', $scope.settings.mobile);
          }
          $http({
            method: 'PATCH',
            url: '/api/HR/profile/' + $scope.me.profile.pk + '/',
            data: fdProfile,
            transformRequest: angular.identity,
            headers: {
              'Content-Type': undefined
            }
          }).
          then(function(response) {
            Flash.create('success' , 'Saved');
          });

        }
      }
    }).result.then(postClose, postClose);
  }

});

app.controller('controller.generic.menu', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {
  // settings main page controller

  var parts = $state.current.name.split('.');
  $scope.moduleName = parts[0];
  $scope.appName = parts[1];

  var getState = function(input) {
    var parts = input.name.split('.');
    // console.log(parts);
    return input.name.replace('app', $scope.moduleName)
  }

  $scope.apps = [];
  $scope.rawApps = [];

  console.log($scope.appName);
  console.log($scope.moduleName);

  $scope.buildMenu = function(apps) {
    console.log(apps);
    for (var i = 0; i < apps.length; i++) {
      var a = apps[i];
      a.name = a.name.replace('sudo' , 'app')
      var parts = a.name.split('.');
      if (parts.length != 3 || parts[1] != $scope.appName) {
        continue;
      }
      a.state = getState(a)
      a.dispName = parts[parts.length - 1];
      $scope.apps.push(a);
    }
  }

  var as = $permissions.apps();
  if (typeof as.success == 'undefined') {
    $scope.rawApps = as;
    $scope.buildMenu(as);
  } else {
    as.success(function(response) {
      $scope.buildMenu(response);
      $scope.rawApps = response;
    });
  };

  $scope.getIcon = function() {
    if ($scope.rawApps.length == 0) {
      return ''
    } else {
      for (var i = 0; i < $scope.rawApps.length; i++) {
        if ($scope.rawApps[i].name.indexOf($scope.appName)!= -1 ) {
          return $scope.rawApps[i].icon;
        }
      }
    }
  };

  $scope.goToRoot = function() {
    $state.go($scope.moduleName + '.' + $scope.appName)
  }

  $scope.isActive = function(index) {
    var app = $scope.apps[index]
    if (angular.isDefined($state.params.app)) {
      return $state.params.app == app.name.split('.')[2]
    } else {
      return $state.is(app.name.replace('app', $scope.moduleName))
    }
  }

});

// Main controller is mainly for the Navbar and also contains some common components such as clipboad etc
app.controller('sideMenu', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $rootScope) {

  $scope.user = $users.get('mySelf');

  $scope.fixedApps = [
    {icon : 'home' , state : 'home'},
    {icon : 'calendar' , state : 'home.calendar'},
    // {icon : 'user' , state : 'home.profile'},
  ]

  var parts = $state.current.name.split('.');

  $scope.moduleName = parts[0];
  $scope.appName = parts[1];
  $scope.rawApps = $permissions.apps();

  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams, options) {
    // if (toState.name == $scope.moduleName) {
    //   return;
    // }
    $scope.moduleName = toState.name.split('.')[0];
    if (typeof $scope.rawApps.success == 'undefined') {
      $scope.rawApps = $scope.rawApps;
      $scope.buildMenu();
    } else {
      $scope.rawApps.success(function(response) {
        $scope.rawApps = response;
        $scope.buildMenu();
      });
    };
  });

  $scope.inExcludedApps = function(a) {
    var apps = ['app.mail' , 'app.calendar' , 'app.dashboard' , 'app.notes', 'app.users']
    for (var i = 0; i < apps.length; i++) {
      if (a.name == apps[i]) {
        return true;
      }
    }
    return false;
  }

  var getState = function(input) {
    var parts = input.name.split('.');
    if (parts[0] == 'sudo') {
      return input.name.replace('sudo', $scope.moduleName)
    }else {
      return input.name.replace('app', $scope.moduleName)
    }
  }

  $scope.buildMenu = function() {
    $scope.apps = [];

    for (var j = 0; j < $scope.rawApps.length; j++) {
      var a = $scope.rawApps[j];
      var parts = a.name.split('.');
      if (parts.length>2 || $scope.inExcludedApps(a)) {
        continue;
      }
      a.state = getState(a)
      a.dispName = parts[parts.length - 1];
      $scope.apps.push(a);
    }
  }



  $scope.getIcon = function() {
    if ($scope.rawApps.length == 0) {
      return ''
    } else {
      for (var i = 0; i < $scope.rawApps.length; i++) {
        if ($scope.rawApps[i].name == 'app.' + $scope.appName) {
          return $scope.rawApps[i].icon;
        }
      }
    }
  };

  $scope.goToRoot = function() {
    $state.go($scope.moduleName + '.' + $scope.appName)
  }

  $scope.isActive = function(index) {
    var app = $scope.apps[index]
    if (angular.isDefined($state.params.app)) {
      return $state.params.app == app.name.split('.')[2]
    } else {
      return $state.is(app.name.replace('app', $scope.moduleName))
    }
  }

})

app.config(function($stateProvider ){

  $stateProvider
  .state('home', {
    url: "/home",
    views: {
      "": {
        templateUrl: '/static/ngTemplates/home.html',
        controller:'controller.home.main'
      },
      "@home": {
        templateUrl: '/static/ngTemplates/app.home.dashboard.html',
        controller : 'controller.home'
      }
    }
  })
  .state('home.calendar', {
    url: "/calendar",
    templateUrl: '/static/ngTemplates/app.home.calendar.html',
    controller: 'controller.home.calendar'
  })
  // .state('home.profile', {
  //   url: "/profile",
  //   templateUrl: '/static/ngTemplates/app.home.profile.html',
  //   controller: 'controller.home.profile'
  // })


});

app.controller("controller.home.main", function($scope , $state) {

})
