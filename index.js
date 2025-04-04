import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { TextureLoader } from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 50, 150);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Ground (Grass Field)
const groundGeometry = new THREE.PlaneGeometry(500, 500);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x2e7d32, side: THREE.DoubleSide });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(50, 100, 50);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Dome properties
const domeData = [
    { position: new THREE.Vector3(0, 30, 0), radius: 30, color: 0xa0d8ef },
    { position: new THREE.Vector3(-50, 30, 10), radius: 20, color: 0xd0e8af },
    { position: new THREE.Vector3(50, 30, 10), radius: 20, color: 0xfad1af }
];

const domes = [];
const hexagons = [];
const latticeMeshes = [];

// Function to create domes
function createDome({ position, radius, color }) {
    const geometry = new THREE.SphereGeometry(radius, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const material = new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
    const dome = new THREE.Mesh(geometry, material);
    dome.position.copy(position);
    scene.add(dome);
    domes.push(dome);

    const latticeGeometry = new THREE.WireframeGeometry(geometry);
    const latticeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const lattice = new THREE.LineSegments(latticeGeometry, latticeMaterial);
    lattice.position.copy(position);
    scene.add(lattice);
    latticeMeshes.push(lattice);

    return dome;
}

domeData.forEach(createDome);

// Function to create hexagonal tiles
function createHexagon(radius, height) {
    const shape = new THREE.Shape();
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    }
    shape.closePath();
    
    const extrudeSettings = { depth: height, bevelEnabled: false };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshStandardMaterial({ color: 0xdddddd, transparent: true, opacity: 0.6 });
    return new THREE.Mesh(geometry, material);
}

function placeHexagons(dome, radius) {
    const hexRadius = radius * 0.2;
    const hexHeight = 2;
    for (let lat = 0.2; lat <= 0.6; lat += 0.15) {
        const r = radius * Math.cos(lat * Math.PI);
        const y = radius * Math.sin(lat * Math.PI);
        for (let lon = 0; lon < Math.PI * 2; lon += Math.PI / 6) {
            const x = r * Math.cos(lon);
            const z = r * Math.sin(lon);
            const hex = createHexagon(hexRadius, hexHeight);
            hex.position.set(dome.position.x + x, dome.position.y + y, dome.position.z + z);
            hex.lookAt(dome.position);
            scene.add(hex);
            hexagons.push(hex);
        }
    }
}

domes.forEach((dome, index) => placeHexagons(dome, domeData[index].radius));

// OFFICE FURNITURE FUNCTIONS
function createTable(x, y, z, color = 0x8b4513) {
    const tableGeometry = new THREE.CylinderGeometry(2, 2, 0.8, 16);
    const tableMaterial = new THREE.MeshStandardMaterial({ color });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.set(x, y, z);
    scene.add(table);
    return table;
}

function createChair(x, y, z, color = 0x444444) {
    const chairGeometry = new THREE.BoxGeometry(1.2, 1.5, 1.2);
    const chairMaterial = new THREE.MeshStandardMaterial({ color });
    const chair = new THREE.Mesh(chairGeometry, chairMaterial);
    chair.position.set(x, y, z);
    scene.add(chair);
    return chair;
}

function createSmallPlant(x, y, z) {
    const potGeometry = new THREE.CylinderGeometry(0.5, 0.4, 0.6, 8);
    const potMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const pot = new THREE.Mesh(potGeometry, potMaterial);
    pot.position.set(x, y, z);
    scene.add(pot);
    
    const plantGeometry = new THREE.SphereGeometry(0.8, 6, 6);
    const plantMaterial = new THREE.MeshStandardMaterial({ color: 0x3a5f0b });
    const plant = new THREE.Mesh(plantGeometry, plantMaterial);
    plant.position.set(x, y + 0.5, z);
    scene.add(plant);
    
    return { pot, plant };
}

function createConcreteWall(startX, startZ, endX, endZ, y, height = 6) {
    const length = Math.sqrt((endX - startX)**2 + (endZ - startZ)**2);
    const angle = Math.atan2(endZ - startZ, endX - startX);
    
    const wallGeometry = new THREE.BoxGeometry(length, height, 0.3);
    
    // Concrete material with subtle roughness
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xf5f5dc, // Cream color
        roughness: 0.7,
        metalness: 0.1
    });
    
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(
        (startX + endX) / 2,
        y + height/2,
        (startZ + endZ) / 2
    );
    wall.rotation.y = angle;
    scene.add(wall);
    return wall;
}

// FLOOR AND SECTORED OFFICE SETUP
function createFloor(dome) {
    const radius = dome.geometry.parameters.radius * 0.8;
    const floorGeometry = new THREE.CircleGeometry(radius, 32);
    // Create wood texture material
    const textureLoader = new TextureLoader();
    const woodTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/hardwood2_diffuse.jpg');
    woodTexture.wrapS = THREE.RepeatWrapping;
    woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(4, 4); // Adjust tiling based on dome size
    
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        map: woodTexture,
        roughness: 0.8,
        metalness: 0.1,
        bumpScale: 0.05
    });
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(
        dome.position.x,
        dome.position.y - dome.geometry.parameters.radius * 0.1 + 0.1, // Slightly raised
        dome.position.z
    );
    floor.receiveShadow = true;
    scene.add(floor);

    const centerX = floor.position.x;
    const centerZ = floor.position.z;
    const floorY = floor.position.y;
    
    // Create 3 equal sectors (120° each)
    for (let i = 0; i < 3; i++) {
        const angle1 = (i / 3) * Math.PI * 2;
        const angle2 = ((i + 1) / 3) * Math.PI * 2;
        
        // Table position (midway in the sector)
        const tableAngle = angle1 + Math.PI / 3;
        const tableDist = radius * 0.5;
        const tableX = centerX + Math.cos(tableAngle) * tableDist;
        const tableZ = centerZ + Math.sin(tableAngle) * tableDist;
        
        // Create walls that stop SHORT of the table to prevent overlap
        const wallStartDist = radius * 0.2; // Walls start 20% from center
        const wallEndDist = radius * 0.85;  // Walls stop before tables
        
        createConcreteWall(
            centerX + Math.cos(angle1) * wallStartDist,
            centerZ + Math.sin(angle1) * wallStartDist,
            centerX + Math.cos(angle1) * wallEndDist,
            centerZ + Math.sin(angle1) * wallEndDist,
            floorY
        );
        
        const table = createTable(tableX, floorY + 0.8, tableZ);
        
        // Chairs around table
        for (let j = 0; j < 4; j++) {
            const chairAngle = tableAngle + (j / 4) * Math.PI * 2;
            createChair(
                tableX + Math.cos(chairAngle) * 3,
                floorY + 0.4,
                tableZ + Math.sin(chairAngle) * 3
            );
        }
        
        createSmallPlant(tableX, floorY + 1.2, tableZ);
    }

    return floor;
}

domes.forEach(createFloor);

// Render loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});