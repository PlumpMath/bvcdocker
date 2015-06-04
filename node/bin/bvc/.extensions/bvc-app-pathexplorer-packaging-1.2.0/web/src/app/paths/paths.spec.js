describe("Path Demo", function() {
  var scope, state, pathServiceMock, rootScope;
  beforeEach(angular.mock.module('ui.state'));
  beforeEach(angular.mock.module('bvc.paths'));
  beforeEach(angular.mock.inject( function( $controller, $q, $state, $rootScope, $templateCache) {
    rootScope = $rootScope;
    scope = $rootScope.$new();
    state = $state;
    $templateCache.put('paths/root.tpl.html', '');
    $templateCache.put('paths/index.tpl.html', '');
    pathServiceMock = {
      getList : function() {
        var deferred = $q.defer();
        deferred.resolve([{"paths":"path1"}]);
        return deferred.promise;
      },
      addPath : function() {
        return null;
      },
      deletePath : function(id){
        var deferred = $q.defer();
        deferred.resolve({"node":[{"id":id}]});
        return deferred.promise;
      }
    };
  }));


  it("should call get paths", angular.mock.inject( function($controller) {
    spyOn(pathServiceMock, 'getList').andCallThrough();
    $controller( 'PathsCtrl', { $scope: scope, PathsSvc:pathServiceMock });
    state.transitionTo('paths.index');
    rootScope.$digest();
    expect(state.current.name).toBe('paths.index');
    expect(pathServiceMock.getAllNodes).toHaveBeenCalled();
    expect(scope.data).toBe('path');
  }));

  it("should add a path", angular.mock.inject( function($controller, $q) {
    pathServiceMock.getCurrentData = function() {
      var deferred = $q.defer();
      deferred.resolve([{"node":[{"id":2},{"id" :3}]}]);
      return deferred.promise;
    };
    var stateParams = { nodeId: 2 };
    spyOn(pathServiceMock, 'getCurrentData').andCallThrough();
    $controller( 'PathsCtrl', { $scope: scope, $stateParams : stateParams, PathsSvc:pathServiceMock });
    state.transitionTo('node.detail');
    rootScope.$digest();
    expect(state.current.name).toBe('node.detail');
    expect(pathServiceMock.getCurrentData).toHaveBeenCalled();
    expect(scope.data.id).toEqual(2);
  }));

  it("should have hops", angular.mock.inject(function($controller) {
    var stateParams = { nodeId: 3 };
    spyOn(pathServiceMock, 'getCurrentData').andCallThrough();
    spyOn(pathServiceMock, 'getPaths').andCallThrough();
    $controller( 'PathsCtrl', { $scope: scope, $stateParams : stateParams, PathsSvc:pathServiceMock });
    state.transitionTo('paths.index');
    rootScope.$digest();
    expect(state.current.name).toBe('paths.index');
    expect(pathServiceMock.getNode).toHaveBeenCalled();
    expect(scope.data.id).toEqual(3);
  }));
});