#!/usr/bin/env node

/**
 * 🪂 AirdropShark - Eligibility Checker
 * 检查地址是否符合空投资格
 */

import { readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, '..', 'data', 'airdrops.json');

/**
 * 模拟链上数据 (实际项目需要调用真实 API)
 */
const MOCK_CHAIN_DATA = {
  layerzero: {
    bridgeCount: 8,
    chains: ['ethereum', 'arbitrum', 'optimism', 'base', 'polygon'],
    totalVolume: 2500,
    lastActivity: '2026-03-05',
    nftHeld: false
  },
  zksync: {
    transactions: 25,
    volume: 350,
    contracts: ['syncswap', 'mute', 'velocore', 'zkswap'],
    lastActivity: '2026-03-07',
    nftHeld: true
  },
  starknet: {
    transactions: 12,
    volume: 180,
    contracts: ['jediswap', 'sithswap', '10kswap'],
    lastActivity: '2026-02-28',
    nftHeld: false
  },
  scroll: {
    transactions: 8,
    volume: 150,
    contracts: ['ambient', 'nuri'],
    lastActivity: '2026-03-06',
    bridge: true
  }
};

/**
 * 加载空投数据
 */
async function loadAirdrops() {
  try {
    const data = await readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ 加载数据失败');
    process.exit(1);
  }
}

/**
 * 检查资格
 */
async function checkEligibility(projectName, userAddress) {
  const data = await loadAirdrops();
  const project = data.airdrops.find(
    a => a.name.toLowerCase() === projectName.toLowerCase()
  );

  if (!project) {
    console.error(`❌ 未找到项目：${projectName}`);
    console.log('\n💡 可用项目:');
    data.airdrops.forEach(a => console.log(`   - ${a.name}`));
    return;
  }

  if (!userAddress) {
    console.error('❌ 请提供钱包地址');
    console.log('\n💡 用法：node scripts/eligibility.mjs <项目名> --address 0x...');
    return;
  }

  console.log(`\n✅ ${project.name} 资格检查\n`);
  console.log('─'.repeat(60));
  console.log(`地址：${userAddress.slice(0, 10)}...${userAddress.slice(-8)}`);
  console.log('─'.repeat(60));

  // 获取模拟链上数据
  const chainData = MOCK_CHAIN_DATA[projectName.toLowerCase()] || generateMockData();

  // 检查资格
  const results = checkRequirements(project, chainData);

  console.log('\n📋 要求检查:\n');
  
  results.forEach(req => {
    const icon = req.met ? '✅' : '❌';
    console.log(`${icon} ${req.name}`);
    console.log(`   要求：${req.requirement}`);
    console.log(`   你的：${req.actual}`);
    if (!req.met) {
      console.log(`   ⚠️  还需：${req.remaining}`);
    }
    console.log('');
  });

  // 计算总体资格
  const metCount = results.filter(r => r.met).length;
  const totalCount = results.length;
  const passRate = (metCount / totalCount * 100).toFixed(0);

  console.log('─'.repeat(60));
  console.log(`\n资格评分：${passRate}% (${metCount}/${totalCount})\n`);

  if (passRate >= 100) {
    console.log('🎉 恭喜！你符合空投资格！\n');
    console.log(`预期价值：${project.expectedValue}`);
    console.log(`快照时间：${project.snapshotDate}`);
    console.log('\n💡 建议:');
    console.log('   - 保持钱包活跃，定期交互');
    console.log('   - 关注官方 Twitter 获取最新消息');
    console.log('   - 设置提醒避免错过快照');
  } else if (passRate >= 60) {
    console.log('👍 基本符合，但还需努力！\n');
    console.log('💡 改进建议:');
    results.filter(r => !r.met).forEach(r => {
      console.log(`   - ${r.name}: ${r.remaining}`);
    });
  } else {
    console.log('⚠️  暂不符合，需要更多交互\n');
    console.log('💡 改进建议:');
    results.filter(r => !r.met).forEach(r => {
      console.log(`   - ${r.name}: ${r.remaining}`);
    });
  }

  console.log('\n' + '─'.repeat(60));
  console.log('\n💡 下一步:');
  console.log('   设置提醒：node scripts/reminder.mjs add --project ${project.name} --date <日期>');
  console.log('   查看指南：node scripts/guide.mjs ${project.name}');
  console.log('');
}

/**
 * 检查要求
 */
function checkRequirements(project, chainData) {
  const results = [];
  const reqs = project.requirements;

  // 检查跨链次数
  if (reqs.bridgeCount) {
    const met = chainData.bridgeCount >= reqs.bridgeCount;
    results.push({
      name: '跨链交易次数',
      requirement: `≥ ${reqs.bridgeCount} 次`,
      actual: `${chainData.bridgeCount || 0} 次`,
      met,
      remaining: `${reqs.bridgeCount - (chainData.bridgeCount || 0)} 次`
    });
  }

  // 检查使用链数量
  if (reqs.chains) {
    const met = chainData.chains && chainData.chains.length >= reqs.chains;
    results.push({
      name: '使用链数量',
      requirement: `≥ ${reqs.chains} 条`,
      actual: `${chainData.chains ? chainData.chains.length : 0} 条`,
      met,
      remaining: `${reqs.chains - (chainData.chains ? chainData.chains.length : 0)} 条`
    });
  }

  // 检查交易量
  if (reqs.volume) {
    const met = chainData.volume >= reqs.volume;
    results.push({
      name: '总交易量',
      requirement: `≥ $${reqs.volume}`,
      actual: `$${chainData.volume || 0}`,
      met,
      remaining: `$${reqs.volume - (chainData.volume || 0)}`
    });
  }

  // 检查交易次数
  if (reqs.transactions) {
    const met = chainData.transactions >= reqs.transactions;
    results.push({
      name: '交易次数',
      requirement: `≥ ${reqs.transactions} 次`,
      actual: `${chainData.transactions || 0} 次`,
      met,
      remaining: `${reqs.transactions - (chainData.transactions || 0)} 次`
    });
  }

  // 检查交互合约数
  if (reqs.contracts) {
    const met = chainData.contracts && chainData.contracts.length >= reqs.contracts;
    results.push({
      name: '交互合约数',
      requirement: `≥ ${reqs.contracts} 个`,
      actual: `${chainData.contracts ? chainData.contracts.length : 0} 个`,
      met,
      remaining: `${reqs.contracts - (chainData.contracts ? chainData.contracts.length : 0)} 个`
    });
  }

  // 检查 NFT 持有
  if (reqs.nft) {
    const met = chainData.nftHeld === true;
    results.push({
      name: '持有项目 NFT',
      requirement: '是',
      actual: chainData.nftHeld ? '是' : '否',
      met,
      remaining: '需要铸造或购买 NFT'
    });
  }

  // 检查桥接
  if (reqs.bridge) {
    const met = chainData.bridge === true;
    results.push({
      name: '使用过桥接',
      requirement: '是',
      actual: chainData.bridge ? '是' : '否',
      met,
      remaining: '需要从其他链桥接资金'
    });
  }

  // 检查近期活跃度
  if (reqs.recentActivity) {
    const lastActivity = new Date(chainData.lastActivity || '2025-01-01');
    const now = new Date();
    const daysDiff = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
    const met = daysDiff <= reqs.recentActivity;
    results.push({
      name: '近期活跃度',
      requirement: `${reqs.recentActivity} 天内有活动`,
      actual: `${daysDiff} 天前`,
      met,
      remaining: met ? '保持活跃' : `${daysDiff - reqs.recentActivity} 天前`
    });
  }

  return results;
}

/**
 * 生成模拟数据
 */
function generateMockData() {
  return {
    transactions: Math.floor(Math.random() * 30),
    volume: Math.floor(Math.random() * 500),
    bridgeCount: Math.floor(Math.random() * 10),
    chains: ['ethereum', 'arbitrum', 'optimism'].slice(0, Math.floor(Math.random() * 3) + 1),
    contracts: ['contract1', 'contract2', 'contract3'].slice(0, Math.floor(Math.random() * 3) + 1),
    lastActivity: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    nftHeld: Math.random() > 0.5,
    bridge: Math.random() > 0.5
  };
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
 * 显示帮助
 */
function showHelp() {
  console.log(`
🪂 AirdropShark - 资格检查

用法:
  node scripts/eligibility.mjs <项目名> --address <钱包地址>

示例:
  node scripts/eligibility.mjs layerzero --address 0x33f9...5ad9
  node scripts/eligibility.mjs zksync --address 0x33f9...5ad9

可用项目:
  LayerZero, zkSync Era, Starknet, Scroll, Linea, Base, Polyhedra, EigenLayer

选项:
  --address   钱包地址 (必需)
  --help      显示帮助
`);
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    showHelp();
    return;
  }

  const projectName = args[0];
  const options = parseArgs(args);
  const userAddress = options.address;

  if (!userAddress) {
    console.error('❌ 请提供钱包地址');
    showHelp();
    return;
  }

  await checkEligibility(projectName, userAddress);
}

main().catch(console.error);
