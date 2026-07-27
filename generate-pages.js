// Generates satellite folders for mycgttax.co.uk + sitemap.xml
// Core CGT logic mirrors the <script> in index.html — keep both in sync if rates change.
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://mycgttax.co.uk';
const GSC_TAG = 'yxzrVMydqoln2YebYXP_nMZJdN2GDpg9ynLnbgsciu8';

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --brand: #0f766e; --brand-dark: #0b5c56; --brand-light: #e6f6f4;
    --accent: #b91c1c; --success: #16a34a; --success-light: #dcfce7;
    --text: #1a1a2e; --muted: #64748b; --border: #e2e8f0; --radius: 12px;
  }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: var(--text); background: #f8fafc; line-height: 1.6; }
  header { background: linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%); color: white; padding: 48px 20px 80px; text-align: center; }
  header p { color: rgba(255,255,255,0.88); font-size: 1.05rem; margin-top: 10px; max-width: 640px; margin-left: auto; margin-right: auto; }
  h1 { font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 800; letter-spacing: -0.5px; }
  .flag { font-size: 0.85rem; background: rgba(255,255,255,0.15); border-radius: 20px; padding: 4px 14px; display: inline-block; margin-bottom: 16px; letter-spacing: 1px; }
  .tool-card { background: white; border-radius: var(--radius); box-shadow: 0 4px 32px rgba(0,0,0,0.10); margin: -48px auto 40px; max-width: 720px; padding: 36px 32px; position: relative; z-index: 10; }
  .input-group { margin-bottom: 20px; }
  .input-group label { display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px; color: var(--text); }
  .input-group .hint { font-size: 0.78rem; color: var(--muted); margin-bottom: 8px; }
  input[type="number"], select { width: 100%; padding: 10px 14px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 1rem; background: white; }
  input[type="number"]:focus, select:focus { outline: none; border-color: var(--brand); }
  .seg-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .seg-btn { flex: 1; min-width: 100px; padding: 10px 12px; border: 1.5px solid var(--border); border-radius: 8px; background: white; font-size: 0.85rem; font-weight: 600; cursor: pointer; text-align: center; color: var(--text); }
  .seg-btn.active { background: var(--brand); color: white; border-color: var(--brand); }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 500px) { .two-col { grid-template-columns: 1fr; } }
  .checkbox-row { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
  .checkbox-row input { width: auto; }
  .checkbox-row label { font-size: 0.85rem; color: var(--text); font-weight: 600; margin-bottom: 0; }
  .results { background: var(--brand-light); border-radius: var(--radius); padding: 24px; margin-top: 24px; display: none; }
  .results.show { display: block; }
  .result-hero { text-align: center; padding: 12px 0 20px; }
  .result-hero .value { font-size: 2.2rem; font-weight: 800; color: var(--brand); }
  .result-hero .label { font-size: 0.85rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
  .results-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 16px; }
  @media (max-width: 500px) { .results-grid { grid-template-columns: 1fr 1fr; } }
  .result-box { background: white; border-radius: 8px; padding: 12px 10px; text-align: center; }
  .result-box .label { font-size: 0.68rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 4px; }
  .result-box .value { font-size: 1.05rem; font-weight: 700; color: var(--brand); }
  .result-box.accent .value { color: var(--accent); }
  .band-breakdown { background: white; border-radius: 8px; padding: 14px 16px; margin-top: 12px; font-size: 0.85rem; }
  .band-breakdown div { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid var(--border); }
  .band-breakdown div:last-child { border-bottom: none; font-weight: 700; }
  .callout { background: #fff7ed; border: 1.5px solid #fdba74; border-radius: 8px; padding: 12px 14px; margin-top: 14px; font-size: 0.85rem; color: #7c2d12; }
  .btn { background: var(--brand); color: white; border: none; border-radius: 8px; padding: 14px 28px; font-size: 1rem; font-weight: 600; cursor: pointer; width: 100%; margin-top: 8px; transition: background 0.2s; }
  .btn:hover { background: var(--brand-dark); }
  .content { max-width: 760px; margin: 0 auto; padding: 0 20px 60px; }
  h2 { font-size: 1.4rem; font-weight: 700; margin: 40px 0 14px; }
  h3 { font-size: 1.1rem; font-weight: 600; margin: 24px 0 10px; }
  p { color: #374151; margin-bottom: 14px; font-size: 0.95rem; }
  ul { padding-left: 20px; margin-bottom: 14px; }
  li { color: #374151; font-size: 0.95rem; margin-bottom: 6px; }
  .table-wrap { overflow-x: auto; margin: 20px 0; }
  table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
  th { background: var(--brand); color: white; padding: 10px 12px; text-align: left; white-space: nowrap; }
  td { padding: 9px 12px; border-bottom: 1px solid var(--border); white-space: nowrap; }
  tr:nth-child(even) td { background: #f8fafc; }
  .sat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0 40px; }
  @media (max-width: 500px) { .sat-grid { grid-template-columns: 1fr; } }
  .sat-link { display: block; background: white; border: 1.5px solid var(--border); border-radius: 10px; padding: 16px 18px; text-decoration: none; color: var(--text); transition: border-color .15s; }
  .sat-link:hover { border-color: var(--brand); }
  .sat-link .t { font-weight: 700; font-size: 0.95rem; margin-bottom: 3px; }
  .sat-link .d { font-size: 0.8rem; color: var(--muted); }
  .cta-box { background: #111827; color: white; border-radius: var(--radius); padding: 36px 32px; margin: 40px 0; }
  .cta-box h2 { color: white; margin-top: 0; font-size: 1.35rem; }
  .cta-box p { color: rgba(255,255,255,0.88); }
  .cta-box li { color: rgba(255,255,255,0.82) !important; }
  .cta-box ul { color: white; }
  .cta-btn { display: inline-block; background: var(--accent); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 1rem; margin-top: 20px; transition: opacity 0.2s; }
  .cta-btn:hover { opacity: 0.88; }
  .faq { margin: 40px 0; }
  .faq-item { border: 1px solid var(--border); border-radius: 8px; margin-bottom: 10px; overflow: hidden; }
  .faq-q { padding: 16px 20px; font-weight: 600; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-size: 0.95rem; background: white; }
  .faq-q:hover { background: var(--brand-light); }
  .faq-q::after { content: '+'; font-size: 1.2rem; color: var(--brand); flex-shrink: 0; }
  .faq-q.open::after { content: '−'; }
  .faq-a { display: none; padding: 0 20px 16px; font-size: 0.9rem; color: #374151; background: white; }
  .faq-a.show { display: block; }
  footer { background: var(--brand-dark); color: rgba(255,255,255,0.6); text-align: center; padding: 28px 20px; font-size: 0.8rem; }
  footer p { color: #9ca3af; }
  footer a { color: rgba(255,255,255,0.7); }
  @media (max-width: 600px) { .tool-card { margin: -32px 12px 32px; padding: 24px 18px; } }
  .eeat-section { background: white; border: 1px solid var(--border); border-radius: var(--radius); padding: 28px; margin: 32px 0; }
  .eeat-title { font-size: 1.2rem; font-weight: 800; color: var(--text); margin-bottom: 20px; display: flex; align-items: center; gap: 10px; border-bottom: 2px solid var(--brand-light); padding-bottom: 12px; }
  .eeat-title svg { color: var(--brand); flex-shrink: 0; }
  .eeat-grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: 28px; }
  @media (max-width: 640px) { .eeat-grid { grid-template-columns: 1fr; gap: 20px; } }
  .eeat-author-card { display: flex; gap: 14px; align-items: flex-start; }
  .eeat-avatar { width: 50px; height: 50px; border-radius: 50%; background: var(--brand); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 1.1rem; flex-shrink: 0; }
  .eeat-author-info h3 { font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 2px; }
  .eeat-author-subtitle { font-size: 0.76rem; font-weight: 700; color: var(--brand); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 8px; }
  .eeat-author-info p { font-size: 0.85rem; color: var(--muted); line-height: 1.6; }
  .eeat-compliance { display: flex; flex-direction: column; gap: 14px; }
  .eeat-compliance-item { display: flex; gap: 10px; align-items: flex-start; }
  .eeat-compliance-icon { color: var(--brand); flex-shrink: 0; margin-top: 3px; }
  .eeat-compliance-text h4 { font-size: 0.88rem; font-weight: 700; color: var(--text); margin-bottom: 2px; }
  .eeat-compliance-text p { font-size: 0.8rem; color: var(--muted); line-height: 1.5; margin-bottom: 0; }
  .eeat-compliance-text a { color: var(--brand); text-decoration: underline; }
`;

const SATELLITES_NAV = [
  { slug: 'combined-capital-gains-tax-calculator', title: 'Combined CGT Calculator', desc: 'Multiple asset types, one £3,000 allowance' },
  { slug: 'property-capital-gains-tax-calculator', title: 'Property CGT Calculator', desc: '60-day HMRC deadline, buy-to-let' },
  { slug: 'shares-capital-gains-tax-calculator', title: 'Shares CGT Calculator', desc: 'Single-disposal quick estimate' },
  { slug: 'crypto-capital-gains-tax-calculator', title: 'Crypto CGT Calculator', desc: 'Disposals, swaps, Self Assessment' },
  { slug: 'capital-gains-tax-allowance-calculator', title: 'CGT Allowance Calculator', desc: '£3,000 annual exempt amount' },
  { slug: 'how-to-avoid-capital-gains-tax-uk', title: 'How to Reduce CGT Legally', desc: 'ISA, spousal transfer, timing' },
  { slug: 'capital-gains-tax-rates-uk', title: 'CGT Rates & Percentage', desc: 'Full 2026/27 rate reference' }
];

function satGridHtml(excludeSlug) {
  const items = [{ slug: '', title: 'Capital Gains Tax Calculator', desc: 'Main CGT calculator, all asset types' }, ...SATELLITES_NAV]
    .filter(s => s.slug !== excludeSlug);
  return items.map(s => `<a class="sat-link" href="/${s.slug}${s.slug ? '/' : ''}"><div class="t">${s.title}</div><div class="d">${s.desc}</div></a>`).join('\n');
}

// --- CTA snippet families (3 total — see plan: accountant/CGT-return / investment-platform / IFA) ---
// Same affiliate target within a family, but copy is topic-tuned per page — never reuse
// property's 60-day urgency framing on the crypto page (different deadline, different rule).

function ctaAccountant({ deadlineCopy }) {
  return `
<div class="cta-box">
  <h2>Get It Filed Correctly, Not Just Estimated</h2>
  <p>This calculator gives an estimate — actually reporting and paying it correctly is a separate step with its own deadline and paperwork.</p>
  <ul>
    ${deadlineCopy}
    <li><strong>Multiple disposals in one tax year:</strong> ordering and timing disposals across the 5/6 April boundary can materially change what you owe.</li>
    <li><strong>Inherited or gifted assets:</strong> your acquisition cost for CGT purposes isn't always what you think — get the base cost confirmed.</li>
    <li><strong>Business Asset Disposal Relief:</strong> can cut your rate to 18% on qualifying gains, but eligibility rules are strict.</li>
  </ul>
  <p>A fixed-fee online accountant can handle the return and your wider Self Assessment together.</p>
  <a href="#" class="cta-btn" target="_blank" rel="noopener">Compare Online Accountants →</a>
</div>`;
}

const CTA_ACCOUNTANT_PROPERTY = ctaAccountant({
  deadlineCopy: `<li><strong>Sold a second home or buy-to-let:</strong> the 60-day HMRC property CGT return is separate from your normal Self Assessment — miss it and penalties and interest apply automatically, starting from the completion date.</li>`
});

const CTA_ACCOUNTANT_CRYPTO = ctaAccountant({
  deadlineCopy: `<li><strong>Every swap counts as a disposal:</strong> trading one cryptoasset for another is a taxable event under HMRC rules, not just cashing out to GBP — many people under-report without realising it. Crypto gains are declared via Self Assessment, due 31 January, not a 60-day deadline.</li>`
});

const CTA_ACCOUNTANT_COMBINED = ctaAccountant({
  deadlineCopy: `<li><strong>Mixed disposals in one tax year:</strong> a property sale on top of a share sale doesn't just add two bills together — the deadlines differ (60 days for property, 31 January Self Assessment for everything else) and the order gains are set against your allowance and rate bands changes what you owe. Getting the sequencing wrong is a common source of overpayment.</li>`
});

const CTA_INVESTMENT_PLATFORM = `
<div class="cta-box">
  <h2>Shelter Future Gains From CGT Entirely</h2>
  <p>The calculation above is for a gain you've already made. For future gains, the standard mitigation is simple: hold investments inside a Stocks &amp; Shares ISA, where gains are never subject to Capital Gains Tax.</p>
  <ul>
    <li><strong>Sold shares outside a wrapper:</strong> consider a "Bed and ISA" — sell and immediately repurchase the same holding inside an ISA, using this year's £20,000 ISA allowance.</li>
    <li><strong>Building a portfolio from scratch:</strong> route new investments through an ISA or SIPP first, before a general investment account.</li>
    <li><strong>Approaching the £3,000 CGT allowance each year:</strong> moving holdings into an ISA gradually, using each year's allowance, avoids a large taxable disposal later.</li>
  </ul>
  <p>Investment platforms like Hargreaves Lansdown, interactive investor and Trading 212 make ISA transfers and Bed-and-ISA straightforward.</p>
  <a href="#" class="cta-btn" target="_blank" rel="noopener">Compare Investment Platforms →</a>
</div>`;

function ctaIfa({ line }) {
  return `
<div class="cta-box">
  <h2>Get Independent Financial Advice</h2>
  <p>This figure is an estimate — deciding how it fits into your wider finances is a bigger decision worth getting right.</p>
  <ul>
    ${line}
    <li><strong>Multiple allowances to use:</strong> spouses/civil partners each get their own £3,000 CGT allowance — transferring assets between you before disposal can double what's tax-free.</li>
    <li><strong>Large one-off gain:</strong> understand how it interacts with your Income Tax band and other allowances for the year.</li>
  </ul>
  <p>An FCA-regulated independent financial adviser can model your specific numbers — free directories like Unbiased.co.uk match you with a local IFA.</p>
  <a href="#" class="cta-btn" target="_blank" rel="noopener">Find an Independent Financial Adviser →</a>
</div>`;
}

const CTA_IFA_ALLOWANCE = ctaIfa({ line: `<li><strong>Gain close to £3,000:</strong> small timing changes (selling part this tax year, part next) can keep you under the allowance in both years.</li>` });
const CTA_IFA_AVOID = ctaIfa({ line: `<li><strong>Considering a specific relief:</strong> Business Asset Disposal Relief, Gift Hold-Over Relief and loss harvesting all have strict qualifying conditions worth checking before you rely on them.</li>` });
const CTA_IFA_RATES = ctaIfa({ line: `<li><strong>Not sure which band you're in:</strong> your CGT rate depends on your <em>total</em> taxable income for the year, not just the gain — worth modelling before a big disposal.</li>` });

function eeatSection(pageTitle, avatarInitials) {
  return `
  <div class="eeat-section">
    <h2 class="eeat-title">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
      Transparency &amp; Methodology
    </h2>
    <div class="eeat-grid">
      <div class="eeat-author-card">
        <div class="eeat-avatar">${avatarInitials}</div>
        <div class="eeat-author-info">
          <h3>${pageTitle}</h3>
          <div class="eeat-author-subtitle">Independent, Open-Source Estimator</div>
          <p>An independent calculator applying published HMRC CGT rates deterministically — no AI estimate, no official affiliation.</p>
        </div>
      </div>
      <div class="eeat-compliance">
        <div class="eeat-compliance-item">
          <svg class="eeat-compliance-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
          <div class="eeat-compliance-text"><h4>Methodology &amp; Sources</h4><p>Figures are public HMRC rates. For your exact position, use <a href="https://www.gov.uk/capital-gains-tax" target="_blank" rel="noopener">gov.uk/capital-gains-tax</a>.</p></div>
        </div>
        <div class="eeat-compliance-item">
          <svg class="eeat-compliance-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <div class="eeat-compliance-text"><h4>Not Tax or Legal Advice</h4><p>Information only. Consult the <a href="https://www.tax.org.uk/" target="_blank" rel="noopener">Chartered Institute of Taxation</a> or an adviser via the <a href="https://register.fca.org.uk/" target="_blank" rel="noopener">FCA Register</a>.</p></div>
        </div>
        <div class="eeat-compliance-item">
          <svg class="eeat-compliance-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
          <div class="eeat-compliance-text"><h4>Open Source</h4><p>Formulas are public. Inspect on <a href="https://github.com/sadiyaqeen92639572-cloud/capital-gains-tax-calculator-uk" target="_blank" rel="noopener">GitHub</a>.</p></div>
        </div>
      </div>
    </div>
  </div>`;
}

function formulaSection({ source, constantsRows, formulaLines, note }) {
  return `
  <h2>How this calculator works — Formulas &amp; Method</h2>
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:28px 28px 20px;margin:0 0 40px;">
    <p style="color:#64748b;font-size:0.82rem;text-transform:uppercase;letter-spacing:.5px;font-weight:600;">${source}</p>
    <h3>Constants used</h3>
    <table><tr><th>Constant</th><th>Value</th><th>Source</th></tr>
      ${constantsRows}
    </table>
    <h3>Formulas</h3>
    <div style="background:#1e3a5f;color:#e2e8f0;border-radius:8px;padding:18px 20px;font-family:'Courier New',monospace;font-size:0.83rem;line-height:2;">
      ${formulaLines}
    </div>
    <p style="font-size:0.78rem;color:#94a3b8;margin:10px 0 0;">${note}</p>
  </div>`;
}

function faqHtml(faqs) {
  return `<div class="faq"><h2>Frequently Asked Questions</h2>` +
    faqs.map(f => `<div class="faq-item"><div class="faq-q" onclick="toggleFaq(this)">${f.q}</div><div class="faq-a">${f.a}</div></div>`).join('\n') +
    `</div>`;
}

function faqJsonLd(faqs) {
  return faqs.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a.replace(/<[^>]+>/g, '') } }));
}

function pageShell({ slug, title, metaTitle, metaDesc, h1, intro, toolHtml, toolJs, extraContent, formulaBox, faqs, ctaSnippet, avatarInitials }) {
  const canonical = `${SITE_URL}/${slug}/`;
  const gscMeta = GSC_TAG ? `<meta name="google-site-verification" content="${GSC_TAG}" />` : `<!-- GSC verification tag: pending, see generate-pages.js GSC_TAG comment -->`;
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${metaTitle}</title>
<meta name="description" content="${metaDesc}">
<link rel="canonical" href="${canonical}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" href="/favicon.png">
<meta property="og:title" content="${metaTitle}">
<meta property="og:description" content="${metaDesc}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE_URL}/og-image.svg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${SITE_URL}/og-image.svg">
${gscMeta}

<script type="application/ld+json">
${JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebApplication", "name": title, "url": canonical, "description": metaDesc, "applicationCategory": "FinanceApplication", "operatingSystem": "Any", "inLanguage": "en-GB", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "GBP" }, "areaServed": { "@type": "Country", "name": "United Kingdom" } },
    { "@type": "FAQPage", "mainEntity": faqJsonLd(faqs) },
    { "@type": "BreadcrumbList", "itemListElement": [ { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL + "/" }, { "@type": "ListItem", "position": 2, "name": title, "item": canonical } ] }
  ]
}, null, 2)}
</script>

<style>${CSS}</style>
</head>
<body>

<header>
  <div class="flag">🇬🇧 UK Capital Gains Tax · 2026/27 Rates</div>
  <h1>${h1}</h1>
  <p>${intro}</p>
</header>

<div class="tool-card">
${toolHtml}
</div>

<div class="content">
  <h2>Explore More Capital Gains Tax Calculators</h2>
  <div class="sat-grid">${satGridHtml(slug)}</div>

  ${extraContent}

  ${formulaBox}

  ${ctaSnippet}

  ${eeatSection(title, avatarInitials)}

  ${faqHtml(faqs)}
</div>

<footer>
  <p>Information only — not tax or legal advice. Data based on 2026/27 rates.<br>
  Always verify at <a href="https://www.gov.uk/capital-gains-tax" target="_blank" rel="noopener">gov.uk/capital-gains-tax</a>.</p>
</footer>

<script>
function fmt(n) { return '£' + Math.round(n).toLocaleString('en-GB'); }
function toggleFaq(el) { el.classList.toggle('open'); el.nextElementSibling.classList.toggle('show'); }
const EXEMPT = 3000, BASIC_LIMIT = 50270;
function cgtOnGain(gain, income, badr) {
  const taxableGain = Math.max(0, gain - EXEMPT);
  if (badr) return { taxableGain, atBasic: taxableGain, atHigher: 0, total: taxableGain * 0.18 };
  const basicBandRemaining = Math.max(0, BASIC_LIMIT - income);
  const atBasic = Math.min(taxableGain, basicBandRemaining);
  const atHigher = taxableGain - atBasic;
  return { taxableGain, atBasic, atHigher, total: atBasic * 0.18 + atHigher * 0.24 };
}
${toolJs}
</script>

</body>
</html>`;
}

// ============ SATELLITE DEFINITIONS ============

const PAGES = [];

// 0. Combined multi-asset CGT calculator — flagship differentiator.
// No competitor found (incl. ukcapitalgainstaxcalculator.co.uk) models the
// single £3,000 annual exempt amount as genuinely shared across disposal
// types in the same tax year — they calculate property/shares/crypto in
// silos. This models it the way HMRC actually assesses it: aggregate net
// gains across all disposals, then allocate the one exempt amount and the
// basic/higher rate bands across the combined total.
PAGES.push({
  slug: 'combined-capital-gains-tax-calculator',
  title: 'Combined Capital Gains Tax Calculator',
  metaTitle: 'Combined CGT Calculator UK 2026/27 — Multiple Asset Types, One Allowance',
  metaDesc: 'Sold property AND shares (or crypto) in the same tax year? The only UK CGT calculator that combines multiple disposal types under one shared £3,000 allowance, the way HMRC actually assesses it.',
  h1: 'Combined Capital Gains Tax Calculator',
  intro: 'Sold more than one type of asset this tax year? Your £3,000 allowance is shared across all of them — this calculator gets that right.',
  avatarInitials: 'CB',
  ctaSnippet: CTA_ACCOUNTANT_COMBINED,
  toolHtml: `
  <div id="disposalRows"></div>
  <button type="button" class="btn" style="background:white;color:#0f766e;border:1.5px solid #0f766e;margin-bottom:20px;" onclick="addRow()">+ Add Another Disposal</button>
  <div class="input-group"><label>Your Other Taxable Income (£)</label><div class="hint">Salary, profit etc. for the tax year — determines your rate band</div><input type="number" id="income" min="0" step="500" value="35000"></div>
  <button class="btn" onclick="calculate()">Calculate Combined CGT →</button>
  <div class="results" id="results">
    <div class="result-hero"><div class="value" id="r-total">—</div><div class="label">Total Estimated CGT (All Disposals)</div></div>
    <div class="band-breakdown">
      <div><span>Total net gain (all disposals)</span><span id="r-netgain">—</span></div>
      <div><span>£3,000 allowance used</span><span id="r-exempt">—</span></div>
      <div><span>Taxed at 18%</span><span id="r-basic">—</span></div>
      <div><span>Taxed at 24%</span><span id="r-higher">—</span></div>
      <div><span>Taxed at BADR 18%</span><span id="r-badr">—</span></div>
    </div>
    <div class="callout"><strong>Why this differs from adding up separate calculators:</strong> you only get <strong>one</strong> £3,000 annual exempt amount, shared across every disposal in the tax year — not one per asset type. This calculator applies it, then fills your remaining basic rate band, across the combined total, the way HMRC actually assesses your Self Assessment CGT summary — not as isolated per-asset totals.</div>
  </div>`,
  toolJs: `
let rowCount = 0;
function rowHtml(id) {
  return \`<div class="two-col" id="row-\${id}" style="align-items:end;margin-bottom:10px;">
    <div class="input-group" style="margin-bottom:0;">
      <label>Asset Type</label>
      <select id="type-\${id}">
        <option value="property">Property</option>
        <option value="shares">Shares &amp; Funds</option>
        <option value="crypto">Crypto</option>
        <option value="other">Other / Business Asset</option>
      </select>
    </div>
    <div class="input-group" style="margin-bottom:0;">
      <label>Gain (£) <span style="font-weight:400;color:var(--muted);">— negative for a loss</span></label>
      <input type="number" id="gain-\${id}" step="500" value="0">
    </div>
  </div>
  <div class="checkbox-row" id="badrrow-\${id}">
    <input type="checkbox" id="badr-\${id}">
    <label for="badr-\${id}">Business Asset Disposal Relief applies to this disposal</label>
  </div>\`;
}
function addRow(){
  rowCount++;
  const div=document.createElement('div');
  div.innerHTML=rowHtml(rowCount);
  document.getElementById('disposalRows').appendChild(div);
}
addRow(); addRow();
document.getElementById('disposalRows').children[0].querySelector('input').value=60000;
document.getElementById('disposalRows').children[1].querySelector('input').value=8000;

function calculate(){
  const income=parseFloat(document.getElementById('income').value)||0;
  let gainsNonBadr=0, gainsBadr=0;
  for(let i=1;i<=rowCount;i++){
    const gainEl=document.getElementById('gain-'+i);
    if(!gainEl) continue;
    const gain=parseFloat(gainEl.value)||0;
    const badr=document.getElementById('badr-'+i).checked;
    if(badr) gainsBadr+=gain; else gainsNonBadr+=gain;
  }
  gainsNonBadr=Math.max(0,gainsNonBadr);
  gainsBadr=Math.max(0,gainsBadr);
  const netGain=gainsNonBadr+gainsBadr;

  // Allocate the single £3,000 exempt amount where it saves the most tax:
  // against standard-rate gains (18/24%) before BADR gains (already 18% flat).
  const exemptForNonBadr=Math.min(EXEMPT,gainsNonBadr);
  const exemptRemaining=EXEMPT-exemptForNonBadr;
  const exemptForBadr=Math.min(exemptRemaining,gainsBadr);
  const exemptUsed=exemptForNonBadr+exemptForBadr;

  const taxableNonBadr=gainsNonBadr-exemptForNonBadr;
  const taxableBadr=gainsBadr-exemptForBadr;

  const basicBandRemaining=Math.max(0,BASIC_LIMIT-income);
  const atBasic=Math.min(taxableNonBadr,basicBandRemaining);
  const atHigher=taxableNonBadr-atBasic;
  const badrTax=taxableBadr*0.18;
  const total=atBasic*0.18+atHigher*0.24+badrTax;

  document.getElementById('r-total').textContent=fmt(total);
  document.getElementById('r-netgain').textContent=fmt(netGain);
  document.getElementById('r-exempt').textContent=fmt(exemptUsed);
  document.getElementById('r-basic').textContent=fmt(atBasic*0.18);
  document.getElementById('r-higher').textContent=fmt(atHigher*0.24);
  document.getElementById('r-badr').textContent=fmt(badrTax);
  document.getElementById('results').classList.add('show');
}`,
  extraContent: `
  <h2>Why Combining Matters</h2>
  <p>Every CGT calculator checked when building this site — including dedicated property, shares and crypto tools — calculates each asset type in isolation. That's wrong for anyone who disposed of more than one type of asset in the same tax year: the £3,000 annual exempt amount is <strong>a single allowance per person, per tax year</strong>, not one per asset type. Run a property sale through one calculator and a share sale through another, and you'll double-count the allowance and get a wrong total.</p>
  <h3>How HMRC actually assesses combined gains</h3>
  <p>On your Self Assessment CGT summary, you report <strong>all</strong> chargeable gains for the year together. HMRC's guidance allows the annual exempt amount and remaining basic rate band to be set against whichever gains reduce your tax bill the most — in practice, that means applying the allowance to gains taxed at the standard 18%/24% rates before gains already benefiting from a lower flat rate (such as Business Asset Disposal Relief), since the allowance saves more tax there.</p>
  <div class="table-wrap"><table><tr><th>Step</th><th>What happens</th></tr>
  <tr><td>1</td><td>Sum all chargeable gains (and losses) across every disposal in the tax year</td></tr>
  <tr><td>2</td><td>Apply the single £3,000 exempt amount — to standard-rate gains first, then BADR gains if any allowance remains</td></tr>
  <tr><td>3</td><td>Fill your remaining basic rate Income Tax band with standard-rate taxable gains at 18%, the rest at 24%</td></tr>
  <tr><td>4</td><td>Tax any remaining BADR-qualifying gain at a flat 18%</td></tr>
  </table></div>
  <p>This is a simplified model of that ordering — it doesn't cover carried interest, Investors' Relief, or gains eligible for multiple different reliefs at once. For anything beyond a straightforward mix of property/shares/crypto/business gains, confirm the exact ordering with an accountant.</p>`,
  formulaBox: formulaSection({
    source: 'Source: gov.uk/capital-gains-tax/rates, HS284 Shares and Capital Gains Tax (allowance/band ordering) · Deterministic calculation — no AI, no arbitrary estimation',
    constantsRows: `
      <tr><td>Annual exempt amount</td><td>£3,000 (single, shared across all disposals)</td><td>gov.uk/capital-gains-tax/rates, 2026/27</td></tr>
      <tr><td>Basic rate band upper limit</td><td>£50,270 taxable income (single, shared)</td><td>gov.uk Income Tax rates 2026/27</td></tr>
      <tr><td>CGT basic / higher rate</td><td>18% / 24%</td><td>gov.uk/capital-gains-tax/rates</td></tr>
      <tr><td>BADR rate</td><td>18%, £1m lifetime limit</td><td>gov.uk/business-asset-disposal-relief</td></tr>`,
    formulaLines: `
      <span style="color:#86efac;">— Aggregate across all disposals —</span><br>
      <span style="color:#7dd3fc;">gains_nonbadr</span> = sum of all non-BADR disposal gains/losses, floored at 0<br>
      <span style="color:#7dd3fc;">gains_badr</span> = sum of all BADR-qualifying disposal gains, floored at 0<br><br>
      <span style="color:#86efac;">— Allocate ONE shared £3,000 allowance —</span><br>
      <span style="color:#7dd3fc;">exempt_nonbadr</span> = min(£3,000, gains_nonbadr) <span style="color:#94a3b8;">(applied first — saves more tax)</span><br>
      <span style="color:#7dd3fc;">exempt_badr</span> = min(£3,000 − exempt_nonbadr, gains_badr)<br><br>
      <span style="color:#86efac;">— Allocate ONE shared basic-rate band —</span><br>
      <span style="color:#7dd3fc;">basic_band_remaining</span> = max(0, £50,270 − other_taxable_income)<br>
      <span style="color:#7dd3fc;">at_18pct</span> = min(gains_nonbadr − exempt_nonbadr, basic_band_remaining)<br>
      <span style="color:#7dd3fc;">at_24pct</span> = (gains_nonbadr − exempt_nonbadr) − at_18pct<br>
      <span style="color:#7dd3fc;">cgt</span> = at_18pct × 18% + at_24pct × 24% + (gains_badr − exempt_badr) × 18%`,
    note: 'Deterministic calculation based on official 2026/27 bands. Simplified model of HMRC\'s "most beneficial" ordering rule — doesn\'t cover carried interest, Investors\' Relief, or losses carried forward from prior years; always confirm your own position with HMRC or a qualified adviser.'
  }),
  faqs: [
    { q: 'Do I get a separate £3,000 CGT allowance for each type of asset I sell?', a: 'No — the £3,000 annual exempt amount is a single allowance per person, per tax year, shared across all your chargeable gains combined (property, shares, crypto, other assets). Using a separate calculator for each asset type and adding the results will overstate your true allowance.' },
    { q: 'I sold a rental property and some shares in the same tax year — how is my CGT worked out?', a: 'HMRC combines both gains, deducts the single £3,000 allowance (applied where it saves the most tax), then taxes the remainder at 18% within your remaining basic rate Income Tax band and 24% above it — both gains together, not as two separate calculations.' },
    { q: 'Does the order I use my allowance in matter?', a: 'Yes — HMRC lets you (in effect) apply the exempt amount and basic rate band in the order that minimises your tax. This calculator applies the allowance to standard-rate gains before Business Asset Disposal Relief gains, since BADR gains are already taxed at a lower flat rate and benefit less from the allowance.' },
    { q: 'What if I have a loss on one disposal and a gain on another?', a: 'Losses in the same tax year are set against gains before the annual exempt amount is applied, reducing your total chargeable gain. Enter a negative figure for any disposal that resulted in a loss.' }
  ]
});

// 1. Property CGT calculator — 60-day deadline hook
PAGES.push({
  slug: 'property-capital-gains-tax-calculator',
  title: 'Property Capital Gains Tax Calculator',
  metaTitle: 'Capital Gains Tax on Property Calculator UK 2026/27 — 60-Day Deadline',
  metaDesc: 'Free property CGT calculator for UK second homes and buy-to-let. Instant 2026/27 estimate, plus the 60-day HMRC reporting deadline explained.',
  h1: 'Property Capital Gains Tax Calculator',
  intro: 'Sold a second home or buy-to-let? Estimate your CGT — and don\'t miss the 60-day HMRC reporting deadline.',
  avatarInitials: 'PR',
  ctaSnippet: CTA_ACCOUNTANT_PROPERTY,
  toolHtml: `
  <div class="two-col">
    <div class="input-group"><label>Property Gain (£)</label><div class="hint">Sale price minus purchase price, buying/selling costs and improvements</div><input type="number" id="gain" min="0" step="1000" value="60000"></div>
    <div class="input-group"><label>Your Other Taxable Income (£)</label><input type="number" id="income" min="0" step="500" value="35000"></div>
  </div>
  <button class="btn" onclick="calculate()">Calculate Property CGT →</button>
  <div class="results" id="results">
    <div class="result-hero"><div class="value" id="r-total">—</div><div class="label">Estimated CGT Owed</div></div>
    <div class="band-breakdown">
      <div><span>Annual exempt amount used</span><span id="r-exempt">—</span></div>
      <div><span>Taxable gain</span><span id="r-taxable">—</span></div>
      <div><span>Taxed at 18%</span><span id="r-basic">—</span></div>
      <div><span>Taxed at 24%</span><span id="r-higher">—</span></div>
    </div>
    <div class="callout"><strong>60-day deadline:</strong> if this wasn't your main home (or Private Residence Relief doesn't fully apply), you must report and pay via HMRC's CGT on UK property account within <strong>60 days of completion</strong> — not your normal Self Assessment deadline.</div>
  </div>`,
  toolJs: `
function calculate(){
  const gain=parseFloat(document.getElementById('gain').value)||0;
  const income=parseFloat(document.getElementById('income').value)||0;
  const r=cgtOnGain(gain,income,false);
  document.getElementById('r-total').textContent=fmt(r.total);
  document.getElementById('r-exempt').textContent=fmt(Math.min(gain,EXEMPT));
  document.getElementById('r-taxable').textContent=fmt(r.taxableGain);
  document.getElementById('r-basic').textContent=fmt(r.atBasic*0.18);
  document.getElementById('r-higher').textContent=fmt(r.atHigher*0.24);
  document.getElementById('results').classList.add('show');
}`,
  extraContent: `
  <h2>The 60-Day Rule for Property CGT</h2>
  <p>Since 27 October 2021, anyone selling UK residential property that doesn't qualify for full Private Residence Relief must report the gain and pay an estimate of the CGT due within <strong>60 days of completion</strong> — using HMRC's dedicated CGT on UK property online service, separately from a normal Self Assessment return. The clock starts on the completion date, not exchange of contracts.</p>
  <div class="table-wrap"><table><tr><th>Scenario</th><th>60-day rule applies?</th></tr>
  <tr><td>Selling your only/main home (full PRR)</td><td>No — usually no CGT due</td></tr>
  <tr><td>Second home or holiday home</td><td>Yes</td></tr>
  <tr><td>Buy-to-let / rental property</td><td>Yes</td></tr>
  <tr><td>Inherited property you didn't live in</td><td>Yes</td></tr>
  </table></div>
  <p>Missing the deadline triggers automatic late-filing penalties and interest, even if you eventually pay the correct amount via Self Assessment later.</p>`,
  formulaBox: formulaSection({
    source: 'Source: gov.uk/capital-gains-tax/rates, gov.uk/report-and-pay-your-capital-gains-tax · Deterministic calculation — no AI, no arbitrary estimation',
    constantsRows: `
      <tr><td>Annual exempt amount</td><td>£3,000</td><td>gov.uk/capital-gains-tax/rates, 2026/27</td></tr>
      <tr><td>Basic rate band upper limit</td><td>£50,270 taxable income</td><td>gov.uk Income Tax rates 2026/27</td></tr>
      <tr><td>CGT basic / higher rate</td><td>18% / 24%</td><td>gov.uk/capital-gains-tax/rates</td></tr>
      <tr><td>Property reporting deadline</td><td>60 days from completion</td><td>gov.uk/report-and-pay-your-capital-gains-tax (disposals on/after 27 Oct 2021)</td></tr>`,
    formulaLines: `
      <span style="color:#86efac;">— Taxable gain —</span><br>
      <span style="color:#7dd3fc;">taxable_gain</span> = max(0, gain − £3,000)<br><br>
      <span style="color:#86efac;">— Rate band —</span><br>
      <span style="color:#7dd3fc;">basic_band_remaining</span> = max(0, £50,270 − other_taxable_income)<br>
      <span style="color:#7dd3fc;">at_18pct</span> = min(taxable_gain, basic_band_remaining)<br>
      <span style="color:#7dd3fc;">at_24pct</span> = taxable_gain − at_18pct<br>
      <span style="color:#7dd3fc;">cgt</span> = at_18pct × 18% + at_24pct × 24%`,
    note: 'Deterministic calculation based on official 2026/27 bands. Doesn\'t account for Private Residence Relief apportionment on partial-letting scenarios; always confirm your own position with HMRC or a qualified adviser.'
  }),
  faqs: [
    { q: 'How is Capital Gains Tax on property calculated?', a: 'Your gain (sale price minus purchase price, buying/selling costs and qualifying improvements) has the £3,000 annual exempt amount deducted, then the remainder is taxed at 18% within your remaining basic rate band and 24% above it.' },
    { q: 'What is the 60-day CGT property deadline?', a: 'You must report and pay any CGT due on a UK residential property disposal within 60 days of the completion date, using HMRC\'s CGT on UK property account — this applies to disposals completed on or after 27 October 2021.' },
    { q: 'Do I pay CGT on my main home?', a: 'Usually not — Private Residence Relief exempts your only or main home from CGT. The 60-day rule and this calculator are aimed at second homes, buy-to-let and other property that doesn\'t qualify for full relief.' },
    { q: 'What counts as an allowable cost against property CGT?', a: 'Purchase price, Stamp Duty paid on purchase, estate agent and legal fees on both purchase and sale, and the cost of capital improvements (not routine maintenance or decorating) can all reduce your taxable gain.' }
  ]
});

// 2. Shares CGT calculator — deliberately single-disposal scope
PAGES.push({
  slug: 'shares-capital-gains-tax-calculator',
  title: 'Shares Capital Gains Tax Calculator',
  metaTitle: 'Capital Gains Tax on Shares Calculator UK 2026/27 — Quick Estimate',
  metaDesc: 'Free shares CGT calculator for a single disposal. Instant 2026/27 estimate using the £3,000 annual exempt amount.',
  h1: 'Shares Capital Gains Tax Calculator',
  intro: 'Sold shares or funds once this tax year? Get a quick CGT estimate.',
  avatarInitials: 'SH',
  ctaSnippet: CTA_INVESTMENT_PLATFORM,
  toolHtml: `
  <div class="two-col">
    <div class="input-group"><label>Gain on Shares (£)</label><div class="hint">Sale proceeds minus purchase cost and dealing fees</div><input type="number" id="gain" min="0" step="500" value="8000"></div>
    <div class="input-group"><label>Your Other Taxable Income (£)</label><input type="number" id="income" min="0" step="500" value="35000"></div>
  </div>
  <button class="btn" onclick="calculate()">Calculate Shares CGT →</button>
  <div class="results" id="results">
    <div class="result-hero"><div class="value" id="r-total">—</div><div class="label">Estimated CGT Owed</div></div>
    <div class="band-breakdown">
      <div><span>Annual exempt amount used</span><span id="r-exempt">—</span></div>
      <div><span>Taxable gain</span><span id="r-taxable">—</span></div>
      <div><span>Taxed at 18%</span><span id="r-basic">—</span></div>
      <div><span>Taxed at 24%</span><span id="r-higher">—</span></div>
    </div>
    <div class="callout"><strong>Scope of this calculator:</strong> this is a quick estimate for <strong>one gain figure</strong> — e.g. you sold a single holding once this tax year. If you made multiple buys and sells of the <em>same</em> share at different prices, HMRC's same-day, 30-day ("bed and breakfast") and Section 104 pooling rules determine your actual gain, and this simple tool doesn't apply them. For multi-trade portfolios, use a dedicated share-matching tool that imports your broker statements, or speak to an accountant.</div>
  </div>`,
  toolJs: `
function calculate(){
  const gain=parseFloat(document.getElementById('gain').value)||0;
  const income=parseFloat(document.getElementById('income').value)||0;
  const r=cgtOnGain(gain,income,false);
  document.getElementById('r-total').textContent=fmt(r.total);
  document.getElementById('r-exempt').textContent=fmt(Math.min(gain,EXEMPT));
  document.getElementById('r-taxable').textContent=fmt(r.taxableGain);
  document.getElementById('r-basic').textContent=fmt(r.atBasic*0.18);
  document.getElementById('r-higher').textContent=fmt(r.atHigher*0.24);
  document.getElementById('results').classList.add('show');
}`,
  extraContent: `
  <h2>Shares &amp; Funds CGT Basics</h2>
  <p>Gains on shares, funds and other investments held outside an ISA or pension are subject to the same CGT rates as other assets: 18% within your remaining basic rate band, 24% above it, after the £3,000 annual exempt amount.</p>
  <h3>Multiple trades of the same holding</h3>
  <p>If you bought and sold the same share on different dates at different prices, your actual taxable gain depends on HMRC's share identification rules, applied in this order:</p>
  <div class="table-wrap"><table><tr><th>Rule</th><th>What it does</th></tr>
  <tr><td>Same-day rule</td><td>Shares bought and sold on the same day are matched first</td></tr>
  <tr><td>30-day rule ("bed and breakfast")</td><td>Shares sold, then rebought within 30 days, are matched to the rebuy</td></tr>
  <tr><td>Section 104 pool</td><td>Remaining shares of the same type are pooled and averaged</td></tr>
  </table></div>
  <p>This calculator deliberately doesn't attempt that matching — it's built for a simple "I sold once, what do I owe" estimate. Multi-trade portfolios need a dedicated tool or an accountant.</p>`,
  formulaBox: formulaSection({
    source: 'Source: gov.uk/capital-gains-tax/rates · Deterministic calculation — no AI, no arbitrary estimation',
    constantsRows: `
      <tr><td>Annual exempt amount</td><td>£3,000</td><td>gov.uk/capital-gains-tax/rates, 2026/27</td></tr>
      <tr><td>Basic rate band upper limit</td><td>£50,270 taxable income</td><td>gov.uk Income Tax rates 2026/27</td></tr>
      <tr><td>CGT basic / higher rate</td><td>18% / 24%</td><td>gov.uk/capital-gains-tax/rates</td></tr>`,
    formulaLines: `
      <span style="color:#86efac;">— Taxable gain —</span><br>
      <span style="color:#7dd3fc;">taxable_gain</span> = max(0, gain − £3,000)<br><br>
      <span style="color:#86efac;">— Rate band —</span><br>
      <span style="color:#7dd3fc;">basic_band_remaining</span> = max(0, £50,270 − other_taxable_income)<br>
      <span style="color:#7dd3fc;">at_18pct</span> = min(taxable_gain, basic_band_remaining)<br>
      <span style="color:#7dd3fc;">at_24pct</span> = taxable_gain − at_18pct<br>
      <span style="color:#7dd3fc;">cgt</span> = at_18pct × 18% + at_24pct × 24%`,
    note: 'Deterministic calculation for a single disposal. Doesn\'t apply HMRC\'s same-day/30-day/Section 104 share-matching rules for multiple trades of the same holding; always confirm your own position with HMRC or a qualified adviser.'
  }),
  faqs: [
    { q: 'How is Capital Gains Tax on shares calculated?', a: 'Your gain (sale proceeds minus purchase cost and dealing fees) has the £3,000 annual exempt amount deducted, then the remainder is taxed at 18% within your remaining basic rate band and 24% above it — the same rates as other chargeable assets.' },
    { q: 'Does this calculator handle multiple share trades?', a: 'No — it\'s scoped to a single disposal estimate. If you bought and sold the same share multiple times at different prices, HMRC\'s same-day, 30-day and Section 104 pooling rules apply, which this simple tool doesn\'t model. Use a dedicated multi-trade matching tool or an accountant for that.' },
    { q: 'How do I avoid CGT on shares?', a: 'Holding shares inside a Stocks & Shares ISA or pension shelters gains from CGT entirely. "Bed and ISA" — selling and immediately repurchasing inside an ISA — is the standard way to move existing holdings into that shelter using your annual ISA allowance.' },
    { q: 'What is the CGT allowance for shares in 2026/27?', a: 'The same £3,000 annual exempt amount applies across all asset types, not just shares — it\'s a single allowance per person per tax year, shared across property, shares, crypto and other gains.' }
  ]
});

// 3. Crypto CGT calculator — different deadline framing from property
PAGES.push({
  slug: 'crypto-capital-gains-tax-calculator',
  title: 'Crypto Capital Gains Tax Calculator',
  metaTitle: 'Crypto Tax Calculator UK 2026/27 — Capital Gains on Cryptoassets',
  metaDesc: 'Free crypto CGT calculator. Selling, swapping or spending crypto? Instant 2026/27 Capital Gains Tax estimate.',
  h1: 'Crypto Capital Gains Tax Calculator',
  intro: 'Selling, swapping or spending crypto is a taxable disposal — estimate what you owe.',
  avatarInitials: 'CR',
  ctaSnippet: CTA_ACCOUNTANT_CRYPTO,
  toolHtml: `
  <div class="two-col">
    <div class="input-group"><label>Total Crypto Gain (£)</label><div class="hint">Across all disposals this tax year — sells, swaps, spends</div><input type="number" id="gain" min="0" step="500" value="10000"></div>
    <div class="input-group"><label>Your Other Taxable Income (£)</label><input type="number" id="income" min="0" step="500" value="35000"></div>
  </div>
  <button class="btn" onclick="calculate()">Calculate Crypto CGT →</button>
  <div class="results" id="results">
    <div class="result-hero"><div class="value" id="r-total">—</div><div class="label">Estimated CGT Owed</div></div>
    <div class="band-breakdown">
      <div><span>Annual exempt amount used</span><span id="r-exempt">—</span></div>
      <div><span>Taxable gain</span><span id="r-taxable">—</span></div>
      <div><span>Taxed at 18%</span><span id="r-basic">—</span></div>
      <div><span>Taxed at 24%</span><span id="r-higher">—</span></div>
    </div>
    <div class="callout"><strong>Every swap counts:</strong> trading one cryptoasset for another is a taxable disposal under HMRC rules, not just cashing out to GBP — many people under-report without realising it. Crypto gains are declared via Self Assessment, due <strong>31 January</strong> following the tax year — there's no 60-day rule for crypto.</div>
  </div>`,
  toolJs: `
function calculate(){
  const gain=parseFloat(document.getElementById('gain').value)||0;
  const income=parseFloat(document.getElementById('income').value)||0;
  const r=cgtOnGain(gain,income,false);
  document.getElementById('r-total').textContent=fmt(r.total);
  document.getElementById('r-exempt').textContent=fmt(Math.min(gain,EXEMPT));
  document.getElementById('r-taxable').textContent=fmt(r.taxableGain);
  document.getElementById('r-basic').textContent=fmt(r.atBasic*0.18);
  document.getElementById('r-higher').textContent=fmt(r.atHigher*0.24);
  document.getElementById('results').classList.add('show');
}`,
  extraContent: `
  <h2>What Counts as a Taxable Crypto Disposal</h2>
  <p>HMRC treats each of the following as a disposal that can trigger Capital Gains Tax:</p>
  <ul>
    <li>Selling cryptoassets for GBP or another currency</li>
    <li>Exchanging one cryptoasset for a different one (e.g. BTC → ETH)</li>
    <li>Using cryptoassets to pay for goods or services</li>
    <li>Giving cryptoassets away (except to a spouse, civil partner, or charity)</li>
  </ul>
  <p>This means a portfolio that never touched a bank account can still generate a CGT bill from token-to-token swaps alone — a common source of underpayment when people assume only cashing out to GBP counts.</p>
  <h3>Reporting crypto gains</h3>
  <p>Unlike UK residential property, crypto gains don't have a 60-day reporting rule — they're declared through your normal Self Assessment tax return, due by 31 January following the end of the tax year (or via HMRC's real-time CGT service if you prefer to pay sooner).</p>`,
  formulaBox: formulaSection({
    source: 'Source: gov.uk/capital-gains-tax/rates, gov.uk/guidance/check-if-you-need-to-pay-tax-when-you-sell-cryptoassets · Deterministic calculation — no AI, no arbitrary estimation',
    constantsRows: `
      <tr><td>Annual exempt amount</td><td>£3,000</td><td>gov.uk/capital-gains-tax/rates, 2026/27</td></tr>
      <tr><td>Basic rate band upper limit</td><td>£50,270 taxable income</td><td>gov.uk Income Tax rates 2026/27</td></tr>
      <tr><td>CGT basic / higher rate</td><td>18% / 24%</td><td>gov.uk/capital-gains-tax/rates</td></tr>
      <tr><td>Taxable disposal events</td><td>Sell, swap, spend, gift (excl. spouse/charity)</td><td>gov.uk crypto assets guidance</td></tr>
      <tr><td>Reporting deadline</td><td>31 January via Self Assessment (no 60-day rule)</td><td>gov.uk crypto assets guidance</td></tr>`,
    formulaLines: `
      <span style="color:#86efac;">— Taxable gain (across all disposals/swaps) —</span><br>
      <span style="color:#7dd3fc;">taxable_gain</span> = max(0, total_gain − £3,000)<br><br>
      <span style="color:#86efac;">— Rate band —</span><br>
      <span style="color:#7dd3fc;">basic_band_remaining</span> = max(0, £50,270 − other_taxable_income)<br>
      <span style="color:#7dd3fc;">at_18pct</span> = min(taxable_gain, basic_band_remaining)<br>
      <span style="color:#7dd3fc;">at_24pct</span> = taxable_gain − at_18pct<br>
      <span style="color:#7dd3fc;">cgt</span> = at_18pct × 18% + at_24pct × 24%`,
    note: 'Deterministic calculation based on official 2026/27 bands. Assumes you\'ve already correctly identified each disposal/swap event and its GBP value at the time; always confirm your own position with HMRC or a qualified adviser.'
  }),
  faqs: [
    { q: 'Do I pay tax when I sell cryptocurrency?', a: 'Yes — if your total gains from disposing of cryptoassets in a tax year exceed the £3,000 annual exempt amount, Capital Gains Tax is due at 18% or 24% depending on your income.' },
    { q: 'Does swapping one crypto for another count as a taxable event?', a: 'Yes — HMRC treats exchanging one cryptoasset for a different one as a disposal, the same as selling for GBP, even if you never move funds to a bank account.' },
    { q: 'When do I need to declare crypto gains?', a: 'Through Self Assessment, by 31 January following the end of the tax year in which the disposal happened — there is no 60-day deadline for crypto, unlike UK residential property.' },
    { q: 'Is there a separate crypto tax rate in the UK?', a: 'No — cryptoassets are taxed under the same Capital Gains Tax rules and rates (18%/24%) as shares and other chargeable assets; there is no crypto-specific rate.' }
  ]
});

// 4. Allowance calculator
PAGES.push({
  slug: 'capital-gains-tax-allowance-calculator',
  title: 'Capital Gains Tax Allowance Calculator',
  metaTitle: 'Capital Gains Tax Allowance Calculator UK 2026/27 — £3,000 Exempt Amount',
  metaDesc: 'Free CGT allowance calculator. See how much of your £3,000 annual exempt amount is used and what remains taxable.',
  h1: 'Capital Gains Tax Allowance Calculator',
  intro: 'See exactly how the £3,000 annual exempt amount applies to your gain.',
  avatarInitials: 'AL',
  ctaSnippet: CTA_IFA_ALLOWANCE,
  toolHtml: `
  <div class="input-group"><label>Total Gains This Tax Year (£)</label><div class="hint">Add up all gains across property, shares, crypto etc.</div><input type="number" id="gain" min="0" step="250" value="4500"></div>
  <button class="btn" onclick="calculate()">Check My Allowance →</button>
  <div class="results" id="results">
    <div class="result-hero"><div class="value" id="r-taxable">—</div><div class="label">Taxable Gain (After Allowance)</div></div>
    <div class="band-breakdown">
      <div><span>Total gains</span><span id="r-gain">—</span></div>
      <div><span>Annual exempt amount available</span><span>£3,000</span></div>
      <div><span>Allowance used</span><span id="r-used">—</span></div>
      <div><span>Remaining taxable</span><span id="r-taxable2">—</span></div>
    </div>
  </div>`,
  toolJs: `
function calculate(){
  const gain=parseFloat(document.getElementById('gain').value)||0;
  const used=Math.min(gain,EXEMPT);
  const taxable=Math.max(0,gain-EXEMPT);
  document.getElementById('r-taxable').textContent=fmt(taxable);
  document.getElementById('r-gain').textContent=fmt(gain);
  document.getElementById('r-used').textContent=fmt(used);
  document.getElementById('r-taxable2').textContent=fmt(taxable);
  document.getElementById('results').classList.add('show');
}`,
  extraContent: `
  <h2>The CGT Annual Exempt Amount 2026/27</h2>
  <p>Every individual gets a £3,000 tax-free Capital Gains Tax allowance each tax year (6 April to 5 April) — down significantly from £12,300 in 2022/23, via £6,000 in 2023/24. It applies once per person, across <strong>all</strong> your gains combined (property, shares, crypto, other assets), not once per asset type.</p>
  <div class="table-wrap"><table><tr><th>Tax Year</th><th>Annual Exempt Amount</th></tr>
  <tr><td>2022/23</td><td>£12,300</td></tr>
  <tr><td>2023/24</td><td>£6,000</td></tr>
  <tr><td>2024/25 onwards</td><td>£3,000</td></tr>
  </table></div>
  <p><strong>Married couples and civil partners</strong> each get their own £3,000 allowance — transferring an asset to a spouse before sale (a tax-free transfer between spouses) can effectively double the tax-free amount available on a joint disposal.</p>
  <p>The allowance doesn't carry forward — if you don't use it in a tax year, it's lost.</p>`,
  formulaBox: formulaSection({
    source: 'Source: gov.uk/capital-gains-tax/rates · Deterministic calculation — no AI, no arbitrary estimation',
    constantsRows: `
      <tr><td>Annual exempt amount (2026/27)</td><td>£3,000</td><td>gov.uk/capital-gains-tax/rates</td></tr>
      <tr><td>Annual exempt amount (2023/24)</td><td>£6,000</td><td>gov.uk/capital-gains-tax/rates (historical)</td></tr>
      <tr><td>Annual exempt amount (2022/23)</td><td>£12,300</td><td>gov.uk/capital-gains-tax/rates (historical)</td></tr>`,
    formulaLines: `
      <span style="color:#86efac;">— Allowance applied —</span><br>
      <span style="color:#7dd3fc;">allowance_used</span> = min(total_gain, £3,000)<br>
      <span style="color:#7dd3fc;">taxable_gain</span> = max(0, total_gain − £3,000)`,
    note: 'Deterministic calculation. The allowance is a single amount per person per tax year across all gains combined, not one per asset — see the Combined CGT Calculator if you have multiple asset types.'
  }),
  faqs: [
    { q: 'What is the Capital Gains Tax allowance for 2026/27?', a: 'The annual exempt amount is £3,000 per person for the 2026/27 tax year.' },
    { q: 'Does the CGT allowance apply per asset or per person?', a: 'Per person, across all your gains combined in a tax year — property, shares, crypto and other assets all share the same single £3,000 allowance, not a separate allowance each.' },
    { q: 'Can I carry forward an unused CGT allowance?', a: 'No — the annual exempt amount doesn\'t carry forward to future tax years. If you don\'t use it, it\'s lost at the end of the tax year on 5 April.' },
    { q: 'Do my spouse and I get separate allowances?', a: 'Yes — each spouse or civil partner has their own £3,000 annual exempt amount. Transfers of assets between spouses are tax-free, so splitting a disposal between you can use both allowances.' }
  ]
});

// 5. How to avoid CGT — content page with embedded calculator
PAGES.push({
  slug: 'how-to-avoid-capital-gains-tax-uk',
  title: 'How to Reduce Capital Gains Tax Legally',
  metaTitle: 'How to Avoid Capital Gains Tax UK 2026/27 — Legal Ways to Reduce CGT',
  metaDesc: 'Legal ways to reduce UK Capital Gains Tax: ISAs, spousal transfers, loss harvesting, timing disposals and Business Asset Disposal Relief. Plus a calculator.',
  h1: 'How to Reduce Capital Gains Tax Legally',
  intro: 'Legitimate ways to reduce what you owe — ISAs, spousal allowances, timing, and reliefs.',
  avatarInitials: 'AV',
  ctaSnippet: CTA_IFA_AVOID,
  toolHtml: `
  <div class="two-col">
    <div class="input-group"><label>Gain (£)</label><input type="number" id="gain" min="0" step="500" value="15000"></div>
    <div class="input-group"><label>Your Other Taxable Income (£)</label><input type="number" id="income" min="0" step="500" value="35000"></div>
  </div>
  <button class="btn" onclick="calculate()">Calculate CGT →</button>
  <div class="results" id="results">
    <div class="result-hero"><div class="value" id="r-total">—</div><div class="label">Estimated CGT Owed</div></div>
    <div class="band-breakdown">
      <div><span>Taxable gain</span><span id="r-taxable">—</span></div>
      <div><span>Taxed at 18%</span><span id="r-basic">—</span></div>
      <div><span>Taxed at 24%</span><span id="r-higher">—</span></div>
    </div>
  </div>`,
  toolJs: `
function calculate(){
  const gain=parseFloat(document.getElementById('gain').value)||0;
  const income=parseFloat(document.getElementById('income').value)||0;
  const r=cgtOnGain(gain,income,false);
  document.getElementById('r-total').textContent=fmt(r.total);
  document.getElementById('r-taxable').textContent=fmt(r.taxableGain);
  document.getElementById('r-basic').textContent=fmt(r.atBasic*0.18);
  document.getElementById('r-higher').textContent=fmt(r.atHigher*0.24);
  document.getElementById('results').classList.add('show');
}`,
  extraContent: `
  <h2>Legal Ways to Reduce Capital Gains Tax</h2>
  <h3>1. Use ISAs and pensions</h3>
  <p>Gains on assets held inside a Stocks &amp; Shares ISA or a pension are never subject to CGT. "Bed and ISA" — selling and immediately repurchasing inside an ISA — moves existing holdings into that shelter using your £20,000 annual ISA allowance.</p>
  <h3>2. Use both spouses' allowances</h3>
  <p>Transfers of assets between spouses and civil partners are tax-free. Splitting ownership of an asset before sale means both partners' £3,000 annual exempt amounts apply to the combined disposal.</p>
  <h3>3. Time disposals across tax years</h3>
  <p>Splitting a large disposal so part falls in one tax year and part in the next lets you use two years' worth of the £3,000 allowance instead of one.</p>
  <h3>4. Harvest losses</h3>
  <p>Losses on other assets sold in the same or a carried-forward tax year can be offset against gains, reducing the taxable amount before the allowance is even applied.</p>
  <h3>5. Business Asset Disposal Relief</h3>
  <p>Qualifying business disposals (e.g. selling your own trading company) can be taxed at 18% instead of the standard rates, up to a £1 million lifetime limit — strict conditions apply on ownership period and shareholding.</p>
  <p><strong>Important:</strong> these are legitimate reliefs and allowances built into the tax system — not avoidance schemes. Eligibility rules are specific; always confirm your position with HMRC guidance or a qualified adviser before relying on one.</p>`,
  formulaBox: formulaSection({
    source: 'Source: gov.uk/capital-gains-tax/rates, gov.uk/business-asset-disposal-relief · Deterministic calculation — no AI, no arbitrary estimation',
    constantsRows: `
      <tr><td>Annual exempt amount</td><td>£3,000 (per person, per tax year)</td><td>gov.uk/capital-gains-tax/rates</td></tr>
      <tr><td>ISA annual allowance</td><td>£20,000</td><td>gov.uk/individual-savings-accounts</td></tr>
      <tr><td>BADR rate</td><td>18%, £1m lifetime limit</td><td>gov.uk/business-asset-disposal-relief</td></tr>`,
    formulaLines: `
      <span style="color:#86efac;">— Taxable gain —</span><br>
      <span style="color:#7dd3fc;">taxable_gain</span> = max(0, gain − £3,000)<br><br>
      <span style="color:#86efac;">— Spousal split example —</span><br>
      <span style="color:#7dd3fc;">combined_allowance</span> = £3,000 × 2 <span style="color:#94a3b8;">(if asset transferred/co-owned before sale)</span><br><br>
      <span style="color:#86efac;">— Rate band —</span><br>
      <span style="color:#7dd3fc;">basic_band_remaining</span> = max(0, £50,270 − other_taxable_income)<br>
      <span style="color:#7dd3fc;">cgt</span> = min(taxable_gain, basic_band_remaining) × 18% + rest × 24%`,
    note: 'Deterministic calculation. Reliefs shown are the standard, published mechanisms — eligibility depends on your specific circumstances; always confirm with HMRC or a qualified adviser.'
  }),
  faqs: [
    { q: 'What is the easiest way to reduce Capital Gains Tax?', a: 'Holding investments inside a Stocks & Shares ISA or pension is the simplest approach — gains inside those wrappers are never subject to CGT at all.' },
    { q: 'Can I use my spouse\'s CGT allowance?', a: 'Not directly, but transfers of assets between spouses or civil partners are tax-free, so you can split ownership before a sale to use both people\'s £3,000 annual exempt amount on the same disposal.' },
    { q: 'Does selling in instalments reduce CGT?', a: 'Splitting a large disposal so part falls in one tax year and part in the next lets you use two years\' worth of the annual exempt amount instead of one — but this only works where a disposal can genuinely be separated.' },
    { q: 'What is Business Asset Disposal Relief and how much does it save?', a: 'It reduces the CGT rate to 18% (from up to 24%) on qualifying business disposals, up to a £1 million lifetime limit per person — eligibility depends on ownership period, shareholding and business type.' }
  ]
});

// 6. Rates/percentage reference hub — AEO-optimized
PAGES.push({
  slug: 'capital-gains-tax-rates-uk',
  title: 'Capital Gains Tax Rates UK',
  metaTitle: 'Capital Gains Tax Rates UK 2026/27 — Full Percentage Reference',
  metaDesc: 'How much is Capital Gains Tax in the UK? Full 2026/27 rate reference by asset type and income band, plus how to work it out.',
  h1: 'Capital Gains Tax Rates UK — 2026/27',
  intro: 'How much is Capital Gains Tax in the UK, and how is it worked out?',
  avatarInitials: 'RT',
  ctaSnippet: CTA_IFA_RATES,
  toolHtml: `
  <div class="two-col">
    <div class="input-group"><label>Gain (£)</label><input type="number" id="gain" min="0" step="500" value="20000"></div>
    <div class="input-group"><label>Your Other Taxable Income (£)</label><input type="number" id="income" min="0" step="500" value="35000"></div>
  </div>
  <button class="btn" onclick="calculate()">Work Out My CGT →</button>
  <div class="results" id="results">
    <div class="result-hero"><div class="value" id="r-total">—</div><div class="label">Estimated CGT Owed</div></div>
    <div class="band-breakdown">
      <div><span>Taxable gain</span><span id="r-taxable">—</span></div>
      <div><span>Taxed at 18%</span><span id="r-basic">—</span></div>
      <div><span>Taxed at 24%</span><span id="r-higher">—</span></div>
      <div><span>Effective rate</span><span id="r-rate">—</span></div>
    </div>
  </div>`,
  toolJs: `
function calculate(){
  const gain=parseFloat(document.getElementById('gain').value)||0;
  const income=parseFloat(document.getElementById('income').value)||0;
  const r=cgtOnGain(gain,income,false);
  document.getElementById('r-total').textContent=fmt(r.total);
  document.getElementById('r-taxable').textContent=fmt(r.taxableGain);
  document.getElementById('r-basic').textContent=fmt(r.atBasic*0.18);
  document.getElementById('r-higher').textContent=fmt(r.atHigher*0.24);
  document.getElementById('r-rate').textContent = r.taxableGain>0 ? ((r.total/r.taxableGain)*100).toFixed(1)+'%' : '0%';
  document.getElementById('results').classList.add('show');
}`,
  extraContent: `
  <h2>How Much Is Capital Gains Tax in the UK?</h2>
  <p>For 2026/27, Capital Gains Tax is charged at <strong>18%</strong> on gains that fall within your remaining basic rate Income Tax band, and <strong>24%</strong> on gains above it. If your income already puts you in the higher or additional rate band, the whole gain is taxed at 24%. These rates apply the same way to property, shares, crypto and other chargeable assets — there's no longer a separate lower rate for shares.</p>
  <div class="table-wrap"><table><tr><th>Situation</th><th>Rate</th></tr>
  <tr><td>Basic rate taxpayer, gain within remaining basic band</td><td>18%</td></tr>
  <tr><td>Basic rate taxpayer, gain above remaining basic band</td><td>24%</td></tr>
  <tr><td>Higher rate taxpayer</td><td>24%</td></tr>
  <tr><td>Additional rate taxpayer</td><td>24%</td></tr>
  <tr><td>Qualifying Business Asset Disposal Relief</td><td>18% (up to £1m lifetime)</td></tr>
  </table></div>
  <h2>How to Work Out Capital Gains Tax</h2>
  <ol>
    <li>Work out your gain: sale price minus purchase price and allowable costs.</li>
    <li>Deduct the £3,000 annual exempt amount (once per person, per tax year, across all gains).</li>
    <li>Add the remaining taxable gain to your other taxable income for the year to see which rate band it falls into.</li>
    <li>Apply 18% to the portion within your remaining basic rate band, and 24% to the rest.</li>
  </ol>`,
  formulaBox: formulaSection({
    source: 'Source: gov.uk/capital-gains-tax/rates · Deterministic calculation — no AI, no arbitrary estimation',
    constantsRows: `
      <tr><td>Annual exempt amount</td><td>£3,000</td><td>gov.uk/capital-gains-tax/rates, 2026/27</td></tr>
      <tr><td>Basic rate band upper limit</td><td>£50,270 taxable income</td><td>gov.uk Income Tax rates 2026/27</td></tr>
      <tr><td>CGT basic rate</td><td>18%</td><td>gov.uk/capital-gains-tax/rates</td></tr>
      <tr><td>CGT higher/additional rate</td><td>24%</td><td>gov.uk/capital-gains-tax/rates</td></tr>`,
    formulaLines: `
      <span style="color:#86efac;">— Taxable gain —</span><br>
      <span style="color:#7dd3fc;">taxable_gain</span> = max(0, gain − £3,000)<br><br>
      <span style="color:#86efac;">— Rate band —</span><br>
      <span style="color:#7dd3fc;">basic_band_remaining</span> = max(0, £50,270 − other_taxable_income)<br>
      <span style="color:#7dd3fc;">at_18pct</span> = min(taxable_gain, basic_band_remaining)<br>
      <span style="color:#7dd3fc;">at_24pct</span> = taxable_gain − at_18pct<br>
      <span style="color:#7dd3fc;">cgt</span> = at_18pct × 18% + at_24pct × 24%<br>
      <span style="color:#7dd3fc;">effective_rate</span> = cgt / taxable_gain`,
    note: 'Deterministic calculation based on official 2026/27 bands. Rates apply equally to property and other chargeable assets since the October 2024 Budget alignment; always confirm your own position with HMRC or a qualified adviser.'
  }),
  faqs: [
    { q: 'How much is Capital Gains Tax in the UK?', a: '18% on gains within your remaining basic rate Income Tax band, and 24% on gains above it or if you\'re already a higher/additional rate taxpayer — for the 2026/27 tax year, after the £3,000 annual exempt amount.' },
    { q: 'How do I work out Capital Gains Tax?', a: 'Subtract allowable costs from your sale price to get the gain, deduct the £3,000 annual exempt amount, then apply 18% to the portion within your remaining basic rate band and 24% to the rest, based on your total taxable income for the year.' },
    { q: 'What is the Capital Gains Tax percentage for property vs shares?', a: 'The same — 18%/24% — for both, since the October 2024 Budget aligned property and other asset rates. There is no longer a separate, lower rate for shares.' },
    { q: 'Is Capital Gains Tax the same across the whole UK?', a: 'Yes — Capital Gains Tax is set by Westminster and applies the same way in England, Scotland, Wales and Northern Ireland, unlike Income Tax which has different bands in Scotland.' }
  ]
});

// ============ BUILD ============

for (const p of PAGES) {
  const dir = path.join(__dirname, p.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), pageShell(p));
  console.log('Wrote', p.slug + '/index.html');
}

const urls = [`${SITE_URL}/`, ...PAGES.map(p => `${SITE_URL}/${p.slug}/`)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url><loc>${u}</loc><changefreq>monthly</changefreq><priority>${u === SITE_URL + '/' ? '1.0' : '0.8'}</priority></url>`).join('\n') +
  `\n</urlset>\n`;
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap);
console.log('Wrote sitemap.xml with', urls.length, 'URLs');
