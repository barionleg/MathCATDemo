import init, * as bindings from 'math_cat_demo-f758716f1daac5f0.js';
const wasm = await init({ module_or_path: 'math_cat_demo-f758716f1daac5f0_bg.wasm' });


window.wasmBindings = bindings;


dispatchEvent(new CustomEvent("TrunkApplicationStarted", {detail: {wasm}}));