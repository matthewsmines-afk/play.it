export const openInMaps = (latitude, longitude, label) => {
  if (!latitude || !longitude) {
    console.error("Latitude or longitude is missing.");
    return;
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const encodedLabel = encodeURIComponent(label);

  if (isIOS) {
    // Apple Maps URL scheme
    window.open(`maps://?q=${encodedLabel}&ll=${latitude},${longitude}`, '_blank');
  } else {
    // Google Maps URL for Android and web
    window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank');
  }
};