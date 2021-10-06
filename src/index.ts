import { Build as BUILD, ComponentInterface, getElement } from '@stencil/core';

declare type ClickOutsideDecorator = (
  target: ComponentInterface,
  propertyKey: string
) => void;

declare interface ClickOutsideOptions {
  triggerEvents?: string;
  exclude?: string;
}

const ClickOutsideOptionsDefaults: ClickOutsideOptions = {
  triggerEvents: "click",
  exclude: ""
};

/**
 * Call this function as soon as the click outside of annotated method's host is done.
 * @example
```
@ClickOutside()
callback() {
  // this will run when click outside of element (host component) is done.
}
```
 */
export function ClickOutside(
  opt: ClickOutsideOptions = ClickOutsideOptionsDefaults
): ClickOutsideDecorator {
  return (proto: ComponentInterface, methodName: string) => {
    // this is to resolve the 'compiler optimization issue':
    // lifecycle events not being called when not explicitly declared in at least one of components from bundle
    (BUILD as any).connectedCallback = true;
    (BUILD as any).disconnectedCallback = true;

    const { connectedCallback, disconnectedCallback } = proto;

    proto.connectedCallback = function() {
      const host = getElement(this);
      const method = this[methodName];
      registerClickOutside(this, host, method, opt);
      return connectedCallback && connectedCallback.call(this);
    };

    proto.disconnectedCallback = function() {
      const host = getElement(this);
      const method = this[methodName];
      removeClickOutside(this, host, method, opt);
      return disconnectedCallback && disconnectedCallback.call(this);
    };
  };
}

/**
 * Register callback function for HTMLElement to be executed when user clicks outside of element.
 * @example
```
<span
    ref={spanEl => registerClickOutside(this, spanEl, () => this.test())}>
      Hello, World!
</span>;
```
 */
export function registerClickOutside(
  component: ComponentInterface,
  element: HTMLElement,
  callback: () => void,
  opt: ClickOutsideOptions = ClickOutsideOptionsDefaults
): void {
  const excludedNodes = getExcludedNodes(opt);
  getTriggerEvents(opt).forEach(triggerEvent => {
    window.addEventListener(
      triggerEvent,
      (e: Event) => {
        initClickOutside(e, component, element, callback, excludedNodes);
      },
      false
    );
  });
}

/**
 * Remove click outside callback function for HTMLElement.
 */
export function removeClickOutside(
  component: ComponentInterface,
  element: HTMLElement,
  callback: () => void,
  opt: ClickOutsideOptions = ClickOutsideOptionsDefaults
): void {
  getTriggerEvents(opt).forEach(triggerEvent => {
    window.removeEventListener(
      triggerEvent,
      (e: Event) => {
        initClickOutside(e, component, element, callback);
      },
      false
    );
  });
}

function initClickOutside(
  event: Event,
  component: ComponentInterface,
  element: HTMLElement,
  callback: () => void,
  excludedNodes?: Array<HTMLElement>
) {
  const target = event.target as HTMLElement;
  if (!element.contains(target) && !isExcluded(target, excludedNodes)) {
    callback.call(component);
  }
}

function getTriggerEvents(opt: ClickOutsideOptions): Array<string> {
  if (opt.triggerEvents) {
    return opt.triggerEvents.split(",").map(e => e.trim());
  }
  return ["click"];
}

function getExcludedNodes(opt: ClickOutsideOptions): Array<HTMLElement> {
  if (opt.exclude) {
    try {
      return Array.from(document.querySelectorAll(opt.exclude))
    } catch (err) {
      console.warn(
        `@ClickOutside: Exclude: '${
          opt.exclude
        }' will not be evaluated. Check your exclude selector syntax.`,
        err
      );
    }
  }
  return;
}

function isExcluded(
  target: HTMLElement,
  excudedNodes?: Array<HTMLElement>
): boolean {
  if (target && excudedNodes) {
    for (let excludedNode of excudedNodes) {
      if (excludedNode.contains(target)) {
        return true;
      }
    }
  }

  return false;
}
