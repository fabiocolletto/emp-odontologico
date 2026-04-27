(function registerClinicContextService(global) {
  const namespace = (global.OdontoFlowSharedModules = global.OdontoFlowSharedModules || {});
  namespace.services = namespace.services || {};

  const ACTIVE_CLINIC_KEY = 'active-clinic';
  const AVAILABLE_CLINICS_KEY = 'available-clinics';

  const storageService = () => namespace.services.StorageService;
  const eventBus = () => namespace.services.EventBus;

  function getActiveClinic() {
    return storageService()?.get(ACTIVE_CLINIC_KEY, null) || null;
  }

  function setActiveClinic(clinic) {
    storageService()?.set(ACTIVE_CLINIC_KEY, clinic || null);
    notifyClinicChanged(clinic || null);
    return clinic || null;
  }

  function getAvailableClinics() {
    return storageService()?.get(AVAILABLE_CLINICS_KEY, []);
  }

  function setAvailableClinics(clinics = []) {
    storageService()?.set(AVAILABLE_CLINICS_KEY, clinics);
    return clinics;
  }

  function notifyClinicChanged(clinic) {
    eventBus()?.emit('clinic:changed', clinic || null);
  }

  const ClinicContextService = {
    getActiveClinic,
    setActiveClinic,
    getAvailableClinics,
    setAvailableClinics,
    notifyClinicChanged
  };

  namespace.services.ClinicContextService = ClinicContextService;
})(globalThis);
