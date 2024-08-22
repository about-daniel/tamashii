import * as THREE from "three";
import { fragmentShader, vertexShader } from "./inlcudes/webgl.js";
gsap.registerPlugin(Observer);

// Variables
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
let animating = false;
let currentIndex = -1;
const loader = new THREE.TextureLoader();
const texture = loader.load("/assets/everest.jpeg", init);
const steps = [-1, 0, 1, 2, 3, 4];
let observer;

let uniforms = {
  uTime: { value: 0 },
  uResolution: { value: [sizes.width, sizes.height] },
  uMouse: { value: [0, 0] },
  uTexture: { value: null },
  uShift: { value: 0 },
  uAlpha: { value: 1 },
};

// Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 5;
scene.add(camera);
const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
});

// ---- START composing scene
const geometry = new THREE.PlaneGeometry(1, 1);
const texture_1 = loader.load("/assets/everest.jpeg");
const texture_2 = loader.load("/assets/temple.png");
const material_1 = new THREE.MeshBasicMaterial({ map: texture_1 });
const material_2 = new THREE.MeshBasicMaterial({
  map: texture_2,
  transparent: true,
});
const clouds_material = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
});

const everest = new THREE.Mesh(geometry, material_1);
const temple = new THREE.Mesh(geometry, material_2);
const clouds = new THREE.Mesh(geometry, clouds_material);
fitWindow(everest, camera);
fitWindow(temple, camera);
fitWindow(clouds, camera);

temple.position.z = 4;

scene.add(everest, temple, clouds);

// ---- END composing scene

// Init
function init() {
  renderer.setSize(sizes.width, sizes.height);
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.useLegacyLights = false;
  renderer.shadowMap.enabled = true;
  document.querySelector("#webgl").appendChild(renderer.domElement);
  clouds.material.uniforms.uTexture.value = texture;

  animate();

  //GSAP
  observer = Observer.create({
    target: document.querySelector("#webgl"),
    type: "wheel,touch,pointer",
    onDown: () => !animating && gotoSection(currentIndex + 1, -1),
    onUp: () => !animating && gotoSection(currentIndex - 1, 1),
    tolerance: 10,
    preventDefault: true,
  });
  observer.disable();
  gsap.set([".step2", ".step3"], { y: sizes.height, visibility: "visible" });

  // pin swipe section and initiate observer
  ScrollTrigger.create({
    trigger: ".fixed",
    pin: true,
    start: "top top",
    onEnter: () => {
      observer.enable();
      gotoSection(currentIndex, -1);
    },
    onEnterBack: () => {
      observer.enable();
      gotoSection(currentIndex - 1, 1);
    },
  });
}

// Animate
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  clouds.material.uniforms.uTime.value = clock.getElapsedTime();
  renderer.render(scene, camera);
}
// window.onload = () => init();

// UTILS functions
function fitWindow(plane, camera, relativeZ = null) {
  const cameraZ = relativeZ !== null ? relativeZ : camera.position.z;
  const distance = cameraZ - plane.position.z;
  const vFov = (camera.fov * Math.PI) / 180;
  const scaleY = 2 * Math.tan(vFov / 2) * distance;
  const scaleX = scaleY * camera.aspect;

  plane.scale.set(scaleX, scaleY, 1);
}

function gotoSection(index, direction) {
  // make sure it's valid
  if (!steps.includes(index)) return;

  console.log(index);
  animating = true;
  let tl = gsap.timeline({
    defaults: { duration: 1.25, ease: "power1.inOut" },
    onComplete: () => (animating = false),
  });

  switch (index) {
    case -1:
      tl.to(".intro", { opacity: 0, y: 25, duration: 1, ease: "power2.out" });
      break;
    case 0:
      if (direction == 1) {
        tl.to(
          clouds.material.uniforms.uShift,
          {
            value: 0,
            duration: 2,
            ease: "power2.out",
          },
          "<"
        )
          .to(
            clouds.material.uniforms.uAlpha,
            {
              value: 1,
              duration: 2,
              ease: "power2.out",
            },
            "<"
          )
          .to(temple.position, { z: 4, duration: 3, ease: "power2.out" }, "<");
      }
      tl.to(".intro", {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        delay: direction == 1 ? -2 : 0,
      });
      break;
    case 1:
      if (direction == 1) {
        tl.to(".step2", { y: sizes.height, ease: "power2", duration: 1 });
      } else {
        tl.to(".intro", { opacity: 0, y: 25, duration: 1, ease: "power2.out" })
          .to(
            clouds.material.uniforms.uShift,
            {
              value: 1,
              duration: 2,
              ease: "power2.out",
            },
            "<"
          )
          .to(
            clouds.material.uniforms.uAlpha,
            {
              value: 0,
              duration: 2,
              ease: "power2.out",
            },
            "<"
          )
          .to(temple.position, { z: 0, duration: 3, ease: "power2.out" }, "<");
      }
      break;
    case 2:
      if (direction == 1) {
        tl.to(".step3", { y: sizes.height, ease: "power2", duration: 1 });
      } else {
        tl.to(".step2", { y: 0, ease: "power2", duration: 1 });
      }
      break;
    case 3:
      tl.to(".step3", {
        y: 0,
        ease: "power2",
        duration: 1,
      });
      break;
    case 4:
      observer.disable();
      break;
  }

  currentIndex = index;
}
