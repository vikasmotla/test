app.controller("controller.home.calendar", function($scope , $http ,$aside, $state , $timeout , $users) {

  $scope.data = {items : []};
  $http({url : '/api/myWork/task/?user=' , method : 'GET'}).
  then(function(response){
    d = response.data;
    for (var i = 0; i < d.length; i++) {
      $scope.data.items.push( {'type' : 'ToDo', data : d[i] ,  date : new Date(d[i].dueDate)});
    }
  })

  $scope.me = $users.get("mySelf");

  $scope.showDay = function(input){
    $scope.itemsToShow = [];
    for (var i = 0; i < input.length; i++) {
      $scope.itemsToShow.push($scope.data.items[input[i]]);
    }
    $scope.itemInView = $scope.data.items[input[0]];
  };

  $scope.itemSelected = function(input){
    $scope.itemInView = $scope.itemsToShow[input];
  }

  $scope.toggleToDo = function(input){
    todo = $scope.data.items[input].data;
    if (todo.status == 'complete') {
      $scope.data.items[input].data.status = 'not_started';
    }else {
      $scope.data.items[input].data.status = 'complete';
    }

    $http({url : '/api/myWork/task/'+ todo.pk+'/' , method : 'PATCH' , data : {status : $scope.data.items[input].data.status}})
  }
  $scope.deleteToDo = function(input){
    todo = $scope.data.items[input].data;
    $http({url : '/api/myWork/task/'+todo.pk+'/' , method : 'DELETE' })
    $scope.data.items.splice(input , 1);
  }

  $scope.showPerticular = function(input){
    $scope.itemInView = $scope.data.items[input];
  };

  $scope.date = new Date();
  $scope.templates = '/static/ngTemplates/app.home.calendar.items.html';
});
