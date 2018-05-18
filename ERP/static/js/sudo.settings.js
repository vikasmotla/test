app.config(function($stateProvider ){

  $stateProvider
  .state('home.settings', {
      url: "/settings",
      views: {
         "": {
            templateUrl: '/static/ngTemplates/app.ERP.settings.html',
            controller : 'admin.settings'
         }
      }
    });
})



app.controller('admin.settings' , function($scope , $stateParams , $http , $aside , $state , Flash , $users , $filter){

  $scope.settings = [];

  $http({method : 'GET' , url : '/api/ERP/appSettingsAdminMode/'}).
  then(function(response) {
    $scope.settings = response.data;
  })


  $scope.save = function(indx) {

    var s = $scope.settings[indx];

    if (s.fieldType == 'flag') {
      var toSend = {flag : s.flag}
    }else {
      var toSend = {value : s.value}
    }

    $http({method : 'PATCH' , url : '/api/ERP/appSettingsAdminMode/'+ s.pk + '/' , data : toSend}).
    then(function(response) {
      Flash.create('success' , 'Saved');
    })

  }
  $scope.name = 'sai'

  // $http({method : 'GET' , url : '/api/ERP/appSettingsAdminMode/'}).
  // then(function(response) {
  //   $scope.settings = response.data;
  // })

});
