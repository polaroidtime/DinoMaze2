// ----------------------------
// Inicialización de Variables: Hola
// ----------------------------
var scene    = null,
    camera   = null,
    renderer = null,
    controls = null,
    clock = null;

var sound1      = null,
    countPoints = null,
    modelLoad   = null,
    light       = null,
    figuresGeo  = [],
    model=null,
    puntos=0;

var MovingCube         = null,
    collidableMeshList = [],
    lives              = 3,
    numberToCreate     = 5;

var color = new THREE.Color();

var scale  = 1;
var rotSpd = 0.05;
var spd    = 0.05;
var input  = {left:0,right:0, up: 0, down: 0};

var posX = 3;
var posY = 0.5;
var posZ = 1;
// ----------------------------
// Funciones de creación init:
// ----------------------------
function start() {
    window.onresize = onWindowResize;
    initScene();
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function initScene(){
    initBasicElements(); // Scene, Camera and Render
    initSound();         // To generate 3D Audio
    createLight();       // Create light
    initWorld();
    createGLTF();
    createPlayerMove();
    createFrontera();
    createCollectibles(5);
    
}

function animate(){
    requestAnimationFrame(animate);
    renderer.render(scene,camera);
    sound1.update(camera);
    movePlayer();
    collisionAnimate();
}

function initBasicElements() {
    scene    = new THREE.Scene();
    camera   = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    renderer = new THREE.WebGLRenderer({ canvas: document.querySelector("#app") });
    clock    = new THREE.Clock();

    // controls = new THREE.OrbitControls(camera, renderer.domElement);
    // controls.update();

    scene.background = new THREE.Color( 0x0099ff );
    scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

    var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
    light.position.set( 0.5, 1, 0.75 );
    scene.add( light );
           
    renderer.setSize(window.innerWidth, window.innerHeight - 4);
    document.body.appendChild( renderer.domElement );

    camera.position.x = 3;
    camera.position.y = 0.5;
    camera.position.z = 1;

    

}

function createCollectibles (factor2Create){
  let posIntX = -2;

  for (k = 0; k<factor2Create; k++){
    createBoxes(k);
    posIntX =+10;
  }
}

function createBoxes(iden){
  //var random = new  THREE.Math.RandomClamp(0.1, 0.5);
  var randomColor = Math.random() * 0xffffff; // Genera un color aleatorio
  const textureLoader = new THREE.TextureLoader();
  //const texture = textureLoader.load('./');
  var cubito = new THREE.BoxGeometry(0.3, 0.3, 0.3);
  var material = new THREE.MeshBasicMaterial({ color: randomColor });
  var cube = new THREE.Mesh(cubito, material);
  
  // Posición aleatoria en x y z
  var randomX = Math.random() * 8 - 0; // Rango de -3 a 3
  var randomZ = Math.random() * 6 - 0; // Rango de -3 a 3

  cube.position.x= randomX;
  cube.position.z= randomZ;
  cube.position.y = 0.2;
  scene.add(cube);
  
  cube.name ="model2pickup"+ iden;
  cube.id  ="model2pickup"+ iden;

  //COLLIDABLE: ESTE es el que disminuya tanta vidaaaa (lo quitas cuando necesites)
  collidableMeshList.push(cube);

}

function initSound() {
    sound1 = new Sound(["./songs/rain.mp3"],5,scene,{   // radio(10)
        debug:true,
        position: {x:camera.position.x,y:camera.position.y,z:camera.position.z}
    });
}

function createGLTF(direccion){
  // Cargar el archivo GLTF
loaderGLTF = new THREE.GLTFLoader();
loaderGLTF.load('./modelos/other/Duck.gltf', function(gltf) {
  model = gltf.scene;
  scene.add(model);
  model.scale.set(0.3,0.3,0.3);
  let direction = 1; // Controla la dirección de movimiento

  // Función de animación para mover el modelo
  function animateModel() {
    requestAnimationFrame(animateModel);
    model.position.z = 6;
    // Mover el modelo en el eje x
    model.position.x += 0.1 * direction; // Mover en la dirección actual

    // Cambiar la dirección al alcanzar un límite
    if (model.position.x > 12 || model.position.x < -2) {
      direction *= -1; // Cambiar dirección
    }

    // Renderizar la escena
    renderer.render(scene, camera);
  }

  // Iniciar la animación
  animateModel();
 
  // Renderizar la escena
}, undefined, function(error) {
  console.error('Error al cargar el modelo:', error);
});

}

function createFistModel(generalPath,pathMtl,pathObj) {
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setTexturePath(generalPath);
    mtlLoader.setPath(generalPath);
    mtlLoader.load(pathMtl, function (materials) {

        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath(generalPath);
        objLoader.load(pathObj, function (object) {

            modelLoad = object;
            figuresGeo.push(modelLoad);
            scene.add(object);
            object.scale.set(0.1,0.1,0.1);

            object.position.y = 0;
            object.position.x = 5;

        });

    });
}

function createLight() {
    var light2 = new THREE.AmbientLight(0xffffff);
    light2.position.set(10, 10, 10);
    scene.add(light2);
    light = new THREE.DirectionalLight(0xffffff, 0, 1000);
    scene.add(light);
}

function initWorld() {
    // Create Island
    createFistModel("./modelos/maze/","maze.mtl","maze.obj");
    
}
// ----------------------------------
// Función Para mover al jugador:
// ----------------------------------
function movePlayer(){
    if(input.right == 1){
      camera.rotation.y -= rotSpd;
      MovingCube.rotation.y -= rotSpd;
    }
    if(input.left == 1){
      camera.rotation.y += rotSpd; 
      MovingCube.rotation.y += rotSpd;
    }
    
     if(input.up == 1){
      camera.position.z -= Math.cos(camera.rotation.y) * spd;
      camera.position.x -= Math.sin(camera.rotation.y) * spd;

      MovingCube.position.z -= Math.cos(camera.rotation.y) * spd;
      MovingCube.position.x -= Math.sin(camera.rotation.y) * spd;
    }
    if(input.down == 1){
      camera.position.z += Math.cos(camera.rotation.y) * spd;
      camera.position.x += Math.sin(camera.rotation.y) * spd;
      
      MovingCube.position.z += Math.cos(camera.rotation.y) * spd;
      MovingCube.position.x += Math.sin(camera.rotation.y) * spd;
    }
  }
  
   window.addEventListener('keydown', function(e) {
    switch (e.keyCode) {
      case 68:
        input.right = 1;
        break;
      case 65:
        input.left = 1; 
        break;
      case 87:
        input.up = 1;
        sound1.play();
        break;
      case 83:
        input.down = 1;
        break;
      case 27:
        document.getElementById("blocker").style.display = 'block';
        break;
    }
  });


  window.addEventListener('keyup', function(e) {
    switch (e.keyCode) {
      case 68:
        input.right = 0;
        break;
      case 65:
        input.left = 0;
        break;
      case 87:
        input.up = 0;
        break;
      case 83:
        input.down = 0;
        break;
    }
  });
// ----------------------------------
// Funciones llamadas desde el index:
// ----------------------------------
function go2Play() {
    document.getElementById('blocker').style.display = 'none';
    document.getElementById('cointainerOthers').style.display = 'block';
    playAudio(x);
    initialiseTimer();
}

function initialiseTimer() {
    var sec = 0;
    function pad ( val ) { return val > 9 ? val : "0" + val; }

    setInterval( function(){
        document.getElementById("seconds").innerHTML = String(pad(++sec%60));
        document.getElementById("minutes").innerHTML = String(pad(parseInt(sec/60,10)));
    }, 1000);
}

function showInfoCreator() {
    alert("María Camila (122260) y Angie Natalia (122493)");
}
// ----------------------------------
// Funciones llamadas desde el index:
// ----------------------------------
function createPlayerMove() {
  var cubeGeometry = new THREE.CubeGeometry(1,1,1,1,1,1);
	var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe:true, transparent: true, opacity: 0.0 } );
	MovingCube = new THREE.Mesh( cubeGeometry, wireMaterial );
	MovingCube.position.set(camera.position.x,camera.position.y,camera.position.z);
	scene.add( MovingCube );
}

function createFrontera() {
    var cubeGeometry = new THREE.CubeGeometry(12,5,12,1,1,1);
	var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xff00ff, wireframe:true, transparent: false, opacity: 0.0 } );
	worldWalls = new THREE.Mesh( cubeGeometry, wireMaterial );
	worldWalls.position.set(5,0,0);
	scene.add( worldWalls );
    collidableMeshList.push(worldWalls);
}



function collisionAnimate() {
  var originPoint = MovingCube.position.clone();

  for (var vertexIndex = 0; vertexIndex < MovingCube.geometry.vertices.length; vertexIndex++) {		
      var localVertex = MovingCube.geometry.vertices[vertexIndex].clone();
      var globalVertex = localVertex.applyMatrix4(MovingCube.matrix);
      var directionVector = globalVertex.sub(MovingCube.position);
  
      var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
      var collisionResults = ray.intersectObjects(collidableMeshList);
  
      if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) { 
          var collidedObject = collisionResults[0].object;

          if (collidedObject.name.startsWith("model2pickup")) { // Si es una caja
              puntos++; // Suma un punto
              document.getElementById("puntos").innerHTML = puntos; // Actualiza el puntaje en el DOM
              collidedObject.visible = false; // Opcional: hacer que el objeto sea invisible
          } else { // Si es otro objeto que resta vidas
              lives--; // Resta una vida
              document.getElementById("lives").innerHTML = lives; // Actualiza el número de vidas en el DOM

              // Restablece la posición del jugador o realiza cualquier otra acción necesaria
              camera.position.set(posX, posY, posZ);
              MovingCube.position.set(posX, posY, posZ);
              
              if (lives <= 0) {
                  document.getElementById("lost").style.display = "block";
                  document.getElementById("cointainerOthers").style.display = "none";
                  pauseAudio(x);
                  playAudio(y);
              }
          }
      } else {
          document.getElementById("puntos").innerHTML = puntos; // Muestra los puntos actuales
      }
  }
}