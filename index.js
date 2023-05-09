import * as THREE from "three";
import * as DAT from "dat.gui";
import { OrbitControls } from "threeAddons/controls/OrbitControls.js";
import { EffectComposer } from "threeAddons/postprocessing/EffectComposer.js";
import { RenderPass } from "threeAddons/postprocessing/RenderPass.js";
import { SAOPass } from "threeAddons/postprocessing/SAOPass.js";
import { SSAOPass } from "threeAddons/postprocessing/SSAOPass.js";
import { BloomPass } from "threeAddons/postprocessing/BloomPass.js";

function createSphere(loader) {
  const geometry = new THREE.SphereGeometry(28, 256, 256);

  //----Mesh Phong Material
  //const material = new THREE.MeshPhongMaterial();
  //material.shininess = 21;
  //material.specular = 0x000000;

  //--- Mesh Standard Material (PBR)
  const material = new THREE.MeshStandardMaterial();

  //---Reflection //add env map later ...
  const roughTex = loader.load("textures\\EarthRoughness.png");
  material.metalness = 0.4;
  material.roughnessMap = roughTex;

  //---Diffuse
  const diffuseTex = loader.load("textures\\EarthDiffuse_3.png");
  material.map = diffuseTex;

  //---Displacement
  const dispTex = loader.load("textures\\EarthDisplacement.png");
  material.displacementMap = dispTex;
  material.displacementScale = 2;

  //---Alpha/Transparency
  const transTex = loader.load("textures\\EarthTransparency.png");
  material.transparent = true;
  material.opacity = 1;
  material.alphaMap = transTex;

  const sphereMesh = new THREE.Mesh(geometry, material);
  sphereMesh.castShadow = true;
  sphereMesh.receiveShadow = true;
  return sphereMesh;
}

function wayPoint(loader) {
  const geometry = new THREE.SphereGeometry(16, 256, 256);

  //----Mesh Phong Material
  //const material = new THREE.MeshPhongMaterial();
  //material.shininess = 21;
  //material.specular = 0x000000;

  //--- Mesh Standard Material (PBR)
  const material = new THREE.MeshBasicMaterial();
  material.roughness = 0.8;
  material.metalness = 0.1;

  const diffuseTex = loader.load("textures\\EarthDiffuse_3.png");
  material.map = diffuseTex;

  const sphereMesh = new THREE.Mesh(geometry, material);
  sphereMesh.castShadow = true;
  sphereMesh.receiveShadow = true;
  return sphereMesh;
}

function createPointLight(color, intinsity, x, y, z, isShadow) {
  const pointLight = new THREE.PointLight(color, intinsity);
  pointLight.position.set(x, y, z);
  if (isShadow) {
    pointLight.castShadow = true;
    pointLight.shadow.mapSize = new THREE.Vector2(2048, 2048);
    //pointLight.shadow.radius = 5;
    //pointLight.shadow.blurSamples = 36;
    //pointLight.shadow.bias = 0.0001;
  }
  return pointLight;
}

/* TODO:
    - Post-Processing effects like anti-aliasing, and ambient occlusion.
    - screen-resolution and canvas size and stuff
    - Lighting & Materials:
        - Enviornment map?
        - Physically based rendering maybe
    - Add two lights, blue and orange, make the earth a neutral color ... white?
        - fix the background and add maybe an enviornment map ... 
*/

function init() {
  //------ Parameters
  const parameters = {
    rotationSpeed: 0.001,
  };

  //----- Load textures
  const loader = new THREE.TextureLoader();

  //------ Create Scene, Camera, Renderer
  const scene = new THREE.Scene();
  // scene.fog = new THREE.FogExp2(0xffffff, 0.001); //0x0c1734
  // this.threeRenderer.setClearColor(scene.fog.color);
  // this.threeRenderer.setPixelRatio(window.devicePixelRatio); // For retina

  const background = loader.load("textures\\BackGround.png");
  scene.background = background;

  //---------- Camera
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 100;

  //---------- Renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: document.querySelector("#canvas"),
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  //renderer.shadowMap.type = THREE.VSMShadowMap;
  //renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  //   renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  //   renderer.toneMapping = THREE.ReinhardToneMapping;

  //------ Create Sphere
  const sphereMesh = createSphere(loader);
  //scene.add(wireFrame);
  scene.add(sphereMesh);

  //------ Creating Ambient Light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  //------ Creating Point light
  const pointLight1 = createPointLight(0xffffff, 0.2, 64, 64, 0, true); //0xff4f1b
  const pointLight2 = createPointLight(0xffffff, 0.5, -64, -64, 0, false); //0x0a162a
  scene.add(pointLight1);
  scene.add(pointLight2);

  //----- Creating Directional Light
  const dirlight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirlight.position.set(125, 125, 0);
  dirlight.castShadow = true;
  dirlight.shadow.mapSize = new THREE.Vector2(2048, 2048);
  dirlight.shadow.radius = 4;
  dirlight.shadow.blurSamples = 25;
  //scene.add(dirlight);

  //--------- Orbit Controls
  const controls = new OrbitControls(camera, renderer.domElement);

  //-------- Post Processing
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  const saoPass = new SAOPass(
    scene,
    camera,
    true,
    true,
    new THREE.Vector2(1024, 1024)
  );
  //   saoPass.params.saoBias = -1;
  //   saoPass.params.saoIntensity = 0.01;
  //   saoPass.params.saoScale = 30;
  //   saoPass.params.saoKernelRadius = 60;
  //   saoPass.params.saoMinResolution = 0;
  //   saoPass.params.saoBlur = true;
  //   saoPass.params.saoBlurRadius = 5;
  //   saoPass.params.saoBlurStdDev = 20;
  //   saoPass.params.saoBlurDepthCutoff = 0.00001;
  //composer.addPass(saoPass);

  //   const ssaoPass = new SSAOPass(scene, camera);
  //   composer.addPass(ssaoPass);

  //   const bloomPass = new BloomPass(0.1, 24);
  //   composer.addPass(bloomPass);

  function animate() {
    requestAnimationFrame(animate);
    sphereMesh.rotation.y -= parameters.rotationSpeed;
    controls.update();
    composer.render();
  }

  //------ UI
  const datGUI = new DAT.GUI();
  datGUI.add(camera.position, "z", 0, 100);
  datGUI.add(parameters, "rotationSpeed", 0, 1);
  //   datGUI.add(dirlight.shadow, "radius", 0, 100);
  //   datGUI.add(dirlight.shadow, "bias", 0, 0.01);
  // datGUI.add(pointLight2.shadow, 'radius', 0, 100);
  // datGUI.add(pointLight2.shadow, 'blurSamples', 0, 100);

  const saoFolder = datGUI.addFolder("Ambient Occlusion");
  for (const key in saoPass.params) {
    if (saoPass.params.hasOwnProperty(key)) {
      saoFolder.add(saoPass.params, key);
    }
  }

  //------Render loop?
  animate();
}

init();
