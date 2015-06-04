describe("Vyatta Ems", function() {
  var scope, state, vyattaemsSvcMock, rootScope;
  beforeEach(angular.mock.module('ui.state'));
  beforeEach(angular.mock.module('bvc.vyattaems'));
  beforeEach(angular.mock.inject(function ($controller, $q, $state, $rootScope, $templateCache) {
    rootScope = $rootScope;
    scope = $rootScope.$new();
    state = $state;
    $templateCache.put('vyattaems/root.tpl.html', '');
    $templateCache.put('vyattaems/index.tpl.html', '');
    vyattaemsSvcMock = {
      getList: function () {
        var deferred = $q.defer();
        deferred.resolve([
          {"vyattaems": "path1"}
        ]);
        return deferred.promise;
      },
      addPath: function () {
        return null;
      },
      deletePath: function (id) {
        var deferred = $q.defer();
        deferred.resolve({"node": [
          {"id": id}
        ]});
        return deferred.promise;
      }
    };
  }));
});