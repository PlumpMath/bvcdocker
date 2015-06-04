define(['app/paths/paths.module'], function(paths) {

  paths.register.filter('switchExtractFilter', function () {
    return function (hop) {
      var hopRegEx = /.(opendaylight-inventory\:nodes\/opendaylight-inventory\:node\/opendaylight-inventory\:node\[opendaylight-inventory\:id='(.*)'\]\/opendaylight-inventory\:node-connector\/opendaylight-inventory:node-connector\[opendaylight-inventory\:id='(.*)'\])/;
      var switchWithPort = hopRegEx.exec(hop)[3];
      //console.log('switchWithPort: ' , switchWithPort);
      return switchWithPort;
    };
  });

  paths.register.filter('groupHopsFilter', function () {
    return function (hops) {
      var lists = _.chain(hops).groupBy(function (element, index) {
        return Math.floor(index / 2);
      }).toArray();
      return lists.value();
    };
  });
});