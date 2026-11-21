const fs = require('fs');
const path = require('path');

const months = [
  { key: 'january', label: 'January', short: 'Jan' },
  { key: 'february', label: 'February', short: 'Feb' },
  { key: 'march', label: 'March', short: 'Mar' },
  { key: 'april', label: 'April', short: 'Apr' },
  { key: 'may', label: 'May', short: 'May' },
  { key: 'june', label: 'June', short: 'Jun' },
  { key: 'july', label: 'July', short: 'Jul' },
  { key: 'august', label: 'August', short: 'Aug' },
  { key: 'september', label: 'September', short: 'Sep' },
  { key: 'october', label: 'October', short: 'Oct' },
  { key: 'november', label: 'November', short: 'Nov' },
  { key: 'december', label: 'December', short: 'Dec' }
];

const festivals = [
  ['2027-01-01', 'Friday', 'English New Year', 'First day of the Gregorian calendar', 'Observance'],
  ['2027-01-12', 'Tuesday', 'Swami Vivekananda Jayanti', 'Fixed day in the Gregorian calendar', 'Observance'],
  ['2027-01-12', 'Tuesday', 'National Youth Day', 'Fixed day in the Gregorian calendar', 'National'],
  ['2027-01-14', 'Thursday', 'Lohri', 'Day before Makara Sankranti', 'Hindu'],
  ['2027-01-15', 'Friday', 'Guru Gobind Singh Jayanti', 'Pausha, Shukla Saptami', 'Sikh'],
  ['2027-01-15', 'Friday', 'Makara Sankranti', 'Dhanu to Makara transit of the Sun', 'Hindu'],
  ['2027-01-15', 'Friday', 'Pongal', 'On Makara Sankranti day', 'Hindu'],
  ['2027-01-19', 'Tuesday', 'Tailang Swami Jayanti', 'Pausha, Shukla Ekadashi', 'Hindu'],
  ['2027-01-23', 'Saturday', 'Subhas Chandra Bose Jayanti', 'Fixed day in the Gregorian calendar', 'National'],
  ['2027-01-26', 'Tuesday', 'Republic Day', 'Fixed day in the Gregorian calendar', 'National'],
  ['2027-01-28', 'Thursday', 'Vivekananda Jayanti *Samvat', 'Magha, Krishna Saptami', 'Hindu'],
  ['2027-01-30', 'Saturday', 'Gandhi Punyatithi', 'Fixed day in the Gregorian calendar', 'National'],

  ['2027-02-04', 'Thursday', 'World Cancer Day', 'Fixed day in the Gregorian calendar', 'Observance'],
  ['2027-02-11', 'Thursday', 'Vasant Panchami', 'Magha, Shukla Panchami', 'Hindu'],
  ['2027-02-14', 'Sunday', 'Valentine\'s Day', 'Fixed day in the Gregorian calendar', 'Observance'],
  ['2027-02-19', 'Friday', 'Chhatrapati Shivaji Maharaj Jayanti', 'Fixed day in the Gregorian calendar', 'National'],
  ['2027-02-20', 'Saturday', 'Guru Ravidas Jayanti', 'Magha, Shukla Purnima', 'Hindu'],

  ['2027-03-02', 'Tuesday', 'Maharishi Dayanand Saraswati Jayanti', 'Phalguna, Krishna Dashami', 'Hindu'],
  ['2027-03-05', 'Friday', 'Jamat Ul-Vida', 'Based on the Islamic calendar', 'Islamic'],
  ['2027-03-06', 'Saturday', 'Maha Shivaratri', 'Phalguna, Krishna Chaturdashi', 'Hindu'],
  ['2027-03-08', 'Monday', 'International Women\'s Day', 'Fixed day in the Gregorian calendar', 'Observance'],
  ['2027-03-10', 'Wednesday', 'Ramakrishna Jayanti', 'Phalguna, Shukla Dwitiya', 'Hindu'],
  ['2027-03-10', 'Wednesday', 'Eid al-Fitr', 'Based on the Islamic calendar', 'Islamic'],
  ['2027-03-10', 'Wednesday', 'Ramadan', 'Based on the Islamic calendar', 'Islamic'],
  ['2027-03-21', 'Sunday', 'Chhoti Holi', 'Phalguna, Shukla Purnima', 'Hindu'],
  ['2027-03-21', 'Sunday', 'Holika Dahan', 'Phalguna, Shukla Purnima', 'Hindu'],
  ['2027-03-21', 'Sunday', 'Vernal Equinox', 'Astronomy event', 'Astronomy'],
  ['2027-03-21', 'Sunday', 'Parsi New Year', 'Based on the Parsi calendar', 'Parsi'],
  ['2027-03-22', 'Monday', 'Chaitanya Mahaprabhu Jayanti', 'Phalguna, Shukla Purnima', 'Hindu'],
  ['2027-03-22', 'Monday', 'Holi', 'Chaitra, Krishna Pratipada', 'Hindu'],
  ['2027-03-23', 'Tuesday', 'Shaheed Diwas', 'Fixed day in the Gregorian calendar', 'National'],
  ['2027-03-25', 'Thursday', 'Chhatrapati Shivaji Maharaj Jayanti', 'Chaitra, Krishna Tritiya', 'Hindu'],
  ['2027-03-26', 'Friday', 'Good Friday', 'Based on the Christian calendar', 'Christian'],
  ['2027-03-28', 'Sunday', 'Easter', 'Based on the Christian calendar', 'Christian'],

  ['2027-04-01', 'Thursday', 'Bank\'s Holiday', 'Fixed day in the Gregorian calendar', 'Observance'],
  ['2027-04-07', 'Wednesday', 'Ugadi', 'Chaitra, Shukla Pratipada', 'Hindu'],
  ['2027-04-07', 'Wednesday', 'Gudi Padwa', 'Chaitra, Shukla Pratipada', 'Hindu'],
  ['2027-04-08', 'Thursday', 'Jhulelal Jayanti', 'Chaitra, Shukla Pratipada / Dwitiya', 'Hindu'],
  ['2027-04-14', 'Wednesday', 'Solar New Year', 'First day of the Hindu solar calendar', 'Hindu'],
  ['2027-04-14', 'Wednesday', 'Ambedkar Jayanti', 'Fixed day in the Gregorian calendar', 'National'],
  ['2027-04-14', 'Wednesday', 'Baisakhi', 'Observed on Mesha Sankranti', 'Sikh'],
  ['2027-04-15', 'Thursday', 'Rama Navami', 'Chaitra, Shukla Navami', 'Hindu'],
  ['2027-04-19', 'Monday', 'Mahavir Swami Jayanti', 'Chaitra, Shukla Trayodashi', 'Jain'],
  ['2027-04-22', 'Thursday', 'Earth Day', 'Fixed day in the Gregorian calendar', 'Observance'],

  ['2027-05-01', 'Saturday', 'International Workers\' Day', 'Fixed day in the Gregorian calendar', 'Observance'],
  ['2027-05-02', 'Sunday', 'Vallabhacharya Jayanti', 'Vaishakha, Krishna Ekadashi', 'Hindu'],
  ['2027-05-02', 'Sunday', 'World Laughter Day', '1st Sunday of May', 'Observance'],
  ['2027-05-07', 'Friday', 'Rabindranath Tagore Jayanti', 'Fixed day in the Gregorian calendar', 'Observance'],
  ['2027-05-09', 'Sunday', 'Mother\'s Day', '2nd Sunday of May', 'Observance'],
  ['2027-05-10', 'Monday', 'Shankaracharya Jayanti', 'Vaishakha, Shukla Panchami', 'Hindu'],
  ['2027-05-10', 'Monday', 'Surdas Jayanti', 'Vaishakha, Shukla Panchami', 'Hindu'],
  ['2027-05-17', 'Monday', 'Eid al-Adha', 'Based on the Islamic calendar', 'Islamic'],
  ['2027-05-17', 'Monday', 'Bakrid', 'Based on the Islamic calendar', 'Islamic'],
  ['2027-05-20', 'Thursday', 'Buddha Purnima', 'Vaishakha, Shukla Purnima', 'Buddhist'],
  ['2027-05-31', 'Monday', 'World No Tobacco Day', 'Fixed day in the Gregorian calendar', 'Observance'],

  ['2027-06-05', 'Saturday', 'World Environment Day', 'Fixed day in the Gregorian calendar', 'Observance'],
  ['2027-06-06', 'Sunday', 'Al-Hijra', 'Based on the Islamic calendar', 'Islamic'],
  ['2027-06-06', 'Sunday', 'Islamic New Year', 'Based on the Islamic calendar', 'Islamic'],
  ['2027-06-07', 'Monday', 'Maharana Pratap Jayanti', 'Jyeshtha, Shukla Tritiya', 'Hindu'],
  ['2027-06-15', 'Tuesday', 'Day of Ashura', 'Based on the Islamic calendar', 'Islamic'],
  ['2027-06-15', 'Tuesday', 'Muharram', 'Based on the Islamic calendar', 'Islamic'],
  ['2027-06-18', 'Friday', 'Kabirdas Jayanti', 'Jyeshtha, Shukla Purnima', 'Hindu'],
  ['2027-06-20', 'Sunday', 'Father\'s Day', '3rd Sunday of June', 'Observance'],
  ['2027-06-21', 'Monday', 'Longest Day of the Year', 'Astronomy event', 'Astronomy'],
  ['2027-06-21', 'Monday', 'International Yoga Day', 'Fixed day in the Gregorian calendar', 'Observance'],

  ['2027-07-05', 'Monday', 'Jagannath Rathyatra', 'Ashadha, Shukla Dwitiya', 'Hindu'],
  ['2027-07-18', 'Sunday', 'Guru Purnima', 'Ashadha, Shukla Purnima', 'Hindu'],

  ['2027-08-01', 'Sunday', 'Friendship Day', '1st Sunday of August', 'Observance'],
  ['2027-08-08', 'Sunday', 'Tulsidas Jayanti', 'Shravana, Shukla Saptami', 'Hindu'],
  ['2027-08-15', 'Sunday', 'Independence Day', 'Fixed day in the Gregorian calendar', 'National'],
  ['2027-08-15', 'Sunday', 'Milad un-Nabi', 'Based on the Islamic calendar', 'Islamic'],
  ['2027-08-15', 'Sunday', 'Eid-e-Milad', 'Based on the Islamic calendar', 'Islamic'],
  ['2027-08-17', 'Tuesday', 'Raksha Bandhan', 'Shravana, Shukla Purnima', 'Hindu'],
  ['2027-08-17', 'Tuesday', 'Rakhi', 'Shravana, Shukla Purnima', 'Hindu'],
  ['2027-08-25', 'Wednesday', 'Krishna Janmashtami', 'Bhadrapada, Krishna Ashtami', 'Hindu'],

  ['2027-09-04', 'Saturday', 'Ganesh Chaturthi', 'Bhadrapada, Shukla Chaturthi', 'Hindu'],
  ['2027-09-05', 'Sunday', 'Teachers\' Day', 'Fixed day in the Gregorian calendar', 'Observance'],
  ['2027-09-12', 'Sunday', 'Onam', 'Sun in Simha and Shravana Nakshatra', 'Hindu'],
  ['2027-09-14', 'Tuesday', 'Hindi Diwas', 'Fixed day in the Gregorian calendar', 'National'],
  ['2027-09-15', 'Wednesday', 'Visvesvaraya Jayanti', 'Fixed day in the Gregorian calendar', 'Observance'],
  ['2027-09-15', 'Wednesday', 'Engineer\'s Day', 'Fixed day in the Gregorian calendar', 'Observance'],
  ['2027-09-23', 'Thursday', 'Autumnal Equinox', 'Astronomy event', 'Astronomy'],
  ['2027-09-30', 'Thursday', 'Maharaja Agrasen Jayanti', 'Ashwina, Shukla Pratipada', 'Hindu'],

  ['2027-10-02', 'Saturday', 'Gandhi Jayanti', 'Fixed day in the Gregorian calendar', 'National'],
  ['2027-10-07', 'Thursday', 'Durga Ashtami', 'Ashwina, Shukla Ashtami', 'Hindu'],
  ['2027-10-08', 'Friday', 'Maha Navami', 'Ashwina, Shukla Navami', 'Hindu'],
  ['2027-10-09', 'Saturday', 'Dussehra', 'Ashwina, Shukla Dashami', 'Hindu'],
  ['2027-10-10', 'Sunday', 'Madhvacharya Jayanti', 'Ashwina, Shukla Dashami', 'Hindu'],
  ['2027-10-15', 'Friday', 'Valmiki Jayanti', 'Ashwina, Shukla Purnima', 'Hindu'],
  ['2027-10-15', 'Friday', 'Meerabai Jayanti', 'Ashwina, Shukla Purnima', 'Hindu'],
  ['2027-10-18', 'Monday', 'Karwa Chauth', 'Kartika, Krishna Chaturthi', 'Hindu'],
  ['2027-10-28', 'Thursday', 'Narak Chaturdashi', 'Kartika, Krishna Chaturdashi', 'Hindu'],
  ['2027-10-29', 'Friday', 'Lakshmi Puja', 'Kartika, Krishna Amavasya', 'Hindu'],
  ['2027-10-29', 'Friday', 'Diwali', 'Kartika, Krishna Amavasya', 'Hindu'],
  ['2027-10-30', 'Saturday', 'Govardhan Puja', 'Kartika, Shukla Pratipada', 'Hindu'],
  ['2027-10-31', 'Sunday', 'Bhaiya Dooj', 'Kartika, Shukla Dwitiya', 'Hindu'],

  ['2027-11-04', 'Thursday', 'Chhath Puja', 'Kartika, Shukla Shashthi', 'Hindu'],
  ['2027-11-14', 'Sunday', 'Guru Nanak Jayanti', 'Kartika, Shukla Purnima', 'Sikh'],
  ['2027-11-14', 'Sunday', 'Nehru Jayanti', 'Fixed day in the Gregorian calendar', 'National'],
  ['2027-11-14', 'Sunday', 'Children\'s Day', 'Fixed day in the Gregorian calendar', 'National'],

  ['2027-12-01', 'Wednesday', 'World AIDS Day', 'Fixed day in the Gregorian calendar', 'Observance'],
  ['2027-12-12', 'Sunday', 'Hazarat Ali\'s Birthday', 'Based on the Islamic calendar', 'Islamic'],
  ['2027-12-22', 'Wednesday', 'Shortest Day of the Year', 'Astronomy event', 'Astronomy'],
  ['2027-12-25', 'Saturday', 'Merry Christmas', 'Fixed day in the Gregorian calendar', 'Christian']
];

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function formatLong(date) {
  return `${weekdays[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

const rows = festivals.map(([iso, weekday, name, note, type]) => {
  const date = new Date(`${iso}T00:00:00`);
  if (weekdays[date.getDay()] !== weekday) {
    throw new Error(`${name} ${iso} is ${weekdays[date.getDay()]}, not ${weekday}`);
  }
  const opens = new Date(date);
  opens.setDate(opens.getDate() - 60);
  const month = months[date.getMonth()];
  return { iso, date, weekday, name, note, type, opens, month };
});

const byMonth = months.map((month, index) => ({
  ...month,
  items: rows.filter((row) => row.date.getMonth() === index)
}));

const types = [...new Set(rows.map((row) => row.type))];

function dayGroups(items) {
  const groups = [];
  items.forEach((item) => {
    const last = groups[groups.length - 1];
    if (last && last.iso === item.iso) last.items.push(item);
    else groups.push({ iso: item.iso, date: item.date, weekday: item.weekday, month: item.month, opens: item.opens, items: [item] });
  });
  return groups;
}

const monthNav = months.map((month) => {
  const count = byMonth.find((entry) => entry.key === month.key).items.length;
  return `<a href="#${month.key}">${month.short}<span>${count}</span></a>`;
}).join('');

const filters = ['All', ...types].map((type, index) => {
  const count = type === 'All' ? rows.length : rows.filter((row) => row.type === type).length;
  return `<button type="button" class="chip${index === 0 ? ' active' : ''}" data-filter="${esc(type)}" aria-pressed="${index === 0 ? 'true' : 'false'}">${esc(type)}<span>${count}</span></button>`;
}).join('');

const sections = byMonth.map((month) => {
  const days = dayGroups(month.items).map((group) => {
    const events = group.items.map((item) => `
            <li class="event" data-type="${esc(item.type)}" data-search="${esc(`${item.name} ${item.note} ${item.type} ${item.weekday} ${month.label}`.toLowerCase())}">
              <div class="event-top">
                <h3><a id="${slug(item.name)}-${item.iso}" href="#${slug(item.name)}-${item.iso}">${esc(item.name)}</a></h3>
                <span class="badge badge-${esc(item.type.toLowerCase())}">${esc(item.type)}</span>
              </div>
              <p>${esc(item.note)}${item.type === 'Islamic' ? ' · moon sighting can shift this date' : ''}</p>
            </li>`).join('');
    const search = group.items.map((item) => `${item.name} ${item.note} ${item.type}`).join(' ').toLowerCase();
    return `
        <article class="day" id="d-${group.iso}" data-search="${esc(search)}">
          <time class="stamp" datetime="${group.iso}">
            <span class="num">${group.date.getDate()}</span>
            <span class="dow">${group.weekday.slice(0, 3)}</span>
          </time>
          <div class="day-body">
            <ul class="events">${events}
            </ul>
            <a class="book" href="bookingdate/2027/${group.month.key}-booking-date.html">IRCTC opens ${esc(formatLong(group.opens))} · 8:00 AM</a>
          </div>
        </article>`;
  }).join('');

  return `
      <section class="month" id="${month.key}" data-month="${month.key}">
        <div class="month-head">
          <h2>${month.label} 2027</h2>
          <span class="month-count" data-base="${month.items.length}">${month.items.length} festivals</span>
        </div>
        <div class="days">${days}
        </div>
      </section>`;
}).join('');

const itemList = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: '2027 Indian Festivals and Holidays Calendar',
  description: 'Indian festivals, national holidays, and observances in 2027, Vikrama Samvata 2083–2084.',
  numberOfItems: rows.length,
  itemListElement: rows.map((row, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'Event',
      name: row.name,
      startDate: row.iso,
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: {
        '@type': 'Country',
        name: 'India'
      },
      description: row.note
    }
  }))
};

const html = `<!DOCTYPE html>
<html lang="en-IN">
<head>
    <meta name="google-adsense-account" content="ca-pub-5018644317959743">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5018644317959743"
        crossorigin="anonymous"></script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-NL4NTX1D6V"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', 'G-NL4NTX1D6V');
    </script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>2027 Indian Festivals and Holidays Calendar | Vikrama Samvata 2083–2084</title>
    <meta name="description" content="2027 Indian festivals and holidays calendar for Vikrama Samvata 2083–2084. Dates for Diwali, Holi, Eid, Dussehra, Pongal, and national days, with the IRCTC 60-day booking open date.">
    <meta name="keywords" content="2027 Indian festivals calendar, 2027 holidays India, Vikrama Samvata 2083 2084, Diwali 2027 date, Holi 2027, Eid 2027, Dussehra 2027, IRCTC festival booking dates">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <link rel="canonical" href="https://railbookingdate.com/pages/festivals-2027.html">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://railbookingdate.com/pages/festivals-2027.html">
    <meta property="og:title" content="2027 Indian Festivals and Holidays Calendar">
    <meta property="og:description" content="Festival and holiday dates for 2027, Vikrama Samvata 2083–2084, with IRCTC train booking open dates.">
    <meta property="og:locale" content="en_IN">
    <meta property="og:site_name" content="RailBookingDate">
    <link rel="icon" type="image/png" sizes="96x96" href="../favicon-96.png">
    <link rel="shortcut icon" href="../favicon.ico">
    <meta name="theme-color" content="#ff6b00">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,600;9..40,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/navigation.css">
    <script type="application/ld+json">
    ${JSON.stringify(itemList)}
    </script>
    <style>
        :root {
            --bg-app: #f6f1e7;
            --bg-card: #fffdf8;
            --ink: #1c1915;
            --muted: #5c564c;
            --line: #e6dccb;
            --saffron: #e25b12;
            --saffron-deep: #b8430a;
            --navy: #1e3a5f;
            --shadow: 0 16px 40px rgb(48 32 12 / 0.08);
            --font-heading: "DM Sans", system-ui, sans-serif;
            --font-body: "Plus Jakarta Sans", system-ui, sans-serif;
        }
        [data-theme="dark"] {
            --bg-app: #12100e;
            --bg-card: #1c1916;
            --ink: #f6f1e7;
            --muted: #cbbfaa;
            --line: #3a332b;
            --saffron: #ff8a3d;
            --saffron-deep: #ffb07a;
            --navy: #9ec0e6;
            --shadow: none;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            background:
                radial-gradient(900px 420px at 100% -10%, #ffd7b0 0%, transparent 55%),
                radial-gradient(700px 380px at -10% 0%, #f3e2c4 0%, transparent 50%),
                var(--bg-app);
            color: var(--ink);
            font-family: var(--font-body);
            line-height: 1.5;
        }
        [data-theme="dark"] body {
            background:
                radial-gradient(800px 360px at 100% -10%, #3a2414 0%, transparent 55%),
                var(--bg-app);
        }
        a { color: inherit; }
        .wrap { max-width: 980px; margin: 0 auto; padding: 1.25rem 1rem 3rem; }
        .hero {
            background: linear-gradient(145deg, #1e3a5f 0%, #2b241c 58%, #e25b12 140%);
            color: #fffaf3;
            border-radius: 28px;
            padding: 1.6rem 1.4rem 1.35rem;
            box-shadow: var(--shadow);
            margin-bottom: 1rem;
        }
        .eyebrow {
            display: inline-flex;
            gap: 0.45rem;
            align-items: center;
            margin: 0 0 0.7rem;
            padding: 0.28rem 0.7rem;
            border-radius: 999px;
            background: rgb(255 250 243 / 0.14);
            font-size: 0.78rem;
            font-weight: 700;
            letter-spacing: 0.04em;
            text-transform: uppercase;
        }
        h1 {
            font-family: var(--font-heading);
            font-size: clamp(1.85rem, 5vw, 3rem);
            line-height: 1.05;
            letter-spacing: -0.035em;
            margin: 0 0 0.7rem;
            max-width: 16ch;
        }
        .lede { margin: 0; max-width: 62ch; color: #f3e6d4; }
        .stats {
            display: flex;
            flex-wrap: wrap;
            gap: 0.6rem;
            margin-top: 1.15rem;
        }
        .stat {
            min-width: 7.2rem;
            background: rgb(255 250 243 / 0.12);
            border: 1px solid rgb(255 250 243 / 0.16);
            border-radius: 16px;
            padding: 0.65rem 0.8rem;
        }
        .stat b { display: block; font-family: var(--font-heading); font-size: 1.25rem; }
        .stat span { font-size: 0.78rem; color: #f3e6d4; }
        .notice {
            margin: 0 0 1rem;
            padding: 0.9rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--line);
            border-left: 5px solid var(--saffron);
            border-radius: 16px;
        }
        .notice p { margin: 0.3rem 0 0; color: var(--muted); }
        .notice a { color: var(--saffron-deep); font-weight: 700; text-decoration: none; }
        .toolbar {
            position: sticky;
            top: 0;
            z-index: 5;
            background: color-mix(in srgb, var(--bg-app) 88%, transparent);
            backdrop-filter: blur(10px);
            padding: 0.65rem 0 0.75rem;
            margin-bottom: 0.4rem;
        }
        .search {
            width: 100%;
            border: 1px solid var(--line);
            background: var(--bg-card);
            color: var(--ink);
            border-radius: 14px;
            padding: 0.85rem 1rem;
            font: inherit;
            font-size: 1rem;
        }
        .search:focus { outline: 2px solid var(--saffron); border-color: transparent; }
        .chips, .months {
            display: flex;
            gap: 0.45rem;
            overflow-x: auto;
            padding: 0.7rem 0 0.15rem;
            scrollbar-width: none;
        }
        .chips::-webkit-scrollbar, .months::-webkit-scrollbar { display: none; }
        .chip, .months a {
            flex: 0 0 auto;
            border: 1px solid var(--line);
            background: var(--bg-card);
            color: var(--ink);
            border-radius: 999px;
            text-decoration: none;
            font: inherit;
            font-size: 0.82rem;
            font-weight: 700;
            padding: 0.4rem 0.7rem;
            cursor: pointer;
        }
        .chip span, .months a span {
            margin-left: 0.35rem;
            color: var(--muted);
            font-weight: 600;
        }
        .chip.active, .months a:hover, .chip:hover {
            background: var(--navy);
            color: #fffaf3;
            border-color: var(--navy);
        }
        .chip.active span, .months a:hover span { color: #f3e6d4; }
        .month { margin-top: 1.35rem; }
        .month-head {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            gap: 1rem;
            margin-bottom: 0.65rem;
        }
        .month-head h2 {
            font-family: var(--font-heading);
            font-size: 1.45rem;
            letter-spacing: -0.03em;
            margin: 0;
        }
        .month-count { color: var(--muted); font-size: 0.85rem; font-weight: 700; }
        .days {
            background: var(--bg-card);
            border: 1px solid var(--line);
            border-radius: 22px;
            box-shadow: var(--shadow);
            overflow: hidden;
        }
        .day {
            display: grid;
            grid-template-columns: 4.6rem 1fr;
            gap: 0.2rem 0.85rem;
            padding: 0.95rem 1rem 1rem;
            border-top: 1px solid var(--line);
        }
        .day:first-child { border-top: 0; }
        .stamp {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #fff4ea;
            color: var(--saffron-deep);
            border-radius: 16px;
            min-height: 4.4rem;
            padding: 0.35rem;
        }
        [data-theme="dark"] .stamp { background: #2c2118; }
        .num { font-family: var(--font-heading); font-size: 1.55rem; line-height: 1; letter-spacing: -0.04em; }
        .dow { font-size: 0.72rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; }
        .events { list-style: none; margin: 0; padding: 0; }
        .event + .event { margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px dashed var(--line); }
        .event-top { display: flex; justify-content: space-between; gap: 0.6rem; align-items: flex-start; }
        .event h3 { margin: 0; font-size: 1.02rem; letter-spacing: -0.02em; }
        .event h3 a { text-decoration: none; }
        .event h3 a:hover { color: var(--saffron-deep); }
        .event p { margin: 0.2rem 0 0; color: var(--muted); font-size: 0.9rem; }
        .badge {
            flex: 0 0 auto;
            border-radius: 999px;
            padding: 0.15rem 0.5rem;
            font-size: 0.68rem;
            font-weight: 800;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            background: #f3eee4;
            color: #5c564c;
        }
        .badge-hindu { background: #ffe8d6; color: #9a3412; }
        .badge-national { background: #dbeafe; color: #1e3a8a; }
        .badge-islamic { background: #dcfce7; color: #166534; }
        .badge-christian { background: #fee2e2; color: #991b1b; }
        .badge-sikh { background: #ffedd5; color: #9a3412; }
        .badge-jain { background: #fef3c7; color: #92400e; }
        .badge-buddhist { background: #fce7f3; color: #9d174d; }
        .badge-parsi { background: #ccfbf1; color: #115e59; }
        .badge-astronomy { background: #e0e7ff; color: #3730a3; }
        .badge-observance { background: #f3eee4; color: #5c564c; }
        [data-theme="dark"] .badge { background: #2a2622; color: #f6f1e7; }
        .book {
            display: inline-block;
            margin-top: 0.7rem;
            color: var(--saffron-deep);
            font-size: 0.84rem;
            font-weight: 700;
            text-decoration: none;
        }
        .book:hover { text-decoration: underline; }
        .empty {
            display: none;
            margin-top: 1rem;
            padding: 1.2rem;
            text-align: center;
            color: var(--muted);
            background: var(--bg-card);
            border: 1px dashed var(--line);
            border-radius: 16px;
        }
        .empty.show { display: block; }
        .back { display: inline-block; margin-top: 1.4rem; color: var(--saffron-deep); font-weight: 700; }
        [hidden] { display: none !important; }
        @media (max-width: 640px) {
            .day { grid-template-columns: 3.7rem 1fr; padding: 0.8rem; }
        }
    </style>
</head>
<body>
    <div class="wrap">
        <nav class="main-nav">
            <a href="../index.html">Calculator</a>
            <a href="tatkal.html">Tatkal Dates</a>
            <a href="holidays-2027.html">2027 Holidays</a>
            <a href="festivals-2027.html" class="active">2027 Festivals</a>
            <a href="faq.html">FAQ</a>
            <a href="helpline.html">Helpline</a>
        </nav>
        <header class="hero">
            <p class="eyebrow">Vikrama Samvata 2083–2084</p>
            <h1>2027 Indian Festivals and Holidays</h1>
            <p class="lede">A full-year calendar of festivals, national days, and observances, with the morning IRCTC general reservation opens for travel on that date.</p>
            <div class="stats">
                <div class="stat"><b>${rows.length}</b><span>festivals listed</span></div>
                <div class="stat"><b>12</b><span>months of 2027</span></div>
                <div class="stat"><b>60 days</b><span>before journey, 8:00 AM</span></div>
            </div>
        </header>
        <div class="notice">
            <strong>Train tickets for festival travel open 60 days before the journey date.</strong>
            <p>The link under each date is the IRCTC opening morning for boarding that day. Lunar dates, especially Eid, Bakrid, Muharram, and Milad-un-Nabi, can move by a day after moon sighting. Booking windows for the day before a holiday are on the <a href="holidays-2027.html">2027 holiday booking calendar</a>.</p>
        </div>
        <div class="toolbar">
            <label class="sr" for="festival-search" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);">Search festivals</label>
            <input id="festival-search" class="search" type="search" placeholder="Search Diwali, Holi, Eid, tithi, or a month" autocomplete="off">
            <div class="chips" role="toolbar" aria-label="Filter by type">${filters}</div>
            <nav class="months" aria-label="Months">${monthNav}</nav>
        </div>
        <p class="empty" id="empty-state">No festivals match that search.</p>
        ${sections}
        <a class="back" href="../index.html">Back to the booking date calculator</a>
        <footer class="site-footer-nav">
            <a href="../index.html">Calculator</a>
            <a href="tatkal.html">Tatkal Dates</a>
            <a href="holidays-2027.html">2027 Holidays</a>
            <a href="stations/index.html">Station Codes</a>
            <a href="disclaimer.html">Disclaimer</a>
        </footer>
    </div>
    <script>
        (function () {
            const input = document.getElementById('festival-search');
            const empty = document.getElementById('empty-state');
            const chips = Array.from(document.querySelectorAll('.chip'));
            const months = Array.from(document.querySelectorAll('.month'));
            let active = 'All';

            function apply() {
                const query = input.value.trim().toLowerCase();
                let visibleEvents = 0;
                months.forEach(function (month) {
                    let count = 0;
                    month.querySelectorAll('.day').forEach(function (day) {
                        let dayVisible = false;
                        day.querySelectorAll('.event').forEach(function (event) {
                            const typeOk = active === 'All' || event.dataset.type === active;
                            const textOk = !query || event.dataset.search.indexOf(query) !== -1 || day.id.indexOf(query) !== -1;
                            const show = typeOk && textOk;
                            event.hidden = !show;
                            if (show) {
                                dayVisible = true;
                                count += 1;
                            }
                        });
                        day.hidden = !dayVisible;
                    });
                    month.hidden = count === 0;
                    const label = month.querySelector('.month-count');
                    label.textContent = count + (count === 1 ? ' festival' : ' festivals');
                    visibleEvents += count;
                });
                empty.classList.toggle('show', visibleEvents === 0);
            }

            chips.forEach(function (chip) {
                chip.addEventListener('click', function () {
                    active = chip.dataset.filter;
                    chips.forEach(function (item) {
                        const on = item === chip;
                        item.classList.toggle('active', on);
                        item.setAttribute('aria-pressed', on ? 'true' : 'false');
                    });
                    apply();
                });
            });
            input.addEventListener('input', apply);
        }());
    </script>
</body>
</html>
`;

const out = path.join(__dirname, '..', 'pages', 'festivals-2027.html');
fs.writeFileSync(out, html);
console.log(`Wrote ${rows.length} festivals to ${out}`);
