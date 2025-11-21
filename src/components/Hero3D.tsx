import styles from "./Hero3D.module.css";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function Hero3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 20);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    //resize based on canvas size
    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      renderer.setSize(width, height, false); //false - don't overwrite CSS size
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize(); //run once at start

    //orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; //smooth
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0); //look/focus at center
    controls.update();

    //lighting
    const pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(5, 5, 5);

    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight, ambientLight);

    const lightHelper = new THREE.PointLightHelper(pointLight);
    //const gridHelper = new THREE.GridHelper(200, 50);
    scene.add(lightHelper);

    //mesh
    const loader = new GLTFLoader();
    let product: THREE.Object3D | null = null;

    loader.load(
      "/Mesh.glb",
      (gltf) => {
        product = gltf.scene;
        product.scale.set(4, 4, 4);
        scene.add(product);

        //starting pose
        product.position.set(-10, -2, 0);
        product.rotation.set(0, 0, 0);

        //timeline with scroll
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".header",
            endTrigger: ".routine",
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            /*markers: true,*/
          },
        });

        //header -> ingredients
        tl.to(
          product.position,
          {
            x: 9,
            y: -2,
            z: 3,
            duration: 1,
            ease: "none",
          },
          0
        ).to(
          product.rotation,
          {
            x: 6.5,
            y: Math.PI / -1.5,
            z: 0,
            duration: 1,
            ease: "none",
          },
          0
        );

        //ingredients -> routine
        tl.to(
          product.position,
          {
            x: 8,
            y: 4,
            z: 0,
            duration: 1,
            ease: "none",
          },
          1
        ).to(
          product.rotation,
          {
            x: 7.5,
            y: 0,
            z: 2,
            duration: 1,
            ease: "none",
          },
          1
        );
      },
      undefined,
      (error) => [console.error("Error loading product mesh: ", error)]
    );

    let frameId: number;

    function animate() {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      gsap.killTweensOf(product);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <div className={styles.wrapper}>
        <canvas id="bg" ref={canvasRef} className={styles.canvas} />
      </div>
    </>
  );
}

export default Hero3D;
