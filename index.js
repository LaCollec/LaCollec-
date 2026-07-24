const featuredCars = cars.filter(c => c.featured);

const track = document.getElementById('garageTrack');
lcRenderCars(featuredCars, track);
lcEnableDragScroll(track);
lcWireModalOverlay();
lcRenderFAQ('faqList');
lcWireJoinForm('joinForm', 'joinMsg');
