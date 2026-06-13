(function () {
  var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  nodes.forEach(function (wrap) {
    var video = wrap.querySelector('video');
    var button = wrap.querySelector('[data-play-button]');
    var status = wrap.querySelector('[data-player-status]');
    var stream = video ? video.getAttribute('data-stream') : '';
    var ready = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message || '';
      }
    }

    function prepare() {
      if (!video || ready || !stream) {
        return;
      }
      ready = true;
      setStatus('正在加载视频…');

      if (window.Hls && window.Hls.isSupported()) {
        var player = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        player.loadSource(stream);
        player.attachMedia(video);
        player.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('');
        });
        player.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('视频加载失败，请稍后重试');
          }
        });
        video._player = player;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', function () {
          setStatus('');
        }, { once: true });
      } else {
        setStatus('视频加载失败，请稍后重试');
      }
    }

    function playVideo() {
      prepare();
      if (!video) {
        return;
      }
      var attempt = video.play();
      if (attempt && typeof attempt.then === 'function') {
        attempt.then(function () {
          wrap.classList.add('is-playing');
        }).catch(function () {
          setStatus('点击播放按钮开始观看');
        });
      } else {
        wrap.classList.add('is-playing');
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        playVideo();
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
          wrap.classList.remove('is-playing');
        }
      });
      video.addEventListener('play', function () {
        wrap.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        wrap.classList.remove('is-playing');
      });
    }
  });
})();
