# Italy Trip 2026 Guide Site

一个适合部署到 GitHub Pages 的多页面静态旅行攻略站，优先面向手机浏览。

## 文件结构

- `index.html`: 首页
- `overview.html`: 路线总览
- `itinerary.html`: 每日行程
- `food.html`: 餐饮指南
- `safety.html`: Solo旅行安全提示
- `booking.html`: 预订清单
- `jojo.html`: JoJo打卡页
- `styles.css`: 全站样式
- `trip-data.js`: 全部内容数据
- `app.js`: 共享渲染逻辑与地图初始化

## 本地预览

可以直接双击 `index.html` 打开，也可以在仓库根目录启动一个本地静态服务器。

例如：

```bash
python3 -m http.server 4173
```

然后访问 `http://localhost:4173`。

## 部署到 GitHub Pages

1. 把这个仓库推到 GitHub。
2. 进入仓库的 `Settings`。
3. 打开 `Pages`。
4. 在 `Build and deployment` 里选择：
   - `Source`: `Deploy from a branch`
   - `Branch`: `main`（或你的默认分支）
   - `Folder`: `/ (root)`
5. 保存后等待 Pages 发布完成。

### 终端命令

如果当前目录还不是 Git 仓库，可以直接执行：

```bash
cd /Users/ouwen/projects/Trips
git init
git add .
git commit -m "Initial trip guide site"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

如果你想用 GitHub CLI，也可以：

```bash
cd /Users/ouwen/projects/Trips
git init
git add .
git commit -m "Initial trip guide site"
gh repo create <仓库名> --public --source=. --remote=origin --push
```

发布步骤：

1. 打开 GitHub 仓库页面。
2. 进入 `Settings` -> `Pages`。
3. `Source` 选择 `Deploy from a branch`。
4. `Branch` 选择 `main`，目录选择 `/ (root)`。
5. 保存，等待 GitHub Pages 生成站点地址。
6. 发布后通常会得到 `https://<你的用户名>.github.io/<仓库名>/`。

## 地图方案

- 页面内交互地图：`Leaflet + OpenStreetMap`
- 外部导航：`Google Maps Search` 跳转链接

这个组合不需要 Google Maps API Key，适合免费部署。

## 维护方式

- 日后修改内容时，优先只改 `trip-data.js`
- 页面结构和样式基本不需要动
- 地图做了懒加载，手机打开时不会一次性初始化全部地图
