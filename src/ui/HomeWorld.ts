import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

const noise=`float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.;float a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(7.1,2.7);a*=.5;}return v;}`;

/** Independent Home set: never imports or mutates gameplay/celebration objects. */
export class HomeWorld {
  readonly scene=new THREE.Scene();
  readonly cross=new THREE.Group();
  readonly reflection=new THREE.Group();
  readonly earth:THREE.Mesh;
  readonly atmosphere:THREE.Mesh;
  readonly floor:THREE.Mesh<THREE.PlaneGeometry,THREE.ShaderMaterial>;
  constructor(){
    this.scene.add(new THREE.HemisphereLight(0xe9fbff,0x667e9c,2.2));
    const key=new THREE.DirectionalLight(0xfffaf4,3.2);key.position.set(-5,9,6);this.scene.add(key);
    const rim=new THREE.DirectionalLight(0x60dcff,2.1);rim.position.set(4,5,-6);this.scene.add(rim);
    const sky=new THREE.Mesh(new THREE.SphereGeometry(240,24,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,
      vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:`varying vec3 p;${noise}void main(){vec3 n=normalize(p);vec2 q=n.xy;float band=exp(-pow(q.y-.32+.70*(q.x+.26),2.)*130.);float fade=exp(-pow(q.x+.36,2.)*6.);float cloud=fbm(q*48.);float fine=fbm(q*119.);float galaxy=band*fade*smoothstep(.28,.74,cloud);vec3 c=mix(vec3(.055,.12,.21),vec3(.004,.012,.034),smoothstep(-.09,.5,n.y));c+=galaxy*mix(vec3(.07,.12,.25),vec3(.27,.17,.33),fine);c+=pow(galaxy,2.)*vec3(.25,.32,.40);gl_FragColor=vec4(c,1.);}`
    }));sky.name='home-galaxy-space';this.scene.add(sky);
    let seed=417;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    const starPositions:number[]=[];for(let i=0;i<1150;i++)starPositions.push((rand()-.5)*230,rand()*100+5,-45-rand()*80);
    for(let i=0;i<330;i++){const x=-rand()*65-5;starPositions.push(x,16-(x+25)*.67+(rand()-.5)*10,-90);}
    const stars=new THREE.BufferGeometry();stars.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));
    const points=new THREE.Points(stars,new THREE.PointsMaterial({color:0xccdff9,size:.14,transparent:true,opacity:.85,depthWrite:false}));points.name='home-stars';this.scene.add(points);
    this.floor=new THREE.Mesh(new THREE.PlaneGeometry(800,800),new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{crossX:{value:0}},
      vertexShader:'varying vec2 p;void main(){p=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:`varying vec2 p;uniform float crossX;void main(){float d=length(p-vec2(crossX,0.));float mist=exp(-abs(p.y)*.013);float sheen=pow(.5+.5*sin(p.y*.6+p.x*.05),8.)*.012;vec3 base=mix(vec3(.83,.89,.95),vec3(.95,.975,1.),mist)+sheen;float ring=exp(-pow((d-2.45)*22.,2.))+.45*exp(-pow((d-2.7)*22.,2.));base=mix(base,vec3(.35,.88,1.),ring*.55);base+=exp(-d*d*.19)*vec3(.02,.04,.05);gl_FragColor=vec4(base,.94);}`
    }));this.floor.name='home-white-planet';this.floor.rotation.x=-Math.PI/2;this.floor.renderOrder=2;this.scene.add(this.floor);
    const geometry=new RoundedBoxGeometry(1.36,1.36,1.36,2,.055);
    const material=new THREE.MeshStandardMaterial({color:0xf8fcff,roughness:.24,metalness:.13});
    const edges=new THREE.EdgesGeometry(new THREE.BoxGeometry(1.37,1.37,1.37));
    const edgeMaterial=new THREE.LineBasicMaterial({color:0x7bdaec,transparent:true,opacity:.48});
    this.cross.name='home-seven-cube-cross';
    for(const [x,y,z] of [[0,0,0],[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]){
      const cube=new THREE.Mesh(geometry,material);cube.position.set(x!*1.45,y!*1.45,z!*1.45);cube.add(new THREE.LineSegments(edges,edgeMaterial));this.cross.add(cube);
      const mirror=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:0x96b9d4,transparent:true,opacity:.32,depthWrite:false}));mirror.position.copy(cube.position);this.reflection.add(mirror);
    }
    this.cross.rotation.set(.40,.50,.02);this.scene.add(this.cross,this.reflection);
    this.earth=new THREE.Mesh(new THREE.SphereGeometry(4,40,28),new THREE.ShaderMaterial({uniforms:{land:{value:earthMask()}},
      vertexShader:'varying vec3 n;void main(){n=normal;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:`uniform sampler2D land;varying vec3 n;${noise}void main(){vec3 v=normalize(n);vec2 uv=vec2(atan(v.x,v.z)/6.2831853+.5,asin(v.y)/3.14159265+.5);float mask=texture2D(land,uv).r;vec3 ocean=mix(vec3(.015,.075,.19),vec3(.04,.26,.43),fbm(uv*18.));vec3 ground=mix(vec3(.14,.27,.25),vec3(.40,.43,.29),fbm(uv*33.));vec3 c=mix(ocean,ground,mask);float cloud=smoothstep(.51,.71,fbm(uv*73.+vec2(fbm(uv*20.)*2.,0.)));c=mix(c,vec3(.85,.93,.99),cloud*.83);float light=.19+.81*max(0.,dot(v,normalize(vec3(-.8,.7,1.))));float rim=pow(1.-abs(v.z),3.);gl_FragColor=vec4(c*light+rim*vec3(.06,.27,.54),1.);}`
    }));this.earth.name='home-earth';this.scene.add(this.earth);
    this.atmosphere=new THREE.Mesh(new THREE.SphereGeometry(4.10,32,20),new THREE.MeshBasicMaterial({color:0x59b9f8,transparent:true,opacity:.16,side:THREE.BackSide,depthWrite:false}));this.scene.add(this.atmosphere);
    // Original distant silhouettes; independent from the protected stage data.
    const forms=[[[0,0],[0,1],[0,2],[1,2]],[[0,0],[1,0],[1,1],[1,2],[2,2]],[[0,0],[0,1],[0,2],[1,0],[1,2]],[[0,0],[0,1],[1,1],[2,1],[2,0]],[[0,0],[1,0],[2,0],[2,1],[2,2]]];
    const buildings=new THREE.InstancedMesh(new THREE.BoxGeometry(.7,.7,.7),new THREE.MeshBasicMaterial({color:0xf3f9ff,transparent:true,opacity:.65}),forms.reduce((s,f)=>s+f.length,0)*2);
    buildings.name='home-distant-buildings';let index=0;const matrix=new THREE.Matrix4();
    for(let i=0;i<10;i++)for(const [x,y] of forms[i%forms.length]!)buildings.setMatrixAt(index++,matrix.makeTranslation((i-4.5)*12+x!*.75,y!*.75+.36,-65-(i%3)*13));
    this.scene.add(buildings);
  }
}

/** Small, hand-authored geographic mask. No downloads or new image assets. */
function earthMask():THREE.CanvasTexture{
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const c=canvas.getContext('2d')!;c.fillStyle='#000';c.fillRect(0,0,512,256);c.fillStyle='#fff';
  const continents=[
    [[-168,70],[-135,70],[-122,55],[-105,51],[-84,53],[-60,47],[-77,30],[-81,25],[-97,20],[-85,10],[-103,20],[-117,32],[-128,49],[-155,58]],
    [[-80,10],[-64,10],[-50,-2],[-35,-8],[-43,-25],[-55,-36],[-69,-55],[-75,-42],[-70,-20],[-82,-4]],
    [[-52,59],[-25,72],[-36,83],[-62,81],[-72,68]],
    [[-17,35],[0,37],[12,33],[32,31],[43,12],[51,11],[42,-8],[32,-30],[18,-35],[10,-20],[5,4],[-15,12]],
    [[-10,36],[-10,44],[0,49],[8,55],[5,70],[25,71],[40,63],[65,72],[105,77],[150,68],[177,62],[160,51],[143,47],[130,32],[119,21],[107,6],[99,9],[94,21],[80,8],[71,24],[51,26],[42,40],[27,41],[20,35],[14,44],[3,43]],
    [[112,-22],[116,-13],[132,-12],[137,-17],[146,-12],[154,-26],[145,-39],[131,-32],[115,-35]],
    [[47,-13],[51,-17],[47,-26],[44,-24]],[[130,32],[139,40],[143,45],[141,33]],[[95,5],[105,-6],[120,-9],[132,-5],[137,-3],[124,0],[112,-3],[105,1]],
    [[-180,-77],[-80,-72],[0,-78],[80,-72],[180,-77],[180,-90],[-180,-90]]
  ];
  for(const poly of continents){c.beginPath();poly.forEach(([lon,lat],i)=>{const x=(lon!+180)/360*512,y=(90-lat!)/180*256;if(i===0)c.moveTo(x,y);else c.lineTo(x,y);});c.closePath();c.fill();}
  const texture=new THREE.CanvasTexture(canvas);texture.wrapS=THREE.RepeatWrapping;return texture;
}
