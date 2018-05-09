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
          var title = 'Edit Event :';
          var appType = 'eventEditor';
        } else if (action == 'details') {
          var title = 'Event Details :';
          var appType = 'eventExplorer';
        }


        $scope.addTab({
          title: title + $scope.data.tableData[i].pk,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i,
            eventData: $scope.data.tableData[i]
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

app.controller('admin.events.explore', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions,$sce) {
  if ($scope.tab != undefined || $scope.tab.data != undefined) {
    $scope.eventDetails = $scope.tab.data.eventData
    $http({method : 'GET' , url : '/api/ERP/eventItem/?event=' + $scope.eventDetails.pk}).
    then(function(response) {
      $scope.eventItemsDetails = response.data;
    })
    $http({method : 'GET' , url : '/api/ERP/eventRegDetails/?event=' + $scope.eventDetails.pk + '&mode=all'}).
    then(function(response) {
      $scope.eventRegDetails = response.data;
      $scope.showDownloadBtn = false
      if ($scope.eventRegDetails.length > 0) {
        $scope.showDownloadBtn = true
      }
      console.log('resssssssssss',response.data);
    })
  }
  // $scope.regDownload = function(a){
  //   console.log(a);
  //   $http({method : 'GET' , url : '/api/ERP/eventRegDetails/?event=' + a + '&mode=download'}).
  //   then(function(response) {
  //     console.log('resssssssssss',response.data);
  //     // $scope.eventRegDetails = response.data;
  //   })
  // }
});

app.controller('admin.events.form', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions,$sce) {

  $scope.eventItems = []
  if ($scope.tab == undefined || $scope.tab.data == undefined) {
    $scope.eventForm = {
      name : '',
      event_On : '',
      event_ends_On : '',
      regEndsOn : '',
      venue : '',
      entryFee : 0,
      description : '',
      venueGMapUrl : '',
      promoted: false
    }
    $scope.mode = 'new'
  }else {
    console.log('tabbbbbbbb',$scope.tab.data);
    $scope.eventForm = $scope.tab.data.eventData
    $scope.eventForm.description=$sce.getTrustedHtml($scope.eventForm.description)
    $scope.mode = 'edit'
    $http({method : 'GET' , url : '/api/ERP/eventItem/?event=' + $scope.eventForm.pk}).
    then(function(response) {
      $scope.eventItems = response.data;
    })
  }
  console.log('event data',$scope.eventForm);
  $scope.resetEventItemForm = function(){
    $scope.eventItemForm = {
      title : '',
      typ : '',
      description : '',
      pic : '',
      entryFee : 0,
      moderator : '',
      dayNumber : 1,
      eventTime : '8:00 AM'
    }
  }
  $scope.resetEventItemForm()
  $scope.formTyp = 'form'
  $scope.editEventItem = function(idx){
    $scope.eventItemForm = $scope.eventItems[idx]
    $scope.eventItems.splice(idx,1)
  }
  $scope.saveEvent = function(){
    console.log($scope.eventForm.promoted);
    if ($scope.eventForm.name.length == 0 || $scope.eventForm.event_On.length == 0 || $scope.eventForm.event_ends_On.length == 0 || $scope.eventForm.regEndsOn.length == 0 || $scope.eventForm.venue.length == 0 || $scope.eventForm.description.length == 0 || $scope.eventForm.venueGMapUrl.length == 0 || $scope.eventForm.entryFee < 0) {
      Flash.create('warning','All Fields Are Required')
      return

    }else {
      var f = $scope.eventForm
    }
    if ($scope.eventForm.description.length > 30000 ) {
      Flash.create('warning','Description Length Is Too Long')
      return
    }
    if (typeof f.pk != 'undefined') {
      var method = 'PATCH'
      var url = '/api/ERP/event/' + f.pk + '/'
    }else {
      var method = 'POST'
      var url = '/api/ERP/event/'
    }
    console.log(f);
    $http({method : method , url : url, data : f}).
    then(function(response) {
      Flash.create('success' , 'Event Saved')
      $scope.eventForm = response.data
      $scope.formTyp = 'view'
    })
  }
  $scope.saveEventItem = function(){
    var f = $scope.eventItemForm
    console.log(f.moderator,typeof f.moderator);
    var fd = new FormData()
    if (f.title == null || f.title.length == 0) {
      Flash.create('warning','Title Is Required')
      return
    }
    if (f.description != null && f.description.length > 10000) {
      Flash.create('warning','Description Length Is Too Long')
      return
    }
    if (f.typ != null && f.typ.length != 0) {
      fd.append('typ' , f.typ)
    }
    if (f.moderator != null && f.moderator.length != 0) {
      fd.append('moderator' , f.moderator)
    }
    if (f.entryFee != null && f.entryFee >= 0 && typeof f.entryFee != 'string') {
      fd.append('entryFee' , f.entryFee)
    }else {
      fd.append('entryFee' , 0)
    }
    if (f.dayNumber != null && f.dayNumber >1  && typeof f.dayNumber != 'string') {
      fd.append('dayNumber' , f.dayNumber)
    }else {
      fd.append('dayNumber' , 1)
    }
    if (f.pic != null && typeof f.pic != 'string' && f.pic != emptyFile) {
      fd.append('pic' , f.pic);
    }
    if (f.description != null && f.description.length != 0) {
      fd.append('description' , f.description)
    }
    fd.append('title' , f.title)
    fd.append('eventTime' , f.eventTime)
    fd.append('event' , $scope.eventForm.pk)
    console.log('enent item dataaaaaaaa',f);
    if (typeof f.pk != 'undefined') {
      var method = 'PATCH'
      var url = '/api/ERP/eventItem/' + f.pk + '/'
    }else {
      var method = 'POST'
      var url = '/api/ERP/eventItem/'
    }
    console.log(fd);
    $http({
      method: method,
      url: url,
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      Flash.create('success', 'Event Item Saved');
      console.log('dataaaa',response.data);
      $scope.eventItems.push(response.data)
      $scope.resetEventItemForm()
    })
  }

});
