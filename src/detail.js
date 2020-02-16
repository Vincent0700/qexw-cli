require('colors');
const Table = require('cli-table');
const log = require('./log');
const request = require('./request');

Date.prototype.format = function(fmt) {
  var o = {
    'M+': this.getMonth() + 1, // month
    'd+': this.getDate(), // day
    'h+': this.getHours(), // hour
    'm+': this.getMinutes(), // minute
    's+': this.getSeconds(), // second
    'q+': Math.floor((this.getMonth() + 3) / 3), //season
    S: this.getMilliseconds() // millisecond
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
  return fmt;
};

async function detail(id) {
  const URL_VPSMANAGE = `https://www.qexw.com/clientarea.php?action=productdetails&id=${id}&api=json&act=vpsmanage&stats=1&svs=`;
  const URL_BANDWIDTH = `https://www.qexw.com/clientarea.php?action=productdetails&id=${id}&api=json&act=bandwidth`;
  const [data, data1] = await Promise.all([request.post(URL_VPSMANAGE), request.post(URL_BANDWIDTH)]);

  if (typeof data === 'string' || data1 === 'string') {
    log(`Cannot find product detail of [${id}]`, log.TYPE.ERROR);
    return;
  }

  // basic info
  const info = data.info;
  const vps = info.vps;
  const ips = info.ip.join('\n');
  const status = info.status === 1 ? 'online'.brightGreen : 'offline'.brightRed;
  const _ram = ((2.0 * vps.ram) / 1024).toFixed() / 2 + ' G';
  const space = vps.space + ' G';
  const netspeed = vps.network_speed / 128 + ' Mbps';

  const basicTable = new Table({
    colWidths: [11, 25, 11, 25]
  });

  basicTable.push(['uuid'.brightCyan, vps.uuid, 'hostname'.brightCyan, vps.hostname]);
  basicTable.push(['ips'.brightCyan, ips, 'status'.brightCyan, status]);
  basicTable.push(['os'.brightCyan, vps.os_name, 'virt'.brightCyan, vps.virt]);
  basicTable.push(['cores'.brightCyan, vps.cores, 'ram'.brightCyan, _ram]);
  basicTable.push(['space'.brightCyan, space, 'netspeed'.brightCyan, netspeed]);

  console.log('\n# Basic Info'.bold);
  console.log(basicTable.toString());

  // usage
  const cpu_limit = info.cpu.limit / 1024.0;
  const cpu_used = info.cpu.used / 1024.0;
  const cpu_usage = info.cpu.percent + '%';
  const cpu = `${cpu_used.toFixed(1)}G / ${cpu_limit.toFixed(1)}G`;
  const ram_limit = info.ram.limit / 1024.0;
  const ram_used = info.ram.used / 1024.0;
  const ram_usage = info.ram.percent + '%';
  const ram = `${ram_used.toFixed(1)}G / ${(ram_limit * 2).toFixed() / 2}G`;
  const disk_limit = info.disk.limit / 1024.0;
  const disk_used = info.disk.used / 1024.0;
  const disk_usage = info.disk.percent + '%';
  const disk = `${disk_used.toFixed(1)}G / ${disk_limit.toFixed()}G`;
  const bandwidth_limit = info.bandwidth.limit / 1024.0 / 1024.0;
  const bandwidth_used = info.bandwidth.used / 1024.0 / 1024.0;
  const bandwidth_usage = info.bandwidth.percent + '%';
  const bandwidth = `${bandwidth_used.toFixed(1)}T / ${bandwidth_limit.toFixed(1)}T`;

  const usageTable = new Table({
    colWidths: [11, 15, 9, 11, 15, 9]
  });

  usageTable.push(['cpu'.brightCyan, cpu, cpu_usage, 'ram'.brightCyan, ram, ram_usage]);
  usageTable.push(['disk'.brightCyan, disk, disk_usage, 'bandwidth'.brightCyan, bandwidth, bandwidth_usage]);

  console.log('\n# Usage Info'.bold);
  console.log(usageTable.toString());

  // payment
  const match = /^([^<]+)<br>([\s\S]+)$/.exec(data1.month.mth_txt);
  if (match.length < 3) return;
  const next_due_date = new Date(match[2]);
  const next_due = new Date(match[2]).format('yyyy-MM-dd');
  let remaining = Math.ceil((next_due_date.getTime() - Date.now()) / 86400000);
  remaining = remaining >= 0 ? remaining : 0;
  remaining += ' days';

  const paymentTable = new Table({
    colWidths: [11, 25, 11, 25]
  });

  paymentTable.push(['next_due'.brightCyan, next_due, 'remaining'.brightCyan, remaining]);

  console.log('\n# Payment Info'.bold);
  console.log(paymentTable.toString());
}

module.exports = detail;
