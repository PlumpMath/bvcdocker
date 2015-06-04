angular.module('templates-bvc-vyattaems', ['vyattaems/index.tpl.html']);

angular.module("vyattaems/index.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("vyattaems/index.tpl.html",
    "<h2>Vyatta vRouter 5600 EMS</h2>\n" +
    "<h3>Tunnel Builder</h3>\n" +
    "<div id=\"alerts\">\n" +
    "  <alert class=\"{{alertStatus.type}}\" ng-show=\"alertStatus.isWorking\" type=\"alertStatus.type\" close=\"closeAlert()\"><i class=\"{{alertStatus.icon}}\"></i>\n" +
    "    <b>{{alertStatus.text}}</b>\n" +
    "  </alert>\n" +
    "</div>\n" +
    "<div>\n" +
    "  <form role=\"form\" name=\"vyattaemsForm\">\n" +
    "    <div class=\"row\">\n" +
    "      <div class=\"col-md-2 form-group\">\n" +
    "        <label id=\"lbl-netconfDeviceName\" for=\"netconfDeviceName\" tooltip=\"Enter a name for this device (only alphanumeric, hyphen and underscore allowed)\">Device Name</label><br>\n" +
    "        <input id=\"netconfDeviceName\" class=\"form-control\" ng-model=\"netconfDeviceName\" placeholder=\"Enter a name for this device\" ng-pattern=\"/^[a-zA-Z0-9\\-\\_]*$/\" required/>\n" +
    "      </div>\n" +
    "      <div class=\"col-md-2 form-group\">\n" +
    "        <label id=\"lbl-netconfIpAddress\" for=\"netconfIpAddress\" tooltip=\"Enter a valid Netconf IP Address / Hostname of this device\">Netconf IP / Hostname</label><br>\n" +
    "        <input id=\"netconfIpAddress\" class=\"form-control\" ng-model=\"netconfIpAddress\" placeholder=\"Enter IP Address or Hostname\" ng-pattern=\"/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(?=.*?[a-z])(?!\\.)[a-z\\d.-]*[a-z\\d]$/\" required/>\n" +
    "      </div>\n" +
    "      <div class=\"col-md-2 form-group\">\n" +
    "        <label id=\"lbl-netconfPort\" for=\"netconfPort\" tooltip=\"Enter a valid Netconf Port that the device listens to\">Netconf Port</label><br>\n" +
    "        <input id=\"netconfPort\" class=\"form-control\" ng-model=\"netconfPort\" placeholder=\"Enter Port\" ng-pattern=\"/^\\d{1,5}$/\" required/>\n" +
    "      </div>\n" +
    "      <div class=\"col-md-2 form-group\">\n" +
    "        <label id=\"lbl-userName\" for=\"userName\" tooltip=\"Enter the user name to connect to the Netconf device\">User</label><br>\n" +
    "        <input id=\"userName\" class=\"form-control\" ng-model=\"userName\" placeholder=\"Enter User ID\" required/>\n" +
    "      </div>\n" +
    "      <div class=\"col-md-2 form-group\">\n" +
    "        <label id=\"lbl-password\" for=\"password\" tooltip=\"Enter the password to connect to the Netconf device\">Password</label><br>\n" +
    "        <input id=\"password\" class=\"form-control\" ng-model=\"password\" placeholder=\"Enter Password\" type=\"password\" required/>\n" +
    "      </div>\n" +
    "      <div class=\"col-md-2 form-group\">\n" +
    "        <label id=\"lbl-mountDevice\" for=\"mountDevice\">&nbsp;</label><br>\n" +
    "        <button-submit name=\"mountDevice\" class=\"btn-primary\" form=\"vyattaemsForm\" function=\"submit\" label=\"Mount Device\" glyph=\"plus\"></button-submit>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "  <hr/>\n" +
    "\n" +
    "  <div ng-if=\"vyattaInterfacesMapLength > 0\">\n" +
    "    <div id=\"mountedDevices\" class=\"container-fluid\">\n" +
    "      <h4>Mounted Devices</h4>\n" +
    "\n" +
    "      <div class=\"btn-group\">\n" +
    "        <label id=\"addIPv6Tunnel\" class=\"btn btn-default\" ng-model=\"tunnelOptions.ipv6\" btn-checkbox btn-checkbox-true=\"true\" btn-checkbox-false=\"false\" tooltip=\"Toggle for IPv4 or IPv6 Tunnel\"><i class=\"icon-resize-full\">&nbsp;&nbsp;Add IPv6 Tunnel</i></label>\n" +
    "      </div>\n" +
    "      <div class=\"btn-group\">\n" +
    "        <button name=\"createTunnel\" class=\"btn btn-primary btn-orange\" ng-click=\"createTunnel()\" tooltip=\"Select any two routers to create a tunnel\" ng-disabled=\"connectors.length != 2\">\n" +
    "          <i class=\"icon-random\"></i>&nbsp;Create Tunnel\n" +
    "        </button>\n" +
    "      </div>\n" +
    "      <div class=\"btn-group\">\n" +
    "      <button class=\"btn btn-primary btn-orange\" name=\"deleteTunnel\" ng-click=\"deleteTunnel()\" tooltip=\"Select any two routers to delete an existing tunnel\"  ng-disabled=\"connectors.length != 2\">\n" +
    "      <i class=\"icon-remove\"></i>&nbsp;Delete Tunnel\n" +
    "      </button>\n" +
    "      </div>\n" +
    "      <div class=\"btn-group\">\n" +
    "        <button name=\"refresh\" class=\"btn btn-primary btn-orange\" ng-click=\"refresh()  \"><i class=\"icon-refresh\"></i>&nbsp;Refresh</button>\n" +
    "      </div>\n" +
    "\n" +
    "      <div id=\"hint\">\n" +
    "        <br>\n" +
    "        <small ng-show=\"connectors.length == 0\">\n" +
    "          <span id=\"hint-text-1\"><strong>Hint:</strong>&nbsp;Select any two routers to create a secure VPN Tunnel between them</span>\n" +
    "        </small>\n" +
    "        <small ng-show=\"connectors.length == 1\">\n" +
    "          <span id=\"hint-text-1\"><strong>Hint:</strong>&nbsp;Select another router to create a secure VPN Tunnel to <strong>{{connectors.join('')}}</strong></span>\n" +
    "        </small>\n" +
    "        <small ng-show=\"connectors.length == 2\">\n" +
    "          <strong>Hint:</strong>&nbsp;Click on Create Tunnel button to create an\n" +
    "          <span id=\"hint-text-1\"><strong><span ng-show=\"tunnelOptions.ipv6\">IPv6 VPN Tunnel</span><span ng-show=\"!tunnelOptions.ipv6\">IPv4 VPN Tunnel</span></strong></span>\n" +
    "          between <strong>{{connectors.join(' and ')}}</strong>\n" +
    "        </small>\n" +
    "      </div>\n" +
    "\n" +
    "      <br/>\n" +
    "      <table class=\"table footable\">\n" +
    "        <thead>\n" +
    "        <tr>\n" +
    "          <th width=\"40%\">Device Name</th>\n" +
    "          <th width=\"60%\">Vyatta Interfaces</th>\n" +
    "        </tr>\n" +
    "        </thead>\n" +
    "        <tbody>\n" +
    "        <tr ng-repeat=\"(routerName, viData) in vyattaInterfacesMap\">\n" +
    "          <td>\n" +
    "            <div class=\"row\">\n" +
    "              <div class=\"col-xs-6\">\n" +
    "                <label id=\"lbl-{{routerName}}\">\n" +
    "                  <input id=\"chk-{{routerName}}\" type=\"checkbox\" value=\"{{routerName}}\" ng-model=\"connectors\" ng-true-value=\"routerName\" ng-click=\"toggleSelection(routerName)\"/>\n" +
    "                  {{routerName}} [{{viData['local-ip']}}]\n" +
    "                </label>\n" +
    "              </div>\n" +
    "              <div name=\"{{routerName}}\">\n" +
    "                <i id=\"btn-unmount-{{routerName}}\"  class=\"icon icon-fixedwidth icon-remove-sign hand-pointer smallButton\" ng-click=\"unmountDevice(routerName)\" tooltip=\"Unmount Device\"></i>\n" +
    "                <a id=\"lnkapi-{{routerName}}\" href=\"{{controllerUrl}}/apidoc/explorer/index.html\" target=\"_blank\" style=\"text-decoration:none\"><i class=\"icon icon-fixedwidth icon-code hand-pointer smallButton\" style=\"color: black\" tooltip=\"Show API (Advanced users only)\"></i></a>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "          </td>\n" +
    "          <td>\n" +
    "            <div ng-repeat=\"(viKey, viList) in viData\">\n" +
    "              <div ng-repeat=\"viItem in viList track by $index\">\n" +
    "                <span name=\"{{viItem['tagnode']}}\">\n" +
    "                  {{[viItem['tagnode'],viItem['address'].join(','),viItem['description']].join(' ')}}\n" +
    "                </span>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "          </td>\n" +
    "        </tr>\n" +
    "        </tbody>\n" +
    "        <tfoot class=\"hide-if-no-paging\">\n" +
    "        <tr>\n" +
    "          <td colspan=\"2\">\n" +
    "            <div class=\"pagination pagination-centered\"></div>\n" +
    "          </td>\n" +
    "        </tr>\n" +
    "        </tfoot>\n" +
    "      </table>\n" +
    "    </div>\n" +
    "\n" +
    "    <div id=\"vyattaEmsGraph\" class=\"container-fluid\">\n" +
    "      <div class=\"row\">\n" +
    "        <div class=\"col-xs-11\">\n" +
    "          <vyatta-netconf-tunnel-builder vyatta-interfaces-map=\"vyattaInterfacesMap\"></vyatta-netconf-tunnel-builder>\n" +
    "        </div>\n" +
    "        <div class=\"col-xs-1 collapseGutter\">\n" +
    "          <div id=\"legend\" class=\"vyattaems-legend-area\">\n" +
    "            <div class=\"legendTitle\">Legend</div>\n" +
    "            <div id=\"vyatta-legend-icons\">\n" +
    "              <vyatta-netconf-legend></vyatta-netconf-legend>\n" +
    "            </div>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <br/>\n" +
    "</div>");
}]);
