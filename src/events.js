// @ts-check

/**
 * Event names dispatched by LeadBox on the host element (the widget's root
 * container in the light DOM, i.e. `document` by default). See README for
 * payload shapes.
 */
export const EVENTS = {
  SUBMIT: 'leadbox:submit',
  SUCCESS: 'leadbox:success',
  ERROR: 'leadbox:error',
};

/**
 * Dispatch a CustomEvent with the given name/detail from a target node.
 * @param {EventTarget} target
 * @param {string} name
 * @param {unknown} [detail]
 * @returns {boolean} Whether the event was not canceled (matches `dispatchEvent`).
 */
export function emit(target, name, detail) {
  const event = new CustomEvent(name, { detail, bubbles: true, cancelable: true, composed: true });
  return target.dispatchEvent(event);
}
