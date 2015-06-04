define(['app/vyattaems/vyattaems.module', 'app/vyattaems/vyattaems.directives', 'app/vyattaems/vyattaems.services'], function (vyattaems) {

  vyattaems.register.controller('VyattaEmsCtrl', ['$scope', '$rootScope', '$filter', '$log', 'VyattaEmsSvc', function ($scope, $rootScope, $filter, $log, VyattaEmsSvc) {

    $log.debug("=> VyattaEmsCtrl");

    $rootScope['section_logo'] = 'logo_vyattaems';

    $scope.controllerUrl = VyattaEmsSvc.controllerUrl();
    $scope.netconfDeviceName = '';
    $scope.netconfIpAddress = '';
    $scope.netconfPort = 22;
    $scope.userName = '';
    $scope.password = '';
    $scope.vyattaInterfacesMap = {};
    $scope.vyattaInterfacesMapLength = 0;
    $scope.deviceNames = [];
    $scope.connectors = [];
    $scope.tunnelOptions = {
      ipv6: false
    };
    $scope.alertStatus = {
      text: "",
      isWorking: false,
      type: 'alert-none',
      icon: ''
    };

    $scope.setAlert = function (alertText, alertType) {
      $scope.alertStatus.text = alertText;
      alertType = alertType || 'warning';
      $scope.alertStatus.type = 'alert-' + alertType;
      if (alertType === 'danger') {
        $scope.alertStatus.icon = 'icon-exclamation-sign';
      } else if (alertType == 'warning') {
        $scope.alertStatus.icon = 'icon-spinner icon-spin';
      } else {
        $scope.alertStatus.icon = 'icon-ok-sign';
      }
      $scope.alertStatus.isWorking = true;
    };

    $scope.closeAlert = function () {
      $scope.alertStatus.text = "";
      $scope.alertStatus.isWorking = false;
      $scope.alertStatus.type = 'alert-none';
      $scope.alertStatus.icon = '';
    };

    //submit := mountDevice
    $scope.submit = function () {
      $log.debug('==> VyattaEmsCtrl:submit()');
      $scope.setAlert("Mounting Netconf Device [" + $scope.netconfDeviceName + "] on the controller. Please wait...");
      return VyattaEmsSvc.mountDevice($scope.netconfDeviceName, $scope.netconfIpAddress, $scope.netconfPort, $scope.userName, $scope.password).then(function () {
        setTimeout(function () {
          return VyattaEmsSvc.getVyattaInterface($scope.netconfDeviceName).then(function () {
            return $scope.refresh();
          }, function (errorMessage) {
            $log.error("ERROR: Failed to mount device", $scope.netconfDeviceName, $scope.netconfIpAddress, errorMessage);
            $scope.setAlert("Failed to mount device [" + $scope.netconfDeviceName + "]. Please check the controller logs for more information.", 'danger');
          });
        }, 4000);
      }, function (errorMessage) {
        $log.error("ERROR: Cannot mountDevice", $scope.netconfDeviceName, $scope.netconfIpAddress, errorMessage);
      });
    };

    $scope.unmountDevice = function (routerName) {
      $log.debug("==> VyattaEmsCtrl:unmountDevice()");
      $scope.setAlert("Unmounting Netconf Device [" + routerName + "] from the controller. Please wait...");
      return VyattaEmsSvc.unmountDevice(routerName).then(function () {
        setTimeout(function () {
          return $scope.refresh();
        }, 4000);
      }, function (errorMessage) {
        $log.error("ERROR: Cannot unmountDevice", routerName, errorMessage);
        $scope.setAlert("Failed to unmount device [" + routerName + "] from the controller. Please check the controller logs for more information.", 'danger');
      });
    };

    $scope.createTunnel = function () {
      $log.debug("==> VyattaEmsCtrl:createTunnel()", $scope.connectors);
      $scope.setAlert("Creating Tunnel between the routers. This may take upto 120 seconds. Please wait...");
      return VyattaEmsSvc.createTunnel($scope.connectors[0], $scope.connectors[1], $scope.tunnelOptions.ipv6).then(function () {
        setTimeout(function () {
          $scope.refresh();
        }, 25000);
      }, function (errorMessage) {
        $log.error("ERROR: Failed to create tunnel", errorMessage);
        $scope.setAlert("Failed to create tunnel. Please check the controller logs for more information.", 'danger');
      });
    };

    $scope.deleteTunnel = function () {
      $log.debug("==> VyattaEmsCtrl:deleteTunnel()", $scope.connectors);
      $log.debug($scope.vyattaInterfacesMap[$scope.connectors[0]]['local-ip']);
      $log.debug($scope.vyattaInterfacesMap[$scope.connectors[1]]['local-ip']);
      $scope.setAlert("Deleting tunnels between the routers. Please wait...");
      return VyattaEmsSvc.deleteTunnel($scope.connectors[0], $scope.vyattaInterfacesMap[$scope.connectors[0]]['local-ip'], $scope.connectors[1], $scope.vyattaInterfacesMap[$scope.connectors[1]]['local-ip']).then(function () {
        $log.info("Refreshing page");
        setTimeout(function () {
          $scope.refresh();
        }, 5000);
      }, function (error) {
        $log.error("ERROR: Cannot delete tunnels", error);
        $scope.setAlert(error.message, 'danger');
      });
    };

    $scope.refresh = function () {
      $log.debug("==> VyattaEmsCtrl:refresh()");
      $scope.setAlert("Loading router details from the controller. Please wait...");
      return VyattaEmsSvc.getVyattaInterfacesAll().then(function (data) {
        $scope.vyattaInterfacesMap = data;
        $scope.vyattaInterfacesMapLength = Object.keys($scope.vyattaInterfacesMap).length;
        if ($scope.vyattaInterfacesMapLength > 0) {
          $scope.setAlert("Successfully loaded router details from the controller", "success");
        } else {
          $scope.setAlert("No Vyatta routers are registered in the controller. Start by mounting a Vyatta router.", "success");
        }
        $log.info('==> VyattaEmsCtrl:refesh:vyattaInterfacesMap', $scope.vyattaInterfacesMap);
        $scope.deviceNames = Object.keys($scope.vyattaInterfacesMap);
        //$scope.closeAlert();
      }, function (errorMessage) {
        $log.error("ERROR: Cannot retrieve vyatta interfaces", errorMessage);
        $scope.setAlert("Failed to retrieve router details. Please check the controller logs for more information.", 'danger');
      });
    };

    $scope.toggleSelection = function (viKey) {
      var index = $scope.connectors.indexOf(viKey);
      if (index > -1) {
        $scope.connectors.splice(index, 1);
      } else {
        $scope.connectors.push(viKey);
      }
    };

    $scope.refresh();

  }]);
});
