## Windows .theme 文件 `[Control Panel\Colors]` 详解

每个属性的值是 `R G B`（0–255）。下面按功能分组说明，并标注各 UI 状态的对应关系。

---

### 按钮（Button）相关

| .theme 属性 | CSS 变量 | 作用 |
|---|---|---|
| `ButtonFace` | `--button-face` | 按钮/工具栏/对话框的**默认背景色**（Win98 经典银灰色） |
| `ButtonText` | `--button-text` | 按钮上的**文字颜色** |
| `ButtonHilight` | `--button-hilight` | 按钮 3D 边框的**亮边**（左上高光，通常白色） |
| `ButtonLight` | `--button-light` | 按钮 3D 边框的**次亮边**（ButtonHilight 内侧一圈） |
| `ButtonShadow` | `--button-shadow` | 按钮 3D 边框的**暗边**（右下阴影） |
| `ButtonDkShadow` | `--button-dk-shadow` | 按钮 3D 边框的**最深阴影**（右下最外圈） |
| `ButtonAlternateFace` | `--button-alternate-face` | 按钮抖动花纹色（极少使用） |

**按钮 Disabled 状态**：Windows 使用 `GrayText`（`--gray-text`，`rgb(128,128,128)`）作为 disabled 文字颜色，配合 `ButtonFace` 背景。经典 Win98 还会在灰色文字偏移 1px 处绘制 `ButtonHilight`（白色）来产生"凹刻"效果。

**按钮 Pressed 状态**：3D 边框翻转 —— `ButtonShadow` 画在左上，`ButtonHilight` 画在右下，文字偏移 1px 向右下。

---

### 窗口标题栏（Title Bar）—— Active vs Inactive

这是你最关心的 inactive 状态核心：

| .theme 属性 | CSS 变量 | 状态 |
|---|---|---|
| `ActiveTitle` | `--active-title` | **活动窗口**标题栏背景（深蓝 `10,36,106`） |
| `GradientActiveTitle` | `--gradient-active-title` | 活动窗口标题栏**渐变结束色**（浅蓝 `166,202,240`） |
| `TitleText` | `--title-text` | **活动窗口**标题文字颜色（白色） |
| `InactiveTitle` | `--inactive-title` | **非活动窗口**标题栏背景（灰色 `128,128,128`） |
| `GradientInactiveTitle` | `--gradient-inactive-title` | 非活动窗口标题栏**渐变结束色**（银灰 `192,192,192`） |
| `InactiveTitleText` | `--inactive-title-text` | **非活动窗口**标题文字颜色（银灰 `212,208,200`） |

总结：**窗口 inactive 时**，标题栏从 `ActiveTitle` → `InactiveTitle`，渐变从 `GradientActiveTitle` → `GradientInactiveTitle`，文字从 `TitleText` → `InactiveTitleText`。

---

### 窗口边框与内容区

| .theme 属性 | CSS 变量 | 作用 |
|---|---|---|
| `ActiveBorder` | `--active-border` | 活动窗口边框色（通常同 ButtonFace） |
| `InactiveBorder` | `--inactive-border` | 非活动窗口边框色 |
| `Window` | `--window` | 窗口**内容区背景**（文本框、列表框内的白色区域） |
| `WindowText` | `--window-text` | 窗口内容区**文字颜色** |
| `WindowFrame` | `--window-frame` | 窗口最外层 1px 边框（黑色） |
| `AppWorkspace` | `--app-workspace` | MDI 应用的工作区背景（如 Word 文档区域外的灰色） |

---

### 选中/高亮

| .theme 属性 | CSS 变量 | 作用 |
|---|---|---|
| `Hilight` | `--hilight` | 选中项的**背景色**（深蓝，用于列表项、文本选中等） |
| `HilightText` | `--hilight-text` | 选中项的**文字色**（白色） |
| `HotTrackingColor` | `--hot-tracking-color` | 鼠标悬停时的**热跟踪颜色**（链接/图标标签 hover） |

---

### 菜单

| .theme 属性 | CSS 变量 | 作用 |
|---|---|---|
| `Menu` | `--menu` | 菜单**背景色** |
| `MenuBar` | `--menu-bar` | 菜单栏背景（XP+ 才区分，98 通常同 Menu） |
| `MenuHilight` | `--menu-hilight` | 菜单项**选中背景** |
| `MenuText` | `--menu-text` | 菜单**文字颜色** |

---

### 其他

| .theme 属性 | CSS 变量 | 作用 |
|---|---|---|
| `GrayText` | `--gray-text` | **禁用状态**的文字颜色（所有控件通用） |
| `Scrollbar` | `--scrollbar` | 滚动条**轨道背景** |
| `Background` | `--background` | **桌面背景色** |
| `InfoWindow` | `--info-window` | Tooltip **背景**（淡黄色） |
| `InfoText` | `--info-text` | Tooltip **文字** |

---

### 状态速查表

| UI 状态 | 受影响的属性 |
|---|---|
| **窗口 Inactive** | `InactiveTitle`, `GradientInactiveTitle`, `InactiveTitleText`, `InactiveBorder` |
| **窗口 Active** | `ActiveTitle`, `GradientActiveTitle`, `TitleText`, `ActiveBorder` |
| **按钮 Disabled** | 文字 → `GrayText`；背景不变仍是 `ButtonFace`；经典还用 `ButtonHilight` 做凹刻高光 |
| **按钮 Normal** | 背景 `ButtonFace`，文字 `ButtonText`，3D 边框 `ButtonHilight`/`ButtonLight`/`ButtonShadow`/`ButtonDkShadow` |
| **按钮 Pressed** | 3D 边框翻转（Shadow↔Hilight），文字偏移 |
| **文本选中** | 背景 `Hilight`，文字 `HilightText` |
| **菜单项 Hover** | 背景 `MenuHilight`，文字 `HilightText` |
| **控件 Disabled 文字** | 统一用 `GrayText` |
| **Tooltip** | 背景 `InfoWindow`，文字 `InfoText` |
