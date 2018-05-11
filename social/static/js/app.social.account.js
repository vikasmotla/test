var app = angular.module('app', ['ui.router', 'ui.bootstrap', 'ngSanitize', 'ngAside', 'ngDraggable', 'flash', 'ngTagsInput', 'mwl.confirm', 'ngAudio', 'uiSwitch']);

app.config(function($stateProvider, $urlRouterProvider, $httpProvider, $provide) {

  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;


});

app.run(['$rootScope', '$state', '$stateParams', function($rootScope, $state, $stateParams ,) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  $rootScope.$on("$stateChangeError", console.log.bind(console));
}]);

app.controller("main", function($scope, $state, $rootScope,$users,$http,Flash) {
  $scope.me = $users.get('mySelf')
  console.log($scope.me);
  console.log('coming in ctrl');
  $scope.tabTyp = 'password'

  $scope.tabChange = function(typ){
    console.log(typ);
    $scope.tabTyp = typ
  }

  $scope.userPasswords = {
    oldPassword : '',
    password : '',
    password2 : '',
  }
  $scope.changeUserPassword = function() {
    if ($scope.userPasswords.password != '' && $scope.userPasswords.password2 != '' && $scope.userPasswords.oldPassword != '') {
      if ($scope.userPasswords.password2 == $scope.userPasswords.password) {
        $http({
          method: 'PATCH',
          url: '/api/HR/users/' + $scope.me.pk + '/',
          data: {
            password: $scope.userPasswords.password,
            oldPassword: $scope.userPasswords.oldPassword
          }
        }).
        then(function(response) {
          Flash.create('success', response.status + ' : ' + response.statusText + ' Saved');
        }, function(response) {
          Flash.create('danger', response.status + ' : ' + ' Incorrect Old Password');
        });
      }else {
        Flash.create('warning', 'Password And Confirm Password Must Be Same');
      }
    }else {
      Flash.create('warning', 'Please Fill All The Fields');
    }
  }

  $scope.profileForm = $scope.me.profile
  console.log('profileeeeeeeeeeeeeee',$scope.profileForm);
  $scope.saveOrganization = function() {

    var fd = new FormData()
    if ($scope.profileForm.mobile != null && $scope.profileForm.mobile.length != 0) {
      fd.append('mobile' , $scope.profileForm.mobile);
    }
    if ($scope.profileForm.email != null && $scope.profileForm.email.length != 0) {
      fd.append('email' , $scope.profileForm.email);
    }
    if ($scope.profileForm.cin != null && $scope.profileForm.cin.length != 0) {
      fd.append('cin' , $scope.profileForm.cin);
    }
    if ($scope.profileForm.year_established != null && $scope.profileForm.year_established.length != 0) {
      fd.append('year_established' , $scope.profileForm.year_established);
    }
    if ($scope.profileForm.street != null && $scope.profileForm.street.length != 0) {
      fd.append('street' , $scope.profileForm.street);
    }
    if ($scope.profileForm.city != null && $scope.profileForm.city.length != 0) {
      fd.append('city' , $scope.profileForm.city);
    }
    if ($scope.profileForm.pincode != null && $scope.profileForm.pincode.length != 0) {
      fd.append('pincode' , $scope.profileForm.pincode);
    }
    if ($scope.profileForm.state != null && $scope.profileForm.state.length != 0) {
      fd.append('state' , $scope.profileForm.state);
    }
    if ($scope.profileForm.country != null && $scope.profileForm.country.length != 0) {
      fd.append('country' , $scope.profileForm.country);
    }
    if ($scope.profileForm.website != null && $scope.profileForm.website.length != 0) {
      fd.append('website' , $scope.profileForm.website);
    }
    if ($scope.profileForm.displayPicture != null && typeof $scope.profileForm.displayPicture != 'string') {
      fd.append('displayPicture' , $scope.profileForm.displayPicture);
    }
    if ($scope.profileForm.coverPicture != null && typeof $scope.profileForm.coverPicture != 'string') {
      fd.append('coverPicture' , $scope.profileForm.coverPicture);
    }

    $http({
      method: 'PATCH',
      url: '/api/HR/profile/'+ $scope.me.profile.pk +'/',
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
      console.log('dataaaa',response.data);
    })

  }

  $scope.notificationSettings = {
    messageAlert : $scope.me.profile.messageAlert,
    requestAlert : $scope.me.profile.requestAlert,
    periodicNotification : $scope.me.profile.periodicNotification,
    newsletter : $scope.me.profile.newsletter,
    promotional : $scope.me.profile.promotional,
  }

  $scope.saveNotification = function(){
    console.log('notificationsssssssssssss',$scope.notificationSettings);
    $http({
      method: 'PATCH',
      url: '/api/HR/profile/'+ $scope.me.profile.pk +'/',
      data: $scope.notificationSettings,
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
      console.log('dataaaa',response.data);
    })
  }

});

app.controller('admin.manageUsers.editOffice' , function($scope , $http , $aside , $state , Flash , $users , $filter, $timeout){
  console.log('entereddddddddddd');
  $scope.offices = []
  $scope.sellingProducts = $scope.me.profile.sellingProduct
  $scope.buyingProducts = $scope.me.profile.buyingProduct
  $http({method : 'GET' , url : '/api/HR/office/?parent=' + $scope.me.profile.pk}).
  then(function(response) {
    $scope.offices = response.data;
  })
  $scope.resetOfficeForm = function(){
    $scope.officeForm = {name : '', contactName : '' , contactNumber : '', gstIn : '', street : '', city : '', pincode : 0, state : '', country : 'India' , mode:'new'}
  }
  $scope.resetOfficeForm()
  $scope.editForm = function(idx){
    if ($scope.officeForm .pk) {
      $scope.offices.push($scope.officeForm)
    }
    $scope.officeForm = $scope.offices[idx]
    $scope.officeForm.mode = 'edit'
    $scope.offices.splice(idx,1)
  }
  $scope.producrForm = {selling:'',buying:''}

  $scope.productSearch = function(val){
    return $http({method : 'GET' , url : '/api/social/productTag/?txt__contains=' + val}).
    then(function(response) {
      return response.data;
    })
  }
  $scope.saveSellingProduct = function(){
    if ($scope.producrForm.selling.length == 0) {
      Flash.create('warning' , 'Mention Some Product To Sell')
      return
    }
    if (typeof $scope.producrForm.selling == 'object') {
      for (var i = 0; i < $scope.sellingProducts.length; i++) {
        if ($scope.sellingProducts[i].pk == $scope.producrForm.selling.pk) {
          Flash.create('warning' , 'This Product Is Already Added')
          return
        }
      }
      $scope.sellingProducts.push($scope.producrForm.selling)
      $scope.producrForm.selling = ''
    }else {
      $http({method : 'POST' , url : '/api/social/productTag/', data : {txt : $scope.producrForm.selling}}).
      then(function(response) {
        $scope.sellingProducts.push(response.data)
        $scope.producrForm.selling = ''
      })
    }
  }
  $scope.saveBuyingProduct = function(){
    if ($scope.producrForm.buying.length == 0) {
      Flash.create('warning' , 'Mention Some Product To Buy')
      return
    }
    if (typeof $scope.producrForm.buying == 'object') {
      for (var i = 0; i < $scope.buyingProducts.length; i++) {
        if ($scope.buyingProducts[i].pk == $scope.producrForm.buying.pk) {
          Flash.create('warning' , 'This Product Is Already Added')
          return
        }
      }
      $scope.buyingProducts.push($scope.producrForm.buying)
      $scope.producrForm.buying = ''
    }else {
      $http({method : 'POST' , url : '/api/social/productTag/', data : {txt : $scope.producrForm.buying}}).
      then(function(response) {
        $scope.buyingProducts.push(response.data)
        $scope.producrForm.buying = ''
      })
    }
  }
  $scope.closeSellingProduct = function(idx){
    console.log('closing sell',idx,$scope.sellingProducts);
    $scope.sellingProducts.splice(idx,1)
  }
  $scope.closeBuyingProduct = function(idx){
    console.log('closing buy',idx,$scope.buyingProducts);
    $scope.buyingProducts.splice(idx,1)
  }
  $scope.saveOffice = function(){
    var f = $scope.officeForm
    if (f.name==null || f.name.length == 0 || f.contactName==null || f.contactName.length == 0 || f.contactNumber==null || f.contactNumber.length == 0 || f.gstIn==null || f.gstIn.length == 0 || f.street==null || f.street.length == 0 || f.city==null || f.city.length == 0 || f.state==null || f.state.length == 0 || f.pincode ==null) {
      Flash.create('warning' , 'All Fields Are Required')
      return
    }
    if (typeof f.pk != 'undefined') {
      var method = 'PATCH'
      var url = '/api/HR/office/' + f.pk + '/'
    }else {
      var method = 'POST'
      var url = '/api/HR/office/'
      f.parent = $scope.me.profile.pk
    }
    console.log(f);
    $http({method : method , url : url, data : f}).
    then(function(response) {
      Flash.create('success' , 'Saved')
      $scope.offices.push(response.data)
      $scope.resetOfficeForm()
    })
  }
  $scope.saveProfileProducts = function(){
    var spk = []
    var bpk = []
    for (var i = 0; i < $scope.sellingProducts.length; i++) {
      spk.push($scope.sellingProducts[i].pk)
    }
    for (var i = 0; i < $scope.buyingProducts.length; i++) {
      bpk.push($scope.buyingProducts[i].pk)
    }
    $http({method : 'PATCH' , url : '/api/HR/profile/' + $scope.me.profile.pk + '/', data : {sellingProduct : spk , buyingProduct : bpk}}).
    then(function(response) {
      Flash.create('success' , 'Products Saved')
      console.log('response isssssssssssss',response.data);
    })
  }

});
