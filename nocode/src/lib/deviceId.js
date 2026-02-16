export function getDeviceId() {
  let id = localStorage.getItem('sipwise_device_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('sipwise_device_id', id);
  }
  return id;
}
