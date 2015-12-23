angular.module('teva.config', [])

.constant('config', {

  appNome: 'Teva',
  appVersao: 0.5,
  apiUrl: 'http://www.qualitydigital.com.br/Teva2016/api',
  //apiUrl: 'http://localhost:1885/api/',
  intervaloAtualizacao: 60000 // 1800000 = 30 minutos

})
