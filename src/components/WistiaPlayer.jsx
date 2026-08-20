import { useEffect } from 'react';

const PLAYER_SRC = 'https://fast.wistia.com/player.js';

function ensureScript(src, { module = false } = {}) {
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) return;
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  if (module) script.type = 'module';
  document.head.appendChild(script);
}

export default function WistiaPlayer({ mediaId, aspect = 16 / 9, autoplay = false }) {
  const paddingTop = `${((1 / aspect) * 100).toFixed(4)}%`;

  useEffect(() => {
    ensureScript(PLAYER_SRC);
    ensureScript(`https://fast.wistia.com/embed/${mediaId}.js`, { module: true });

    if (!autoplay) return undefined;

    let cancelled = false;
    window._wq = window._wq || [];
    window._wq.push({
      id: mediaId,
      options: {
        autoPlay: true,
        muted: false,
        silentAutoPlay: false,
        volume: 1,
        playsinline: true,
      },
      onReady(video) {
        if (cancelled) return;
        video.unmute();
        if (typeof video.volume === 'function') video.volume(1);
        const result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(() => {});
        }
      },
    });

    return () => {
      cancelled = true;
    };
  }, [mediaId, autoplay]);

  return (
    <div className={`wistia-wrap${aspect < 1 ? ' wistia-wrap--portrait' : ''}`}>
      <style>
        {`wistia-player[media-id='${mediaId}']:not(:defined){background:center/contain no-repeat url('https://fast.wistia.com/embed/medias/${mediaId}/swatch');display:block;filter:blur(5px);padding-top:${paddingTop};}`}
      </style>
      <wistia-player
        media-id={mediaId}
        aspect={String(aspect)}
        {...(autoplay ? { autoplay: '', 'silent-autoplay': 'false', playsinline: '' } : {})}
      ></wistia-player>
    </div>
  );
}
