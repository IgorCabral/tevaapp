angular.module('teva.controllers', [])

.controller('TevaCtrl', function($scope, $Login, $localstorage, $rootScope,
  $ionicModal, $timeout, $ionicPopup, $window, dataBase, $interval) {

  // POPUP INSTALAR APLICATIVO
  if (!window.navigator.standalone && ionic.Platform.isIOS()) {
    var myPopup = $ionicPopup.show({
      template: "<img alt='' class='destaque-img' src='img/homescreen.jpg'/>",
      title: 'Instale o aplicativo',
      subTitle: 'basta adicionar à tela de início',
      scope: $scope,
      buttons: [{
        text: 'Ok',
        type: 'button-assertive',
      }]
    });
  }

  if (window.navigator.standalone) {
    document.body.classList.add("padding-top-20");
  }

  //Função para atualizar o usuario logado
  AtualizarUsuarioLogado = function() {
    var usuario = $localstorage.getObject('login');

    if (usuario) {
      $scope.participante = usuario;
    }
  }

  //Executa uma vez
  AtualizarUsuarioLogado();

  //Atualizar o nome do usuario (previne caso esteja indisponível o banco antes)
  $interval(function() {
    AtualizarUsuarioLogado();
  }, 30000);

})


.controller('LoginCtrl', function($scope, $rootScope, $ionicSideMenuDelegate,
  $filter, $Login, $window, $state, $ionicHistory) {
  // Desabilitando o menu
  $ionicSideMenuDelegate.canDragContent(false);
  // definindo objeto do escopo
  $scope.usuario = [];
  //Só pode deixar logar se o banco de dados já existiver sido baixado
  $scope.PodeLogar = false;
  if (!$rootScope.BancoDeDadosConteudo) {
    $rootScope.AtualizarBancoDeDados(function(IsDatabaseAvaible) {
      console.log('IsDatabaseAvaible' + IsDatabaseAvaible);
      $scope.PodeLogar = IsDatabaseAvaible;
    });
  } else {
    $scope.PodeLogar = true;
  }

  participantes = $rootScope.BancoDeDadosConteudo.Participantes
  $scope.Logar = function() {
    //  Verificando se o usuario preencheu o campo
    //  Filtrando o usuario
    usuario = $filter('filter')(participantes, function(d) {
      return d.email == $scope.usuario.email && d.senha == $scope.usuario.senha;
    })[0];
    //  Chamando a factory Login e passando o usuario
    if (usuario) {
      $Login.logar(usuario);
      if (usuario.senha != 'convencaoteva') {
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        $state.go("teva.home");
      } else {
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        $state.go("teva.trocarSenha");
      }
    } else {
      $window.alert('Usuário Inválido');
    }
  };
})

.controller('trocarSenha', function($scope, $filter, $JsonFactory, $localstorage, $state, $Login, $ionicHistory, $location) {
  $scope.salvarSenha = function(senha) {
    var usuario = $localstorage.getObject('login');

    if (senha) {
      local = 'Valores/SalvarNovaSenha?ParticipanteID=' + usuario.id_participante + '&NovaSenha=' + senha;
      $JsonFactory.postParameter(local).then(function(response) {
        alert('Senha atualizada com sucesso');
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        $state.go("teva.home");
      }, function(error) {
        console.log('Erro ao atualizar senha', error);
      });

    } else {
      alert('insira uma senha!');
    }
  }
})


.controller('LogoutCtrl', function($scope, $rootScope, $ionicSideMenuDelegate,
  $filter, $Login, $window, $state, $ionicHistory, $location) {
  console.log('logout');
  $Login.deslogar();
  $state.go("teva.logout");
})

.controller('HomeCtrl', function($scope, $rootScope) {


})

.controller('NoticiasCtrl', function($scope, $rootScope, $interval) {
  $scope.noticia = $rootScope.BancoDeDadosConteudo.Noticias;

  $interval(function() {
    $scope.noticia = $rootScope.BancoDeDadosConteudo.Noticias;
  }, 60000);
})


.controller('AgendaCtrl', function($scope, $rootScope) {
  $scope.Agendas = $rootScope.BancoDeDadosConteudo.Agendas;
  console.log($scope.Agendas);
})

.controller('AgendaPalestrasCtrl', function($scope, $rootScope, $filter, $stateParams, MonitorInternet, DataFiltering) {
  //Dados da view (Palestras da Agenda)
  agenda = $stateParams.id_agenda;
  palestrasDB = $rootScope.BancoDeDadosConteudo.Palestras;
  agendaSelecionada = $filter('filter')(palestrasDB, function(d) {
    return d.agenda.id_agenda == agenda;
  });
  $scope.Palestras = agendaSelecionada;
  $scope.online = MonitorInternet.estaOnline($rootScope);

  //Informações da agenda
  $scope.AgendaInfo = $filter('filter')($rootScope.BancoDeDadosConteudo.Agendas, function(d) {
    return d.id_agenda == agenda;
  })[0];
  console.log($scope.AgendaInfo);
  //Um array com todos os dias da agência (usada para o filtro por data)
  $scope.Datas = DataFiltering.GetDistinct($scope.Palestras, 'inicio', function(value) {
    return value.substring(0, 10);
  });
  console.log($scope.Datas);
})

.controller('PalestraCtrl', function($scope, $JsonFactory, $localstorage, $ionicLoading, $stateParams, $rootScope, $filter, $ionicPopup, $ionicModal) {
    //console.log($scope.palestra);

    $ionicModal.fromTemplateUrl('templates/modalanotacoes.html', {
        scope: $scope
      })
      .then(function(modal) {
        $scope.modal = modal;
      });

    //Palestra
    palestrasDB = $rootScope.BancoDeDadosConteudo.Palestras;
    palestra = $filter('filter')(palestrasDB, function(d) {
      return d.id_palestra == $stateParams.id_palestra;
    })[0];

    $scope.palestra = palestra;
    //console.log($scope.palestra);
    //Palestrantes
    $scope.palestrantes = palestra.palestrantes;
    $scope.btn_anotacoes_txt = "adicionar";

    //Avaliações da palestra
    palestrasAvaliacaoDB = $rootScope.BancoDeDadosConteudo.PalestrasAvaliacao;
    //console.log(palestrasAvaliacaoDB);
    palestraAvaliacao = $filter('filter')(palestrasAvaliacaoDB, function(d) {
      return d.palestra.id_palestra == $stateParams.id_palestra;
    })[0];
    //console.log(palestraAvaliacao);
    //Comentario
    $scope.anotacao = {};
    try {
      $scope.anotacao.texto = palestraAvaliacao.anotacao;
      //console.log(palestraAvaliacao);
      //console.log($scope.comentario.texto);
    } catch (e) {}

    //Comentario
    $scope.comentario = {};

    try {
      $scope.comentario.texto = palestraAvaliacao.comentario;
      //console.log(palestraAvaliacao);
      //console.log($scope.comentario.texto);

    } catch (e) {}

    $scope.nota = -1;

    if (palestraAvaliacao) {
      if (!palestraAvaliacao.anotacao) {
        $scope.btn_anotacoes_txt = "adicionar";
      } else {
        $scope.btn_anotacoes_txt = "visualizar";
      }
      if (palestraAvaliacao.nota) {
        try {
          $scope.nota = palestraAvaliacao.nota;
          console.log('nota: ' + $scope.nota);
        } catch (e) {
          $scope.nota = -1;
        }
        if ($scope.nota == undefined)
          $scope.nota = -1;
      }
    }
    var usuario = $localstorage.getObject('login');

    ///FUNCOES

    $scope.avaliar = function(rating) {
      $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
      });

      var dados = {
        email: usuario.email,
        id_palestra: $scope.palestra.id_palestra,
        nota: rating
      }

      parametros = '/SalvarNotaPalestra';
      //  parametros = '?email=teste@teste.com'
      console.log('Postando avaliação');
      console.log(dados)
      $JsonFactory.post(dados, parametros)
        .then(function(response) {
          //$scope.comentario.texto = '';
          $ionicLoading.hide();
          console.log(dados);
          $rootScope.AtualizarBancoDeDados();
          $ionicPopup.alert({
            title: 'Avaliação',
            template: 'Avaliação da palestra salva com sucesso!'
          });
        })
        .catch(function(response) {
          $ionicLoading.hide();
          $ionicPopup.alert({
            title: 'Atenção',
            template: 'ERRO ao salvar avaliação'
          });
          console.error('ERRO', response);
        });

    };

    $scope.SalvarComentario = function() {
      $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
      });

      if (!comentario) {
        comentario = null;
      }

      var dados = {
        email: usuario.email,
        id_palestra: $scope.palestra.id_palestra,
        comentario: $scope.comentario.texto
      }

      parametros = '/SalvarComentarioPalestra';
      //  parametros = '?email=teste@teste.com'
      console.log('Postando comentário');
      console.log(dados)
      $JsonFactory.post(dados, parametros).then(function(response) {
          //$scope.comentario.texto = '';
          $ionicLoading.hide();
          console.log(dados);
          $ionicPopup.alert({
            title: 'Comentário',
            template: 'Comentário salvo com sucesso!'
          });
          $rootScope.AtualizarBancoDeDados();
        })
        .catch(function(response) {
          $ionicLoading.hide();
          $ionicPopup.alert({
            title: 'Atenção',
            template: 'ERRO ao salvar comentário'
          });
          console.error('ERRO', response);
        });

    }; //$scope.SalvarComentario

    $scope.salvarAnotacao = function() {
      $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
      });
      var dados = {
        email: usuario.email,
        id_palestra: $scope.palestra.id_palestra,
        anotacao: $scope.anotacao.texto
      }

      parametros = '/SalvarAnotacaoPalestra';
      $JsonFactory.post(dados, parametros).then(function(resposta) {
        $ionicLoading.hide();
        console.log(dados)
        $rootScope.AtualizarBancoDeDados();
        $ionicPopup.alert({
          title: '',
          template: 'Anotação salva com sucesso!'
        });
        console.log(resposta);
        $scope.modal.hide();

      }).catch(function(response) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'Atenção',
          template: 'ERRO ao salvar anotação'
        });
        console.error('ERRO', response);
      });
    };


  }) //PalestraCtrl
  .controller('GruposPalestrantesCtrl', function($scope, $rootScope) {

    $scope.GrupoPalestrantes = $rootScope.BancoDeDadosConteudo.GrupoPalestrantes;
  })

.controller('PalestrantesCtrl', function($scope, $rootScope, MonitorInternet, $stateParams, $filter) {
  grupo = $stateParams.id_grupo_palestrantes;
  palestrantesDB = $rootScope.BancoDeDadosConteudo.Palestrantes;
  palestrantesSelecionados = $filter('filter')(palestrantesDB, function(d) {
    return d.grupo.id_grupo_palestrante == grupo;
  });
  $scope.palestrantes = palestrantesSelecionados;
  $scope.online = MonitorInternet.estaOnline($rootScope);
  $scope.imagemDefault = 'usuario';
})

.controller('GruposParticipantesCtrl', function($scope, $rootScope, $localstorage, $location) {

  var usuario = $localstorage.getObject('login');
  if ((usuario.flag_administrador == null) || (usuario.flag_administrador == false)) {
    $location.path('/teva/participantes/' + usuario.grupo.id_grupo_participante);
  }

  $scope.GruposParticipantes = $rootScope.BancoDeDadosConteudo.GruposParticipantes;
})

.controller('ParticipantesCtrl', function($scope, $rootScope, $stateParams, $filter) {
  grupo = $stateParams.id_grupo_participantes;
  participantesDB = $rootScope.BancoDeDadosConteudo.Participantes;

  participantesSelecionados = $filter('filter')(participantesDB, function(d) {
    return d.grupo.id_grupo_participante == grupo;
  });
  $scope.participantes = participantesSelecionados;
})

.controller('PerfilPalestranteCtrl', function($scope, $rootScope, $filter, $stateParams, MonitorInternet, PalestrasFactory) {
  //Palestrante
  palestrante = $stateParams.id_palestrante;
  palestrantesDB = $rootScope.BancoDeDadosConteudo.Palestrantes;
  palestranteSelecionado = $filter('filter')(palestrantesDB, function(d) {
    return d.id_palestrante == palestrante;
  })[0];
  $scope.palestrante = palestranteSelecionado;
  //console.log(palestranteSelecionado);

  //Palestras
  palestrasDB = $rootScope.BancoDeDadosConteudo.Palestras;
  console.log(palestrasDB);
  $scope.Palestras = PalestrasFactory.GetPalestrasDoPalestrante(palestrante, palestrasDB);
  console.log($scope.Palestras);

  $scope.imagemDefault = 'usuario';
  $scope.online = MonitorInternet.estaOnline($rootScope);
})

.controller('PerfilParticipanteCtrl', function($scope, $rootScope, $filter, $stateParams, MonitorInternet) {
  participante = $stateParams.id_participante;
  participantesDB = $rootScope.BancoDeDadosConteudo.Participantes;
  participanteSelecionado = $filter('filter')(participantesDB, function(d) {
    return d.id_participante == participante;
  })[0];
  $scope.participante = participanteSelecionado;
  $scope.imagemDefault = 'usuario';
  $scope.online = MonitorInternet.estaOnline($rootScope);
  console.log(participanteSelecionado);
})

.controller('InterativoCtrl', function($scope, $rootScope, $sce, $filter, $localstorage) {
  GruposParticipantes = $rootScope.BancoDeDadosConteudo.GruposParticipantes;
  var usuario = $localstorage.getObject('login');
  console.log(usuario);
  $scope.GrupoDoParticipanteLogado = $filter('filter')(GruposParticipantes,
    function(d) {
      return d.id_grupo_participante == usuario.grupo.id_grupo_participante;
    })[0];


  console.log($scope.GrupoDoParticipanteLogado);

  $scope.trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  }
  if ($scope.GrupoDoParticipanteLogado.interativo_ativo) {
    $scope.iframe = {
      src: $scope.GrupoDoParticipanteLogado.interativo_url,
      title: "Sistema Interativo TEVA"
    };
  }
})

.controller('QuizCtrl', function($scope, $rootScope, $sce, $filter, $localstorage) {
  GruposParticipantes = $rootScope.BancoDeDadosConteudo.GruposParticipantes;
  var usuario = $localstorage.getObject('login');
  console.log(usuario);
  $scope.GrupoDoParticipanteLogado = $filter('filter')(GruposParticipantes,
    function(d) {
      return d.id_grupo_participante == usuario.grupo.id_grupo_participante;
    })[0];


  console.log($scope.GrupoDoParticipanteLogado);

  $scope.trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  }
  if ($scope.GrupoDoParticipanteLogado.quiz_ativo) {
    url = $scope.GrupoDoParticipanteLogado.quiz_url;
    url = url.replace('%login%', usuario.email);
    if (usuario.senha) {
      url = url.replace('%senha%', usuario.senha);
    } else {
      url = url.replace('%senha%', '');
    }

    $scope.iframe = {
      src: url,
      title: "Sistema Quiz TEVA"
    };
  }
})

.controller('MapaCtrl', function($scope, $ionicLoading, $compile) {

  $scope.init = function() {
    var myLatlng = new google.maps.LatLng(-15.351169, -39.001536);

    var mapOptions = {
      center: myLatlng,
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map"),
      mapOptions);

    //Marker + infowindow + angularjs compiled ng-click
    var contentString = "<div><a ng-click='clickTest()'>Convenção TEVA - Comandatuba</a></div>";
    var compiled = $compile(contentString)($scope);

    var infowindow = new google.maps.InfoWindow({
      content: compiled[0]
    });

    var marker = new google.maps.Marker({
      position: myLatlng,
      map: map,
      title: 'Uluru (Ayers Rock)'
    });

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map, marker);
    });

    $scope.map = map;
  };

  // google.maps.event.addDomListener(window, 'load', initialize);

  $scope.centerOnMe = function() {
    if (!$scope.map) {
      return;
    }

    $scope.loading = $ionicLoading.show({
      content: 'Obtendo localização...',
      showBackdrop: false
    });

    navigator.geolocation.getCurrentPosition(function(pos) {

      var novaLatLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
      new google.maps.Marker({
        position: novaLatLng,
        map: map,
        title: 'Sua localização'
      });
      $scope.map.setCenter(novaLatLng);
      console.log(novaLatLng);
      $ionicLoading.hide();

    }, function(error) {
      alert('Não foi possível obter a localização: ' + error.message);
    });
  };

  // $scope.clickTest = function() {
  //     alert('Example of infowindow with ng-click')
  // };
});
