app.config(function($stateProvider ){

  $stateProvider
  .state('home.manageUsers', {
    url: "/manageUsers",
    templateUrl: '/static/ngTemplates/app.HR.manage.users.html',
    controller: 'admin.manageUsers'
  })

});


app.controller('admin.editProfile' , function($scope , $http , Flash){

  console.log($scope.tab.data.profile);
  $scope.profile = $scope.tab.data.profile
  $scope.profileForm = $scope.tab.data.profile.profile


  $scope.saveProfile = function() {

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
      url: '/api/HR/profile/'+ $scope.profile.pk +'/',
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



});

app.controller('sudo.manageUsers.bulkUsers' , function($scope , $http , Flash){

  $scope.form = {xlFile : emptyFile , success : false , usrCount : 0}
  $scope.upload = function() {
    if ($scope.form.xlFile == emptyFile) {
      Flash.create('warning' , 'No file selected')
    }

    var fd = new FormData()
    fd.append('xl' , $scope.form.xlFile);

    $http({
      method: 'POST',
      url: '/api/HR/bulkUserCreation/',
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      Flash.create('success' , 'Created');
      $scope.form.usrCount = response.data.count;
      $scope.form.success = true;
    })

  }



});


app.controller('admin.manageUsers' , function($scope , $http , $aside , $state , Flash , $users , $filter, $timeout, $uibModal){

  // $timeout( function() {
  //   $scope.addTab({ title: "Edit designation for Marketting Guy", cancel: true, app: "editDesignation", data: $scope.data.tableData[0], active: true });
  // } , 1000);

  var views = [{name : 'table' , icon : 'fa-bars' , template: '/static/ngTemplates/genericTable/genericSearchList.html', itemTemplate: '/static/ngTemplates/app.HR.manage.users.item.html'},
      // {name : 'thumbnail' , icon : 'fa-th-large' , template : '/static/ngTemplates/empSearch/tableThumbnail.html'},
      // {name : 'icon' , icon : 'fa-th' , template : '/static/ngTemplates/empSearch/tableIcon.html'},
      // {name : 'graph' , icon : 'fa-pie-chart' , template : '/static/ngTemplates/empSearch/tableGraph.html'}
    ];



  // var multiselectOptions = [{icon : 'fa fa-book' , text : 'Learning' },
  //   {icon : 'fa fa-bar-chart-o' , text : 'Performance' },
  //   {icon : 'fa fa-envelope-o' , text : 'message' },
  // ];

  $scope.config = {
    url : '/api/HR/users/' ,
    views : views ,
    searchField : 'username',
    itemsNumPerView : [12,24,48],
    canCreate : true,
    editorTemplate : '/static/ngTemplates/app.HR.form.bulkUsers.html',
    multiselectOptions : [{icon : 'fa fa-paper-plane' , text : 'sendOneLink' },]
  };

  $scope.tabs = [];
  $scope.searchTabActive = true;
  $scope.data = {tableData : []};

  $scope.closeTab = function(index){
    $scope.tabs.splice(index , 1)
  }

  $scope.addTab = function( input ){
    console.log(JSON.stringify(input));
    $scope.searchTabActive = false;
    alreadyOpen = false;
    for (var i = 0; i < $scope.tabs.length; i++) {

      if ($scope.tabs[i].app == input.app) {
        if ((typeof $scope.tabs[i].data.url != 'undefined' && $scope.tabs[i].data.url == input.data.url )|| (typeof $scope.tabs[i].data.pk != 'undefined' && $scope.tabs[i].data.pk == input.data.pk)) {
          $scope.tabs[i].active = true;
          alreadyOpen = true;
        }
      }else{
        $scope.tabs[i].active = false;
      }
    }
    if (!alreadyOpen) {
      $scope.tabs.push(input)
    }
  }


  // create new user
  $scope.newUser = {username : '' , firstName : '' , lastName : '' , password : '' , rePassword : '' , email : ''};
  $scope.createUser = function(){

    if ($scope.newUser.email == '') {
      Flash.create('warning' , 'Please provide email ID')
      return;
    }

    if ($scope.newUser.password != $scope.newUser.rePassword) {
      Flash.create('warning' , 'Please provide the re password correct')
      return;
    }

    dataToSend = {username : $scope.newUser.username , first_name : $scope.newUser.firstName , last_name : $scope.newUser.lastName , password : $scope.newUser.password , email: $scope.newUser.email};
    $http({method : 'POST' , url : '/api/HR/usersAdminMode/', data : dataToSend }).
    then(function(response){
      Flash.create('success', response.status + ' : ' + response.statusText );
      $scope.newUser = {username : '' , firstName : '' , lastName : '' , password : ''};
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText );
    });
  }


  $scope.tableAction = function(target , action , mode){
    // target is the url of the object
    if (typeof mode == 'undefined') {
      var u;
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        u = $scope.data.tableData[i];
        if (u.pk == target){
          break;
        }
      }
      if (action == 'viewProfile') {
        $scope.addTab({title : 'Profile Of ' + u.username + ' ', cancel : true , app : 'viewProfile' , data : u , active : true})
      }else if (action == 'editOffice') {
        $scope.addTab({title : 'Edit Office For ' + u.username + ' ' , cancel : true , app : 'editOffice' , data : u , active : true})
      } else if (action == 'profile') {
        $scope.addTab({title : 'Edit Profile For ' + u.username + ' ', cancel : true , app : 'editProfile' , data : { "pk": u.pk,
        profile : u } , active : true})
      } else if (action == 'editMaster') {
        console.log(target);

        $http({method : 'GET' , url : '/api/HR/usersAdminMode/' + target + '/'}).
        then(function(response){
          var userData = response.data;
          $scope.addTab({title : 'Edit master data  For ' + userData.username + ' ', cancel : true , app : 'editMaster' , data : userData , active : true})
        })

      } else if (action == 'editPermissions') {
        u = $users.get(target)
        $http.get('/api/ERP/application/?user='+ u.username ).
        success((function(target){
          return function(data){
            u = $users.get(target)
            permissionsFormData = {
              appsToAdd : data,
              url : target,
            }
            $scope.addTab({title : 'Edit permissions For ' + u.username + ' ', cancel : true , app : 'editPermissions' , data : permissionsFormData , active : true})
          }
        })(target));
      }
      // for the single select actions
    } else {
      if (mode == 'multi') {
        console.log(target);
        console.log(action);
        if (action == 'sendOneLink') {
          $uibModal.open({
            templateUrl: '/static/ngTemplates/app.HR.manageUsers.oneLink.html',
            size: 'lg',
            backdrop : true,
            controller : function($scope , $http , Flash) {
              $scope.form = {link : ''}
              $scope.send = function() {
                $http({method : 'POST' , url : '/api/HR/sendOneLink/', data : {next: $scope.form.link}}).
                then(function(response) {
                  Flash.create('success' , response.data.count + ' mails sent');
                })
              }
            }
          })
        }
      }
    }
  }

  $scope.updateUserPermissions = function(index){
    var userData = $scope.tabs[index].data;
    if (userData.appsToAdd.length == 0) {
      Flash.create('warning' , 'No new permission to add')
      return;
    }
    var apps = [];
    for (var i = 0; i < userData.appsToAdd.length; i++) {
      apps.push(userData.appsToAdd[i].pk)
    }
    var dataToSend = {
      user : getPK(userData.url),
      apps : apps,
    }
    $http({method : 'POST' , url : '/api/ERP/permission/' , data : dataToSend}).
    then(function(response){
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText);
    })

  }

  $scope.getPermissionSuggestions = function(query) {
    return $http.get('/api/ERP/application/?name__contains=' + query)
  }

  $scope.updateProfile = function(index){
    userData = $scope.tabs[index].data;
    var fd = new FormData();
    for(key in userData){
      if (key!='url' && userData[key] != null) {
        if ($scope.profileFormStructure[key].type.indexOf('integer')!=-1 ) {
          if (userData[key]!= null) {
            fd.append( key , parseInt(userData[key]));
          }
        }else if ($scope.profileFormStructure[key].type.indexOf('date')!=-1 ) {
          if (userData[key]!= null) {
            fd.append( key , $filter('date')(userData[key] , "yyyy-MM-dd"));
          }
        }else if ($scope.profileFormStructure[key].type.indexOf('url')!=-1 && (userData[key]==null || userData[key]=='')) {
          // fd.append( key , 'http://localhost');
        }else{
          fd.append( key , userData[key]);
        }
      }
    }
    $http({method : 'PATCH' , url :'/api/HR/profileAdminMode/' + userData.pk +'/', data : fd , transformRequest: angular.identity, headers: {'Content-Type': undefined}}).
    then(function(response){
       Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response){
       Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  };

  $scope.updateUserMasterDetails = function(index){
    var userData = $scope.tabs[index].data;
    dataToSend = {
      username : userData.username,
      last_name : userData.last_name,
      first_name : userData.first_name,
      is_staff : userData.is_staff,
      is_active : userData.is_active,
    }
    if (userData.password != '') {
      dataToSend.password = userData.password
    }
    $http({method : 'PATCH' , url : '/api/HR/usersAdminMode/'+ userData.pk +'/' , data : dataToSend }).
    then(function(response){
       Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response){
       Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  }


  // $scope.addTab({"title":"Profile for Admin Vamso","cancel":true,"app":"viewProfile","data":{"pk":1,"username":"admin","email":"admin@vamsobiotec.com","first_name":"Admin","last_name":"Vamso","designation":{"pk":1,"rank":{"pk":2,"title":"Chief Marketing Officer","departments":[11],"alias":"CMO"},"department":[],"reportingTo":2,"primaryApprover":null,"secondaryApprover":3,"products":[],"units":[74]},"profile":{"pk":1,"mobile":"987654321","displayPicture":"http://localhost:8000/media/HR/images/DP/1508275272_17_admin_user3-128x128.jpg","website":"https://www.eoms.com","prefix":"Dr","almaMater":"ABC college","pgUniversity":"BDC university","docUniversity":"DEF college","email":"pradeep@test.com"},"date_joined":"2017-10-06T16:51:44.231419Z","financeProfile":1},"active":true});

});


app.controller('admin.manageUsers.loginLink' , function($scope , $http , $aside , $state , Flash , $users , $filter, $timeout){

  console.log($scope.data);
  console.log($scope);

  $scope.generate = function() {
    $http({method : 'POST' , url : '/api/HR/authTokenAdmin/' , data : {user : $scope.data.pk , typ : 'linklogin'}}).
    then(function(response) {
      $scope.auth = response.data;
    })
  }

  $scope.sendWelcome = function() {
    $http({method : 'POST' , url : '/api/HR/sendWelcomeEmail/' , data : {user : $scope.data.pk , next : '/ERP/#/home/profile' }}).
    then(function(response) {
      $scope.auth = response.data;
      Flash.create('success' , 'Sent');
    })
  }

});


app.controller('admin.manageUsers.editOffice' , function($scope , $http , $aside , $state , Flash , $users , $filter, $timeout){

console.log('dtaaaaaaaaaaaaa',$scope.tab.data);
  $scope.offices = []
  $scope.sellingProducts = $scope.tab.data.profile.sellingProduct
  $scope.buyingProducts = $scope.tab.data.profile.buyingProduct
  $http({method : 'GET' , url : '/api/HR/office/?parent=' + $scope.tab.data.profile.pk}).
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
      f.parent = $scope.tab.data.profile.pk
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
    $http({method : 'PATCH' , url : '/api/HR/profile/' + $scope.tab.data.profile.pk + '/', data : {sellingProduct : spk , buyingProduct : bpk}}).
    then(function(response) {
      Flash.create('success' , 'Products Saved')
      console.log('response isssssssssssss',response.data);
    })
  }

});

app.controller('admin.manageUsers.item' , function($scope , $http , $aside , $state , Flash , $users , $filter, $timeout){



});


app.controller('admin.manageUsers.explore' , function($scope , $http , $aside , $state , Flash , $users , $filter, $timeout){

  console.log($scope.tab.data);
  $scope.profile = $scope.tab.data;
  $scope.officesData = []
  $http({method : 'GET' , url : '/api/HR/office/?parent=' + $scope.tab.data.profile.pk}).
  then(function(response) {
    $scope.officesData = response.data;
  })



});
