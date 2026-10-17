import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about/index.html'),
        services: resolve(__dirname, 'services/index.html'),
        fix: resolve(__dirname, 'services/civitas-fix/index.html'),
        care: resolve(__dirname, 'services/civitas-care/index.html'),
        propertyWatch: resolve(__dirname, 'services/property-watch/index.html'),
        howItWorks: resolve(__dirname, 'how-it-works/index.html'),
        serviceAreas: resolve(__dirname, 'service-areas/index.html'),
        insights: resolve(__dirname, 'insights/index.html'),
        insightDeepClean: resolve(__dirname, 'insights/how-often-should-you-deep-clean/index.html'),
        insightLandlordChecks: resolve(__dirname, 'insights/seven-maintenance-checks-for-landlords/index.html'),
        insightPreparingRental: resolve(__dirname, 'insights/preparing-rental-property-for-new-tenant/index.html'),
        insightManagingAbroad: resolve(__dirname, 'insights/managing-property-from-abroad/index.html'),
        insightPreventiveCare: resolve(__dirname, 'insights/why-preventive-maintenance-matters/index.html'),
        insightCommonMistakes: resolve(__dirname, 'insights/common-maintenance-mistakes-to-avoid/index.html'),
        insightPrepareForCleaning: resolve(__dirname, 'insights/how-to-prepare-your-home-for-cleaning/index.html'),
        insightInspectionChecklist: resolve(__dirname, 'insights/practical-property-inspection-checklist/index.html'),
        contact: resolve(__dirname, 'contact/index.html'),
        privacy: resolve(__dirname, 'privacy/index.html'),
        terms: resolve(__dirname, 'terms/index.html'),
        notFound: resolve(__dirname, '404.html')
      }
    }
  }
});
