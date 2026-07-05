export const GHOSTLINE_CALL_COMPLETED_EVENT = "ghostline:call-completed";

export function dispatchCallCompletedEvent() {
  window.dispatchEvent(new CustomEvent(GHOSTLINE_CALL_COMPLETED_EVENT));
}
