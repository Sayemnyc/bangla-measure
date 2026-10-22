// Run: node test.js
// Loads the <script id="core"> block from index.html and checks conversions + taka words.
const fs = require('fs');
const vm = require('vm');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const core = html.match(/<script id="core">([\s\S]*?)<\/script>/)[1];
const ctx = {};
vm.createContext(ctx);
vm.runInContext(core + '\nObject.assign(globalThis, { CONFIG, parseLand, convertAll, takaWords, parseAmount, bdtToUsd, usdToBdt });', ctx);
const { parseLand, convertAll, takaWords, parseAmount, bdtToUsd, usdToBdt } = ctx;

let pass = 0, fail = 0;
function check(name, got, want) {
  const ok = typeof want === 'number' ? Math.abs(got - want) <= Math.abs(want) * 1e-9 + 1e-9 : got === want;
  ok ? pass++ : fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `\n      got:  ${got}\n      want: ${want}`}`);
}
// land(input, targetUnit, region?) — input must carry its own unit
function land(input, to, region = 'standard') {
  const p = parseLand(input);
  return convertAll(p.value, p.unit, region)[to];
}

console.log('--- Land conversions ---');
check('1 decimal = 435.6 sqft', land('1 decimal', 'sqft'), 435.6);
check('1 acre = 100 decimal', land('1 acre', 'decimal'), 100);
check('1 acre = 43560 sqft', land('1 acre', 'sqft'), 43560);
check('100 অযুতাংশ = 1 decimal', land('100 অযুতাংশ', 'decimal'), 1);
check('5 kata = 3600 sqft', land('5 kata', 'sqft'), 3600);
check('1 kata = 16 ছটাক', land('1 kata', 'chotak'), 16);
check('1 ছটাক = 45 sqft', land('1 ছটাক', 'sqft'), 45);
check('2 bigha = 40 kata', land('2 bigha', 'kata'), 40);
check('1 bigha = 14400 sqft', land('১ বিঘা', 'sqft'), 14400);
check('1200 sq ft = 1.6667 kata', land('1200 sq ft', 'kata'), 1200 / 720);
check('৯ বর্গফুট = 1 sq yd', land('৯ বর্গফুট', 'sqyd'), 1);
check('1 sqm = 10.7639 sqft', land('1 sqm', 'sqft'), 10.7639);
check('1 hectare = 10000 sqm', land('1 hectare', 'sqm'), 10000);
check('১০ শতাংশ = 4356 sqft', land('১০ শতাংশ', 'sqft'), 4356);
check('1 hectare ≈ 2.47105 acre', land('1 ha', 'acre'), 107639 / 43560);
check('1 kata ≈ 1.6529 decimal', land('1 katha', 'decimal'), 720 / 435.6);
check('1,000 sq ft parses commas', land('1,000 sqft', 'sqft'), 1000);
check('Chittagong: 1 kani = 40 decimal', land('1 kani', 'decimal', 'chittagong'), 40);
check('Chittagong: 1 kani = 20 gonda', land('1 কানি', 'gonda', 'chittagong'), 20);
check('Sylhet: 1 kani = 120 decimal', land('1 kani', 'decimal', 'sylhet'), 120);
check('Standard: 1 kani = 20 gonda', land('1 kani', 'gonda'), 20);
check('bare number parses with null unit', JSON.stringify(parseLand('২.৫')), '{"value":2.5,"unit":null}');
check('unknown unit rejected', parseLand('5 furlong'), null);

console.log('--- Taka in words ---');
const T = [
  [1250050, 'বারো লক্ষ পঞ্চাশ হাজার পঞ্চাশ টাকা মাত্র', 'Twelve Lakh Fifty Thousand Fifty Taka Only'],
  [0, 'শূন্য টাকা মাত্র', 'Zero Taka Only'],
  [1, 'এক টাকা মাত্র', 'One Taka Only'],
  [15, 'পনেরো টাকা মাত্র', 'Fifteen Taka Only'],
  [99, 'নিরানব্বই টাকা মাত্র', 'Ninety Nine Taka Only'],
  [100, 'একশত টাকা মাত্র', 'One Hundred Taka Only'],
  [101, 'একশত এক টাকা মাত্র', 'One Hundred One Taka Only'],
  [575, 'পাঁচশত পঁচাত্তর টাকা মাত্র', 'Five Hundred Seventy Five Taka Only'],
  [1000, 'এক হাজার টাকা মাত্র', 'One Thousand Taka Only'],
  [21345, 'একুশ হাজার তিনশত পঁয়তাল্লিশ টাকা মাত্র', 'Twenty One Thousand Three Hundred Forty Five Taka Only'],
  [100000, 'এক লক্ষ টাকা মাত্র', 'One Lakh Taka Only'],
  [10000000, 'এক কোটি টাকা মাত্র', 'One Crore Taka Only'],
  [987654321, 'আটানব্বই কোটি ছিয়াত্তর লক্ষ চুয়ান্ন হাজার তিনশত একুশ টাকা মাত্র',
    'Ninety Eight Crore Seventy Six Lakh Fifty Four Thousand Three Hundred Twenty One Taka Only'],
  ['1500000000', 'একশত পঞ্চাশ কোটি টাকা মাত্র', 'One Hundred Fifty Crore Taka Only'],
  ['১২৫০০৫০', 'বারো লক্ষ পঞ্চাশ হাজার পঞ্চাশ টাকা মাত্র', 'Twelve Lakh Fifty Thousand Fifty Taka Only'],
  ['1,250.75', 'এক হাজার দুইশত পঞ্চাশ টাকা পঁচাত্তর পয়সা মাত্র', 'One Thousand Two Hundred Fifty Taka and Seventy Five Paisa Only'],
  ['0.50', 'পঞ্চাশ পয়সা মাত্র', 'Fifty Paisa Only'],
  ['৳ ৪৪.০৫', 'চুয়াল্লিশ টাকা পাঁচ পয়সা মাত্র', 'Forty Four Taka and Five Paisa Only'],
  ['9.999', 'দশ টাকা মাত্র', 'Ten Taka Only'],
];
for (const [n, bn, en] of T) {
  const w = takaWords(n);
  check(`${n} (bn)`, w && w.bn, bn);
  check(`${n} (en)`, w && w.en, en);
}
check('invalid input rejected', takaWords('abc'), null);
check('negative rejected', takaWords('-5'), null);

console.log('--- Taka ⇄ Dollar ---');
check('12,200 BDT @122 = 100 USD', bdtToUsd(parseAmount('12,200'), 122), 100);
check('100 USD @122 = 12200 BDT', usdToBdt(parseAmount('$ 100'), 122), 12200);
check('১০০০ টাকা @122 = 8.2 USD', bdtToUsd(parseAmount('১০০০ টাকা'), 122), 8.2);
check('2.5 USD @121.75 = 304.38 BDT', usdToBdt(parseAmount('2.5'), 121.75), 304.38);
check('৳ ৫০০.৫ parses', parseAmount('৳ ৫০০.৫'), 500.5);
check('bad amount rejected', parseAmount('12a'), null);

// The 99-word table must be complete and unique.
const words = vm.runInContext('BN_1_99', ctx);
check('BN_1_99 has 99 words', words.slice(1).filter(Boolean).length, 99);
check('BN_1_99 words unique', new Set(words.slice(1)).size, 99);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
