#!/usr/bin/env node

/**
 * 🪂 AirdropShark - Reminder Manager
 * 快照提醒管理 - 设置/查看/删除提醒
 */

import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REMINDER_FILE = join(__dirname, '..', 'data', 'reminders.json');

/**
 * 预设空投快照日期
 */
const SNAPSHOT_DATES = {
  layerzero: '2026-04-15',
  zksync: '2026-03-25',
  starknet: '2026-03-15',
  scroll: '2026-05-01',
  linea: '2026-05-15',
  base: '2026-06-01',
  polyhedra: '2026-04-20',
  eigenlayer: '2026-04-10'
};

/**
 * 加载提醒数据
 */
async function loadReminders() {
  try {
    if (!existsSync(REMINDER_FILE)) {
      return { reminders: [], nextId: 1 };
    }
    const data = await readFile(REMINDER_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ 加载提醒数据失败:', error.message);
    return { reminders: [], nextId: 1 };
  }
}

/**
 * 保存提醒数据
 */
async function saveReminders(data) {
  try {
    const dir = dirname(REMINDER_FILE);
    if (!existsSync(dir)) {
      await writeFile(dir, '', 'utf-8');
    }
    await writeFile(REMINDER_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('❌ 保存提醒数据失败:', error.message);
    return false;
  }
}

/**
 * 添加提醒
 */
async function addReminder(options) {
  const { project, date, type = 'snapshot', address, notes } = options;

  if (!project && !date) {
    console.error('❌ 错误：请指定项目名或日期');
    console.log('\n💡 用法:');
    console.log('   node scripts/reminder.mjs add --project layerzero');
    console.log('   node scripts/reminder.mjs add --date 2026-04-15 --name "LayerZero 快照"');
    return;
  }

  const reminders = await loadReminders();

  // 如果只提供了项目名，使用预设日期
  let snapshotDate = date;
  let projectName = project;
  let reminderName = project ? `${project} 快照` : options.name || '自定义提醒';

  if (project && !date) {
    const presetDate = SNAPSHOT_DATES[project.toLowerCase()];
    if (presetDate) {
      snapshotDate = presetDate;
      console.log(`📅 使用预设日期：${presetDate}\n`);
    } else {
      console.error(`⚠️  未找到项目 "${project}" 的预设日期`);
      console.log('\n💡 可用项目:', Object.keys(SNAPSHOT_DATES).join(', '));
      console.log('\n💡 请手动指定日期：node scripts/reminder.mjs add --project xxx --date YYYY-MM-DD');
      return;
    }
  }

  // 检查是否已存在相同项目的提醒
  const existing = reminders.reminders.find(
    r => r.project?.toLowerCase() === project?.toLowerCase() && r.date === snapshotDate
  );

  if (existing) {
    console.log('⚠️  该项目的提醒已存在\n');
    printReminder(existing);
    return;
  }

  const reminder = {
    id: reminders.nextId++,
    name: reminderName,
    project: projectName,
    date: snapshotDate,
    type,
    address: address || '',
    notes: notes || '',
    createdAt: new Date().toISOString(),
    notified: false,
    channels: ['local'] // 支持 local, telegram, email
  };

  reminders.reminders.push(reminder);

  if (await saveReminders(reminders)) {
    console.log('✅ 提醒已设置\n');
    printReminder(reminder);

    // 计算倒计时
    const daysLeft = getDaysLeft(snapshotDate);
    if (daysLeft > 0) {
      console.log(`⏰ 距离快照还有 ${daysLeft} 天`);
    } else if (daysLeft === 0) {
      console.log('🚨 今天就是快照日！');
    } else {
      console.log('⚠️  快照日期已过');
    }
    console.log('');
  }
}

/**
 * 查看提醒
 */
async function listReminders(options = {}) {
  const data = await loadReminders();
  const now = new Date();

  if (data.reminders.length === 0) {
    console.log('📋 没有设置任何提醒\n');
    console.log('💡 添加提醒：node scripts/reminder.mjs add --project layerzero');
    return;
  }

  let reminders = data.reminders;

  // 筛选即将到来的提醒
  if (options.upcoming) {
    reminders = reminders.filter(r => {
      const days = getDaysLeft(r.date);
      return days >= 0 && days <= (typeof options.upcoming === 'number' ? options.upcoming : 30);
    });
  }

  // 按项目筛选
  if (options.project) {
    reminders = reminders.filter(r => r.project?.toLowerCase() === options.project.toLowerCase());
  }

  // 排序：按日期
  reminders.sort((a, b) => new Date(a.date) - new Date(b.date));

  console.log('🪂 AirdropShark - 快照提醒\n');
  console.log('─'.repeat(90));
  console.log(
    'ID'.padEnd(4) +
    '项目名称'.padEnd(20) +
    '日期'.padEnd(12) +
    '类型'.padEnd(10) +
    '倒计时'.padEnd(10) +
    '状态'
  );
  console.log('─'.repeat(90));

  reminders.forEach(reminder => {
    const daysLeft = getDaysLeft(reminder.date);
    const countdown = formatCountdown(daysLeft) || '未知';
    const status = reminder.notified ? '✅ 已通知' : '⏳ 待通知';
    const project = reminder.project || reminder.name || '未命名';

    console.log(
      `${reminder.id.toString().padEnd(4)} ` +
      `${String(project).padEnd(20)} ` +
      `${String(reminder.date || '').padEnd(12)} ` +
      `${String(reminder.type || 'snapshot').padEnd(10)} ` +
      `${String(countdown).padEnd(10)} ` +
      `${status}`
    );
  });

  console.log('─'.repeat(90));
  console.log(`\n总计：${reminders.length} 个提醒\n`);

  console.log('💡 管理命令:');
  console.log('   删除：node scripts/reminder.mjs remove <ID>');
  console.log('   标记：node scripts/reminder.mjs done <ID>');
  console.log('   查看：node scripts/reminder.mjs upcoming (只看即将到来的)');
  console.log('');

  // 显示即将到期的提醒
  const urgent = reminders.filter(r => {
    const days = getDaysLeft(r.date);
    return days >= 0 && days <= 7;
  });

  if (urgent.length > 0) {
    console.log('🚨 紧急提醒 (7 天内):');
    urgent.forEach(r => {
      const days = getDaysLeft(r.date);
      console.log(`   ⚠️  ${r.project}: ${days === 0 ? '今天' : days + '天后'} (${r.date})`);
    });
    console.log('');
  }
}

/**
 * 删除提醒
 */
async function removeReminder(reminderId) {
  if (!reminderId) {
    console.error('❌ 请指定提醒 ID');
    return;
  }

  const data = await loadReminders();
  const reminderIndex = data.reminders.findIndex(r => r.id === parseInt(reminderId));

  if (reminderIndex === -1) {
    console.error(`❌ 未找到提醒 ID: ${reminderId}`);
    return;
  }

  const removed = data.reminders.splice(reminderIndex, 1)[0];

  if (await saveReminders(data)) {
    console.log('✅ 提醒已删除\n');
    printReminder(removed);
  }
}

/**
 * 标记为已完成
 */
async function markAsDone(reminderId) {
  if (!reminderId) {
    console.error('❌ 请指定提醒 ID');
    return;
  }

  const data = await loadReminders();
  const reminder = data.reminders.find(r => r.id === parseInt(reminderId));

  if (!reminder) {
    console.error(`❌ 未找到提醒 ID: ${reminderId}`);
    return;
  }

  reminder.notified = true;

  if (await saveReminders(data)) {
    console.log('✅ 提醒已标记为已完成\n');
    printReminder(reminder);
  }
}

/**
 * 清除已完成提醒
 */
async function clearDone() {
  const data = await loadReminders();
  const doneCount = data.reminders.filter(r => r.notified).length;

  if (doneCount === 0) {
    console.log('📋 没有已完成的提醒\n');
    return;
  }

  data.reminders = data.reminders.filter(r => !r.notified);

  if (await saveReminders(data)) {
    console.log(`✅ 已清除 ${doneCount} 个已完成的提醒\n`);
  }
}

/**
 * 计算剩余天数
 */
function getDaysLeft(dateString) {
  const target = new Date(dateString);
  const now = new Date();
  const diff = target - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * 格式化倒计时
 */
function formatCountdown(daysLeft) {
  if (daysLeft < 0) return '已过期';
  if (daysLeft === 0) return '今天';
  if (daysLeft === 1) return '明天';
  if (daysLeft <= 7) return `${daysLeft}天后`;
  if (daysLeft <= 30) return `${daysLeft}天后`;
  const weeks = Math.floor(daysLeft / 7);
  return `${weeks}周后`;
}

/**
 * 打印提醒详情
 */
function printReminder(reminder) {
  console.log(`ID:       ${reminder.id}`);
  console.log(`名称：     ${reminder.name}`);
  console.log(`项目：     ${reminder.project || '自定义'}`);
  console.log(`日期：     ${reminder.date}`);
  console.log(`类型：     ${reminder.type}`);
  console.log(`地址：     ${reminder.address || '未指定'}`);
  console.log(`状态：     ${reminder.notified ? '已完成' : '待通知'}`);
  console.log(`创建时间：  ${reminder.createdAt}`);
  if (reminder.notes) {
    console.log(`备注：     ${reminder.notes}`);
  }
  console.log('');
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
🪂 AirdropShark - 快照提醒

用法:
  node scripts/reminder.mjs <command> [选项]

命令:
  add      添加提醒
  list     查看所有提醒
  upcoming 查看即将到来的提醒
  remove   删除提醒
  done     标记为已完成
  clear    清除已完成提醒
  help     显示帮助

添加提醒:
  node scripts/reminder.mjs add --project layerzero        # 使用预设日期
  node scripts/reminder.mjs add --project zksync           # 使用预设日期
  node scripts/reminder.mjs add --date 2026-04-15 --name "自定义项目"
  node scripts/reminder.mjs add --project eth --date 2026-04-01 --type "其他"

预设项目快照日期:
  LayerZero:   2026-04-15
  zkSync Era:  2026-03-25
  Starknet:    2026-03-15
  Scroll:      2026-05-01
  Linea:       2026-05-15
  Base:        2026-06-01
  Polyhedra:   2026-04-20
  EigenLayer:  2026-04-10

示例:
  node scripts/reminder.mjs add --project layerzero
  node scripts/reminder.mjs list
  node scripts/reminder.mjs upcoming
  node scripts/reminder.mjs remove 1
  node scripts/reminder.mjs done 1
  node scripts/reminder.mjs clear
`);
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const options = parseArgs(args.slice(1));

  switch (command) {
    case 'add':
      await addReminder(options);
      break;
    case 'list':
      await listReminders(options);
      break;
    case 'upcoming':
      options.upcoming = true;
      await listReminders(options);
      break;
    case 'remove':
      await removeReminder(args[1] || options.id);
      break;
    case 'done':
      await markAsDone(args[1] || options.id);
      break;
    case 'clear':
      await clearDone();
      break;
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    default:
      if (command) {
        console.error(`❌ 未知命令：${command}`);
      }
      showHelp();
  }
}

main().catch(console.error);
