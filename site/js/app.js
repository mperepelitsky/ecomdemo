import { initDemoBanner } from "./ui/banner.js";

export const app = {
  init({ pageType } = {}) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        initDemoBanner({ pageType });
      });
      return;
    }

    initDemoBanner({ pageType });
  },
};
