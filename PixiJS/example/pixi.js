usePixiJS = true;
const objects = [];
      
function setup() {
  init(750, 750);

  for(let i = 0; i < objectAmt; i++) {
    objects.push(Rectangle(Pelican.width/2, Pelican.height/2, 2, 2, 0xFFFFFF));
    objects[i].vel = vec(random(-5, 5), random(-5, 5));
  }
}

function update(elapsed) {
  for(const object of objects) {
    object.position.x += object.vel.x;
    object.position.y += object.vel.y;

    if(object.position.x >= Pelican.width-2) {
      object.vel.x *= -1;
      object.position.x = Pelican.width-2;
    } else if(object.position.x <= 0) {
      object.vel.x *= -1;
      object.position.x = 0;
    }
    if(object.position.y >= Pelican.height-2) {
      object.vel.y *= -1;
      object.position.y = Pelican.height-2;
    } else if(object.position.y <= 0) {
      object.vel.y *= -1;
      object.position.y = 0;
    }
  }
}