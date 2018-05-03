app.config(function($stateProvider) {

  $stateProvider
    .state('home.events', {
      url: "/events/:id?action",
      templateUrl: '/static/ngTemplates/app.home.events.html',
      controller: 'admin.events'
    })

});

app.controller('admin.events', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.home.events.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/ERP/event/',
    searchField: 'name',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit Paper :';
          var appType = 'paperEditor';
        } else if (action == 'details') {
          var title = 'Paper Details :';
          var appType = 'paperExplorer';
        }


        $scope.addTab({
          title: title + $scope.data.tableData[i].pk,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i,
            paper: $scope.data.tableData[i]
          },
          active: true
        })
      }
    }

  }


  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.closeTab = function(index) {
    $scope.tabs.splice(index, 1)
  }

  $scope.addTab = function(input) {
    console.log(JSON.stringify(input));
    $scope.searchTabActive = false;
    alreadyOpen = false;
    for (var i = 0; i < $scope.tabs.length; i++) {
      if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
        $scope.tabs[i].active = true;
        alreadyOpen = true;
      } else {
        $scope.tabs[i].active = false;
      }
    }
    if (!alreadyOpen) {
      $scope.tabs.push(input)
    }
  }

});

app.controller('admin.events.form', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {

  $scope.eventForm = {
    name : '',
    event_On : '',
    event_ends_On : '',
    regEndsOn : '',
    venue : '',
    entryFee : 0,
    description : '',
    venueGMapUrl : '',
  }
  $scope.eventItemForm = {
    title : '',
      typ : '',
      description : '',
      pic : '',
      entryFee : 0,
      moderator : '',
      dayNumber : 0,
  }
});
