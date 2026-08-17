const puppeteer = require('puppeteer-core');
const chalk = require('chalk');
const gradient = require('gradient-string');
const figlet = require('figlet');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.clear();
console.log(gradient.passion(figlet.textSync('REPORT WA', { horizontalLayout: 'full' })));
console.log(chalk.cyan.bold('\n=== Yoruka - Auto Report Engine ===\n'));

rl.question(chalk.yellow('📱 Nomor target (62xxx): '), async (target) => {
  if (!target.startsWith('62')) target = '62' + target;
  rl.close();

  console.log(chalk.green(`✅ Target: ${target}`));
  console.log(chalk.magenta('🚀 Memulai...\n'));

  const browser = await puppeteer.launch({
    executablePath: '/data/data/com.termux/files/usr/bin/chromium',
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://web.whatsapp.com');
  console.log(chalk.blue('📷 Scan QR sekarang di HP...'));
  await page.waitForSelector('canvas', { timeout: 120000 });
  console.log(chalk.green.bold('✅ QR berhasil! Memulai report...\n'));

  let total = 0, ok = 0, fail = 0;

  while (true) {
    try {
      total++;
      console.log(chalk.cyan(`[${total}] ➜ Buka chat & report...`));

      await page.goto(`https://web.whatsapp.com/send?phone=${target}`);
      await page.waitForSelector('div[contenteditable="true"]', { timeout: 15000 });

      const header = await page.waitForSelector('header div[role="button"]', { timeout: 10000 });
      await header.click();
      await page.waitForTimeout(1000);

      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(500);

      const reportBtn = await page.$x(`//div[contains(text(), 'Laporkan')]`);
      if (reportBtn.length > 0) {
        await reportBtn[0].click();
        await page.waitForTimeout(1000);
        const confirmBtn = await page.$x(`//div[contains(text(), 'Laporkan')]`);
        if (confirmBtn.length > 0) {
          await confirmBtn[0].click();
          ok++;
          console.log(chalk.green(`✅ BERHASIL #${total}`));
        } else {
          fail++;
          console.log(chalk.red(`❌ GAGAL konfirmasi #${total}`));
        }
      } else {
        fail++;
        console.log(chalk.red(`❌ Tombol Report tidak ada #${total}`));
      }

      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);

    } catch (err) {
      fail++;
      console.log(chalk.red(`❌ ERROR #${total}`));
      await page.goto('https://web.whatsapp.com');
      await page.waitForTimeout(3000);
    }

    const bar = '█'.repeat(Math.min(ok, 30)) + '░'.repeat(Math.max(0, 30 - ok));
    console.log(chalk.yellow(`📊 [${bar}] S:${ok} G:${fail}`));
    await page.waitForTimeout(2000 + Math.random() * 2000);
  }
});