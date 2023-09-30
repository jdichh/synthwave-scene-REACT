import React, { useEffect } from "react";
import * as THREE from "three";
import { useRef } from "react";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";
import WebGL from "three/addons/capabilities/WebGL.js";

const Three = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!WebGL.isWebGLAvailable()) {
      const warning = WebGL.getWebGLErrorMessage();
      document.getElementById("container").appendChild(warning);
    }

    const PINK = "#F2247F";
    const WHITE = "#999999";
    const INDIGO = "#52069E";

    const TEXTURE = "./assets/grid.webp";
    const TERRAIN = "./assets/terrain_data.webp";
    const SHINY = "./assets/shinystuff.webp";
    const SKYBOX = "./assets/skybox.webp";

    const textureLoader = new THREE.TextureLoader();
    const gridLandscape = textureLoader.load(TEXTURE);
    const terrain = textureLoader.load(TERRAIN);
    const shinystuff = textureLoader.load(SHINY);
    const sky = textureLoader.load(SKYBOX);

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    scene.background = sky;

    const geometry = new THREE.PlaneGeometry(1.5, 2, 24, 24);

    // Material is the texture. Or if you're a gamer™, a weapon skin.
    const material = new THREE.MeshStandardMaterial({
      map: gridLandscape,
      displacementMap: terrain,
      // Height of "mountains".
      displacementScale: 0.85,
      metalnessMap: shinystuff,
      metalness: 1,
      roughness: 0.65,
    });

    // Sun
    const SUN_COLOR = "#DDDDDD";
    const SUNRAY_INTENSITY = 1.25;
    const SUN_GRADIENT_COLOR = textureLoader.load("./assets/sun.webp");
    const sunRadius = 1;

    const sunGeometry = new THREE.SphereGeometry(sunRadius, 32, 32);
    const sunMaterial = new THREE.MeshStandardMaterial({
      // color: SUN_COLOR,
      // emissive: SUN_COLOR,
      map: SUN_GRADIENT_COLOR,
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(0, 0.5, -3.5);
    scene.add(sun);

    // Sun rays
    const sunLight = new THREE.DirectionalLight(SUN_COLOR, SUNRAY_INTENSITY);
    sunLight.position.set(0, 1, -1.5);
    scene.add(sunLight);

    // Plane (the landscape) is positioned in front of the camera.
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI * 0.5;
    plane.position.y = 0;
    plane.position.z = 0.15;

    const plane2 = new THREE.Mesh(geometry, material);
    plane2.rotation.x = -Math.PI * 0.5;
    plane2.position.y = 0.0;
    plane2.position.z = -1.85;

    const plane3 = new THREE.Mesh(geometry, material);
    plane3.rotation.x = -Math.PI * 0.5;
    plane3.position.y = 0;
    plane3.position.z = -3.85;

    scene.add(plane);
    scene.add(plane2);
    scene.add(plane3);

    // AmbientLight(color, intensity)
    const AMBIENT_LIGHT_INTENSITY = 11;
    const ambientLight = new THREE.AmbientLight(WHITE, AMBIENT_LIGHT_INTENSITY);
    scene.add(ambientLight);

    // Right spotlight pointing to the left.
    const spotlight = new THREE.SpotLight(PINK, 90, 15, Math.PI * 0.1, 0.25);
    spotlight.position.set(-1, 0.5, 2.5);
    // Specific target for the right spotlight.
    spotlight.target.position.x = 0.25;
    spotlight.target.position.y = 0.25;
    spotlight.target.position.z = 0.25;
    scene.add(spotlight);
    scene.add(spotlight.target);

    // Left spotlight pointing to the right.
    const spotlight2 = new THREE.SpotLight(
      INDIGO,
      200,
      15,
      Math.PI * 0.1,
      0.25
    );
    spotlight2.position.set(1, 0.5, 2.5);
    // Specific target for the left spotlight.
    spotlight2.target.position.x = 0.25;
    spotlight2.target.position.y = 0.25;
    spotlight2.target.position.z = 0.25;
    scene.add(spotlight2);
    scene.add(spotlight2.target);

    const windowSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    /* PerspectiveCamera(FoV, Aspect Ratio, Near Plane Distance, Far Plane Distance)
        Near Clipping Plane is the visibility of the foreground. Higher value means that the anything normally close to the camera isn't visible. Opposite for lower values.
        Far Clipping Plane is the visibility of the background. Higher value means longer draw distance (Can see the scene further). Opposite for lower values.
    */
    const camera = new THREE.PerspectiveCamera(
      85,
      windowSize.width / windowSize.height,
      0.01,
      10
    );

    camera.position.x = 0;
    camera.position.y = 0.05;
    camera.position.z = 1;

    // DEVTOOLS! Not meant for normal users/viewers.
    // DEBUG CAM
    // const controls = new OrbitControls(camera, canvas);
    // controls.enableDamping = true;
    // Enabling damping is like scroll-behavior: smooth in CSS.
    // DEVTOOLS!

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
    });
    renderer.setSize(windowSize.width, windowSize.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const effectComposer = new EffectComposer(renderer);
    effectComposer.setSize(windowSize.width, windowSize.height);
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Post-processing stuff.
    const renderPass = new RenderPass(scene, camera);
    effectComposer.addPass(renderPass);

    const rgbShiftPass = new ShaderPass(RGBShiftShader);
    rgbShiftPass.uniforms["amount"].value = 0.0007;
    effectComposer.addPass(rgbShiftPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.9, // These do nothing!!
      0.5, // These do nothing!!
      0.85 // These do nothing!!
    );

    // These work somehow!
    bloomPass.strength = 0.25;
    bloomPass.threshold = 0;
    bloomPass.radius = 1;
    effectComposer.addPass(bloomPass);

    // CRT Filter
    const filmPass = new FilmPass(
      0.4, // noise intensity
      0.75, // scanline intensity
      2048, // scanline count
      false // grayscale
    );
    effectComposer.addPass(filmPass);

    window.addEventListener("resize", () => {
      windowSize.width = window.innerWidth;
      windowSize.height = window.innerHeight;

      camera.aspect = windowSize.width / windowSize.height;
      camera.updateProjectionMatrix();

      renderer.setSize(windowSize.width, windowSize.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      effectComposer.setSize(windowSize.width, windowSize.height);
      effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    // Clock() tracks the elapsed time since the loop started.
    const clock = new THREE.Clock();
    const animationSpeed = 0.05;

    const updateFrame = () => {
      // stats.begin()

      // Returns time in seconds.
      const elapsedTime = clock.getElapsedTime();
      // Devtool
      // controls.update();
      /* Enables looping effect along with requestAnimationFrame.
    (elapsedTime * speed) % 2 enables smooth z-movement. 
    When '% 2' reaches 2, it resets the loop to 0. 
    '- 2' in plane2 just staggers plane2.
  */
      plane.position.z = (elapsedTime * animationSpeed) % 2;
      plane2.position.z = ((elapsedTime * animationSpeed) % 2) - 2;
      plane3.position.z = ((elapsedTime * animationSpeed) % 2) - 4;

      renderer.render(scene, camera);
      effectComposer.render();
      // Call updateFrame on every frame passed.
      window.requestAnimationFrame(updateFrame);

      // stats.end()
    };

    updateFrame();

    return () => {
      renderer.dispose();
      effectComposer.dispose();
    };
  });

  return <canvas ref={canvasRef} className="webGL"></canvas>;
};

export default Three;
