let totalFrames = 72;
let currentFrame = 1;
let autoRotate;
let isDragging = false;
let startX = 0;

const car = document.getElementById("car");

const images = [];
for (let i = 1; i <= totalFrames; i++) {
  const img = new Image();
  img.src = `Images_3D/${i}.jpg`;
  images.push(img);
}

function startAutoRotate() {
  autoRotate = setInterval(() => {
    currentFrame = (currentFrame % totalFrames) + 1;
    car.src = `Images_3D/${currentFrame}.jpg`;
  }, 55);
}

function stopAutoRotate() {
  clearInterval(autoRotate);
}

car.addEventListener("mouseenter", stopAutoRotate);
car.addEventListener("mouseleave", startAutoRotate);

car.addEventListener("mousedown", (e) => {
  isDragging = true;
  startX = e.clientX;
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    let diff = e.clientX - startX;
    if (Math.abs(diff) > 5) {
      if (diff > 0) {
        currentFrame = (currentFrame % totalFrames) + 1;
      } else {
        currentFrame = ((currentFrame - 2 + totalFrames) % totalFrames) + 1;
      }
      car.src = `Images_3D/${currentFrame}.jpg`;
      startX = e.clientX;
    }
  }
});

startAutoRotate();
