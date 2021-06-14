## Rollup

### 概述

Rollup 与 Webpack 作用类似，Rollup更小巧，仅仅是一款 ESM 打包器。

Rollup 中并不支持类型 HMR 这种高级特性

Rollup 并不是与 Webpack 全面竞争，其初衷是提供一个充分利用 ESM 各种特性的高效打包器



### 快速上手

安装rollup:

```bash
yarn add rollup --dev
```

运行rollup:

```bash
yarn rollup
```

在不传递任何参数的时候，rollup 会打印出它的帮助信息。

Usage: rollup [options] <entry file>    

**指定一个打包入口文件**

```bash
yarn rollup ./src/index.js
```

**指定输出格式 --format iife (自调用函数)**

```bash
yarn rollup ./src/index.js --format iife
```

**指定输出文件路径 --file**

```bash
yarn rollup ./src/index.js --format iife --file dist/bundle.js
```

**结论**：

rollup的打包结果惊人的简洁，基本上跟我们手写的代码一样的。相比于 Webpack 中大量的引导代码还有模块函数，这里的输出结果几乎没有任何的多余代码。rollup 默认会开启 tree-shaking 去优化代码，tree-shaking最早就是在rollup中提出的。



### 配置文件

```js
// rollup.config.js
export default {
    input: 'src/index.js',
    output: {
        file: 'dist/bundle.js',
        format: 'iife' // 输出格式 （iife：自调用函数）
    }
}
```

运行打包：

```bash
yarn rollup --config
```

也可以运行指定的配置文件，如：dev.config.js、prod.config.js

```bash
yarn rollup --config rollup.config.js
yarn rollup --config dev.config.js
yarn rollup --config prod.config.js
```



### 使用插件

额外的需求：

- 加载其它类型资源文件

- 导入CommonJS 模块

- 编译 ECMAScript 新特性

Rollup 支持使用插件的方式扩展

插件是 Rollup 唯一的扩展途径

接下来我们用导入json的插件来演示rollup怎么使用插件

安装rollup-plugin-json

```bash
yarn add rollup-plugin-json --dev
```

 打开配置文件 配置：

```js
import json from 'rollup-plugin-json'; // rollup 支持ESM,我们可以直接使用import导入

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/bundle.js',
        format: 'iife' // 输出格式 （iife：自调用函数）
    },
    plugins: [
        json(),// 把调用的结果放到数组当中，而不是将函数放进去
    ]
}
```

 在index.js 中使用

```js
// src/index.js
import { log } from './logger'
import message from './message'
import { name, version } from "../package.json"
const msg = message.hi;

log(msg);
log(name);
log(version);
```

运行打包：

```bash
yarn rollup --confing
```

查看结果：

```js
// dist/bundle.js
(function () {
    'use strict';

    const log = msg => {
        console.log('--------------INFO--------------');
        console.log(msg);
        console.log('--------------------------------');
    };

    var message = {
        hi: "Hey Guys, I am kk ~"
    };

    var name = "01-getting-start";
    var version = "1.0.0";

    const msg = message.hi;

    log(msg);
    log(name);
    log(version);

}());

```



### 加载 npm 模块

Rollup 默认只能按照文件路径去加载本地的文件模块，对于 npm 中的第三方模块并不能像 Webpack 一样直接通过模块名称导入对应模块。

为了抹平这个差异，Rollup官方给出了 rollup-plugin-node-resolve 插件，通过使用这个插件我们就可以直接使用模块名称导入相应的模块。

安装插件：

```bash
yarn add rollup-plugin-node-resolve --dev
```

配置：

```js
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/bundle.js',
        format: 'iife' // 输出格式 （iife：自调用函数）
    },
    plugins: [
        json(),// 把调用的结果放到数组当中，而不是将函数放进去
        resolve(),
    ]
}
```

使用：

提前到导入了 lodash-es （使用loads-es 而不是使用 lodash 的原因是rollup默认只能处理 ESM 模块）

```js
// src/index.js
import _ from 'lodash-es';
import { log } from './logger'
import message from './message'
import { name, version } from "../package.json"
const msg = message.hi;

log(msg);
log(name);
log(version);
log(_.camelCase('hello world'))
```



### 加载 CommonJS 模块

由于目前有大量的 npm 模块使用 CommonJS 的方式去导出成员，所以为了兼容这些模块官方又给出了一个插件：rollup-plugin-commonjs

安装插件 rollup-plugin-commonjs:

```bash
yarn add rollup-plugin-commonjs --dev
```

配置：

```js
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/bundle.js',
        format: 'iife' // 输出格式 （iife：自调用函数）
    },
    plugins: [
        json(),// 把调用的结果放到数组当中，而不是将函数放进去
        resolve(),
        commonjs(),
    ]
}
```

使用：

先准备 CommonJS 模块

```js
// /src/cjs-module.js
module.exports = {
    foo: 'bar',
}
```

再到index.js中使用

```js
import _ from 'lodash-es';
import { log } from './logger'
import message from './message'
import { name, version } from "../package.json"
import cjs from './cjs-module'

const msg = message.hi;

log(msg);
log(name);
log(version);
log(_.camelCase('hello world'))
log(cjs);
```

运行打包：

``` bash
yarn rollup --config
```

此时 CommonJS 模块就可以打包进我们的 bundle.js 中了



### 代码拆分 code spliting

在新版本的Rollup 中也支持了 Dynamic imports （动态导入），Rollup 内部也会自动的去处理代码拆分（分包）

尝试动态导入：

```js
// src/index.js
import('./logger').then(({ log }) => {
    console.log('code splitting~');
})
```

由于动态导入的打包输出格式不能是iife（因为iife会把所有的模块放到同一个函数当中，所以无法实现代码拆分）,要使用代码拆分的话就必须要使用amd或者cjs这些其它的标准。我们配置一下config.js

```js
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
    input: 'src/index.js',
    output: {
        // file: 'dist/bundle.js',
        // format: 'iife' // 输出格式 （iife：自调用函数）
        dir: 'dist',
        format: 'amd'
    },
    plugins: [
        json(),// 把调用的结果放到数组当中，而不是将函数放进去
        resolve(),
        commonjs(),
    ]
}
```

运行打包：

```bash
yarn rollup --config
```

查看打包结果：dist中生成了入口bundle及动态导入对应的bundle，它们都以amd标准输出的。

这就是在Rollup中以动态导入的形式实现代码拆分。



### 多入口打包

Rollup 也支持多入口打包，而且对于多入口当中的公共部分也会单独提取出来作为独立的bundle。

配置非常简单，只需要把配置文件中的input属性改为数组就可以了，也可以使用对象。输出格式修改为amd

```js
export default {
  // input: ['src/index.js', 'src/album.js'],
  input: {
    foo: 'src/index.js',
    bar: 'src/album.js'
  },
  output: {
    dir: 'dist',
    format: 'amd'
  }
}
```

运行打包：

```bash
yarn rollup --config
```

查看结果：有三个文件bar.js、foo.js、及公共模块。

**需要注意：**对于amd这种输出格式的js文件我们不能直接引用到页面上，而是需要去通过实现amd标准的库加载。

在dist下创建index.html文件，使用require.js加载

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
  <!-- AMD 标准格式的输出 bundle 不能直接引用 -->
  <!-- <script src="foo.js"></script> -->
  <!-- 需要 Require.js 这样的库 -->
  <script src="https://unpkg.com/requirejs@2.3.6/require.js" data-main="foo.js"></script>
</body>
</html>
```

运行打包结果：

```bash
yarn serve dist
```

打开浏览器可以查看我们的打包结果正常的工作了。



### 选用原则

Rollup/Webpack

**Rollup的优势**

- 输出结果更加扁平
- 自动移除未引用代码
- 打包结果依然完全可读

**Rollup的缺点**

- 加载非 ESM 的第三方模块比较复杂
- 模块最终都被打包到一个函数中，无法实现HMR
- 浏览器环境中，代码拆分功能依赖AMD库

综合以上的特点：

如果我们正在开发应用程序，建议选择 Webpack 

如果我们正在开发一个框架或者类库，建议选择 Rollup

所以，大多数知名框架/库都在使用 Rollup

（这不是绝对的标准，只是经验法则，因为Rollup也可以去构建绝大多数的应用程序，而Webpack也可以去构建类库和框架，只不过相对来说术业有专攻些。另外，随着近几年 Webpack的发展，Rollup 的优势基本上也已经被抹平了）

社区中希望二者并存

总结：**Webpack 大而全，Rollup 小而美**





## Parcel

零配置的前端应用打包器

它提供了几乎傻瓜式的体验，我们只需要了解它所提供的几个简单的命令就可以直接用它来构建前端应用程序了。

安装parcel-bundler：

```bash
yarn add parcel-bundler --dev
```

创建打包入口文件 /src/index.html

官网建议用html文件作为打包入口（因为html是应用运行在浏览器时的入口）

运行打包：

```bash
yarn parcel src/index.html
```

parcel 不仅帮我们打包了应用，而且还帮我们开启了开发服务器

默认支持热更新、模块热替换的功能

自动安装依赖

支持加载其他类型的资源模块  （零配置）

**Parcel 想给开发者的体验就是：想要做什么事情就去做，额外的事情就由工具去负责处理。**

parcel 也支持动态导入，使用了动态导入也会拆分代码

在使用上parcel 几乎没有任何的难度，从头到尾我们只执行了一个parcel命令，其他所有的事情都是parcel内部帮我们完成的

以**生产模式**打包：

```bash
yarn parcel build src/index.html
```



对于相同体量的项目打包，Parcel 会比 Webpack 快很多，因为在 Parcel 的内部是使用了多进程同时去工作，充分发挥了多核CPU的性能。在 Webpack 中也可以使用 happypack 插件来实现这一点。

Parcel 整体体现下来就一个感觉：舒服。因为它在使用上真的是太简单了，试想一下 我们之前用的 Webpack 都需要做很多额外的安装很多插件。其实在 Parcel 中也有很多这些插件，只不过它是自动帮我们安装的。

Parcel 首个版本发布于2017年，当时的 Webpack 使用上过于繁琐。 

**其核心特点是：完全零配置、构建速度更快**

目前，绝大多数的项目还是使用 Webpack 打包，个人认为主要原因是 Webpack 有更好的生态，随着这两年的发展 Webpack 也越来越好用了。

了解 Parcel 保持对新鲜技术和工具的敏感度，从而更好的把握趋势和走向。

























