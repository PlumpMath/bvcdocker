define(['angularAMD', 'app/routingConfig', 'app/core/core.services', 'Restangular', 'ui-bootstrap', 'xeditable'], function(ng) {

  var vyattaems = angular.module('bvc.vyattaems', ['app.core', 'ui.router.state', 'restangular', 'ui.bootstrap', 'xeditable' ]);

  vyattaems.config(['$stateProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$translateProvider', 'NavHelperProvider', function ($stateProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $translateProvider, NavHelperProvider) {

    console.log("==> vyattaems.module");

    vyattaems.register = {
      controller : $controllerProvider.register,
      directive: $compileProvider.directive,
      service : $provide.service,
      factory : $provide.factory
    };

    $translateProvider.useStaticFilesLoader({
      prefix: 'assets/data/locale-',
      suffix: '.json'
    });

    NavHelperProvider.addControllerUrl('app/vyattaems/vyattaems.controller');
    NavHelperProvider.addToMenu('vyattaems', {
      "link": "#/vyattaems",
      "title": "Vyatta vRouter 5600 EMS",
      "active": "main.vyattaems",
      "icon": "icon-code-fork",
      "page": {
        "title": "Vyatta EMS",
        "description": "Vyatta EMS"
      }
    });

    var access = routingConfig.accessLevels;
    $stateProvider.state('main.vyattaems', {
      url: 'vyattaems',
      views : {
        'content' : {
          templateUrl: 'src/app/vyattaems/index.tpl.html',
          controller: 'VyattaEmsCtrl'
        }
      }
    });
  }]);

  console.log("<== vyattaems.module");

  return vyattaems;
});
