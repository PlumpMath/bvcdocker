define(['angularAMD', 'app/routingConfig', 'app/core/core.services', 'Restangular', 'ui-bootstrap', 'xeditable'], function(ng) {

  var paths = angular.module('bvc.paths', ['app.core', 'ui.router.state', 'restangular', 'ui.bootstrap', 'xeditable' ]);

  paths.config(['$stateProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$translateProvider', 'NavHelperProvider', function ($stateProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $translateProvider, NavHelperProvider) {

    console.log("==> paths.module");

    paths.register = {
      controller : $controllerProvider.register,
      directive: $compileProvider.directive,
      service : $provide.service,
      factory : $provide.factory,
      filter: $filterProvider.register
    };

    $translateProvider.useStaticFilesLoader({
      prefix: 'assets/data/locale-',
      suffix: '.json'
    });

    NavHelperProvider.addControllerUrl('app/paths/paths.controller');
    NavHelperProvider.addToMenu('paths', {
      "link": "#/paths",
      "active": "main.paths",
      "title": "Path Explorer",
      "icon": "icon-mail-forward",
      "page": {
        "title": "PATHS",
        "description": "PATHS"
      }
    });

    var access = routingConfig.accessLevels;
    $stateProvider.state('main.paths', {
      url: 'paths',
      views : {
        'content' : {
          templateUrl: 'src/app/paths/index.tpl.html',
          controller: 'PathsCtrl'
        }
      }
    });

//    $stateProvider.state('main.paths.index', {
//      url: '/index',
//      access: access.public,
//      views: {
//        '': {
//          templateUrl: 'src/app/paths/index.tpl.html',
//          controller: 'PathsCtrl'
//        }
//      }
//    });

  }]);

  console.log("<== paths.module");

  return paths;
});
