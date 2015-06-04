define(['app/vyattaems/vyattaems.module', 'vis'], function (vyattaems) {



  vyattaems.register.directive('vyattaNetconfTunnelBuilder', function () {
    var nodeOptions = {
      widthMin: 20,
      widthMax: 64,
      fontColor: '#2B1B17',
      fontSize: 20
    };

    var groupOptions = {
      dataplane: {
        shape: 'square',
        color: '#B84DB8',
        value: 20
      },
      vti: {
        shape: 'dot',
        color: '#70B8FF',
        radius: 16
      },
      tunnel: {
        shape: 'dot',
        color: '#99C199',
        radius: 20
      },
      router: {
        shape: 'image',
        image: 'assets/images/bvc/bvc-v5600.jpg'
      }
    };

    return {
      restrict: 'E',

      scope: {
        vyattaInterfacesMap: '='
      },

      link: function ($scope, element, attrs, controller) {

        console.log('==> vyattaInterfaceDirective');

        var defaultOptions = {
          width: '100%',
          height: '1200px',
          nodes: nodeOptions,
          groups: groupOptions,
          tooltip: {
            delay: 300,
            fontColor: "black",
            fontSize: 14, // px
            fontFace: 'verdana',
            color: {
              border: "#666",
              background: "#FFFFC6"
            }
          },
          physics: {
            barnesHut: {
              enabled: true,
              gravitationalConstant: -10050,
              centralGravity: 0.15
            }
          },
          configurePhysics: false,
          dataManipulation: false,
          stabilize: true,
          hover: true,
          keyboard: false,
          smoothCurves: true
        };

        var drawVyattaInterfaces = function () {
          console.log('==> VyattaEms: drawVyattaInterfaces');
          var viMap = $scope.vyattaInterfacesMap;

          if (!_.isEmpty(viMap)) {
            var nodes = [], edges = [];

            var drawInterfaces = function(routerName, interfaces, groupName) {
              var prefix = routerName + ':';
              angular.forEach(interfaces, function(item) {
                var addressText = !_.isEmpty(item.address) ? item.address.join(',') : '';
                nodes.push({'id': prefix + item['tagnode'], 'label': item['tagnode'] + ':' + addressText, group: groupName, title: addressText });
                edges.push({'id': prefix + item['tagnode'], 'from': routerName, 'to': prefix + item['tagnode'], title: item['tagnode'] });
              });
            };

            angular.forEach(viMap, function (vi, routerName) {
              nodes.push({'id': routerName, 'label': routerName, group: 'router', value: 20, title: routerName});
              drawInterfaces(routerName, vi['vyatta-interfaces-dataplane:dataplane'], 'dataplane');
              drawInterfaces(routerName, vi['vyatta-interfaces-vti:vti'], 'vti');
              drawInterfaces(routerName, vi['vyatta-interfaces-tunnel:tunnel'], 'tunnel');
            });

            var tunnelCount = 0; //just a running tunnelCount used as an id for drawing edges
            var drawTunnels = function(groupName, color) {
              var tunnelsGroup = _.groupBy(_.filter(nodes, function(node) {return node.group === groupName; } ), function(item) { return item.id.split(':')[1]; } );
              console.log("routers with tunnels grouped", tunnelsGroup);
              //filters all the nodes for group:groupName, then groups them by the "prefix"
              // on result, each group must have a list of two elements. If only one element is present, that is an orphan tunnel
              angular.forEach(tunnelsGroup, function(tunnelInterfaces, tunnelKey) {
                if (!_.isEmpty(tunnelInterfaces) && tunnelInterfaces.length === 2) {
                  edges.push({'id': ++tunnelCount, 'from': tunnelInterfaces[0].id, 'to': tunnelInterfaces[1].id, color: color, style: 'dash-line', width: 3 });
                }
              });
            };

            drawTunnels("vti", "#0066FF"); //ipv4
            drawTunnels("tunnel", "#335C33"); //ipv6

            console.log("vis.nodes", nodes);
            console.log("vis.edges", edges);

            var datasetNodes = new vis.DataSet();
            var datasetEdges = new vis.DataSet();
            datasetNodes.add(nodes);
            datasetEdges.add(edges);

            console.log('created datasetNodes and datasetEdges: ', datasetNodes);
            var graph = new vis.Network(element[0], {nodes: datasetNodes, edges: datasetEdges}, defaultOptions);
            return graph;
          }
        };

        $scope.$watch('vyattaInterfacesMap', drawVyattaInterfaces, true);
      }
    };
  });

  vyattaems.register.directive('vyattaNetconfLegend', function() {

    var legendNodeOptions = {
      widthMin: 4,
      widthMax: 24,
      fontColor: '#2B1B17',
      fontSize: 12
    };

    var legendGroupOptions = {
      height: '300px',
      width: '80px',
      dataplane: {
        shape: 'square',
        color: '#B84DB8',
        value: 16
      },
      vti: {
        shape: 'dot',
        color: '#70B8FF',
        radius: 12
      },
      tunnel: {
        shape: 'dot',
        color: '#99C199',
        radius: 12
      },
      router: {
        shape: 'image',
        image: 'assets/images/bvc/bvc-v5600.jpg'
      }
    };

    return {
      restrict: 'E',
      link: function($scope, iElm, iAttrs, controller) {
        var legendData = {
          nodes:
            [ {id: 'L0', x: 0, y: 0, label: 'v5600', group: 'router', value: 20},
              {id: 'L3', x: 0, y: 60, label: 'Dataplane', group: 'dataplane' },
              {id: 'L2', x: 0, y: 120, label: 'VTI', group: 'vti' },
              {id: 'L1', x: 0, y: 180, label: 'IPv6 Tunnel', group: 'tunnel' }
            ]
        };
        var container = iElm[0];

        var legendOptions = {
          nodes: legendNodeOptions,
          groups: legendGroupOptions,
          zoomable: false,
          dragNetwork: false
        };

        var graph = new vis.Network(container, legendData, legendOptions);
        return graph;
      }
    };
  });
});
