import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import styles from "./Hero3D.module.css";

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
    camera.position.set(0, 0,20);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;

    

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
    const gridHelper = new THREE.GridHelper(200, 50);
    scene.add(lightHelper, gridHelper);

    //mesh
    const loader = new GLTFLoader();
    let product = null;

    loader.load(
      "/Mesh.glb",
      (gltf) => {
        product = gltf.scene;

        product.position.set(0, -2, 0);
        product.rotation.set(0,-20,0)
        product.scale.set(4, 4, 4);

        scene.add(product);
      },
      undefined,
      (error) => [console.error("Error loading ghost mesh: ", error)]
    );

    let frameId: number;

    function animate() {
      frameId = requestAnimationFrame(animate);

      /*if (product) {
        product.rotation.y += 0.005;
      }*/

      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
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
