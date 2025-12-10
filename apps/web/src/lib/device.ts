export const useDeviceId = () => {
  if (typeof window === "undefined") return "unknown";

  let deviceId = localStorage.getItem("workModeDeviceId");
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("workModeDeviceId", deviceId);
  }
  return deviceId;
};
