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

  $http({method : 'GET' , url : '/api/ERP/featuredPage/'}).
  then(function(response) {
    $scope.featuredPageData = response.data;
  })

  $scope.featuredPageForm = {typ:'',obj:''}
  $scope.$watch('featuredPageForm.typ' , function(newValue , oldValue) {
    $scope.featuredPageForm.obj = ''
  })
  $scope.searchObj = function(val) {
    if ($scope.featuredPageForm.typ == 'person') {
      return $http.get('/api/HR/users/?username__contains=' + val).
      then(function(response) {
        return response.data;
      })
    }else if ($scope.featuredPageForm.typ == 'event') {
      return $http.get('/api/ERP/event/?name__contains=' + val).
      then(function(response) {
        return response.data;
      })
    }else if ($scope.featuredPageForm.typ == 'blog') {
      return $http.get('/api/PIM/blog/?title__contains=' + val).
      then(function(response) {
        return response.data;
      })
    }

  };
  $scope.savePromotion = function(){
    console.log($scope.featuredPageForm);
    if ($scope.featuredPageForm.typ == '') {
      Flash.create('warning','Please Select Type')
      return
    }
    if ($scope.featuredPageForm.obj == '' || typeof $scope.featuredPageForm.obj == 'string') {
      if ($scope.featuredPageForm.typ == 'person') {
        Flash.create('warning','Please Select Some User')
      }else if ($scope.featuredPageForm.typ == 'event') {
        Flash.create('warning','Please Select Some Event')
      }else if ($scope.featuredPageForm.typ == 'blog') {
        Flash.create('warning','Please Select Some Blog')
      }
      return
    }

    var toSend = {
      typ : $scope.featuredPageForm.typ,
      obj : $scope.featuredPageForm.obj.pk,
    }

    $http({method : 'POST' , url : '/api/ERP/featuredPage/' , data : toSend}).
    then(function(response) {
      Flash.create('success' , 'Saved');
      $scope.featuredPageForm.obj = ''
      $scope.featuredPageData.push(response.data)
    })

  }
  $scope.deleteRow = function(idx){
    console.log($scope.featuredPageData[idx]);
    $http({url : '/api/ERP/featuredPage/'+ $scope.featuredPageData[idx].pk + '/' , method : 'DELETE' })
    $scope.featuredPageData.splice(idx,1)
  }
  $scope.changeActive = function(idx){
    console.log($scope.featuredPageData[idx]);
    $http({method : 'PATCH' , url : '/api/ERP/featuredPage/'+ $scope.featuredPageData[idx].pk + '/' , data : {active:$scope.featuredPageData[idx].active}}).
    then(function(response) {
      Flash.create('success' , 'Active Changed');
    })
  }

});
