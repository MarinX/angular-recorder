'use strict';

angular.module('angularAudioRecorder.directives')
  .directive('ngAudioRecorderWaveView', ['recorderService', 'recorderUtils', '$log',
    function (service, utils, $log) {

      return {
        restrict: 'E',
        require: '^ngAudioRecorder',
        link: function (scope, $element, attrs, recorder) {
          if (!window.WaveSurfer) {
            $log.warn('WaveSurfer was found.');
            return;
          }

          var audioPlayer;
          $element.html('<div class="waveSurfer"></div>');
          var options = angular.extend({container: $element.find('div')[0]}, attrs);
          service.createWaveSurfer(options);

          utils.appendActionToCallback(recorder, 'onPlaybackStart|onPlaybackResume', function () {
            service.getWaveSurfer().play();
          }, 'waveView');
          utils.appendActionToCallback(recorder, 'onPlaybackComplete|onPlaybackPause', function () {
            service.getWaveSurfer().pause();
          }, 'waveView');

          utils.appendActionToCallback(recorder, 'onRecordComplete', function () {
            if (!audioPlayer) {
              audioPlayer = recorder.getAudioPlayer();
              audioPlayer.volume = 0;
              audioPlayer.addEventListener('seeking', function (e) {
                var progress = audioPlayer.currentTime / audioPlayer.duration;
                service.getWaveSurfer().seekTo(progress);
              });
            }
          }, 'waveView');


          scope.$watch(function () {
            return recorder.audioModel;
          }, function (newBlob) {
            if (newBlob instanceof Blob) {
              service.getWaveSurfer().loadBlob(newBlob);

            }
          });
        }
      };
    }]);
