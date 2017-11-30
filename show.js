/**
 * Created by user on 2017/11/28.
 */
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();


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
//场景添加Mesh
function addMesh( geometry, material ) {

    var mesh = new THREE.Mesh( geometry, material );

    mesh.position.x = ( objects.length % 4 ) * 200 - 400;
    mesh.position.z = Math.floor( objects.length / 4 ) * 200 - 200;

    mesh.rotation.x = Math.random() * 200 - 100;
    mesh.rotation.y = Math.random() * 200 - 100;
    mesh.rotation.z = Math.random() * 200 - 100;

    objects.push( mesh );
    scene.add( mesh );

}

texture = new THREE.Texture( generateTexture() );
texture.needsUpdate = true;


