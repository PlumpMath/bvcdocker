angular.module('templates-bvc-paths', ['paths/create.tpl.html', 'paths/index.tpl.html', 'paths/root.tpl.html']);

angular.module("paths/create.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("paths/create.tpl.html",
    "<form role=\"form\" name=\"createForm\">\n" +
    "  <div class=\"form-group\">\n" +
    "    <label for=\"sourceAddress\">Source Address</label>\n" +
    "    <input type=\"text\" class=\"form-control input-sm control-label\" ng-model=\"data.sourceAddress\" id=\"sourceAddress\" placeholder=\"Source address\" required>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"form-group\">\n" +
    "    <label for=\"destinationAddress\">Destination Address</label>\n" +
    "    <input type=\"text\" class=\"form-control input-sm control-label\" ng-model=\"data.destinationAddress\" id=\"destinationAddress\" placeholder=\"Destination address\" required>\n" +
    "  </div>\n" +
    "\n" +
    "  <button-submit form=\"createForm\" function=\"submit\"></button-submit>\n" +
    "  <button-cancel state=\"paths.index\"></button-cancel>\n" +
    "  <span class=\"error clearfix\">{{ error }}</span>\n" +
    "</form>");
}]);

angular.module("paths/index.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("paths/index.tpl.html",
    "<h2>Path Explorer</h2>\n" +
    "<div>\n" +
    "  <form role=\"form\" name=\"findPathsForm\">\n" +
    "    <div class=\"row\">\n" +
    "      <div class=\"col-md-2 form-group\">\n" +
    "        <label for=\"sourceAddress\" tooltip=\"Enter a Source IP Address/Host name\">Source Address</label><br>\n" +
    "        <input id=\"sourceAddress\" class=\"form-control\" ng-model=\"sourceAddress\" placeholder=\"Enter source IP Address\"  ng-pattern=\"/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(?=.*?[a-z])(?!\\.)[a-z\\d.-]*[a-z\\d]$/\" required/>\n" +
    "      </div>\n" +
    "      <div class=\"col-md-2 form-group\">\n" +
    "        <label for=\"destinationAddress\" tooltip=\"Enter a Destination IP Address/Host name\">Dest. Address</label><br>\n" +
    "        <input id=\"destinationAddress\" class=\"form-control\" ng-model=\"destinationAddress\" placeholder=\"Enter destination IP Address\"  ng-pattern=\"/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(?=.*?[a-z])(?!\\.)[a-z\\d.-]*[a-z\\d]$/\" required/>\n" +
    "      </div>\n" +
    "      <div class=\"col-md-4 form-group\">\n" +
    "        <label for=\"waypoints\">Waypoints</label><br>\n" +
    "        <input id=\"waypoints\" class=\"form-control\" ng-model=\"waypoints\" ng-list placeholder=\"Enter waypoints separated by commas\"/>\n" +
    "      </div>\n" +
    "      <div class=\"col-md-2 form-group\">\n" +
    "        <label for=\"waypoints\" tooltip=\"Enter one or more waypoints separated by commas\">&nbsp;</label><br>\n" +
    "        <button-submit name=\"addPath\" class=\"btn-primary\" form=\"findPathsForm\" function=\"submit\" label=\"Add Path\" glyph=\"plus\"></button-submit>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "  <hr/>\n" +
    "\n" +
    "  <div>\n" +
    "    <h4>Installed Paths</h4>\n" +
    "\n" +
    "    <div id=\"notes\">\n" +
    "      <div>\n" +
    "        <small>To highlight a path in the graph, click on the <i class=\"icon icon-fixedwidth icon-lightbulb\"></i> light-bulb icon next to the path.</small>\n" +
    "      </div>\n" +
    "      <div>\n" +
    "        <small>To unhighlight a path in the graph, click on the <i class=\"icon icon-fixedwidth icon-power-off\"></i> power-off icon.</small>\n" +
    "      </div>\n" +
    "      <div>\n" +
    "        <small>To delete a path from the system, click on the <i class=\"icon icon-fixedwidth icon-remove-sign\"></i> delete icon.</small>\n" +
    "      </div>\n" +
    "      <div>\n" +
    "        <small>To set a new waypoint for system calculated path, click on the set waypoint link and enter a new waypoint.</small>\n" +
    "      </div>\n" +
    "      <div>\n" +
    "        <small>To change the waypoint, click on the waypoint and enter a new waypoint.</small>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    <table class=\"footable table\" data-page-size=\"25\">\n" +
    "      <thead>\n" +
    "      <tr>\n" +
    "        <th>Source -> Dest&nbsp;\n" +
    "          <i class=\"icon-refresh hand-pointer\" ng-click=\"refresh()\"></i>&nbsp;\n" +
    "        </th>\n" +
    "        <th>WayPoints</th>\n" +
    "        <th>Hops</th>\n" +
    "      </tr>\n" +
    "      </thead>\n" +
    "      <tbody>\n" +
    "      <tr ng-hide=\"pathData.length\">\n" +
    "        <td colspan=\"3\" class=\"centerAlign\">No Paths Found</td>\n" +
    "      </tr>\n" +
    "      <tr ng-repeat=\"item in pathData\" ng-class=\"{ 'background-color': selectedRowHiliteColor() }\">\n" +
    "        <td id=\"td-{{item['source-addr']}}-{{item['destination-addr']}}\" ng-click=\"selectPath(item['source-addr'] + '-' + item['destination-addr'])\">\n" +
    "          <div>\n" +
    "            <div id=\"path-{{item['source-addr']}}-{{item['destination-addr']}}\" class=\"pull-left space-right-1em\"><strong>{{item['source-addr']}}&nbsp;&rarr;&nbsp;{{item['destination-addr']}}</strong></div>\n" +
    "            <div class=\"pull-left\">\n" +
    "              <i id=\"hp-{{item['source-addr']}}-{{item['destination-addr']}}\" class=\"icon icon-fixedwidth icon-lightbulb hand-pointer smallButton\" ng-click=\"hilitePath(item)\" tooltip=\"Highlight Path in graph\"></i>&nbsp;\n" +
    "              <i id=\"uhp-{{item['source-addr']}}-{{item['destination-addr']}}\" class=\"icon icon-fixedwidth icon-power-off hand-pointer smallButton\" ng-click=\"unhilitePath(item)\" tooltip=\"Unhighlight Path in graph\"></i>&nbsp;\n" +
    "              <i id=\"del-{{item['source-addr']}}-{{item['destination-addr']}}\" class=\"icon icon-fixedwidth icon-remove-sign hand-pointer smallButton\" ng-click=\"deletePath(item)\" tooltip=\"Delete Path\"></i>&nbsp;\n" +
    "            </div>\n" +
    "          </div>\n" +
    "        </td>\n" +
    "        <td>\n" +
    "          <a id=\"wp-{{item['source-addr']}}-{{item['destination-addr']}}\" href=\"#\" editable-text=\"item.waypoints\"  onbeforesave=\"updatePath(item, $data)\">\n" +
    "            <div ng-repeat=\"waypoint in item['waypoints']\">{{waypoint}}</div>\n" +
    "            <div ng-hide=\"item['waypoints'].length\">set waypoint</div>\n" +
    "          </a>\n" +
    "        </td>\n" +
    "        <td>\n" +
    "          <div id=\"hop-{{item['source-addr']}}-{{item['destination-addr']}}\">\n" +
    "            <div id=\"hop-{{item['source-addr']}}-{{item['destination-addr']}}-{{$index}}\" ng-repeat=\"hop in item['hopsGrouped']\">{{hop[0]}}&nbsp;&rarr;&nbsp;{{hop[1]}}</div>\n" +
    "          </div>\n" +
    "        </td>\n" +
    "      </tr>\n" +
    "      </tbody>\n" +
    "      <tfoot class=\"hide-if-no-paging\">\n" +
    "      <tr>\n" +
    "        <td colspan=\"3\">\n" +
    "          <div class=\"pagination pagination-centered\"></div>\n" +
    "        </td>\n" +
    "      </tr>\n" +
    "      </tfoot>\n" +
    "    </table>\n" +
    "  </div>\n" +
    "\n" +
    "  <div id=\"graphOptions\">\n" +
    "\n" +
    "    <div class=\"btn-group\">\n" +
    "      <label class=\"btn btn-default\" ng-model=\"topologyOptions.smoothCurves\" btn-checkbox btn-checkbox-true=\"false\" btn-checkbox-false=\"true\" tooltip=\"Toggle Links\"><i class=\"icon-resize-full\">&nbsp;&nbsp;Bi-directional Links</i></label>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"btn-group\">\n" +
    "      <label class=\"btn btn-default\" ng-model=\"topologyOptions.physics.barnesHut.springLength\" btn-radio=\"150\" tooltip=\"Show nodes closer\">Closer</label>\n" +
    "      <label class=\"btn btn-default\" ng-model=\"topologyOptions.physics.barnesHut.springLength\" btn-radio=\"250\" tooltip=\"Show nodes in normal mode\">Default</label>\n" +
    "      <label class=\"btn btn-default\" ng-model=\"topologyOptions.physics.barnesHut.springLength\" btn-radio=\"330\" tooltip=\"Show nodes farther apart\">Relaxed</label>\n" +
    "    </div>\n" +
    "\n" +
    "    <!--<div class=\"btn-group\">-->\n" +
    "      <!--<label class=\"btn btn-default\" ng-model=\"topologyOptions.dataManipulation\" btn-checkbox>Allow Edits</label>-->\n" +
    "    <!--</div>-->\n" +
    "  </div>\n" +
    "  <p></p>\n" +
    "\n" +
    "  <div class=\"pathsGraph col-md-12\">\n" +
    "    <paths-simple topology-data=\"topologyData\" topology-options=\"topologyOptions\" selected-node=\"selectedNode\" selected-edge=\"selectedEdge\"></paths-simple>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("paths/root.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("paths/root.tpl.html",
    "<h2>\n" +
    "Path Explorer\n" +
    "</h2>\n" +
    "<!--<div class=\"menu\">-->\n" +
    "  <!--<ul class=\"nav nav-pills\">-->\n" +
    "    <!--<li ng-class=\"{ active: isState('main.paths.index') }\"><a href=\"index.html#/paths/index\">Home</a></li>-->\n" +
    "  <!--</ul>-->\n" +
    "\n" +
    "  <!--<div ui-view=\"submenu\"></div>-->\n" +
    "<!--</div>-->\n" +
    "<br/>\n" +
    "<div class=\"main\" ui-view></div>\n" +
    "");
}]);
