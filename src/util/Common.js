import { v4 } from "uuid";

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

export function sendEvent(name, data) {
  const event = new Event(name, { bubbles: true });
  event.data = data;
  document.dispatchEvent(event);
}

export function uuidv4() {
  return v4();
}

export const colorize = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  magenta: (text) => `\x1b[35m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  white: (text) => `\x1b[37m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
};

export const printf = (varName, variable, ...args) => {
  console.log(`${colorize.green(varName)}`, variable, ...args);
};

export const errorf = (varName, variable, ...args) => {
  console.error(`${colorize.red(varName)}`, variable, ...args);
};
