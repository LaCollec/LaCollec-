const grid = document.getElementById('garageGrid');
lcRenderCars(cars, grid);
lcWireModalOverlay();

document.getElementById('garageCount').textContent = cars.length;
