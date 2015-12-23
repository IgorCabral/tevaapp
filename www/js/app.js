// Ionic Starter teva

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('teva', ['ionic', 'teva.config', 'teva.services', 'teva.directives', 'teva.controllers', 'monospaced.elastic'])

.run(function($ionicPlatform, $ionicLoading, $http, $JsonFactory, $Login,
  $interval, $ionicPopup, $rootScope, MonitorInternet, $localstorage, $state, config) {

  $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });

  MonitorInternet.monitorar();

  $rootScope.AtualizarBancoDeDados = function(DatabaseIsReady) {
      console.log("$rootScope.AtualizarBancoDeDados() " + new Date());

      //Verificar se o usuário está logado
      var dadosLogin = $localstorage.getObject('login');
      var email = undefined;
      if (dadosLogin)
        email = dadosLogin.email;
      //Pegando o Json do Banco de Dados
      $JsonFactory.all(email)
        .then(function(response) {
            $rootScope.BancoDeDadosConteudo = response.data[0];
            $localstorage.setObject('BancoDeDados', $rootScope.BancoDeDadosConteudo);
            console.log("$rootScope.AtualizarBancoDeDados: atualizado com êxito.");
            if (DatabaseIsReady)
              DatabaseIsReady(true);
          },
          function(error) {
            console.log('$rootScope.AtualizarBancoDeDados: erro ao atualizar.');
            $ionicLoading.hide();
            if (DatabaseIsReady)
              DatabaseIsReady(false);
          });
    }
    //Atualizando o banco de dados
  $interval(function() {
    $rootScope.AtualizarBancoDeDados();
  }, config.intervaloAtualizacao);

})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('teva', {
    url: '/teva',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'TevaCtrl',
    resolve: {
      dataBase: function($JsonFactory, $Login, $ionicLoading, $rootScope, $localstorage, $log, $window) {

        //Verificar se o usuário está logado
        var dadosLogin = $localstorage.getObject('login');
        var email = undefined;
        if (dadosLogin)
          email = dadosLogin.email;

        return $JsonFactory.all(email)
          .then(function(response) {
              $rootScope.BancoDeDadosConteudo = response.data[0];
              $localstorage.setObject('BancoDeDados', $rootScope.BancoDeDadosConteudo);
              console.log("carregou no resolve");
              $ionicLoading.hide();
            },
            function(error) {
              $rootScope.BancoDeDadosConteudo = $localstorage.getObject('BancoDeDados', $rootScope.BancoDeDadosConteudo);
              if (!$rootScope.BancoDeDadosConteudo) {
                $window.alert('Erro ao atualizar o banco de dados, Por favor conecte-se à internet');
                navigator.app.exitApp();
              }
              $log.error('Erro ao se conectar ao banco de dados', error);
              $ionicLoading.hide();
            });

      }
    }
  })

  .state('teva.login', {
    url: '/login',
    views: {
      'menuContent': {
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      }
    }
  })


  .state('teva.trocarSenha', {
    url: '/trocarsenha',
    views: {
      'menuContent': {
        templateUrl: 'templates/trocarsenha.html',
        controller: 'trocarSenha'
      }
    }
  })

  .state('teva.logout', {
    url: '/logout',
    views: {
      'menuContent': {
        templateUrl: 'templates/logout.html',
        controller: 'LogoutCtrl'
      }
    }
  })

  .state('teva.home', {
    url: '/home',
    views: {
      'menuContent': {
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl',
        resolve: {
          logado: function($Login, $window, $ionicHistory, $location) {
            if ($Login.check()) {
              console.log('esta logado');
            } else {
              console.log('NAO esta logado');
              $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
              });
              $location.path("teva/login");
            }
          }
        }
      }
    }
  })

  .state('teva.agenda', {
    url: '/agenda',
    views: {
      'menuContent': {
        templateUrl: 'templates/agenda.html',
        controller: 'AgendaCtrl',
        resolve: {
          logado: function($Login, $window, $ionicHistory, $location) {
            if ($Login.check()) {} else {
              $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
              });
              $location.path("teva/login");
            }
          }
        }
      }
    }
  })

  .state('teva.AgendaPalestras', {
    url: '/AgendaPalestras/:id_agenda',
    views: {
      'menuContent': {
        templateUrl: 'templates/agendaPalestra.html',
        controller: 'AgendaPalestrasCtrl'
      }
    },
    resolve: {
      logado: function($Login, $window, $ionicHistory, $location) {
        if ($Login.check()) {
          console.log('esta logado');
        } else {
          console.log('NAO esta logado');
          $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
          });
          $location.path("teva/login");
        }
      }
    }
  })

  .state('teva.palestra', {
    url: '/palestra/:id_palestra',
    views: {
      'menuContent': {
        templateUrl: 'templates/palestra.html',
        controller: 'PalestraCtrl'
      }
    },

  })


  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  .state('teva.grupospalestrantes', {
    url: '/grupospalestrantes',
    views: {
      'menuContent': {
        templateUrl: 'templates/grupos_palestrantes.html',
        controller: 'GruposPalestrantesCtrl'
      }
    },
    resolve: {
      logado: function($Login, $window, $ionicHistory, $location) {
        if ($Login.check()) {
          console.log('esta logado');
        } else {
          console.log('NAO esta logado');
          $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
          });
          $location.path("teva/login");
        }
      }
    }
  })

  .state('teva.palestrantes', {
    url: '/palestrantes/:id_grupo_palestrantes',
    views: {
      'menuContent': {
        templateUrl: 'templates/palestrantes.html',
        controller: 'PalestrantesCtrl'
      }
    },
    resolve: {
      logado: function($Login, $window, $ionicHistory, $location) {
        if ($Login.check()) {
          console.log('esta logado');
        } else {
          console.log('NAO esta logado');
          $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
          });
          $location.path("teva/login");
        }
      }
    }
  })

  .state('teva.perfilpalestrante', {
    url: '/perfilpalestrante/:id_palestrante',
    views: {
      'menuContent': {
        templateUrl: 'templates/perfilpalestrante.html',
        controller: 'PerfilPalestranteCtrl'
      }
    },
    resolve: {
      logado: function($Login, $window, $ionicHistory, $location) {
        if ($Login.check()) {
          console.log('esta logado');
        } else {
          console.log('NAO esta logado');
          $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
          });
          $location.path("teva/login");
        }
      }
    }
  })

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  .state('teva.gruposparticipantes', {
    url: '/gruposparticipantes',
    views: {
      'menuContent': {
        templateUrl: 'templates/grupos_participantes.html',
        controller: 'GruposParticipantesCtrl'
      }
    },
    resolve: {
      logado: function($Login, $window, $ionicHistory, $location) {
        if ($Login.check()) {
          console.log('esta logado');
        } else {
          console.log('NAO esta logado');
          $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
          });
          $location.path("teva/login");
        }
      }
    }
  })

  .state('teva.participantes', {
    url: '/participantes/:id_grupo_participantes',
    views: {
      'menuContent': {
        templateUrl: 'templates/participantes.html',
        controller: 'ParticipantesCtrl'
      }
    },
    resolve: {
      logado: function($Login, $window, $ionicHistory, $location) {
        if ($Login.check()) {
          console.log('esta logado');
        } else {
          console.log('NAO esta logado');
          $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
          });
          $location.path("teva/login");
        }
      }
    }
  })


  .state('teva.perfilParticipante', {
    url: '/perfilparticipante/:id_participante',
    views: {
      'menuContent': {
        templateUrl: 'templates/perfilparticipante.html',
        controller: 'PerfilParticipanteCtrl'
      }
    },
    resolve: {
      logado: function($Login, $window, $ionicHistory, $location) {
        if ($Login.check()) {
          console.log('esta logado');
        } else {
          console.log('NAO esta logado');
          $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
          });
          $location.path("teva/login");
        }
      }
    }
  })

  /////////////////////////////////////////////////////////////////////////////////////////

  .state('teva.interativo', {
    url: '/interativo',
    views: {
      'menuContent': {
        templateUrl: 'templates/interativo.html',
        controller: 'InterativoCtrl'
      }
    },
    resolve: {
      logado: function($Login, $window, $ionicHistory, $location) {
        if ($Login.check()) {
          console.log('esta logado');
        } else {
          console.log('NAO esta logado');
          $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
          });
          $location.path("teva/login");
        }
      }
    }
  })

  /////////////////////////////////////////////////////////////////////////////////////////
  .state('teva.quiz', {
    url: '/quiz',
    views: {
      'menuContent': {
        templateUrl: 'templates/quiz.html',
        controller: 'QuizCtrl'
      }
    },
    resolve: {
      logado: function($Login, $window, $ionicHistory, $location) {
        if ($Login.check()) {
          console.log('esta logado');
        } else {
          console.log('NAO esta logado');
          $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
          });
          $location.path("teva/login");
        }
      }
    }
  })

  /////////////////////////////////////////////////////////////////////////////////////

  .state('teva.mapa', {
    url: '/mapa',
    views: {
      'menuContent': {
        templateUrl: 'templates/mapa.html',
        controller: 'MapaCtrl'
      }
    },
    resolve: {
      logado: function($Login, $window, $ionicHistory, $location) {
        if ($Login.check()) {
          console.log('esta logado');
        } else {
          console.log('NAO esta logado');
          $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
          });
          $location.path("teva/login");
        }
      }
    }
  })


  .state('teva.noticias', {
    url: '/noticias',
    views: {
      'menuContent': {
        templateUrl: 'templates/noticias.html',
        controller: 'NoticiasCtrl'
      }
    },
    resolve: {
      logado: function($Login, $window, $ionicHistory, $location) {
        if ($Login.check()) {
          console.log('esta logado');
        } else {
          console.log('NAO esta logado');
          $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
          });
          $location.path("teva/login");
        }
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('teva/home');
});
