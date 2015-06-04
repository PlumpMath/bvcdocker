define(['app/paths/paths.module', 'vis'], function (paths) {

  paths.register.directive('pathsSimple', function () {
    return {
      restrict: 'E',

      scope: {
        topologyData: '=',
        topologyOptions: '=',
        selectedNode: '=',
        selectedEdge: '='
      },

      link: function ($scope, element, attrs, controller) {

        console.log('==> pathsSimple directive');

        var defaultOptions = {
          width: '100%',
          height: '100%',
          nodes: {
            widthMin: 20,
            widthMax: 128,
            fontColor: 'black'
          },
          edges: {
            style: 'arrow',
            length: 175,
            color: {
              color: '#D3D3D3',
              highlight: '#2F4F4F',
              hover: '#2F4F4F'
            }
          },
          groups: {
            switch: {
              shape: 'image',
              image: 'assets/images/bvc/bvc-v3500.png'
            },
            waypoint: {
              shape: 'image',
              image: 'assets/images/bvc/bvc-v3500-hilite.jpg'
            },
            desktop: {
              shape: 'image',
              image: 'assets/images/Device_pc_3045_default_64.png'
            }
          },
          tooltip: {
            delay: 300,
            fontColor: "black",
            fontSize: 14, // px
            fontFace: 'sans-serif',
            color: {
              border: "#666",
              background: "#FFFFC6"
            }
          },
          physics: {
            barnesHut: {
              enabled: true
            }
          },
          configurePhysics: false,
          dataManipulation: false,
          stabilize: true,
          hover: true,
          keyboard: true,
          smoothCurves: true
          //freezeForStabilization: true
        };

        //Merge two objects
        var mergeObjects = function(fromObj,intoObj){
          var result = {};
          for(var i in fromObj){
            result[i] = fromObj[i];
            if((i in intoObj) && (typeof fromObj[i] === "object") && (i !== null)){
              result[i] = mergeObjects(fromObj[i],intoObj[i]);
            }
          }
          for(i in intoObj){
            if(i in result){ //conflict
              continue;
            }
            result[i] = intoObj[i];
          }
          return result;
        };

        var drawTopology = function () {
          console.log('==> pathsSimple:drawTopology()');

          if ($scope.topologyData) {
            var datasetNodes = new vis.DataSet();
            datasetNodes.add($scope.topologyData.nodes);

            var datasetEdges = new vis.DataSet();
            datasetEdges.add($scope.topologyData.edges);

            console.log('created datasetNodes and datasetEdges: ', datasetNodes);

            datasetNodes.subscribe('*', function() {
              console.log('change to nodes detected', datasetNodes);
            });
            datasetEdges.subscribe('*', function() {
              console.log('change to edges detected');
              $scope.topologyData.edges = [];
              _.each(datasetEdges._data, function(edge) { return $scope.topologyData.edges.push(edge); });

              console.log('new edges: ', $scope.topologyData.edges, $scope.topologyData.edges.length);
              $scope.$apply();
            });

            var topoOptions = mergeObjects($scope.topologyOptions, angular.copy(defaultOptions));
            var graph = new vis.Network(element[0], {nodes: datasetNodes, edges: datasetEdges}, topoOptions);

            graph.on('select', function(params) {
              console.log("graph selection detected");
              //console.log(params);
              $scope.selectedNode = _.find(datasetNodes._data, function(node) { return node.id === params.nodes[0]; });
              $scope.$apply();
              //console.log("$scope.selectedNode: " , $scope.selectedNode);
            });

            var nodeRightClick = function(properties, event) {
              console.log('node-rightclick detected');
              event.preventDefault();
              if (event !== undefined && event.which !== 3) {
                return;
              }
              if (properties.nodes.length <= 0) {
                return;
              }
            };

            graph.on('contextmenu', nodeRightClick);

            return graph;
          }
        };

        $scope.$watch('topologyData', drawTopology, true);
        $scope.$watch('topologyOptions', drawTopology, true);
      }
    };
  });
});
