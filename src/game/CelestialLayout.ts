import * as THREE from 'three';

/** Fit the complete planet, atmosphere and rings within the sky, not the floor. */
export function fitCelestialToSky(root:THREE.Object3D,camera:THREE.PerspectiveCamera):void {
  const planet=root.getObjectByName('earth'),halo=root.getObjectByName('atmosphere');
  if(!planet||!halo)return;
  camera.updateMatrixWorld();
  const horizon=new THREE.Vector3(camera.position.x,camera.position.y,-10000).project(camera).y;
  const bottom=horizon+.08,top=.94,target=(bottom+top)/2;
  const box=new THREE.Box3(),other=new THREE.Box3(),point=new THREE.Vector3();
  const projectedBounds=()=>{
    root.updateMatrixWorld(true);box.setFromObject(planet).union(other.setFromObject(halo));
    let min=Infinity,max=-Infinity;
    for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){point.set(x,y,z).project(camera);min=Math.min(min,point.y);max=Math.max(max,point.y);}
    return {min,max};
  };
  for(let i=0;i<6;i++){
    let bounds=projectedBounds();
    const shrink=Math.min(1,(top-bottom)/(bounds.max-bounds.min)*.96);
    if(shrink<1){planet.scale.multiplyScalar(shrink);halo.scale.multiplyScalar(shrink);bounds=projectedBounds();}
    const worldPerNdc=(camera.position.z-planet.position.z)*Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
    const offset=(target-(bounds.min+bounds.max)/2)*worldPerNdc;
    planet.position.y+=offset;halo.position.y+=offset;
  }
  root.updateMatrixWorld(true);
}
