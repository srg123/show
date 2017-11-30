
//变量初始化定义
var container, stats;
var scene, gStats, gRenderer;
var  gCameraMgr, gLightMgr, gBgMirror;
var gCameraCtrl=undefined;
var gDefaultTag=undefined;
var gDropCrtl=undefined;
var gSelectTag=null;
var gRaycaster=undefined;
var gMouse= new THREE.Vector2();
var gClock = new THREE.Clock();
var gMtlLoader = new THREE.MTLLoader();
var gObjLoader = new THREE.OBJLoader();
var gnModelIndex=0;
var gSelectList=[];
var gModeMap={};
var gProjector = new THREE.Projector();

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var groundMirrorMaterial;

//初始化、动画

    init();
    animate();


function init() {


    container = document.createElement( 'div' );
    document.body.appendChild( container );

    // scene
   scene = new THREE.Scene();
    //scene.background = new THREE.Color( 0x000000);
   scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );
    // Grid

    var helper = new THREE.GridHelper( 60000, 40, 0x303030, 0x303030 );
    helper.position.y = 500;
    scene.add( helper );


    gRenderer = new THREE.WebGLRenderer(
        {
            antialias: true,
            precision: "highp",
            alpha: true,
            premultipliedAlpha: false,
            stencil: false,
            preserveDrawingBuffer: true //是否保存绘图缓冲
        }
    );
    gRenderer.sortObjects = true;
    gRenderer.autoClear = false;
    gRenderer.shadowMap.enabled = true;
    gRenderer.shadowMapSoft = true;
    gRenderer.shadowMapType = THREE.PCFSoftShadowMap;

    gRenderer.setPixelRatio( window.devicePixelRatio );
    gRenderer.setSize( window.innerWidth, window.innerHeight  );
    //gRenderer.shadowMap.enabled = true;

    gRenderer.gammaInput = true;
    gRenderer.gammaOutput = true;

    gRenderer.shadowMap.enabled = true;
    gRenderer.shadowMap.renderReverseSided = false;
    container.appendChild( gRenderer.domElement );

    //initDefaultTag();
    initCamera();
    initLight();
    //openVideo();
    //initSky()
    //creatCube();
    fillScene();
    eventMgr();
    initModel()
    loadObj("shinei-dimian-01");
    // initGui();

    //状态栏位置信息
    gStats = new Stats();
    container.appendChild( gStats.dom );

    gRaycaster=new THREE.Raycaster();

    gDropCrtl = new THREE.TransformControls( gCameraMgr.camera, gRenderer.domElement );
    gDropCrtl.addEventListener( 'change', gRenderer );
   scene.add(gDropCrtl);

    /*  //增加镜面材质
     var planeGeo = new THREE.PlaneBufferGeometry(23786-800, 17717-1200);
     gBgMirror = new THREE.Mirror (window.innerWidth*10, window.innerHeight*10, {clipBias: 0.003, color: 0x777777});
     gBgMirror.material.side = THREE.DoubleSide;
     var mirrorMesh = new THREE.Mesh(planeGeo, gBgMirror.material);
     mirrorMesh.add(gBgMirror);
     mirrorMesh.rotateX(-Math.PI / 2);
     mirrorMesh.scale.set(1, 1, 1);
     mirrorMesh.position.set(9650, 290, -7805+1000);
     mirrorMesh.receiveShadow=true;
    scene.add(mirrorMesh);*/


}
function render() {
    var timer = 0.01 * Date.now();
    camera.lookAt(scene.position );

    pointLight.position.x = Math.sin( timer * 7 ) * 300;
    pointLight.position.y = Math.cos( timer * 5 ) * 400;
    pointLight.position.z = Math.cos( timer * 3 ) * 300;

    gRenderer.render(scene, gCameraMgr.camera );

}
function animate() {
    requestAnimationFrame( animate );
    var clock = new THREE.Clock();
    var delta2 = clock.getDelta();
    var timer = Date.now() * 0.01;

    groundMirrorMaterial.updateFrame( delta2 );

    render();
     var delta = gClock.getDelta();
     if(gCameraCtrl && gCameraCtrl.enabled)
     {
        gCameraCtrl.update(delta);
     }
    if(gModelList.length==gnModelIndex){
        raycastProc();
        if(gSelectTag){
            gDropCrtl.update();
        }

    }
}
function fillScene() {


    //var gui = new dat.GUI();
    var decalNormal = new THREE.TextureLoader().load( '../../showroom/3d_files/texture/decal/decal-normal2.jpg' );

    var decalDiffuse = new THREE.TextureLoader().load( '../../showroom/3d_files/texture/decal/decal-diffuse2.png' );
    decalDiffuse.wrapS = decalDiffuse.wrapT = THREE.RepeatWrapping;

    var planeGeo = new THREE.PlaneBufferGeometry(23786-800, 17717-1200);
    // MIRROR planes
    var groundMirror = new THREE.MirrorRTT( 100, 100, { clipBias: 0.007, textureWidth: WIDTH, textureHeight: HEIGHT } );

    var mask = new THREE.SwitchNode( new THREE.TextureNode( decalDiffuse ), 'w' );
    var maskFlip = new THREE.Math1Node( mask, THREE.Math1Node.INVERT );

    var mirror = new THREE.MirrorNode( groundMirror );

    var normal = new THREE.TextureNode( decalNormal );
    var normalXY = new THREE.SwitchNode( normal, 'xy' );
    var normalXYFlip = new THREE.Math1Node(
        normalXY,
        THREE.Math1Node.INVERT
    );

    var offsetNormal = new THREE.OperatorNode(
        normalXYFlip,
        new THREE.FloatNode( .5 ),
        THREE.OperatorNode.SUB
    );

    mirror.offset = new THREE.OperatorNode(
        offsetNormal, // normal
        new THREE.FloatNode( 6 ),// scale
        THREE.OperatorNode.MUL
    );

    var clr = new THREE.Math3Node(
        mirror,
        new THREE.ColorNode( 0xFFFFFF ),
        null,
        THREE.Math3Node.MIX
    );

    var blurMirror = new THREE.BlurNode( mirror );
    blurMirror.size = new THREE.Vector2( WIDTH, HEIGHT );
    blurMirror.coord = new THREE.FunctionNode( "projCoord.xyz / projCoord.q", "vec3" );
    blurMirror.coord.keywords[ "projCoord" ] = new THREE.OperatorNode( mirror.offset, mirror.coord, THREE.OperatorNode.ADD );
    blurMirror.radius.x = blurMirror.radius.y = 1;

  /*  gui.add( { blur : blurMirror.radius.x }, "blur", 0, 25 ).onChange( function(v) {

        blurMirror.radius.x = blurMirror.radius.y = v;

    } );*/

    groundMirrorMaterial = new THREE.PhongNodeMaterial();
    groundMirrorMaterial.environment = blurMirror; // or add "mirror" variable to disable blur
    groundMirrorMaterial.environmentAlpha = mask;
    groundMirrorMaterial.normal = normal;
    //groundMirrorMaterial.normalScale = new THREE.FloatNode( 1 );
    groundMirrorMaterial.build();

    var mirrorMesh = new THREE.Mesh( planeGeo, groundMirrorMaterial );
    mirrorMesh.add( groundMirror );
    mirrorMesh.rotateX( - Math.PI / 2 );
    mirrorMesh.scale.set(1, 1, 1);
    mirrorMesh.position.set(9650, 290, -7805+1000);
    mirrorMesh.receiveShadow=true;
   scene.add( mirrorMesh );



   /* // walls
    var planeTop = new THREE.Mesh( planeGeo, new THREE.MeshPhongMaterial( { color: 0xffffff } ) );
    planeTop.position.y = 100;
    planeTop.rotateX( Math.PI / 2 );
   scene.add( planeTop );

    var planeBack = new THREE.Mesh( planeGeo, new THREE.MeshPhongMaterial( { color: 0xffffff } ) );
    planeBack.position.z = -50;
    planeBack.position.y = 50;
   scene.add( planeBack );

    var planeFront = new THREE.Mesh( planeGeo, new THREE.MeshPhongMaterial( { color: 0x7f7fff } ) );
    planeFront.position.z = 50;
    planeFront.position.y = 50;
    planeFront.rotateY( Math.PI );
   scene.add( planeFront );

    var planeRight = new THREE.Mesh( planeGeo, new THREE.MeshPhongMaterial( { color: 0x00ff00 } ) );
    planeRight.position.x = 50;
    planeRight.position.y = 50;
    planeRight.rotateY( - Math.PI / 2 );
   scene.add( planeRight );

    var planeLeft = new THREE.Mesh( planeGeo, new THREE.MeshPhongMaterial( { color: 0xff0000 } ) );
    planeLeft.position.x = -50;
    planeLeft.position.y = 50;
    planeLeft.rotateY( Math.PI / 2 );
   scene.add( planeLeft );

    // lights
    var mainLight = new THREE.PointLight( 0xcccccc, 1.5, 250 );
    mainLight.position.y = 60;
   scene.add( mainLight );

    var greenLight = new THREE.PointLight( 0x00ff00, 0.25, 1000 );
    greenLight.position.set( 550, 50, 0 );
   scene.add( greenLight );

    var redLight = new THREE.PointLight( 0xff0000, 0.25, 1000 );
    redLight.position.set( - 550, 50, 0 );
   scene.add( redLight );

    var blueLight = new THREE.PointLight( 0x7f7fff, 0.25, 1000 );
    blueLight.position.set( 0, 50, 550 );
   scene.add( blueLight );*/

}
function initDefaultTag() {

    //相机look位置
    var geom = new THREE.BoxGeometry( 600, 600, 600 );
    var mate = new THREE.MeshStandardMaterial({color: 0xffff00,  transparent: true});
    gDefaultTag = new THREE.Mesh( geom, mate );
    gDefaultTag.position.set( 1500, 500, -3000);
    gDefaultTag.castShadow=true;
    gDefaultTag.receiveShadow=true;
   scene.add( gDefaultTag );
}
function initCamera() {
    var nWidth= window.innerWidth;
    var nHeight= window.innerHeight;
    gCameraMgr=new CameraMgr(scene, gRenderer);
    camera=gCameraMgr.createCamera( 65, nWidth / nHeight, 10, 68000);

    camera.position.set(0, 5000, 12000);
    camera.rotation.x=Math.PI * 0.47;

    //第一人称摄像机
    gCameraCtrl=gCameraMgr.createFirstCtrl();
    {
        gCameraCtrl.lookSpeed = 0.0325;
        gCameraCtrl.autoForward=false;
        gCameraCtrl.movementSpeed = 2500;
        gCameraCtrl.noFly = true ;
        gCameraCtrl.lookVertical = true;
        gCameraCtrl.constrainVertical = true;
        gCameraCtrl.verticalMin = 1.5;
        gCameraCtrl.verticalMax = 2.0;
        gCameraCtrl.lon = 250;
        gCameraCtrl.lat = 30;
    }
    gCameraCtrl.enabled=false;

    //轨迹球摄像机控制器
    gCameraCtrl=gCameraMgr.createOrbitCtrl();
    {
        gCameraCtrl.minPolarAngle=Math.PI * 0.01;
        gCameraCtrl.maxPolarAngle = Math.PI * 0.47;
        gCameraCtrl.minDistance = 1;
        gCameraCtrl.maxDistance = 68000;
        gCameraCtrl.enableKeys=false;
    }
    gCameraCtrl.enabled=true;
}
function initLight() {
    //自动行走
    guide = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({color: 0xffffff}));
    guide.position.set(1500, 900, -6000);
    guide.castShadow=true;
    guide.receiveShadow=true;
   scene.add(guide);

    gLightMgr=new LightMgr(scene, false);
    //gLightMgr.isHelper=true;
    var ambient=gLightMgr.addAmbientLight(0xffffffff, 1.0);
/*
    gLightMgr=new LightMgr(scene, false);
    //gLightMgr.isHelper=true;
    var ambient=gLightMgr.addAmbientLight(0xffffffff, 1.0);



    var spotPos=[
        {"x":1500,       "y":2000,   "z": -3000}
        // {"x":6500,      "y":3000,   "z": -6000},
        // {"x":12500,     "y":3000,   "z": -8000},
        //{"x":18500,     "y":3000,   "z": -8000},
    ];
    var spotParam=[
        {"castShadow":true, "mapW":104, "mapH":104, "mapN":104,"mapFar":104,"mapFov":104,"target":null},
        {"castShadow":true, "mapW":104, "mapH":104, "mapN":104,"mapFar":104,"mapFov":104,"target":null},
        {"castShadow":true, "mapW":104, "mapH":104, "mapN":104,"mapFar":104,"mapFov":104,"target":null},
        {"castShadow":true, "mapW":104, "mapH":104, "mapN":104,"mapFar":104,"mapFov":104,"target":null}
    ];

    for(var i in spotPos){
        var light=gLightMgr.addSpotLight(0xffffff, 8.5, 8500);
        //开启阴影
        light.castShadow = spotParam[i].castShadow;
        light.position.set( spotPos[i].x, spotPos[i].y, spotPos[i].z );
        light.target.position.set(spotPos[i].x, spotPos[i].y-500, spotPos[i].z);//=guide;
        light.penumbra = 0.05;
        light.decay = 2;
        light.angle=Math.PI/3;
        light.intensity=1.2;


        var lightMesh = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({color: 0x00ff00}));
        lightMesh.position.set(1500, 350, -3000);
       scene.add(lightMesh);
        light.target=lightMesh;


        // light.penumbra =1;
        // light.decay=2;
    }
*/
    //半球光
    hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
    hemiLight.color.setHSL( 0.6, 1, 0.6 );
    hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    hemiLight.position.set( 0, 500, 0 );
  // scene.add( hemiLight );
    //scene.add( hemiLight.target );
    //scene.add( hemiLight );


/*  hemiLight = new THREE.HemisphereLight( 0x00ffaa, 0xffffff, 1 );
    hemiLight.color.setHSL( 0.125, 1, 0.4 );
    hemiLight.groundColor.setHSL( 0.025, 1, 0.173 );
    hemiLight.position.set( 0, 500, 0 );*/


    hemiLightHelper = new THREE.HemisphereLightHelper( hemiLight, 10 );
  // scene.add( hemiLightHelper );


   // var  dirLight, dirLightHeper, hemiLight, hemiLightHelper;
    //方向光
    dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
    dirLight.color.setHSL( 0.1, 1, 0.95 );
    dirLight.position.set( -1, 100, 1 );
    dirLight.position.multiplyScalar( 30 );
    //scene.add( dirLight );

    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;

    var d = 50;

    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;

    dirLight.shadow.camera.far = 3500;
    dirLight.shadow.bias = -0.0001;
   //scene.add( dirLight );

    dirLightHeper = new THREE.DirectionalLightHelper( dirLight, 500 )
   //scene.add( dirLightHeper );
/*
    //平行光
    dirLight = new THREE.DirectionalLight( 0xff1100, 1.75 );
    dirLight.position.set( 50, 2000, 100 );
    dirLight.position.multiplyScalar( 1.3 );

    dirLight.castShadow = true;
    //light.shadowCameraVisible = true;

    dirLight.shadowMapWidth = 1024;
    dirLight.shadowMapHeight = 1024;
    //scene.add( dirLight );

    dirLightHeper = new THREE.DirectionalLightHelper( dirLight, 500 )
   //scene.add( dirLightHeper );
*/
    //点光
/*    pointLight = new THREE.PointLight( 0xffffff, 1,3000);
    pointLight.position.set( 6000, 2500, -1500 );
    // light representation
    var sphere = new THREE.SphereGeometry( 100, 16, 8 );
    var mesh = new THREE.Mesh( sphere, new THREE.MeshPhongMaterial( { color: 0xffa00 } ) );
    mesh.scale.set( 0.1, 0.1, 0.1 );
    pointLight.add( mesh );
    camera.add( pointLight );*/
    //scene.add(pointLight);

    pointLight = new THREE.PointLight( 0xffffff, 1,3000 );
    pointLight.position.set( 6000, 2500, -1500 );
    scene.add( pointLight );
    pointLight.add( new THREE.Mesh( new THREE.SphereGeometry( 4, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0xffffff } ) ) );

    var pointLightHelper = new THREE.PointLightHelper(pointLight, 50); // 50 is sphere size
    scene.add(pointLightHelper);
    updateShadowCamera();

}
function updateShadowCamera() {

    //var center = floorplan.getCenter();
    var pos = new THREE.Vector3(6000, 2500, -2500);
    dirLight.position.copy(pos);
   // dirLight.target.position.copy(center);
    dirLight.updateMatrix();
    //dirLight.updateWorldMatrix();
    dirLight.shadowCameraLeft = -d;
    dirLight.shadowCameraRight = d;
    dirLight.shadowCameraTop = d;
    dirLight.shadowCameraBottom = -d;

    var d = 300;

    dirLight.shadowCameraLeft = -d;
    dirLight.shadowCameraRight = d;
    dirLight.shadowCameraTop = d;
    dirLight.shadowCameraBottom = -d;
    dirLight.shadowCameraFar = 1000;
    dirLight.shadowDarkness = 0.5;

    if (dirLight.shadowCamera) {
        dirLight.shadowCamera.left = dirLight.shadowCameraLeft;
        dirLight.shadowCamera.right = dirLight.shadowCameraRight;
        dirLight.shadowCamera.top = dirLight.shadowCameraTop;
        dirLight.shadowCamera.bottom = dirLight.shadowCameraBottom;
        dirLight.shadowCamera.updateProjectionMatrix();
    }
}
function initSky(){
    var vertexShader = document.getElementById( 'vertexShader' ).textContent;
    var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
    var uniforms = {
        topColor:    { value: new THREE.Color( 0x0077ff ) },
        bottomColor: { value: new THREE.Color( 0xffffff ) },
        offset:      { value: 33 },
        exponent:    { value: 0.6 }
    };
    uniforms.topColor.value.copy( hemiLight.color );

    //scene.fog.color.copy( uniforms.bottomColor.value );

    var skyGeo = new THREE.SphereGeometry( 30000, 320, 150 );
    var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );

    var sky = new THREE.Mesh( skyGeo, skyMat );
   scene.add( sky );
}
function eventMgr() {
    window.addEventListener( 'resize', onWindowResize, false );
    document.addEventListener('click', onDocumentClick, false);
    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener("contextmenu", onContextmenu, false);
}
function onDocumentMouseDown(event ) {

}
function onContextmenu(event) {

}
function onDocumentClick() {
    if(gSelectTag)
    {
        var pt=toScreenPosition(gSelectTag, gCameraMgr.camera);
        console.log(pt.x+"********************"+pt.y);
    }

    if(gSelectTag){
        openBox(gModeMap[gSelectTag.parent.uuid]);
    }

    if(gSelectTag){
        gDropCrtl.attach( gSelectTag );
    }
}
function onDocumentMouseMove(event) {
    event.preventDefault();
    gMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    gMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
function onWindowResize() {
    gCameraMgr.camera.aspect = window.innerWidth / window.innerHeight;
    gCameraMgr.camera.updateProjectionMatrix();
    gRenderer.setSize( window.innerWidth, window.innerHeight );
    if(gCameraCtrl ){
        if (gCameraCtrl.persCtrl && gCameraCtrl.persCtrl.enabled){
            gCameraCtrl.persCtrl.handleResize();
        }
        if (gCameraCtrl.firstCtrl && gCameraCtrl.firstCtrl.enabled){
            gCameraCtrl.firstCtrl.handleResize();
        }


    }

}
function onKeyDown(event) {
    // if (event.keyCode == 188 && event.ctrlKey)
    // {
    //     gCameraMgr.currentCamera.position.y -=10;
    //     log(event.keyCode);
    // }

 /*   keyboard[event.keyCode] = true;
    scope.needsUpdate();*/
}
function onKeyUp(event) {
    log(event.keyCode);
/*    keyboard[event.keyCode] = false;
    scope.needsUpdate();

    //扩展灯光控制按钮
    switch ( event.keyCode ) {

        case 72: *//*h*//*

            hemiLight.visible = !hemiLight.visible;
            break;

        case 68: *//*d*//*

            dirLight.visible = !dirLight.visible;
            break;
        case 80: *//*p*//*

            pointLight.visible = ! pointLight.visible;
            break;

    }*/
}
function initModel(){
    // model
    if(gModelList.length<(gnModelIndex+1))
    {
        return;
    }
    var jsObj=gModelList[gnModelIndex];

    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };

    var onError = function ( xhr ) { };

    var texture = new THREE.Texture( generateTexture() );
    texture.needsUpdate = true;

    THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );

    var mtlLoader = new THREE.MTLLoader();
    var sObjUrl="3d_files/obj/"+jsObj.model+"/";
    mtlLoader.setPath(sObjUrl);
    mtlLoader.load( jsObj.model+'.mtl', function( materials ) {

        materials.transparent = true;
        materials.opacity = .8;
        materials.map = texture;
        materials.color = 0xddddd;
        materials.specular = 0x009900;
        materials.shininess = 30;
        materials.flatShading = true;
        materials.emissive = 0xff0000;
        materials.shininess = 10;
        // materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        var sObjUrl="3d_files/obj/"+jsObj.model+"/";
        objLoader.setPath(sObjUrl);
        objLoader.load(jsObj.model+'.obj', function ( object ) {

            //group = new THREE.Group();
            //group.position.y = 50;
            //scene.add(group);

            object.traverse( function ( child ) {

                if ( child instanceof THREE.Mesh ) {
                    // child.material.map = texture;
                    child.castShadow =true;
                    child.receiveShadow =true;

                }
                if(jsObj.isSelect){
                    gModeMap[object.uuid]=jsObj;
                    gSelectList.push(object);
                }

               scene.add( object);
                //child.matrixAutoUpdate = false;
                // child.updateMatrix();
                //BoundingBoxHelper
                var boxHelper = new THREE.BoundingBoxHelper(object, 0x999999);
               scene.add(boxHelper);

                gnModelIndex++;
                initModel();

            } );
            //object.position.y = - 95;
            //scene.add( object );
        }, onProgress, onError );

    });

}
function loadObj(sName) {

    // texture

    var manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {

        console.log( item, loaded, total );

    };

    var texture = new THREE.Texture();

    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };

    var onError = function ( xhr ) {
    };


    var loader = new THREE.ImageLoader( manager );
   // var imgUrl="3dfiles/obj/"+sName+"/";
    loader.load( "../../showroom/3d_files/obj/shinei-dimian-01/maps/Rectangle29872VRay-1.png", function ( image ) {

        texture.image = image;
        texture.needsUpdate = true;

    } );

    // model

    floorMaterialTop = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide,
        color: 0xffffff,
        specular: 0x0a0a0a,
        opacity:0.5,
        transparent:true
    });

    var loader = new THREE.OBJLoader( manager );
    //var sObjUrl="3dfiles/obj/"+sName+"/";
    loader.load( "../../showroom/3d_files/obj/shinei-dimian-01/shinei-dimian-01.obj", function ( object ) {

        object.traverse( function ( child ) {

            if ( child instanceof THREE.Mesh ) {

                //child.material = floorMaterialTop;
                child.material.map = texture;
                child.material.transparent=true;
                child.material.opacity= 0.7;
                child.receiveShadow =true;

            }

        } );

        //object.position.y = - 95;
       scene.add( object );

    }, onProgress, onError );
}
function initGui() {
    var gui = new dat.gui.GUI();

    var folder=gui.addFolder("环境光");
    var Ambient = {
        get "colorR"() {return gLightMgr.ambient.color.r;},
        set "colorR"(v) {gLightMgr.ambient.color.r=v;},
        get "colorG"() {return gLightMgr.ambient.color.g;},
        set "colorG"(v) {gLightMgr.ambient.color.g=v;},
        get "colorB"() {return gLightMgr.ambient.color.b;},
        set "colorB"(v) {gLightMgr.ambient.color.b=v;},
        get "isOff"() {return gLightMgr.ambient.valid; },
        set "isOff"(v) {gLightMgr.trunOnAmbient(v);}
    }
    gui.add( Ambient, "colorR", 0, 2).step(0.01).name("R分量");
    gui.add( Ambient, "colorG", 0, 2).step(0.01).name("G分量");
    gui.add( Ambient, "colorB", 0, 2).step(0.01).name("B分量");
    gui.add( Ambient, "isOff").name("开灯");

     folder=gui.addFolder("室内灯0");
     var pointLight = {
     get "lux"() {return gLightMgr.pointList[0].intensity;},
     set "lux"(v) {gLightMgr.pointList[0].intensity=v;},
     get "isOff"() {return gLightMgr.pointLightStatus[0];},
     set "isOff"(v) {
     if (gLightMgr.pointLightStatus[0]) {
     gLightMgr.offPointLight(0);
     } else {
     gLightMgr.trunOnPointLight(0);
     }
     gLightMgr.pointLightStatus[0] = v;
     }
     };
     gui.add( pointLight, "lux", 0, 5).step(0.1).name("照度");
     gui.add( pointLight, "isOff").name("开灯");

     folder=gui.addFolder("室内灯1");
     var pointLight = {
     get "lux"() {return gLightMgr.pointList[1].intensity;},
     set "lux"(v) {gLightMgr.pointList[1].intensity=v;},
     get "isOff"() {return gLightMgr.pointLightStatus[1];},
     set "isOff"(v) {
     if (gLightMgr.pointLightStatus[1]) {
     gLightMgr.offPointLight(1);
     } else {
     gLightMgr.trunOnPointLight(1);
     }
     gLightMgr.pointLightStatus[1] = v;
     }
     };
     gui.add( pointLight, "lux", 0, 5).step(0.1).name("照度");
     gui.add( pointLight, "isOff").name("开灯");

     folder=gui.addFolder("室内灯2");
     var pointLight = {
     get "lux"() {return gLightMgr.pointList[2].intensity;},
     set "lux"(v) {gLightMgr.pointList[2].intensity=v;},
     get "isOff"() {return gLightMgr.pointLightStatus[2];},
     set "isOff"(v) {
     if (gLightMgr.pointLightStatus[2]) {
     gLightMgr.offPointLight(2);
     } else {
     gLightMgr.trunOnPointLight(2);
     }
     gLightMgr.pointLightStatus[2] = v;
     }
     };
     gui.add( pointLight, "lux", 0, 5).step(0.1).name("照度");
     gui.add( pointLight, "isOff").name("开灯");

    gui.open();
}
//*********************************************************************
function creatCube() {
    for (var i = 0; i < 50; i++) {
        var geometry = new THREE.CubeGeometry(240, 240, 240);
        var material = new THREE.MeshBasicMaterial({color: Math.random() * 0xffffff,  opacity: 0.5});
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = Math.random() * 1000 - 500;
        mesh.position.y = Math.random() * 1000 - 500;
        mesh.position.z = Math.random() * 1000 - 500;
       scene.add(mesh);
    }
}
function raycastProc() {
    var vector = new THREE.Vector3( gMouse.x, gMouse.y, 0.5 );
    gProjector.unprojectVector( vector, gCameraMgr.camera );

    var raycaster = new THREE.Raycaster( gCameraMgr.camera.position, vector.sub( gCameraMgr.camera.position ).normalize() );
    var intersects = raycaster.intersectObjects( gSelectList, true );

    if (0<intersects.length) {

        if (gSelectTag != intersects[0].object) {
            if (gSelectTag) gSelectTag.material.color.setHex(gSelectTag.currentHex);
            if(null!=gSelectTag){
                gDropCrtl.detach( gSelectTag );
            }
            gSelectTag = intersects[0].object;
            gSelectTag.currentHex = gSelectTag.material.color.getHex();
            gSelectTag.material.color.set( 0xff0000 );
            document.body.style.cursor = "pointer";
        }
    } else {
        if (gSelectTag) {
            gSelectTag.material.color.set(gSelectTag.currentHex);
            gSelectTag = null;
            document.body.style.cursor = "auto";
        }

    }
}
function toScreenPosition(obj, camera)
{
    var vector = new THREE.Vector3();
    var widthHalf = 0.5*gRenderer.context.canvas.width;
    var heightHalf = 0.5*gRenderer.context.canvas.height;
    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera);
    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;
    return {
        x: vector.x,
        y: vector.y
    };
};
function log(txt){
    console.log(txt);
}
function changeCameraCtrl() {
    if(undefined==gCameraCtrl){
        return;
    }
    gCameraMgr.firstCtrl.enabled=false;
    gCameraMgr.persCtrl.enabled=false;
    if(gCameraCtrl==gCameraMgr.firstCtrl)
    {
        gCameraCtrl=gCameraMgr.persCtrl;
        document.getElementById('imgCamerCtrl').src = "image/man-tin.png";
    }else{
        gCameraCtrl=gCameraMgr.firstCtrl;
        document.getElementById('imgCamerCtrl').src = "image/man-zou.png";
    }
    gCameraCtrl.enabled=true;
    console.log("*******************");
}
function openBox(param) {
    gCameraCtrl.enabled=false;
    $("#showframe",parent.document.body).attr("src",gUrlList[param.type]);
    $("#box").css("display", "block");
}
function closebox() {
    $("#box").css("display", "none");
    gCameraCtrl.enabled=true;
}
