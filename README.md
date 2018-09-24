# animate
A super simple component for animating with css and have a callback executed when animation has ended

Usage
```
<Animate
  animations={[{
                        args: `2s 5`,
                        keyframes: targetWidth => `0% {color: rgba(175,175,175,.6)} 50% {color: rgba(175,175,175,1)} 100% {color: rgba(175,175,175,.6)}`,
  }]}
  onAnimationStart={this.handleAnimationStart}
  onAnimationEnd={this.handleAnimationEnd}
>
  <div>Hello Animation</div>
</Animate>
```

`args` are added to the css property
`keyframes` are ordinary css keyframes

A unique name is generated for each animation in order to properly bind `end` listeners to them. When all animations have finished, `onAnimationsEnd` is called.
