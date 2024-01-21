export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    // console.log("Text copied to clipboard");
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
};

export const fastInterval = (callback, delay) => {
  callback();
  return setInterval(callback, delay);
};
