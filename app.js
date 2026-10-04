// app.js — MaquetaGo PMV
// Requiere config.js cargado antes que este script.

// ==== GLOBAL STATE & LOCAL STORAGE ====
function getStorage(key, defaultVal = null) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  } catch (e) {
    console.error('Error reading localStorage', e);
    return defaultVal;
  }
}

function setStorage(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('Error setting localStorage', e);
  }
}

// ==== GLOBAL SETUP ====
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupLogin();
  setupFloatingFeedback();

  const path = window.location.pathname;
  if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
    setupLandingPage();
  } else if (path.includes('reservar.html')) {
    setupReservarPage();
  } else if (path.includes('seguimiento.html')) {
    setupSeguimientoPage();
  } else if (path.includes('mis-viajes.html')) {
    setupMisViajesPage();
  } else if (path.includes('admin.html')) {
    setupAdminPage();
  }
});

// ==== 1. NAVIGATION & LOGIN ====
function setupNavigation() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    let href = link.getAttribute('href');
    if (href === '#') {
      const dataPath = link.getAttribute('data-path');
      if (dataPath === 'inicio') link.setAttribute('href', 'index.html');
      if (dataPath === 'cotizar-y-reservar') link.setAttribute('href', 'reservar.html');
      if (dataPath === 'como-funciona') link.setAttribute('href', 'index.html#como-funciona');
      if (dataPath === 'faq') link.setAttribute('href', 'index.html#faq');
      if (dataPath === 'red-de-campus-y-bahias') link.setAttribute('href', 'index.html#red-campus');
      if (dataPath === 'conductores-pro') link.setAttribute('href', 'index.html#conductores');
    }

    const linkHref = link.getAttribute('href');
    if (linkHref && linkHref.includes(currentPath) && currentPath !== '') {
      link.className = 'px-3 py-2 transition-colors bg-surface-container text-primary font-bold rounded-lg';
    } else {
      link.className = 'px-3 py-2 text-on-surface-variant font-label-lg text-label-lg hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors';
    }
  });

  // Botones CTA que van a reservar
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
    showToast('¡Bienvenido a MaquetaGo!');
    setupLogin();
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
        ${[1, 2, 3, 4, 5].map(i => `<button type="button" class="fb-star w-8 h-8 rounded bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface font-bold" data-val="${i}">${i}</button>`).join('')}
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
      document.querySelectorAll('.fb-star').forEach(bs => {
        bs.classList.replace('bg-primary', 'bg-surface-container');
        bs.classList.replace('text-on-primary', 'text-on-surface');
      });
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
  const modalToggle = document.querySelectorAll('.modal-toggle-btn');
  const priceDisplay = document.getElementById('priceDisplay');
  const modalLabel = document.getElementById('simulatorModalLabel');
  const btnReservar = document.getElementById('btnReservarSim');

  let simIsCarpool = true;

  // Toggle carpool / van exclusiva en simulador
  modalToggle.forEach(btn => {
    btn.addEventListener('click', () => {
      modalToggle.forEach(b => {
        b.classList.remove('bg-primary', 'text-on-primary', 'shadow-sm');
        b.classList.add('text-on-surface-variant');
      });
      btn.classList.add('bg-primary', 'text-on-primary', 'shadow-sm');
      btn.classList.remove('text-on-surface-variant');
      simIsCarpool = btn.dataset.mode === 'carpool';
      if (modalLabel) {
        modalLabel.textContent = simIsCarpool ? 'Tarifa Estimada (Carpool)' : 'Tarifa Estimada (Van Exclusiva)';
      }
      updateEstimatedPrice();
    });
  });

  const updateEstimatedPrice = () => {
    if (!priceDisplay) return;
    const cfg = window.MG_CONFIG || { TARIFA_CARPOOL: 28, TARIFA_VAN_EXCLUSIVA: 45 };
    let base = simIsCarpool ? cfg.TARIFA_CARPOOL : cfg.TARIFA_VAN_EXCLUSIVA;
    if (originSelect && originSelect.value === 'barranco') base += 3;
    if (destSelect && destSelect.value === 'uni') base += 6;
    if (scaleSelect && scaleSelect.value === 'urban') base += 4;
    priceDisplay.textContent = 'S/ ' + base.toFixed(2);
  };

  if (originSelect && destSelect && scaleSelect) {
    originSelect.addEventListener('change', updateEstimatedPrice);
    destSelect.addEventListener('change', updateEstimatedPrice);
    scaleSelect.addEventListener('change', updateEstimatedPrice);
    updateEstimatedPrice();
  }

  if (btnReservar) {
    btnReservar.addEventListener('click', () => {
      const urlParams = new URLSearchParams();
      if (originSelect) urlParams.set('origin', originSelect.value);
      if (destSelect) urlParams.set('dest', destSelect.value);
      if (scaleSelect) urlParams.set('scale', scaleSelect.value);
      urlParams.set('mode', simIsCarpool ? 'carpool' : 'exclusivo');
      window.location.href = 'reservar.html?' + urlParams.toString();
    });
  }

  // Acordeones
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const content = trigger.nextElementSibling;
      const icon = trigger.querySelector('.accordion-icon');
      const isOpen = !content.classList.contains('hidden');
      content.classList.toggle('hidden', isOpen);
      if (icon) icon.textContent = isOpen ? 'expand_more' : 'expand_less';
    });
  });

  // Modal de garantía
  const btnGarantia = document.getElementById('btn-garantia-modal');
  if (btnGarantia) {
    btnGarantia.addEventListener('click', () => openGarantiaModal());
  }
}

// ==== MODAL DE GARANTÍA ====
function openGarantiaModal() {
  if (document.getElementById('garantia-modal')) return;
  const cfg = window.MG_CONFIG || { GARANTIA_CARPOOL: 1200, GARANTIA_EXCLUSIVA: 1800 };
  const modal = document.createElement('div');
  modal.id = 'garantia-modal';
  modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/50 backdrop-blur-sm px-4';
  modal.innerHTML = `
    <div class="bg-surface-container-lowest p-8 rounded-2xl w-full max-w-lg shadow-xl flex flex-col gap-6 relative max-h-[90vh] overflow-y-auto">
      <button id="close-garantia" class="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface z-10">
        <span class="material-symbols-outlined">close</span>
      </button>
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
          <span class="material-symbols-outlined text-[28px]">shield</span>
        </div>
        <div>
          <h2 class="font-headline-md text-headline-md text-on-surface font-bold">¿Cómo funciona la Garantía?</h2>
          <p class="font-body-sm text-body-sm text-on-surface-variant">Cobertura de Sustentación MaquetaGo</p>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-3 rounded-xl bg-surface-container-low flex flex-col gap-1 text-center">
          <span class="font-label-sm text-label-sm text-outline uppercase">Carpool</span>
          <span class="font-headline-md text-headline-md text-primary font-bold">S/ ${cfg.GARANTIA_CARPOOL.toLocaleString()}</span>
        </div>
        <div class="p-3 rounded-xl bg-tertiary-fixed flex flex-col gap-1 text-center">
          <span class="font-label-sm text-label-sm text-on-tertiary-fixed-variant uppercase">Van Exclusiva</span>
          <span class="font-headline-md text-headline-md text-tertiary font-bold">S/ ${cfg.GARANTIA_EXCLUSIVA.toLocaleString()}</span>
        </div>
      </div>
      <div class="flex flex-col gap-3">
        <h3 class="font-label-lg text-label-lg text-on-surface font-bold uppercase tracking-wide">¿Qué cubre?</h3>
        <ul class="flex flex-col gap-2 font-body-md text-body-md text-on-surface-variant">
          <li class="flex items-start gap-2"><span class="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span> Rotura o desprendimiento de piezas durante el traslado</li>
          <li class="flex items-start gap-2"><span class="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span> Deformación estructural por vibraciones o golpes en ruta</li>
          <li class="flex items-start gap-2"><span class="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span> Daños por humedad si contrataste caja isotérmica</li>
        </ul>
        <h3 class="font-label-lg text-label-lg text-on-surface font-bold uppercase tracking-wide mt-2">¿Qué NO cubre?</h3>
        <ul class="flex flex-col gap-2 font-body-md text-body-md text-on-surface-variant">
          <li class="flex items-start gap-2"><span class="material-symbols-outlined text-error text-[18px] shrink-0 mt-0.5">cancel</span> Daños previos al recojo (piezas ya rotas en taller)</li>
          <li class="flex items-start gap-2"><span class="material-symbols-outlined text-error text-[18px] shrink-0 mt-0.5">cancel</span> Pérdida de materiales sueltos sin embalaje</li>
          <li class="flex items-start gap-2"><span class="material-symbols-outlined text-error text-[18px] shrink-0 mt-0.5">cancel</span> Retrasos por congestión vial fuera del protocolo</li>
        </ul>
      </div>
      <div class="flex flex-col gap-3">
        <h3 class="font-label-lg text-label-lg text-on-surface font-bold uppercase tracking-wide">Proceso de reembolso (3 pasos)</h3>
        <div class="flex flex-col gap-3">
          <div class="flex items-start gap-3">
            <span class="w-7 h-7 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center shrink-0 text-sm">1</span>
            <div><strong class="text-on-surface">Reporte fotográfico:</strong> <span class="text-on-surface-variant">El conductor toma fotos de entrada y salida de la maqueta. Tú también puedes enviar las tuyas en el chat de seguimiento.</span></div>
          </div>
          <div class="flex items-start gap-3">
            <span class="w-7 h-7 rounded-full bg-secondary text-on-secondary font-bold flex items-center justify-center shrink-0 text-sm">2</span>
            <div><strong class="text-on-surface">Revisión en 24 h:</strong> <span class="text-on-surface-variant">Nuestro equipo contrasta las fotos de inicio y fin. Si hay daño verificado, aprobamos el reembolso automáticamente.</span></div>
          </div>
          <div class="flex items-start gap-3">
            <span class="w-7 h-7 rounded-full bg-tertiary text-on-tertiary font-bold flex items-center justify-center shrink-0 text-sm">3</span>
            <div><strong class="text-on-surface">Pago en 48 h:</strong> <span class="text-on-surface-variant">Transferencia directa a tu cuenta o Yape. El monto cubre materiales de reconstrucción según el presupuesto adjunto.</span></div>
          </div>
        </div>
      </div>
      <button id="close-garantia-btn" class="w-full py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg font-bold transition-colors">Entendido</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('close-garantia').onclick = () => modal.remove();
  document.getElementById('close-garantia-btn').onclick = () => modal.remove();
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

// ==== 3. RESERVAR PAGE ====
function setupReservarPage() {
  const cfg = window.MG_CONFIG || {};

  // Fecha dinámica: mañana por defecto
  const tripDateInput = document.getElementById('trip-date');
  if (tripDateInput && !tripDateInput.value) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tripDateInput.value = tomorrow.toISOString().split('T')[0];
  } else if (tripDateInput) {
    // Si tiene valor hardcodeado pasado, reemplazar
    const currentVal = new Date(tripDateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (currentVal < today) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tripDateInput.value = tomorrow.toISOString().split('T')[0];
    }
  }

  // Pre-fill desde URL
  const params = new URLSearchParams(window.location.search);
  if (params.has('dest')) {
    const select = document.getElementById('campus-select');
    if (select) {
      Array.from(select.options).forEach(opt => {
        if (opt.value.includes(params.get('dest'))) opt.selected = true;
      });
    }
  }
  if (params.has('mode')) {
    const mode = params.get('mode');
    const radio = document.querySelector(`input[name="modalidad-transporte"][value="${mode === 'exclusivo' ? 'exclusivo' : 'carpool'}"]`);
    if (radio) {
      radio.checked = true;
      isCarpool = mode !== 'exclusivo';
    }
  }

  const dimL = document.getElementById('dim-largo');
  const dimW = document.getElementById('dim-ancho');
  const dimH = document.getElementById('dim-alto');
  const scaleBtns = document.querySelectorAll('.scale-btn');
  const fragCards = document.querySelectorAll('.fragility-card');
  const radios = document.querySelectorAll('input[name="modalidad-transporte"]');
  const checkIsotermic = document.getElementById('check-box');
  const timeSelect = document.getElementById('trip-time');

  let currentScale = '1:100';
  let currentFrag = 'high';
  let isCarpool = true;

  const updateSummary = () => {
    const l = parseInt(dimL && dimL.value || 0);
    const w = parseInt(dimW && dimW.value || 0);
    const h = parseInt(dimH && dimH.value || 0);
    const vol = l * w * h;

    // Auto-forzar Van Exclusiva por escala o dimensiones
    const maxDim = cfg.DIM_MAX_CARPOOL || 100;
    const escalasExclusiva = cfg.ESCALAS_VAN_EXCLUSIVA || ['1:1000', 'personalizada'];
    const exceedsDim = l > maxDim || w > maxDim || h > maxDim;
    const exceedsCarpool = isCarpool && (l > (cfg.CARPOOL_MAX_LARGO || 80) || w > (cfg.CARPOOL_MAX_ANCHO || 60) || h > (cfg.CARPOOL_MAX_ALTO || 50));
    const forceExclusivaByScale = escalasExclusiva.includes(currentScale);

    if (isCarpool && (forceExclusivaByScale || exceedsDim)) {
      const reason = forceExclusivaByScale
        ? `La escala ${currentScale} requiere Van Exclusiva.`
        : `Una dimensión supera ${maxDim} cm. Se asigna Van Exclusiva.`;
      showToast(reason);
      const exclusivoRadio = document.querySelector('input[value="exclusivo"]');
      if (exclusivoRadio) exclusivoRadio.checked = true;
      isCarpool = false;
    } else if (isCarpool && exceedsCarpool) {
      showToast('Dimensiones exceden límite de Carpool. Cambiando a Van Exclusiva.');
      const exclusivoRadio = document.querySelector('input[value="exclusivo"]');
      if (exclusivoRadio) exclusivoRadio.checked = true;
      isCarpool = false;
    }

    const anclajeCost = vol > 150000 ? (cfg.ANCLAJE_GRANDE || 15) : (cfg.ANCLAJE_NORMAL || 7);
    const seguroMap = { standard: cfg.SEGURO_STANDARD || 3, high: cfg.SEGURO_HIGH || 5, extreme: cfg.SEGURO_EXTREME || 9 };
    const seguroCost = seguroMap[currentFrag] || 5;
    const base = isCarpool ? (cfg.TARIFA_CARPOOL || 28) : (cfg.TARIFA_VAN_EXCLUSIVA || 45);
    const isotermico = (checkIsotermic && checkIsotermic.checked) ? (cfg.ADICIONAL_ISOTERMICO || 12) : 0;
    const total = base + anclajeCost + seguroCost + isotermico;

    const lbMod = document.getElementById('label-modalidad');
    if (lbMod) lbMod.textContent = isCarpool ? 'Carpool Compartido' : 'Van Exclusiva Directa';

    const costBase = document.getElementById('cost-base');
    if (costBase) costBase.textContent = 'S/ ' + base.toFixed(2);

    const rowAdicional = document.getElementById('row-adicional');
    if (rowAdicional) rowAdicional.style.display = (checkIsotermic && checkIsotermic.checked) ? 'flex' : 'none';

    const tDisp = document.getElementById('total-display');
    if (tDisp) tDisp.textContent = 'S/ ' + total.toFixed(2);

    // Actualizar garantía visible
    const garantiaDisplay = document.getElementById('garantia-display');
    if (garantiaDisplay) {
      const g = isCarpool ? (cfg.GARANTIA_CARPOOL || 1200) : (cfg.GARANTIA_EXCLUSIVA || 1800);
      garantiaDisplay.textContent = 'S/ ' + g.toLocaleString();
    }
  };

  [dimL, dimW, dimH].forEach(el => el && el.addEventListener('input', updateSummary));
  radios.forEach(r => r.addEventListener('change', (e) => { isCarpool = (e.target.value === 'carpool'); updateSummary(); }));
  if (checkIsotermic) checkIsotermic.addEventListener('change', updateSummary);

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

  if (timeSelect) {
    timeSelect.addEventListener('change', (e) => {
      const v = e.target.value;
      const aviso = document.getElementById('aviso-hora-punta');
      if (aviso) aviso.style.display = (v === '07:30' || v === '08:45') ? 'flex' : 'none';
    });
  }

  // Botón modal garantía en reservar
  const btnGarantiaR = document.getElementById('btn-garantia-modal-r');
  if (btnGarantiaR) btnGarantiaR.addEventListener('click', openGarantiaModal);

  // Submit
  const btnSubmit = document.getElementById('btn-submit');
  if (btnSubmit) {
    btnSubmit.addEventListener('click', () => {
      const pickupEl = document.getElementById('pickup-input');
      const dateEl = document.getElementById('trip-date');
      if (!pickupEl || !pickupEl.value || !dateEl || !dateEl.value) {
        showToast('Por favor completa los datos obligatorios.');
        return;
      }

      const originalHTML = btnSubmit.innerHTML;
      btnSubmit.innerHTML = '<span class="material-symbols-outlined animate-spin text-[20px]">sync</span><span>Buscando conductor...</span>';
      btnSubmit.disabled = true;

      setTimeout(() => {
        const tDisp = document.getElementById('total-display');
        const code = 'MG-' + Math.floor(1000 + Math.random() * 9000);
        const campusEl = document.getElementById('campus-select');
        const reserva = {
          code,
          date: dateEl.value,
          pickup: pickupEl.value,
          campus: campusEl ? campusEl.value : 'PUCP',
          time: timeSelect ? timeSelect.value : '08:45',
          modalidad: isCarpool ? 'Carpool' : 'Exclusiva',
          total: tDisp ? tDisp.textContent : 'S/ --',
          status: 'confirmado'
        };

        let trips = getStorage('mg_trips', []);
        trips.push(reserva);
        setStorage('mg_trips', trips);
        showConfirmModal(reserva);
      }, 2500);
    });
  }

  // Feedback form
  const fbForm = document.getElementById('beta-feedback-form');
  if (fbForm) {
    fbForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const feedbacks = getStorage('mg_feedbacks', []);
      feedbacks.push({ date: new Date().toISOString(), path: 'reservar.html', source: 'inline' });
      setStorage('mg_feedbacks', feedbacks);
      const success = document.getElementById('feedback-success');
      if (success) { success.classList.remove('hidden'); success.classList.add('flex'); }
      fbForm.classList.add('hidden');
    });
  }

  updateSummary();
}

// ==== CONFIRM MODAL con tarjeta de conductor enriquecida ====
function showConfirmModal(reserva) {
  const cfg = window.MG_CONFIG || {};
  const isExclusiva = reserva.modalidad === 'Exclusiva';
  const garantia = isExclusiva ? (cfg.GARANTIA_EXCLUSIVA || 1800) : (cfg.GARANTIA_CARPOOL || 1200);

  const conductores = [
    { nombre: 'Carlos M.', calificacion: '4.98', viajes: 312, vehiculo: 'Renault Kangoo Maxi', placa: 'AX-901', equip: 'Susp. neumática · Acolchado microcelular', initials: 'CM', color: 'bg-primary' },
    { nombre: 'Roberto V.', calificacion: '4.96', viajes: 245, vehiculo: 'Hyundai H1 Cargo', placa: 'BN-445', equip: 'Susp. neumática · Rieles de fijación', initials: 'RV', color: 'bg-secondary' },
    { nombre: 'Ana L.', calificacion: '4.99', viajes: 189, vehiculo: 'Mercedes Sprinter', placa: 'CD-712', equip: 'Susp. neumática · Cintas elastoméricas', initials: 'AL', color: 'bg-tertiary' }
  ];
  const conductor = conductores[Math.floor(Math.random() * conductores.length)];

  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/50 backdrop-blur-sm px-4';
  modal.innerHTML = `
    <div class="bg-surface-container-lowest p-8 rounded-2xl w-full max-w-md shadow-xl flex flex-col gap-5 text-center max-h-[90vh] overflow-y-auto">
      <div class="w-16 h-16 rounded-full bg-primary/20 text-primary mx-auto flex items-center justify-center">
        <span class="material-symbols-outlined text-[32px]">check_circle</span>
      </div>
      <div>
        <h2 class="font-headline-lg text-headline-lg text-on-surface font-bold">Reserva Confirmada</h2>
        <p class="font-body-md text-on-surface-variant">Código: <span class="font-bold text-primary">${reserva.code}</span></p>
      </div>

      <!-- Tarjeta del conductor -->
      <div class="bg-surface-container rounded-2xl p-4 flex flex-col gap-4 text-left border border-surface-container-high">
        <span class="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">Conductor Asignado</span>
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-full ${conductor.color} text-on-primary flex items-center justify-center font-headline-md font-bold shrink-0 shadow-md">
            ${conductor.initials}
          </div>
          <div class="flex flex-col gap-0.5 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-headline-sm text-headline-sm font-bold text-on-surface">${conductor.nombre}</span>
              <span class="material-symbols-outlined text-secondary text-[18px]">verified</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-tertiary font-bold text-sm">★ ${conductor.calificacion}</span>
              <span class="text-outline font-body-sm text-body-sm">· ${conductor.viajes} viajes completados</span>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-0.5 p-2 bg-surface-container-low rounded-lg">
            <span class="font-label-sm text-label-sm text-outline uppercase">Vehículo</span>
            <span class="font-label-md text-label-md text-on-surface font-semibold">${conductor.vehiculo}</span>
          </div>
          <div class="flex flex-col gap-0.5 p-2 bg-surface-container-low rounded-lg">
            <span class="font-label-sm text-label-sm text-outline uppercase">Placa</span>
            <span class="font-label-md text-label-md text-on-surface font-semibold">${conductor.placa}</span>
          </div>
        </div>
        <div class="flex items-center gap-2 p-2 bg-secondary-container/40 rounded-lg">
          <span class="material-symbols-outlined text-secondary text-[18px]">build</span>
          <span class="font-body-sm text-body-sm text-on-surface">${conductor.equip}</span>
        </div>
      </div>

      <!-- Garantía -->
      <div class="flex items-center gap-2 p-3 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed">
        <span class="material-symbols-outlined text-tertiary text-[20px]">shield</span>
        <span class="font-label-md text-label-md font-bold">Garantía de Sustentación: S/ ${garantia.toLocaleString()}</span>
        <button class="ml-auto text-tertiary underline font-label-sm text-label-sm" onclick="openGarantiaModal()">¿Cómo funciona?</button>
      </div>

      <div class="flex flex-col gap-3 mt-2">
        <a href="seguimiento.html?id=${reserva.code}" class="w-full py-3 rounded-xl bg-primary text-on-primary font-bold transition-colors text-center">Ver Seguimiento en Vivo</a>
        <a href="mis-viajes.html" class="w-full py-3 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-bold transition-colors text-center">Ver Mis Viajes</a>
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

  setTimeout(() => { toast.classList.remove('translate-y-4', 'opacity-0'); }, 10);
  setTimeout(() => {
    toast.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==== 4. SEGUIMIENTO PAGE ====
function setupSeguimientoPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || 'MG-0000';
  const segCode = document.getElementById('seg-code');
  if (segCode) segCode.textContent = id;

  let step = 2;
  let timerVal = 8;
  let interval;

  // ── Mapa SVG animado ──────────────────────────────────────────────────────
  const mapContainer = document.getElementById('svg-map-container');
  if (mapContainer) {
    mapContainer.innerHTML = buildSvgMap();
    startMapAnimation(mapContainer);
  }

  const updateTimer = () => {
    const timeEl = document.getElementById('seg-time');
    if (timeEl && timerVal > 0) {
      timerVal--;
      timeEl.textContent = timerVal.toString().padStart(2, '0');
    } else if (timeEl && timerVal <= 0) {
      timeEl.parentElement.innerHTML = '<span class="font-headline-md font-bold text-primary">¡Ha llegado!</span>';
    }
  };

  const advanceStep = () => {
    if (step > 5) {
      clearInterval(interval);
      showToast('¡Maqueta entregada! 🎉');
      showRatingModal();
      return;
    }
    const el = document.getElementById('step' + step);
    if (el) {
      el.classList.replace('bg-surface-container-high', 'bg-primary');
      el.classList.replace('text-on-surface', 'text-on-primary');
    }
    updateTimer();
    step++;
  };

  interval = setInterval(advanceStep, 3000);

  const btn = document.getElementById('btn-acelerar');
  if (btn) {
    btn.addEventListener('click', () => {
      clearInterval(interval);
      while (step <= 5) {
        const el = document.getElementById('step' + step);
        if (el) {
          el.classList.replace('bg-surface-container-high', 'bg-primary');
          el.classList.replace('text-on-surface', 'text-on-primary');
        }
        step++;
      }
      timerVal = 0;
      const timeEl = document.getElementById('seg-time');
      if (timeEl && timeEl.parentElement) {
        timeEl.parentElement.innerHTML = '<span class="font-headline-md font-bold text-primary">¡Ha llegado!</span>';
      }
      // Acelerar animación del mapa
      if (mapContainer) accelerateMapAnimation();
      showToast('¡Maqueta entregada! 🎉');
      setTimeout(() => showRatingModal(), 600);
    });
  }
}

// ── Construcción del SVG del mapa ─────────────────────────────────────────
function buildSvgMap() {
  return `
  <svg id="tracking-svg" viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
    <!-- Fondo mapa estilizado -->
    <rect width="400" height="240" fill="#daf1ff" rx="12"/>
    <!-- Manzanas simuladas -->
    <rect x="20" y="20" width="60" height="40" fill="#b8dff5" rx="4"/>
    <rect x="100" y="20" width="80" height="40" fill="#b8dff5" rx="4"/>
    <rect x="200" y="20" width="60" height="40" fill="#b8dff5" rx="4"/>
    <rect x="280" y="20" width="100" height="40" fill="#b8dff5" rx="4"/>
    <rect x="20" y="80" width="50" height="60" fill="#c8e8f8" rx="4"/>
    <rect x="90" y="80" width="90" height="60" fill="#c8e8f8" rx="4"/>
    <rect x="200" y="80" width="70" height="60" fill="#c8e8f8" rx="4"/>
    <rect x="290" y="80" width="90" height="60" fill="#c8e8f8" rx="4"/>
    <rect x="20" y="160" width="70" height="60" fill="#b8dff5" rx="4"/>
    <rect x="110" y="160" width="60" height="60" fill="#b8dff5" rx="4"/>
    <rect x="190" y="160" width="80" height="60" fill="#b8dff5" rx="4"/>
    <rect x="290" y="160" width="90" height="60" fill="#b8dff5" rx="4"/>
    <!-- Calles -->
    <line x1="0" y1="70" x2="400" y2="70" stroke="#f4faff" stroke-width="10"/>
    <line x1="0" y1="150" x2="400" y2="150" stroke="#f4faff" stroke-width="10"/>
    <line x1="80" y1="0" x2="80" y2="240" stroke="#f4faff" stroke-width="8"/>
    <line x1="190" y1="0" x2="190" y2="240" stroke="#f4faff" stroke-width="8"/>
    <line x1="280" y1="0" x2="280" y2="240" stroke="#f4faff" stroke-width="8"/>
    <!-- Ruta del vehículo -->
    <polyline id="ruta-line" points="40,200 40,150 80,150 80,70 190,70 280,70 280,40 340,40"
      fill="none" stroke="#00666d" stroke-width="3" stroke-dasharray="6,3" stroke-linecap="round"/>
    <!-- Destino (pin) -->
    <circle cx="340" cy="40" r="10" fill="#825100" opacity="0.9"/>
    <text x="340" y="44" text-anchor="middle" fill="white" font-size="10" font-weight="bold">🎓</text>
    <text x="340" y="20" text-anchor="middle" fill="#825100" font-size="8" font-weight="bold">PUCP</text>
    <!-- Origen -->
    <circle cx="40" cy="200" r="7" fill="#00666d" opacity="0.7"/>
    <text x="40" y="218" text-anchor="middle" fill="#004f55" font-size="7">Recojo</text>
    <!-- Marcador del vehículo (se mueve por JS) -->
    <g id="van-marker">
      <circle cx="40" cy="200" r="13" fill="#00666d" opacity="0.25"/>
      <circle cx="40" cy="200" r="9" fill="#00666d"/>
      <text x="40" y="204" text-anchor="middle" fill="white" font-size="10">🚐</text>
    </g>
    <!-- ETA badge -->
    <rect x="145" y="8" width="90" height="24" fill="white" rx="12" filter="url(#shadow)"/>
    <text x="190" y="24" text-anchor="middle" fill="#00666d" font-size="10" font-weight="bold">ETA: ~8 min</text>
    <defs>
      <filter id="shadow"><feDropShadow dx="0" dy="1" stdDeviation="1" flood-opacity="0.15"/></filter>
    </defs>
  </svg>`;
}

// Puntos de la ruta para animar el marcador
const RUTA_PUNTOS = [
  { x: 40, y: 200 }, { x: 40, y: 170 }, { x: 40, y: 150 },
  { x: 80, y: 150 }, { x: 120, y: 150 }, { x: 160, y: 150 }, { x: 190, y: 150 },
  { x: 190, y: 110 }, { x: 190, y: 70 }, { x: 235, y: 70 },
  { x: 280, y: 70 }, { x: 280, y: 55 }, { x: 280, y: 40 },
  { x: 310, y: 40 }, { x: 340, y: 40 }
];

let _mapAnimFrame = null;
let _mapSpeed = 1; // frames por punto

function startMapAnimation(container) {
  let puntoIdx = 0;
  let frameCount = 0;
  const etaText = container.querySelector('text[x="190"][y="24"]') || null;

  function tick() {
    const marker = container.querySelector('#van-marker');
    if (!marker) return;

    if (frameCount % (Math.ceil(8 / _mapSpeed)) === 0 && puntoIdx < RUTA_PUNTOS.length) {
      const p = RUTA_PUNTOS[puntoIdx];
      // Mover todas las formas del grupo
      const circles = marker.querySelectorAll('circle');
      const textEl = marker.querySelector('text');
      circles.forEach(c => {
        c.setAttribute('cx', p.x);
        c.setAttribute('cy', p.y);
      });
      if (textEl) {
        textEl.setAttribute('x', p.x);
        textEl.setAttribute('y', p.y + 4);
      }

      // Actualizar ETA
      const remaining = RUTA_PUNTOS.length - 1 - puntoIdx;
      const etaMin = Math.max(0, Math.round(remaining * 0.6));
      const etaBadge = container.querySelector('#tracking-svg text[y="24"]');
      if (etaBadge) {
        etaBadge.textContent = etaMin > 0 ? `ETA: ~${etaMin} min` : '¡Llegando!';
      }
      // Sincronizar con el ETA del DOM
      const segTime = document.getElementById('seg-time');
      if (segTime && etaMin > 0) segTime.textContent = etaMin.toString().padStart(2, '0');

      puntoIdx++;
    }

    frameCount++;
    if (puntoIdx < RUTA_PUNTOS.length) {
      _mapAnimFrame = requestAnimationFrame(tick);
    }
  }

  _mapAnimFrame = requestAnimationFrame(tick);
}

function accelerateMapAnimation() {
  _mapSpeed = 8;
}

// ==== RATING MODAL ====
function showRatingModal() {
  if (document.getElementById('rating-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'rating-modal';
  modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/50 backdrop-blur-sm px-4';
  modal.innerHTML = `
    <div class='bg-surface-container-lowest p-8 rounded-2xl w-full max-w-md shadow-xl flex flex-col gap-6 relative text-center'>
      <h2 class='font-headline-md text-headline-md text-on-surface font-bold'>¡Viaje Completado!</h2>
      <p class='font-body-md text-on-surface-variant'>¿Cómo calificarías a tu conductor?</p>
      <div class='flex justify-center gap-2'>
        ${[1, 2, 3, 4, 5].map(i => `<button class='w-12 h-12 rounded-full bg-surface-container hover:bg-primary hover:text-on-primary font-bold text-lg transition-colors rating-star'>${i}</button>`).join('')}
      </div>
      <textarea id='rating-comment' rows='2' placeholder='Comentarios sobre el cuidado de tu maqueta...' class='w-full p-3 rounded-xl bg-surface-container-low text-on-surface font-body-md outline-none resize-none'></textarea>
      <button id='submit-rating' class='w-full py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold transition-colors'>Enviar Calificación</button>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelectorAll('.rating-star').forEach(btn => {
    btn.onclick = () => {
      modal.querySelectorAll('.rating-star').forEach(b => {
        b.classList.remove('bg-primary', 'text-on-primary');
        b.classList.add('bg-surface-container');
      });
      btn.classList.add('bg-primary', 'text-on-primary');
      btn.classList.remove('bg-surface-container');
    };
  });

  document.getElementById('submit-rating').onclick = () => {
    modal.remove();
    showToast('¡Gracias por calificar!');
  };
}

// ==== 5. MIS VIAJES PAGE ====
function setupMisViajesPage() {
  const list = document.getElementById('viajes-list');
  if (!list) return;

  const trips = getStorage('mg_trips', []);
  if (trips.length === 0) {
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
  const displayTrips = [...trips].reverse();

  displayTrips.forEach((t, index) => {
    const isCancelled = t.status === 'cancelado';
    const card = document.createElement('div');
    card.className = `p-6 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col md:flex-row justify-between gap-6 ${isCancelled ? 'opacity-60' : ''}`;

    const realIndex = trips.length - 1 - index;

    card.innerHTML = `
      <div class='flex flex-col gap-3'>
        <div class='flex items-center gap-3 flex-wrap'>
          <span class='px-2 py-1 rounded bg-secondary-container text-on-secondary-container font-label-sm uppercase font-bold'>${t.code}</span>
          <span class='font-label-sm uppercase ${isCancelled ? 'text-error' : 'text-primary'}'>${t.status}</span>
          <span class='font-label-sm text-outline'>${t.modalidad || 'Carpool'}</span>
        </div>
        <h3 class='font-headline-sm font-bold text-on-surface'>${t.pickup} <span class='text-outline'>→</span> ${t.campus}</h3>
        <p class='font-body-sm text-on-surface-variant'>Fecha: ${t.date} · Hora: ${t.time}</p>
      </div>
      <div class='flex flex-col justify-between items-start md:items-end gap-4'>
        <span class='font-headline-md font-bold text-on-surface'>${t.total}</span>
        <div class='flex gap-2 flex-wrap'>
          ${!isCancelled
        ? `<a href='seguimiento.html?id=${t.code}' class='px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-sm'>Seguimiento</a><button class='px-4 py-2 bg-error-container text-on-error-container rounded-lg font-bold text-sm btn-cancelar' data-index='${realIndex}'>Cancelar</button>`
        : `<a href='reservar.html' class='px-4 py-2 bg-surface-container text-on-surface rounded-lg font-bold text-sm'>Repetir</a>`
      }
        </div>
      </div>
    `;
    list.appendChild(card);
  });

  document.querySelectorAll('.btn-cancelar').forEach(btn => {
    btn.onclick = (e) => {
      if (confirm('¿Seguro que deseas cancelar esta reserva?')) {
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
  if (!tbody) return;

  const feedbacks = getStorage('mg_feedbacks', []);
  if (feedbacks.length === 0) {
    tbody.innerHTML = "<tr><td colspan='5' class='p-4 text-center text-outline'>No hay feedback registrado</td></tr>";
  } else {
    tbody.innerHTML = feedbacks.map(f => `
      <tr class='border-b border-surface-container hover:bg-surface-container-lowest transition-colors'>
        <td class='p-3 text-sm'>${new Date(f.date).toLocaleString()}</td>
        <td class='p-3 text-sm font-bold text-primary'>${f.path}</td>
        <td class='p-3 font-bold'>${f.rating || '-'}/5</td>
        <td class='p-3 text-sm'>${f.intent || '-'}</td>
        <td class='p-3 text-sm'>${f.comment || '-'}</td>
      </tr>
    `).join('');
  }

  const btnBorrar = document.getElementById('btn-borrar');
  if (btnBorrar) {
    btnBorrar.onclick = () => {
      if (confirm('¿Borrar todos los datos locales de la demo?')) {
        localStorage.clear();
        setupAdminPage();
        showToast('Datos borrados');
      }
    };
  }

  const btnExport = document.getElementById('btn-exportar');
  if (btnExport) {
    btnExport.onclick = () => {
      const csv = ['Fecha,Ruta,Nota,Uso,Comentario'];
      feedbacks.forEach(f => {
        csv.push(`${f.date},${f.path},${f.rating},${f.intent},"${f.comment || ''}"`);
      });
      const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'feedbacks.csv';
      a.click();
    };
  }
}
