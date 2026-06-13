(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var players = document.querySelectorAll(".movie-player");
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".play-overlay");
      var errorBox = player.querySelector(".player-error");
      if (!video) {
        return;
      }

      var stream = video.getAttribute("data-stream");
      var attached = false;
      var hls = null;

      function showError() {
        if (errorBox) {
          errorBox.hidden = false;
        }
      }

      function hideError() {
        if (errorBox) {
          errorBox.hidden = true;
        }
      }

      function attach() {
        if (attached || !stream) {
          return;
        }
        attached = true;
        hideError();

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showError();
            }
          });
          return;
        }

        video.src = stream;
      }

      function start() {
        attach();
        var playResult = video.play();
        if (playResult && typeof playResult.catch === "function") {
          playResult.catch(function () {
            showError();
          });
        }
      }

      attach();

      if (overlay) {
        overlay.addEventListener("click", function (event) {
          event.preventDefault();
          start();
        });
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });

      video.addEventListener("play", function () {
        player.classList.add("is-playing");
        hideError();
      });

      video.addEventListener("pause", function () {
        if (!video.ended) {
          player.classList.remove("is-playing");
        }
      });

      video.addEventListener("ended", function () {
        player.classList.remove("is-playing");
      });

      video.addEventListener("error", showError);

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
