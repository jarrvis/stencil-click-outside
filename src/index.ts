import { getElement } from "@stencil/core";
import { ComponentInstance } from "@stencil/core/dist/declarations";
import { BUILD } from "@stencil/core/build-conditionals";

declare type ClickOutsideDecorator = (
  target: ComponentInstance,
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
  return (proto: ComponentInstance, methodName: string) => {
    // this is to resolve the 'compiler optimization issue':
    // lifecycle events not being called when not explicitly declared in at least one of components from bundle
    BUILD.cmpDidLoad = true;
    BUILD.cmpDidUnload = true;

    const { componentDidLoad, componentDidUnload } = proto;

    proto.componentDidLoad = function() {
      const host = getElement(this);
      const method = this[methodName];
      registerClickOutside(this, host, method, opt);
      return componentDidLoad && componentDidLoad.call(this);
    };

    proto.componentDidUnload = function() {
      const host = getElement(this);
      const method = this[methodName];
      removeClickOutside(this, host, method, opt);
      return componentDidUnload && componentDidUnload.call(this);
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
  component: ComponentInstance,
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
  component: ComponentInstance,
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
  component: ComponentInstance,
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
