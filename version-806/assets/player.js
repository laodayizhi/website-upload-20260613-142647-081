(function () {
  function setupPlayer(root) {
    var video = root.querySelector('video');
    var button = root.querySelector('[data-player-action]');
    var source = root.getAttribute('data-player-src');
    var hls = null;
    var ready = false;

    if (!video || !source) {
      return;
    }

    function attach() {
      if (ready) {
        return Promise.resolve();
      }

      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return new Promise(function (resolve) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
        });
      }

      video.src = source;
      return Promise.resolve();
    }

    function play() {
      attach().then(function () {
        if (button) {
          button.classList.add('is-hidden');
        }
        var attempt = video.play();
        if (attempt && attempt.catch) {
          attempt.catch(function () {
            if (button) {
              button.classList.remove('is-hidden');
            }
          });
        }
      });
    }

    if (button) {
      button.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (!ready) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    root.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        play();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
  });
})();
