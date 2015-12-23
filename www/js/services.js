angular.module('teva.services', [])

.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },

    getObject: function(key) {
      if ($window.localStorage.getItem([key] || '{}')) {
        return JSON.parse($window.localStorage[key] || '{}');
      } else {
        return null;
      }
    }
  }
}])

.factory('$Login', ['$localstorage', '$ionicHistory', '$location', '$rootScope', function($localstorage, $rootScope, $location, $ionicHistory) {
  return {
    logar: function(usuario) {
      //salvando no banco

      $localstorage.setObject('login', usuario);
      loginDb = $localstorage.getObject('login');
    },
    deslogar: function(usuario) {
      $localstorage.set('login', null);
      $localstorage.set('BancoDeDados', null);
      $rootScope.BancoDeDadosConteudo = null;
    },
    check: function() {
      var loginbanco = $localstorage.getObject('login');
      if (loginbanco) {
        $rootScope.usuario = loginbanco;
        console.log('existe usuario no banco');
        return true;
      } else {
        console.log('NAO existe usuario no banco');
        return false;
      }

      return true;
    },
    proibido: function() {
      if (!$localstorage.get('login')) {
        console.log('NAO esta logado');
        $ionicHistory.nextViewOptions({
          disableAnimate: true,
          disableBack: true
        });
        $location.path("#/teva/login");
      }
    }
  }
  return null;
}])

.factory('MonitorInternet', function($rootScope) {

  return {
    monitorar: function() {
      if (!navigator.onLine) {
        $rootScope.alerta = true;
        $rootScope.msg = "Você está offline";
        console.log("Inicio offline");
      }

      window.addEventListener("online", function(e) {
        $rootScope.alerta = false;
        console.log("ficou online");
      }, true);

      window.addEventListener("offline", function(e) {
        $rootScope.msg = "Você está offline";
        $rootScope.alerta = true;
        console.log("ficou offline");

      }, true);

    },
    estaOnline: function() {
      if (navigator.onLine) {
        return true;
      } else {
        return false;
      }

    }
  }
})

.factory('DataFiltering', [function() {
  return {
    GetDistinct: function(Model, Property, ValueManipulationFunction) {
      if (!ValueManipulationFunction) {
        ValueManipulationFunction = function(Value) {
          return Value;
        }
      }
      var DistinctValues = [];
      for (aux = 0; aux < Model.length; aux++) {
        var HasDistinctValue = false;
        for (aux2 = 0; aux2 < DistinctValues.length; aux2++) {
          if (DistinctValues[aux2] == ValueManipulationFunction(Model[aux][Property])) {
            HasDistinctValue = true;
          }
        }
        if (!HasDistinctValue) {
          DistinctValues.push(ValueManipulationFunction(Model[aux][Property]));
        }
      }
      return DistinctValues;
    }
  };
}])

.factory('PalestrasFactory', [function() {
  return {
    GetPalestrasDoPalestrante: function(id_palestrante, TodasAsPalestras) {
      var PalestrasDoPalestrante = [];
      for (aux = 0; aux < TodasAsPalestras.length; aux++) {
        console.log('aux:' + aux);
        if (TodasAsPalestras[aux].palestrantes) {
          for (auxPalestrantes = 0; auxPalestrantes < TodasAsPalestras[aux].palestrantes.length; auxPalestrantes++) {
            console.log('auxPalestrantes:' + auxPalestrantes);
            if (TodasAsPalestras[aux].palestrantes[auxPalestrantes].id_palestrante == id_palestrante) {
              PalestrasDoPalestrante.push(TodasAsPalestras[aux]);
            }
          }
        }
      }
      return PalestrasDoPalestrante;
    }

  };
}])

.factory('$JsonFactory', ['$http', '$q', 'config', function($http, $q, config) {
  var data = null;
  return {
    all: function(email) {
      var deferred = $q.defer();
      console.log('$JsonFactory.all: email = ' + email)
      var promise;
      loginParameter = '';
      if (email)
        loginParameter = '/?email=' + email;
      //'http://www.qualitydigital.com.br/Teva2016/api/Values?email=EMAILDOPALESTRANTE'
      promise = $http.get(config.apiUrl + '/Values' + loginParameter)
        .then(
          function(response) {
            deferred.resolve(response)
          },
          function(errors) {
            deferred.reject(errors);
          },
          function(updates) {
            deferred.update(updates);
          });
      return deferred.promise;
    },

    post: function(dados, local) {
        var deferred = $q.defer();
        if (local == null) {
          local = config.apiUrl
        } else {
          local = config.apiUrl + local;
        }
        promise = $http.post(local, dados)
          .then(
            function(response) {
              deferred.resolve(response)
            },
            function(errors) {
              deferred.reject(errors);
            },
            function(updates) {
              deferred.update(updates);
            });
        return deferred.promise;
    },

    postParameter: function(local) {
      var promessa;

      if (navigator.onLine) {
        var PostURL = config.apiUrl + local;
        console.log(PostURL);
        var promessa = $http.post(PostURL)
          .then(function(resposta) {
            return resposta;
          });
      } else {
        var deferred = $q.defer();
        promise = deferred.promessa;
      }
      return promessa;
    }
  };
}])

.factory('localFactory', ['$q', '$window', function($q, $window) {

  'use strict';

  function getCurrentPosition() {
    var deferred = $q.defer();

    if (!$window.navigator.geolocation) {
      deferred.reject('Geo localização não suportada.');
      return;
    }

    $window.navigator.geolocation.getCurrentPosition(
      function(position) {
        deferred.resolve(position);
      },
      function(err) {
        deferred.reject(err);
      });

    return deferred.promise;
  }

  return {
    getCurrentPosition: getCurrentPosition
  };
}]);
