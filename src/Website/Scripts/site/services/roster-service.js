﻿angular.module('missionlineApp').service('rosterService', ['$sce', '$http', '$q', '$rootScope', '$timeout', 'pushService',
  function ($sce, $http, $q, $rootScope, $timeout, pushService) {
    var self = this;
    $.extend(this, {
      signins: [],
      load: function () {
        var deferred = $q.defer();
        self.signins.length = 0;
        self.signins.loading = true;
        $http({
          method: 'GET',
          url: window.appRoot + 'api/roster',
        }).success(function (data) {
          $.each(data, function (idx, event) {
            self.signins.push(new SigninModel(event));
          })
          delete self.signins.loading;
          deferred.resolve(data);
        })
        .error(function (response) { deferred.reject(response); });
        return deferred.promise;
      },
      save: function (model) {
        var deferred = $q.defer();
        $http({
          method: model.id ? 'PUT' : 'POST',
          url: window.appRoot + 'api/roster',
          data: model.getData(),
          headers: { 'Content-Type': 'application/json' }
        }).success(function (data) {
          deferred.resolve(data);
        }).error(function (response) {
          deferred.reject(response);
        });
        return deferred.promise;
      },
      moveResponder: function (signin, fromEvent, toEvent) {
        var deferred = $q.defer();
        $http({
          method: 'POST',
          url: window.appRoot + 'api/roster/' + signin.id + '/reassign/' + toEvent.id,
          headers: { 'Content-Type': 'application/json' }
        }).success(function (data) {
          deferred.resolve(data);
        }).error(function (response) {
          deferred.reject(response);
        });
        return deferred.promise;
      }
    });
    pushService.listenTo('updatedRoster', function (data) {
      var signin = new SigninModel(data);
      var found = false;
      signin.highlight = true;
      $timeout(function () { signin.highlight = false; }, 2000);

      for (var i = 0; i < self.signins.length; i++) {
        if (self.signins[i].id == data.id) {
          self.signins[i] = signin;
          found = true;
          break;
        }
      }
      if (!found) { self.signins.push(signin); }
      $rootScope.$emit('roster-updated');
      $rootScope.$digest();
    });
  }]);
