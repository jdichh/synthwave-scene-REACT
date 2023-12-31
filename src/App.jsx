import React, { useRef } from "react";
import Three from "./components/Three.jsx";
import MusicControls from "./components/MusicControls.jsx";

const App = () => {
  const canvasRef = useRef();
  const audio = new Audio("./assets/music/almondcruise.mp3");
  audio.preload = "auto";

  // world peace!
  return (
    <>
      <Three canvasRef={canvasRef} audio={audio} />
      <MusicControls audio={audio} />
    </>
  );
};

export default App;
