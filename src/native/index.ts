export * from "./client";
export * from "./contracts";
export * from "./hooks/useCursorRecordingData";
export * from "./hooks/useCursorTelemetry";
export const openDirectoryPicker = (defaultPath?: string) => window.electronAPI.openDirectoryPicker(defaultPath);
export const openVideoFilePicker = () => window.electronAPI.openVideoFilePicker();
