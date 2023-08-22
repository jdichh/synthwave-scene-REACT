import React, { useState, useEffect } from 'react';

export const playMusic = (audio) => {
  audio.currentTime = 0;
  audio.loop = true;
  audio.play();
};

const MusicControls = ({ audio }) => {
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const [volume, setVolume] = useState(0.2);

  useEffect(() => {
    audio.volume = volume;
  }, [volume, audio]);

  const toggleMusic = () => {
    if (isMusicPlaying) {
      audio.pause();
    } else {
      playMusic(audio);
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  const updateVolume = (event) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
  };

  return (
    <div>
      <button id="music-toggle-button" onClick={toggleMusic}>
        <i className={`fas ${isMusicPlaying ? 'fa-stop' : 'fa-play'} fa-sm`}></i>
      </button>
      <input
        id="volume-slider"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={updateVolume}
      />
    </div>
  );
};

export default MusicControls;
