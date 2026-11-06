export const scheduled = new Map();
export const schedules = scheduled;
export const addSchedule = (k,v) => scheduled.set(k,v);
export const removeSchedule = (k) => scheduled.delete(k);
export const getSchedules = () => [...scheduled.values()];
export default scheduled;
