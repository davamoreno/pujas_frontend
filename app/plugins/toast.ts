import { defineNuxtPlugin } from "#app";
import Toast, { type PluginOptions } from "vue-toastification";

// (Opsional) Konfigurasi default untuk semua toast
const options: PluginOptions = {
  position: "top-right",
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  rtl: false,
};

export default defineNuxtPlugin((nuxtApp) => {
  // Daftarkan plugin ke instance Vue
  nuxtApp.vueApp.use(Toast, options);
});