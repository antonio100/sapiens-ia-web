(() => {
  'use strict';

  const story = document.querySelector('.story');
  if (!story) return;

  const stage = story.querySelector('.story-stage');
  const plates = [...story.querySelectorAll('[data-plate]')];
  const videos = [...story.querySelectorAll('[data-clip]')];
  const uda = story.querySelector('.uda-mark');
  const identity = story.querySelector('.identity');
  const tagline = story.querySelector('.tagline');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = matchMedia('(hover: none), (pointer: coarse)');
  const clips = videos.map(video => ({
    video,
    source: video.dataset.src,
    status: 'idle',
    ready: false,
    painted: false,
    directFallback: false,
    objectUrl: null
  }));

  let targetPosition = 0;
  let frame = 0;
  let userGesture = false;
  let laidOutWidth = innerWidth;

  document.documentElement.classList.add('js-ready');

  function clamp(value, min = 0, max = 1) {
    return Math.min(max, Math.max(min, value));
  }

  function smooth(value) {
    const x = clamp(value);
    return x * x * (3 - 2 * x);
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  function attachVideo(clip, source) {
    clip.video.src = source;
    clip.video.load();
  }

  function useDirectVideo(clip) {
    if (clip.directFallback) return;
    clip.directFallback = true;
    clip.ready = false;
    if (clip.objectUrl) {
      URL.revokeObjectURL(clip.objectUrl);
      clip.objectUrl = null;
    }
    attachVideo(clip, clip.source);
  }

  function loadClip(index) {
    const clip = clips[index];
    if (!clip || clip.status !== 'idle' || reducedMotion.matches) return;
    clip.status = 'loading';

    // An object URL remains seekable even when a static host lacks byte ranges.
    // Direct video loading is the fallback if cross-origin fetching fails.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    fetch(clip.source, { mode: 'cors', signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error(`Video HTTP ${response.status}`);
        return response.blob();
      })
      .then(blob => {
        clearTimeout(timeout);
        if (!blob.size) throw new Error('Empty video');
        clip.objectUrl = URL.createObjectURL(blob);
        attachVideo(clip, clip.objectUrl);
      })
      .catch(() => {
        clearTimeout(timeout);
        useDirectVideo(clip);
      });
  }

  function primeVideo(clip) {
    if (!coarsePointer.matches || !clip.ready) return;
    try {
      const play = clip.video.play();
      if (play && typeof play.then === 'function') {
        play.then(() => clip.video.pause()).catch(() => {});
      } else {
        clip.video.pause();
      }
    } catch (_) {
      // Posters stay visible if this browser requires a different gesture.
    }
  }

  clips.forEach(clip => {
    clip.video.muted = true;
    clip.video.addEventListener('loadeddata', () => {
      clip.ready = true;
      clip.status = 'ready';
      clip.video.pause();
      if (userGesture) primeVideo(clip);
      schedule();
    });
    clip.video.addEventListener('seeked', schedule);
    clip.video.addEventListener('error', () => {
      if (!clip.directFallback) {
        useDirectVideo(clip);
        return;
      }
      clip.status = 'failed';
      clip.ready = false;
      schedule();
    });
  });

  function readScroll() {
    if (reducedMotion.matches) return;
    const rect = story.getBoundingClientRect();
    const travel = Math.max(1, story.offsetHeight - stage.offsetHeight);
    targetPosition = clamp(-rect.top / travel) * 3;

    loadClip(Math.min(1, Math.floor(targetPosition)));
    loadClip(Math.min(1, Math.floor(targetPosition) + 1));
    schedule();
  }

  function paintPlates(position) {
    const segment = Math.min(2, Math.floor(position));
    const mix = smooth(position - segment);
    plates.forEach((plate, index) => {
      const opacity = index === segment ? 1 : index === segment + 1 ? mix : 0;
      plate.style.opacity = String(opacity);
    });
  }

  function clipOpacity(index, position) {
    const entrance = smooth((position - index) / .08);
    const exit = 1 - smooth((position - index - .9) / .1);
    return entrance * exit;
  }

  function paintClips(position) {
    clips.forEach((clip, index) => {
      const video = clip.video;
      const opacity = clipOpacity(index, position);
      if (opacity <= .001 || !clip.ready) {
        video.style.opacity = '0';
        return;
      }

      const duration = Number.isFinite(video.duration) ? video.duration : 4;
      const targetTime = clamp(position - index) * Math.max(0, duration - 1 / 30);
      const gap = Math.abs(video.currentTime - targetTime);

      // Keep the last decoded frame during a seek. Queue only the newest scroll
      // target after seeked, so fast scrolling cannot pile up decoder requests.
      if (!video.seeking && gap > (coarsePointer.matches ? .08 : .035)) {
        try { video.currentTime = targetTime; } catch (_) { /* poster remains */ }
      }
      // A long jump must reveal the matching still, not a stale decoded frame.
      // Short seeks keep the preceding frame visible to avoid flashes.
      if (gap > (clip.painted ? .45 : .12)) {
        video.style.opacity = '0';
        return;
      }
      video.style.opacity = String(opacity);
      clip.painted = true;
    });
  }

  function paintIdentity(position) {
    const fusion = smooth((position - .34) / .66);
    uda.style.opacity = String(1 - fusion);
    const shift = innerWidth > 700 ? fusion * 22 : 0;
    uda.style.transform = `translate3d(${shift}vw,-50%,0) scale(${1 - fusion * .2})`;

    identity.style.opacity = String(smooth((position - 1.78) / .22));
    const taglineReveal = smooth((position - 2.34) / .4);
    tagline.style.opacity = String(taglineReveal);
    tagline.style.transform = `translateY(${(1 - taglineReveal) * 18}px)`;
  }

  function render() {
    frame = 0;
    if (reducedMotion.matches) return;

    // The scroll position is the only timeline. Additional frame smoothing
    // made the identity lag behind the videos and slowed the first reveal.
    const position = targetPosition;

    paintPlates(position);
    paintClips(position);
    paintIdentity(position);

  }

  function onFirstGesture() {
    if (userGesture) return;
    userGesture = true;
    clips.forEach(primeVideo);
  }

  function onResize() {
    if (coarsePointer.matches && innerWidth === laidOutWidth) return;
    laidOutWidth = innerWidth;
    readScroll();
  }

  window.addEventListener('pointerdown', onFirstGesture, { once: true, passive: true });
  window.addEventListener('touchstart', onFirstGesture, { once: true, passive: true });
  window.addEventListener('scroll', readScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('orientationchange', readScroll);
  reducedMotion.addEventListener('change', readScroll);
  window.addEventListener('pagehide', () => {
    clips.forEach(clip => {
      if (clip.objectUrl) URL.revokeObjectURL(clip.objectUrl);
    });
  });

  readScroll();
})();
