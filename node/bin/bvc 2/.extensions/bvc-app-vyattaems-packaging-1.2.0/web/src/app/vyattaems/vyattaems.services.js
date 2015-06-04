define(['app/vyattaems/vyattaems.module', 'jquery'], function (vyattaems, $) {

  vyattaems.register.factory('VyattaEmsRestangular', ['Restangular', 'ENV', '$log', function (Restangular, ENV, $log) {
    return Restangular.withConfig(function (RestangularConfig) {
      $log.debug("Controller REST Url", ENV.getBaseURL());
      RestangularConfig.setBaseUrl(ENV.getBaseURL());
    });
  }]);

  vyattaems.register.factory('VyattaEmsSvc', ['VyattaEmsRestangular', '$http', '$q', 'ENV', '$log', '$timeout', function (VyattaEmsRestangular, $http, $q, ENV, $log, $timeout) {

      var vRouterConfig = ENV["vyatta-vRouter5600-ems"];
      $log.debug("vRouterConfig", vRouterConfig);

      var svc = {
        controllerUrl: function () {
          return ENV.getBaseURL();
        },
        base: function () {
          return VyattaEmsRestangular.one('restconf').one('config').one('opendaylight-inventory:nodes');
        },
        mount: function () {
          // restconf/config/opendaylight-inventory:nodes/node/controller-config/yang-ext:mount/config:modules
          return svc.base().one('node').one('controller-config').one('yang-ext:mount').one('config:modules');
        },
        unmount: function (routerName) {
          // restconf/config/opendaylight-inventory:nodes/node/controller-config/yang-ext:mount/config:modules/module/odl-sal-netconf-connector-cfg:sal-netconf-connector/new-netconf-device
          return svc.mount().one('module').one('odl-sal-netconf-connector-cfg:sal-netconf-connector').one(routerName);
        },
        yangmount: function (routerName) {
          return svc.base().one('node').one(routerName).one('yang-ext:mount');
        },
        vyattaInterface: function (routerName) {
          // restconf/config/opendaylight-inventory:nodes/restconf/config/opendaylight-inventory:nodes/node/$netconfName/yang-ext:mount/vyatta-interfaces:interfaces
          return svc.yangmount(routerName).one('vyatta-interfaces:interfaces');
        },
        vtiTunnel: function (routerName) {
          // restconf/config/opendaylight-inventory:nodes/node/$netconfName/yang-ext:mount/vyatta-interfaces:interfaces/vyatta-interfaces-vti:vti/vti0
          return svc.vyattaInterface(routerName).one('vyatta-interfaces-vti:vti');
        },
        vyattaSecurity: function (routerName) {
          // restconf/config/opendaylight-inventory:nodes/node/$netconfName/yang-ext:mount/vyatta-security:security
          return svc.yangmount(routerName).one('vyatta-security:security');
        },
        ipsecVpnTunnel: function (routerName) {
          // restconf/config/opendaylight-inventory:nodes/node/$netconfName/yang-ext:mount/vyatta-security:security/vyatta-security-vpn-ipsec:vpn/ipsec
          return svc.vyattaSecurity(routerName).one('vyatta-security-vpn-ipsec:vpn').one('ipsec');
        },
        ikeGroup: function (routerName) {
          // restconf/config/opendaylight-inventory:nodes/node/$netconfName/yang-ext:mount/vyatta-security:security/vyatta-security-vpn-ipsec:vpn/ipsec/ike-group/IKE-1
          return svc.ipsecVpnTunnel(routerName).one('ike-group').one('IKE-1');
        },
        espGroup: function (routerName) {
          // restconf/config/opendaylight-inventory:nodes/node/$netconfName/yang-ext:mount/vyatta-security:security/vyatta-security-vpn-ipsec:vpn/ipsec/esp-group/ESP-1
          return svc.ipsecVpnTunnel(routerName).one('esp-group').one('ESP-1');
        },
        logging: function (routerName) {
          // restconf/config/opendaylight-inventory:nodes/node/$netconfName/yang-ext:mount/vyatta-security:security/vyatta-security-vpn-ipsec:vpn/ipsec/logging
          return svc.ipsecVpnTunnel(routerName).one('logging');
        },
        peer: function (routerName) {
          // restconf/config/opendaylight-inventory:nodes/node/$netconfName/yang-ext:mount/vyatta-security:security/vyatta-security-vpn-ipsec:vpn/ipsec/site-to-site/peer/$prefix
          return svc.ipsecVpnTunnel(routerName).one('site-to-site').one('peer');
        },
        staticRoute: function (routerName) {
          // restconf/config/opendaylight-inventory:nodes/node/$netconfName/yang-ext:mount/vyatta-protocols:protocols/vyatta-protocols-static:static/
          return svc.yangmount(routerName).one('vyatta-protocols:protocols').one('vyatta-protocols-static:static').one('route');
        },
        ipv6Tunnel: function (routerName) {
          // restconf/config/opendaylight-inventory:nodes/node/$netconfName/yang-ext:mount/vyatta-interfaces:interfaces/vyatta-interfaces-tunnel:tunnel/tun0
          return svc.vyattaInterface(routerName).one('vyatta-interfaces-tunnel:tunnel');
        },
        vtiIpv6Tunnel: function (routerName) {
          //restconf/config/opendaylight-inventory:nodes/node/vyatta1/yang-ext:mount/vyatta-interfaces:interfaces/
          return svc.vyattaInterface(routerName);
        },

        data: null
      };

      svc.getCurrentData = function () {
        return svc.data;
      };

      /**
       *
       * Mount Device
       *
       * **/
      svc.mountDevice = function (netconfDeviceName, netconfIpAddress, netconfPort, userName, password) {
        $log.debug("==> VyattaEmsSvc:mountDevice()", netconfDeviceName, netconfIpAddress);
        var ncpayload = "";

        return $http.get("/src/app/vyattaems/vdx-mount-netconf.xml").then(function (netconfXmlTemplate) {
          ncpayload = netconfXmlTemplate.data;
          ncpayload = ncpayload.replace('$netconfDeviceName', netconfDeviceName);
          ncpayload = ncpayload.replace('$netconfIpAddress', netconfIpAddress);
          ncpayload = ncpayload.replace('$netconfPort', netconfPort);
          ncpayload = ncpayload.replace('$userName', userName);
          ncpayload = ncpayload.replace('$password', password);
          $log.info("netconfc-payload", ncpayload);
          return svc.mount().customPOST(ncpayload, '', {}, {'Content-Type': 'application/xml', Accept: 'application/xml'});
        });
      };

      /**
       *
       * Unmount Device
       *
       * **/
      svc.unmountDevice = function (routerName) {
        $log.debug("==> VyattaEmsSvc:unmountDevice()", routerName);
        return svc.unmount(routerName).remove().then(function (data) {
          $log.info('==> VyattaEmsSvc: unmounted device', routerName, data);
        });
      };

      svc.getVyattaInterface = function (routerName) {
        return svc.vyattaInterface(routerName).get();
      };

      /**
       *
       * Get the Vyatta Interfaces for all existing switches
       *
       * **/
      svc.getVyattaInterfacesAll = function () {
        $log.debug("==> VyattaEmsSvc:getVyattaInterfacesAll()");

        return svc.mount().get().then(function (moduleData) {
          return svc.base().get().then(function (inventoryNodes) {
            $log.info("retrieving mounted extension nodes", inventoryNodes["nodes"]);
            //data.nodes.node is actually an array of ids - remove the "controller-config" node
            var nodeList = _.filter(inventoryNodes.nodes.node, function (node) {
              return (node.id.indexOf('controller-config') < 0);
            });

            var vyattaInterfacesMap = {};
            var restApis = [];
            //collect all the apis to be called for each router
            angular.forEach(nodeList, function (node) {
              var restApi = svc.vyattaInterface(node.id).get().then(function (vyattaInterface) {
                //node.id is the routerName
                // find the local-ip address for the routerName from the modules api
                var routerModule = _.find(moduleData["modules"]["module"], function (item) {
                  return item["name"] === node.id && item["type"] === "odl-sal-netconf-connector-cfg:sal-netconf-connector";
                });
                vyattaInterfacesMap[node.id] = vyattaInterface['interfaces'];
                vyattaInterfacesMap[node.id]['local-ip'] = routerModule["odl-sal-netconf-connector-cfg:address"];
                //returned data is not used, instead the vyattaInterfacesMap[node.id] is used
                return vyattaInterface['interfaces'];
              });
              restApis.push(restApi);
            });
            //call and resolve all the apis
            $q.all(restApis).then(function (allVyattaInterfaces) {
              console.log('resolved all vyatta-interfaces', allVyattaInterfaces);
            });
            //wait until apis are resolved and return the promise back to the vyattaems.controller
            var defer = $q.defer();
            $timeout(function () {
              defer.resolve(vyattaInterfacesMap);
            }, 1000);

            return defer.promise;
          });
        });
      };

      svc.getVyattaSecurity = function (routerName) {
        $log.debug("==> VyattaEmsSvc:getVyattaSecurity()");
        var defer = $q.defer();
        var securityConfigRestApi = svc.vyattaSecurity(routerName).get().then(function (data) {
          $log.debug("vyatta-security available");
          defer.resolve({securityConfigExists: true});
        }, function (error) {
          if (error.status === 404) {
            defer.resolve({securityConfigExists: false});
          } else {
            defer.resolve({securityConfigExists: true});
          }
        });
        return defer.promise;
      };

      /**
       *
       * Create Tunnel
       *
       * **/
      svc.createTunnel = function (routerName1, routerName2, addIpv6Tunnel) {
        $log.debug("===> VyattaEmsSvc:createTunnel(" + routerName1 + ',' + routerName2 + ',' + 'ipv6-tunnel: ' + addIpv6Tunnel + ")");

        var vtiTagNode, tunTagNode;
        var vi1, vtiLocalIp_r1, localIp_r1, ipsecInterface_r1, peerPrefixIp_r1, tunnelIpv6_r1, peerPrefixIpWith0_r1;
        var vi2, vtiLocalIp_r2, localIp_r2, ipsecInterface_r2, peerPrefixIp_r2, tunnelIpv6_r2, peerPrefixIpWith0_r2;

        /** ********* ROUTER 1 ************* **/

        return svc.getVyattaInterfacesAll().then(function (vyattaInterfacesAll) {
          vi1 = vyattaInterfacesAll[routerName1];
          vi2 = vyattaInterfacesAll[routerName2];
          localIp_r1 = vi1["local-ip"];
          localIp_r2 = vi2["local-ip"];

          //@step-02: calculate the next available subnet index used as id
          var nextSubnetValue = nextAvailableSubnet(vyattaInterfacesAll);
          $log.info("nextSubnet", nextSubnetValue);

          vtiTagNode = vRouterConfig['vti-prefix'] + nextSubnetValue;
          tunTagNode = vRouterConfig['tun-prefix'] + nextSubnetValue;

          vtiLocalIp_r1 = vRouterConfig["vti-ip-v4"].replace('.y', '.' + nextSubnetValue).replace('.x', '.1');
          tunnelIpv6_r1 = vRouterConfig["tunnel-ip-v6"].replace(':y', ':' + (("00000" + nextSubnetValue).slice(-4))).replace(':x', ':1');
          $log.info("next interface addresses", vtiLocalIp_r1, tunnelIpv6_r1);

          //@step-03: find the ipsecInterface from the dataplane -> the dataplane for which the address = localIp address
          var dataplaneList = vi1["vyatta-interfaces-dataplane:dataplane"];
          var dp = _.find(dataplaneList, function (item) {
            return item.hasOwnProperty("address") && item["address"][0].split('/')[0] === localIp_r1;
          });
          //ipsecInterface_r1 = dp["tagnode"];

          //@step-04: find the peerprefix from the dataplane -> the dataplane for which the address != localIp address
          var peerPrefixDp = _.find(dataplaneList, function (item) {
            return item.hasOwnProperty("address") && item["address"][0].split('/')[0] !== localIp_r1.split('/')[0] && item["address"][0] !== "dhcp" ;
            //return item.hasOwnProperty("address") && item["address"][0].split('/')[0] !== localIp_r1.split('/')[0] ;
          });
          peerPrefixIp_r1 = peerPrefixDp["address"][0];
          peerPrefixIpWith0_r1 = replaceSubnetWith0(peerPrefixIp_r1);

          /** ******************* ROUTER 2 ******************** **/

          vtiLocalIp_r2 = vRouterConfig["vti-ip-v4"].replace('.y', '.' + nextSubnetValue).replace('.x', '.2');
          tunnelIpv6_r2 = vRouterConfig["tunnel-ip-v6"].replace(':y', ':' + (("00000" + nextSubnetValue).slice(-4))).replace(':x', ':2');

          //@step-07: find the ipsecInterface from the dataplane -> the dataplane for which the address = localIp address
          dataplaneList = vi2["vyatta-interfaces-dataplane:dataplane"];
          dp = _.find(dataplaneList, function (item) {
            return item.hasOwnProperty("address") && item["address"][0].split('/')[0] === localIp_r2;
          });
          //ipsecInterface_r2 = dp["tagnode"];

          //@step-08: find the peerprefix from the dataplane -> the dataplane for which the address != localIp address
          peerPrefixDp = _.find(dataplaneList, function (item) {
            return item.hasOwnProperty("address") && item["address"][0].split('/')[0] !== localIp_r2.split('/')[0]  && item["address"][0] !== "dhcp" ;
            //return item.hasOwnProperty("address") && item["address"][0].split('/')[0] !== localIp_r2.split('/')[0];
          });
          peerPrefixIp_r2 = peerPrefixDp["address"][0];
          peerPrefixIpWith0_r2 = replaceSubnetWith0(peerPrefixIp_r2);

          //@step-09: construct all the payloads for both router1 and router2
          var securityPayload = securityConfigPayload("payload-vyatta-security");
          var ikeGroupPayload = securityConfigPayload("payload-vyatta-security-vpn-ipsec-ike-group-ike-1");
          var espGroupPayload = securityConfigPayload("payload-vyatta-security-vpn-ipsec-ike-group-esp-1");
          var loggingPayload = securityConfigPayload("payload-vyatta-security-vpn-ipsec-logging");

          var vti_r1 = vtiTunnelPayload(vtiTagNode, vtiLocalIp_r1);
          var peerPayload_r1 = siteToSitePeerPayload(vtiTagNode, localIp_r1, localIp_r2);
          //ODL-439: create staticRoutePayload with the remote peerPrefixIp
          var staticRoute_r1 = staticRoutePayload(peerPrefixIpWith0_r2, vtiLocalIp_r2.split('/')[0]);
          var tunnelInterface_r1 = ipv6TunnelPayload(tunTagNode, tunnelIpv6_r1, vtiLocalIp_r1.split('/')[0], vtiLocalIp_r2.split('/')[0]);

          var vti_r2 = vtiTunnelPayload(vtiTagNode, vtiLocalIp_r2);
          var peerPayload_r2 = siteToSitePeerPayload(vtiTagNode, localIp_r2, localIp_r1);
          //ODL-439: create staticRoutePayload with the remote peerPrefixIp
          var staticRoute_r2 = staticRoutePayload(peerPrefixIpWith0_r1, vtiLocalIp_r1.split('/')[0]);
          var tunnelInterface_r2 = ipv6TunnelPayload(tunTagNode, tunnelIpv6_r2, vtiLocalIp_r2.split('/')[0], vtiLocalIp_r1.split('/')[0]);

          //@step-10: create the PUT apis for each router and concat them all
          //for EACH router, 8 rest apis must be called in this order: vti_*, securityPayload, ikeGroupPayload, espGroupPayload, loggingPayload, peerPayload_*, staticRouter_*, l*
          var tunnelRestApiList = [];
          //ODL-439: create staticRoutePayload with the remote peerPrefixIp
          var createTunnelApisRouter1 = createTunnelApis(routerName1, addIpv6Tunnel, vtiTagNode, tunTagNode, localIp_r2, peerPrefixIpWith0_r2, vti_r1, securityPayload, ikeGroupPayload, espGroupPayload, loggingPayload, peerPayload_r1, staticRoute_r1, tunnelInterface_r1);
          var createTunnelApisRouter2 = createTunnelApis(routerName2, addIpv6Tunnel, vtiTagNode, tunTagNode, localIp_r1, peerPrefixIpWith0_r1, vti_r2, securityPayload, ikeGroupPayload, espGroupPayload, loggingPayload, peerPayload_r2, staticRoute_r2, tunnelInterface_r2);

          return createTunnelApisRouter1.then(function (apis_r1) {
            tunnelRestApiList = tunnelRestApiList.concat(apis_r1);
            return createTunnelApisRouter2.then(function (apis_r2) {
              tunnelRestApiList = tunnelRestApiList.concat(apis_r2);

              //@step-11: execute tunnel rest apis synchronously
              var yangJsonHeaders = {'Accept': 'application/json', 'Content-Type': 'application/yang.data+json'};
              $log.debug("total rest apis to execute", tunnelRestApiList.length);
              /*jshint -W083 */
              //start with a pre-resolved promise
              var previous = $q.when(null);
              for (var i = 0; i < tunnelRestApiList.length; i++) {
                (function (i) {
                  previous = previous.then(function () { //wait for previous operation
                    var api = tunnelRestApiList[i];
                    console.dir(api.restEndPoint.getRestangularUrl());
                    $log.debug(JSON.stringify(api['payload'], undefined, 2));
                    return api["restEndPoint"].customPUT(api["payload"], undefined, undefined, yangJsonHeaders);
                  });
                }(i));
              }
              return previous;
            });
          });
        });
      };

      /**
       *
       * Delete Tunnel
       *
       * NOT IMPLEMENTED for release 1.1.0
       * Bug in vRouter causes router to freeze when deleteTunnel is called via ODL Netconf
       *
       * **/
      svc.deleteTunnel = function (routerName1, router1IP, routerName2, router2IP) {
        return deleteTunnelOnRouter(routerName1, router1IP, routerName2, router2IP).then(function(data) {
          return deleteTunnelOnRouter(routerName2, router2IP, routerName1, router1IP);
        });
      };

      var deleteTunnelOnRouter = function (routerName1, router1IP, routerName2, router2IP) {
        $log.info("===> VyattaEmsService.deleteTunnelOnRouter", routerName1);

        return svc.peer(routerName1).one(router2IP).get().then(function (data) {  //App will issue a GET call on SITE2SITE URL on 1st router
            var vti1 = data['vyatta-security-vpn-ipsec:peer'][0]['vti']['bind'];
            return svc.vtiTunnel(routerName1).one(vti1).get().then(function (tunneldata) {  //Get VTI interface to know IP address.
              var tunnel = tunneldata['vyatta-interfaces-vti:vti'][0]['address'][0];
              var res = tunnel.split("/"); //spliting value because value is 172.16.29.1/30
              $log.debug("VTI inetrfaces == >", res[0]);
              return svc.vyattaInterface(routerName1).get().then(function (ipv6data) {   //A get on all interfaces in the vRouter to figure out the IP v6 tunnel interfaces using the vti
                var tunnelElement = _.find(ipv6data['interfaces']['vyatta-interfaces-tunnel:tunnel'], function (x) {
                  return x['local-ip'] === res[0];
                });
                if (typeof tunnelElement !== 'undefined') {
                  var tunnelName = tunnelElement['tagnode'];
                  $log.debug("tunnelName ==>", tunnelName);
                }
                //Now we have recognized all the entities to delete. Delete them in this order
                return svc.peer(routerName1).one(router2IP).remove().then(function () {
                  svc.vtiTunnel(routerName1).one(vti1).remove();
                  if (typeof tunnelName !== 'undefined') {
                    svc.ipv6Tunnel(routerName1).one(tunnelName).remove();
                  }
                });
              });
            });
          }, function (error) {
            if (error.status === 404) {
              $log.error("No tunnel exist between the routers");
              throw new Error("Cannot delete tunnels. No tunnel exists between the routers.");
            }
          }
        );
      };


      /**
       *
       * Payloads for createTunnel()
       *
       * **/
      var vtiTunnelPayload = function (vtiTagNode, vtiLocalIp) {
        var payload = JSON.parse(JSON.stringify(vRouterConfig["payload-vti"]));
        payload["vyatta-interfaces-vti:vti"]["tagnode"] = vtiTagNode;
        payload["vyatta-interfaces-vti:vti"]["address"] = [vtiLocalIp];
        return payload;
      };

      //"payload-vyatta-security"
      //"payload-vyatta-security-vpn-ipsec-ike-group-ike-1"
      //"payload-vyatta-security-vpn-ipsec-ike-group-esp-1"
      //"payload-vyatta-security-vpn-ipsec-logging"
      var securityConfigPayload = function (ipsecConfigName) {
        $log.debug("loading configuration", ipsecConfigName);
        return JSON.parse(JSON.stringify(vRouterConfig[ipsecConfigName]));
      };

      var siteToSitePeerPayload = function (vtiTagNode, localIp, remoteIp) {
        var payload = JSON.parse(JSON.stringify(vRouterConfig["payload-vyatta-security-vpn-ipsec-site-to-site-peer"]));
        //payload["vyatta-security-vpn-ipsec:vpn"]["ipsec"]["ipsec-interfaces"]["interface"] = ipsecInterface; //LOI TO ANSWER
        payload["vyatta-security-vpn-ipsec:peer"]["tagnode"] = remoteIp;
        payload["vyatta-security-vpn-ipsec:peer"]["local-address"] = localIp;
        payload["vyatta-security-vpn-ipsec:peer"]["vti"]["bind"] = vtiTagNode;
        return payload;
      };

      var staticRoutePayload = function (tagNode, vtiRemoteIp) {
        var payload = JSON.parse(JSON.stringify(vRouterConfig["payload-static-route"]));
        payload["vyatta-protocols-static:route"][0]["tagnode"] = tagNode;
        payload["vyatta-protocols-static:route"][0]["next-hop"][0]["tagnode"] = vtiRemoteIp;
        return payload;
      };

      var ipv6TunnelPayload = function (tunTagNode, tunnelIpv6, vtiLocalIp, vtiRemoteIp) {
        var payload = JSON.parse(JSON.stringify(vRouterConfig["payload-tunnel"]));
        payload["vyatta-interfaces-tunnel:tunnel"]["tagnode"] = tunTagNode;
        payload["vyatta-interfaces-tunnel:tunnel"]["address"] = [tunnelIpv6];
        payload["vyatta-interfaces-tunnel:tunnel"]["local-ip"] = [vtiLocalIp];
        payload["vyatta-interfaces-tunnel:tunnel"]["remote-ip"] = [vtiRemoteIp];
        return payload;
      };

      var createTunnelApis = function (routerName, addIpv6Tunnel, vtiTagNode, tunTagNode, remoteIp, peerPrefixIpWith0, vti, securityPayload, ikeGroupPayload, espGroupPayload, loggingPayload, peerPayload, staticRoute, tunnelInterface) {
        $log.info("createTunnel", routerName, addIpv6Tunnel, vtiTagNode, tunTagNode, peerPrefixIpWith0);
        var restEndPoints = [];
        var defer = $q.defer();
        var vs = svc.getVyattaSecurity(routerName).then(function (data) {
          restEndPoints.push({name: routerName, "restEndPoint": svc.vtiTunnel(routerName).one(vtiTagNode), "payload": vti});
          if (data.securityConfigExists === false) {
            restEndPoints.push({name: routerName, "restEndPoint": svc.vyattaSecurity(routerName), "payload": securityPayload});
          }
          restEndPoints.push({name: routerName, "restEndPoint": svc.ikeGroup(routerName), "payload": ikeGroupPayload});
          restEndPoints.push({name: routerName, "restEndPoint": svc.espGroup(routerName), "payload": espGroupPayload});
          restEndPoints.push({name: routerName, "restEndPoint": svc.logging(routerName), "payload": loggingPayload});
          restEndPoints.push({name: routerName, "restEndPoint": svc.peer(routerName).one(remoteIp), "payload": peerPayload});
          restEndPoints.push({
            name: routerName,
            "restEndPoint": svc.staticRoute(routerName).one(peerPrefixIpWith0.replace('/', '%2F')),
            "payload": staticRoute
          });
          if (addIpv6Tunnel) {
            restEndPoints.push({name: routerName, "restEndPoint": svc.ipv6Tunnel(routerName).one(tunTagNode), "payload": tunnelInterface});
          }
          defer.resolve(restEndPoints);
          $log.info("createdTunnelApis for", routerName, restEndPoints.length);
        });

        return defer.promise;
      };

      /**
       *
       * Utility functions for createTunnel()
       *
       * **/

      /**
       *  replaceSubnetWith0
       *
       *  ideally should use binary arithmetic, but this is quicker
       *  params ip: 10.18.161.80/24
       *  return 10.18.161.0/24
       */
      var replaceSubnetWith0 = function (ip) {
        var x = ip.split('/');
        var z = x[0].split('.');
        return z.splice(0, 3).join('.').concat('.0/').concat(x[1]);
      };

      /**
       *  nextAvailableSubnet
       *
       *  params ip: all vyatta interfaces
       *  return the highest ipaddress for 3rd quartet + 1
       */
      var nextAvailableSubnet = function (allInterfaces) {
        // yields: [ { address: [ '172.16.0.1', '172.16.1.1' ] }, { address: [ '172.16.0.2', '172.16.1.2' ] } ]
        var addressListPartitioned = _.flatten(_.reject(_.pluck(_.values(allInterfaces), "vyatta-interfaces-vti:vti"), function (item) {
          return _.isEmpty(item);
        }));
        // yields: [ '172.16.0.1', '172.16.1.1', '172.16.0.2', '172.16.1.2' ]
        if (addressListPartitioned.length > 0) {
          var addresses = _.flatten(_.pluck(addressListPartitioned, "address"));
          return _.max(_.map(addresses, function (item) {
              return parseInt(item.split('.')[2]);
            })) + 1;
        }

        return 0;
      };

      return svc;
    }]
  );

});
