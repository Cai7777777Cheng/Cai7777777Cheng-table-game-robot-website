# Nomo

桌面游戏伴侣的产品页。一条长滚动：封面、陈述、环幕、器物，最后是可以操作的原型。

线上地址：[https://nomo-tabletop.deed.page/](https://nomo-tabletop.deed.page/)

- `/` 封面
- `/features` 滚到环幕
- `/prototype` 滚到原型

## 本地运行

```bash
npm install
npm run dev
```

开发服务器在 [http://127.0.0.1:4731](http://127.0.0.1:4731)。

```bash
npm run build
npm run preview
```

产物在 `dist/`。

## GitHub Pages

- 用户站点 `https://<user>.github.io/`：直接 `npm run build`。
- 项目站点 `https://<user>.github.io/<repo>/`：带上仓库名。

```bash
VITE_BASE_PATH=/nomo/ npm run build
```

`/`、`/features/`、`/prototype/` 各有一份 `index.html`。构建会把 `index.html` 复制成 `404.html`。

原型嵌入 [已发布的 3D 演示](https://cai7777777cheng.github.io/Table-robot-function/)。封面是 `public/hero.jpg`。还没拍到的画面用灰色占位。
