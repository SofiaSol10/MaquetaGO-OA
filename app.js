// app.js

// ==== GLOBAL STATE & LOCAL STORAGE ====
function getStorage(key, defaultVal = null) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  } catch (e) {
    console.error("Error reading localStorage", e);
    return defaultVal;
  }
}

function setStorage(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error("Error setting localStorage", e);
  }
}

// ==== GLOBAL SETUP ====
document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupLogin();
  setupFloatingFeedback();
  
  const path = window.location.pathname;
  if (path.includes("index.html") || path === "/" || path.endsWith("/")) {
    setupLandingPage();
  } else if (path.includes("reservar.html")) {
    setupReservarPage();
  } else if (path.includes("seguimiento.html")) {
    setupSeguimientoPage();
  } else if (path.includes("mis-viajes.html")) {
    setupMisViajesPage();
  } else if (path.includes("admin.html")) {
    setupAdminPage();
  }
});

// ==== 1. NAVIGATION & LOGIN ====
function setupNavigation() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  
  // Update nav links
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    let href = link.getAttribute('href');
    if (href === '#') {
      const dataPath = link.getAttribute('data-path');
      if (dataPath === 'inicio') link.setAttribute('href', 'index.html');
      if (dataPath === 'cotizar-y-reservar') link.setAttribute('href', 'reservar.html');
      if (dataPath === 'como-funciona') link.setAttribute('href', 'index.html#como-funciona');
      if (dataPath === 'faq') link.setAttribute('href', 'index.html#faq'); // Assuming we add it
      if (dataPath === 'red-de-campus-y-bahias') link.setAttribute('href', 'red-campus.html');
      if (dataPath === 'conductores-pro') link.setAttribute('href', 'conductores.html');
    }
    
    // Set active
    const linkHref = link.getAttribute('href');
    if (linkHref && linkHref.includes(currentPath) && currentPath !== "") {
      link.className = 'px-3 py-2 transition-colors bg-surface-container text-primary font-bold rounded-lg';
    } else {
      link.className = 'px-3 py-2 text-on-surface-variant font-label-lg text-label-lg hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors';
    }
  });

  // Action Buttons globally redirecting to reservar
  const toReservaBtns = document.querySelectorAll('a[href="#simulador"]');
  toReservaBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'reservar.html';
    });
  });
}

function setupLogin() {
  const loginBtns = document.querySelectorAll('[data-path="ingreso-estudiantes"]');
  const user = getStorage('mg_user');

  loginBtns.forEach(btn => {
    if (user && user.nombre) {
      btn.innerHTML = `<span class="material-symbols-outlined text-[18px]">person</span><span>Hola, ${user.nombre.split(' ')[0]}</span>`;
      btn.setAttribute('href', 'mis-viajes.html');
      // Replace onClick to navigate
      btn.onclick = (e) => {
        if(btn.getAttribute('href') !== '#') return;
      };
    } else {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openLoginModal();
      });
    }
  });
}

function openLoginModal() {
  if (document.getElementById('login-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'login-modal';
  modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/50 backdrop-blur-sm px-4';
  modal.innerHTML = `
    <div class="bg-surface-container-lowest p-8 rounded-2xl w-full max-w-md shadow-xl flex flex-col gap-6 relative">
      <button id="close-login" class="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface">
        <span class="material-symbols-outlined">close</span>
      </button>
      <div class="flex flex-col gap-2 text-center">
        <div class="w-12 h-12 rounded-lg bg-primary-container text-on-primary-container mx-auto flex items-center justify-center font-headline-md font-bold mb-2">M</div>
        <h2 class="font-headline-md text-headline-md text-on-surface">Ingreso Estudiantes</h2>
        <p class="font-body-sm text-body-sm text-on-surface-variant">Accede a tus reservas y rutas</p>
      </div>
      <form id="login-form" class="flex flex-col gap-4">
        <input type="text" id="login-name" required placeholder="Tu nombre completo" class="w-full px-4 py-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container transition-colors" />
        <input type="email" id="login-email" required placeholder="Correo Institucional" class="w-full px-4 py-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container transition-colors" />
        <button type="submit" class="w-full py-3 mt-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg font-bold transition-colors">
          Ingresar
        </button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('close-login').onclick = () => modal.remove();
  document.getElementById('login-form').onsubmit = (e) => {
    e.preventDefault();
    const nombre = document.getElementById('login-name').value;
    const email = document.getElementById('login-email').value;
    setStorage('mg_user', { nombre, email });
    modal.remove();
    showToast('Bienvenido a MaquetaGo');
    setupLogin(); // Refresh buttons
  };
}

// ==== GLOBAL FEEDBACK WIDGET ====
function setupFloatingFeedback() {
  const widget = document.createElement('div');
  widget.className = 'fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2';
  
  const panel = document.createElement('div');
  panel.id = 'feedback-panel';
  panel.className = 'hidden bg-surface-container-lowest p-5 rounded-2xl shadow-xl w-72 flex-col gap-4 border border-surface-container-high origin-bottom-right transition-all';
  panel.innerHTML = `
    <div class="flex justify-between items-center">
      <span class="font-headline-sm font-bold text-on-surface">Tu Opinión</span>
      <button id="close-fb-panel" class="text-on-surface-variant"><span class="material-symbols-outlined text-[18px]">close</span></button>
    </div>
    <div class="flex flex-col gap-1.5">
      <span class="font-label-sm text-on-surface-variant">Valoración (1-5)</span>
      <div class="flex gap-1" id="fb-rating">
        ${[1,2,3,4,5].map(i => `<button type="button" class="fb-star w-8 h-8 rounded bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface font-bold" data-val="${i}">${i}</button>`).join('')}
      </div>
    </div>
    <div class="flex flex-col gap-1.5">
      <span class="font-label-sm text-on-surface-variant">¿Usarías esta función?</span>
      <select id="fb-intent" class="w-full p-2 rounded-lg bg-surface-container-low text-on-surface font-body-sm outline-none">
        <option>Sí, definitivamente</option>
        <option>Tal vez</option>
        <option>No lo creo</option>
      </select>
    </div>
    <textarea id="fb-comment" rows="2" placeholder="Comentarios..." class="w-full p-2 rounded-lg bg-surface-container-low text-on-surface font-body-sm outline-none resize-none"></textarea>
    <button id="submit-fb" class="w-full py-2 bg-secondary text-on-secondary rounded-lg font-bold font-label-md">Enviar Feedback</button>
  `;
  
  const btn = document.createElement('button');
  btn.className = 'flex items-center gap-2 px-4 py-3 bg-secondary-container text-on-secondary-container rounded-full shadow-lg hover:shadow-xl transition-all font-bold font-label-md';
  btn.innerHTML = `<span class="material-symbols-outlined text-[20px]">chat</span><span>Opinar</span>`;
  btn.onclick = () => {
    panel.classList.toggle('hidden');
    panel.classList.toggle('flex');
  };
  
  widget.appendChild(panel);
  widget.appendChild(btn);
  document.body.appendChild(widget);

  let currentRating = 5;
  document.querySelectorAll('.fb-star').forEach(s => {
    s.onclick = () => {
      document.querySelectorAll('.fb-star').forEach(bs => bs.classList.replace('bg-primary', 'bg-surface-container'));
      document.querySelectorAll('.fb-star').forEach(bs => bs.classList.replace('text-on-primary', 'text-on-surface'));
      s.classList.replace('bg-surface-container', 'bg-primary');
      s.classList.replace('text-on-surface', 'text-on-primary');
      currentRating = s.dataset.val;
    };
  });
  
  document.getElementById('close-fb-panel').onclick = () => {
    panel.classList.add('hidden');
    panel.classList.remove('flex');
  };
  
  document.getElementById('submit-fb').onclick = () => {
    const feedbackList = getStorage('mg_feedbacks', []);
    feedbackList.push({
      date: new Date().toISOString(),
      path: window.location.pathname,
      rating: currentRating,
      intent: document.getElementById('fb-intent').value,
      comment: document.getElementById('fb-comment').value
    });
    setStorage('mg_feedbacks', feedbackList);
    panel.classList.add('hidden');
    panel.classList.remove('flex');
    showToast('¡Gracias por tu opinión!');
    document.getElementById('fb-comment').value = '';
  };
}

// ==== 2. LANDING PAGE ====
function setupLandingPage() {
  const originSelect = document.getElementById('originSelect');
  const destSelect = document.getElementById('destSelect');
  const scaleSelect = document.getElementById('scaleSelect');
  const priceDisplay = document.getElementById('priceDisplay');
  const btnReservar = document.getElementById('btnReservarSim');

  const updateEstimatedPrice = () => {
    if (!originSelect || !destSelect || !priceDisplay) return;
    
    // Simulate some logic
    let base = 25.0;
    if(originSelect.value === 'barranco') base += 3;
    if(destSelect.value === 'uni') base += 6;
    if(scaleSelect && scaleSelect.value === 'urban') base += 4;
    
    priceDisplay.textContent = 'S/ ' + base.toFixed(2);
  };

  if (originSelect && destSelect && scaleSelect) {
    originSelect.addEventListener('change', updateEstimatedPrice);
    destSelect.addEventListener('change', updateEstimatedPrice);
    scaleSelect.addEventListener('change', updateEstimatedPrice);
    updateEstimatedPrice();
  }

  if (btnReservar) {
    btnReservar.addEventListener('click', function(e) {
      e.preventDefault();
      // Pass data to reservar
      const urlParams = new URLSearchParams();
      if(originSelect) urlParams.set('origin', originSelect.value);
      if(destSelect) urlParams.set('dest', destSelect.value);
      if(scaleSelect) urlParams.set('scale', scaleSelect.value);
      window.location.href = 'reservar.html?' + urlParams.toString();
    });
  }
}

// ==== 3. RESERVAR PAGE ====
function setupReservarPage() {
  // Pre-fill from URL
  const params = new URLSearchParams(window.location.search);
  if(params.has('dest')) {
    const select = document.getElementById('campus-select');
    if(select) {
      // Trying to match values roughly
      Array.from(select.options).forEach(opt => {
        if(opt.value.includes(params.get('dest'))) opt.selected = true;
      });
    }
  }

  // Real-time calculation and validation
  const dimL = document.getElementById('dim-largo');
  const dimW = document.getElementById('dim-ancho');
  const dimH = document.getElementById('dim-alto');
  const scaleBtns = document.querySelectorAll('.scale-btn');
  const fragCards = document.querySelectorAll('.fragility-card');
  const radios = document.querySelectorAll('input[name="modalidad-transporte"]');
  const checkIsotermic = document.getElementById('check-box');
  const timeSelect = document.getElementById('trip-time');

  let currentScale = '1:100';
  let currentFrag = 'standard';
  let isCarpool = true;

  const updateSummary = () => {
    // 1. Dimension check for Carpool limits
    const l = parseInt(dimL.value||0);
    const w = parseInt(dimW.value||0);
    const h = parseInt(dimH.value||0);
    const vol = l*w*h;

    // Suggest Exclusiva if exceeds
    if (isCarpool && (l > 120 || w > 90 || h > 80)) {
       showToast("Dimensiones exceden límite de Carpool. Cambiando a Van Exclusiva.");
       document.querySelector('input[value="exclusivo"]').checked = true;
       isCarpool = false;
    }

    let anclajeCost = vol > 150000 ? 15 : 7;
    let seguroCost = currentFrag === 'standard' ? 3 : currentFrag === 'high' ? 5 : 9;
    let base = isCarpool ? 28 : 45;
    let isotermico = (checkIsotermic && checkIsotermic.checked) ? 12 : 0;
    
    let total = base + anclajeCost + seguroCost + isotermico;

    // Update UI
    const lbMod = document.getElementById('label-modalidad');
    if(lbMod) lbMod.textContent = isCarpool ? 'Modalidad Carpool' : 'Van Exclusiva Directa';
    
    const costBase = document.getElementById('cost-base');
    if(costBase) costBase.textContent = 'S/ ' + base.toFixed(2);

    const spans = document.querySelectorAll('#row-adicional');
    if(spans.length > 0) {
      spans[0].style.display = (checkIsotermic && checkIsotermic.checked) ? 'flex' : 'none';
    }

    const tDisp = document.getElementById('total-display');
    if(tDisp) tDisp.textContent = 'S/ ' + total.toFixed(2);
  };

  // Bind events
  [dimL, dimW, dimH].forEach(el => el && el.addEventListener('input', updateSummary));
  radios.forEach(r => r.addEventListener('change', (e) => { isCarpool = (e.target.value === 'carpool'); updateSummary(); }));
  if(checkIsotermic) checkIsotermic.addEventListener('change', updateSummary);

  scaleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      scaleBtns.forEach(b => {
        b.classList.remove('bg-primary', 'text-on-primary', 'font-bold', 'shadow-sm');
        b.classList.add('bg-surface-container-low', 'text-on-surface');
      });
      btn.classList.add('bg-primary', 'text-on-primary', 'font-bold', 'shadow-sm');
      btn.classList.remove('bg-surface-container-low', 'text-on-surface');
      currentScale = btn.dataset.scale;
      updateSummary();
    });
  });

  fragCards.forEach(card => {
    card.addEventListener('click', () => {
      fragCards.forEach(c => {
        c.classList.remove('bg-secondary-container', 'text-on-secondary-container', 'shadow-sm');
        c.classList.add('bg-surface-container-low');
      });
      card.classList.add('bg-secondary-container', 'text-on-secondary-container', 'shadow-sm');
      card.classList.remove('bg-surface-container-low');
      currentFrag = card.dataset.fragility;
      updateSummary();
    });
  });

  if(timeSelect) {
    timeSelect.addEventListener('change', (e) => {
      const v = e.target.value;
      const aviso = document.querySelector('.text-tertiary-fixed').parentNode;
      // '07:30' or '08:45'
      if(aviso) {
        if(v === '07:30' || v === '08:45') {
          aviso.style.display = 'flex';
        } else {
          aviso.style.display = 'none';
        }
      }
    });
  }

  // Submit button
  const btnSubmit = document.getElementById('btn-submit');
  if(btnSubmit) {
    btnSubmit.addEventListener('click', () => {
      // Validate
      const pickup = document.getElementById('pickup-input').value;
      const date = document.getElementById('trip-date').value;
      if(!pickup || !date) {
        showToast("Por favor completa los datos obligatorios.");
        return;
      }
      
      const originalHTML = btnSubmit.innerHTML;
      btnSubmit.innerHTML = '<span class="material-symbols-outlined animate-spin text-[20px]">sync</span><span>Buscando conductor...</span>';
      btnSubmit.disabled = true;
      
      setTimeout(() => {
        // Generate Reserva
        const tDisp = document.getElementById('total-display');
        const code = 'MG-' + Math.floor(1000 + Math.random() * 9000);
        
        const reserva = {
          code,
          date,
          pickup,
          campus: document.getElementById('campus-select').value,
          time: timeSelect.value,
          modalidad: isCarpool ? 'Carpool' : 'Exclusiva',
          total: tDisp.textContent,
          status: 'confirmado'
        };

        let trips = getStorage('mg_trips', []);
        trips.push(reserva);
        setStorage('mg_trips', trips);

        // Show Modal
        showConfirmModal(reserva);
      }, 2500);
    });
  }
}

function showConfirmModal(reserva) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/50 backdrop-blur-sm px-4';
  modal.innerHTML = `
    <div class="bg-surface-container-lowest p-8 rounded-2xl w-full max-w-md shadow-xl flex flex-col gap-6 text-center">
      <div class="w-16 h-16 rounded-full bg-primary/20 text-primary mx-auto flex items-center justify-center font-bold">
        <span class="material-symbols-outlined text-[32px]">check_circle</span>
      </div>
      <div>
        <h2 class="font-headline-lg text-headline-lg text-on-surface font-bold">Reserva Confirmada</h2>
        <p class="font-body-md text-on-surface-variant">Código: <span class="font-bold text-primary">${reserva.code}</span></p>
      </div>
      <div class="bg-surface-container p-4 rounded-xl flex flex-col gap-2 text-left">
        <span class="font-label-md text-primary">Conductor Asignado:</span>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-surface-container-high"></div>
          <div class="flex flex-col">
            <span class="font-bold text-on-surface">Carlos M.</span>
            <span class="font-body-sm text-outline">Kangoo Maxi • AX-901</span>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-3 mt-2">
        <a href="seguimiento.html?id=${reserva.code}" class="w-full py-3 rounded-xl bg-primary text-on-primary font-bold transition-colors">Ver Seguimiento</a>
        <a href="mis-viajes.html" class="w-full py-3 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-bold transition-colors">Ver Mis Viajes</a>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// ==== UTILS ====
function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'fixed top-24 left-1/2 -translate-x-1/2 z-[150] px-6 py-3 rounded-full bg-inverse-surface text-inverse-on-surface font-label-md shadow-lg transform transition-all translate-y-4 opacity-0';
  toast.textContent = msg;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ==== 4. SEGUIMIENTO PAGE ====
function setupSeguimientoPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || 'MG-0000';
  const segCode = document.getElementById('seg-code');
  if(segCode) segCode.textContent = id;

  let step = 2;
  let timer = 5;
  let interval;

  const advance = () => {
    if(step > 5) {
      clearInterval(interval);
      showToast('¡Maqueta entregada!');
      showRatingModal();
      return;
    }
    const el = document.getElementById('step' + step);
    if(el) {
      el.classList.replace('bg-surface-container-high', 'bg-primary');
      el.classList.replace('text-on-surface', 'text-on-primary');
    }
    const timeEl = document.getElementById('seg-time');
    if(timeEl) {
      timer--;
      timeEl.textContent = timer.toString().padStart(2, '0');
      if(timer <= 0) timeEl.parentElement.textContent = '¡Ha llegado!';
    }
    step++;
  };

  interval = setInterval(advance, 3000);

  const btn = document.getElementById('btn-acelerar');
  if(btn) {
    btn.addEventListener('click', () => {
      clearInterval(interval);
      // Advance all remaining steps instantly
      while(step <= 5) {
        const el = document.getElementById('step' + step);
        if(el) {
          el.classList.replace('bg-surface-container-high', 'bg-primary');
          el.classList.replace('text-on-surface', 'text-on-primary');
        }
        step++;
      }
      // Update timer display
      const timeEl = document.getElementById('seg-time');
      if(timeEl && timeEl.parentElement) {
        timeEl.parentElement.textContent = '¡Ha llegado!';
      }
      // Show toast and rating modal exactly once
      showToast('¡Maqueta entregada! 🎉');
      setTimeout(() => showRatingModal(), 600);
    });
  }
}

function showRatingModal() {
  if (document.getElementById('rating-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'rating-modal';
  modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/50 backdrop-blur-sm px-4';
  modal.innerHTML = `
    <div class='bg-surface-container-lowest p-8 rounded-2xl w-full max-w-md shadow-xl flex flex-col gap-6 relative text-center'>
      <h2 class='font-headline-md text-headline-md text-on-surface font-bold'>¡Viaje Completado!</h2>
      <p class='font-body-md text-on-surface-variant'>¿Cómo calificarías a Carlos M.?</p>
      <div class='flex justify-center gap-2'>
        ${[1,2,3,4,5].map(i => `<button class='w-12 h-12 rounded-full bg-surface-container hover:bg-primary hover:text-on-primary font-bold text-lg transition-colors' onclick='this.parentElement.querySelectorAll("button").forEach(b=>b.classList.replace("bg-primary","bg-surface-container")); this.classList.replace("bg-surface-container","bg-primary")'>★</button>`).join('')}
      </div>
      <textarea id='rating-comment' rows='2' placeholder='Comentarios...' class='w-full p-3 rounded-xl bg-surface-container-low text-on-surface font-body-md outline-none resize-none'></textarea>
      <button id='submit-rating' class='w-full py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold transition-colors'>Enviar Calificación</button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('submit-rating').onclick = () => {
    modal.remove();
    showToast('¡Gracias por calificar!');
  };
}

// ==== 5. MIS VIAJES PAGE ====
function setupMisViajesPage() {
  const list = document.getElementById('viajes-list');
  if(!list) return;

  const trips = getStorage('mg_trips', []);
  if(trips.length === 0) {
    list.innerHTML = `
      <div class='p-8 rounded-2xl bg-surface-container-low text-center flex flex-col gap-4 items-center'>
        <span class='material-symbols-outlined text-[48px] text-outline'>luggage</span>
        <h2 class='font-headline-sm font-bold text-on-surface'>No tienes reservas activas</h2>
        <p class='text-on-surface-variant'>Inicia cotizando tu primer viaje seguro para tu maqueta.</p>
        <a href='reservar.html' class='px-6 py-3 bg-primary text-on-primary rounded-xl font-bold'>Cotizar Viaje</a>
      </div>
    `;
    return;
  }

  list.innerHTML = '';
  // Clone to not reverse in place constantly if called multiple times, but here we just reverse once for UI
  const displayTrips = [...trips].reverse(); 
  
  displayTrips.forEach((t, index) => {
    const isCancelled = t.status === 'cancelado';
    const card = document.createElement('div');
    card.className = `p-6 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col md:flex-row justify-between gap-6 ${isCancelled ? 'opacity-60' : ''}`;
    
    // Real index in the original array
    const realIndex = trips.length - 1 - index;
    
    card.innerHTML = `
      <div class='flex flex-col gap-3'>
        <div class='flex items-center gap-3'>
          <span class='px-2 py-1 rounded bg-secondary-container text-on-secondary-container font-label-sm uppercase font-bold'>${t.code}</span>
          <span class='font-label-sm uppercase ${isCancelled ? 'text-error' : 'text-primary'}'>${t.status}</span>
        </div>
        <h3 class='font-headline-sm font-bold text-on-surface'>${t.pickup} <span class='text-outline'>→</span> ${t.campus}</h3>
        <p class='font-body-sm text-on-surface-variant'>Fecha: ${t.date} • Hora Máx: ${t.time} • Modalidad: ${t.modalidad}</p>
      </div>
      <div class='flex flex-col justify-between items-end gap-4'>
        <span class='font-headline-md font-bold text-on-surface'>${t.total}</span>
        <div class='flex gap-2'>
          ${!isCancelled ? `<a href='seguimiento.html?id=${t.code}' class='px-4 py-2 bg-primary text-on-primary rounded-lg font-bold'>Seguimiento</a><button class='px-4 py-2 bg-error text-on-error rounded-lg font-bold btn-cancelar' data-index='${realIndex}'>Cancelar</button>` : `<a href='reservar.html' class='px-4 py-2 bg-surface-container text-on-surface rounded-lg font-bold'>Repetir</a>`}
        </div>
      </div>
    `;
    list.appendChild(card);
  });

  document.querySelectorAll('.btn-cancelar').forEach(btn => {
    btn.onclick = (e) => {
      if(confirm('¿Seguro que deseas cancelar esta reserva?')) {
        const i = e.target.dataset.index;
        trips[i].status = 'cancelado';
        setStorage('mg_trips', trips);
        setupMisViajesPage();
        showToast('Reserva cancelada');
      }
    };
  });
}

// ==== 6. ADMIN PAGE ====
function setupAdminPage() {
  const tbody = document.getElementById('admin-tbody');
  if(!tbody) return;

  const feedbacks = getStorage('mg_feedbacks', []);
  if(feedbacks.length === 0) {
    tbody.innerHTML = "<tr><td colspan='5' class='p-4 text-center text-outline'>No hay feedback registrado</td></tr>";
  } else {
    tbody.innerHTML = feedbacks.map(f => `
      <tr class='border-b border-surface-container hover:bg-surface-container-lowest transition-colors'>
        <td class='p-3 text-sm'>${new Date(f.date).toLocaleString()}</td>
        <td class='p-3 text-sm font-bold text-primary'>${f.path}</td>
        <td class='p-3 font-bold'>${f.rating}/5</td>
        <td class='p-3 text-sm'>${f.intent}</td>
        <td class='p-3 text-sm'>${f.comment || '-'}</td>
      </tr>
    `).join('');
  }

  const btnBorrar = document.getElementById('btn-borrar');
  if(btnBorrar) {
    btnBorrar.onclick = () => {
      if(confirm('¿Borrar todos los datos locales de la demo?')) {
        localStorage.clear();
        setupAdminPage();
        showToast('Datos borrados');
      }
    };
  }

  const btnExport = document.getElementById('btn-exportar');
  if(btnExport) {
    btnExport.onclick = () => {
      const csv = ['Fecha,Ruta,Nota,Uso,Comentario'];
      feedbacks.forEach(f => {
        csv.push(`${f.date},${f.path},${f.rating},${f.intent},"${f.comment || ''}"`);
      });
      const blob = new Blob([csv.join('\\n')], {type: 'text/csv'});
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'feedbacks.csv';
      a.click();
    };
  }
}
