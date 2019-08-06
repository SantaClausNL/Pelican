const objects = [];
      
function setup() {
  init(750, 750);

  for(let i = 0; i < objectAmt; i++) {
    objects.push(new object());
  }
}

class object{
  constructor() {
    this.pos = vec(width/2, height/2);
    this.vel = vec(random(-5, 5), random(-5, 5));
  }
}

function update(elapsed) {
  clear('black');

  for(const object of objects) {
    object.pos.add(object.vel);

    if(object.pos.x >= width-2) {
      object.vel.x *= -1;
      object.pos.x = width-2;
    } else if(object.pos.x <= 0) {
      object.vel.x *= -1;
      object.pos.x = 0;
    }
    if(object.pos.y >= height-2) {
      object.vel.y *= -1;
      object.pos.y = height-2;
    } else if(object.pos.y <= 0) {
      object.vel.y *= -1;
      object.pos.y = 0;
    }

    rect(object.pos.x, object.pos.y, 2, 2, 'white');
  }
}