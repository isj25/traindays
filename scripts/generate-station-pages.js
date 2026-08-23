#!/usr/bin/env node
/**
 * Generates a static HTML page for every station in data/railwayStationsList.json.
 * Run: node scripts/generate-station-pages.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'data/railwayStationsList.json');
const OUT_DIR = path.join(ROOT, 'pages/stations');
const SITEMAP_PATH = path.join(ROOT, 'sitemap-stations.xml');
const STATION_DATA_JS = path.join(ROOT, 'js/stations-data.js');
const TRAINS_SEARCH_PATH = path.join(ROOT, 'pages/trains-search.html');
const LASTMOD = '2026-08-23';
const SITE = 'https://railbookingdate.com';

const NAV_LINKS = [
    ['index.html', 'Calculator'],
    ['pages/live-status.html', 'Live Status'],
    ['pages/pnr-status.html', 'PNR Status'],
    ['pages/tatkal.html', 'Tatkal Dates'],
    ['pages/stations/index.html', 'Station Codes'],
    ['pages/trains-search.html', 'Train Search'],
    ['pages/indian-railway-blogs.html', 'Blogs'],
    ['pages/news.html', 'Rail News'],
    ['pages/faq.html', 'FAQ'],
    ['pages/helpline.html', 'Helpline'],
    ['pages/about-us.html', 'About Us']
];

const FOOTER_LINKS = [
    ['index.html', 'Calculator'],
    ['pages/tatkal.html', 'Tatkal Dates'],
    ['pages/faq.html', 'FAQ'],
    ['pages/stations/index.html', 'Station Codes'],
    ['pages/trains-search.html', 'Train Search'],
    ['pages/about-us.html', 'About Us']
];

/** `prefix` walks back to the site root, e.g. '../../' from pages/stations/. */
function nav(prefix, activePath) {
    const links = NAV_LINKS.map(([href, label]) => {
        const active = href === activePath ? ' class="active"' : '';
        return `                <a href="${prefix}${href}"${active}>${label}</a>`;
    });
    return `            <nav class="main-nav">\n${links.join('\n')}\n            </nav>`;
}

function footer(prefix) {
    const links = FOOTER_LINKS.map(([href, label]) => `                <a href="${prefix}${href}">${label}</a>`);
    return `        <footer class="site-footer">
            <p>&copy; 2026 RailBookingDate - Created by Ishwar Joshi</p>
            <nav class="site-footer-nav">
${links.join('\n')}
            </nav>
        </footer>`;
}

const NAV = nav('../../', 'pages/stations/index.html');
const FOOTER = footer('../../');

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function slugify(name, code) {
    const namePart = String(name)
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'station';
    return `${namePart}-station-code-${String(code).toLowerCase()}`;
}

function relatedStations(stations, index) {
    const n = stations.length;
    const picked = new Set([index]);
    const result = [];

    const add = (i) => {
        const idx = ((i % n) + n) % n;
        if (picked.has(idx) || result.length >= 20) return;
        picked.add(idx);
        result.push(stations[idx]);
    };

    for (let d = 1; d <= 7; d++) {
        add(index - d);
        add(index + d);
    }

    const step = Math.max(1, Math.floor(n / 9));
    for (let k = 1; k <= 6; k++) {
        add(index + k * step);
    }

    return result;
}

function bookingIntro(station, index) {
    const name = station.stnName;
    const code = station.stnCode;
    const city = station.stnCity;
    const variants = [
        `Use station code <strong>${escapeHtml(code)}</strong> when you search trains to or from ${escapeHtml(name)} on IRCTC. Entering the code is faster and avoids picking the wrong station with a similar name.`,
        `${escapeHtml(name)} is listed on Indian Railways as <strong>${escapeHtml(code)}</strong>. Keep this code handy while filling the From / To fields on IRCTC, NTES, or the RailConnect app.`,
        `Tickets to ${escapeHtml(city)} are booked against railway station code <strong>${escapeHtml(code)}</strong>. IRCTC accepts either the station name or this short code during train search.`
    ];
    return variants[index % variants.length];
}

function bookingTips(station) {
    const name = escapeHtml(station.stnName);
    const code = escapeHtml(station.stnCode);
    return `
                <h3>How to book a train ticket for ${name}</h3>
                <ol class="booking-steps">
                    <li>Open the IRCTC website or app and start a train search.</li>
                    <li>Type <strong>${code}</strong> in the From or To box instead of guessing the full station name.</li>
                    <li>Choose your travel date. General quota opens <strong>60 days in advance at 8:00 AM IST</strong> (journey date not counted).</li>
                    <li>Use the <a href="../../index.html">IRCTC 60 days calculator</a> first so you know the exact morning to book.</li>
                    <li>If general tickets are gone, try Tatkal one day before the journey — AC at 10:00 AM and Sleeper/2S at 11:00 AM.</li>
                </ol>`;
}

function stationPage(station, related) {
    const name = escapeHtml(station.stnName);
    const code = escapeHtml(station.stnCode);
    const city = escapeHtml(station.stnCity);
    const title = `${station.stnName} station code - ${station.stnCode}`;
    const railwayTitle = `${station.stnName} railway station code - ${station.stnCode}`;
    const slug = station.slug;
    const canonical = `${SITE}/pages/stations/${slug}.html`;
    const description = `${station.stnName} station code is ${station.stnCode}. Find ${station.stnName} railway station code, IRCTC booking tips, and the 60 days advance ticket booking date calculator.`;

    const relatedHtml = related
        .map((item) => `<a href="${item.slug}.html">${escapeHtml(item.stnName)} station code - ${escapeHtml(item.stnCode)}</a>`)
        .join('\n                    ');

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'RailwayStation',
                name: `${station.stnName} Railway Station`,
                alternateName: [station.stnCode, `${station.stnName} station code`],
                identifier: station.stnCode,
                address: {
                    '@type': 'PostalAddress',
                    addressLocality: station.stnCity,
                    addressCountry: 'IN'
                },
                url: canonical
            },
            {
                '@type': 'FAQPage',
                mainEntity: [
                    {
                        '@type': 'Question',
                        name: `What is ${station.stnName} station code?`,
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: `${station.stnName} station code is ${station.stnCode}. The ${station.stnName} railway station code used on IRCTC is ${station.stnCode}.`
                        }
                    },
                    {
                        '@type': 'Question',
                        name: `How do I book train tickets from ${station.stnName}?`,
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: `Enter station code ${station.stnCode} in the From or To field on IRCTC. General tickets open 60 days before travel at 8:00 AM IST. Use the RailBookingDate 60 days calculator to get the exact booking date.`
                        }
                    }
                ]
            }
        ]
    };

    return `<!DOCTYPE html>
<html lang="en-IN">

<head>
    <meta name="google-adsense-account" content="ca-pub-5018644317959743">
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-NL4NTX1D6V"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', 'G-NL4NTX1D6V');
    </script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="keywords" content="${escapeHtml(station.stnName)} station code, ${escapeHtml(station.stnName)} railway station code, ${escapeHtml(code)}, IRCTC ${escapeHtml(code)}, train ticket booking ${escapeHtml(name)}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${canonical}">

    <meta property="og:type" content="website">
    <meta property="og:url" content="${canonical}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:locale" content="en_IN">
    <meta property="og:site_name" content="RailBookingDate">

    <link rel="icon" type="image/png" sizes="96x96" href="../../favicon-96x96.png">
    <link rel="icon" type="image/svg+xml" href="../../favicon.svg">
    <link rel="shortcut icon" href="../../favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="../../apple-touch-icon.png">
    <meta name="theme-color" content="#ff6b00">

    <link rel="stylesheet" href="../../css/navigation.css">
    <link rel="stylesheet" href="../../css/stations.css">
    <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
    </script>
    <script>
        (function () {
            var t = localStorage.getItem('theme');
            if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
        })();
    </script>
</head>

<body>
    <div class="app-container">
        <header class="app-header">
${NAV}
            <a href="index.html" class="back-link">← All station codes</a>
        </header>

        <article class="station-hero">
            <h1>${escapeHtml(title)}</h1>
            <p class="subtitle">${escapeHtml(railwayTitle)}</p>
        </article>

        <section class="card code-ticket">
            <div class="ticket-topbar">
                <span>Indian Railways</span>
                <span>Station Code</span>
            </div>
            <div class="ticket-body">
                <p class="station-meta">${name} railway station</p>
                <p class="station-code-value" id="station-code">${code}</p>
                <button type="button" class="copy-btn" id="copy-code">Copy code</button>
                <div class="meta-grid">
                    <div class="meta-item">
                        <span>Station</span>
                        <strong>${name}</strong>
                    </div>
                    <div class="meta-item">
                        <span>Station code</span>
                        <strong>${code}</strong>
                    </div>
                    <div class="meta-item">
                        <span>City</span>
                        <strong>${city}</strong>
                    </div>
                </div>
                <div class="cta-row">
                    <a class="action-btn" href="../../index.html">Open 60 days booking calculator</a>
                    <a class="action-btn secondary" href="../tatkal.html">Tatkal booking dates</a>
                </div>
            </div>
        </section>

        <section class="card train-search-card" data-station-search data-src-code="${code}">
            <h2>Trains from ${name} station</h2>
            <p>Choose your destination station to see the trains running from ${name} (${code}).</p>
            <form class="train-search-form" autocomplete="off">
                <div class="dest-field">
                    <label class="dest-label" for="dest-station">Destination station</label>
                    <input type="text" id="dest-station" class="dest-input" data-role="destination" role="combobox"
                        aria-expanded="false" aria-controls="dest-suggestions" aria-autocomplete="list"
                        placeholder="Search destination station or code">
                    <ul class="dest-suggestions" id="dest-suggestions" data-role="destination-suggestions"
                        role="listbox" hidden></ul>
                </div>
                <button type="submit" class="action-btn dest-search-btn">Search trains</button>
            </form>
            <p class="dest-error" role="alert" hidden></p>
            <p class="search-note">Need a different starting point? Use the
                <a href="../trains-search.html?src=${encodeURIComponent(station.stnCode)}">source to destination train
                    search</a>.</p>
        </section>

        <section class="card">
            <h2>${escapeHtml(railwayTitle)}</h2>
            <p>${bookingIntro(station, station.index)}</p>
            <p>Passengers travelling via ${name} should use <strong>${code}</strong> on IRCTC so the correct station is selected. This code also works for live train status, PNR checks, and enquiry SMS.</p>
            ${bookingTips(station)}
            <div class="highlight-box">
                IRCTC general booking for trains from ${name} (${code}) opens 60 days before the journey date at 8:00 AM IST.
                <a href="../../index.html">Calculate the exact booking date</a> before you sit down to book.
            </div>
        </section>

        <section class="card">
            <h2>Train ticket booking from ${name}</h2>
            <p>Indian Railways tickets can be booked online on IRCTC or at a railway reservation counter. For ${name} (${code}), online booking is usually the fastest way to get a confirmed berth, especially on busy routes and holiday weekends.</p>
            <div class="timing-grid">
                <div class="timing-card">
                    <strong>General quota</strong>
                    <span>Opens 60 days ahead at 8:00 AM IST. Journey date is not counted in the 60 days.</span>
                </div>
                <div class="timing-card">
                    <strong>AC Tatkal</strong>
                    <span>Opens 1 day before travel at 10:00 AM IST for 1A, 2A, 3A, CC and EC.</span>
                </div>
                <div class="timing-card">
                    <strong>Sleeper / 2S Tatkal</strong>
                    <span>Opens 1 day before travel at 11:00 AM IST for SL and 2S classes.</span>
                </div>
            </div>
            <h3>Booking tips for ${name} (${code})</h3>
            <ul class="booking-steps">
                <li>Complete IRCTC profile and Aadhaar authentication before opening day.</li>
                <li>Keep From/To saved as <strong>${code}</strong> so search is instant at 8:00 AM.</li>
                <li>If you miss general booking, check the <a href="../tatkal.html">Tatkal calculator</a> for the next window.</li>
                <li>After booking, verify the ticket on the <a href="../pnr-status.html">PNR status</a> page.</li>
            </ul>
            <p>Need the opening date for your journey from ${name}? Use the free <a href="../../index.html">60 days advance booking date calculator</a> on RailBookingDate.</p>
        </section>

        <section class="card related-stations">
            <h2>Other railway station codes</h2>
            <div class="related-links">
                    ${relatedHtml}
            </div>
        </section>

${FOOTER}
    </div>
    <script src="../../js/stations-data.js" defer></script>
    <script src="../../js/station-search.js" defer></script>
    <script>
        (function () {
            var btn = document.getElementById('copy-code');
            if (!btn) return;
            btn.addEventListener('click', function () {
                var code = document.getElementById('station-code').textContent.trim();
                navigator.clipboard.writeText(code).then(function () {
                    btn.textContent = 'Copied';
                    setTimeout(function () { btn.textContent = 'Copy code'; }, 1600);
                });
            });
        })();
    </script>
</body>

</html>
`;
}

function indexPage(stations) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const groups = {};
    for (const letter of letters) groups[letter] = [];
    groups['#'] = [];

    for (const station of stations) {
        const first = station.stnName.charAt(0).toUpperCase();
        const key = /[A-Z]/.test(first) ? first : '#';
        groups[key].push(station);
    }

    const alphaNav = ['#', ...letters]
        .filter((letter) => groups[letter] && groups[letter].length)
        .map((letter) => `<a href="#letter-${letter.toLowerCase()}">${letter}</a>`)
        .join('\n                ');

    const groupsHtml = ['#', ...letters]
        .filter((letter) => groups[letter] && groups[letter].length)
        .map((letter) => {
            const links = groups[letter]
                .map((station) => {
                    const search = `${station.stnName} ${station.stnCode} ${station.stnCity}`.toLowerCase();
                    return `<a class="station-link" href="${station.slug}.html" data-s="${escapeHtml(search)}">${escapeHtml(station.stnName)} station code - ${escapeHtml(station.stnCode)}</a>`;
                })
                .join('\n                    ');
            return `            <section class="letter-group" id="letter-${letter.toLowerCase()}">
                <h2>${letter === '#' ? '0-9' : letter}</h2>
                <div class="directory-links">
                    ${links}
                </div>
            </section>`;
        })
        .join('\n');

    return `<!DOCTYPE html>
<html lang="en-IN">

<head>
    <meta name="google-adsense-account" content="ca-pub-5018644317959743">
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-NL4NTX1D6V"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', 'G-NL4NTX1D6V');
    </script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Indian Railway Station Codes | RailBookingDate</title>
    <meta name="description" content="Find Indian Railway station codes for IRCTC train ticket booking. Browse every station code and use the 60 days advance booking date calculator.">
    <link rel="canonical" href="${SITE}/pages/stations/index.html">
    <meta property="og:title" content="Indian Railway Station Codes">
    <meta property="og:description" content="Complete Indian Railways station code list with IRCTC booking tips and a 60 days calculator.">
    <meta property="og:url" content="${SITE}/pages/stations/index.html">
    <meta property="og:type" content="website">

    <link rel="icon" type="image/png" sizes="96x96" href="../../favicon-96x96.png">
    <link rel="icon" type="image/svg+xml" href="../../favicon.svg">
    <link rel="shortcut icon" href="../../favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="../../apple-touch-icon.png">
    <meta name="theme-color" content="#ff6b00">
    <link rel="stylesheet" href="../../css/navigation.css">
    <link rel="stylesheet" href="../../css/stations.css">
    <script>
        (function () {
            var t = localStorage.getItem('theme');
            if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
        })();
    </script>
</head>

<body>
    <div class="app-container">
        <header class="app-header">
${NAV}
            <a href="../../index.html" class="back-link">← Back to calculator</a>
        </header>

        <article class="station-hero">
            <h1>Indian Railway station codes</h1>
            <p class="subtitle">${stations.length.toLocaleString('en-IN')} stations · use the code on IRCTC while booking tickets</p>
        </article>

        <section class="card">
            <p>Every Indian Railways station has a short code such as <strong>KT</strong> for Kumta or <strong>MAO</strong> for Madgaon. Enter the code in IRCTC From / To fields, then use the <a href="../../index.html">60 days booking date calculator</a> to know when general reservation opens.</p>
            <div class="cta-row">
                <a class="action-btn" href="../../index.html">Open 60 days calculator</a>
                <a class="action-btn secondary" href="../tatkal.html">Tatkal dates</a>
            </div>
        </section>

        <section class="card">
            <h2>Search station codes</h2>
            <input class="search-box" id="station-search" type="search" placeholder="Search by station name, city, or code (e.g. Kumta or KT)" aria-label="Search station codes">
            <nav class="alpha-nav" aria-label="Jump to letter">
                ${alphaNav}
            </nav>
            <p class="empty-filter" id="empty-filter">No stations match that search.</p>
${groupsHtml}
        </section>

${FOOTER}
    </div>
    <script>
        (function () {
            var input = document.getElementById('station-search');
            var empty = document.getElementById('empty-filter');
            var links = Array.prototype.slice.call(document.querySelectorAll('.station-link'));
            var groups = Array.prototype.slice.call(document.querySelectorAll('.letter-group'));
            if (!input) return;
            input.addEventListener('input', function () {
                var q = input.value.toLowerCase().trim();
                var visible = 0;
                links.forEach(function (a) {
                    var show = !q || (a.getAttribute('data-s') || '').indexOf(q) !== -1;
                    a.hidden = !show;
                    if (show) visible += 1;
                });
                groups.forEach(function (group) {
                    var any = group.querySelector('.station-link:not([hidden])');
                    group.hidden = !any;
                });
                empty.classList.toggle('visible', visible === 0);
            });
        })();
    </script>
</body>

</html>
`;
}

function trainsSearchPage(stations) {
    const canonical = `${SITE}/pages/trains-search.html`;
    const description = 'Search trains between any two Indian Railways stations. Pick source and destination stations by name or code and see the full train list.';

    const popular = ['NDLS', 'CSTM', 'MAS', 'HWH', 'SBC', 'MAO', 'PUNE', 'ADI']
        .map((code) => stations.find((s) => s.stnCode === code))
        .filter(Boolean);

    const popularHtml = popular
        .map((s) => `<a href="${s.slug === undefined ? '#' : 'stations/' + s.slug + '.html'}">${escapeHtml(s.stnName)} - ${escapeHtml(s.stnCode)}</a>`)
        .join('\n                    ');

    return `<!DOCTYPE html>
<html lang="en-IN">

<head>
    <meta name="google-adsense-account" content="ca-pub-5018644317959743">
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-NL4NTX1D6V"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', 'G-NL4NTX1D6V');
    </script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Train Search - Source to Destination Trains | RailBookingDate</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="keywords" content="train search, source to destination trains, trains between stations, station code search, IRCTC train list">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${canonical}">

    <meta property="og:type" content="website">
    <meta property="og:url" content="${canonical}">
    <meta property="og:title" content="Train Search - Source to Destination Trains">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:locale" content="en_IN">
    <meta property="og:site_name" content="RailBookingDate">

    <link rel="icon" type="image/png" sizes="96x96" href="../favicon-96x96.png">
    <link rel="icon" type="image/svg+xml" href="../favicon.svg">
    <link rel="shortcut icon" href="../favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="../apple-touch-icon.png">
    <meta name="theme-color" content="#ff6b00">

    <link rel="stylesheet" href="../css/navigation.css">
    <link rel="stylesheet" href="../css/stations.css">
    <script>
        (function () {
            var t = localStorage.getItem('theme');
            if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
        })();
    </script>
</head>

<body>
    <div class="app-container">
        <header class="app-header">
${nav('../', 'pages/trains-search.html')}
            <a href="../index.html" class="back-link">← Back to calculator</a>
        </header>

        <article class="station-hero">
            <h1>Train search - source to destination</h1>
            <p class="subtitle">Pick two stations to see every train running between them</p>
        </article>

        <section class="card train-search-card route-search-card" data-station-search>
            <h2>Search trains between stations</h2>
            <p>Type a station name, city, or code (for example <strong>Kumta</strong> or <strong>KT</strong>) in both
                boxes, then search.</p>
            <form class="train-search-form route-form" autocomplete="off">
                <div class="dest-field">
                    <label class="dest-label" for="source-station">From station</label>
                    <input type="text" id="source-station" class="dest-input" data-role="source" role="combobox"
                        aria-expanded="false" aria-controls="source-suggestions" aria-autocomplete="list"
                        placeholder="Source station or code">
                    <ul class="dest-suggestions" id="source-suggestions" data-role="source-suggestions" role="listbox"
                        hidden></ul>
                </div>
                <button type="button" class="swap-btn" data-role="swap" aria-label="Swap source and destination"
                    title="Swap stations">⇄</button>
                <div class="dest-field">
                    <label class="dest-label" for="dest-station">To station</label>
                    <input type="text" id="dest-station" class="dest-input" data-role="destination" role="combobox"
                        aria-expanded="false" aria-controls="dest-suggestions" aria-autocomplete="list"
                        placeholder="Destination station or code">
                    <ul class="dest-suggestions" id="dest-suggestions" data-role="destination-suggestions"
                        role="listbox" hidden></ul>
                </div>
                <button type="submit" class="action-btn dest-search-btn">Search trains</button>
            </form>
            <p class="dest-error" role="alert" hidden></p>
        </section>

        <section class="card">
            <h2>How this train search works</h2>
            <p>Indian Railways identifies every station by a short code. This search matches what you type against
                ${stations.length.toLocaleString('en-IN')} station names, cities, and codes, then opens the full list of
                trains running on that route.</p>
            <ol class="booking-steps">
                <li>Enter your boarding station in the <strong>From</strong> box and pick it from the suggestions.</li>
                <li>Enter your destination in the <strong>To</strong> box.</li>
                <li>Press <strong>Search trains</strong> to see train numbers, timings, and running days.</li>
                <li>Once you pick a train, use the <a href="../index.html">60 days advance booking date
                        calculator</a> to find out when IRCTC reservation opens for your travel date.</li>
            </ol>
            <div class="highlight-box">
                General booking opens 60 days before the journey date at 8:00 AM IST. Tatkal opens one day before
                travel, at 10:00 AM for AC and 11:00 AM for Sleeper/2S.
                <a href="tatkal.html">Check Tatkal dates</a>.
            </div>
        </section>

        <section class="card">
            <h2>Popular stations</h2>
            <p>Open a station page to see its code, booking guidance, and trains from that station.</p>
            <div class="related-links">
                    ${popularHtml}
            </div>
            <p><a href="stations/index.html">Browse all ${stations.length.toLocaleString('en-IN')} railway station
                    codes →</a></p>
        </section>

${footer('../')}
    </div>
    <script src="../js/stations-data.js" defer></script>
    <script src="../js/station-search.js" defer></script>
</body>

</html>
`;
}

/**
 * Shared lookup used by the destination search on every station page.
 * City is omitted when identical to the station name to keep the file small.
 */
function stationDataJs(stations) {
    const rows = stations.map((station) => {
        const base = [station.stnCode, station.stnName];
        if (station.stnCity !== station.stnName) base.push(station.stnCity);
        return JSON.stringify(base);
    });

    return `/* Generated by scripts/generate-station-pages.js - do not edit by hand. */
window.RBD_STATIONS = [
${rows.join(',\n')}
];
`;
}

function sitemapXml(stations) {
    const urls = [
        `    <url>
        <loc>${SITE}/pages/stations/index.html</loc>
        <lastmod>${LASTMOD}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`
    ];

    for (const station of stations) {
        urls.push(`    <url>
        <loc>${SITE}/pages/stations/${station.slug}.html</loc>
        <lastmod>${LASTMOD}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>`);
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}

function main() {
    const raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    const stations = raw.stations.map((station, index) => ({
        ...station,
        index,
        slug: slugify(station.stnName, station.stnCode)
    }));

    const slugCounts = new Map();
    for (const station of stations) {
        const count = slugCounts.get(station.slug) || 0;
        slugCounts.set(station.slug, count + 1);
        if (count > 0) {
            station.slug = `${station.slug}-${count + 1}`;
        }
    }

    fs.mkdirSync(OUT_DIR, { recursive: true });
    for (const file of fs.readdirSync(OUT_DIR)) {
        if (file.endsWith('.html')) {
            fs.unlinkSync(path.join(OUT_DIR, file));
        }
    }

    for (let i = 0; i < stations.length; i++) {
        const html = stationPage(stations[i], relatedStations(stations, i));
        fs.writeFileSync(path.join(OUT_DIR, `${stations[i].slug}.html`), html);
    }

    fs.writeFileSync(path.join(OUT_DIR, 'index.html'), indexPage(stations));
    fs.writeFileSync(SITEMAP_PATH, sitemapXml(stations));
    fs.writeFileSync(STATION_DATA_JS, stationDataJs(stations));
    fs.writeFileSync(TRAINS_SEARCH_PATH, trainsSearchPage(stations));

    const kumta = stations.find((s) => s.stnCode === 'KT');
    const madgaon = stations.find((s) => s.stnCode === 'MAO');
    console.log(`Generated ${stations.length} station pages in ${path.relative(ROOT, OUT_DIR)}`);
    console.log(`Kumta: ${kumta.slug}.html`);
    console.log(`Madgaon: ${madgaon.slug}.html`);
    console.log(`Sitemap: ${path.relative(ROOT, SITEMAP_PATH)}`);
}

main();
