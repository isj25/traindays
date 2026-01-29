import os
import re

def update_train_pages():
    trains_dir = "/Users/ishwarjoshi/Ishwar Joshi/work/traindays/pages/trains"
    
    # New navigation HTML
    main_nav = """        <nav class="main-nav">
            <a href="../../index.html">Calculator</a>
            <a href="../tatkal.html">Tatkal Dates</a>
            <a href="../news.html">Rail News</a>
            <a href="../faq.html">FAQ</a>
            <a href="../ewallet.html">eWallet</a>
            <a href="../helpline.html">Helpline</a>
            <a href="../videos.html">Train Videos</a>
            <a href="../about-us.html">About</a>
            <a href="../privacy-policy.html">Privacy</a>
            <a href="../contact-us.html">Contact</a>
            <a href="../disclaimer.html">Disclaimer</a>
        </nav>"""

    # New footer HTML
    site_footer = """        <footer class="site-footer">
            <p>&copy; 2026 RailBookingDate - Created by Ishwar Joshi</p>
            <nav class="site-footer-nav">
                <a href="../../index.html">Calculator</a>
                <a href="../tatkal.html">Tatkal Dates</a>
                <a href="../news.html">Rail News</a>
                <a href="../faq.html">FAQ</a>
                <a href="../ewallet.html">eWallet</a>
                <a href="../helpline.html">Helpline</a>
                <a href="../videos.html">Train Videos</a>
                <a href="../about-us.html">About Us</a>
                <a href="../privacy-policy.html">Privacy Policy</a>
                <a href="../contact-us.html">Contact Us</a>
                <a href="../disclaimer.html">Disclaimer</a>
            </nav>
        </footer>"""

    files = [f for f in os.listdir(trains_dir) if f.endswith(".html")]
    print(f"Found {len(files)} files to update.")

    for filename in files:
        filepath = os.path.join(trains_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # 1. Add navigation.css to head
        if 'navigation.css' not in content:
            content = content.replace('</head>', '    <link rel="stylesheet" href="../../css/navigation.css">\n</head>')

        # 2. Replace header nav
        # The existing nav is <nav class="nav-links"> ... </nav>
        nav_pattern = re.compile(r'<nav class="nav-links">.*?</nav>', re.DOTALL)
        content = nav_pattern.sub(main_nav.strip(), content)

        # 3. Replace footer
        footer_pattern = re.compile(r'<footer class="site-footer">.*?</footer>', re.DOTALL)
        content = footer_pattern.sub(site_footer.strip(), content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

    print("Successfully updated all train pages.")

if __name__ == "__main__":
    update_train_pages()
