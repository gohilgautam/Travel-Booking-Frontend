import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// ---------- Custom SVG Icons (premium) ----------
const SUCCESS_SVG = `
<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style="width: 80px; height: 80px; margin: 0 auto 12px;">
  <circle cx="60" cy="60" r="48" fill="none" stroke="#A3E8B0" stroke-width="2" stroke-dasharray="6 8">
    <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="10s" repeatCount="indefinite"/>
  </circle>
  <circle cx="60" cy="60" r="36" fill="#0F212E" stroke="#64E88C" stroke-width="1.5"/>
  <path d="M44 60 L56 72 L78 48" fill="none" stroke="#B0FFD0" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <animate attributeName="stroke-dashoffset" from="80" to="0" dur="0.5s" fill="freeze"/>
  </path>
  <circle cx="28" cy="28" r="2.5" fill="#FFE8A3"><animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/></circle>
  <circle cx="90" cy="38" r="2" fill="#DBF0FF"><animate attributeName="opacity" values="0.7;0.2;0.7" dur="2.7s" repeatCount="indefinite"/></circle>
</svg>`;

const ERROR_SVG = `
<svg viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg" style="width: 80px; height: 80px; margin: 0 auto 12px;">
  <circle cx="55" cy="55" r="44" fill="#2E0F1A" stroke="#FF7B6E" stroke-width="2"/>
  <circle cx="55" cy="55" r="30" fill="none" stroke="#FF9F6E" stroke-width="2" stroke-dasharray="5 5">
    <animateTransform attributeName="transform" type="rotate" from="360 55 55" to="0 55 55" dur="8s" repeatCount="indefinite"/>
  </circle>
  <path d="M40 40 L70 70 M70 40 L40 70" stroke="#FFD0A3" stroke-width="5" stroke-linecap="round"/>
  <circle cx="55" cy="55" r="8" fill="#FF4422" opacity="0.8"><animate attributeName="r" values="6;10;6" dur="1.2s" repeatCount="indefinite"/></circle>
</svg>`;

const QUESTION_SVG = `
<svg viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg" style="width: 75px; height: 75px; margin: 0 auto 12px;">
  <circle cx="55" cy="55" r="46" fill="#13233F" stroke="#8EAEFF" stroke-width="1.8" stroke-dasharray="4 6"/>
  <circle cx="55" cy="55" r="36" fill="none" stroke="#C9DAFF" stroke-width="1.2"/>
  <text x="55" y="70" font-family="'Outfit', sans-serif" font-size="42" font-weight="800" fill="#FFE2A3" text-anchor="middle">?</text>
  <circle cx="30" cy="30" r="2" fill="#FFF2C4"><animate attributeName="opacity" values="0.5;1;0.5" dur="2.2s" repeatCount="indefinite"/></circle>
</svg>`;

const WARNING_SVG = `
<svg viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg" style="width: 80px; height: 80px; margin: 0 auto 12px;">
  <polygon points="55,18 88,88 22,88" fill="#2D1F0A" stroke="#FFC470" stroke-width="2"/>
  <text x="55" y="70" font-family="'Outfit', sans-serif" font-size="40" font-weight="800" fill="#FFB347" text-anchor="middle">!</text>
  <circle cx="55" cy="42" r="4" fill="#FFE0A3"/>
</svg>`;

// ---------- Core styling (attached once globally) ----------
const injectGlobalStyles = () => {
  if (document.getElementById('swal-premium-styles')) return;
  const style = document.createElement('style');
  style.id = 'swal-premium-styles';
  style.textContent = `
    .premium-swal-popup {
      border-radius: 36px !important;
      backdrop-filter: blur(20px) brightness(1.05) !important;
      background: var(--bg-card, rgba(12, 22, 45, 0.92)) !important;
      border: 1px solid rgba(100, 150, 255, 0.5) !important;
      box-shadow: 0 30px 55px -20px black, 0 0 0 1px rgba(210, 190, 255, 0.2) inset !important;
      padding: 1.2rem !important;
      font-family: 'Outfit', sans-serif !important;
    }
    .premium-swal-confirm, .premium-swal-cancel {
      font-family: 'Outfit', sans-serif !important;
      font-weight: 600 !important;
      border-radius: 60px !important;
      padding: 0.65rem 1.6rem !important;
      margin: 0 0.4rem !important;
      border: none !important;
      transition: all 0.2s ease !important;
      cursor: pointer !important;
    }
    .premium-swal-confirm {
      background: linear-gradient(115deg, #4B6FFF, #A14CFF) !important;
      color: white !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
    }
    .premium-swal-confirm:hover {
      transform: scale(1.02);
      background: linear-gradient(115deg, #6080FF, #B35EFF) !important;
    }
    .premium-swal-cancel {
      background: rgba(40, 50, 80, 0.8) !important;
      color: #CFE2FF !important;
      backdrop-filter: blur(4px);
      border: 1px solid rgba(100, 150, 255, 0.4) !important;
    }
    .premium-swal-cancel:hover {
      background: rgba(60, 80, 120, 0.9) !important;
      color: white;
    }
    .swal2-timer-progress-bar {
      background: linear-gradient(90deg, #6F9EFF, #CB7AFF) !important;
    }
    .swal2-html-container p, .swal2-html-container div {
      color: var(--text-secondary, #CDE2FF);
    }
  `;
  document.head.appendChild(style);
};
injectGlobalStyles();

// ---------- Enhanced Alert Functions ----------

export const showConfirmAlert = async (
  title: string,
  text: string,
  confirmButtonText: string = 'Confirm',
  cancelButtonText: string = 'Cancel'
) => {
  return MySwal.fire({
    title: `<div style="font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.6rem; color: var(--text-primary); margin-top: 8px;">${title}</div>`,
    html: `
      ${QUESTION_SVG}
      <div style="font-family: 'Outfit', sans-serif; color: var(--text-secondary); font-size: 1rem; line-height: 1.5; margin-top: 8px;">${text}</div>
    `,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    background: 'var(--bg-card)',
    backdrop: `rgba(0, 0, 0, 0.6)`,
    customClass: {
      popup: 'premium-swal-popup',
      confirmButton: 'premium-swal-confirm',
      cancelButton: 'premium-swal-cancel',
    },
    buttonsStyling: false,
    reverseButtons: true,
  });
};

export const showSuccessAlert = (title: string, text: string, timer: number = 2200) => {
  return MySwal.fire({
    title: `<div style="font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.6rem; color: var(--text-primary); margin-top: 8px;">${title}</div>`,
    html: `
      ${SUCCESS_SVG}
      <div style="font-family: 'Outfit', sans-serif; color: var(--text-secondary); font-size: 1rem; margin-top: 12px;">${text}</div>
    `,
    timer,
    showConfirmButton: false,
    background: 'var(--bg-card)',
    customClass: { popup: 'premium-swal-popup' },
  });
};

export const showErrorAlert = (title: string, text: string, timer?: number) => {
  return MySwal.fire({
    title: `<div style="font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.6rem; color: var(--text-primary); margin-top: 8px;">${title}</div>`,
    html: `
      ${ERROR_SVG}
      <div style="font-family: 'Outfit', sans-serif; color: #FFB8A0; font-size: 1rem; margin-top: 12px;">${text}</div>
    `,
    ...(timer && { timer, showConfirmButton: false }),
    showConfirmButton: !timer,
    confirmButtonText: 'Got it',
    background: 'var(--bg-card)',
    customClass: {
      popup: 'premium-swal-popup',
      confirmButton: 'premium-swal-confirm',
    },
    buttonsStyling: false,
  });
};

export const showWarningAlert = (title: string, text: string, confirmText: string = 'Understood') => {
  return MySwal.fire({
    title: `<div style="font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.6rem; color: var(--text-primary); margin-top: 8px;">${title}</div>`,
    html: `
      ${WARNING_SVG}
      <div style="font-family: 'Outfit', sans-serif; color: #FFD7A0; font-size: 1rem; margin-top: 12px;">${text}</div>
    `,
    confirmButtonText: confirmText,
    background: 'var(--bg-card)',
    customClass: {
      popup: 'premium-swal-popup',
      confirmButton: 'premium-swal-confirm',
    },
    buttonsStyling: false,
  });
};

export const showInfoAlert = (title: string, text: string, imageUrl?: string) => {
  const imageHtml = imageUrl
    ? `<img src="${imageUrl}" style="width: 100%; max-width: 280px; border-radius: 28px; margin: 12px auto 0; border: 1px solid #7FA3FF;" />`
    : '';
  return MySwal.fire({
    title: `<div style="font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.6rem; color: var(--text-primary); margin-top: 8px;">${title}</div>`,
    html: `
      <div style="text-align: center;">
        ${imageHtml || '<div style="width: 48px; height: 48px; margin: 0 auto; border-radius: 50%; background: #2E3B5E; display: flex; align-items: center; justify-content: center; font-size: 28px;">ℹ️</div>'}
        <div style="font-family: 'Outfit', sans-serif; color: var(--text-secondary); font-size: 0.95rem; margin-top: 16px;">${text}</div>
      </div>
    `,
    confirmButtonText: 'Explore',
    background: 'var(--bg-card)',
    customClass: {
      popup: 'premium-swal-popup',
      confirmButton: 'premium-swal-confirm',
    },
    buttonsStyling: false,
  });
};

export const showConfirmWithImage = async (
  title: string,
  message: string,
  imageUrl: string,
  confirmText = 'Yes, proceed',
  cancelText = 'Not now'
) => {
  return MySwal.fire({
    title: `<div style="font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.5rem; color: var(--text-primary);">${title}</div>`,
    html: `
      <img src="${imageUrl}" style="width: 100%; max-width: 260px; border-radius: 32px; margin: 12px auto; box-shadow: 0 8px 20px rgba(0,0,0,0.5);" />
      <div style="font-family: 'Outfit'; color: var(--text-secondary);">${message}</div>
    `,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    background: 'var(--bg-card)',
    customClass: {
      popup: 'premium-swal-popup',
      confirmButton: 'premium-swal-confirm',
      cancelButton: 'premium-swal-cancel',
    },
    buttonsStyling: false,
  });
};

export const showLoadingAlert = (message = 'Processing your request...') => {
  MySwal.fire({
    title: '<div style="font-family: Outfit; font-weight: 700;">Please wait</div>',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
        <div class="swal2-loader" style="border-color: #7F9FFF transparent #7F9FFF transparent; border-width: 4px; width: 48px; height: 48px;"></div>
        <div style="font-family: Outfit; color: var(--text-secondary);">${message}</div>
      </div>
    `,
    showConfirmButton: false,
    allowOutsideClick: false,
    background: 'var(--bg-card)',
    customClass: { popup: 'premium-swal-popup' },
  });
};

export const closeLoadingAlert = () => {
  MySwal.close();
};

// Default export for convenience
export default MySwal;