---
name: threejs-3d-math
description: Guidelines for rendering 3D mathematical surfaces, polyhedra, vector fields, and camera rotation animations using Three.js in Remotion.
---

# Three.js 3D Math Skill

This skill outlines how to build 3D mathematical surfaces, space curves, vectors, and rotating camera views in Remotion using Three.js.

## 1. Setting up `@remotion/three`
Use Remotion's Three.js integration component `<ThreeCanvas>`:

```tsx
import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame, useVideoConfig } from "remotion";

export const Math3DScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Camera rotation based on frame
  const cameraAngle = (frame / 150) * Math.PI * 2;
  const cameraX = Math.sin(cameraAngle) * 10;
  const cameraZ = Math.cos(cameraAngle) * 10;

  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{ position: [cameraX, 5, cameraZ], fov: 50 }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      {/* 3D Polyhedron / Surface Mesh */}
      <mesh>
        <boxGeometry args={[3, 3, 3]} />
        <meshStandardMaterial color="#38bdf8" wireframe />
      </mesh>
    </ThreeCanvas>
  );
};
```

## 2. Dynamic 3D Surface Parametric Plotting
Generate 3D mesh geometry for parametric surface equations $z = f(x, y) = \sin(x) \cdot \cos(y)$:

```tsx
import * as THREE from "three";

const createSurfaceGeometry = () => {
  const geometry = new THREE.PlaneGeometry(10, 10, 50, 50);
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = Math.sin(x) * Math.cos(y);
    pos.setZ(i, z);
  }
  geometry.computeVertexNormals();
  return geometry;
};
```
