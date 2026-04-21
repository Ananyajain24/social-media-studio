import React, { useRef, useState } from 'react';

export default function VideoPlayer({ url }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    playing ? v.pause() : v.play();
    setPlaying(!playing);
  };

  const download = () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cuemath_reel.mp4';
    a.click();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Your Reel</h3>
        <span className="text-xs text-gray-600">9:16 · MP4 · 1080×1920</span>
      </div>

      {/* Phone mock frame */}
      <div className="flex justify-center">
        <div className="relative w-[220px] bg-gray-900 rounded-[28px] border-2 border-gray-700 overflow-hidden shadow-2xl shadow-pink-500/10">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-gray-900 rounded-b-xl z-10" />

          <video
            ref={videoRef}
            src={url}
            className="w-full aspect-[9/16] object-cover"
            loop
            playsInline
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />

          {/* Play overlay */}
          {!playing && (
            <button
              onClick={toggle}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors"
            >
              <span className="text-4xl text-white drop-shadow-lg">▶</span>
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={toggle}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm transition-colors"
        >
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        <button
          onClick={download}
          className="flex items-center gap-1.5 px-4 py-2 bg-pink-500 hover:bg-pink-400 text-white font-bold rounded-xl text-sm transition-colors"
        >
          ↓ Download MP4
        </button>
      </div>
    </div>
  );
}
