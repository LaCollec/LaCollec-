// ---------- SECOURS PHOTO (insensible à la casse de l'extension) ----------
// Essaie plusieurs variantes d'extension si la première ne charge pas,
// pour éviter les soucis .jpg vs .JPG selon l'appareil / le système de fichiers.
const LC_EXT_CANDIDATES = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'webp', 'WEBP'];

function lcTryNextExt(img){
  const idx = parseInt(img.dataset.extIdx || '0', 10) + 1;
  if(idx < LC_EXT_CANDIDATES.length){
    img.dataset.extIdx = idx;
    img.src = `photos/${img.dataset.base}.${LC_EXT_CANDIDATES[idx]}`;
  } else {
    img.style.display = 'none';
    img.nextElementSibling.style.display = 'block';
  }
}
window.lcTryNextExt = lcTryNextExt;

function lcPhotoBase(photoFile){
  return photoFile.replace(/\.[a-zA-Z0-9]+$/, '');
}

// ---------- CARTE VOITURE ----------
function lcCarCardHTML(car){
  const ownerLine = car.owner
    ? `${car.colorLabel} · Propriétaire : <b>${car.owner}</b>`
    : `${car.colorLabel}`;
  const base = lcPhotoBase(car.photoFile);
  return `
    <div class="lc-car-photo" style="--tint:${car.tint}">
      <img src="photos/${base}.${LC_EXT_CANDIDATES[0]}" data-base="${base}" data-ext-idx="0"
           alt="${car.name} ${car.colorLabel}" onerror="lcTryNextExt(this)">
      <svg class="lc-placeholder-icon" style="display:none" viewBox="0 0 64 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 26 L10 12 Q13 7 20 7 H44 Q51 7 54 12 L60 26 V32 H4 Z" stroke="#f2f0ea" stroke-width="2" fill="none"/>
        <circle cx="16" cy="32" r="5" stroke="#f2f0ea" stroke-width="2"/>
        <circle cx="48" cy="32" r="5" stroke="#f2f0ea" stroke-width="2"/>
      </svg>
      <div class="lc-photo-hint">photos/${base}.*</div>
      <div class="lc-car-badge">${car.badge}</div>
    </div>
    <div class="lc-car-body">
      <div class="lc-car-name display">${car.name}</div>
      <div class="lc-car-owner mono">${ownerLine}</div>
      <div class="lc-car-desc">${car.desc}</div>
      <div class="lc-car-stat">${car.stat}</div>
      <button class="lc-car-btn" data-car="${car.id}">Fiche technique</button>
    </div>
  `;
}

function lcRenderCars(list, container){
  list.forEach(car => {
    const el = document.createElement('div');
    el.className = 'lc-car';
    el.innerHTML = lcCarCardHTML(car);
    container.appendChild(el);
  });
  container.addEventListener('click', e => {
    const btn = e.target.closest('.lc-car-btn');
    if(btn) lcOpenModal(btn.dataset.car);
  });
}

// ---------- DRAG TO SCROLL (souris + tactile) ----------
function lcEnableDragScroll(el){
  let isDown = false;
  let startX = 0;
  let scrollStart = 0;
  let moved = false;

  function pointerDown(x){
    isDown = true;
    moved = false;
    startX = x;
    scrollStart = el.scrollLeft;
    el.classList.add('dragging');
  }
  function pointerMove(x){
    if(!isDown) return;
    const delta = x - startX;
    if(Math.abs(delta) > 4) moved = true;
    el.scrollLeft = scrollStart - delta;
  }
  function pointerUp(){
    isDown = false;
    el.classList.remove('dragging');
  }

  el.addEventListener('mousedown', e => { pointerDown(e.pageX); });
  window.addEventListener('mousemove', e => { pointerMove(e.pageX); });
  window.addEventListener('mouseup', pointerUp);
  el.addEventListener('mouseleave', () => { if(isDown) pointerUp(); });

  el.addEventListener('touchstart', e => { pointerDown(e.touches[0].pageX); }, { passive:true });
  el.addEventListener('touchmove', e => { pointerMove(e.touches[0].pageX); }, { passive:true });
  el.addEventListener('touchend', pointerUp);

  el.addEventListener('click', e => {
    if(moved){ e.stopPropagation(); e.preventDefault(); }
  }, true);
}

// ---------- MODAL (fiche technique) ----------
function lcOpenModal(carId){
  const overlay = document.getElementById('modalOverlay');
  const modalContent = document.getElementById('modalContent');
  const car = cars.find(c => c.id === carId);
  if(!car || !overlay || !modalContent) return;
  const ownerLine = car.owner
    ? `${car.colorLabel} — Propriétaire : <b>${car.owner}</b>`
    : `${car.colorLabel}`;
  modalContent.innerHTML = `
    <button class="lc-modal-close" id="modalCloseBtn">&times;</button>
    <div class="lc-modal-band">
      <span>LA COLLEC' · FICHE N°${cars.indexOf(car)+1}</span>
      <span>${car.badge}</span>
    </div>
    <div class="lc-modal-head">
      <div class="lc-modal-name">${car.name}</div>
      <div class="lc-modal-owner">${ownerLine}</div>
    </div>
    <div class="lc-modal-specs">
      ${car.specs.map(s => `<div class="lc-spec-row"><span>${s[0]}</span><span>${s[1]}</span></div>`).join('')}
    </div>
    <div class="lc-modal-stamp">
      <div class="lc-seal">LA<br>COLLEC'</div>
      <span>Données indicatives, issues des fiches constructeur.</span>
    </div>
  `;
  overlay.classList.add('active');
  document.getElementById('modalCloseBtn').addEventListener('click', lcCloseModal);
}
function lcCloseModal(){
  const overlay = document.getElementById('modalOverlay');
  if(overlay) overlay.classList.remove('active');
}
function lcWireModalOverlay(){
  const overlay = document.getElementById('modalOverlay');
  if(overlay) overlay.addEventListener('click', e => { if(e.target === overlay) lcCloseModal(); });
}

// ---------- FAQ ----------
function lcRenderFAQ(containerId){
  const faqList = document.getElementById(containerId);
  if(!faqList) return;
  faqs.forEach(item => {
    const el = document.createElement('div');
    el.className = 'lc-faq-item';
    el.innerHTML = `
      <button class="lc-faq-q">${item.q}<span class="lc-plus">+</span></button>
      <div class="lc-faq-a">${item.a}</div>
    `;
    el.querySelector('.lc-faq-q').addEventListener('click', () => {
      const isOpen = el.classList.contains('open');
      document.querySelectorAll('.lc-faq-item').forEach(i => i.classList.remove('open'));
      if(!isOpen) el.classList.add('open');
    });
    faqList.appendChild(el);
  });
}

// ---------- JOIN FORM ----------
function lcWireJoinForm(formId, msgId){
  const joinForm = document.getElementById(formId);
  const joinMsg = document.getElementById(msgId);
  if(!joinForm) return;
  joinForm.addEventListener('submit', e => {
    e.preventDefault();
    joinMsg.textContent = "C'est noté, merci !";
    joinForm.reset();
  });
}
