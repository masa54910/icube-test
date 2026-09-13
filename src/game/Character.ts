import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import type {CharacterVisualAdapter} from './CharacterVisualAdapter';
import {LANDING_DURATION,landingCompression,landingStrength} from './LandingPose';
export type LocomotionState='IDLE'|'WALK_FORWARD'|'TURN_LEFT'|'TURN_RIGHT'|'WALK_TURN_LEFT'|'WALK_TURN_RIGHT'|'CLIMB'|'AIRBORNE'|'LANDING';
export interface CharacterMotion { speed:number; turnRate:number; climbing:boolean; airborne:boolean }
interface Limb { upper:THREE.Group; lower:THREE.Group; end:THREE.Group }

/** Original, texture-free articulated humanoid. Animation never writes player state. */
export class Character implements CharacterVisualAdapter {
  readonly root=new THREE.Group();
  readonly pelvis=new THREE.Group();
  readonly torso=new THREE.Group();
  readonly head=new THREE.Group();
  readonly arms:Limb[]=[];
  readonly legs:Limb[]=[];
  state:LocomotionState='IDLE';
  private phase=0;
  onAudioContact:((kind:'step'|'ladder')=>void)|null=null;
  private time=0;
  private walkWeight=0;
  private lean=0;
  readonly helmet=new THREE.Group();
  private wasAirborne=false;
  private landingTime=0;
  private fallSpeed=0;
  landingImpact=0;
  compression=0;
  private helmetCompression=0;
  idleSeconds=0;
  idleContext:'free'|'terminal'|'ladder'='free';
  idleLookYaw=0;
  reducedMotion=false;
  idleGesture='none';
  private readonly poseNodes:THREE.Object3D[]=[];
  private poseValues:number[]=[];
  private blendTime=0;
  private priorState:LocomotionState='IDLE';
  private gestureCycle=-1;
  private gestureVariant=0;
  constructor() {
    this.root.scale.setScalar(.7);this.root.add(this.pelvis);this.pelvis.position.y=.9;
    this.pelvis.add(this.torso);
    const materials=new Map<number,THREE.MeshStandardMaterial>();
    const mat=(color:number)=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.78}));return materials.get(color)!;};
    const sphere=new THREE.SphereGeometry(1,24,16);
    const smallSphere=new THREE.SphereGeometry(1,12,8);
    const ellipsoid=(parent:THREE.Object3D,color:number,x:number,y:number,z:number,sx:number,sy:number,sz:number)=>{
      const mesh=new THREE.Mesh(Math.max(sx,sy,sz)<.16?smallSphere:sphere,mat(color));mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.castShadow=true;parent.add(mesh);return mesh;
    };
    const capsule=(parent:THREE.Object3D,color:number,radius:number,length:number,y:number)=>{
      // Tailored cloth volumes taper at the joints instead of uniform tubes.
      const profile=[[.64,-.5],[.87,-.43],[1,-.24],[1.04,.10],[.93,.35],[.68,.5]].map(([r,h])=>new THREE.Vector2(r!*radius,h!*length));
      const mesh=new THREE.Mesh(new THREE.LatheGeometry(profile,16),mat(color));mesh.position.y=y;mesh.scale.z=.88;mesh.castShadow=true;parent.add(mesh);return mesh;
    };
    const panel=(parent:THREE.Object3D,color:number,p:number[],size:number[])=>{const m=new THREE.Mesh(new RoundedBoxGeometry(size[0]!,size[1]!,size[2]!,Math.min(...size)>.05?2:1,Math.min(...size)*.3),mat(color));m.position.set(p[0]!,p[1]!,p[2]!);m.castShadow=true;parent.add(m);return m;};
    const indicator=(positions:THREE.Vector3[],size:number[])=>{const mesh=new THREE.InstancedMesh(new RoundedBoxGeometry(size[0]!,size[1]!,size[2]!,1,.003),mat(0x69d7ed),positions.length);positions.forEach((p,i)=>mesh.setMatrixAt(i,new THREE.Matrix4().makeTranslation(p.x,p.y,p.z)));mesh.castShadow=true;this.torso.add(mesh);};
    const navy=0xf2f7ff,blue=0x69d7ed,pants=0xe6f0fa,shoe=0xf8fcff;
    ellipsoid(this.pelvis,pants,0,0,0,.225,.145,.145);
    const outline=[[.17,-.055],[.205,-.02],[.194,.07],[.197,.15],[.224,.27],[.262,.39],[.258,.46],[.218,.52],[.12,.565]].map(([r,y])=>new THREE.Vector2(r!,y!));
    const chest=new THREE.Mesh(new THREE.LatheGeometry(outline,28),mat(navy));chest.scale.z=.69;chest.name='tailored-white-torso';this.torso.add(chest);
    panel(this.torso,0xffffff,[0,.33,-.16],[.35,.29,.067]).name='chest-shell';
    indicator([-.052,.052].flatMap(x=>[.28,.385].map(y=>new THREE.Vector3(x,y,-.200))),[.069,.069,.013]);
    ellipsoid(this.torso,blue,0,.05,0,.201,.034,.14);
    panel(this.torso,0xffffff,[0,.29,.20],[.34,.43,.19]).name='backpack-shell';
    for(const side of [-1,1]){capsule(this.torso,0xffffff,.052,.32,.30).position.set(side*.19,.30,.22);panel(this.torso,blue,[side*.19,.32,.265],[.033,.16,.016]);}
    indicator([-.055,.055].flatMap(x=>[.235,.35].map(y=>new THREE.Vector3(x,y,.303))),[.08,.085,.012]);
    for(const side of [-1,1]){
      panel(this.torso,0xffffff,[side*.20,.31,.025],[.034,.35,.29]);
      panel(this.torso,blue,[side*.197,.28,-.123],[.016,.27,.025]);
      panel(this.pelvis,0xffffff,[side*.16,-.04,-.10],[.11,.19,.06]);
    }
    const ring=(parent:THREE.Object3D,r:number,t:number,y:number,color:number)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(r,t,8,24),mat(color));m.rotation.x=Math.PI/2;m.position.y=y;parent.add(m);return m;};
    ring(this.torso,.116,.031,.58,blue);
    capsule(this.torso,0xe6f0fa,.075,.17,.605);
    this.torso.add(this.head);this.head.position.y=.84;this.head.scale.setScalar(.82);
    // Gameplay-only Explorer: no face, hair, facial rig or helmet removal.
    this.head.add(this.helmet);
    const shell=ellipsoid(this.helmet,0xf7fbff,0,.015,.015,.315,.34,.295);
    (shell.material as THREE.MeshStandardMaterial).roughness=.25;
    // Concentric curved patches sit outside the shell: no intersecting ellipsoids / jagged rim.
    const shield=(color:number,extent:number,scale:number)=>{
      const points:number[]=[],uv:number[]=[],indices:number[]=[];const cols=28,rows=16;
      for(let iy=0;iy<=rows;iy++)for(let ix=0;ix<=cols;ix++){
        const v=iy/rows,u=ix/cols,theta=color===0x061725?.805+1.55*v:.77+1.62*v;
        const phi=(u-.5)*2*extent*(.94+.06*Math.sin(v*Math.PI));
        points.push(.315*scale*Math.sin(theta)*Math.sin(phi),.015+.34*scale*Math.cos(theta),.015-.295*scale*Math.sin(theta)*Math.cos(phi));uv.push(u,v);
        if(iy<rows&&ix<cols){const a=iy*(cols+1)+ix,b=a+cols+1;indices.push(a,a+1,b,b,a+1,b+1);}
      }
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
      const mesh=new THREE.Mesh(geo,mat(color));mesh.castShadow=true;this.helmet.add(mesh);return mesh;
    };
    shield(blue,1.13,1.035).name='visor-cyan-gasket';
    const visor=shield(0x061725,1.075,1.055);visor.name='curved-visor';
    (visor.material as THREE.MeshStandardMaterial).roughness=.12;
    (visor.material as THREE.MeshStandardMaterial).metalness=.65;
    for(const side of [-1,1]){
      ellipsoid(this.helmet,blue,side*.308,0,0,.043,.12,.107);
      ellipsoid(this.helmet,0xf6fdff,side*.338,0,0,.023,.083,.074);
    }
    ring(this.helmet,.199,.017,-.278,0xc6d0d9);
    ring(this.helmet,.22,.028,-.243,blue);
    panel(this.helmet,0xf7fbff,[0,-.24,-.14],[.39,.064,.19]);
    panel(this.helmet,0xf7fbff,[0,.274,-.135],[.18,.046,.10]);
    for(const side of [-1,1]) {
      const upper=new THREE.Group(),lower=new THREE.Group(),end=new THREE.Group();
      upper.position.set(side*.3,.43,0);this.torso.add(upper);
      ellipsoid(upper,navy,0,-.025,0,.111,.125,.105);
      const shoulder=panel(upper,0xffffff,[side*.033,.008,0],[.178,.145,.205]);shoulder.rotation.z=side*.22;shoulder.name='shoulder-shell';
      panel(upper,blue,[side*.117,.02,-.005],[.012,.076,.079]);
      capsule(upper,navy,.085,.32,-.16);
      lower.position.y=-.30;upper.add(lower);ellipsoid(lower,0xc6d0d9,0,0,0,.075,.078,.071);
      panel(lower,0xb4ccda,[0,0,.055],[.11,.105,.043]);
      capsule(lower,navy,.066,.28,-.135);
      ring(lower,.071,.02,-.215,blue);
      panel(lower,0xffffff,[0,-.16,-.058],[.095,.09,.034]);
      panel(lower,0x123047,[0,-.16,-.077],[.063,.054,.012]);
      end.position.y=-.29;lower.add(end);ellipsoid(end,shoe,0,-.018,0,.075,.09,.066);
      ring(end,.063,.012,.055,0xffffff);
      ellipsoid(end,shoe,side*-.058,-.005,-.027,.035,.06,.038);
      panel(end,0xb3c7d3,[0,-.038,.036],[.102,.081,.023]);
      this.arms.push({upper,lower,end});
    }
    for(const side of [-1,1]) {
      const upper=new THREE.Group(),lower=new THREE.Group(),end=new THREE.Group();
      upper.position.set(side*.133,-.05,0);this.pelvis.add(upper);
      capsule(upper,pants,.098,.40,-.19);
      lower.position.y=-.39;upper.add(lower);ellipsoid(lower,0xc6d0d9,0,0,0,.079,.081,.077);
      capsule(lower,pants,.073,.36,-.16);
      panel(lower,0xffffff,[0,-.018,-.071],[.145,.15,.052]).name='knee-shell';
      panel(lower,blue,[0,-.076,-.101],[.104,.016,.013]);
      ring(lower,.078,.019,-.265,blue);
      end.position.y=-.34;lower.add(end);end.name='astronaut-boot';
      // All boot pieces belong to the ankle node; unchanged lowest sole contact height.
      capsule(end,0xc6d0d9,.091,.16,.055).name='boot-flex-cuff';
      ring(end,.092,.012,.112,blue);
      panel(end,0xf7fbff,[0,.035,-.025],[.204,.185,.198]).name='boot-upper-shell';
      // Rounded boot last with a continuous instep-to-toe profile, not a sphere on a block.
      const toePoints:number[]=[],toeIndices:number[]=[];
      const sections=[[.105,.067,.045],[.06,.096,.071],[-.015,.108,.08],[-.10,.11,.035],[-.19,.095,.012],[-.225,.059,-.017],[-.24,.004,-.053]];
      sections.forEach(([z,width,top],row)=>{for(let i=0;i<=20;i++){const angle=i/20*Math.PI*2;toePoints.push(Math.sin(angle)*width!,-.064+(Math.cos(angle)+1)*.5*(top!+.064),z!);if(row<sections.length-1&&i<20){const a=row*21+i,b=a+21;toeIndices.push(a,a+1,b,b,a+1,b+1);}}});
      const toeGeometry=new THREE.BufferGeometry();toeGeometry.setAttribute('position',new THREE.Float32BufferAttribute(toePoints,3));toeGeometry.setIndex(toeIndices);toeGeometry.computeVertexNormals();
      const toe=new THREE.Mesh(toeGeometry,mat(0xf7fbff));toe.name='boot-toe';toe.castShadow=true;end.add(toe);
      panel(end,0xa4b3c1,[0,-.086,-.06],[.216,.055,.33]).name='boot-sole';
      panel(end,0xb2bdc7,[0,-.059,.062],[.20,.09,.092]).name='boot-heel';
      panel(end,blue,[0,-.065,-.218],[.16,.025,.023]);
      for(const x of [-.105,.105])panel(end,blue,[x,-.064,-.066],[.012,.018,.17]);
      // Recess-like tread bars stay inside the established contact envelope.
      const tread=new THREE.InstancedMesh(new RoundedBoxGeometry(.179,.009,.018,1,.002),mat(0xb2bdc7),4);tread.name='boot-tread';
      [-.17,-.095,-.02,.055].forEach((z,i)=>tread.setMatrixAt(i,new THREE.Matrix4().makeTranslation(0,-.108,z)));tread.castShadow=true;end.add(tread);
      this.legs.push({upper,lower,end});
    }
  }
  update(position:THREE.Vector3,yaw:number,speed:number,dt:number,climbing=false,turnRate=0,airborne=false):void {
    // Measured visual displacement, no access to or mutation of physics velocity.
    if(this.wasAirborne&&dt>0)this.fallSpeed=Math.max(this.fallSpeed,Math.max(0,(this.root.position.y-position.y)/dt));
    this.root.position.copy(position);
    // PlayerController owns smoothed facing; do not introduce a second facing delay here.
    this.root.rotation.y=-yaw;
    if(!this.poseNodes.length)this.poseNodes.push(this.pelvis,this.torso,this.head,...this.arms.flatMap(l=>[l.upper,l.lower,l.end]),...this.legs.flatMap(l=>[l.upper,l.lower,l.end]));
    if(!this.poseValues.length)this.poseValues=this.poseNodes.flatMap(n=>[n.rotation.x,n.rotation.y,n.rotation.z]);
    this.animate(dt,{speed,turnRate,climbing,airborne});
    if(this.state!==this.priorState){this.blendTime=.12;this.priorState=this.state;}
    this.blendTime=Math.max(0,this.blendTime-dt);
    const weight=this.blendTime>0?1-Math.exp(-dt*25):1;
    this.poseNodes.forEach((n,i)=>{for(const [j,axis] of (['x','y','z'] as const).entries()){const v=this.poseValues[i*3+j]!+(n.rotation[axis]-this.poseValues[i*3+j]!)*weight;n.rotation[axis]=v;this.poseValues[i*3+j]=v;}});
  }
  private animate(dt:number,motion:CharacterMotion):void {
    this.time+=dt;
    this.idleGesture='none';
    if(this.wasAirborne&&!motion.airborne&&!motion.climbing){this.landingTime=LANDING_DURATION;this.landingImpact=landingStrength(this.fallSpeed);}
    if(!motion.airborne)this.fallSpeed=0;
    this.compression=0;
    this.root.userData.landingCompression=0;
    this.helmetCompression+=(landingCompression(this.landingTime)-this.helmetCompression)*(1-Math.exp(-14*dt));
    if(motion.climbing||motion.airborne)this.landingTime=0;
    this.wasAirborne=motion.airborne;
    this.landingTime=Math.max(0,this.landingTime-dt);
    if(motion.airborne){
      this.state='AIRBORNE';
      this.walkWeight=0;
      this.pelvis.position.y=.9;
      this.pelvis.rotation.set(0,0,0);this.torso.rotation.set(.06,0,0);this.torso.scale.y=1;this.head.rotation.set(-.04,0,0);
      this.legs.forEach(leg=>{leg.upper.rotation.set(.23,0,0);leg.lower.rotation.set(-.48,0,0);leg.end.rotation.set(.14,0,0);});
      // Raise both arms close to a hands-up silhouette during the jump. The
      // existing landing recovery below blends them back to the run/idle pose.
      this.arms.forEach((arm)=>{
        // The arm rig hangs along local -Y. Rotate through the character's
        // front/back plane so the hands rise overhead without opening out to
        // either side in the front view.
        arm.upper.rotation.set(Math.PI,0,0);
        // Keep the forearm aligned with the raised upper arm: no relative
        // elbow bend during the jump silhouette.
        arm.lower.rotation.set(0,0,0);
        arm.end.rotation.set(0,0,0);
      });
      return;
    }
    const blend=1-Math.exp(-12*dt);
    this.walkWeight+=(Math.min(1,motion.speed)-this.walkWeight)*blend;
    this.lean+=(THREE.MathUtils.clamp(motion.turnRate/2,-1,1)-this.lean)*blend;
    const walking=motion.speed>.04,turning=Math.abs(motion.turnRate)>.04;
    this.state=motion.climbing?'CLIMB':walking?(turning?(motion.turnRate<0?'WALK_TURN_LEFT':'WALK_TURN_RIGHT'):'WALK_FORWARD'):(turning?(motion.turnRate<0?'TURN_LEFT':'TURN_RIGHT'):'IDLE');
    const stepping=Math.max(this.walkWeight,Math.abs(this.lean)*.35);
    const previousContact=Math.floor((this.phase-Math.PI/2)/Math.PI);
    this.phase+=dt*(motion.climbing?8:11.2)*stepping;
    // Forward leg at maximum extension: alternating stance contact, not an input timer.
    if(walking&&this.landingTime===0&&Math.floor((this.phase-Math.PI/2)/Math.PI)>previousContact)this.onAudioContact?.(motion.climbing?'ladder':'step');
    const breath=Math.sin(this.time*2.05);
    this.pelvis.position.y=.9+breath*.003+Math.cos(this.phase*2)*.009*this.walkWeight;
    this.pelvis.rotation.set(0,Math.sin(this.phase)*.026*this.walkWeight,-this.lean*.025+Math.sin(this.phase)*.02*this.walkWeight);
    this.torso.rotation.set(-.075*this.walkWeight,Math.sin(this.phase)*-.055*this.walkWeight,-this.lean*.055+Math.sin(this.time*.9)*.008*(1-this.walkWeight));
    this.torso.scale.y=1+breath*.006*(1-this.walkWeight);
    this.head.rotation.set(Math.sin(this.time*1.1)*.012,-this.lean*.045,Math.sin(this.phase)*-.012*this.walkWeight);
    this.legs.forEach((leg,i)=>{
      const wave=Math.sin(this.phase+i*Math.PI);
      leg.upper.rotation.set(wave*.60*stepping,0,0);
      leg.lower.rotation.x=-(.12+Math.max(0,-wave)*1.02)*stepping;
      leg.end.rotation.x=-leg.lower.rotation.x*.3-leg.upper.rotation.x*.2;
      if(motion.climbing) {leg.upper.rotation.x=.65+wave*.38;leg.lower.rotation.x=-.85;}
    });
    this.arms.forEach((arm,i)=>{
      const side=i===0?-1:1,wave=Math.sin(this.phase+i*Math.PI);
      arm.upper.rotation.set(-wave*.42*stepping+.025*breath*(1-this.walkWeight),0,side*.055);
      arm.lower.rotation.x=.16+(1.35+wave*.22)*stepping;
      arm.end.rotation.set(.08,0,0);
      if(motion.climbing) {arm.upper.rotation.x=2.3+wave*.35;arm.lower.rotation.x=-.45;}
    });
    if(this.landingTime>0){
      const compression=landingCompression(this.landingTime);
      const recovery=1-Math.min(1,this.landingTime/.30);
      const weight=compression*(1-this.walkWeight*.7*recovery);
      this.compression=weight;
      this.root.userData.landingCompression=weight;
      this.state='LANDING';
      // Opposing hip/knee flex keeps the soles near the ground while hips absorb impact.
      const knee=-(.64+.55*this.landingImpact),hip=-knee*.5,ankle=-hip-knee;
      this.pelvis.position.y-=((.39+.34)*(1-Math.cos(hip*weight)));
      this.torso.rotation.x-=(.10+.14*this.landingImpact)*weight;this.head.rotation.x+=.07*this.helmetCompression;
      this.legs.forEach(leg=>{leg.upper.rotation.x=THREE.MathUtils.lerp(leg.upper.rotation.x,hip,weight);leg.lower.rotation.x=THREE.MathUtils.lerp(leg.lower.rotation.x,knee,weight);leg.end.rotation.x=THREE.MathUtils.lerp(leg.end.rotation.x,ankle,weight);});
      // Arms are intentionally not bent during landing; the airborne pose
      // blends straight back to the locomotion pose on the contact frame.
    }
    this.root.userData.landingCompression=this.compression;
    this.idleGesture='none';
    if(this.state==='IDLE'&&this.idleSeconds>=4&&!this.reducedMotion){
      const cycle=(this.idleSeconds-4)%10,amount=cycle<2.8?Math.sin(Math.PI*cycle/2.8):0;
      const cycleIndex=Math.floor((this.idleSeconds-4)/10);if(cycleIndex!==this.gestureCycle){this.gestureCycle=cycleIndex;this.gestureVariant=cycleIndex===0?0:Math.floor(Math.random()*3);}
      if(amount>0){const variation=this.gestureVariant;
        if(this.idleContext==='ladder'){this.idleGesture='look-up';this.head.rotation.x-=amount*.18;}
        else if(this.idleContext==='terminal'){this.idleGesture='monitor';this.head.rotation.y-=amount*THREE.MathUtils.clamp(this.idleLookYaw,-.3,.3);this.head.rotation.x+=amount*.10;}
        else if(variation===0){this.idleGesture='scan';this.head.rotation.y+=Math.sin(cycle*2.1)*.17*amount;}
        else if(variation===1){this.idleGesture='wrist';this.arms[0]!.upper.rotation.x+=amount*.6;this.arms[0]!.lower.rotation.x+=amount*.9;this.arms[0]!.end.rotation.y=amount*.15;}
        else {this.idleGesture='stretch';this.torso.rotation.z+=amount*.045;this.arms[1]!.upper.rotation.z+=amount*.12;}
      }
    }
  }
}
