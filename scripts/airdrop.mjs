#!/usr/bin/env node

/**
 * 🪂 AirdropShark - Airdrop List
 * 查看潜在空投项目列表
 */

import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, '..', 'data', 'airdrops.json');

/**
 * 空投项目数据
 */
const DEFAULT_AIRDROPS = [
  {
    id: 1,
    name: 'LayerZero',
    symbol: 'ZRO',
    chain: '多链',
    category: '跨链桥',
    priority: 'high',
    status: 'upcoming',
    snapshotDate: '2026-Q2',
    expectedValue: '$2000-5000',
    difficulty: 'medium',
    requirements: {
      bridgeCount: 5,
      chains: 3,
      volume: 1000,
      recentActivity: 30
    },
    description: '跨链协议龙头，预计空投价值高',
    website: 'https://layerzero.network',
    twitter: '@LayerZero_Labs'
  },
  {
    id: 2,
    name: 'zkSync Era',
    symbol: 'ZK',
    chain: 'Ethereum L2',
    category: 'Layer2',
    priority: 'high',
    status: 'upcoming',
    snapshotDate: '2026-Q1',
    expectedValue: '$1000-3000',
    difficulty: 'low',
    requirements: {
      transactions: 10,
      volume: 100,
      contracts: 5,
      recentActivity: 30
    },
    description: 'ZK Rollup 龙头，交互简单',
    website: 'https://zksync.io',
    twitter: '@zksync'
  },
  {
    id: 3,
    name: 'Starknet',
    symbol: 'STRK',
    chain: 'Starknet',
    category: 'Layer2',
    priority: 'medium',
    status: 'completed',
    snapshotDate: '2026-01',
    expectedValue: '$500-2000',
    difficulty: 'low',
    requirements: {
      transactions: 5,
      volume: 50,
      contracts: 3
    },
    description: '已完成快照，等待发币',
    website: 'https://starknet.io',
    twitter: '@Starknet'
  },
  {
    id: 4,
    name: 'Scroll',
    symbol: 'SCR',
    chain: 'Ethereum L2',
    category: 'Layer2',
    priority: 'medium',
    status: 'upcoming',
    snapshotDate: '2026-Q3',
    expectedValue: '$300-1000',
    difficulty: 'medium',
    requirements: {
      transactions: 15,
      volume: 200,
      contracts: 5,
      bridge: true
    },
    description: 'ZK EVM 新贵，生态快速发展',
    website: 'https://scroll.io',
    twitter: '@Scroll_ZKP'
  },
  {
    id: 5,
    name: 'Linea',
    symbol: 'LINEA',
    chain: 'Ethereum L2',
    category: 'Layer2',
    priority: 'low',
    status: 'upcoming',
    snapshotDate: '2026-Q3',
    expectedValue: '$300-800',
    difficulty: 'low',
    requirements: {
      transactions: 10,
      volume: 100,
      voyage: true
    },
    description: 'ConsenSys 旗下 L2',
    website: 'https://linea.build',
    twitter: '@LineaBuild'
  },
  {
    id: 6,
    name: 'Base',
    symbol: 'BASE',
    chain: 'Base',
    category: 'Layer2',
    priority: 'low',
    status: 'upcoming',
    snapshotDate: '2026-Q4',
    expectedValue: '$200-600',
    difficulty: 'low',
    requirements: {
      transactions: 10,
      volume: 100,
      contracts: 3
    },
    description: 'Coinbase 旗下 L2',
    website: 'https://base.org',
    twitter: '@Base'
  },
  {
    id: 7,
    name: 'Polyhedra',
    symbol: 'ZKJ',
    chain: '多链',
    category: '跨链桥',
    priority: 'medium',
    status: 'upcoming',
    snapshotDate: '2026-Q2',
    expectedValue: '$500-1500',
    difficulty: 'medium',
    requirements: {
      bridgeCount: 3,
      volume: 500,
      nft: true
    },
    description: 'ZK 跨链协议',
    website: 'https://polyhedra.network',
    twitter: '@PolyhedraZK'
  },
  {
    id: 8,
    name: 'EigenLayer',
    symbol: 'EIGEN',
    chain: 'Ethereum',
    category: 'Restaking',
    priority: 'high',
    status: 'upcoming',
    snapshotDate: '2026-Q2',
    expectedValue: '$1000-3000',
    difficulty: 'medium',
    requirements: {
      stake: true,
      amount: 0.1,
      operators: 2
    },
    description: 'Restaking 龙头，质押 ETH 参与',
    website: 'https://eigenlayer.xyz',
    twitter: '@eigenlayer'
  }
];

/**
 * 加载空投数据
 */
async function loadAirdrops() {
  try {
    if (!existsSync(DATA_FILE)) {
      // 保存默认数据
      await saveAirdrops({ airdrops: DEFAULT_AIRDROPS, lastUpdate: new Date().toISOString() });
      return { airdrops: DEFAULT_AIRDROPS, lastUpdate: new Date().toISOString() };
    }
    const data = await readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('⚠️  加载数据失败，使用默认数据');
    return { airdrops: DEFAULT_AIRDROPS, lastUpdate: new Date().toISOString() };
  }
}

/**
 * 保存空投数据
 */
async function saveAirdrops(data) {
  try {
    const dir = dirname(DATA_FILE);
    if (!existsSync(dir)) {
      await writeFile(dir, '', 'utf-8');
    }
    await writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('❌ 保存数据失败:', error.message);
    return false;
  }
}

/**
 * 显示空投列表
 */
function printAirdrops(airdrops, options = {}) {
  const { priority, status, chain } = options;

  let filtered = airdrops;

  if (priority) {
    filtered = filtered.filter(a => a.priority === priority);
  }

  if (status) {
    filtered = filtered.filter(a => a.status === status);
  }

  if (chain) {
    filtered = filtered.filter(a => a.chain.toLowerCase().includes(chain.toLowerCase()));
  }

  if (filtered.length === 0) {
    console.log('📋 没有找到符合条件的空投项目\n');
    return;
  }

  console.log('🪂 AirdropShark - 潜在空投项目\n');
  console.log('─'.repeat(100));
  console.log(
    '优先级'.padEnd(8) +
    '项目'.padEnd(18) +
    '链'.padEnd(18) +
    '快照时间'.padEnd(15) +
    '预期价值'.padEnd(20) +
    '难度'
  );
  console.log('─'.repeat(100));

  filtered.forEach(airdrop => {
    const priorityIcon = getPriorityIcon(airdrop.priority);
    const statusIcon = getStatusIcon(airdrop.status);
    console.log(
      `${priorityIcon} ${airdrop.priority.padEnd(5)} ` +
      `${airdrop.name.padEnd(16)} ` +
      `${airdrop.chain.padEnd(16)} ` +
      `${airdrop.snapshotDate.padEnd(13)} ` +
      `${airdrop.expectedValue.padEnd(18)} ` +
      `${getDifficultyIcon(airdrop.difficulty)} ${airdrop.difficulty}`
    );
  });

  console.log('─'.repeat(100));
  console.log(`\n总计：${filtered.length} 个项目\n`);

  // 显示操作提示
  if (filtered.length > 0) {
    console.log('💡 操作提示:');
    console.log('   检查资格：node scripts/eligibility.mjs <项目名> --address 0x...');
    console.log('   设置提醒：node scripts/reminder.mjs add --project <项目名> --date YYYY-MM-DD');
    console.log('   查看指南：node scripts/guide.mjs <项目名>');
    console.log('');
    console.log('💡 筛选选项:');
    console.log('   --priority high|medium|low  按优先级筛选');
    console.log('   --status upcoming|completed 按状态筛选');
    console.log('   --chain <链名>              按链筛选');
  }
}

/**
 * 获取优先级图标
 */
function getPriorityIcon(priority) {
  switch (priority) {
    case 'high': return '🔴';
    case 'medium': return '🟡';
    case 'low': return '🟢';
    default: return '⚪';
  }
}

/**
 * 获取状态图标
 */
function getStatusIcon(status) {
  switch (status) {
    case 'upcoming': return '⏳';
    case 'completed': return '✅';
    case 'claimed': return '💰';
    default: return '❓';
  }
}

/**
 * 获取难度图标
 */
function getDifficultyIcon(difficulty) {
  switch (difficulty) {
    case 'low': return '🟢';
    case 'medium': return '🟡';
    case 'high': return '🔴';
    default: return '⚪';
  }
}

/**
 * 显示帮助
 */
function showHelp() {
  console.log(`
🪂 AirdropShark - 空投项目列表

用法:
  node scripts/airdrop.mjs [选项]

选项:
  --priority high|medium|low   按优先级筛选
  --status upcoming|completed  按状态筛选
  --chain <链名>               按链筛选
  --help                       显示帮助

示例:
  # 查看所有空投
  node scripts/airdrop.mjs

  # 只看高优先级
  node scripts/airdrop.mjs --priority high

  # 只看 Layer2 项目
  node scripts/airdrop.mjs --chain layer2

  # 看即将快照的项目
  node scripts/airdrop.mjs --status upcoming

相关命令:
  eligibility.mjs <项目> --address 0x...  检查资格
  reminder.mjs add --project <项目>       设置提醒
  guide.mjs <项目>                       查看交互指南
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

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  const options = parseArgs(args);
  const data = await loadAirdrops();

  console.log(''); // 空行
  printAirdrops(data.airdrops, options);
}

main().catch(console.error);
