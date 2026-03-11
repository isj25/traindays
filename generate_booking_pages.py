import datetime
import os

import urllib.parse

def get_booking_date(journey_date, days_before):
    return journey_date - datetime.timedelta(days=days_before)

def get_google_cal_link(date_obj, hour, title, details):
    # IRCTC times are IST (UTC+5:30)
    # 8 AM IST = 02:30 UTC
    # 10 AM IST = 04:30 UTC
    # 11 AM IST = 05:30 UTC
    
    start_time = datetime.datetime(date_obj.year, date_obj.month, date_obj.day, hour, 0)
    # Convert IST to UTC for the link format (subtract 5.5 hours)
    utc_start = start_time - datetime.timedelta(hours=5, minutes=30)
    utc_end = utc_start + datetime.timedelta(minutes=30)
    
    fmt = "%Y%m%dT%H%M%SZ"
    dates = f"{utc_start.strftime(fmt)}/{utc_end.strftime(fmt)}"
    
    base_url = "https://calendar.google.com/calendar/render?action=TEMPLATE"
    params = {
        "text": title,
        "dates": dates,
        "details": details,
        "location": "IRCTC Official Website"
    }
    return base_url + "&" + urllib.parse.urlencode(params)

def generate_month_page(year, month, output_dir):
    month_name = datetime.date(year, month, 1).strftime('%B')
    month_slug = month_name.lower()
    filename = f"{month_slug}-booking-date.html"
    filepath = os.path.join(output_dir, filename)
    
    title = f"{month_name} 2026 Train Ticket Booking Dates - IRCTC Calendar"
    description = f"Check IRCTC train ticket booking dates for {month_name} 2026. Find when general reservation (60 days ARP) and Tatkal booking opens for your travel date."
    
    html_content = f"""<!DOCTYPE html>
<html lang="en-IN">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <meta name="description" content="{description}">
    <link rel="canonical" href="https://railbookingdate.com/pages/bookingdate/{filename}">
    
    <link rel="icon" type="image/png" sizes="96x96" href="../../favicon-96.png">
    <link rel="shortcut icon" href="../../favicon.ico">
    <meta name="theme-color" content="#ff6b00">

    <link rel="stylesheet" href="../../css/navigation.css">
    
    <style>
        :root {{
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
        }}

        [data-theme="dark"] {{
            --bg-app: #0b1220;
            --bg-card: #121c2e;
            --text-primary: #f8fafc;
            --text-secondary: #cbd5e1;
            --border-light: #243249;
        }}

        body {{
            margin: 0;
            font-family: var(--font-body);
            color: var(--text-primary);
            background: var(--bg-app);
            line-height: 1.5;
            min-height: 100vh;
        }}

        .app-container {{
            max-width: 1000px;
            margin: 0 auto;
            padding: 2rem 1rem;
        }}

        header {{
            text-align: center;
            margin-bottom: 2rem;
        }}

        .main-nav {{
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }}

        .main-nav a {{
            text-decoration: none;
            color: var(--text-secondary);
            font-weight: 600;
            font-size: 0.9rem;
        }}

        .main-nav a:hover {{
            color: var(--primary);
        }}

        h1 {{
            font-family: var(--font-heading);
            font-size: clamp(1.5rem, 4vw, 2.2rem);
            color: var(--primary);
            margin-bottom: 0.5rem;
            letter-spacing: -0.02em;
        }}

        .subtitle {{
            color: var(--text-secondary);
            font-size: 1.1rem;
        }}

        .card {{
            background: var(--bg-card);
            border-radius: 20px;
            padding: 1.5rem;
            box-shadow: var(--shadow-card);
            border: 1px solid var(--border-light);
            overflow-x: auto;
        }}

        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
            font-size: 0.95rem;
            min-width: 600px;
        }}

        th, td {{
            padding: 14px;
            text-align: left;
            border-bottom: 1px solid var(--border-light);
        }}

        th {{
            background: var(--bg-app);
            color: var(--text-secondary);
            font-weight: 700;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
        }}

        tr:last-child td {{
            border-bottom: none;
        }}

        tr:hover {{
            background: #fff7ed;
        }}

        .book-btn {{
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
        }}

        .book-btn:hover {{
            background: var(--primary-dark);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);
        }}

        .cal-link {{
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
        }}

        .cal-link:hover {{
            background: white;
            border-color: var(--primary);
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }}

        .date-tag {{
            font-weight: 700;
            color: var(--text-primary);
        }}

        .time-tag {{
            font-size: 0.8rem;
            color: var(--text-secondary);
            display: block;
            margin-top: 2px;
        }}

        .seo-string {{
            font-size: 0.8rem;
            color: var(--text-tertiary);
            display: block;
            margin-top: 4px;
            font-style: italic;
        }}

        footer {{
            text-align: center;
            margin-top: 4rem;
            color: var(--text-tertiary);
            font-size: 0.9rem;
            padding-bottom: 2rem;
        }}
        
        @media (max-width: 600px) {{
            .app-container {{
                padding: 1rem 0.5rem;
            }}
            .card {{
                padding: 1rem;
                border-radius: 12px;
            }}
            th, td {{
                padding: 10px 8px;
            }}
        }}
    </style>
</head>

<body>
    <div class="app-container">
        <header>
            <nav class="main-nav">
                <a href="../../index.html">Calculator</a>
                <a href="../tatkal.html">Tatkal Dates</a>
                <a href="../news.html">Rail News</a>
                <a href="../faq.html">FAQ</a>
                <a href="../helpline.html">Helpline</a>
            </nav>
            <h1>{month_name} 2026 Train Booking Calendar</h1>
            <p class="subtitle">Complete list of IRCTC booking opening dates for journey dates in {month_name} 2026</p>
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
                <tbody>"""

    # Generate dates for the month
    start_date = datetime.date(year, month, 1)
    if month == 12:
        end_date = datetime.date(year + 1, 1, 1)
    else:
        end_date = datetime.date(year, month + 1, 1)
    
    curr = start_date
    while curr < end_date:
        gen_date = get_booking_date(curr, 60)
        tatkal_date = get_booking_date(curr, 1)
        
        journey_str = curr.strftime('%d %B %Y (%a)')
        search_string = curr.strftime('%d %B').lower() + " booking date"
        gen_str = gen_date.strftime('%d %B %Y')
        tat_str = tatkal_date.strftime('%d %B %Y')
        
        # Calendar links
        details = f"Booking opens for journey date {journey_str}. Book now at https://www.irctc.co.in/nget/train-search"
        gen_cal = get_google_cal_link(gen_date, 8, f"IRCTC Booking: {journey_str} (General)", details)
        ac_cal = get_google_cal_link(tatkal_date, 10, f"IRCTC AC Tatkal: {journey_str}", details)
        sl_cal = get_google_cal_link(tatkal_date, 11, f"IRCTC SL Tatkal: {journey_str}", details)
        
        html_content += f"""
                    <tr>
                        <td class="date-tag">
                            {journey_str}
                            <span class="seo-string">{search_string}</span>
                        </td>
                        <td>
                            <span class="date-tag">{gen_str}</span>
                            <span class="time-tag">8:00 AM IST</span>
                            <a href="{gen_cal}" target="_blank" class="cal-link">Set Reminder</a>
                        </td>
                        <td>
                            <span class="date-tag">{tat_str}</span>
                            <span class="time-tag">10:00 AM IST</span>
                            <a href="{ac_cal}" target="_blank" class="cal-link">Set Reminder</a>
                        </td>
                        <td>
                            <span class="date-tag">{tat_str}</span>
                            <span class="time-tag">11:00 AM IST</span>
                            <a href="{sl_cal}" target="_blank" class="cal-link">Set Reminder</a>
                        </td>
                        <td>
                            <a href="https://www.irctc.co.in/nget/train-search" class="book-btn" target="_blank">Book Now</a>
                        </td>
                    </tr>"""
        curr += datetime.timedelta(days=1)

    html_content += f"""
                </tbody>
            </table>
        </main>

        <footer>
            <p>&copy; 2026 RailBookingDate - Accurate IRCTC Booking Calendars</p>
        </footer>
    </div>
</body>
</html>"""

    with open(filepath, 'w') as f:
        f.write(html_content)
    print(f"Generated {filepath}")

# Generate pages for April to Dec 2026
output_dir = "/Users/joshi/Ishwar Joshi/work/traindays/pages/bookingdate"
for month in range(4, 13):
    generate_month_page(2026, month, output_dir)
