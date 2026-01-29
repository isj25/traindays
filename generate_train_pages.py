import csv
import os
import re

def slugify(text):
    return re.sub(r'[\s_]+', '-', text.lower().strip())

def generate_html(source, destination, trains):
    # Dynamic SEO content
    title = f"Trains between {source} and {destination} | Trains from {source} to {destination}"
    description = f"List of trains between {source} and {destination}. Get train numbers, names, and schedules. Calculate your booking date for IRCTC 60 days advance reservation."
    keywords = f"trains between {source} and {destination}, trains from {source} to {destination}, {source} to {destination} trains, IRCTC booking date calculator, Indian Railways"

    # JSON-LD Structured Data for SEO
    json_ld = f"""
    {{
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Trains between {source} and {destination}",
      "description": "{description}",
      "itemListElement": [
"""
    for i, train in enumerate(trains):
        json_ld += f"""        {{
          "@type": "ListItem",
          "position": {i+1},
          "item": {{
            "@type": "Service",
            "name": "{train['name']} ({train['number']})",
            "description": "Train from {source} to {destination}"
          }}
        }}{',' if i < len(trains) - 1 else ''}
"""
    json_ld += """      ]
    }
    """

    html_template = f"""<!DOCTYPE html>
<html lang="en-IN">

<head>
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-NL4NTX1D6V"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() {{ dataLayer.push(arguments); }}
        gtag('js', new Date());
        gtag('config', 'G-NL4NTX1D6V');
    </script>
    
    <!-- Google Adsense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5018644317959743"
     crossorigin="anonymous"></script>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <meta name="description" content="{description}">
    <meta name="keywords" content="{keywords}">

    <!-- Favicon and Icons -->
    <link rel="icon" type="image/png" sizes="48x48" href="../../favicon-48.png">
    <link rel="icon" type="image/png" sizes="96x96" href="../../favicon-96.png">
    <link rel="icon" type="image/png" sizes="144x144" href="../../favicon-144.png">
    <link rel="icon" type="image/png" sizes="192x192" href="../../icon-192.png">
    <link rel="icon" type="image/x-icon" sizes="any" href="../../favicon.ico">
    <link rel="apple-touch-icon" href="../../icon-192.png">

    <meta name="theme-color" content="#ff6b00">

    <script type="application/ld+json">
    {json_ld}
    </script>

    <style>
        :root {{
            --bg-app: #fef7ed;
            --bg-card: #ffffff;
            --text-primary: #1a365d;
            --text-secondary: #4a5568;
            --text-tertiary: #718096;
            --primary: #ff6b00;
            --primary-light: #fff3e6;
            --border-light: #fed7aa;
            --font-heading: 'DM Sans', system-ui, -apple-system, sans-serif;
            --font-body: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        }}

        [data-theme="dark"] {{
            --bg-app: #0f1729;
            --bg-card: #1a2744;
            --text-primary: #f7fafc;
            --text-secondary: #cbd5e0;
            --text-tertiary: #a0aec0;
            --primary: #ff8533;
            --primary-light: #2d1f0f;
            --border-light: #3d4f6f;
        }}

        body {{
            background-color: var(--bg-app);
            color: var(--text-primary);
            font-family: var(--font-body);
            line-height: 1.6;
            margin: 0;
            padding: 0;
            min-height: 100vh;
        }}

        .app-container {{
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem 1rem;
        }}

        .app-header {{
            text-align: center;
            margin-bottom: 2rem;
        }}

        .app-header h1 {{
            font-family: var(--font-heading);
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }}

        .back-link {{
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--primary);
            text-decoration: none;
            font-weight: 600;
            margin-bottom: 2rem;
        }}

        .train-list-section, .info-section {{
            background: var(--bg-card);
            border-radius: 16px;
            padding: 1.5rem;
            border: 1px solid var(--border-light);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
        }}

        .train-list-section {{
            overflow-x: auto;
        }}

        table {{
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }}

        th, td {{
            padding: 12px;
            border-bottom: 1px solid var(--border-light);
        }}

        th {{
            color: var(--primary);
            font-family: var(--font-heading);
            font-weight: 700;
        }}

        .disclaimer {{
            font-size: 0.85rem;
            color: var(--text-tertiary);
            text-align: center;
            margin-top: 1rem;
        }}

        .info-section h2 {{
            color: var(--primary);
            font-family: var(--font-heading);
            font-size: 1.5rem;
            margin-top: 0;
        }}

        .nav-links {{
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            margin: 2rem 0;
            flex-wrap: wrap;
        }}

        .nav-links a {{
            color: var(--text-secondary);
            text-decoration: none;
            font-weight: 600;
            font-size: 0.9rem;
            padding: 0.5rem 1rem;
            border: 1px solid var(--border-light);
            border-radius: 99px;
            background: var(--bg-card);
        }}

        .nav-links a:hover, .nav-links a.active {{
            border-color: var(--primary);
            color: var(--primary);
        }}

        .site-footer {{
            margin-top: 4rem;
            text-align: center;
            color: var(--text-tertiary);
            font-size: 0.9rem;
        }}

        .cta-box {{
            text-align: center;
            background: var(--primary-light);
            padding: 1.5rem;
            border-radius: 16px;
            border: 1px dashed var(--primary);
            margin-bottom: 2rem;
        }}

        .cta-button {{
            color: white;
            background: var(--primary);
            font-weight: 700;
            text-decoration: none;
            padding: 0.75rem 1.5rem;
            border-radius: 99px;
            display: inline-block;
            margin-top: 1rem;
            box-shadow: 0 4px 12px rgba(255, 107, 0, 0.3);
        }}

        @media (max-width: 600px) {{
            .app-header h1 {{ font-size: 1.5rem; }}
        }}
    </style>
    <script>
        (function () {{ var t = localStorage.getItem('theme'); if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark') }})();
    </script>
</head>

<body>
    <div class="app-container">
        <a href="../../index.html" class="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Calculator
        </a>

        <nav class="nav-links">
            <a href="../../index.html">Calculator</a>
            <a href="../faq.html">FAQs</a>
            <a href="../helpline.html">Helpline</a>
            <a href="../tatkal.html">Tatkal Dates</a>
        </nav>

        <header class="app-header">
            <h1>Trains between {source} and {destination}</h1>
            <p>Looking for trains between <strong>{source}</strong> and <strong>{destination}</strong>? Here is the list of available trains with their numbers and schedules.</p>
        </header>

        <div class="cta-box">
            <h3>Plan your journey in advance!</h3>
            <p>Indian Railways allows booking up to 60 days in advance. Use our calculator to find the exact opening date.</p>
            <a href="../../index.html" class="cta-button">Open IRCTC Booking Calculator</a>
        </div>

        <main class="train-list-section">
            <h2>Train List: {source} and {destination}</h2>
            <table>
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Train Name</th>
                        <th>Starting Station</th>
                        <th>Ending Station</th>
                    </tr>
                </thead>
                <tbody>
"""
    for train in trains:
        html_template += f"""                    <tr>
                        <td><strong>{train['number']}</strong></td>
                        <td>{train['name']}</td>
                        <td>{train['source']}</td>
                        <td>{train['destination']}</td>
                    </tr>
"""
    
    html_template += f"""                </tbody>
            </table>
        </main>

        <section class="info-section">
            <h2>Travel Information: {source} and {destination}</h2>
            <p>Traveling between {source} and {destination} is now easier with multiple train options. Whether you are looking for express, superfast, or passenger trains, this route connects key locations efficiently.</p>
            
            <h3>Indian Railways Booking Tips</h3>
            <ul>
                <li><strong>Advance Reservation Period (ARP):</strong> Book your tickets up to 60 days before the journey to ensure confirmed seats.</li>
                <li><strong>Booking Time:</strong> General bookings start at 8:00 AM IST daily. Tatkal bookings open at 10:00 AM for AC and 11:00 AM for Sleeper classes.</li>
                <li><strong>Check Accuracy:</strong> Always refer to the official IRCTC website for the latest timings and platform numbers.</li>
            </ul>
            <p>Need more help? Check our <a href="../faq.html" style="color: var(--primary); font-weight: 600;">Frequently Asked Questions</a> about rail bookings.</p>
        </section>

        <p class="disclaimer">Note: Train schedules and availability are subject to change. Please verify on the official Indian Railways / IRCTC portal before planning your trip.</p>

        <footer class="site-footer">
            <p>&copy; 2026 RailBookingDate - Created by Ishwar Joshi | <a href="../disclaimer.html" style="color: var(--primary); text-decoration: none;">Disclaimer</a> | <a href="../privacy-policy.html" style="color: var(--primary); text-decoration: none;">Privacy</a></p>
        </footer>
    </div>
</body>
</html>
"""
    return html_template

def main():
    base_dir = '/Users/ishwarjoshi/Ishwar Joshi/work/traindays'
    csv_file = os.path.join(base_dir, 'trains.csv')
    output_dir = os.path.join(base_dir, 'pages/trains')
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    train_groups = {}
    
    print(f"Reading CSV from: {csv_file}")
    with open(csv_file, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        # Handle potential variations in CSV headers
        # Expected: train number, train name, starting station, ending station
        # Mapping them internally
        fieldnames = reader.fieldnames
        num_key = next((k for k in fieldnames if any(x in k.lower() for x in ['number', 'no.'])), 'train number')
        name_key = next((k for k in fieldnames if 'name' in k.lower()), 'train name')
        src_key = next((k for k in fieldnames if any(x in k.lower() for x in ['starting', 'source', 'starts'])), 'starting station')
        dest_key = next((k for k in fieldnames if any(x in k.lower() for x in ['ending', 'destination', 'ends', 'end'])), 'ending station')

        print(f"Mapped keys: num={num_key}, name={name_key}, src={src_key}, dest={dest_key}")

        for row in reader:
            src = row[src_key].strip().upper()
            dest = row[dest_key].strip().upper()
            train = {
                'number': row[num_key].strip(),
                'name': row[name_key].strip(),
                'source': src,
                'destination': dest
            }
            
            key = (src, dest)
            if key not in train_groups:
                train_groups[key] = []
            train_groups[key].append(train)
            
    for (src, dest), trains in train_groups.items():
        # Using sorted stations for the filename to group reverse routes
        stations = sorted([src, dest])
        # We check if we already generated a page for this sorted pair
        filename = f"train-between-{slugify(stations[0])}-{slugify(stations[1])}.html"
        filepath = os.path.join(output_dir, filename)
        
        # If the page already exists, we append to it (or rather, we re-generate with the full list)
        # But wait, it's better to just group them BEFORE the loop.
        pass

    # Better grouping logic:
    consolidated_groups = {}
    for (src, dest), trains in train_groups.items():
        key = tuple(sorted([src, dest]))
        if key not in consolidated_groups:
            consolidated_groups[key] = []
        consolidated_groups[key].extend(trains)

    # Delete existing pages to ensure a clean state
    if os.path.exists(output_dir):
        import shutil
        shutil.rmtree(output_dir)
    os.makedirs(output_dir)

    sitemap_entries = [
        ("https://railbookingdate.com/", "1.0", "daily"),
        ("https://railbookingdate.com/pages/tatkal.html", "0.8", "weekly"),
        ("https://railbookingdate.com/pages/news.html", "0.8", "daily"),
        ("https://railbookingdate.com/pages/faq.html", "0.7", "monthly"),
        ("https://railbookingdate.com/pages/ewallet.html", "0.7", "monthly"),
        ("https://railbookingdate.com/pages/helpline.html", "0.7", "monthly"),
        ("https://railbookingdate.com/pages/videos.html", "0.6", "weekly"),
        ("https://railbookingdate.com/pages/disclaimer.html", "0.5", "monthly"),
        ("https://railbookingdate.com/pages/privacy-policy.html", "0.5", "monthly"),
        ("https://railbookingdate.com/pages/about-us.html", "0.5", "monthly"),
        ("https://railbookingdate.com/pages/contact-us.html", "0.5", "monthly"),
    ]

    for (s1, s2), trains in consolidated_groups.items():
        filename = f"train-between-{slugify(s1)}-{slugify(s2)}.html"
        filepath = os.path.join(output_dir, filename)
        
        print(f"Generating {filepath} with {len(trains)} trains...")
        html_content = generate_html(s1, s2, trains)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        sitemap_entries.append((f"https://railbookingdate.com/pages/trains/{filename}", "0.6", "weekly"))

    # Generate sitemap.xml
    sitemap_path = os.path.join(base_dir, 'sitemap.xml')
    print(f"Generating sitemap at: {sitemap_path}")
    
    from datetime import datetime
    today = datetime.now().strftime('%Y-%m-%d')
    
    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    for loc, priority, freq in sitemap_entries:
        xml_content += f'    <url>\n'
        xml_content += f'        <loc>{loc}</loc>\n'
        xml_content += f'        <lastmod>{today}</lastmod>\n'
        xml_content += f'        <changefreq>{freq}</changefreq>\n'
        xml_content += f'        <priority>{priority}</priority>\n'
        xml_content += f'    </url>\n'
    
    xml_content += '</urlset>'
    
    with open(sitemap_path, 'w', encoding='utf-8') as f:
        f.write(xml_content)

if __name__ == "__main__":
    main()
