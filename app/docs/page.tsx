'use client'

import { useState, useRef } from 'react'
import { ChevronDown, ChevronRight, BookOpen, Layers, Search, X, Home } from 'lucide-react'

interface DocumentItem {
  id: string
  title: string
  sections: {
    id: string
    title: string
    content: string
  }[]
}

function DocsPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set())
  const contentRef = useRef<HTMLDivElement>(null)

  const toggleDoc = (docId: string) => {
    setExpandedDocs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(docId)) {
        newSet.delete(docId)
      } else {
        newSet.add(docId)
      }
      return newSet
    })
  }

  const selectSection = (docId: string, sectionId: string) => {
    setActiveSection(`${docId}-${sectionId}`)
    setTimeout(() => {
      const element = document.getElementById(`${docId}-${sectionId}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  const documents: DocumentItem[] = [
    {
      id: 'paperstation',
      title: 'PaperStation 浏览器',
      sections: [
        {
          id: 'quickstart',
          title: '快速入门',
          content: `
## 下载与安装

访问 [PaperStation 官方网站](https://ruanmingze.github.io/PaperStation-Introduction-page/) 下载最新版本的浏览器。

### 系统要求
- Windows 10/11
- macOS 10.15+
- Linux (Ubuntu 20.04+, Debian 10+)

### 安装步骤
1. 下载对应平台的安装包
2. 运行安装程序，按照提示完成安装
3. 启动浏览器，开始使用

## 界面介绍

PaperStation 浏览器的界面由以下部分组成：

- **标签栏**：管理多个标签页
- **地址栏**：输入网址和搜索
- **工具栏**：常用功能按钮
- **知识面板**：显示知识捕获和总结
- **状态栏**：显示系统状态信息

## 基础操作

### 打开新标签页
- 点击标签栏右侧的 "+" 按钮
- 使用快捷键 Ctrl+T (Windows/Linux) 或 Command+T (macOS)

### 关闭标签页
- 点击标签页右侧的 "×" 按钮
- 使用快捷键 Ctrl+W (Windows/Linux) 或 Command+W (macOS)

### 导航操作
- **前进**：点击工具栏的前进按钮或使用 Alt+Right
- **后退**：点击工具栏的后退按钮或使用 Alt+Left
- **刷新**：点击工具栏的刷新按钮或使用 F5
          `
        },
        {
          id: 'advanced',
          title: '探索高级玩法',
          content: `
## 知识捕获功能

### 自动知识捕获
1. 浏览网页时，PaperStation 会自动提取关键信息
2. 点击工具栏的知识图标，查看捕获的知识点
3. 知识点会自动分类并建立逻辑联系

### 手动捕获
- 选中网页中的文本，右键选择 "捕获为知识点"
- 使用快捷键 Ctrl+Shift+C 快速捕获

## 智能总结

### 生成页面摘要
1. 打开任意网页
2. 点击工具栏的总结按钮
3. 系统会自动生成页面核心内容摘要，包括：
   - 5 个核心要点
   - 3 个关键术语解释
   - 2 个实际应用案例

### 自定义总结
- 在总结面板中，点击 "自定义" 按钮
- 选择需要包含的内容类型和数量

## 结构化导出

### 导出为 PDF
1. 点击工具栏的导出按钮
2. 选择 "导出为 PDF"
3. 设置导出选项，点击 "导出"

### 导出为 HTML
1. 点击工具栏的导出按钮
2. 选择 "导出为 HTML"
3. 设置导出选项，点击 "导出"

### 自定义模板
- 点击导出设置中的 "模板" 选项
- 选择或上传自定义模板

## ChickRubGo 搜索
### 使用方法
1. 在地址栏中输入搜索关键词
2. 按下回车键，默认使用 ChickRubGo 搜索
3. 搜索结果页面会显示相关内容

### 搜索技巧
- 使用引号进行精确搜索
- 使用减号排除特定内容
- 使用 site: 限定搜索范围

## 快捷键
| 功能 | Windows/Linux | macOS |
|------|--------------|-------|
| 新建标签页 | Ctrl+T | Command+T |
| 关闭标签页 | Ctrl+W | Command+W |
| 捕获知识点 | Ctrl+Shift+C | Command+Shift+C |
| 生成总结 | Ctrl+Shift+S | Command+Shift+S |
| 导出内容 | Ctrl+Shift+E | Command+Shift+E |
| 打开设置 | Ctrl+, | Command+, |
          `
        }
      ]
    },
    {
      id: 'screensaver',
      title: 'RuanmScreenSaver 屏保程序',
      sections: [
        {
          id: 'quickstart',
          title: '快速入门',
          content: `
## 版本信息

当前版本：1.0.2

## 更新日志

### v1.0.2
1. 优化了设置界面底部按钮的排版和CSS样式，使其更美观
2. 增加了检查更新按钮，自动从更新服务器检查新版本，并调用Assets\\\\UpdateHelper.exe进行更新
3. 增加了可视化编辑按钮，可直接在设置界面中编辑和预览屏保界面
4. 增加了设置开机自启动按钮，可设置程序开机自动启动

## 简介

这是一个基于 Electron 开发的屏保应用，具有以下特性：
- 定时自动屏保
- 动态壁纸切换
- 支持多种类型的壁纸（4K、风景、动漫等）
- 美观的屏保界面

## 主要功能

1. **定时屏保**：可设置几分钟后自动屏保
2. **动态壁纸**：使用 https://api.mmp.cc/api/ 获取高清壁纸
3. **壁纸切换**：可设置每隔几分钟切换一次屏保壁纸
4. **多种壁纸类型**：支持4K、风景、妹子、游戏、动漫等多种壁纸类型，还支持随机壁纸
5. **自定义显示**：可调节时间日期的字体大小、位置和主题颜色
6. **全屏覆盖**：屏保界面完全覆盖屏幕，包括任务栏
7. **交互功能**：双击壁纸可隐藏/显示时间日期和控制按钮

## 安装与运行

访问官方网站下载对应平台的安装包，运行安装程序，按照提示完成安装。

## 使用说明

### 设置界面
- **自动屏保时间**：设置几分钟后自动屏保（默认5分钟）
- **壁纸切换时间**：设置每隔几分钟切换一次壁纸（默认10分钟）
- **壁纸类型**：选择喜欢的壁纸类型（默认随机壁纸）
- **时间日期显示设置**：可调节时间日期的字体大小、位置和主题颜色
- **显示产品广告**：可选择是否在屏保右下角显示产品广告（默认不显示）

### 屏保界面
- 显示当前时间与日期
- 自动加载壁纸并在设定时间后切换
- 右上角有三个按钮：
  - 下载壁纸：点击在浏览器中打开并下载当前壁纸
  - 换一换：点击更换新壁纸
  - 退出屏保：点击退出屏保界面
- 双击壁纸区域可隐藏/显示时间日期和控制按钮
- 主题颜色会同时影响时间日期文字和控制按钮的SVG图标颜色
- 可选广告显示在右下角（需要在设置中开启），包含立即下载按钮
          `
        },
        {
          id: 'advanced',
          title: '探索高级玩法',
          content: `
## 新功能探索

### 检查更新
1. 在设置界面底部找到 "检查更新" 按钮
2. 点击后，程序会自动从更新服务器检查新版本
3. 如果有新版本，会调用 Assets\\\\UpdateHelper.exe 进行更新
4. 更新过程会自动完成，无需手动操作

### 可视化编辑
1. 在设置界面底部找到 "可视化编辑" 按钮
2. 点击后进入可视化编辑模式
3. 在编辑模式中，你可以：
   - 直接拖拽调整时间日期的位置
   - 实时预览屏保界面效果
   - 调整各种视觉参数
   - 保存编辑结果

### 开机自启动
1. 在设置界面底部找到 "设置开机自启动" 按钮
2. 点击后，程序会自动添加到系统启动项
3. 重启电脑后，程序会自动运行
4. 如需取消开机自启动，再次点击该按钮即可

## 高级设置

### 壁纸设置技巧
1. **壁纸类型选择**：
   - 4k：超高清壁纸，适合大屏幕
   - landscape：风景壁纸，自然清新
   - belle：妹子壁纸，时尚靓丽
   - game：游戏壁纸，动感十足
   - cartoon：动漫壁纸，个性鲜明
   - random：随机壁纸，惊喜不断

2. **壁纸切换动画**：
   - 淡入淡出：经典平滑效果
   - 滑动切换：动感流畅
   - 缩放效果：视觉冲击力强
   - 旋转切换：创意十足

### 时间日期定制
1. **字体大小调整**：根据屏幕尺寸选择合适的字体大小
2. **显示位置**：可自由调整在屏幕上的位置
3. **主题颜色**：选择与壁纸风格匹配的颜色

## 性能优化

### 内存管理
1. 定期清理壁纸缓存，减少内存占用
2. 对于配置较低的电脑，建议选择较低分辨率的壁纸
3. 关闭不必要的视觉效果

### 网络优化
1. 壁纸API接口：https://api.mmp.cc/api/pcwallpaper
2. 如需提高壁纸加载速度，可选择网络环境较好时更新壁纸
3. 可在设置中调整壁纸的类型

## 故障排除

### 常见问题

1. **壁纸加载失败**：
   - 检查网络连接
   - 确认API接口是否可访问
   - 尝试更换壁纸类型

2. **屏保不启动**：
   - 检查屏保时间设置
   - 确认程序是否在运行
   - 检查系统电源设置

3. **更新失败**：
   - 检查网络连接
   - 确认有足够的磁盘空间
   - 尝试手动下载更新包

### 高级故障排除

1. **查看日志**：程序运行日志位于应用目录的 logs 文件夹
2. **API测试**：使用 RuanmScreensaver api-test 命令测试API连接
3. **重置设置**：删除应用目录下的 config.json 文件重置所有设置

## 最佳实践

1. **定期更新**：保持程序为最新版本，获取新功能和性能优化
2. **合理设置**：根据电脑配置和个人喜好调整设置
3. **备份配置**：定期备份 config.json 文件，防止设置丢失
4. **反馈问题**：如遇到问题，可通过官方渠道反馈

## 开发扩展

### 自定义壁纸源
如有开发能力，可通过修改配置文件添加自定义壁纸源：

1. 编辑 config.json 文件
2. 在 wallpaperSources 字段中添加自定义源
3. 重启程序后生效

### 主题定制
可通过修改CSS文件定制屏保主题：
1. 找到应用目录下的 styles 文件夹
2. 修改或添加CSS文件
3. 在设置中选择自定义主题
          `
        }
      ]
    },
    {
      id: 'toolbox',
      title: '阮铭泽工具箱',
      sections: [
        {
          id: 'quickstart',
          title: '快速入门',
          content: `
## 下载与安装

访问 [阮铭泽工具箱](https://ruanmingze.github.io/Ruanm-Official-Website/toolbox.html) 下载最新版本。

### 系统要求
- Windows 7+
- macOS 10.13+
- Linux (Ubuntu 18.04+)

### 安装步骤
1. 下载对应平台的安装包
2. 运行安装程序，按照提示完成安装
3. 启动工具箱应用

## 界面介绍

工具箱主界面包含以下功能模块：

- **天气查询**：显示实时天气信息
- **计算器**：科学计算功能
- **编程工具**：集成多种编程环境
- **系统知识**：系统维护和故障排除指南
- **实用网站**：精选常用网站

## 基础操作

### 切换功能模块
- 点击左侧导航栏的对应图标
- 使用快捷键 Ctrl+数字键快速切换

### 搜索功能
- 在顶部搜索框中输入关键词
- 按下回车键进行搜索
- 搜索结果会显示在右侧面板
          `
        },
        {
          id: 'advanced',
          title: '探索高级玩法',
          content: `
## 天气查询

### 实时天气
1. 打开天气查询模块
2. 系统会自动检测当前位置并显示天气
3. 可手动输入城市名称查询其他地区天气

### 天气预报
- 在天气模块中，点击 "预报" 标签
- 查看未来 7 天的天气预报

## 科学计算器

### 基本计算
- 使用界面按钮或键盘输入表达式
- 按下回车键或点击 "=" 按钮计算结果

### 高级功能
- 点击 "函数" 标签，使用三角函数、对数等高级函数
- 支持变量存储和调用

## 编程工具

### Scratch 编辑器
1. 打开编程工具模块
2. 选择 "Scratch 编辑器"
3. 开始可视化编程

### Python 环境
- 选择 "Python 环境"
- 编写和运行 Python 代码
- 支持常用库的导入

### 多语言编程
- 支持 C、C++、Java、JavaScript 等多种语言
- 提供语法高亮和基本代码提示

## 系统知识

### 重装系统方法
1. 打开系统知识模块
2. 选择 "重装系统"
3. 按照详细步骤指南操作

### 蓝屏解决方案
- 选择 "蓝屏代码"
- 输入蓝屏错误代码，查看解决方案

### 常用命令
- 选择 "命令查询"
- 搜索和查看 Windows/Linux 常用命令

## 实用网站

### 精选网站
- 浏览精心挑选的常用网站和学习资源
- 点击网站图标直接访问

### 自定义网站
- 点击 "添加" 按钮
- 输入网站名称和 URL，添加到收藏

## 快捷键

| 功能 | Windows/Linux | macOS |
|------|---------------|-------|
| 天气查询 | Ctrl+1 | Command+1 |
| 计算器 | Ctrl+2 | Command+2 |
| 编程工具 | Ctrl+3 | Command+3 |
| 系统知识 | Ctrl+4 | Command+4 |
| 实用网站 | Ctrl+5 | Command+5 |
| 搜索 | Ctrl+F | Command+F |
| 退出 | Ctrl+Q | Command+Q |
          `
        }
      ]
    },
    {
      id: 'xiaor',
      title: '小R AI助手',
      sections: [
        {
          id: 'quickstart',
          title: '快速入门',
          content: `
## 下载与安装

访问 [小R AI助手](https://ruanmingze.github.io/Ruanm-Official-Website/xiaor.html) 下载最新版本。

### 系统要求
- Windows 10/11

### 安装步骤
1. 下载安装包
2. 运行安装程序，按照提示完成安装
3. 启动小R AI助手

## 首次使用

### 基本设置
1. 首次启动时，会显示设置向导
2. 选择默认AI模型
3. 设置语音选项
4. 选择主题偏好

### 基本对话
1. 在输入框中输入问题
2. 点击 "发送" 按钮或按回车键
3. AI助手会生成回复

## 界面介绍

- **输入框**：输入问题或指令
- **发送按钮**：发送消息
- **对话区域**：显示对话历史
- **技能按钮**：快速访问各种技能
- **设置按钮**：打开设置面板
          `
        },
        {
          id: 'advanced',
          title: '探索高级玩法',
          content: `
## 多AI模型

### 切换模型
1. 点击设置按钮
2. 选择 "AI模型"
3. 从列表中选择不同的AI模型

### 支持的模型
- DeepseekV3.1
- 豆包
- 腾讯元宝
- Qwen3
- 更多模型持续更新中

## 技能模式

### 图片生成
1. 点击 "图片生成" 技能按钮
2. 输入图片描述
3. 选择风格和尺寸
4. 点击 "生成" 按钮

### OCR识别
1. 点击 "OCR识别" 技能按钮
2. 上传图片或截图
3. 系统会自动识别图片中的文字
4. 可复制识别结果

### 翻译助手
1. 点击 "翻译" 技能按钮
2. 输入需要翻译的文本
3. 选择源语言和目标语言
4. 点击 "翻译" 按钮

## 语音功能

### 语音输入
1. 点击输入框右侧的麦克风按钮
2. 开始说话
3. 系统会自动识别并转换为文本

### 语音回复
1. 在设置中，启用 "语音回复"
2. AI助手的回复会以语音形式播放
3. 可调整语音速度和音量

## 对话管理

### 对话历史
- 点击左侧对话列表，查看历史对话
- 点击对话标题可重命名
- 右键点击可删除对话

### 新对话
- 点击 "新建对话" 按钮
- 开始新的对话

## 主题切换

### 深色模式
1. 点击设置按钮
2. 选择 "外观"
3. 切换到 "深色主题"

### 自定义主题
- 在外观设置中，可调整：
  - 主色调
  - 字体大小
  - 界面布局

## 数据管理

### 清除数据
1. 点击设置按钮
2. 选择 "数据管理"
3. 点击 "清除所有数据"
4. 确认操作

### 导出对话
- 在对话管理中，选择需要导出的对话
- 点击 "导出" 按钮
- 选择导出格式（JSON/CSV）

## 快捷键

| 功能 | 快捷键 |
|------|--------|
| 发送消息 | Enter |
| 语音输入 | Ctrl+M |
| 新建对话 | Ctrl+N |
| 清除输入 | Ctrl+L |
| 打开设置 | Ctrl+, |
| 退出应用 | Ctrl+Q |
          `
        }
      ]
    },
    {
      id: 'chickrubgo',
      title: 'ChickRubGo 搜索引擎',
      sections: [
        {
          id: 'quickstart',
          title: '快速入门',
          content: `
## 访问方式

直接访问 [ChickRubGo 搜索引擎](https://ruanmingze.github.io/Ruanm-Official-Website/chickrubgo.html)。

## 基本搜索

### 使用方法
1. 在搜索框中输入关键词
2. 按下回车键或点击 "搜索" 按钮
3. 查看搜索结果

### 搜索建议
- 输入时，系统会自动提供搜索建议
- 点击建议可快速搜索

## 界面介绍

- **搜索框**：输入搜索关键词
- **搜索按钮**：执行搜索
- **设置按钮**：打开设置面板
- **壁纸刷新**：更换背景壁纸
- **小组件图标**：打开各种小组件
          `
        },
        {
          id: 'advanced',
          title: '探索高级玩法',
          content: `
## 高级搜索

### 搜索语法
- **精确匹配**：使用双引号 "关键词"
- **排除词语**：使用减号 -排除词
- **站点搜索**：使用 site:域名
- **文件类型**：使用 filetype:类型

### 搜索引擎切换
1. 点击设置按钮
2. 选择 "搜索引擎"
3. 从列表中选择：
   - ChickRubGo（默认）
   - 必应
   - 百度
   - 自定义

## 壁纸功能

### 更换壁纸
- 点击右上角的刷新按钮
- 壁纸会自动更换为高质量图片

### 壁纸分类
- 在设置中，选择 "壁纸"
- 可选择壁纸类型：
  - 4K
  - 风景
  - 动漫
  - 抽象
  - 更多分类

## 小组件系统

### 打开小组件
- 点击左侧或底部的小组件图标
- 小组件会以弹窗形式显示

### 可用小组件
- **记事本**：记录笔记，支持Markdown
- **天气**：显示实时天气信息
- **木鱼**：静心工具
- **闹钟**：设置提醒
- **更多小组件持续更新中**

### 编辑模式
1. 点击 "编辑" 按钮
2. 可添加/删除/排序小组件
3. 调整小组件大小和位置

## 模式切换

### 简洁模式
1. 点击设置按钮
2. 选择 "界面"
3. 切换到 "简洁模式"
4. 界面会简化为基本搜索功能

### 丰富模式
- 在界面设置中，切换到 "丰富模式"
- 显示完整的小组件和功能

## 深色模式

### 手动切换
1. 点击设置按钮
2. 选择 "外观"
3. 切换到 "深色模式"

### 自动切换
- 在外观设置中，启用 "跟随系统"
- 系统会根据系统主题自动切换

## 背景音乐

### 启用音乐
1. 点击设置按钮
2. 选择 "音乐"
3. 启用 "背景音乐"

### 自定义音乐
- 点击 "上传" 按钮
- 选择本地音频文件或MP4视频文件
- 系统会自动提取音频

## 响应式设计

### 移动设备
- ChickRubGo 会自动适配移动设备屏幕
- 提供优化的触摸界面

### 平板设备
- 在平板上提供介于桌面和移动之间的界面
- 支持横屏和竖屏切换
          `
        }
      ]
    }
  ]

  const filteredDocuments = searchQuery
    ? documents.filter(doc => 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.sections.some(section => 
          section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          section.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : documents

  return (
    <div className="min-h-screen bg-background text-primary">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">产品文档中心</h1>
          </div>
          <a
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>返回主页</span>
          </a>
        </div>

        <div className="flex gap-8">
          <div className="w-72 flex-shrink-0">
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索文档..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground hover:text-primary"
                  >
                    <X />
                  </button>
                )}
              </div>
            </div>

            <div className="border border-border rounded-lg bg-card">
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold">文档目录</h2>
                </div>
              </div>
              <div className="p-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {filteredDocuments.map((doc) => (
                  <div key={doc.id} className="mb-2">
                    <button
                      onClick={() => toggleDoc(doc.id)}
                      className="w-full flex items-center justify-between px-3 py-2 text-left rounded-md hover:bg-muted transition-colors"
                    >
                      <span className="font-medium">{doc.title}</span>
                      {expandedDocs.has(doc.id) ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    {expandedDocs.has(doc.id) && (
                      <div className="ml-6 mt-1 space-y-1">
                        {doc.sections.map((section) => (
                          <button
                            key={section.id}
                            onClick={() => selectSection(doc.id, section.id)}
                            className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${activeSection === `${doc.id}-${section.id}` ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                          >
                            {section.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="border border-border rounded-lg bg-card min-h-[calc(100vh-300px)]">
              {filteredDocuments.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">没有找到相关文档</p>
                </div>
              ) : (
                <div ref={contentRef} className="p-8 overflow-y-auto">
                  {filteredDocuments.map((doc) => (
                    <div key={doc.id} className="mb-12">
                      <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-border">{doc.title}</h2>
                      {doc.sections.map((section) => (
                        <div key={section.id} id={`${doc.id}-${section.id}`} className="mb-8 scroll-mt-20">
                          <h3 className="text-xl font-semibold mb-4">{section.title}</h3>
                          <div className="prose prose-lg max-w-none text-foreground">
                            {(() => {
                              // 定义类型
                              interface ListItem {
                                type: 'paragraph' | 'ordered-list' | 'table'
                                content?: string
                                items?: string[]
                                tableLines?: string[]
                              }
                              
                              // 先提取表格块（连续的以 | 开头的行）
                              const lines = section.content.split('\n')
                              const processedContent: ListItem[] = []
                              let currentTable: string[] = []
                              let nonTableLines: string[] = []
                              
                              lines.forEach((line: string) => {
                                const trimmedLine = line.trim()
                                if (trimmedLine.startsWith('|')) {
                                  // 这是表格行，添加到当前表格
                                  currentTable.push(line)
                                } else {
                                  // 这不是表格行
                                  if (currentTable.length > 0) {
                                    // 保存之前的表格
                                    processedContent.push({ type: 'table', tableLines: currentTable })
                                    currentTable = []
                                  }
                                  if (trimmedLine) {
                                    nonTableLines.push(line)
                                  }
                                }
                              })
                              
                              // 处理最后一个表格
                              if (currentTable.length > 0) {
                                processedContent.push({ type: 'table', tableLines: currentTable })
                              }
                              
                              // 处理非表格内容，合并连续的列表项
                              let currentList: string[] = []
                              
                              nonTableLines.forEach((paragraph: string) => {
                                if (paragraph.match(/^\d+\. /)) {
                                  // 这是一个列表项，添加到当前列表
                                  currentList.push(paragraph)
                                } else {
                                  // 这不是列表项，先处理之前的列表
                                  if (currentList.length > 0) {
                                    processedContent.push({ type: 'ordered-list', items: currentList })
                                    currentList = []
                                  }
                                  // 添加当前段落
                                  processedContent.push({ type: 'paragraph', content: paragraph })
                                }
                              })
                              
                              // 处理最后一个列表
                              if (currentList.length > 0) {
                                processedContent.push({ type: 'ordered-list', items: currentList })
                              }
                              
                              return processedContent.map((item: ListItem, idx: number) => {
                                // 处理表格
                                if (item.type === 'table' && item.tableLines) {
                                  const tableLines = item.tableLines.filter((line: string) => line.trim() !== '')
                                  if (tableLines.length < 3) return null // 至少需要表头、分隔线和一行数据
                                  
                                  const headerLine = tableLines[0]
                                  const bodyLines = tableLines.slice(2) // 从第三行开始是数据行
                                  
                                  return (
                                    <div key={idx} className="overflow-x-auto mb-4">
                                      <table className="min-w-full border-collapse">
                                        <thead>
                                          <tr>
                                            {headerLine.split('|').filter((cell: string) => cell.trim() !== '').map((cell: string, cellIdx: number) => (
                                              <th key={cellIdx} className="border border-border px-4 py-2 text-left font-semibold">{cell.trim()}</th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {bodyLines.map((line: string, lineIdx: number) => (
                                            <tr key={lineIdx}>
                                              {line.split('|').filter((cell: string) => cell.trim() !== '').map((cell: string, cellIdx: number) => (
                                                <td key={cellIdx} className="border border-border px-4 py-2">{cell.trim()}</td>
                                              ))}
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )
                                }
                                
                                if (item.type === 'paragraph' && item.content) {
                                  const paragraph = item.content
                                  
                                  // 处理标题
                                  if (paragraph.startsWith('#')) {
                                    const level = paragraph.match(/^#+/)?.[0].length || 1
                                    const text = paragraph.replace(/^#+/, '').trim()
                                    
                                    if (level === 1) {
                                      return <h2 key={idx} className="text-xl font-bold mb-4">{text}</h2>
                                    } else if (level === 2) {
                                      return <h3 key={idx} className="text-lg font-semibold mb-3">{text}</h3>
                                    } else if (level === 3) {
                                      return <h4 key={idx} className="text-md font-medium mb-2">{text}</h4>
                                    } else {
                                      return <h5 key={idx} className="text-sm font-medium mb-1">{text}</h5>
                                    }
                                  }
                                  
                                  // 处理代码块
                                  if (paragraph.startsWith('```') || paragraph.endsWith('```')) {
                                    const codeContent = paragraph.replace(/^```|```$/g, '').trim()
                                    return (
                                      <pre key={idx} className="bg-muted p-4 rounded-md overflow-x-auto mb-4">
                                        <code className="text-sm">{codeContent}</code>
                                      </pre>
                                    )
                                  }
                                  
                                  // 处理安装步骤标题
                                  if (paragraph.includes('安装步骤') && !paragraph.includes('1. ')) {
                                    return (
                                      <div key={idx} className="mb-4">
                                        <p className="mb-2 font-medium">安装步骤</p>
                                      </div>
                                    )
                                  }
                                  
                                  // 处理引用块
                                  if (paragraph.split('\n').every((line: string) => line.trim().startsWith('> '))) {
                                    const lines = paragraph.split('\n').filter((line: string) => line.trim())
                                    return (
                                      <blockquote key={idx} className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-4">
                                        {lines.map((line: string, lineIdx: number) => (
                                          <p key={lineIdx} className="mb-1">{line.replace(/^> /, '').trim()}</p>
                                        ))}
                                      </blockquote>
                                    )
                                  }
                                  
                                  // 处理一般有序列表（1. 2. 3. 格式）
                                  if (paragraph.includes('1. ') || paragraph.includes('2. ') || paragraph.includes('3. ')) {
                                    // 提取前缀和列表内容
                                    let prefix = ''
                                    let listContent = paragraph
                                    
                                    // 尝试分离前缀
                                    const firstNumberIndex = paragraph.search(/\d+\. /)
                                    if (firstNumberIndex > 0) {
                                      prefix = paragraph.substring(0, firstNumberIndex).trim()
                                      listContent = paragraph.substring(firstNumberIndex)
                                    }
                                    
                                    // 分割列表项
                                    const listItems: string[] = []
                                    const regex = /(\d+\. )/g
                                    const parts = listContent.split(regex)
                                    
                                    for (let i = 1; i < parts.length; i += 2) {
                                      if (parts[i+1]) {
                                        listItems.push(parts[i+1].trim())
                                      }
                                    }
                                    
                                    if (listItems.length > 0) {
                                      return (
                                        <div key={idx} className="mb-4">
                                          {prefix && <p className="mb-2">{prefix}</p>}
                                          <ol className="list-decimal pl-6 space-y-1">
                                            {listItems.map((item: string, itemIdx: number) => (
                                              <li key={itemIdx}>
                                                {item.split(/(\[.+?\]\(.+?\)|\*\*.+?\*\*)/g).map((part: string | null, partIdx: number) => {
                                                  if (!part) return null
                                                  
                                                  // 处理链接
                                                  const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/)
                                                  if (linkMatch) {
                                                    return <a key={partIdx} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{linkMatch[1]}</a>
                                                  }
                                                  
                                                  // 处理加粗
                                                  const boldMatch = part.match(/\*\*(.+?)\*\*/)
                                                  if (boldMatch) {
                                                    return <strong key={partIdx}>{boldMatch[1]}</strong>
                                                  }
                                                  
                                                  return part
                                                })}
                                              </li>
                                            ))}
                                          </ol>
                                        </div>
                                      )
                                    }
                                  }
                                  
                                  // 处理无序列表（- 格式）
                                  if (paragraph.includes('- ')) {
                                    // 提取前缀和列表内容
                                    let prefix = ''
                                    let listContent = paragraph
                                    
                                    // 尝试分离前缀
                                    const prefixMatch = paragraph.match(/^(.*?)(- .*)$/)
                                    if (prefixMatch) {
                                      prefix = prefixMatch[1].trim()
                                      listContent = prefixMatch[2]
                                    }
                                    
                                    // 分割列表项
                                    const listItems = listContent.split(/(?=- )/).filter((item: string) => item.trim())
                                    
                                    if (listItems.length > 0) {
                                      return (
                                        <div key={idx} className="mb-4">
                                          {prefix && <p className="mb-2">{prefix}</p>}
                                          <ul className="list-disc pl-6 space-y-1">
                                            {listItems.map((item: string, itemIdx: number) => {
                                              const content = item.replace(/^- /, '').trim()
                                              return (
                                                <li key={itemIdx}>
                                                  {content.split(/(\[.+?\]\(.+?\)|\*\*.+?\*\*)/g).map((part: string | null, partIdx: number) => {
                                                    if (!part) return null
                                                    
                                                    // 处理链接
                                                    const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/)
                                                    if (linkMatch) {
                                                      return <a key={partIdx} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{linkMatch[1]}</a>
                                                    }
                                                    
                                                    // 处理加粗
                                                    const boldMatch = part.match(/\*\*(.+?)\*\*/)
                                                    if (boldMatch) {
                                                      return <strong key={partIdx}>{boldMatch[1]}</strong>
                                                    }
                                                    
                                                    return part
                                                  })}
                                                </li>
                                              )
                                            })}
                                          </ul>
                                        </div>
                                      )
                                    }
                                  }
                                  
                                  // 处理普通段落
                                  return (
                                    <p key={idx} className="mb-4">
                                      {paragraph.split(/(\[.+?\]\(.+?\)|\*\*.+?\*\*)/g).map((part: string | null, partIdx: number) => {
                                        if (!part) return null
                                        
                                        // 处理链接
                                        const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/)
                                        if (linkMatch) {
                                          return <a key={partIdx} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{linkMatch[1]}</a>
                                        }
                                        
                                        // 处理加粗
                                        const boldMatch = part.match(/\*\*(.+?)\*\*/)
                                        if (boldMatch) {
                                          return <strong key={partIdx}>{boldMatch[1]}</strong>
                                        }
                                        
                                        return part
                                      })}
                                    </p>
                                  )
                                } else if (item.type === 'ordered-list' && item.items) {
                                  // 处理有序列表
                                  return (
                                    <ol key={idx} className="list-decimal ml-6 mb-4 space-y-3">
                                      {item.items.map((listItem: string, itemIdx: number) => {
                                        const content = listItem.replace(/^\d+\. /, '').trim()
                                        return (
                                          <li key={itemIdx}>
                                            {content.split(/(\[.+?\]\(.+?\)|\*\*.+?\*\*)/g).map((part: string | null, partIdx: number) => {
                                              if (!part) return null
                                              
                                              // 处理链接
                                              const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/)
                                              if (linkMatch) {
                                                return <a key={partIdx} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{linkMatch[1]}</a>
                                              }
                                              
                                              // 处理加粗
                                              const boldMatch = part.match(/\*\*(.+?)\*\*/)
                                              if (boldMatch) {
                                                return <strong key={partIdx}>{boldMatch[1]}</strong>
                                              }
                                              
                                              return part
                                            })}
                                          </li>
                                        )
                                      })}
                                    </ol>
                                  )
                                }
                                return null
                              })
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocsPage
