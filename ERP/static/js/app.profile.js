app.controller("controller.home.profile", function($scope , $state, $users , $http , Flash) {

  $scope.me = $users.get('mySelf');
  console.log($scope.me);
  $scope.editProfile = false;

  $scope.form = {dp : emptyFile};

  $http({method : 'GET' , url : '/api/ERP/appSettings/?name=profileEdit'}).
  then(function(response) {
    if (response.data[0].flag) {
      $scope.editProfile = true;
    }
  });

  $http({method : 'GET' , url : '/api/HR/profileSelfMode/' + $scope.me.profile.pk + '/'}).
  then(function(response) {
    $scope.profile = response.data;
    $scope.profile.dateOfBirth = new Date($scope.profile.dateOfBirth);
    $scope.profile.anivarsary = new Date($scope.profile.anivarsary);

    if ($scope.profile.emergency != null) {
      if ($scope.profile.emergency.indexOf('::') == -1) {
        $scope.profile.emergencyName = "";
        $scope.profile.emergencyNumber = $scope.profile.emergency;
      }else {
        $scope.profile.emergencyName = $scope.profile.emergency.split('::')[0];
        $scope.profile.emergencyNumber = $scope.profile.emergency.split('::')[1];
      }
    }

    console.log($scope.profile);


    $http({method : 'GET' , url : '/api/ERP/address/' + response.data.localAddress + '/'}).
    then(function(resAdd) {
      $scope.profile.localAddress = resAdd.data;
    }, function(err) {
      $scope.profile.localAddress = {street : '' , city :'' , state : '' , pincode : '' , country : 'India'}
    })
    $http({method : 'GET' , url : '/api/ERP/address/' + response.data.permanentAddress + '/'}).
    then(function(resAddPerm) {
      $scope.profile.permanentAddress = resAddPerm.data;
    }, function(err) {
      $scope.profile.permanentAddress = {street : '' , city :'' , state : '' , pincode : '' , country : 'India'}
    })
  })

  $scope.save = function() {
    $scope.profile.emergency = $scope.profile.emergencyName + '::' + $scope.profile.emergencyNumber;

    if ($scope.profile.emergencyNumber.length != 10) {
      Flash.create('warning' , 'Please enter a valid emergency phone number');
      return;
    }
    if ($scope.profile.mobile.length != 10) {
      Flash.create('warning' , 'Please enter a valid mobile number');
      return;
    }

    if ($scope.profile.emergency.length <5) {
      Flash.create('warning' , 'Please provide a emergency contact number and name');
      return;
    }

    if (!$scope.profile.localAddress.pk) {
      Flash.create('warning' , 'Please save the despatch address first');
      return;
    }

    if (!$scope.profile.permanentAddress.pk && !$scope.profile.sameAsLocal) {
      Flash.create('warning' , 'Please save the permanent address first');
      return;
    }

    if ($scope.profile.fathersName.length <2) {
      Flash.create('warning' , 'Please enter your fathers Name');
      return;
    }

    if ($scope.profile.mothersName.length <2) {
      Flash.create('warning' , 'Please enter your mothers Name');
      return;
    }

    if ($scope.profile.email.length <2) {
      Flash.create('warning' , 'Please enter your email ID');
      return;
    }
    if ($scope.profile.mobile.length <2) {
      Flash.create('warning' , 'Please enter your phone number');
      return;
    }
    // console.log($scope.profile);
    if ($scope.form.dp == emptyFile && ($scope.profile.displayPicture == null || $scope.profile.displayPicture == undefined)) {
      Flash.create('warning', 'Please select a profile picture');
      return;
    }

    if (typeof $scope.profile.dateOfBirth != 'string') {
      $scope.profile.dateOfBirth = $scope.profile.dateOfBirth.toJSON().slice(0, 10);
    }
    if (typeof $scope.profile.anivarsary != 'string') {
      $scope.profile.anivarsary = $scope.profile.anivarsary.toJSON().slice(0, 10);
    }

    $http({method : 'PATCH' , url : '/api/HR/profileSelfMode/' + $scope.profile.pk + '/' , data : $scope.profile}).
    then(function(response) {
      Flash.create('success' , 'Saved');

      var fd = new FormData()
      fd.append('displayPicture' , $scope.form.dp);
      $http({
        method: 'PATCH',
        url: '/api/HR/profile/'+ $scope.profile.pk +'/',
        data: fd,
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        }
      }).
      then(function(response) {
        Flash.create('success', 'Saved');
      })



    });

  }

  $http({method : 'GET' , url : '/api/HR/designation/' + $scope.me.designation + '/'}).
  then(function(response) {
    $scope.designation = response.data;

  })




})

app.controller("controller.home.profile.search", function($scope , $state, $users , $http , Flash) {

  $scope.form = {user : undefined , friend : null , friendProfile : null , friendDesignation : null}

  $scope.$watch('form.user' , function(newValue , oldValue) {

    if (newValue == undefined || typeof newValue == 'string') {
      return;
    }
    $scope.friend = newValue;

    console.log(newValue);

    $http({method : 'GET' , url : '/api/HR/profileSearchMode/' + newValue.profile.pk + '/'}).
    then(function(response) {
      $scope.friendProfile = response.data;

      if (response.data.localAddress != null) {
        $http({method : 'GET' , url : '/api/ERP/address/' + response.data.localAddress + '/'}).
        then(function(resAdd) {
          $scope.friendProfile.localAddress = resAdd.data;
        })
      }
      if (response.data.permanentAddress == null) {
        $http({method : 'GET' , url : '/api/ERP/address/' + response.data.permanentAddress + '/'}).
        then(function(resAddPerm) {
          $scope.friendProfile.permanentAddress = resAddPerm.data;
        })
      }

    })

    $http({method : 'GET' , url : '/api/HR/designation/' + newValue.designation + '/'}).
    then(function(response) {
      $scope.friendDesignation = response.data;
    })

  })



})
