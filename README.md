# stencil-click-outside

## What is it?
`stencil-click-outside` is a [Stencil](https://stenciljs.com/) `@ClickOutside` decorator that allows you to call component method as the user clicks outside of the host component. Obviously it's very easy. Why then import it as external library? First, because it does not make sense write this boilerplate code in each project. Second, because decorator solution is elegant and convenient.
Additionaly this library will also come together with other Stencil decorators as a separate package.


## Installing

In your Stencil project, add `stencil-click-outside` to your package.json:
```
npm i stencil-click-outside
```

## How to use it?
It's very simple: you just need to anotate your method with `@ClickOutside` and it will be called when user clicks outside of component area.

```javascript

import { Component, h } from '@stencil/core';
import { ClickOutside } from 'stencil-click-outside';

@Component({ tag: 'my-component', shadow: true })
export class MyComponent {

  @ClickOutside()
  someMethod() { 
      console.log("someMethod was called because user just clicked outside of MyComponent"); 
    }

  render() { return <div>Hello, World!</div>; }
}
```

It may sometimes happen that you would like monitor for outside clicks not the whole component's HTMLElement but only some part, a div which you render. This is also possible the API then is as follows:

```javascript

import { Component, h } from '@stencil/core';
import { registerClickOutside } from 'stencil-click-outside';

@Component({ tag: 'my-component', shadow: true })
export class MyComponent {

  someMethod() { 
      console.log("someMethod was called because user just clicked outside of span html element in render method of MyComponent"); 
    }

  render() { 
    return ( 
      <span 
          ref={spanEl => registerClickOutside(spanEl, () => this.someMethod())}>
            Hello, World!
      </span>;
    )
  }
```