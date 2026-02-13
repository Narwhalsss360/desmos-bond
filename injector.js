function injectScript(path) {
  const parent = document.head || document.documentElement;
  const script = document.createElement("script");
  script.setAttribute("src", chrome.runtime.getURL(path));
  parent.append(script);
  return script;
}

const desmosScript = injectScript("desmos.js")
const observersScript = injectScript("observers.js")
