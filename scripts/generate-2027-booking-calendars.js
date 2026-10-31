const fs = require('fs');
const path = require('path');

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const YEAR = 2027;
const OUT_DIR = path.join(__dirname, '..', 'pages', 'bookingdate', '2027');

function utcDate(y, m, d) {
  return new Date(Date.UTC(y, m, d));
}

function addDays(date, days) {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function display(date) {
  return `${pad(date.getUTCDate())} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function ymd(date) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;
}

function plusEncode(value) {
  return encodeURIComponent(value)
    .replace(/%20/g, '+')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
}

function reminder(kind, journeyLabel, openDate, start, end) {
  const titles = {
    general: `IRCTC Booking: ${journeyLabel} (General)`,
    ac: `IRCTC AC Tatkal: ${journeyLabel}`,
    sl: `IRCTC SL Tatkal: ${journeyLabel}`
  };
  const details = `Booking opens for journey date ${journeyLabel}. Book now at https://www.irctc.co.in/nget/train-search`;
  const href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${plusEncode(titles[kind])}&dates=${ymd(openDate)}T${start}%2F${ymd(openDate)}T${end}&details=${plusEncode(details)}&location=IRCTC+Official+Website`;
  return `<a href="${href}" target="_blank" class="cal-link">Set Reminder</a>`;
}

function row(journey) {
  const weekday = WEEKDAYS[journey.getUTCDay()];
  const journeyLabel = `${display(journey)} (${weekday})`;
  const seo = `${pad(journey.getUTCDate())} ${MONTHS[journey.getUTCMonth()].toLowerCase()} booking date`;
  const general = addDays(journey, -60);
  const tatkal = addDays(journey, -1);
  return `                    <tr>
                        <td class="date-tag">
                            ${journeyLabel}
                            <span class="seo-string">${seo}</span>
                        </td>
                        <td>
                            <span class="date-tag">${display(general)}</span>
                            <span class="time-tag">8:00 AM IST</span>
                            ${reminder('general', journeyLabel, general, '023000Z', '030000Z')}
                        </td>
                        <td>
                            <span class="date-tag">${display(tatkal)}</span>
                            <span class="time-tag">10:00 AM IST</span>
                            ${reminder('ac', journeyLabel, tatkal, '043000Z', '050000Z')}
                        </td>
                        <td>
                            <span class="date-tag">${display(tatkal)}</span>
                            <span class="time-tag">11:00 AM IST</span>
                            ${reminder('sl', journeyLabel, tatkal, '053000Z', '060000Z')}
                        </td>
                        <td>
                            <a href="https://www.irctc.co.in/nget/train-search" class="book-btn" target="_blank">Book Now</a>
                        </td>
                    </tr>`;
}

function page(monthIndex) {
  const month = MONTHS[monthIndex];
  const days = new Date(Date.UTC(YEAR, monthIndex + 1, 0)).getUTCDate();
  const rows = [];
  for (let day = 1; day <= days; day += 1) {
    rows.push(row(utcDate(YEAR, monthIndex, day)));
  }
  const slug = `${month.toLowerCase()}-booking-date.html`;
  const canonical = `https://railbookingdate.com/pages/bookingdate/2027/${slug}`;
  return `<!DOCTYPE html>
<html lang="en-IN">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${month} ${YEAR} Train Ticket Booking Dates - IRCTC Calendar</title>
    <meta name="description" content="Check IRCTC train ticket booking dates for ${month} ${YEAR}. Find when general reservation (60 days ARP) and Tatkal booking opens for your travel date.">
    <link rel="canonical" href="${canonical}">
    
    <link rel="icon" type="image/png" sizes="96x96" href="../../../favicon-96.png">
    <link rel="shortcut icon" href="../../../favicon.ico">
    <meta name="theme-color" content="#ff6b00">

    <link rel="stylesheet" href="../../../css/navigation.css">
    
    <style>
        :root {
            --bg-app: #f8fafc;
            --bg-card: #ffffff;
            --text-primary: #102a43;
            --text-secondary: #486581;
            --primary: #f97316;
            --primary-dark: #ea580c;
            --border-light: #e2e8f0;
            --shadow-card: 0 14px 30px rgba(15, 23, 42, 0.08);
            --font-heading: 'DM Sans', system-ui, -apple-system, sans-serif;
            --font-body: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        }

        [data-theme="dark"] {
            --bg-app: #0b1220;
            --bg-card: #121c2e;
            --text-primary: #f8fafc;
            --text-secondary: #cbd5e1;
            --border-light: #243249;
        }

        body {
            margin: 0;
            font-family: var(--font-body);
            color: var(--text-primary);
            background: var(--bg-app);
            line-height: 1.5;
            min-height: 100vh;
        }

        .app-container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 2rem 1rem;
        }

        header {
            text-align: center;
            margin-bottom: 2rem;
        }

        .main-nav {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }

        .main-nav a {
            text-decoration: none;
            color: var(--text-secondary);
            font-weight: 600;
            font-size: 0.9rem;
        }

        .main-nav a:hover {
            color: var(--primary);
        }

        h1 {
            font-family: var(--font-heading);
            font-size: clamp(1.5rem, 4vw, 2.2rem);
            color: var(--primary);
            margin-bottom: 0.5rem;
            letter-spacing: -0.02em;
        }

        .subtitle {
            color: var(--text-secondary);
            font-size: 1.1rem;
        }

        .card {
            background: var(--bg-card);
            border-radius: 20px;
            padding: 1.5rem;
            box-shadow: var(--shadow-card);
            border: 1px solid var(--border-light);
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
            font-size: 0.95rem;
            min-width: 600px;
        }

        th, td {
            padding: 14px;
            text-align: left;
            border-bottom: 1px solid var(--border-light);
        }

        th {
            background: var(--bg-app);
            color: var(--text-secondary);
            font-weight: 700;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
        }

        tr:last-child td {
            border-bottom: none;
        }

        tr:hover {
            background: #fff7ed;
        }

        .book-btn {
            display: inline-block;
            padding: 8px 16px;
            background: var(--primary);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 700;
            font-size: 0.85rem;
            transition: all 0.2s;
            text-align: center;
        }

        .book-btn:hover {
            background: var(--primary-dark);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);
        }

        .cal-link {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 0.7rem;
            color: var(--primary);
            text-decoration: none;
            font-weight: 600;
            margin-top: 2px;
            padding: 2px 6px;
            border-radius: 4px;
            background: var(--primary-soft);
            border: 1px solid transparent;
            transition: all 0.2s;
        }

        .cal-link:hover {
            background: white;
            border-color: var(--primary);
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .date-tag {
            font-weight: 700;
            color: var(--text-primary);
        }

        .time-tag {
            font-size: 0.8rem;
            color: var(--text-secondary);
            display: block;
            margin-top: 2px;
        }

        .seo-string {
            font-size: 0.8rem;
            color: var(--text-tertiary);
            display: block;
            margin-top: 4px;
            font-style: italic;
        }

        footer {
            text-align: center;
            margin-top: 4rem;
            color: var(--text-tertiary);
            font-size: 0.9rem;
            padding-bottom: 2rem;
        }
        
        @media (max-width: 600px) {
            .app-container {
                padding: 1rem 0.5rem;
            }
            .card {
                padding: 1rem;
                border-radius: 12px;
            }
            th, td {
                padding: 10px 8px;
            }
        }
    </style>
</head>

<body>
    <div class="app-container">
        <header>
            <nav class="main-nav">
                <a href="../../../index.html">Calculator</a>
                <a href="../../tatkal.html">Tatkal Dates</a>
                <a href="../../news.html">Rail News</a>
                <a href="../../faq.html">FAQ</a>
                <a href="../../helpline.html">Helpline</a>
            </nav>
            <h1>${month} ${YEAR} Train Booking Calendar</h1>
            <p class="subtitle">Complete list of IRCTC booking opening dates for journey dates in ${month} ${YEAR}</p>
        </header>

        <main class="card">
            <table>
                <thead>
                    <tr>
                        <th>Journey Date</th>
                        <th>General Booking (60 Days)</th>
                        <th>AC Tatkal (10 AM)</th>
                        <th>Sleeper Tatkal (11 AM)</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
${rows.join('\n')}
                </tbody>
            </table>
        </main>

        <footer>
            <p>&copy; ${YEAR} RailBookingDate - Accurate IRCTC Booking Calendars</p>
        </footer>
    </div>
</body>
</html>
`;
}

fs.mkdirSync(OUT_DIR, { recursive: true });
for (let month = 0; month < 12; month += 1) {
  const slug = `${MONTHS[month].toLowerCase()}-booking-date.html`;
  fs.writeFileSync(path.join(OUT_DIR, slug), page(month));
  const days = new Date(Date.UTC(YEAR, month + 1, 0)).getUTCDate();
  console.log(`${slug}: ${days} days`);
}

const sample = utcDate(2026, 10, 1);
console.log('check Nov 1 2026 general', display(addDays(sample, -60)), 'tatkal', display(addDays(sample, -1)), WEEKDAYS[sample.getUTCDay()]);
const jan1 = utcDate(2027, 0, 1);
console.log('check Jan 1 2027', WEEKDAYS[jan1.getUTCDay()], 'general', display(addDays(jan1, -60)));
