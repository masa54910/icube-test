import * as THREE from 'three';
import type {BackgroundPreset} from './CorrectSceneVariants';

const vertex='varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
const noise=`float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){return noise(p)*.53+noise(p*2.03)*.27+noise(p*4.07)*.13+noise(p*8.1)*.07;}`;

/** One shared scene recipe: small procedural shaders, no background image downloads. */
export function buildCelebrationBackdrop(preset:BackgroundPreset):THREE.Group {
  const root=new THREE.Group();root.name='variant-backdrop';root.userData.preset=preset.id;
  const sky=new THREE.Mesh(new THREE.SphereGeometry(220,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,
    uniforms:{base:{value:new THREE.Color(preset.sky)},tint:{value:new THREE.Color(preset.nebula)},mode:{value:preset.space}},vertexShader:vertex,
    fragmentShader:`varying vec3 p;uniform vec3 base,tint;uniform float mode;${noise}
    void main(){vec3 n=normalize(p);float front=1.-smoothstep(-.2,.1,n.z);vec3 c=base*(.45+.7*max(0.,1.-n.y));
    float grain=fbm(n*24.);float band=exp(-pow(n.y-.27+.52*(n.x+.38),2.)*150.);float side=exp(-pow(n.x+.38,2.)*4.);
    float cloud=band*side*smoothstep(.25,.8,grain)*front;
    if(mode<2.5)c+=tint*cloud*.75+vec3(.20,.31,.42)*pow(cloud,2.);
    if(mode>.5&&mode<1.5){float neb=exp(-pow(n.x+.35,2.)*6.-pow(n.y-.31,2.)*4.)*front;float f=fbm(n*8.+vec3(7.));c+=neb*(tint*smoothstep(.33,.66,f)*.8+vec3(.35,.08,.5)*smoothstep(.52,.75,grain)*.6);}
    if(mode>1.5&&mode<2.5){float sun=length((n.xy-vec2(-.28,.065))*vec2(1.,1.7));c+=front*(vec3(1.,.42,.23)*exp(-sun*17.)*.7+vec3(1.,.84,.68)*exp(-sun*130.)*1.3);c+=tint*exp(-pow(n.y-.04,2.)*150.)*.16;}
    if(mode>2.5){vec2 q=(n.xy-vec2(-.18,.13))*vec2(1.,1.35);float r=length(q),a=atan(q.y,q.x);float arms=pow(.5+.5*cos(a*2.-r*65.),6.);float disk=exp(-r*12.);c+=front*(tint*disk*(.2+arms*1.5)*(.5+grain)+vec3(.95,.77,1.)*exp(-r*60.)*1.5);}
    gl_FragColor=vec4(c,1.);}`}));root.add(sky);
  let seed=713;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const positions=[];for(let i=0;i<1800;i++)positions.push((random()-.5)*170,random()*70+4,-25-random()*60);
  const stars=new THREE.BufferGeometry();stars.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  root.add(new THREE.Points(stars,new THREE.PointsMaterial({color:0xdceeff,size:.075,sizeAttenuation:true,transparent:true,opacity:.75})));
  const sphere=new THREE.SphereGeometry(1,40,28);
  const planetMaterial=new THREE.ShaderMaterial({uniforms:{tint:{value:new THREE.Color(preset.planet)},kind:{value:preset.kind}},vertexShader:vertex,
    fragmentShader:`varying vec3 p;uniform vec3 tint;uniform float kind;${noise}
    void main(){vec3 n=normalize(p);float detail=fbm(n*9.),light=.07+.93*max(0.,dot(n,normalize(vec3(-1.,.7,1.5))));vec3 c=tint;
    if(kind<.5){float land=fbm(n*3.8+vec3(3.,2.,1.));c=mix(vec3(.015,.08,.26),vec3(.13,.26,.19),smoothstep(.49,.54,land));float cloud=smoothstep(.54,.72,fbm(n*18.));c=mix(c,vec3(.88,.95,1.),cloud*.85);}
    else if(kind<1.5){c=tint*(.5+detail);c+=vec3(.10,.13,.2)*pow(detail,3.);}
    else if(kind<2.5){float crater=pow(1.-abs(noise(n*23.)*2.-1.),9.);c=tint*(.5+detail*.6-crater*.2);}
    else{float bands=.5+.5*sin(n.y*42.+detail*7.);c=tint*mix(.48,1.12,bands)+vec3(.09,.065,.04)*noise(n*16.);}
    float rim=pow(1.-abs(n.z),4.);c=c*light+mix(tint,vec3(.35,.65,1.),.4)*rim*.5;gl_FragColor=vec4(c,1.);}`});
  const globe=new THREE.Mesh(sphere,planetMaterial);globe.name='earth';
  const radius=preset.id==='A'?7:preset.id==='B'?11:preset.id==='C'?12:preset.id==='D'?7:preset.id==='E'||preset.id==='F'?3:9;
  globe.scale.setScalar(radius);globe.position.set(11,preset.id==='C'?9:12,-45);root.add(globe);
  const halo=new THREE.Mesh(new THREE.SphereGeometry(1.035,32,20),new THREE.MeshBasicMaterial({color:preset.light,transparent:true,opacity:.09,side:THREE.BackSide}));halo.name='atmosphere';halo.position.copy(globe.position);halo.scale.copy(globe.scale);root.add(halo);
  if(preset.ring){
    const ring=new THREE.Mesh(new THREE.RingGeometry(1.3,1.95,80,1),new THREE.ShaderMaterial({side:THREE.DoubleSide,transparent:true,depthWrite:false,uniforms:{tint:{value:new THREE.Color(preset.id==='H'?0xdcc3ae:0x8bddff)}},vertexShader:vertex,
      fragmentShader:'varying vec3 p;uniform vec3 tint;void main(){float r=length(p.xy);float bands=.55+.2*sin(r*180.)+.16*sin(r*71.);float edge=smoothstep(1.3,1.34,r)*(1.-smoothstep(1.88,1.95,r));gl_FragColor=vec4(tint*bands,edge*.65);}'}));
    ring.material.forceSinglePass=true;ring.rotation.x=1.10;ring.rotation.y=.18;ring.rotation.z=-.25;ring.name='planet-ring';globe.add(ring);
  }
  const moonMaterial=new THREE.MeshStandardMaterial({color:0xa3aec4,roughness:1});
  const moonGeometry=preset.moons?new THREE.SphereGeometry(1,12,8):null;
  for(let i=0;i<preset.moons;i++){const moon=new THREE.Mesh(moonGeometry!,moonMaterial);moon.scale.setScalar(1.2+i*.6);moon.position.set(-10+i*16,13+i*6,-40-i*4);root.add(moon);}
  if(preset.asteroids){
    const rocks=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),moonMaterial,44),m=new THREE.Matrix4(),q=new THREE.Quaternion(),s=new THREE.Vector3();
    for(let i=0;i<44;i++){const k=.13+random()*.58;s.set(k,k*.7,k*.85);q.setFromEuler(new THREE.Euler(random()*6,random()*6,0));m.compose(new THREE.Vector3((random()-.5)*70,6+random()*18,-40-random()*25),q,s);rocks.setMatrixAt(i,m);}rocks.name='asteroid-belt';root.add(rocks);
  }
  return root;
}
