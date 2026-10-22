# Bangla Measure · বাংলা মাপ

**Live app: https://sayemnyc.github.io/bangla-measure/**

A small, offline web app for two everyday Bangladeshi tasks:

1. **Land & area converter**: type `5 kata`, `১০ শতাংশ`, `2 bigha` or `1200 sq ft` and see the
   amount in every common unit at once, with Bangla and English names side by side: বর্গফুট, বর্গগজ,
   বর্গমিটার, অযুতাংশ, শতাংশ/শতক, ছটাক, কাঠা, বিঘা, একর, হেক্টর, গণ্ডা and কানি.
2. **Taka in words**: type an amount and get cheque-style words in Bangla and English using
   lakh and crore, e.g. `1250050` → *বারো লক্ষ পঞ্চাশ হাজার পঞ্চাশ টাকা মাত্র* /
   *Twelve Lakh Fifty Thousand Fifty Taka Only*. It handles paisa and Bangla digits.

3. **Taka ⇄ Dollar**: type in either the Taka or the Dollar field and the other fills in. The
   rate is editable and remembered on your device. Tap **Live rate** to fetch today's
   mid-market rate from [open.er-api.com](https://open.er-api.com); otherwise it uses your
   saved rate (default ৳123.7 per $1, the rate on 21 Oct 2026). Banks and exchange houses charge a different
   rate, so treat the result as an estimate.

Everything is in one file, `index.html`. There's no backend and no framework, so once the
page is open (or saved to your phone) it works offline. The only network request is the
optional **Live rate** button, which asks for the USD rate table and sends nothing you typed.

## Use it

Open `index.html` in any browser. On a phone, save the file and open it, or serve the folder
with any static server.

## Why regional units matter

Most units here are fixed: a decimal is always 435.6 sq ft and a kata is always 720 sq ft.
**Bigha, গণ্ডা (gonda) and কানি (kani) are not.** Their size depends on where you are. In
Chittagong a kani is commonly 40 decimal; in parts of Sylhet it is reported at around 120
decimal. That's three times larger under the same name. A buyer, seller or heir who assumes
the wrong one can be off by a lot of money.

So the app:

- keeps every factor in one commented `CONFIG` object at the top of the script, so anyone
  who knows the local value can fix it in one place;
- has a region selector (Standard, Chittagong, Sylhet);
- tags regional units in the results and shows a warning whenever you enter a regional unit
  or pick a non-standard region;
- marks each regional value it isn't certain of with a `TODO` comment.

**Always confirm regional values against your deed (দলিল) or the local land office before
you rely on them.** Corrections with a source are very welcome.

## Tests

```bash
node test.js
```

This loads the core logic straight out of `index.html` and checks 23 land conversions and
19 taka amounts (in both Bangla and English), 6 Taka ⇄ Dollar checks, plus input validation
and the 1–99 word table.

## License

MIT. See [LICENSE](LICENSE).
