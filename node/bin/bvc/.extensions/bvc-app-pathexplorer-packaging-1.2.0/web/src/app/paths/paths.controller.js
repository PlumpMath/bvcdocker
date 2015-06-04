define(['app/paths/paths.module', 'app/paths/paths.directives', 'app/paths/paths.services', 'app/paths/paths.filters'], function (paths) {
  paths.register.controller('PathsCtrl', ['$scope', '$rootScope', '$filter','$log', 'PathsSvc', function ($scope, $rootScope, $filter, $log, PathsSvc) {

    $log.debug("=> PathCtrl");

    $rootScope['section_logo'] = 'logo_paths';

    $scope.selectedNode = {};
    $scope.selectedEdge = {};
    $scope.selectedPath = {};
    $scope.message = {
      type: 'none',
      text: ''
    };
    $scope.selectedRowHiliteColor = function() {
      return ($scope.selectedPath === null || $scope.selectedPath === undefined) ? "white" : "yellow";
    };
    $scope.mostRecentlyUpdatedPath = {};

    //redefine options just to be clear whats allowed to be modified
    $scope.topologyOptions = {
      smoothCurves: true,
      stabilize: true,
      configurePhysics: false,
      dataManipulation: false,
      physics: {
        barnesHut: {
          centralGravity: 0.3,
          gravitationalConstant: -12000,
          springLength: 250,
          springConstant: 0.25,
          damping: 0.3
        }
      },
      clustering: {
        enabled: false,
        clusterEdgeThreshold: 5
      }
    };

    $scope.selectPath = function(userSelectedPath) {
      $scope.selectedPath = userSelectedPath;
    };

    $scope.getTopology = function () {
      $log.debug('==> PathCtrl:getTopology()');
      return PathsSvc.getNode("flow:1", function (data) {
        $scope.topologyData = data;
      });
    };

    $scope.getPaths = function () {
      $log.debug('==> PathCtrl:getPaths()');
      return PathsSvc.getPaths().then(function (data) {
        $scope.pathData = data[0].path;
        $log.info('PathCtrl: pathData', JSON.stringify($scope.pathData, undefined, 2));
      }).then(function () {
        if ($scope.pathData && $scope.pathData.length > 0) {
          //map orderedHops to consumable nodeids
          $log.debug('PathCtrl: mapping sourceHop and destHop');
          _.each($scope.pathData, function (pathDataItem) {
            pathDataItem.hopsGrouped = [];
            _.each(pathDataItem.orderedHops, function(hopItem) {
              var sourceHopSwitch = $filter('switchExtractFilter')(hopItem.sourceHop);
              var destHopSwitch = $filter('switchExtractFilter')(hopItem.destHop);
              pathDataItem.hopsGrouped.push([sourceHopSwitch, destHopSwitch]);
            });
          });
        }
      });
    };

    $scope.hilitePath = function (path) {
      if (!path) {
        return;
      }

      var sourceAddress = path['source-addr'];
      var destinationAddress = path['destination-addr'];
      var waypoints = path['waypoints'];

      $log.debug('==> PathCtrl:hilitePath()', sourceAddress, destinationAddress);

      $scope.unhilitePath();

      //var pathDataItem = _.find($scope.pathData, function(pathDataItem) {
      //  return pathDataItem['source-addr'] === sourceAddress && pathDataItem['destination-addr'] === destinationAddress;
      //});

      _.each(path.waypoints, function (waypoint) {
        var node = _.find($scope.topologyData.nodes, function (node) {
          return node.id === waypoint;
        });
        node.group = 'waypoint';
      });

      //hilite each hop pair in the path item
      _.each(path.hopsGrouped, function (hopPair) {
        var edge = _.find($scope.topologyData.edges, function (edge) {
          return edge.title.indexOf(hopPair[0]) === 0 && edge.title.indexOf(hopPair[1]) >= 0;
        });
        $scope.hiliteEdge(edge);
      });

      //hilite first-node to host1
      var h1 = _.find($scope.topologyData.edges, function (edge) {
        return edge.from === sourceAddress;
      });
      $scope.hiliteEdge(h1);

      //hilite last-node to host2
      var h2 = _.find($scope.topologyData.edges, function (edge) {
        return edge.to === destinationAddress;
      });
      $scope.hiliteEdge(h2);

      $scope.selectedPath = path;
    };

    $scope.hiliteEdge = function (edge) {
      if (edge != null) {
        console.debug('==> PathCtrl:hiliteEdge()', edge);
        edge.color = 'red';
        edge.width = 2;
      }
    };

    $scope.unhilitePath = function () {
      if ($scope.topologyData.edges != null) {
        console.debug('==> PathCtrl:unhilitePath()');
        var reds = _.filter($scope.topologyData.edges, function (edge) {
          return edge.color === 'red';
        });
        _.each(reds, function (redEdge) {
          redEdge.color = '#D3D3D3';
          redEdge.width = 1;
        });
      }
      //unhilite waypoints
      if ($scope.topologyData.nodes != null) {
        var selectedSwitches = _.filter($scope.topologyData.nodes, function (node) {
          return node.group === 'waypoint';
        });
        _.each(selectedSwitches, function (selectedSwitch) {
          selectedSwitch.group = 'switch';
        });
      }
    };

    $scope.submit = function () {
      $log.debug('==> PathCtrl:submit()');
      return PathsSvc.addPath($scope.sourceAddress, $scope.destinationAddress, $scope.waypoints).then(function () {
        setTimeout(function() {
          $scope.mostRecentlyUpdatedPath.sourceAddress = $scope.sourceAddress;
          $scope.mostRecentlyUpdatedPath.destinationAddress = $scope.destinationAddress;
          return $scope.refresh();
        }, 1000);
      });
    };

    $scope.updatePath = function (path, waypoints) {
      var sourceAddress = path['source-addr'];
      var destinationAddress = path['destination-addr'];
      $log.debug('==> PathCtrl:updatePath()', sourceAddress, destinationAddress, waypoints);
      return PathsSvc.addPath(sourceAddress, destinationAddress, waypoints).then(function () {
        $scope.mostRecentlyUpdatedPath.sourceAddress = sourceAddress;
        $scope.mostRecentlyUpdatedPath.destinationAddress = destinationAddress;
        return $scope.refresh();
      });
    };

    $scope.refresh = function () {
      $log.debug("==> PathCtrl:refresh()");
      return $scope.getPaths().then(function() {
        angular.forEach($scope.pathData, function(path) {
          if (_.has(path, 'waypoints')) {
            path['waypoints'] = _.filter(path['waypoints'], function (w) {
              return !_.isEmpty(w);
            }) || [];
          }
        });
        var lastUpdatedPath = _.find($scope.pathData, function(path) { return path['path-name'] === $scope.mostRecentlyUpdatedPath.sourceAddress + '-' + $scope.mostRecentlyUpdatedPath.destinationAddress; });
        if (!lastUpdatedPath) {
          if ($scope.pathData && $scope.pathData.length >= 1) {
            lastUpdatedPath = $scope.pathData[0];
          }
        }
        $scope.hilitePath(lastUpdatedPath);
      });
    };

    $scope.deletePath = function (path) {
      var sourceAddress = path['source-addr'];
      var destinationAddress = path['destination-addr'];
      $log.debug('==> PathCtrl:deletePath()', sourceAddress, destinationAddress);
      $scope.unhilitePath();
      return PathsSvc.deletePath(sourceAddress, destinationAddress).then(function () {
        return $scope.refresh();
      });
    };

    $scope.setAsNewWaypoint = function (host1, host2) {
      $log.debug('==> PathCtrl:setAsNewWaypoint()');
      if ($scope.selectedPath !== null) {
        return PathsSvc.addPath(host1, host2, [$scope.selectedNode['id']]).then(function () {
          return $scope.refresh();
        });
      }
    };

    $scope.removeWaypoint = function(host1, host2) {
      $log.debug('==> PathCtrl:removeWaypoint()');
      if ($scope.selectedPath !== null) {
        var selectedWaypoint = $scope.selectedNode['id'];
//        if ($scope.pathData['waypoints'].contains(selectedWaypoint)) {
//
//        };
        return PathsSvc.deletePath(host1, host2).then(function () {
          return $scope.refresh();
        });
      }
    };


    $scope.getTopology().then(function () {
      return $scope.refresh();
    });

    $scope.waypointButtonStatus = {
      isopen: false
    };

  }]);
});
