import { getElement } from "@stencil/core";

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
export function ClickOutside() {
    return (proto: any, prop: any) => {
        console.log(proto);
        console.log(this);
        const host = getElement(proto);
        const { componentWillLoad } = proto;
            proto.componentWillLoad = () => {
                window.addEventListener('click', (e: Event) => {
                    const target = e.target as HTMLElement;
                    if(!host.contains(target)) {
                        this[prop].call(this);
                    }
                }, false);
                
          return componentWillLoad && componentWillLoad.call(this);
        };
    };
  }