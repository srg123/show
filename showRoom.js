
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
var container, stats;
var camera, gLightMgr;
var scene, renderer;
var controls1,controls2,controls3;
var gDefaultTag=undefined;
var gSelectTag=null;
var gRaycaster=undefined;
var gMouse= new THREE.Vector2();
var clock = new THREE.Clock();


var gnModelIndex=0;
var gSelectList=[];
var gModeMap={};
var gProjector = new THREE.Projector();

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var groundMirrorMaterial;

//背景变量
var cameraCube, sceneCube;
var textureEquirec, textureCube, textureSphere;
var cubeMesh, sphereMesh;
var sphereMaterial;
var refract;

//tomaping
var params3 = {
    opacity: 1.0,
    roughness: 1.0,
    bumpScale: 1.0,
    exposure: 3.0,
    whitePoint: 5.0,
    toneMapping: "Uncharted2",
    renderMode: "Renderer"
};

var toneMappingOptions = {
    None: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Uncharted2: THREE.Uncharted2ToneMapping,
    Cineon: THREE.CineonToneMapping
};

var composer3;
var standardMaterial, standardMaterialPremultiplied, floorMaterial;


//SSAA
var composer2, copyPass2;
var  ssaaRenderPassP;

//TAA
var composer, copyPass, taaRenderPass, renderPass;
var param = { TAAEnabled: "1", TAASampleLevel: 32 };


var postprocessing = { enabled: false, ao_only: false, radius: 32 };


var params2 = {
    sampleLevel:4,  //抗锯齿级别
    renderToScreen:true,
    unbiased: true,
    camera: 'perspective',
    clearColor: 'black',
    clearAlpha: 1.0,
    autoRotate: true

};

/*createMtlObj({
 mtlPath: "3d_files/obj/"+jsObj.model+"/",
 mtlFileName:jsObj.model+".mtl",
 objPath:"3d_files/obj/"+jsObj.model+"/",
 objFileName:jsObj.model+".obj"
 })*/


//*********************************************************************
//初始化、动画

init();
animate();
function init() {
    initScene();

    initCamera();
    initRenderer();

    initLight();
    loadSerialized(data);
    //homeEve();
    loadObj("shinei-dimian-01");
   // backgroundFloor();
    //toneMaping();
    initEvent();
    initControls();
    initHelp();
  //  initPostprocessing();

}
function animate() {
    requestAnimationFrame( animate );
    stats.begin();
    render();
    stats.end();
}
function render() {

    camera.lookAt(scene.position )

    Rendering();


    if ( postprocessing.enabled ) {
        composer2.render();

    } else {

        renderer.render( scene, camera );

    }

 /*   if( params3.renderMode === "Composer" ) {
        composer3.render();
    }
    else {
        renderer.render( scene, camera );
    }*/


}
function Rendering(){
    var delta = clock.getDelta();
   // console.log(delta);
    if( controls1 &&  controls1.enabled)
    {
        controls1.update( delta );// required if controls.enableDamping = true, or if controls.autoRotate = true
    }
    if( controls2 &&  controls2.enabled)(

        controls2.update( delta )
    )

    if(data.items.length){
        raycastProc();
        if(gSelectTag){
            controls3.update();
        }

    }

    //console.log(standardMaterial !== undefined);
/*    if ( standardMaterial !== undefined ) {

        standardMaterial.roughness = params.roughness;
        standardMaterial.bumpScale = - 0.05 * params.bumpScale;
        standardMaterial.opacity = params.opacity;

    }
    if( renderer.toneMapping !== toneMappingOptions[ params.toneMapping ] ) {
        renderer.toneMapping = toneMappingOptions[ params.toneMapping ];
        if( standardMaterial ) standardMaterial.needsUpdate = true;

    }*/
    //renderer.toneMappingExposure = params.exposure;
   // renderer.toneMappingWhitePoint = params.whitePoint;

    //SSAA
    //ssaaRenderPassP.sampleLevel = params2.sampleLevel;
    //copyPass2.enabled = !params2.renderToScreen;


}
function initScene(){

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    //gScene.background = new THREE.Color( 0x000000);
    // scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );

    scene = new THREE.Scene();
    //scene.background = new THREE.Color( 0xffffff );
    // scene.fog = new THREE.FogExp2( 0xffffff, 0.00015 );
}
function initCamera() {

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set( 0, 200, 300 );
    // camera.position.set(0, 800,0);
    //camera.rotation.x=Math.PI * 0.47;

}
function initControls(){

    controls1 = new THREE.OrbitControls(camera, renderer.domElement);
    //controls1.addEventListener('change', render); // remove when using animation loop
    {
        // enable animation loop when using damping or autorotation
        //controls1.enableDamping = true;
        //controls1.dampingFactor = 0.25;
        controls1.enableZoom = true;
        controls1.minPolarAngle = Math.PI * 0.01;
        // controls1.maxPolarAngle = 0.9 * Math.PI / 2;
        controls1.maxPolarAngle = Math.PI * 0.47;
        // controls1.target.set(0, 30, 0);
        // controls1.maxDistance = 500;
        //controls1.minDistance = 0;


    }

    controls1.enabled = true;


    controls2 = new THREE.FirstPersonControls(camera, renderer.domElement);
    {
        controls2.movementSpeed = 1000;
        controls2.lookSpeed = 0.1;
    }

    controls2.enabled = false;

    controls3 = new THREE.TransformControls( camera, renderer.domElement );
    controls3.addEventListener( 'change', renderer );
    scene.add(controls3);

}
function initRenderer(){

    renderer = new THREE.WebGLRenderer(
        {
            antialias: true,
            precision: "highp",
            alpha: true,
            premultipliedAlpha: false,
            stencil: false
           // preserveDrawingBuffer: true //是否保存绘图缓冲
        }
    );
    //renderer.sortObjects = true;
    //renderer.autoClear = true;
    //renderer.shadowMap.enabled = true;
    //renderer.shadowMapSoft = true;
    //renderer.shadowMapType = THREE.PCFSoftShadowMap;
    //renderer.shadowMap.renderReverseSided = false;


    //tonmapping
    renderer.shadowMap.enabled = true;
    renderer.gammaInput = true;
    renderer.gammaOutput = true;



    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight  );

  //  renderer.autoClear = false;
  //  renderer.setFaceCulling( THREE.CullFaceNone );

    container.appendChild( renderer.domElement );
}
function initPostprocessing(){
    //超级采样抗锯齿（SSAA）>多重采样抗锯齿（MSAA）>快速近似抗锯齿(FXAA)
    //SSAA

    composer2 = new THREE.EffectComposer( renderer );

    ssaaRenderPassP = new THREE.SSAARenderPass( scene, camera );
    ssaaRenderPassP.sampleLevel = params2.sampleLevel;
    composer2.addPass( ssaaRenderPassP );

   /* taaRenderPass = new THREE.TAARenderPass( scene, camera );
    taaRenderPass.sampleLevel = param.TAASampleLevel;
    composer2.addPass( taaRenderPass );*/

     renderPass = new THREE.RenderPass( scene, camera );
     renderPass.enabled = false;
    composer2.addPass( renderPass );

    copyPass2 = new THREE.ShaderPass( THREE.CopyShader );
    copyPass2.renderToScreen = true;
    composer2.addPass( copyPass2 );


    //SMAA

   /* composer3 = new THREE.EffectComposer( renderer );
    composer3.addPass( new THREE.RenderPass( scene, camera ) );

    pass = new THREE.SMAAPass( window.innerWidth, window.innerHeight );
    pass.renderToScreen = true;
    composer3.addPass( pass );*/


    /*
        //tonMaping
        //在render循环中，使用EffectComposer渲染场景、应用通道，并输出结果
        composer = new THREE.EffectComposer( renderer );
        composer.setSize( window.innerWidth, window.innerHeight );

        //RenderPass通道，这个通道会渲染场景，但不会将渲染结果输出到屏幕上。
        //RenderPass/该通道在指定的场景和相机的基础上渲染出一个新场景
        var renderScene = new THREE.RenderPass( scene, camera );
        composer.addPass( renderScene );

        // ShaderPass/使用该通道你可以传入一个自定义的着色器，用来生成高级的、自定义的后期处理通道
        //传入了CopyShader着色器，用于拷贝渲染结果
        var copyPass = new THREE.ShaderPass( THREE.CopyShader );
        copyPass.renderToScreen = true;
        composer.addPass( copyPass );
    */

/*
    composer3 = new THREE.EffectComposer( renderer );
    composer3.setSize( window.innerWidth, window.innerHeight );

    var renderScene = new THREE.RenderPass( scene, camera );
    composer3.addPass( renderScene );

    var copyPass = new THREE.ShaderPass( THREE.CopyShader );
    copyPass.renderToScreen = true;
    composer3.addPass( copyPass );*/
    //

}
function loadObj(sName) {

    group = new THREE.Group();
    //group.position.y = 50;
    scene.add(group);

    var groundMirror = new THREE.Mirror( 236, 167, {
        clipBias: 0.003,
        textureWidth: WIDTH * window.devicePixelRatio,
        textureHeight: HEIGHT * window.devicePixelRatio,
        color: 0x777777
    } );
    groundMirror.rotateX( - Math.PI / 2 );
    groundMirror.material.side = THREE.DoubleSide;
    groundMirror.receiveShadow=true;
    group.add( groundMirror );

    //make floor
    //var planeGeo = new THREE.PlaneBufferGeometry( 236, 167 );
    //var mirrorMesh = new THREE.Mesh( planeGeo, groundMirror.material );
    //mirrorMesh.add(groundMirror);
    //mirrorMesh.rotation.set(Math.PI / 4, 100, 0);
    // groundMirror.rotateX( Math.PI / 2 );
    // group.add(mirrorMesh);


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
        var imgUrl="3d_files/obj/"+sName+"/";
        loader.load( imgUrl+"maps/"+sName+'.jpg', function ( image ) {
            texture.image = image;
            texture.needsUpdate = true;

        } );

    standardMaterial = new THREE.MeshStandardMaterial( {
        bumpScale: - 0.05,
        color: 0xffffff,
        metalness: 0.9,
        roughness: 0.8,
        premultipliedAlpha: true,
        transparent: true
    } );
/*    standardMaterial2 = new THREE.MeshStandardMaterial( {
        map: null,
        roughnessMap: null,
        color: 0x888888,
        metalness: 0.0,
        roughness: 1.0,
        side: THREE.BackSide
    } );*/
    var textureLoader = new THREE.TextureLoader();

    textureLoader.load( "3d_files/obj/shinei-dimian-01/maps/shinei-dimian-01.jpg", function( map ) {
        map.wrapS =  map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 4;
        map.repeat.set( 1, 1 );
        standardMaterial.map = map;
        standardMaterial.needsUpdate = true;
        standardMaterial.magFilter = THREE.NearestFilter;
        standardMaterial.format = THREE.RGBFormat;
    } );
    textureLoader.load( "3d_files/obj/shinei-dimian-01/maps/shinei-dimian-bump.jpg", function( map ) {
        map.wrapS =  map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 4;
        map.repeat.set( 1, 1 );
        standardMaterial.bumpMap = map;
        standardMaterial.needsUpdate = true;
        standardMaterial.magFilter = THREE.NearestFilter;
        standardMaterial.format = THREE.RGBFormat;
    } );
    textureLoader.load( "3d_files/obj/shinei-dimian-01/maps/shinei-dimian-01.jpg", function( map ) {
        map.wrapS =  map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 4;
        map.repeat.set( 1, 1 );
        standardMaterial.roughnessMap = map;
        standardMaterial.needsUpdate = true;
        standardMaterial.magFilter = THREE.NearestFilter;
        standardMaterial.format = THREE.RGBFormat;
    } );



/*    var geometry = new THREE.BoxBufferGeometry( 236, 2, 167 );
    var mesh = new THREE.Mesh( geometry, floorMaterial );
    mesh.position.y = 50;
    mesh.rotation.x = - Math.PI * 0.5;
    mesh.receiveShadow = true;
    scene.add( mesh );*/


/*    var hdrpath = "3d_files/texture/cube/pisaHDR/";
    var hdrformat = '.hdr';
    var hdrurls = [
        hdrpath + 'px' + hdrformat, hdrpath + 'nx' + hdrformat,
        hdrpath + 'py' + hdrformat, hdrpath + 'ny' + hdrformat,
        hdrpath + 'pz' + hdrformat, hdrpath + 'nz' + hdrformat
    ];


    var hdrCubeMap = new THREE.HDRCubeTextureLoader().load( THREE.UnsignedByteType, hdrurls, function ( hdrCubeMap ) {

        var pmremGenerator = new THREE.PMREMGenerator( hdrCubeMap );
        pmremGenerator.update( renderer );

        var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker( pmremGenerator.cubeLods );
        pmremCubeUVPacker.update( renderer );

        //standardMaterial.envMap = pmremCubeUVPacker.CubeUVRenderTarget.texture;
        standardMaterial.needsUpdate = true;

    } );*/


    var loader = new THREE.OBJLoader( manager );
    var sObjUrl="3d_files/obj/"+sName+"/";
    loader.load( sObjUrl+sName+'.obj', function ( object ) {

        object.traverse( function ( child ) {

            if ( child instanceof THREE.Mesh ) {

              //  child.material = standardMaterial;
                child.material.needsUpdate = true;
                child.material.map = texture;
                child.material.envMap = textureCube;
                child.material.transparent=true;
                child.material.opacity= 0.8;
                child.receiveShadow =true;
               // child.castShadow = true;
                child.position.set(-97,0,68);
                child.scale.x =  child.scale.y =  child.scale.z = 0.01;
                child.updateMatrix();

            }

        } );

        object.position.y = 0;
        group.add( object );

    }, onProgress, onError );


}
function homeEve(){
    cameraCube = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 100000 );
    sceneCube = new THREE.Scene();

    // Textures
    var r = "3d_files/texture/cube/Bridge2/";
    var urls = [ r + "posx.jpg", r + "negx.jpg",
        r + "posy.jpg", r + "negy.jpg",
        r + "posz.jpg", r + "negz.jpg" ];

    var r2 = "3d_files/texture/cube/MilkyWay/";
    var urls2 = [ r2 + "dark-s_px.jpg", r2 + "dark-s_nx.jpg",
        r2 + "dark-s_py.jpg", r2 + "dark-s_ny.jpg",
        r2 + "dark-s_pz.jpg", r2 + "dark-s_nz.jpg" ];

    textureCube = new THREE.CubeTextureLoader().load( urls2 );
    textureCube.format = THREE.RGBFormat;
    textureCube.mapping = THREE.CubeReflectionMapping;


    var textureLoader = new THREE.TextureLoader();

    textureEquirec = textureLoader.load( "3d_files/texture/2294472375_24a3b8ef46_o.jpg" );
    textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
    textureEquirec.magFilter = THREE.LinearFilter;
    textureEquirec.minFilter = THREE.LinearMipMapLinearFilter;

    textureSphere = textureLoader.load( "3d_files/texture/metal.jpg" );
    textureSphere.mapping = THREE.SphericalReflectionMapping;


    // Materials

    var equirectShader = THREE.ShaderLib[ "equirect" ];

    var equirectMaterial = new THREE.ShaderMaterial( {
        fragmentShader: equirectShader.fragmentShader,
        vertexShader: equirectShader.vertexShader,
        uniforms: equirectShader.uniforms,
        depthWrite: false,
        side: THREE.BackSide
    } );

    equirectMaterial.uniforms[ "tEquirect" ].value = textureEquirec;

    var cubeShader = THREE.ShaderLib[ "cube" ];
    var cubeMaterial = new THREE.ShaderMaterial( {
        fragmentShader: cubeShader.fragmentShader,
        vertexShader: cubeShader.vertexShader,
        uniforms: cubeShader.uniforms,
        depthWrite: false,
        side: THREE.BackSide
    } );

    cubeMaterial.uniforms[ "tCube" ].value = textureCube;


    // Skybox

    cubeMesh = new THREE.Mesh( new THREE.BoxBufferGeometry( 100, 100, 100 ), cubeMaterial );
    sceneCube.add( cubeMesh );

}
function backgroundFloor(){

    var objects = [], materials2 = [];

    var texture2 = new THREE.Texture( generateTexture() );
    texture2.needsUpdate = true;

    materials2.push( new THREE.MeshLambertMaterial( { map: texture2, transparent: true } ) );
    materials2.push( new THREE.MeshLambertMaterial( { color: 0xdddddd } ) );
    materials2.push( new THREE.MeshPhongMaterial( { color: 0xdddddd, specular: 0x009900, shininess: 30, flatShading: true } ) );
    materials2.push( new THREE.MeshNormalMaterial() );
    materials2.push( new THREE.MeshBasicMaterial( { color: 0xffaa00, transparent: true, blending: THREE.AdditiveBlending } ) );
    materials2.push( new THREE.MeshBasicMaterial( { color: 0xff0000, blending: THREE.SubtractiveBlending } ) );

    materials2.push( new THREE.MeshLambertMaterial( { color: 0xdddddd } ) );
    materials2.push( new THREE.MeshPhongMaterial( { color: 0xdddddd, specular: 0x009900, shininess: 30, map: texture2, transparent: true } ) );
    materials2.push( new THREE.MeshNormalMaterial( { flatShading: true } ) );
    materials2.push( new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } ) );

    materials2.push( new THREE.MeshDepthMaterial() );

    materials2.push( new THREE.MeshLambertMaterial( { color: 0x666666, emissive: 0xff0000 } ) );
    materials2.push( new THREE.MeshPhongMaterial( { color: 0x000000, specular: 0x666666, emissive: 0xff0000, shininess: 10, opacity: 0.9, transparent: true } ) );

    materials2.push( new THREE.MeshBasicMaterial( { map: texture2, transparent: true } ) );

    /* backgroundMaterial = new THREE.MeshStandardMaterial( {
     //transparent: true,
     // opacity : .1,
     map: null,            //纹理贴图颜色由diffuse .color调制
     roughnessMap: null, //该纹理的绿色通道用于改变材料的粗糙度。
     //color: 0x888888,
     metalness: 0.0,    //改变材质的金属性
     roughness: 1.0,
     //side: THREE.DoubleSide
     side: THREE.BackSide
     } );*/

    var textureLoader = new THREE.TextureLoader();
    textureLoader.load( "3d_files/texture/bk/00002VRay.jpg", function( map ) {
        // map.wrapS = THREE.RepeatWrapping;
        // map.wrapT = THREE.RepeatWrapping;
        // map.anisotropy = 16;
        // map.repeat.set(0.0005, 0.0005);
        materials2[6].map = map;
        materials2[6].needsUpdate = true;
    } );
    // var geometry = new THREE.SphereBufferGeometry( 500, 6, 4 );
    //geometry.scale( - 1, 1, 1 );
    var geometry = new THREE.BoxBufferGeometry( 10000, 0, 10000 );
    var mesh = new THREE.Mesh( geometry,materials2[6] );
    mesh.position.y = -1;
    //mesh.rotation.x = - Math.PI * 0.5;
    mesh.receiveShadow = true;
    scene.add( mesh );
}
//模型数据加载重构
function loadSerialized(data) {

    $.each(data.items, function(i,val){
        var options = {
            mtlPath: val.mtlPath + val.item_name +"/",
            mtlFileName:val.item_name+".mtl",
            objPath:val.objPath + val.item_name +"/",
            objFileName:val.item_name+".obj",
            thisObj:val
        }
        loadModel2(options)

    });


}
function loadModel2(options){

    var jsObj=data.items[gnModelIndex];

    THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath( options.mtlPath );
    mtlLoader.load( options.mtlFileName, function( materials ) {
        materials.preload();
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( options.objPath );
        objLoader.load( options.objFileName, completeCallback, onProgress, onError);

    });

    var completeCallback =  function(object){

        object.traverse( function ( child ) {
            if ( child instanceof THREE.Mesh ) {
                child.castShadow =true;
                child.receiveShadow =true;
                child.updateMatrix();
                child.material.side = THREE.DoubleSide;
                //child.material.emissive.r=0;//设置rgb通道R通道颜色
                //child.material.emissive.g=0.01;//设置rgb通道G通道颜色
                // child.material.emissive.b=0.05;//设置rgb通道B通道颜色
                //child.material.transparent=true;
                //child.material.opacity=0;
                child.material.SmoothShading = true;

                if(child.name === "Arc22"){
                       child.position.set(0,200,0);
                       console.log(child);
                   }

                if(child.name === "Rectangle29872"){
                    child.position.y = -2;
                   // child.material.needsUpdate = true;
                   // child.material.map = texture;
                    child.material.transparent=true;
                    child.material.opacity= 0.8;
                   // loadObj();
                }
            }
        } );

        //object.emissive=0xffffff;//自发光颜色
       // object.ambient=0xffffff;//环境光颜色
        object.position.set(-97, 0, 68);
        object.scale.x = object.scale.y = object.scale.z = 0.01;
        object.updateMatrix();
        //var boxHelper = new THREE.BoundingBoxHelper(object, 0x999999);
        //scene.add(boxHelper);

        var thisObj = options.thisObj;
         if(thisObj.isSelect){
               gModeMap[object.uuid] = thisObj ;
               gSelectList.push(object);
           }

        gnModelIndex++;
        scene.add( object );
    };

    var manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {

        console.log( item, loaded, total );
    };
    var onProgress = function(xhr){
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            if(typeof options.progress =="function"){
                options.progress( Math.round(percentComplete, 2));
            }
            //console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };
    var onError = function(xhr){
        // $("#havenloading .progress").css("width",persent+"%");
    }

}
function toneMaping(){

    // Textures
    var r = "3d_files/texture/cube/Bridge2/";
    var urls = [ r + "posx.jpg", r + "negx.jpg",
        r + "posy.jpg", r + "negy.jpg",
        r + "posz.jpg", r + "negz.jpg" ];

    var r2 = "3d_files/texture/cube/MilkyWay/";
    var urls2 = [ r2 + "dark-s_px.jpg", r2 + "dark-s_nx.jpg",
        r2 + "dark-s_py.jpg", r2 + "dark-s_ny.jpg",
        r2 + "dark-s_pz.jpg", r2 + "dark-s_nz.jpg" ];

    textureCube = new THREE.CubeTextureLoader().load( urls2 );
    textureCube.format = THREE.RGBFormat;
    textureCube.mapping = THREE.CubeReflectionMapping;

    standardMaterial = new THREE.MeshStandardMaterial( {
        bumpScale: - 0.05,
        color: 0xffffff,
        metalness: 0.9,
        roughness: 0.8,
        premultipliedAlpha: true,
        transparent: true
     //  envMap:textureCube

    } );


 /*   standardMaterial = new THREE.MeshPhysicalMaterial( {
        map: null,
        color: 0xffffff,
        metalness: 0.0,
        roughness: 0,
        opacity: 0.15,
        side: THREE.FrontSide,
        transparent: true,
        envMapIntensity: 1,
        premultipliedAlpha: true,
        envMap:textureCube
    } );*/


    var textureLoader = new THREE.TextureLoader();

    textureLoader.load( "3d_files/texture/maping2/hardwood2_diffuse.jpg", function( map ) {
        map.wrapS =  map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 4;
        map.repeat.set( 1, 1 );
        standardMaterial.map = map;
        standardMaterial.needsUpdate = true;
        standardMaterial.magFilter = THREE.NearestFilter;
        standardMaterial.format = THREE.RGBFormat;
    } );
    textureLoader.load( "3d_files/texture/maping2/hardwood2_bump.jpg", function( map ) {
        map.wrapS =  map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 4;
        map.repeat.set( 1, 1 );
        standardMaterial.bumpMap = map;
        standardMaterial.needsUpdate = true;
        standardMaterial.magFilter = THREE.NearestFilter;
        standardMaterial.format = THREE.RGBFormat;
    } );
    textureLoader.load( "3d_files/texture/maping2/hardwood2_roughness.jpg", function( map ) {
        map.wrapS =  map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 4;
        map.repeat.set( 1, 1 );
        standardMaterial.roughnessMap = map;
        standardMaterial.needsUpdate = true;
        standardMaterial.magFilter = THREE.NearestFilter;
        standardMaterial.format = THREE.RGBFormat;
    } );
    group2 = new THREE.Group();
    scene.add( group2 );

    //var geometry = new THREE.TorusKnotGeometry( 18, 8, 150, 20 );
    var geometry = new THREE.BoxBufferGeometry( 238, 0.5, 167 );
    var mesh = new THREE.Mesh( geometry, standardMaterial );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(-1,3,0);
    group2.add( mesh );



 // Materials
    var hdrpath = "3d_files/texture/cube/pisaHDR/";
    var hdrformat = '.hdr';
    var hdrurls = [
        hdrpath + 'px' + hdrformat, hdrpath + 'nx' + hdrformat,
        hdrpath + 'py' + hdrformat, hdrpath + 'ny' + hdrformat,
        hdrpath + 'pz' + hdrformat, hdrpath + 'nz' + hdrformat
    ];


     var hdrCubeMap = new THREE.HDRCubeTextureLoader().load( THREE.UnsignedByteType, hdrurls, function ( hdrCubeMap ) {

     var pmremGenerator = new THREE.PMREMGenerator( hdrCubeMap );
     pmremGenerator.update( renderer );

     var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker( pmremGenerator.cubeLods );
     pmremCubeUVPacker.update( renderer );

     standardMaterial.envMap = pmremCubeUVPacker.CubeUVRenderTarget.texture;
     standardMaterial.needsUpdate = true;

     } );

}
function initLight() {

    ambient = new THREE.AmbientLight(0xffffff );
    scene.add( ambient );
    //自动行走
    /*   guide = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({color: 0xffffff}));
     guide.position.set(1500, 900, -6000);
     guide.castShadow=true;
     guide.receiveShadow=true;
     scene.add(guide);*/
    /*
     gLightMgr=new LightMgr(gScene, false);
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
    /*
     hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
     hemiLight.color.setHSL( 0.6, 1, 0.6 );
     hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
     hemiLight.position.set( 0, 50, 0 );
     scene.add( hemiLight );
     */

    // hemiLightHelper = new THREE.HemisphereLightHelper( hemiLight, 10 );
    // scene.add( hemiLightHelper );


    // var  dirLight, dirLightHeper, hemiLight, hemiLightHelper;
    //方向光
    /*    dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
     dirLight.color.setHSL( 0.1, 1, 0.95 );
     dirLight.position.set( -1, 100, 1 );
     dirLight.position.multiplyScalar( 30 );
     scene.add( dirLight );

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

     */

    //点光源扩展
    pointLight = new THREE.PointLight(0xcccccc, 1.7, 1000);
    pointLight.position.set(0,20,0);
    pointLight.castShadow = true;
    scene.add( pointLight);
    //  scene.add(new THREE.PointLightHelper(pointLight,5));

    // var light2 = new THREE.DirectionalLight( 0xaabbff, 1 );
    // light2.position.x = 300;
    // light2.position.y = 250;
    // light2.position.z = -500;
    //  scene.add( light2 );
    //  dirLightHeper = new THREE.DirectionalLightHelper( light2, 50 )
    // scene.add( dirLightHeper );

    /*   var gui, shadowCameraHelper, shadowConfig = {

     shadowCameraVisible: true,
     shadowCameraNear: 750,
     shadowCameraFar: 4000,
     shadowCameraFov: 30,
     shadowBias: -0.0002

     };

     sunLight = new THREE.SpotLight( 0xffffff, 0.3, 0, Math.PI/2 );
     sunLight.position.set( 100, 200, 1000 );;

     sunLight.castShadow = true;

     sunLight.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( shadowConfig.shadowCameraFov, 1, shadowConfig.shadowCameraNear, shadowConfig.shadowCameraFar ) );
     sunLight.shadow.bias = shadowConfig.shadowBias;

     scene.add( sunLight );

     // SHADOW CAMERA HELPER

     shadowCameraHelper = new THREE.CameraHelper( sunLight.shadow.camera );
     shadowCameraHelper.visible = shadowConfig.shadowCameraVisible;
     scene.add( shadowCameraHelper );*/
}
function initEvent(){
    window.addEventListener( 'resize', onWindowResize, false );
    //document.addEventListener('click', onDocumentClick, false);
    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );
    document.addEventListener('mousemove', onDocumentMouseMove, false);
}
function initHelp(){

    var axisHelper = new THREE.AxisHelper(800);
    scene.add(axisHelper);
    //状态栏位置信息
    stats = new Stats();
    container.appendChild( stats.dom );

    gRaycaster=new THREE.Raycaster();


    var info = document.createElement( 'div' );
    info.style.position = 'absolute';
    info.style.top = '10px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.innerHTML = 'Drag to change the view';
    container.appendChild( info );

    //var cameraParObj = new THREE.Object3D();
    //cameraParObj.position.y = 200;
    //cameraParObj.position.z = 700;
    // scene.add(cameraParObj);
    // cameraParObj.add(cameraCube);
    // var cameraHelper2 = new THREE.CameraHelper(cameraCube);
    // scene.add(cameraHelper2);


}
function onDocumentClick() {
    if(gSelectTag)
    {
        var pt=toScreenPosition(gSelectTag, camera);
        console.log(pt.x+"********************"+pt.y);
    }

    if(gSelectTag){
        openBox(gModeMap[gSelectTag.parent.uuid]);
    }

    if(gSelectTag){
        controls3.attach( gSelectTag );
    }
}
function onDocumentMouseMove(event) {
    event.preventDefault();
    gMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    gMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
function onDocumentMouseDown(event ) {

}
function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

    // cameraCube.aspect = window.innerWidth / window.innerHeight;
    //cameraCube.updateProjectionMatrix();
    //controls1.handleResize();

    //SSAA
    if (composer2){
        composer2.setSize(  window.innerWidth, window.innerHeight );
    }

/*   //SMAA
    var width = window.innerWidth;
    var height = window.innerHeight;

    var pixelRatio = renderer.getPixelRatio();
    var newWidth  = Math.floor( width / pixelRatio ) || 1;
    var newHeight = Math.floor( height / pixelRatio ) || 1;
    composer3.setSize( newWidth, newHeight );*/


//TAA SSAA
 /*   var width = window.innerWidth;
    var height = window.innerHeight;

    var pixelRatio = renderer.getPixelRatio();
    var newWidth  = Math.floor( width / pixelRatio ) || 1;
    var newHeight = Math.floor( height / pixelRatio ) || 1;
    composer2.setSize( newWidth, newHeight );
*/

    /*  if (controls1 && controls1.enabled){
     controls1.handleResize();
     }
     if (controls2 && controls2.enabled){
     controls2.handleResize();
     }*/



}
function onKeyDown(event) {
    // if (event.keyCode == 188 && event.ctrlKey)
    // {
    //     camera.currentCamera.position.y -=10;
    //     console.log(event.keyCode);
    // }
}
function onKeyUp(event) {
    console.log(event.keyCode);
}
function raycastProc() {
    var vector = new THREE.Vector3( gMouse.x, gMouse.y, 0.5 );
    //gProjector.unprojectVector( vector,camera);  //旧版本
    vector.unproject( camera );

    var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
    var intersects = raycaster.intersectObjects( gSelectList, true );

    if (0<intersects.length) {

        if (gSelectTag != intersects[0].object) {
            if (gSelectTag) gSelectTag.material.color.setHex(gSelectTag.currentHex);
            if(null!=gSelectTag){
                controls3.detach( gSelectTag );
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
function toScreenPosition(obj, camera) {
    var vector = new THREE.Vector3();
    var widthHalf = 0.5*renderer.context.canvas.width;
    var heightHalf = 0.5*renderer.context.canvas.height;
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
function changeControls() {


    if(controls2.enabled){
        console.log("controls2是真的")
        document.getElementById('imgCamerCtrl').src = "image/man-tin.png";
        controls2.enabled=false;
        controls1.enabled=true;
    }else{
        console.log("controls2是假的")

        document.getElementById('imgCamerCtrl').src = "image/man-zou.png";
        controls2.enabled=true;
        controls1.enabled=false;
    }


    //  console.log("控制器运行中");


}
function openBox(param) {
    controls1.enabled=false;
    controls2.enabled=false;
    $("#showframe",parent.document.body).attr("src",gUrlList[param.type]);
    $("#box").css("display", "block");
}
function closebox() {
    $("#box").css("display", "none");
    controls1.enabled=true;
    controls2.enabled=true;


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
    /*
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
     */
    gui.open();
}
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
function fillScene() {


    var gui = new dat.GUI();
    var decalNormal = new THREE.TextureLoader().load( '3dfils/decal/decal-normal.jpg' );

    var decalDiffuse = new THREE.TextureLoader().load( '3dfils/decal/decal-diffuse.png' );
    decalDiffuse.wrapS = decalDiffuse.wrapT = THREE.RepeatWrapping;

    var planeGeo = new THREE.PlaneBufferGeometry(800, 1200);
    // MIRROR planes
    var groundMirror = new THREE.MirrorRTT( 100, 100, { clipBias: 0.003, textureWidth: WIDTH, textureHeight: HEIGHT } );

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
    //groundMirrorMaterial.environmentAlpha = mask;
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

    //gScene.fog.color.copy( uniforms.bottomColor.value );

    var skyGeo = new THREE.SphereGeometry( 30000, 320, 150 );
    var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );

    var sky = new THREE.Mesh( skyGeo, skyMat );
    scene.add( sky );
}
function eventMgr() {

}
//自定义canvas纹理
function generateTexture() {

    var canvas = document.createElement( 'canvas' );
    canvas.width = 256;
    canvas.height = 256;

    var context = canvas.getContext( '2d' );
    var image = context.getImageData( 0, 0, 256, 256 );

    var x = 0, y = 0;

    for ( var i = 0, j = 0, l = image.data.length; i < l; i += 4, j ++ ) {

        x = j % 256;
        y = x == 0 ? y + 1 : y;

        image.data[ i ] = 255;
        image.data[ i + 1 ] = 255;
        image.data[ i + 2 ] = 255;
        image.data[ i + 3 ] = Math.floor( x ^ y );

    }

    context.putImageData( image, 0, 0 );

    return canvas;

}
// Square
var squareShape = new THREE.Shape();
squareShape.moveTo( 0, 0 );
squareShape.lineTo( 230, 0 );
squareShape.lineTo( 230, 161 );
squareShape.lineTo( 0, 161 );
squareShape.lineTo( 0, 0 );

var extrudeSettings = { amount: 1, bevelEnabled: true, bevelSegments: 2, steps: 0, bevelSize: 0, bevelThickness: 0 };

//addShape( squareShape,extrudeSettings, 0x0040f0,  0,  0, 0, 0, 0, 0, 1 );

function addShape( shape, extrudeSettings, color, x, y, z, rx, ry, rz, s ) {


    // Square

    var squareShape = new THREE.Shape();
    squareShape.moveTo( 0, 0 );
    squareShape.lineTo( 236, 0 );
    squareShape.lineTo( 236, 167 );
    squareShape.lineTo( 0, 167 );
    squareShape.lineTo( 0, 0 );


    var extrudeSettings = { amount: 1, bevelEnabled: true, bevelSegments: 2, steps: 0, bevelSize: 0, bevelThickness: 0 };

    var loader = new THREE.TextureLoader();

    var imgUrl2="3d_files/texture/bk/";

    var texture = loader.load(imgUrl2+'00002VRay.png');

    // it's necessary to apply these settings in order to correctly display the texture on a shape geometry

    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 0.008, 0.008 );


    // flat shape with texture
    // note: default UVs generated by ShapeBufferGeometry are simply the x- and y-coordinates of the vertices

    //var geometry = new THREE.ShapeBufferGeometry( shape );


    // flat shape

    /*var geometry = new THREE.ShapeBufferGeometry( shape );

     var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: color, side: THREE.DoubleSide } ) );
     mesh.position.set( x, y, z - 125 );
     mesh.rotation.set( rx, ry, rz );
     mesh.scale.set( s, s, s );
     group.add( mesh );*/

    // extruded shape

    var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );

    var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: color,texture:texture } ) );
    //mesh.position.set( x, y, z - 75 );
    //mesh.rotation.set( rx, ry, rz );
    //mesh.scale.set( s, s, s );
    //group.add( mesh );
    mesh.rotateX(-Math.PI / 2);
    // mesh.position.set(0,0,0);
    mesh.position.set(-115,100,80);
    mesh.receiveShadow=true;
    scene.add(mesh);

}