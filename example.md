::: section center-center invert no-number
# This is the main title
:::

::: section center-center invert
## This is the subtitle
#### and the sub subtitle {.text-highlight}
:::

::: section
### Usage

- use the arrow keys to navigate or swipe on touch devices
- press `space` to toggle audio/video elements
- press `o` for the overview
- press `f` for fullscreen

:::

::: section top-left
### What's in the box
1. [Steps](#5.0)
1. [Blockquotes](#6.0)
1. [Shouts](#7.0)
1. [Styles](#11.0)
1. [Code](#13.0)
1. [Media](#15.0)
1. [Embeds](#20.0)
1. [Notes](#26.0)
:::

::: section top-left
### Steps

There are a few different effects for steps:

- Appear {.step}
- Fade in {.step .fade-in}
- Grow {.step .grow}
- Slide in {.step .slide-in}
- Slide up {.step .slide-up}

:::

::: section invert

> Some people drink from the fountain of knowledge, others just gargle.
<cite>Robert Anthony</cite>

:::

::: section center-center

### This is a shout that fades in {.h1 .shout .fade-in}

:::

::: section center-center

### This is a shout that grows {.h1 .shout .grow}

:::

::: section center-center

### This is a shout that slides in {.h1 .shout .slide-in}

:::

::: section center-center

### This is a shout that slides up {.h1 .shout .slide-up}

:::

::: section
### Text styles   

- `.text-light` – white text
- `.text-highlight` – text in accent color
- `.text-shadow` – text shadow

```css
:root {
  --accent-color: #f00;
  --progress-color: #f00;
}
```

:::

::: section

### Section styles

- `.invert` – white text on black background
- `.no-padding` – no padding on section
- `.no-number` – don't show slide number

The following classes are for flexbox content alignment:
`.top-left` `.top-center` `.top-right` `.center-left` `.center-center` `.center-right` `.bottom-left` `.bottom-center` `.bottom-right`

:::

::: section

### Code

```javascript
// this is some javascript code

function someFunction() {
  console.log('this is some function');
}

someFunction();
```

:::

::: section invert

::: fullscreen

```javascript
class SomeClass {
  constructor() {
    // constructor function
  }
  doSomething(...args) {
    // do something with arguments
  }
  doSomethingElse(...args) {
    // do something else with arguments
  }
  doSomeMore(...args) {
    // do some more with arguments
  }
}
```   

:::

::: section center-center invert blur-in
### Fullscreen image {.text-shadow .h2}
::: fullscreen

![alt](http://www.wallpapermaiden.com/wallpaper/1916/download/1440x900/coffee-cup-steam-desk.jpg)

:::

::: section center-center invert fade-in
### Fullscreen video {.text-shadow .h2}
::: fullscreen

@[video](http://techslides.com/demos/sample-videos/small.mp4)

:::

::: section

### Block image

![alt](https://camo.githubusercontent.com/b7350cf62d5e1e04dfbfc3b3cddd48b994d23a09/68747470733a2f2f692e6779617a6f2e636f6d2f32663530616330363066363939636333323337343134303331373463656336362e706e67)

:::

::: section
### Block video

@[video-controls](http://techslides.com/demos/sample-videos/small.mp4)

:::


::: section
### Block audio

@[audio](https://archive.org/download/testmp3testfile/mpthreetest.mp3)

:::

::: section invert
### Youtube

@[youtube](qREKP9oijWI)

:::

::: section invert
### Vimeo

@[vimeo](10314280)

:::

::: section invert
### Vine

@[vine](bjHh0zHdgZT)

:::

::: section invert
### Prezi

@[prezi](1kkxdtlp4241)

:::

::: section
### JSFiddle

@[jsfiddle](http://jsfiddle.net/rykeller/y4848ak7/8/embedded/html,css,result/)

:::

::: section
### Codepen

@[codepen](http://codepen.io/Yakudoo/embed/YXxmYR/?height=265&amp;theme-id=0&amp;default-tab=js,result&amp;embed-version=2)

:::

::: section
### Notes

Add notes to a slide inside of a `<details>` element. They are then printed in the console. *Check the console.*

```html
<section>
  <h3>Slide</h3>
  <details>This is a note.</details>
</section>
```


::: notes

These are just some notes to demonstrate the note function.
When presenting, open the dev tools on a separate screen to see the notes.

:::

::: section center-center invert

## The end {.shout .grow .h1}

:::
