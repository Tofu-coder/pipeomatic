import bpy, math, os, sys, json
from mathutils import Vector
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='CYCLES'; scene.cycles.samples=48; scene.cycles.use_denoising=True
try:
 prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='METAL';prefs.get_devices()
 for d in prefs.devices:d.use=d.type=='METAL'
 scene.cycles.device='GPU'
except Exception:pass
scene.render.resolution_x=1600;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGB'
scene.world.color=(.05,.05,.05)
scene.view_settings.view_transform='AgX'
scene.render.film_transparent=False
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.055,.075,.105,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.25

def material(name,c,metal=0,rough=.3,trans=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*c,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*c,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough;p.inputs['Transmission Weight'].default_value=trans
 return m
silver=material('Microbrushed titanium silver',(.45,.51,.57),1,.25)
polish=material('Machined edges',(.68,.72,.77),1,.17)
black=material('Anodized graphite',(.035,.043,.053),.8,.27)
rubber=material('Soft black polymer',(.012,.016,.021),0,.45)
white=material('Porcelain polymer',(.72,.79,.84),0,.2)
blue=material('Deep arctic blue',(.015,.09,.21),.35,.23)
glass=material('Clear polypropylene',(.84,.95,1),0,.08,.92);glass.node_tree.nodes['Principled BSDF'].inputs['IOR'].default_value=1.46
water=material('Illustrative blue liquid',(.035,.44,.73),.05,.09,.4)
water.node_tree.nodes['Principled BSDF'].inputs['Emission Color'].default_value=(.01,.18,.4,1);water.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value=.18
# Fine physical texture prevents broad metallic surfaces looking like flat geometry.
nt=silver.node_tree;n=nt.nodes.new('ShaderNodeTexNoise');n.inputs['Scale'].default_value=950;n.inputs['Detail'].default_value=2
b=nt.nodes.new('ShaderNodeBump');b.inputs['Strength'].default_value=.018;b.inputs['Distance'].default_value=.001;nt.links.new(n.outputs['Fac'],b.inputs['Height']);nt.links.new(b.outputs['Normal'],nt.nodes['Principled BSDF'].inputs['Normal'])

def box(name,loc,size,mat,bevel=.025,parent=None):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if bevel:
  mod=o.modifiers.new('Manufactured edge radii','BEVEL');mod.width=bevel;mod.segments=3
  o.modifiers.new('Weighted surface normals','WEIGHTED_NORMAL')
 o.data.materials.append(mat)
 if parent:o.parent=parent
 return o

def cyl(name,loc,r,h,mat,vertices=32,parent=None):
 bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=h,location=loc);o=bpy.context.object;o.name=name;o.data.materials.append(mat)
 for p in o.data.polygons:p.use_smooth=True
 mod=o.modifiers.new('Subtle bevel','BEVEL');mod.width=min(.008,r*.12);mod.segments=2;o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
 if parent:o.parent=parent
 return o

def empty(name):o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);return o

def lathe(name,loc,profile,mat,parent=None):
 verts=[];faces=[];N=48
 for r,z in profile:
  for i in range(N):a=i*2*math.pi/N;verts.append((r*math.cos(a),r*math.sin(a),z))
 for j in range(len(profile)-1):
  for i in range(N):a=j*N+i;bb=j*N+(i+1)%N;faces.append((a,bb,bb+N,a+N))
 me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);o.location=loc;o.data.materials.append(mat)
 for p in me.polygons:p.use_smooth=True
 if parent:o.parent=parent
 return o

box('Monolithic base',(0,0,.23),(4.75,3.45,.32),black,.09)
box('Satin deck',(0,0,.405),(4.55,3.25,.055),silver,.035)
box('Front chamfer rail',(0,-1.73,.25),(4.46,.025,.1),polish,.01)
for x in [-2.13,2.13]:
 for y in [-1.43,1.43]:
  cyl('Elastomer isolation foot',(x,y,.065),.16,.13,rubber)
  cyl('Foot collar',(x,y,.145),.147,.065,polish)
  box('Extruded structural column',(x,y,1.81),(.19,.19,2.77),silver,.018)
  box('Column recessed track',(x,y-.099,1.81),(.038,.012,2.6),black,.003)
  box('Column recessed track',(x+.099,y,1.81),(.012,.038,2.6),black,.003)
  box('Deck fixture',(x,y,.48),(.33,.33,.08),polish,.018)
  box('Corner saddle',(x,y,3.13),(.32,.32,.065),polish,.016)
  box('Gantry gusset',(x,y-.13,3.0),(.29,.065,.38),black,.02)
  for z in [2.89,3.11]:
   q=cyl('Hex socket fastener',(x,y-.175,z),.04,.025,polish,6);q.rotation_euler.x=math.pi/2
   q=cyl('Recessed hex socket',(x,y-.19,z),.018,.004,rubber,6);q.rotation_euler.x=math.pi/2
for y in [-1.43,1.43]:
 box('Frame crossbar',(0,y,3.15),(4.4,.19,.19),silver,.018)
 box('Dark crossbar channel',(0,y-.102,3.15),(4.13,.016,.035),black,.003)
for x in [-2.13,2.13]:
 box('Longitudinal rail',(x,0,3.15),(.19,2.93,.19),silver,.018)
 q=cyl('Polished linear bearing rod',(x,0,3.285),.034,2.65,polish);q.rotation_euler.x=math.pi/2
 for y in [-1.25,1.25]:box('Bearing block',(x,y,3.25),(.28,.25,.15),black,.02)

gantry=empty('Animated Y gantry');carriage=empty('Animated X carriage');carriage.parent=gantry
box('Machined crossbeam',(0,0,2.93),(4.2,.26,.29),silver,.035,gantry)
box('Precision travel rail',(0,-.145,2.96),(4.0,.035,.07),black,.01,gantry)
box('Linear rail highlight',(0,-.17,3.005),(4.01,.014,.018),polish,.004,gantry)
for x in [-2.07,2.07]:box('Y bearing mount',(x,0,2.99),(.29,.52,.37),black,.035,gantry)
box('Pipette carriage',(0,-.19,2.68),(.57,.46,.72),silver,.055,carriage)
box('Front face insert',(0,-.432,2.73),(.41,.022,.42),black,.025,carriage)
box('Status indicator',(.12,-.449,2.77),(.022,.008,.11),water,.003,carriage)
for x in [-.21,.21]:
 for z in [2.43,2.96]:
  o=cyl('Carriage screw',(x,-.445,z),.025,.017,polish,6,carriage);o.rotation_euler.x=math.pi/2
box('Z motor', (0,-.1,3.43),(.29,.31,.31),black,.025,carriage)
cyl('Motor crown',(0,-.1,3.61),.047,.05,polish,parent=carriage)
box('Vertical guide',(0,-.11,3.03),(.18,.16,.8),black,.012,carriage)
for x in [-.065,.065]:cyl('Telescoping guide rod',(x,-.19,2.13),.023,.78,polish,parent=carriage)
pipette=empty('Animated Z pipette');pipette.parent=carriage
cyl('Pipette body',(0,-.19,2.04),.118,.64,white,parent=pipette)
cyl('Upper adapter',(0,-.19,2.35),.131,.11,polish,parent=pipette)
cyl('Pipette nose',(0,-.19,1.65),.082,.16,polish,parent=pipette)
lathe('Transparent disposable tip',(0,-.19,1.09),[(.005,0),(.012,.08),(.039,.38),(.057,.45),(.052,.45),(.034,.38),(.008,.08)],glass,pipette)
tip_water=cyl('Liquid in tip',(0,-.19,1.22),.012,.18,water,parent=pipette)
# The cable chain is a single coherent manufactured assembly.
links=[]
for i in range(32):
 o=box('Cable carrier link',(0,0,0),(.115,.17,.105),rubber,.018,gantry);links.append(o)
# Plate outer frame and well cups: 8 by 12, fixed across every frame.
px=.55;py=-.53
box('Plate mounting fixture',(px,py,.5),(1.86,1.3,.13),black,.035)
box('96 well carrier',(px,py,.61),(1.74,1.18,.09),white,.035)
profile=[(.047,0),(.047,.12),(.045,.14),(.036,.14),(.035,.11),(.032,.02),(.0,.02)]
for row in range(8):
 for col in range(12):
  x=px+(col-5.5)*.134;y=py+(row-3.5)*.134
  lathe('Sample well %s%s'%('ABCDEFGH'[row],col+1),(x,y,.65),profile,glass)
# Deep blue source and destination surfaces.
src=(px-3.5*.134,py+1.5*.134);dst=(px+3.5*.134,py-1.5*.134)
src_liquid=cyl('Source liquid',(src[0],src[1],.73),.033,.025,water)
dst_liquid=cyl('Destination liquid',(dst[0],dst[1],.73),.033,.025,water)
# Tip rack, complete and consistent (also 8 by 12).
rx=-1.1;ry=-.42
box('Blue tip rack',(rx,ry,.6),(1.1,1.35,.28),blue,.035)
box('Tip rack lid',(rx,ry,.76),(1.15,1.4,.045),white,.02)
for row in range(8):
 for col in range(12):
  lathe('Rack tip',(rx+(col-5.5)*.083,ry+(row-3.5)*.156,.77),[(.012,0),(.022,.16),(.026,.2),(.02,.2),(.016,.16)],glass)
# A recessed disposal cavity rather than a solid block.
box('Waste well',(1.64,-.56,.445),(.58,.83,.016),rubber,.02)
for x in [1.32,1.96]:box('Waste receptacle rim',(x,-.56,.48),(.035,.9,.07),polish,.012)
for y in [-1.0,-.12]:box('Waste receptacle rim',(1.64,y,.48),(.66,.035,.07),polish,.012)
for x in [-1.8,-.6,.6,1.8]:
 for y in [-1.15,1.15]:
  cyl('Deck fastener',(x,y,.441),.028,.01,black,6)
# Laser-style front mark.
bpy.ops.object.text_add(location=(-.62,-1.748,.225),rotation=(math.pi/2,0,0));label=bpy.context.object;label.name='PipeOmatiC mark';label.data.body='P I P E O M A T I C';label.data.size=.082;label.data.extrude=.0005;label.data.materials.append(polish)
# Studio floor with physical soft reflections.
floor_mat=material('Obsidian studio',(.006,.008,.012),.38,.24)
box('Studio',(0,0,-.045),(200,200,.05),floor_mat,0)

def area(name,loc,power,color,size,target=(0,0,1.5),shape='DISK',size_y=None):
 data=bpy.data.lights.new(name,'AREA');data.energy=power;data.color=color;data.shape=shape;data.size=size
 if size_y:data.size_y=size_y
 o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();return o
area('Large silk key',(-4,-5,7),1900,(.82,.9,1),5)
area('White strip reflection',(4,1,6),2500,(1,.98,.94),1.3,shape='RECTANGLE',size_y=6)
area('Cool edge',(-4,3,4),1700,(.38,.59,1),3)
area('Soft frontal fill',(1,-6,3),380,(.75,.85,1),4)
# Camera uses physical optics and restrained depth of field.
data=bpy.data.cameras.new('Portrait product camera');camera=bpy.data.objects.new('Portrait product camera',data);bpy.context.collection.objects.link(camera);scene.camera=camera
focus=empty('Optical focus');data.lens=62;data.dof.use_dof=True;data.dof.focus_object=focus;data.dof.aperture_fstop=7

def ease(a,b,p):
 t=max(0,min(1,(p-a)/(b-a)));return t*t*(3-2*t)
def update(p,shot='full'):
 travel=ease(.38,.56,p);z=-.35*ease(.17,.28,p)+.35*ease(.3,.37,p)-.35*ease(.59,.67,p)+.35*ease(.77,.85,p)
 carriage.location.x=src[0]+(dst[0]-src[0])*travel;gantry.location.y=src[1]+(dst[1]-src[1])*travel+.19;pipette.location.z=z
 tip_water.hide_render=not(.27<p<.76);tip_water.scale.z=max(.01,(1-ease(.68,.75,p))*ease(.26,.3,p))
 src_liquid.scale.z=1-.65*ease(.27,.32,p);dst_liquid.scale=(max(.01,ease(.68,.75,p)),)*3
 for i,o in enumerate(links):
  t=i/(len(links)-1);o.location=(-1.9+(carriage.location.x+1.9)*t,.14,3.25+math.sin(t*math.pi)*.38);o.rotation_euler.y=-math.cos(t*math.pi)*.3
 angle=.32-.42*ease(.1,.9,p)
 camera.location=(math.sin(angle)*12,-math.cos(angle)*12,6.3)
 target=Vector((0,-.1,1.7));data.lens=60
 if shot=='macro':camera.location=(3.4,-4.6,3.5);target=Vector((.5,-.53,1.1));data.lens=80;data.dof.aperture_fstop=4.5
 if shot=='detail':camera.location=(2.7,-3.8,4.6);target=Vector((.2,-.1,2.6));data.lens=75;data.dof.aperture_fstop=5.6
 camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();focus.location=target
bpy.data.objects['Studio'].is_shadow_catcher=True
scene.render.film_transparent=True
scene.render.image_settings.color_mode='RGBA'
update(0)
out=os.path.dirname(os.path.abspath(__file__))
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(out,'pipeomatic-studio.blend'))
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
if 'test' in args:
 scene.render.resolution_percentage=65;scene.cycles.samples=24;scene.render.filepath=os.path.join(out,'test.png');bpy.ops.render.render(write_still=True)
elif 'hero' in args:
 scene.render.resolution_x=2200;scene.render.resolution_y=1500;scene.cycles.samples=80;scene.render.filepath=os.path.join(out,'hero.png');bpy.ops.render.render(write_still=True)
elif 'sequence' in args:
 scene.render.resolution_x=1024;scene.render.resolution_y=720;scene.cycles.samples=24
 os.makedirs(os.path.join(out,'frames'),exist_ok=True)
 for i in range(144):
  update(i/143);scene.render.filepath=os.path.join(out,'frames',f'{i:03}.png');bpy.ops.render.render(write_still=True)
elif 'gallery' in args:
 scene.render.film_transparent=False;scene.render.image_settings.color_mode='RGB';bpy.data.objects['Studio'].is_shadow_catcher=False
 scene.render.resolution_x=2200;scene.render.resolution_y=1500;scene.cycles.samples=80;scene.render.filepath=os.path.join(out,'gallery.png');bpy.ops.render.render(write_still=True)
elif 'details' in args:
 scene.render.film_transparent=False;scene.render.image_settings.color_mode='RGB';bpy.data.objects['Studio'].is_shadow_catcher=False
 scene.render.resolution_x=1600;scene.render.resolution_y=1200;scene.cycles.samples=64
 for shot,p in [('macro',.7),('detail',.43)]:
  update(p,shot);scene.render.filepath=os.path.join(out,shot+'.png');bpy.ops.render.render(write_still=True)
