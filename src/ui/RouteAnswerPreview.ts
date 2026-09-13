import * as T from 'three';
import type {ShapeChoice} from '../types';
export const ROUTE_VIEW_DIRECTION=new T.Vector3(12,38,18).normalize();
/** Fit actual projected cube vertices; all candidates share one scale. */
export function routeViewLayout(choices:readonly ShapeChoice[]){
 const right=new T.Vector3().crossVectors(new T.Vector3(0,1,0),ROUTE_VIEW_DIRECTION).normalize(),up=new T.Vector3().crossVectors(ROUTE_VIEW_DIRECTION,right);
 let halfHeight=0;
 const centers=choices.map(choice=>{
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;const bounds=new T.Box3();
  for(const [x,y,z] of choice.voxels)for(const dx of [-.5,.5])for(const dy of [-.5,.5])for(const dz of [-.5,.5]){const p=new T.Vector3(x+dx,y+dy,z+dz);bounds.expandByPoint(p);const px=p.dot(right),py=p.dot(up);minX=Math.min(minX,px);maxX=Math.max(maxX,px);minY=Math.min(minY,py);maxY=Math.max(maxY,py);}
  halfHeight=Math.max(halfHeight,(maxY-minY)/2,(maxX-minX)/3);
  const center=right.clone().multiplyScalar((minX+maxX)/2).addScaledVector(up,(minY+maxY)/2);center.addScaledVector(ROUTE_VIEW_DIRECTION,bounds.getCenter(new T.Vector3()).dot(ROUTE_VIEW_DIRECTION));return center;
 });
 return {centers,halfHeight:halfHeight*1.08,right,up};
}
/** No per-choice rotation or geometry mutation. */
export function drawRouteChoices(choices:readonly ShapeChoice[],canvases:readonly HTMLCanvasElement[]):void {
 const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,alpha:true});renderer.setSize(300,200);renderer.setPixelRatio(1);
 const geometry=new T.BoxGeometry(.95,.95,.95),material=new T.MeshLambertMaterial({color:0xf3f8ff});const scene=new T.Scene();scene.add(new T.HemisphereLight(0xffffff,0x486080,2));const key=new T.DirectionalLight(0xffffff,2);key.position.set(-4,8,6);scene.add(key);
 const layout=routeViewLayout(choices),camera=new T.OrthographicCamera(-layout.halfHeight*1.5,layout.halfHeight*1.5,layout.halfHeight,-layout.halfHeight,.1,500);camera.position.copy(ROUTE_VIEW_DIRECTION).multiplyScalar(150);camera.lookAt(0,0,0);
 try{choices.forEach((choice,i)=>{const mesh=new T.InstancedMesh(geometry,material,choice.voxels.length),center=layout.centers[i]!,matrix=new T.Matrix4();choice.voxels.forEach(([x,y,z],j)=>mesh.setMatrixAt(j,matrix.makeTranslation(x-center.x,y-center.y,z-center.z)));scene.add(mesh);renderer.render(scene,camera);const canvas=canvases[i],ctx=canvas?.getContext('2d');if(ctx){ctx.clearRect(0,0,300,200);ctx.drawImage(renderer.domElement,0,0);}scene.remove(mesh);mesh.dispose();});}finally{geometry.dispose();material.dispose();renderer.dispose();renderer.forceContextLoss();}
}
