import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const smooth = (a: number, b: number, t: number) => {
  const u = THREE.MathUtils.clamp((t - a) / (b - a), 0, 1);
  return u * u * (3 - 2 * u);
};
const mix = THREE.MathUtils.lerp;

/** Original illustrative geometry. Dimensions and motion are not validated engineering. */
export function createMachineScene(host: HTMLDivElement) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
  renderer.setClearColor(0x080a0d, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, 0.05, 70);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.7;
  room.dispose();
  const materials: THREE.Material[] = [];
  const mat = (p: THREE.MeshStandardMaterialParameters) => {
    const m = new THREE.MeshStandardMaterial(p);
    materials.push(m);
    return m;
  };
  const silver = mat({ color: 0x9faab3, metalness: 0.94, roughness: 0.28 });
  const edge = mat({ color: 0xc5cdd3, metalness: 0.96, roughness: 0.2 });
  const black = mat({ color: 0x151a21, metalness: 0.7, roughness: 0.28 });
  const rubber = mat({ color: 0x080b10, roughness: 0.65 });
  const white = mat({ color: 0xe3e9ec, roughness: 0.28, metalness: 0.1 });
  const blue = mat({ color: 0x154586, metalness: 0.25, roughness: 0.24 });
  const tipMat = new THREE.MeshPhysicalMaterial({
    color: 0xd4edf4,
    metalness: 0,
    roughness: 0.14,
    transparent: true,
    opacity: 0.64,
    clearcoat: 1,
    depthWrite: false,
  });
  materials.push(tipMat);
  const liquid = mat({
    color: 0x53c5ee,
    emissive: 0x0f5a83,
    emissiveIntensity: 0.45,
    roughness: 0.16,
    metalness: 0.1,
  });
  const model = new THREE.Group();
  scene.add(model);
  function mesh(
    g: THREE.BufferGeometry,
    m: THREE.Material,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D = model,
  ) {
    const o = new THREE.Mesh(g, m);
    o.position.set(x, y, z);
    o.castShadow = true;
    o.receiveShadow = true;
    parent.add(o);
    return o;
  }
  function box(
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    m: THREE.Material = silver,
    parent: THREE.Object3D = model,
    r = 0.025,
  ) {
    return mesh(
      new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 4, h / 4, d / 4)),
      m,
      x,
      y,
      z,
      parent,
    );
  }
  const cylinder = (
    r: number,
    h: number,
    x: number,
    y: number,
    z: number,
    m: THREE.Material,
    parent: THREE.Object3D = model,
  ) => mesh(new THREE.CylinderGeometry(r, r, h, 20), m, x, y, z, parent);
  box(4.5, 0.22, 3.35, 0, 0.28, 0, black, model, 0.07);
  box(4.34, 0.055, 3.2, 0, 0.42, 0, silver);
  box(4.3, 0.09, 0.06, 0, 0.26, 1.67, edge);
  // Four feet and structural extrusions, with recessed channels on each visible face.
  for (const x of [-2.02, 2.02])
    for (const z of [-1.38, 1.38]) {
      cylinder(0.15, 0.18, x, 0.1, z, rubber);
      cylinder(0.13, 0.07, x, 0.205, z, edge);
      box(0.17, 2.72, 0.17, x, 1.83, z, silver);
      box(0.025, 2.56, 0.012, x, 1.83, z + 0.088, black);
      box(0.012, 2.56, 0.025, x + 0.088, 1.83, z, black);
      box(0.32, 0.07, 0.32, x, 0.49, z, edge);
      box(0.3, 0.07, 0.3, x, 3.17, z, edge);
    }
  for (const z of [-1.38, 1.38]) {
    box(4.2, 0.17, 0.18, 0, 3.05, z, silver);
    box(4.02, 0.032, 0.02, 0, 3.055, z + 0.1, black);
  }
  for (const x of [-2.02, 2.02]) {
    box(0.18, 0.17, 2.8, x, 3.05, 0, silver);
    cylinder(0.038, 2.65, x, 3.18, 0, edge).rotation.x = Math.PI / 2;
  }
  // Small machined brackets and dark hexagonal fasteners.
  for (const x of [-2.02, 2.02])
    for (const z of [-1.38, 1.38]) {
      box(0.29, 0.37, 0.09, x, 2.91, z + 0.12, black);
      for (const y of [2.8, 3.03]) {
        const screw = mesh(
          new THREE.CylinderGeometry(0.043, 0.043, 0.025, 6),
          edge,
          x,
          y,
          z + 0.18,
        );
        screw.rotation.x = Math.PI / 2;
      }
    }
  const gantry = new THREE.Group();
  model.add(gantry);
  box(4.05, 0.25, 0.22, 0, 2.83, 0, silver, gantry);
  box(3.9, 0.035, 0.018, 0, 2.85, 0.125, black, gantry);
  box(3.9, 0.035, 0.018, 0, 2.78, 0.125, edge, gantry);
  for (const x of [-1.94, 1.94])
    box(0.25, 0.34, 0.5, x, 2.84, 0, black, gantry);
  const carriage = new THREE.Group();
  gantry.add(carriage);
  box(0.47, 0.61, 0.4, 0, 2.57, 0.16, silver, carriage, 0.055);
  box(0.34, 0.38, 0.02, 0, 2.62, 0.373, black, carriage);
  box(0.05, 0.14, 0.015, 0.1, 2.66, 0.388, liquid, carriage);
  for (const x of [-0.17, 0.17])
    for (const y of [2.35, 2.79]) {
      const screw = mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.022, 6),
        edge,
        x,
        y,
        0.378,
        carriage,
      );
      screw.rotation.x = Math.PI / 2;
    }
  // Vertical slide and motor, distinct from the moving pipette body.
  box(0.18, 0.83, 0.17, 0, 2.95, 0.08, black, carriage);
  box(0.28, 0.28, 0.28, 0, 3.36, 0.07, black, carriage);
  cylinder(0.045, 0.06, 0, 3.52, 0.07, edge, carriage);
  // Telescoping guide rods maintain a physical connection during the Z stroke.
  for (const x of [-0.065, 0.065])
    cylinder(0.023, 0.66, x, 2.08, 0.18, edge, carriage);
  const pipette = new THREE.Group();
  carriage.add(pipette);
  cylinder(0.115, 0.63, 0, 2.02, 0.18, white, pipette);
  cylinder(0.13, 0.12, 0, 2.29, 0.18, edge, pipette);
  cylinder(0.085, 0.18, 0, 1.64, 0.18, edge, pipette);
  const tipGeometry = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.006, 0),
      new THREE.Vector2(0.017, 0.1),
      new THREE.Vector2(0.045, 0.4),
      new THREE.Vector2(0.058, 0.43),
    ],
    24,
  );
  const tip = mesh(tipGeometry, tipMat, 0, 1.14, 0.18, pipette);
  const tipLiquid = mesh(
    new THREE.CylinderGeometry(0.012, 0.005, 0.19, 16),
    liquid,
    0,
    1.265,
    0.18,
    pipette,
  );
  tipLiquid.visible = false;
  // The cable chain is a sequence of short, rounded links that follows the carriage.
  const cable = new THREE.Group();
  gantry.add(cable);
  const chainLinks = Array.from({ length: 25 }, () =>
    box(0.14, 0.12, 0.15, 0, 0, 0, rubber, cable, 0.025),
  );
  // A white plate with exactly 8 x 12 recessed rings, and separately animated liquid surfaces.
  const plateX = 0.47,
    plateZ = 0.47;
  box(1.78, 0.11, 1.23, plateX, 0.52, plateZ, black);
  box(1.68, 0.13, 1.13, plateX, 0.625, plateZ, white, model, 0.045);
  const wellGeo = new THREE.TorusGeometry(0.046, 0.009, 7, 16);
  const wellBase = new THREE.CylinderGeometry(0.037, 0.037, 0.012, 16);
  const wells = new THREE.InstancedMesh(wellGeo, white, 96);
  const recess = new THREE.InstancedMesh(wellBase, black, 96);
  const matrix = new THREE.Object3D();
  for (let row = 0; row < 8; row++)
    for (let col = 0; col < 12; col++) {
      const i = row * 12 + col;
      matrix.position.set(
        plateX + (col - 5.5) * 0.132,
        0.698,
        plateZ + (row - 3.5) * 0.132,
      );
      matrix.rotation.set(Math.PI / 2, 0, 0);
      matrix.updateMatrix();
      wells.setMatrixAt(i, matrix.matrix);
      matrix.position.y = 0.692;
      matrix.rotation.set(0, 0, 0);
      matrix.updateMatrix();
      recess.setMatrixAt(i, matrix.matrix);
    }
  model.add(wells, recess);
  const source = { x: plateX - 3.5 * 0.132, z: plateZ - 1.5 * 0.132 };
  const destination = { x: plateX + 3.5 * 0.132, z: plateZ + 1.5 * 0.132 };
  const sourceLiquid = cylinder(0.035, 0.012, source.x, 0.7, source.z, liquid);
  const destinationLiquid = cylinder(
    0.035,
    0.012,
    destination.x,
    0.7,
    destination.z,
    liquid,
  );
  destinationLiquid.scale.setScalar(0.01);
  // Tip rack, with fine translucent disposable tips.
  box(0.9, 0.24, 1.17, -1.08, 0.57, 0.43, blue);
  box(0.95, 0.035, 1.22, -1.08, 0.71, 0.43, white);
  const rackTips = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.027, 0.015, 0.24, 9),
    tipMat,
    48,
  );
  for (let row = 0; row < 8; row++)
    for (let col = 0; col < 6; col++) {
      matrix.position.set(
        -1.08 + (col - 2.5) * 0.13,
        0.84,
        0.43 + (row - 3.5) * 0.13,
      );
      matrix.rotation.set(0, 0, 0);
      matrix.updateMatrix();
      rackTips.setMatrixAt(row * 6 + col, matrix.matrix);
    }
  model.add(rackTips);
  // Recessed disposal opening with a polished rim.
  box(0.59, 0.03, 0.8, 1.62, 0.47, 0.6, black);
  for (const x of [1.31, 1.93]) box(0.035, 0.045, 0.85, x, 0.5, 0.6, edge);
  for (const z of [0.19, 1.01]) box(0.65, 0.045, 0.035, 1.62, 0.5, z, edge);
  // Tiny deck mounting holes provide scale without adding clutter.
  for (const x of [-1.65, -0.55, 0.55, 1.65])
    for (const z of [-1.08, 1.08]) cylinder(0.025, 0.008, x, 0.452, z, black);
  const badge = box(0.65, 0.08, 0.012, 0, 0.29, 1.697, black);
  // Soft contact shadow and a dark studio floor.
  const floor = mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshBasicMaterial({ color: 0x080b10, toneMapped: false }),
    0,
    -0.015,
    0,
    scene,
  );
  floor.rotation.x = -Math.PI / 2;
  floor.castShadow = false;
  materials.push(floor.material);
  const contactMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
  materials.push(contactMaterial);
  const contact = mesh(
    new THREE.PlaneGeometry(12, 12),
    contactMaterial,
    0,
    -0.01,
    0,
    scene,
  );
  contact.rotation.x = -Math.PI / 2;
  contact.castShadow = false;
  const key = new THREE.DirectionalLight(0xe8f1ff, 3.8);
  key.position.set(-3, 7, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -5;
  key.shadow.camera.right = 5;
  key.shadow.camera.top = 5;
  key.shadow.camera.bottom = -5;
  key.shadow.normalBias = 0.025;
  key.shadow.bias = -0.0001;
  key.shadow.radius = 4;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x8cbfff, 3);
  rim.position.set(4, 4, -4);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 1.4);
  fill.position.set(3, 2, 5);
  scene.add(fill);
  const accent = new THREE.PointLight(0x1e7fa8, 6, 8);
  accent.position.set(-2, 1, -2);
  scene.add(accent);

  let width = 1,
    height = 1,
    progress = 0;
  const resize = () => {
    width = host.clientWidth;
    height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    draw(progress);
  };
  const target = new THREE.Vector3();
  function draw(p: number) {
    progress = p;
    const mobile = width < 700;
    const reveal = smooth(0, 0.15, p),
      pickup = smooth(0.18, 0.29, p),
      lift = smooth(0.31, 0.37, p),
      travel = smooth(0.39, 0.56, p),
      down = smooth(0.59, 0.67, p),
      dispense = smooth(0.68, 0.75, p),
      retract = smooth(0.77, 0.84, p),
      finish = smooth(0.87, 1, p);
    carriage.position.x = mix(source.x, destination.x, travel);
    gantry.position.z = mix(source.z, destination.z, travel) - 0.18;
    // Tip end reaches liquid level, then rises before the horizontal travel.
    pipette.position.y =
      -0.43 * pickup + 0.43 * lift - 0.43 * down + 0.43 * retract;
    tipLiquid.visible = p > 0.28 && p < 0.76;
    tipLiquid.scale.y = Math.max(0.02, (1 - dispense) * smooth(0.27, 0.32, p));
    sourceLiquid.scale.setScalar(mix(1, 0.35, smooth(0.27, 0.33, p)));
    destinationLiquid.scale.setScalar(mix(0.01, 1, dispense));
    tip.material = tipMat;
    for (let i = 0; i < chainLinks.length; i++) {
      const t = i / (chainLinks.length - 1);
      const end = carriage.position.x;
      chainLinks[i].position.set(
        mix(-1.8, end, t),
        3.05 + Math.sin(Math.PI * t) * 0.42,
        -0.16,
      );
      chainLinks[i].rotation.z = Math.cos(Math.PI * t) * 0.27;
    }
    const close = smooth(0.13, 0.36, p) * (1 - finish);
    const angle = mix(0.46, -0.24, smooth(0.34, 0.82, p));
    const baseDistance =
      (mobile ? 11.3 : 8.8) / Math.min(1, camera.aspect * 0.98);
    const distance = mix(
      baseDistance,
      mobile ? baseDistance * 0.86 : 7.6,
      close,
    );
    target.set(
      mix(0, 0.12, close),
      mix(1.65, 1.35, close),
      mix(0, 0.32, close),
    );
    camera.position.set(
      Math.sin(angle) * distance,
      mix(4.6, 4.1, close),
      Math.cos(angle) * distance,
    );
    camera.lookAt(target);
    key.intensity = mix(2.5, 3.8, reveal);
    rim.intensity = mix(2, 3.3, reveal);
    renderer.render(scene, camera);
    // Visible, testable semantic state; no per-frame React state updates.
    host.dataset.phase =
      p < 0.17
        ? "overview"
        : p < 0.38
          ? "aspirate"
          : p < 0.6
            ? "travel"
            : p < 0.8
              ? "dispense"
              : "complete";
    host.dataset.progress = p.toFixed(3);
    host.dataset.carriageX = carriage.position.x.toFixed(3);
    host.dataset.pipetteY = pipette.position.y.toFixed(3);
    host.dataset.wells = "96";
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  return {
    draw,
    dispose() {
      observer.disconnect();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose();
      });
      materials.forEach((m) => m.dispose());
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      void badge;
    },
  };
}
