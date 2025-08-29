import { B as push, J as ensure_array_like, K as store_get, M as push_element, N as attr_class, O as escape_html, P as pop_element, Q as unsubscribe_stores, G as pop, I as FILENAME } from "../../chunks/index.js";
import "clsx";
import { w as writable } from "../../chunks/index2.js";
const toasts = writable([]);
ToastContainer[FILENAME] = "src/lib/components/ToastContainer.svelte";
function ToastContainer($$payload, $$props) {
  push(ToastContainer);
  var $$store_subs;
  const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$toasts", toasts).slice(-4));
  $$payload.out.push(`<div class="fixed bottom-4 left-4 z-[9999] flex flex-col gap-2" role="status" aria-live="polite">`);
  push_element($$payload, "div", 10, 0);
  $$payload.out.push(`<!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let t = each_array[$$index];
    $$payload.out.push(`<div${attr_class("group relative max-w-sm rounded-lg px-4 py-2 shadow-lg text-white backdrop-blur-sm border border-white/10", void 0, {
      "bg-green-600": t.type === "success",
      "bg-red-600": t.type === "error",
      "bg-yellow-700": t.type === "info"
    })} title="Kattints a bezáráshoz">`);
    push_element($$payload, "div", 15, 4);
    $$payload.out.push(`<div class="pr-6">`);
    push_element($$payload, "div", 26, 6);
    $$payload.out.push(`${escape_html(t.message)}</div>`);
    pop_element();
    $$payload.out.push(` <button class="absolute right-1 top-1 rounded px-1 text-white/80 hover:text-white focus:outline-none" aria-label="Toast bezárása">`);
    push_element($$payload, "button", 29, 6);
    $$payload.out.push(`×</button>`);
    pop_element();
    $$payload.out.push(` <div class="absolute left-0 bottom-0 h-0.5 w-full bg-black/20 overflow-hidden">`);
    push_element($$payload, "div", 37, 6);
    $$payload.out.push(`<div class="h-full bg-white/70 animate-progress svelte-1fhsok3">`);
    push_element($$payload, "div", 38, 8);
    $$payload.out.push(`</div>`);
    pop_element();
    $$payload.out.push(`</div>`);
    pop_element();
    $$payload.out.push(`</div>`);
    pop_element();
  }
  $$payload.out.push(`<!--]--></div>`);
  pop_element();
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
ToastContainer.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
_layout[FILENAME] = "src/routes/+layout.svelte";
function _layout($$payload, $$props) {
  push(_layout);
  let { children } = $$props;
  children($$payload);
  $$payload.out.push(`<!----> `);
  ToastContainer($$payload);
  $$payload.out.push(`<!---->`);
  pop();
}
_layout.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
export {
  _layout as default
};
