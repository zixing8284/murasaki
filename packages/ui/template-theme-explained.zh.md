# Windows `.theme` 文件说明

`.theme` 是 Windows Classic / Windows 98 风格主题配置文件，用来描述系统颜色、桌面设置、字体度量、非客户区尺寸等。

其中最常用、也最直接影响界面的，是：

- `[Control Panel\Colors]`
- `[Control Panel\Desktop]`
- `[Metrics]`

这份说明主要聚焦 `[Control Panel\Colors]`，因为它决定了按钮、窗口、菜单、选中态、禁用态等大部分视觉表现。

---

## 1. `.theme` 文件结构

### `[Theme]`
主题基本信息，例如：

- `DisplayName`：主题名称

### `[Control Panel\Colors]`
系统颜色表。每一项格式都是：

`名称=R G B`

例如：

`ButtonFace=212 208 200`

表示按钮表面颜色为 `rgb(212, 208, 200)`。

### `[Control Panel\Desktop]`
桌面设置，例如：

- `Wallpaper`：壁纸路径
- `TileWallpaper`：是否平铺
- `WallpaperStyle`：壁纸样式
- `Pattern`：桌面图案
- `ScreenSaveActive`：是否启用屏保

### `[Metrics]`
界面尺寸、字体、非客户区参数等二进制编码数据，例如：

- `IconMetrics`
- `NonclientMetrics`

这些值通常不是手工编辑的，而是由系统或主题编辑器生成。

### `[VisualStyles]`
视觉样式配置。对于经典主题通常不启用实际 visual style，更多是兼容字段。

---

## 2. `[Control Panel\Colors]` 各字段含义

### 按钮相关

| 配置项 | 作用 |
|---|---|
| `ButtonFace` | 按钮、对话框表面、工具栏常用背景色 |
| `ButtonText` | 按钮文字颜色 |
| `ButtonHilight` | 3D 边框高光色，通常用于左上边 |
| `ButtonLight` | 次高光色，通常用于高光内侧 |
| `ButtonShadow` | 阴影色，通常用于右下边 |
| `ButtonDkShadow` | 更深的阴影色，最外层暗边 |
| `ButtonAlternateFace` | 备用表面色，常见于抖动或特殊绘制场景 |

### 窗口与内容区

| 配置项 | 作用 |
|---|---|
| `Window` | 窗口内容区域背景色，例如输入框、列表框内部 |
| `WindowText` | 窗口内容区文字颜色 |
| `WindowFrame` | 窗口最外层边框颜色 |
| `ActiveBorder` | 活动窗口边框颜色 |
| `InactiveBorder` | 非活动窗口边框颜色 |
| `AppWorkspace` | MDI 应用工作区背景色 |

### 标题栏相关

| 配置项 | 作用 |
|---|---|
| `ActiveTitle` | 活动窗口标题栏主色 |
| `GradientActiveTitle` | 活动窗口标题栏渐变终点色 |
| `TitleText` | 活动窗口标题文字颜色 |
| `InactiveTitle` | 非活动窗口标题栏主色 |
| `GradientInactiveTitle` | 非活动窗口标题栏渐变终点色 |
| `InactiveTitleText` | 非活动窗口标题文字颜色 |

### 菜单相关

| 配置项 | 作用 |
|---|---|
| `Menu` | 菜单背景色 |
| `MenuBar` | 菜单栏背景色 |
| `MenuHilight` | 菜单高亮项背景色 |
| `MenuText` | 菜单文字颜色 |

### 选中与高亮

| 配置项 | 作用 |
|---|---|
| `Hilight` | 选中项背景色 |
| `HilightText` | 选中项文字颜色 |
| `HotTrackingColor` | 热跟踪颜色，例如链接 hover |

### 其他

| 配置项 | 作用 |
|---|---|
| `GrayText` | 禁用文本颜色 |
| `Scrollbar` | 滚动条背景色 |
| `Background` | 桌面背景色 |
| `InfoWindow` | 提示框背景色 |
| `InfoText` | 提示框文字颜色 |

---

## 3. 常见状态对应哪些配置

### 3.1 窗口处于 inactive 时

当窗口失去焦点，通常会切换到以下颜色：

- `InactiveTitle`
- `GradientInactiveTitle`
- `InactiveTitleText`
- `InactiveBorder`

对应关系：

- 标题栏背景：`InactiveTitle`
- 标题栏渐变：`GradientInactiveTitle`
- 标题文字：`InactiveTitleText`
- 外框边界：`InactiveBorder`

活动窗口则使用：

- `ActiveTitle`
- `GradientActiveTitle`
- `TitleText`
- `ActiveBorder`

### 3.2 按钮 disabled 时

禁用按钮最核心的变化通常是文字和视觉浮雕效果，而不是背景完全换色。

主要受影响的配置：

- `GrayText`
- `ButtonFace`
- `ButtonHilight`
- `ButtonShadow`

常见表现：

- 按钮背景仍然通常使用 `ButtonFace`
- 按钮文字改用 `GrayText`
- 某些经典绘制会再叠加一层 `ButtonHilight` 的偏移高光，形成“凹刻”禁用字效果
- 边框仍然基于 `ButtonHilight` / `ButtonShadow` / `ButtonDkShadow`

所以 disabled button 不是简单替换成一套新颜色，而是：

- 背景大多不变
- 文本改成 `GrayText`
- 立体边框仍沿用按钮 3D 配色
- 部分系统控件会用高光偏移制造禁用浮雕感

### 3.3 按钮 normal / pressed / raised 状态

#### Normal
使用：

- 背景：`ButtonFace`
- 文字：`ButtonText`
- 左上亮边：`ButtonHilight` / `ButtonLight`
- 右下暗边：`ButtonShadow` / `ButtonDkShadow`

#### Pressed
按下时通常会把立体边框方向反过来：

- 左上改为暗边
- 右下改为亮边

也就是视觉上从“凸起”变成“压下”。

受影响的仍然是：

- `ButtonHilight`
- `ButtonLight`
- `ButtonShadow`
- `ButtonDkShadow`

### 3.4 文本选中、列表选中

使用：

- 背景：`Hilight`
- 文字：`HilightText`

典型场景：

- 文本选区
- 列表项选中
- 树节点选中
- 菜单高亮项的部分实现

### 3.5 菜单 hover / 菜单高亮

主要受影响：

- `MenuHilight`
- `HilightText` 或 `MenuText`

在经典 Windows 风格里，菜单项被选中时常见表现是：

- 背景变为 `MenuHilight`
- 文字变为亮色，通常接近 `HilightText`

---

## 4. 快速映射表

| UI 状态 | 主要对应配置 |
|---|---|
| 活动窗口标题栏 | `ActiveTitle`, `GradientActiveTitle`, `TitleText`, `ActiveBorder` |
| 非活动窗口标题栏 | `InactiveTitle`, `GradientInactiveTitle`, `InactiveTitleText`, `InactiveBorder` |
| 普通按钮 | `ButtonFace`, `ButtonText`, `ButtonHilight`, `ButtonLight`, `ButtonShadow`, `ButtonDkShadow` |
| 禁用按钮 | `GrayText`, `ButtonFace`, `ButtonHilight`, `ButtonShadow` |
| 按下按钮 | `ButtonHilight`, `ButtonLight`, `ButtonShadow`, `ButtonDkShadow` |
| 选中内容 | `Hilight`, `HilightText` |
| 菜单高亮 | `MenuHilight`, `MenuText` / `HilightText` |
| 提示框 | `InfoWindow`, `InfoText` |
| 桌面背景 | `Background` |

---

## 5. 结合这份主题的实际值理解

从当前主题配置看：

- `ButtonFace=212 208 200`
  - 经典 Win98 银灰按钮底色
- `GrayText=128 128 128`
  - 禁用文本灰色
- `ActiveTitle=10 36 106`
  - 活动标题栏深蓝
- `GradientActiveTitle=166 202 240`
  - 活动标题栏浅蓝渐变
- `InactiveTitle=128 128 128`
  - 非活动标题栏灰色
- `InactiveTitleText=212 208 200`
  - 非活动标题文字浅灰
- `Hilight=10 36 106`
  - 选中背景深蓝
- `HilightText=255 255 255`
  - 选中文字白色

这正是典型的 Windows 98 / Windows Classic 风格配色。

---

## 6. 总结

如果你只关心状态映射，可以记住下面这组：

### 窗口 inactive
看这几个：

- `InactiveTitle`
- `GradientInactiveTitle`
- `InactiveTitleText`
- `InactiveBorder`

### 按钮 disabled
看这几个：

- `GrayText`
- `ButtonFace`
- `ButtonHilight`
- `ButtonShadow`
- `ButtonDkShadow`

### 选中态
看这几个：

- `Hilight`
- `HilightText`

### 菜单高亮
看这几个：

- `MenuHilight`
- `MenuText`
