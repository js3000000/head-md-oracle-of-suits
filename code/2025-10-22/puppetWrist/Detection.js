function getWristPosition(results, width, height) {
  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
    return null; // No hand detected
  }

  const wrist = results.multiHandLandmarks[0][0]; // Landmark 0 = wrist

  const aspect = width / height;

  // Convert normalized (0–1) to world coordinates (approximate):
  const x = -((wrist.x - 0.5) * 2 * aspect); // Inverted X
  const y = -(wrist.y - 0.5) * 2;            // Inverted Y
  const z = (wrist.z - 0.5) * 2;             // Optional Z scaling

  return new THREE.Vector3(x, y, z);
}
