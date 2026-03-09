# Claude Switch

Claude Code 模型切换工具 - 快速切换不同产商的 Claude 模型

## 功能特性

- 支持多个产商（Anthropic、DeepSeek、智谱AI、通义千问等）
- 便携包安装，全局命令 `cs`
- 配置文件存储在用户目录（`~/.claude-switch/config.json`）
- 交互式配置和命令行操作

## 安装

### 使用 npm 安装（推荐）

```bash
npm install -g claude-switch
```

### 从源码安装

```bash
# 克隆项目
git clone https://github.com/yourusername/claude-switch.git
cd claude-switch

# 安装依赖（目前无依赖）
npm install

# 全局链接
npm link
```

## 快速开始

### 1. 初始化配置

```bash
cs init
```

这会在 `~/.claude-switch/config.json` 创建配置文件。

### 2. 编辑配置文件添加 API Key

```bash
cs config
```

或者直接编辑配置文件：
```bash
# Windows
notepad %USERPROFILE%\.claude-switch\config.json

# macOS/Linux
nano ~/.claude-switch/config.json
```

### 3. 启动 Claude Code

```bash
cs
```

## 使用方法

### 基本命令

```bash
cs                 # 使用当前配置启动 Claude Code
cs help            # 显示帮助信息
cs init            # 初始化配置文件
cs list            # 列出所有产商和可用模型
cs status          # 显示当前配置状态
cs switch <产商>   # 切换到指定产商
cs key <产商> <Key>    # 设置产商的 API Key
cs models <产商>    # 设置产商的三个模型 ID
cs add <产商>      # 添加新产商(交互式)
cs config          # 打开配置文件编辑
```

### 快捷命令

```bash
cs s <产商>       # switch 的简写
cs k <产商> <Key> # key 的简写
cs ls             # list 的简写
```

### 使用示例

```bash
# 初始化配置
cs init

# 设置 DeepSeek 的 API Key
cs key deepseek sk-your-api-key-here

# 切换到智谱AI
cs s zhipu

# 查看 DeepSeek 的模型配置
cs models deepseek

# 启动 Claude Code
cs
```

## 配置文件结构

配置文件位于：`~/.claude-switch/config.json`

```json
{
  "current_vendor": "anthropic",
  "vendors": {
    "anthropic": {
      "name": "Anthropic官方",
      "base_url": "https://api.anthropic.com",
      "api_key": "your-api-key",
      "models": {
        "opus": "claude-opus-4-6",
        "sonnet": "claude-sonnet-4-6",
        "haiku": "claude-haiku-4-5-20251001"
      }
    }
  }
}
```

## 预设产商

- **Anthropic 官方**
  - Opus: claude-opus-4-6
  - Sonnet: claude-sonnet-4-6
  - Haiku: claude-haiku-4-5-20251001

- **DeepSeek**
  - Opus: deepseek-r1
  - Sonnet: deepseek-chat
  - Haiku: deepseek-coder

- **智谱AI**
  - Opus: glm-4.7
  - Sonnet: glm-4
  - Haiku: glm-3-turbo

- **通义千问**
  - Opus: qwen-max
  - Sonnet: qwen-plus
  - Haiku: qwen-turbo

## 工作原理

Claude Code 支持以下环境变量来配置自定义 API：

| 环境变量 | 说明 |
|---------|------|
| `ANTHROPIC_BASE_URL` | API 请求地址 |
| `ANTHROPIC_AUTH_TOKEN` | API 认证令牌 |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | Opus 模型 ID |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | Sonnet 模型 ID |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | Haiku 模型 ID |

本工具读取配置文件，自动设置这些环境变量，然后启动 Claude Code。

## 要求

- Node.js >= 14.0.0
- 已安装 Claude Code CLI

## 安全提示

- API Key 存储在本地配置文件中
- 请保护 `~/.claude-switch/config.json` 文件安全
- 不要将配置文件提交到公共代码仓库

## 许可证

MIT
