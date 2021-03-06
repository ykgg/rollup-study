// import $ from 'jquery'
import foo from './foo'
import './style.css'
import logo from './zce.png'

foo.bar()

import('jquery').then($ => {
  $(document.body).append('<h1>Hello Parcel</h1>')

  $(document.body).append(`<img src="${logo}" />`)
})

if (module.hot) {
  // accept 只可以接收一个参数就是这个回调函数
  module.hot.accept(() => {
    console.log('hmr')
  })
}