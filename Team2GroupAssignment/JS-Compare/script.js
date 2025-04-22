let carsData = [];
let currentCar = null;

function getCarIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('car'));
}

function populateDropdown(cars, excludeId) {
  const dropdown = document.getElementById('compareSelect');
  dropdown.innerHTML = '';

  cars.forEach(car => {
    if (car.serial_number !== excludeId) {
      const option = document.createElement('option');
      option.value = car.serial_number;
      option.textContent = car.name;
      dropdown.appendChild(option);
    }
  });
}

function getSpecMap(specsArray = [{}]) {
  const spec = specsArray[0] || {};
  return {
    Transmission: spec.Transmission || 'N/A',
    Engine: spec.Engine || 'N/A',
    Fuel_type: spec.Fuel_type || 'N/A',
    Power: spec.Power || 'N/A',
    Mileage: spec.Mileage || 'N/A',
    Airbags: spec.Airbags || 'N/A',
    NCAP: spec.NCAP_safety_ratings || 'N/A'
  };
}

function generateComparisonHTML(car1, car2) {
  const spec1 = getSpecMap(car1.specifications);
  const spec2 = getSpecMap(car2.specifications);

  return `
    <table id="specification">
      <thead>
        <tr>
          <th>Specification</th>
          <th>${car1.name}</th>
          <th>${car2.name}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Image</td>
          <td><img src="${car1.car_img_url || '#'}" alt="${car1.name}" style="width: 150px; height: auto;" /></td>
          <td><img src="${car2.car_img_url || '#'}" alt="${car2.name}" style="width: 150px; height: auto;" /></td>
        </tr>
        <tr><td>Price</td><td>${car1.price ? `₹${car1.price}` : 'N/A'}</td><td>${car2.price ? `₹${car2.price}` : 'N/A'}</td></tr>
        <tr><td>Transmission</td><td>${spec1.Transmission}</td><td>${spec2.Transmission}</td></tr>
        <tr><td>Engine</td><td>${spec1.Engine}</td><td>${spec2.Engine}</td></tr>
        <tr><td>Fuel Type</td><td>${spec1.Fuel_type}</td><td>${spec2.Fuel_type}</td></tr>
        <tr><td>Power</td><td>${spec1.Power}</td><td>${spec2.Power}</td></tr>
        <tr><td>Mileage</td><td>${spec1.Mileage}</td><td>${spec2.Mileage}</td></tr>
        <tr><td>Airbags</td><td>${spec1.Airbags}</td><td>${spec2.Airbags}</td></tr>
        <tr><td>Color</td><td>${car1.color || 'N/A'}</td><td>${car2.color || 'N/A'}</td></tr>
<tr>
  <td>NCAP Rating</td>
  <td>${spec1.NCAP !== 'N/A' ? generateStars(parseFloat(spec1.NCAP)) : 'N/A'}</td>
  <td>${spec2.NCAP !== 'N/A' ? generateStars(parseFloat(spec2.NCAP)) : 'N/A'}</td>
</tr>
      </tbody>
    </table>
  `;
}
        // <tr><td>NCAP Rating</td><td>${spec1.NCAP}</td><td>${spec2.NCAP}</td></tr>

function generateStars(rating) {
  const maxStars = 5;
  let starsHTML = '';

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    starsHTML += '★';
  }

  if (hasHalfStar) {
    starsHTML += '☆'; // You can replace this with a half-star icon if desired
  }

  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '✩';
  }

  return `<span style="color: gold; font-size: 1.2em;">${starsHTML}</span>`;
} 

function updateComparison(otherCarId) {
  const compareCar = carsData.find(c => c.serial_number === parseInt(otherCarId));
  const container = document.getElementById('comparisonContainer');

  if (!compareCar || !currentCar) {
    container.innerHTML = `<p style="color: red; text-align: center;">Error comparing cars.</p>`;
    return;
  }

  container.innerHTML = generateComparisonHTML(currentCar, compareCar);
}

fetch('data.json')
  .then(res => res.json())
  .then(data => {
    carsData = data;
    const currentCarId = getCarIdFromURL();
    currentCar = data.find(c => c.serial_number === currentCarId);

    if (!currentCar) {
      document.body.innerHTML = '<h2 style="text-align: center;">Car not found in the data!</h2>';
      return;
    }

    // const currentCarContainer = document.getElementById('currentCarContainer');
    // if (currentCar.car_img_url) {
    //   document.body.style.backgroundImage = `url(${currentCar.car_img_url})`; // Set the background image
    //   document.body.style.backgroundSize = 'cover'; // Ensure the image covers the container
    //   document.body.style.backgroundPosition = 'center'; // Center the image
    // } else {
    //   document.body.style.backgroundImage = 'none'; // Remove background if no image is available
    // }
    document.getElementById('currentCarName').textContent = currentCar.name;
    populateDropdown(data, currentCarId);
    updateComparison(document.getElementById('compareSelect').value);

    document.getElementById('compareSelect').addEventListener('change', e => {
      updateComparison(e.target.value);
    });
  })
  .catch(error => {
    console.error('Failed to fetch car data:', error);
    document.body.innerHTML = '<h2 style="text-align: center;">Failed to load car data!</h2>';
  });
