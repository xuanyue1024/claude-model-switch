#!/usr/bin/env node

/**
 * Claude Code 模型切换工具主入口
 * 根据配置文件设置环境变量并启动 Claude Code
 */

const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

// ============================================
// 配置相关
// ============================================

const CONFIG_DIR = path.join(os.homedir(), '.claude-switch');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

/**
 * 读取配置文件
 */
function getConfig() {
    if (!fs.existsSync(CONFIG_PATH)) {
        console.log(`\x1b[31m错误: 配置文件不存在: ${CONFIG_PATH}\x1b[0m`);
        console.log(`\x1b[33m请运行 'cs init' 初始化配置\x1b[0m\n`);
        process.exit(1);
    }

    try {
        const content = fs.readFileSync(CONFIG_PATH, 'utf-8');
        return JSON.parse(content);
    } catch (err) {
        console.log(`\x1b[31m错误: 无法读取配置文件\x1b[0m`);
        console.log(err.message);
        process.exit(1);
    }
}

/**
 * 保存配置文件
 */
function saveConfig(config) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

/**
 * 确保配置目录存在
 */
function ensureConfigDir() {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
}

/**
 * 初始化配置文件
 */
function initConfig() {
    ensureConfigDir();

    if (fs.existsSync(CONFIG_PATH)) {
        console.log(`\x1b[33m配置文件已存在于: ${CONFIG_PATH}\x1b[0m`);
        console.log(`\x1b[33m如需重新初始化，请先删除该文件\x1b[0m\n`);
        return;
    }

    const defaultConfig = DEFAULT_CONFIG;
    saveConfig(defaultConfig);

    console.log(`\x1b[36m========================================\x1b[0m`);
    console.log(`\x1b[33m        初始化配置文件\x1b[0m`);
    console.log(`\x1b[36m========================================\x1b[0m\n`);
    console.log(`\x1b[32m✓ 配置文件已创建: ${CONFIG_PATH}\x1b[0m\n`);
    console.log(`\x1b[33m下一步:\x1b[0m`);
    console.log(`  1. 编辑配置文件添加你的 API Key`);
    console.log(`  2. 使用 'cs' 启动 Claude Code\n`);
}

// ============================================
// 默认配置
// ============================================

const DEFAULT_CONFIG = {
    current_vendor: 'anthropic',
    vendors: {
        anthropic: {
            name: 'Anthropic官方',
            base_url: 'https://api.anthropic.com',
            api_key: '',
            models: {
                opus: 'claude-opus-4-6',
                sonnet: 'claude-sonnet-4-6',
                haiku: 'claude-haiku-4-5-20251001'
            }
        },
        deepseek: {
            name: 'DeepSeek',
            base_url: 'https://api.deepseek.com',
            api_key: '',
            models: {
                opus: 'deepseek-r1',
                sonnet: 'deepseek-chat',
                haiku: 'deepseek-coder'
            }
        },
        zhipu: {
            name: '智谱AI',
            base_url: 'https://open.bigmodel.cn/api/paas',
            api_key: '',
            models: {
                opus: 'glm-4.7',
                sonnet: 'glm-4',
                haiku: 'glm-3-turbo'
            }
        },
        qwen: {
            name: '通义千问',
            base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
            api_key: '',
            models: {
                opus: 'qwen-max',
                sonnet: 'qwen-plus',
                haiku: 'qwen-turbo'
            }
        }
    }
};

// ============================================
// 工具函数
// ============================================

const colors = {
    cyan: (text) => `\x1b[36m${text}\x1b[0m`,
    yellow: (text) => `\x1b[33m${text}\x1b[0m`,
    green: (text) => `\x1b[32m${text}\x1b[0m`,
    red: (text) => `\x1b[31m${text}\x1b[0m`,
    white: (text) => `\x1b[37m${text}\x1b[0m`,
    gray: (text) => `\x1b[90m${text}\x1b[0m`
};

/**
 * 隐藏 API Key 显示
 */
function maskApiKey(apiKey) {
    if (!apiKey) return '未设置';
    if (apiKey.length <= 12) return '****';
    return apiKey.substring(0, 12) + '...' + apiKey.substring(apiKey.length - 4);
}

// ============================================
// 命令函数
// ============================================

/**
 * 显示帮助信息
 */
function showHelp() {
    console.log(`
${colors.cyan('========================================')}
${colors.yellow('        Claude Code 模型切换工具')}
${colors.cyan('========================================')}

${colors.green('可用命令:')}

  cs                 - 使用当前配置启动 Claude Code
  cs help            - 显示此帮助信息
  cs init            - 初始化配置文件
  cs list            - 列出所有产商和可用模型
  cs status          - 显示当前配置状态
  cs switch <产商>   - 切换到指定产商
  cs key <产商> <Key>    - 设置产商的 API Key
  cs models <产商>    - 设置产商的三个模型 ID
  cs add <产商>      - 添加新产商(交互式)
  cs config          - 打开配置文件编辑

${colors.green('快捷命令:')}

  cs s <产商>       - switch 的简写
  cs k <产商> <Key> - key 的简写
  cs ls             - list 的简写

${colors.green('使用示例:')}

  cs                - 启动 Claude Code
  cs list           - 查看所有选项
  cs key deepseek sk-xxx  - 设置 DeepSeek 的 API Key
  cs switch zhipu   - 切换到智谱AI
  cs models deepseek    - 修改 DeepSeek 的模型配置

${colors.gray(`配置文件位置: ${CONFIG_PATH}`)}
`);
}

/**
 * 列出所有产商和模型
 */
function showList() {
    const config = getConfig();

    console.log(`
${colors.cyan('========================================')}
${colors.yellow('           可用产商和模型')}
${colors.cyan('========================================')}
`);

    for (const [vendorKey, vendor] of Object.entries(config.vendors)) {
        const isCurrent = config.current_vendor === vendorKey ? ' ◀ 当前' : '';

        // 显示产商名称
        const nameColor = config.current_vendor === vendorKey ? colors.green : colors.white;
        console.log(nameColor(`【${vendor.name}】${isCurrent}`));

        // 显示 API Key 状态
        console.log(colors.gray(`  API Key: ${maskApiKey(vendor.api_key)}`));

        // 显示 Base URL
        console.log(colors.gray(`  Base URL: ${vendor.base_url}`));

        // 显示三个模型
        console.log(colors.gray('  模型配置:'));
        console.log(`    Opus:   ${colors.white(vendor.models.opus)}`);
        console.log(`    Sonnet: ${colors.white(vendor.models.sonnet)}`);
        console.log(`    Haiku:  ${colors.white(vendor.models.haiku)}`);
        console.log('');
    }
}

/**
 * 显示当前状态
 */
function showStatus() {
    const config = getConfig();
    const currentVendor = config.vendors[config.current_vendor];

    console.log(`
${colors.cyan('========================================')}
${colors.yellow('           当前配置状态')}
${colors.cyan('========================================')}

${colors.green(`当前产商: ${currentVendor.name}`)}
${colors.green(`Base URL: ${currentVendor.base_url}`)}

${colors.yellow('API Key 状态:')}`);
    if (currentVendor.api_key) {
        console.log(colors.green(`  API Key: ${maskApiKey(currentVendor.api_key)}`));
    } else {
        console.log(colors.red(`  API Key: 未设置 (请使用 'cs key ${config.current_vendor} <API Key>' 设置)`));
    }

    console.log(`
${colors.yellow('模型配置:')}
${colors.white(`  ANTHROPIC_DEFAULT_OPUS_MODEL:   ${currentVendor.models.opus}`)}
${colors.white(`  ANTHROPIC_DEFAULT_SONNET_MODEL: ${currentVendor.models.sonnet}`)}
${colors.white(`  ANTHROPIC_DEFAULT_HAIKU_MODEL:  ${currentVendor.models.haiku}`)}
`);
}

/**
 * 切换产商
 */
function switchVendor(vendorName) {
    const config = getConfig();

    if (!config.vendors[vendorName]) {
        console.log(`\n${colors.red(`错误: 未找到产商 '${vendorName}'`)}`);
        console.log(`${colors.yellow("使用 'cs list' 查看可用产商")}\n`);
        return;
    }

    const oldVendor = config.current_vendor;
    config.current_vendor = vendorName;
    saveConfig(config);

    const newVendor = config.vendors[vendorName];

    console.log(`\n${colors.green(`已从 '${config.vendors[oldVendor].name}' 切换到 '${newVendor.name}'`)}`);
    console.log(colors.gray(`Base URL: ${newVendor.base_url}`));

    if (!newVendor.api_key) {
        console.log(`\n${colors.yellow('提示: 请设置 API Key')}`);
        console.log(colors.gray(`运行: cs key ${vendorName} <your-api-key>`));
    }
    console.log('');
}

/**
 * 设置 API Key
 */
function setApiKey(args) {
    const config = getConfig();

    if (args.length < 2) {
        // 显示所有产商及其 API Key 状态
        console.log(`
${colors.cyan('========================================')}
${colors.yellow('        API Key 配置状态')}
${colors.cyan('========================================')}
`);

        for (const [vendorKey, vendor] of Object.entries(config.vendors)) {
            const isCurrent = config.current_vendor === vendorKey ? ' ◀' : '';
            const nameColor = config.current_vendor === vendorKey ? colors.green : colors.white;
            console.log(nameColor(`[${vendorKey}]${isCurrent} ${vendor.name}`));
            console.log(colors.gray(`  API Key: ${maskApiKey(vendor.api_key)}`));
            console.log('');
        }

        console.log(colors.yellow('使用方式: cs key <产商> <API Key>\n'));
        return;
    }

    const vendorName = args[1];
    const newApiKey = args.slice(2).join(' '); // 处理包含空格的 API Key

    if (!config.vendors[vendorName]) {
        console.log(`\n${colors.red(`错误: 未找到产商 '${vendorName}'`)}`);
        console.log(`${colors.yellow("使用 'cs list' 查看可用产商")}\n`);
        return;
    }

    if (!newApiKey) {
        console.log(`\n${colors.red('错误: 请提供 API Key')}`);
        console.log(colors.yellow('用法: cs key <产商> <API Key>\n'));
        return;
    }

    config.vendors[vendorName].api_key = newApiKey;
    saveConfig(config);

    const vendor = config.vendors[vendorName];

    console.log(`\n${colors.green(`成功更新 '${vendor.name}' 的 API Key!`)}`);
    console.log(colors.gray(`API Key: ${maskApiKey(newApiKey)}\n`));
}

/**
 * 设置模型配置
 */
async function setModels(args) {
    const config = getConfig();

    if (args.length < 2) {
        console.log(`\n${colors.red('错误: 请指定产商')}`);
        console.log(colors.yellow('用法: cs models <产商>\n'));
        return;
    }

    const vendorName = args[1];

    if (!config.vendors[vendorName]) {
        console.log(`\n${colors.red(`错误: 未找到产商 '${vendorName}'`)}`);
        console.log(`${colors.yellow("使用 'cs list' 查看可用产商")}\n`);
        return;
    }

    const vendor = config.vendors[vendorName];

    console.log(`
${colors.cyan('========================================')}
${colors.yellow(`        修改 [${vendor.name}] 模型配置`)}
${colors.cyan('========================================')}
${colors.green('当前配置:')}
${colors.gray(`  Opus (最强):  ${vendor.models.opus}`)}
${colors.gray(`  Sonnet (中等): ${vendor.models.sonnet}`)}
${colors.gray(`  Haiku (最快):  ${vendor.models.haiku}`)}
`);

    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

    try {
        // Opus 模型
        const opus = await question(colors.yellow('请输入 Opus 模型 ID (留空保持不变): '));
        if (opus.trim()) vendor.models.opus = opus.trim();

        // Sonnet 模型
        const sonnet = await question(colors.yellow('请输入 Sonnet 模型 ID (留空保持不变): '));
        if (sonnet.trim()) vendor.models.sonnet = sonnet.trim();

        // Haiku 模型
        const haiku = await question(colors.yellow('请输入 Haiku 模型 ID (留空保持不变): '));
        if (haiku.trim()) vendor.models.haiku = haiku.trim();

        rl.close();

        saveConfig(config);

        console.log(`\n${colors.green(`成功更新 '${vendor.name}' 的模型配置!`)}`);
        console.log(colors.gray(`Opus:   ${vendor.models.opus}`));
        console.log(colors.gray(`Sonnet: ${vendor.models.sonnet}`));
        console.log(colors.gray(`Haiku:  ${vendor.models.haiku}\n`));
    } catch (err) {
        rl.close();
        throw err;
    }
}

/**
 * 添加新产商
 */
async function addVendor() {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

    try {
        console.log(`
${colors.cyan('========================================')}
${colors.yellow('           添加新产商')}
${colors.cyan('========================================')}
`);

        const vendorKey = await question(colors.white('请输入产商标识 (如: openai): '));
        if (!vendorKey.trim()) {
            console.log(`\n${colors.yellow('操作已取消')}`);
            rl.close();
            return;
        }

        // 检查是否已存在
        const config = getConfig();
        if (config.vendors[vendorKey.trim()]) {
            console.log(`\n${colors.red(`错误: 产商 '${vendorKey}' 已存在`)}`);
            rl.close();
            return;
        }

        const vendorName = await question(colors.white('请输入产商名称 (如: OpenAI): '));
        if (!vendorName.trim()) {
            console.log(`\n${colors.yellow('操作已取消')}`);
            rl.close();
            return;
        }

        const apiKey = await question(colors.white('请输入 API Key: '));
        if (!apiKey.trim()) {
            console.log(`\n${colors.yellow('操作已取消')}`);
            rl.close();
            return;
        }

        const baseurl = await question(colors.white('请输入 API Base URL (如: https://api.openai.com/v1): '));
        if (!baseurl.trim()) {
            console.log(`\n${colors.yellow('操作已取消')}`);
            rl.close();
            return;
        }

        console.log(colors.gray('\n请配置三个模型 ID (对应 Claude Code 的 Opus/Sonnet/Haiku):'));

        const opus = await question(colors.white('  Opus 模型 ID (最强): '));
        if (!opus.trim()) {
            console.log(`\n${colors.red('错误: 必须输入 Opus 模型 ID')}`);
            rl.close();
            return;
        }

        const sonnet = await question(colors.white('  Sonnet 模型 ID (中等): '));
        if (!sonnet.trim()) {
            console.log(`\n${colors.red('错误: 必须输入 Sonnet 模型 ID')}`);
            rl.close();
            return;
        }

        const haiku = await question(colors.white('  Haiku 模型 ID (最快): '));
        if (!haiku.trim()) {
            console.log(`\n${colors.red('错误: 必须输入 Haiku 模型 ID')}`);
            rl.close();
            return;
        }

        rl.close();

        // 创建新产商对象
        config.vendors[vendorKey.trim()] = {
            name: vendorName.trim(),
            base_url: baseurl.trim(),
            api_key: apiKey.trim(),
            models: {
                opus: opus.trim(),
                sonnet: sonnet.trim(),
                haiku: haiku.trim()
            }
        };

        saveConfig(config);

        console.log(`\n${colors.green(`成功添加产商 '${vendorName.trim()}'!`)}`);
        console.log(colors.gray(`Base URL: ${baseurl.trim()}`));
        console.log(colors.gray(`API Key: ${maskApiKey(apiKey.trim())}`));
        console.log(colors.gray(`Opus: ${opus.trim()}`));
        console.log(colors.gray(`Sonnet: ${sonnet.trim()}`));
        console.log(colors.gray(`Haiku: ${haiku.trim()}\n`));

        console.log(colors.yellow(`\n现在可以使用: cs switch ${vendorKey.trim()}\n`));
    } catch (err) {
        rl.close();
        throw err;
    }
}

/**
 * 打开配置文件编辑
 */
function openConfig() {
    const editor = process.env.EDITOR || 'notepad' + (process.platform === 'win32' ? '.exe' : '');

    console.log(`${colors.cyan('========================================')}`);
    console.log(`${colors.yellow('        打开配置文件编辑')}`);
    console.log(`${colors.cyan('========================================')}`);
    console.log(`${colors.gray(`配置文件: ${CONFIG_PATH}`)}
`);

    spawn(editor, [CONFIG_PATH], { stdio: 'inherit' });
}

/**
 * 设置环境变量并启动 Claude Code
 */
function startClaudeCode() {
    const config = getConfig();
    const currentVendor = config.vendors[config.current_vendor];

    // 检查 API Key 是否已设置
    if (!currentVendor.api_key) {
        console.log(`\n${colors.red('错误: 未设置 API Key')}`);
        console.log(`${colors.yellow('请先设置 API Key 后再启动 Claude Code')}`);
        console.log(`${colors.gray('设置方式:')}`);
        console.log(colors.white(`  cs key ${config.current_vendor} <your-api-key>\n`));
        process.exit(1);
    }

    console.log(`
${colors.cyan('========================================')}
${colors.yellow('        启动 Claude Code')}
${colors.cyan('========================================')}

${colors.green(`产商: ${currentVendor.name}`)}
${colors.green(`Base URL: ${currentVendor.base_url}`)}
${colors.gray(`API Key: ${maskApiKey(currentVendor.api_key)}`)}

${colors.yellow('环境变量设置:')}
${colors.green(`  ANTHROPIC_BASE_URL            = ${currentVendor.base_url}`)}
${colors.green(`  ANTHROPIC_AUTH_TOKEN          = ${maskApiKey(currentVendor.api_key)}`)}
${colors.green(`  ANTHROPIC_DEFAULT_OPUS_MODEL  = ${currentVendor.models.opus}`)}
${colors.green(`  ANTHROPIC_DEFAULT_SONNET_MODEL = ${currentVendor.models.sonnet}`)}
${colors.green(`  ANTHROPIC_DEFAULT_HAIKU_MODEL  = ${currentVendor.models.haiku}`)}
`);

    // 设置环境变量
    process.env.ANTHROPIC_BASE_URL = currentVendor.base_url;
    process.env.ANTHROPIC_AUTH_TOKEN = currentVendor.api_key;
    process.env.ANTHROPIC_DEFAULT_OPUS_MODEL = currentVendor.models.opus;
    process.env.ANTHROPIC_DEFAULT_SONNET_MODEL = currentVendor.models.sonnet;
    process.env.ANTHROPIC_DEFAULT_HAIKU_MODEL = currentVendor.models.haiku;

    console.log(colors.green('\n正在启动 Claude Code...\n'));

    // 启动 Claude Code
    const claude = spawn('claude', [], {
        stdio: 'inherit',
        env: process.env
    });

    claude.on('exit', (code) => {
        process.exit(code);
    });
}

// ============================================
// 主函数
// ============================================

async function main() {
    const args = process.argv.slice(2);

    // 无参数 - 启动 Claude Code
    if (args.length === 0) {
        startClaudeCode();
        return;
    }

    const command = args[0].toLowerCase();

    switch (command) {
        // 帮助命令
        case 'help':
        case 'h':
        case '--help':
        case '-h':
            showHelp();
            break;

        // 初始化命令
        case 'init':
            initConfig();
            break;

        // 列表命令
        case 'list':
        case 'ls':
            showList();
            break;

        // 状态命令
        case 'status':
        case 'st':
            showStatus();
            break;

        // 切换产商命令
        case 'switch':
        case 's':
            if (args.length < 2) {
                console.log(`\n${colors.red('错误: 请指定产商')}`);
                console.log(colors.yellow('用法: cs switch <产商>'));
                console.log(colors.yellow("使用 'cs list' 查看可用产商\n"));
                return;
            }
            switchVendor(args[1]);
            break;

        // 设置 API Key 命令
        case 'key':
        case 'k':
            setApiKey(args);
            break;

        // 设置模型命令
        case 'models':
            await setModels(args);
            break;

        // 添加产商命令
        case 'add':
            await addVendor();
            break;

        // 打开配置文件
        case 'config':
            openConfig();
            break;

        // 未知命令
        default:
            console.log(`\n${colors.red(`错误: 未知命令 '${command}'`)}`);
            console.log(colors.yellow("使用 'cs help' 查看可用命令\n"));
    }
}

// 运行主函数
main().catch(err => {
    console.error(colors.red(`错误: ${err.message}`));
    process.exit(1);
});
