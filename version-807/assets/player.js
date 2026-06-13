(() => {
  const video = document.getElementById('moviePlayer');
  const overlay = document.getElementById('playerOverlay');
  const url = window.__VIDEO_URL;
  let loaded = false;
  let hls = null;

  if (!video || !overlay || !url) {
    return;
  }

  const load = () => {
    if (loaded) {
      return;
    }

    loaded = true;

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else {
      video.src = url;
    }
  };

  const play = () => {
    load();
    overlay.classList.add('hidden');
    const result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(() => {});
    }
  };

  overlay.addEventListener('click', play);

  video.addEventListener('click', () => {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', () => {
    overlay.classList.add('hidden');
  });

  video.addEventListener('pause', () => {
    if (video.currentTime === 0 || video.ended) {
      overlay.classList.remove('hidden');
    }
  });

  window.addEventListener('pagehide', () => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
})();
