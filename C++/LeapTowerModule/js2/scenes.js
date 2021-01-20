

function weakTowerScene(height) {
  var worldDescription = {};
  worldDescription.shapes = [];
  worldDescription.shapes.push({
    name: 'boxX',
    type: 'cube',
    wx: 1,
    wy: 1,
    wz: 1
  });
  worldDescription.shapes.push({
    name: 'boxZ',
    type: 'cube',
    wx: 1,
    wy: 1,
    wz: 1
  });

  worldDescription.bodies = [];
  var baseHeight = 0.55;
  for (var i = 0; i < height; i++) {
    var y = i * 1.0 + baseHeight;
    for (var j = 0; j < 7; j++) {
        for (var k = 0; k < 7; k++) {
          var z = j * 1.0;
          var x = k*1.0;

          var body = {};
          body.shape = 'boxX';
          body.position = {};
          body.position.x = x;
          body.position.y = y;
          body.position.z = z;
          body.rotation = {};
          body.rotation.x = 0.0;
          body.rotation.y = 0.0;
          body.rotation.z = 0.0;
          body.mass = 1.0;
          body.friction = 0.9;
          worldDescription.bodies.push(body);
       } // k
    } // j      
  } // i
  console.log(worldDescription);
  return worldDescription;
}



function loadTower() {
 // loadWorld(sandwichTowerScene(30));
  loadWorld(weakTowerScene(30));
  
}
/*
function loadTextScene(evt) {
  var txt = evt.target.result;
  if (txt == undefined) {
    alert('Could not load file.');
    return;
  }
  var sceneDescription;

  try {
    sceneDescription = JSON.parse(txt);
  } catch(e) {
    alert(e);
    return;
  }

  loadWorld(sceneDescription);
}
*/