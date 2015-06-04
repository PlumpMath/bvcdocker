define(['app/paths/paths.module'], function (paths) {

  paths.register.factory('PathsRestangular', ['Restangular', 'ENV', function (Restangular, ENV) {
    return Restangular.withConfig(function (RestangularConfig) {
      console.log("baseURL: ", ENV.getBaseURL());
      RestangularConfig.setBaseUrl(ENV.getBaseURL());
      //RestangularConfig.setDefaultHeaders({Authorization: 'Basic YWRtaW46YWRtaW4='});
    });
  }]);

  paths.register.factory('PathsSvc', ['PathsRestangular', function (PathsRestangular) {
    var svc = {
      base: function () {
        return PathsRestangular.one('restconf').one('config').one('paths:paths');
      },
      topology: function () {
        return PathsRestangular.one('restconf').one('operational').one('network-topology:network-topology');
      },
      data: null,
      TOPOLOGY_CONST: {
        NODE_ID:"node-id",
        SOURCE_NODE:"source-node",
        DEST_NODE:"dest-node",
        SOURCE_TP:"source-tp",
        DEST_TP:"dest-tp",
        HTS_ID:"host-tracker-service:id",
        ADDRESSES:"addresses",
        HTS_ADDRESSES:"host-tracker-service:addresses",
        IP:"ip",
        HTS_IP:"host-tracker-service:ip",
        ATT_POINTS: "attachment-points",
        HTS_ATT_POINTS:"host-tracker-service:attachment-points",
        TP_ID: "tp-id",
        HTS_TP_ID:"host-tracker-service:tp-id",
        TERM_POINT: "termination-point",
        HTS_TERM_POINT: "host-tracker-service:termination-point"
      }
    };

    svc.getCurrentData = function () {
      return svc.data;
    };

    svc.getAllNodes = function () {
      svc.data = svc.topology().getList();
      return svc.data;
    };

    svc.getNode = function (node, cb) {

      console.debug("==> PathsSvc:getNode()");
      return svc.topology().one("topology", node).get().then(function (ntData) {

        var nodes = [];
        var edges = [];
        var hostLinks = [];
        console.debug("==> PathsSvc: get topology");

        console.debug("==> PathsSvc: collect nodes from topology");

        if (ntData.topology && ntData.topology[0]) {
          //Loop over the nodes
          angular.forEach(ntData.topology[0].node, function (nodeData) {

            var groupType = "", nodeTooltip = "", nodeLabel = "", nodeId = "", ipAddress = "";

            nodeId = nodeData[svc.TOPOLOGY_CONST.NODE_ID]; //format is host:00:00:00:00:00:01 or openflow:1

            if (nodeId !== undefined && nodeId.indexOf("host") >= 0) {
              //Handle HOSTS
              groupType = "desktop";
              nodeTooltip = nodeId;
              nodeLabel = nodeId; //set it as default, in case host-tracker-service:addresses:ip is not found

              var addresses = nodeData[svc.TOPOLOGY_CONST.ADDRESSES] || nodeData[svc.TOPOLOGY_CONST.HTS_ADDRESSES];
              if (addresses && addresses.length > 0) {
                nodeLabel = addresses[0][svc.TOPOLOGY_CONST.IP] || addresses[i][svc.TOPOLOGY_CONST.HTS_IP];
              }
              nodeLabel += '(' + nodeId + ')';

              //get Link Info
              var attachmentPoints = nodeData[svc.TOPOLOGY_CONST.ATT_POINTS] || nodeData[svc.TOPOLOGY_CONST.HTS_ATT_POINTS];
              for (var j = 0; j < (attachmentPoints !== undefined && attachmentPoints.length); j++) {
                var hostTpId = attachmentPoints[j][svc.TOPOLOGY_CONST.TP_ID] || attachmentPoints[j][svc.TOPOLOGY_CONST.HTS_TP_ID];
                hostLinks.push({'from': nodeId, 'to': hostTpId.substring(0, hostTpId.lastIndexOf(":"))});
              }

            } else {
              //Handle SWITCHES
              groupType = "switch";
              nodeTooltip = 'Switch (<b>' + nodeData[svc.TOPOLOGY_CONST.NODE_ID] + '</b>)<br>';
              nodeLabel = nodeData[svc.TOPOLOGY_CONST.NODE_ID];
              nodeId = nodeData["node-id"];
            }

            nodes.push({'id': nodeId, 'label': nodeLabel, group: groupType, value: 20, title: nodeTooltip});
          });

          console.debug("==> PathsSvc: collect edges from topology");

          //Loops over the edges
          angular.forEach(ntData.topology[0].link, function (linkData) {
            var srcPort = linkData.source[svc.TOPOLOGY_CONST.SOURCE_TP];
            var destPort = linkData.destination[svc.TOPOLOGY_CONST.DEST_TP];
            var edgeId = edges.length.toString();

            if (srcPort != null && destPort != null) {
              edges.push({'id': edgeId, 'from': linkData.source['source-node'], 'to': linkData.destination['dest-node'], title: srcPort + ' -> ' + destPort});
            }
          });
        }

        var data = {
          "nodes": nodes,
          "edges": edges
        };
        cb(data);
      }, function (response) {
        console.error("==> PathSvc: error while getting topology", response.status);
      });
    };

    svc.getPaths = function () {
      console.debug("==> PathSvc:getPaths()");
      svc.data = svc.base().getList();
      return svc.data;
    };

    svc.addPath = function (sourceAddress, destinationAddress, waypoints) {
      console.debug("==> PathSvc:addPath()", sourceAddress, destinationAddress, waypoints);
      //No need to construct this before hand, but useful because it self-documents what json is being sent to md-sal
      var addPathParam = {
        "path": [
          {
            "path-name": '',
            "source-addr": '',
            "destination-addr": '',
            "waypoints": []
          }
        ]
      };

      addPathParam.path[0]['path-name'] = sourceAddress + '-' + destinationAddress;
      addPathParam.path[0]['source-addr'] = sourceAddress;
      addPathParam.path[0]['destination-addr'] = destinationAddress;
      if (typeof waypoints === 'string') {
        console.debug('==> PathSvc: multiple waypoints entered');
        waypoints = waypoints.split(',');
      }
      addPathParam.path[0]['waypoints'] =  _.filter(waypoints, function(w) { return !_.isEmpty(w); }) || [];
      console.debug("==> PathSvc: addPath", JSON.stringify(addPathParam, undefined, 2));

      return svc.base().several('path', sourceAddress + '-' + destinationAddress).customPUT(addPathParam);
    };

    svc.deletePath = function (sourceAddress, destinationAddress) {
      console.debug("==> PathSvc:deletePath()", sourceAddress, destinationAddress);
      return svc.base().several('path', sourceAddress + '-' + destinationAddress).remove();
    };


    return svc;
  }]);

});