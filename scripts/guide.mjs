#!/usr/bin/env node

/**
 * 🪂 AirdropShark - Interaction Guide
 * 交互指南 - 详细的空投资格获取教程
 */

import { readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * 空投项目详细指南
 */
const GUIDES = {
  layerzero: {
    name: 'LayerZero',
    symbol: 'ZRO',
    difficulty: 'medium',
    timeRequired: '2-3 小时',
    estimatedValue: '$2000-5000',
    deadline: '2026-Q2',
    steps: [
      {
        title: '准备工作',
        content: [
          '准备至少 0.01 ETH 作为 Gas 费用',
          '安装 MetaMask 钱包',
          '准备 3 条以上不同链的资产'
        ]
      },
      {
        title: '第一步：桥接资产',
        content: [
          '访问 https://app.layerzero.network',
          '连接钱包',
          '从 Ethereum 桥接 USDC 到 Arbitrum (至少$50)',
          '从 Arbitrum 桥接到 Optimism (至少$50)',
          '从 Optimism 桥接到 Base (至少$50)',
          '保存交易记录'
        ],
        warning: '每次桥接间隔至少 1 天，不要一次性完成'
      },
      {
        title: '第二步：跨链 Swap',
        content: [
          '使用 Stargate Finance 进行跨链兑换',
          '在每条链上至少进行 1 次 swap',
          '建议金额：$100-500'
        ]
      },
      {
        title: '第三步：保持活跃',
        content: [
          '每周至少进行 1 次跨链操作',
          '保持小额资金在各链上',
          '参与 LayerZero 生态项目'
        ]
      }
    ],
    tips: [
      '❗ 不要使用同样的金额，随机化交易',
      '❗ 避免在同一天进行多次操作',
      '❗ 保持至少 30 天的活跃期',
      '✅ 使用不同的链获得更高评分',
      '✅ 持有 LayerZero NFT 可以增加权重'
    ],
    links: {
      website: 'https://layerzero.network',
      bridge: 'https://stargate.finance',
      twitter: 'https://twitter.com/LayerZero_Labs',
      discord: 'https://discord.gg/layerzero'
    }
  },
  zksync: {
    name: 'zkSync Era',
    symbol: 'ZK',
    difficulty: 'low',
    timeRequired: '1-2 小时',
    estimatedValue: '$1000-3000',
    deadline: '2026-Q1',
    steps: [
      {
        title: '第一步：桥接资金',
        content: [
          '访问 https://portal.zksync.io/bridge',
          '从 Ethereum 桥接 ETH 到 zkSync Era',
          '建议金额：0.01-0.1 ETH',
          '等待桥接完成 (约 10 分钟)'
        ]
      },
      {
        title: '第二步：DEX 交易',
        content: [
          '在 SyncSwap 进行至少 3 次交易',
          '在 Mute.io 进行至少 2 次交易',
          '在 Velocore 进行至少 1 次交易',
          '每次交易金额建议$50-200'
        ]
      },
      {
        title: '第三步：借贷协议',
        content: [
          '在 EraLend 存入至少$100',
          '保持至少 7 天',
          '尝试借款并归还'
        ]
      },
      {
        title: '第四步：NFT (可选)',
        content: [
          '铸造 zkSync Era 生态 NFT',
          '推荐项目：LiteNFT, zkSync NFT Marketplace',
          '预算：$20-50'
        ]
      }
    ],
    tips: [
      '❗ 每周至少登录一次钱包',
      '❗ 保持小额 ETH 余额支付 Gas',
      '✅ 与尽可能多的协议交互',
      '✅ 保持至少 1 个月的活跃期'
    ],
    links: {
      website: 'https://zksync.io',
      bridge: 'https://portal.zksync.io/bridge',
      dex: 'https://syncswap.xyz',
      twitter: 'https://twitter.com/zksync'
    }
  },
  starknet: {
    name: 'Starknet',
    symbol: 'STRK',
    difficulty: 'low',
    timeRequired: '1 小时',
    estimatedValue: '$500-2000',
    deadline: '2026-03 (已过，等待发币)',
    steps: [
      {
        title: '状态说明',
        content: [
          '⚠️  快照已于 2026-01 完成',
          '✅ 只需等待官方发币',
          '📅 预计发币时间：2026-Q2'
        ]
      },
      {
        title: '如何查询资格',
        content: [
          '访问 https://starknet.io/eligibility',
          '连接钱包',
          '查看你的积分和预期空投',
          '保存截图作为凭证'
        ]
      }
    ],
    tips: [
      '✅ 持续关注官方公告',
      '✅ 加入 Discord 获取最新消息',
      '❗ 警惕钓鱼网站'
    ],
    links: {
      website: 'https://starknet.io',
      check: 'https://starknet.io/eligibility',
      twitter: 'https://twitter.com/Starknet'
    }
  },
  scroll: {
    name: 'Scroll',
    symbol: 'SCR',
    difficulty: 'medium',
    timeRequired: '2-3 小时',
    estimatedValue: '$300-1000',
    deadline: '2026-Q3',
    steps: [
      {
        title: '第一步：桥接资金',
        content: [
          '访问 https://scroll.io/bridge',
          '从 Ethereum 桥接 ETH 到 Scroll',
          '建议金额：0.005-0.05 ETH',
          '等待确认 (约 15 分钟)'
        ]
      },
      {
        title: '第二步：DEX 交易',
        content: [
          '在 Ambient Finance 进行 3+ 次交易',
          '在 Nuri Exchange 进行 2+ 次交易',
          '尝试不同的交易对'
        ]
      },
      {
        title: '第三步：借贷',
        content: [
          '在 Scroll 生态借贷协议存入资金',
          '保持至少 2 周',
          '建议金额：$200+'
        ]
      }
    ],
    tips: [
      '❗ 保持每月至少 1 次交互',
      '✅ 参与 Scroll 的社区活动',
      '✅ 关注 Scroll 官方 Twitter'
    ],
    links: {
      website: 'https://scroll.io',
      bridge: 'https://scroll.io/bridge',
      dex: 'https://ambient.finance',
      twitter: 'https://twitter.com/Scroll_ZKP'
    }
  },
  eigenlayer: {
    name: 'EigenLayer',
    symbol: 'EIGEN',
    difficulty: 'medium',
    timeRequired: '1-2 小时',
    estimatedValue: '$1000-3000',
    deadline: '2026-Q2',
    steps: [
      {
        title: '准备工作',
        content: [
          '至少 0.1 ETH 用于质押',
          '安装 MetaMask 钱包',
          '确保有足够的 Gas 费用'
        ]
      },
      {
        title: '第一步：存款',
        content: [
          '访问 https://app.eigenlayer.xyz',
          '连接钱包',
          '选择 Restake ETH',
          '输入质押金额 (建议 0.1+ ETH)',
          '确认交易'
        ]
      },
      {
        title: '第二步：选择运营商',
        content: [
          '浏览可用的运营商列表',
          '选择 2-3 个可信运营商',
          '分配质押的 ETH',
          '确认委托'
        ]
      },
      {
        title: '第三步：定期查看',
        content: [
          '每周查看收益情况',
          '关注运营商表现',
          '必要时重新分配'
        ]
      }
    ],
    tips: [
      '❗ 质押后至少保持 30 天',
      '❗ 选择高评级的运营商',
      '✅ 参与 EigenLayer 治理',
      '✅ 关注 Restaking 生态发展'
    ],
    links: {
      website: 'https://eigenlayer.xyz',
      app: 'https://app.eigenlayer.xyz',
      twitter: 'https://twitter.com/eigenlayer'
    }
  }
};

/**
 * 显示指南
 */
function showGuide(projectName) {
  const guide = GUIDES[projectName?.toLowerCase()];

  if (!guide) {
    console.error(`❌ 未找到项目：${projectName}`);
    console.log('\n💡 可用项目指南:');
    Object.keys(GUIDES).forEach(key => {
      const g = GUIDES[key];
      console.log(`   - ${g.name} (${g.symbol}): ${g.estimatedValue}`);
    });
    console.log('\n💡 用法：node scripts/guide.mjs <项目名>');
    return;
  }

  console.log(`\n🪂 ${guide.name} 交互指南\n`);
  console.log('═'.repeat(70));
  
  // 基本信息
  console.log(`代币：    ${guide.symbol}`);
  console.log(`难度：    ${getDifficultyStars(guide.difficulty)} ${guide.difficulty}`);
  console.log(`预计时间：${guide.timeRequired}`);
  console.log(`预期价值：${guide.estimatedValue}`);
  console.log(`截止时间：${guide.deadline}`);
  console.log('═'.repeat(70));
  console.log('');

  // 步骤
  guide.steps.forEach((step, index) => {
    console.log(`\n📝 ${step.title}\n`);
    console.log('─'.repeat(50));
    
    step.content.forEach((item, i) => {
      if (typeof item === 'object') {
        for (const [key, value] of Object.entries(item)) {
          console.log(`   • ${key}: ${value}`);
        }
      } else {
        console.log(`   ${i + 1}. ${item}`);
      }
    });

    if (step.warning) {
      console.log(`\n   ⚠️  注意：${step.warning}`);
    }
  });

  // 提示
  console.log('\n\n💡 重要提示\n');
  console.log('─'.repeat(50));
  guide.tips.forEach(tip => {
    const icon = tip.startsWith('❗') ? '🔴' : (tip.startsWith('✅') ? '🟢' : '💡');
    console.log(`${icon} ${tip.slice(2)}`);
  });

  // 链接
  console.log('\n🔗 相关链接\n');
  console.log('─'.repeat(50));
  for (const [name, url] of Object.entries(guide.links)) {
    console.log(`   ${name}: ${url}`);
  }

  console.log('\n' + '═'.repeat(70));
  console.log('\n💡 下一步:');
  console.log(`   设置提醒：node scripts/reminder.mjs add --project ${projectName}`);
  console.log(`   检查资格：node scripts/eligibility.mjs ${projectName} --address 0x...`);
  console.log('');
}

/**
 * 获取难度星级
 */
function getDifficultyStars(difficulty) {
  switch (difficulty) {
    case 'low': return '🟢🟢🟢';
    case 'medium': return '🟡🟡🟡';
    case 'high': return '🔴🔴🔴';
    default: return '⚪⚪⚪';
  }
}

/**
 * 显示帮助
 */
function showHelp() {
  console.log(`
🪂 AirdropShark - 交互指南

用法:
  node scripts/guide.mjs <项目名>

可用项目:
  layerzero   - LayerZero (预期$2000-5000)
  zksync      - zkSync Era (预期$1000-3000)
  starknet    - Starknet (已过快照，等待发币)
  scroll      - Scroll (预期$300-1000)
  eigenlayer  - EigenLayer (预期$1000-3000)

示例:
  node scripts/guide.mjs layerzero
  node scripts/guide.mjs zksync
  node scripts/guide.mjs eigenlayer

相关命令:
  airdrop.mjs         查看所有空投项目
  eligibility.mjs     检查钱包资格
  reminder.mjs        设置快照提醒
`);
}

/**
 * 解析命令行参数
 */
function parseArgs(args) {
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      options[key] = value;
      i++;
    }
  }
  return options;
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  const projectName = args[0];
  showGuide(projectName);
}

main().catch(console.error);
