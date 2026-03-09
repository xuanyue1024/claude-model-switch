# Claude Model Switch

Claude Code 模型切换工具 - 快速切换不同产商的 Claude 模型

## 功能特性

- 支持多个产商（Anthropic、DeepSeek、智谱AI、通义千问等）
- NPM 包安装，全局命令 `cms`
- 配置文件存储在用户目录（`~/.claude-model-switch/config.json`）
- 交互式配置和命令行操作

## 安装

### 使用 npm 安装（推荐）

```bash
npm install -g @xuanyue1024/claude-model-switch
```

### 从源码安装

```bash
# 克隆项目
git clone https://github.com/xuanyue1024/claude-model-switch.git
cd claude-model-switch

# 安装依赖（目前无依赖）
npm install

# 全局链接
npm link
```

## 快速开始

### 1. 初始化配置

```bash
cms init
```

这会在 `~/.claude-model-switch/config.json` 创建配置文件。

### 2. 编辑配置文件添加 API Key

```bash
cms config
```

或者直接编辑配置文件：
```bash
# Windows
notepad %USERPROFILE%\.claude-model-switch\config.json

# macOS/Linux
nano ~/.claude-model-switch/config.json
```

### 3. 启动 Claude Code

```bash
cms
```

## 使用方法

### 基本命令

| 命令 | 说明 |
|------|------|
| `cms` | 使用当前配置启动 Claude Code |
| `cms help` | 显示帮助信息 |
| `cms init` | 初始化配置文件 |
| `cms list` | 列出所有产商和可用模型 |
| `cms status` | 显示当前配置状态 |
| `cms switch <产商>` | 切换到指定产商 |
| `cms key <产商> [Key]` | 设置或清除产商的 API Key |
| `cms url <产商> [URL]` | 设置或清除产商的 Base URL |
| `cms models <产商>` | 设置产商的三个模型 ID |
| `cms remove <产商>` | 删除指定产商配置 |
| `cms add <产商>` | 添加新产商(交互式) |
| `cms config` | 打开配置文件编辑 |

### 全局配置命令

| 命令 | 说明 |
|------|------|
| `cms key global [Key]` | 设置或清除全局 API Key |
| `cms url global [URL]` | 设置或清除全局 Base URL |

### 快捷命令

| 命令 | 等价于 |
|------|--------|
| `cms s <产商>` | `cms switch <产商>` |
| `cms k <产商> <Key>` | `cms key <产商> <Key>` |
| `cms ls` | `cms list` |

### 使用示例

```bash
# 初始化配置
cms init

# 设置全局 API Key（所有产商通用）
cms key global sk-your-global-api-key

# 设置全局 Base URL（所有产商通用）
cms url global https://api.global-url.com

# 设置 DeepSeek 的产商级 API Key（优先级高于全局）
cms key deepseek sk-deepseek-specific-key

# 清除 DeepSeek 的 API Key（将使用全局配置）
cms key deepseek

# 切换到智谱AI（将使用全局 API Key，因为未设置产商级 key）
cms s zhipu

# 切换到 DeepSeek（将使用产商级 API Key）
cms s deepseek

# 查看 DeepSeek 的模型配置
cms models deepseek

# 删除自定义产商（不能删除当前正在使用的产商）
cms remove my-custom-vendor

# 启动 Claude Code
cms
```

## 配置文件结构

配置文件位于：`~/.claude-model-switch/config.json`

```json
{
  "current_vendor": "anthropic",
  "global": {
    "base_url": "",
    "api_key": ""
  },
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

## 配置优先级

配置的优先级顺序：
1. **产商配置** - 优先使用产商级别的 API Key 和 Base URL
2. **全局配置** - 如果产商未配置，则使用全局配置
3. **未配置** - 如果都没有配置，启动时会提示需要配置

例如：
- 如果 `anthropic` 产商配置了 API Key，则使用产商级配置
- 如果 `zhipu` 产商未配置 API Key，但全局配置了，则使用全局配置
- 如果都没有配置，启动时会报错提示需要配置

## 预设产商

| 产商 | Base URL | Opus | Sonnet | Haiku |
|------|----------|------|--------|-------|
| Anthropic 官方 | https://api.anthropic.com | claude-opus-4-6 | claude-sonnet-4-6 | claude-haiku-4-5-20251001 |
| DeepSeek | https://api.deepseek.com | deepseek-r1 | deepseek-chat | deepseek-coder |
| 智谱AI | https://open.bigmodel.cn/api/paas | glm-4.7 | glm-4 | glm-3-turbo |
| 通义千问 | https://dashscope.aliyuncs.com/compatible-mode/v1 | qwen-max | qwen-plus | qwen-turbo |

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

## 添加新产商

使用交互式命令添加：

```bash
cms add
```

按提示输入：
1. 产商标识（如：openai）
2. 产商名称（如：OpenAI）
3. API Key
4. Base URL
5. 三个模型 ID (Opus/Sonnet/Haiku)

## 要求

- Node.js >= 14.0.0
- 已安装 Claude Code CLI

## 安全提示

- API Key 存储在本地配置文件中
- 请保护 `~/.claude-model-switch/config.json` 文件安全
- 不要将配置文件提交到公共代码仓库

## 故障排除

### 问题：找不到 `cms` 命令

**解决**：
- npm 安装：确认已使用 `npm install -g @xuanyue1024/claude-model-switch` 全局安装
- 源码安装：确认已执行 `npm link`

### 问题：找不到 `claude` 命令

**解决**：安装 Claude Code CLI 并将其添加到 PATH 环境变量

### 问题：模型调用失败

**解决**：检查以下几点：
1. API Key 是否正确（使用 `cms status` 查看）
2. Base URL 是否正确
3. 模型 ID 是否与产商提供的模型对应
4. 产商是否支持 Anthropic API 兼容格式

## 许可证

MIT
