
import os
import re

def get_canonical_url(rel_path):
    base = "https://railbookingdate.com/"
    # Normalize path separator
    rel_path = rel_path.replace(os.sep, '/')
    
    if rel_path == 'index.html':
        return base
    
    # Ensure it doesn't start with slash for joining
    if rel_path.startswith('/'):
        rel_path = rel_path[1:]
        
    return base + rel_path

def add_canonical_tag(file_path, rel_path):
    canonical_url = get_canonical_url(rel_path)
    tag = f'<link rel="canonical" href="{canonical_url}">'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Check if exists
    if '<link rel="canonical"' in content:
        # Replace existing
        print(f"Updating canonical for {rel_path}")
        content = re.sub(r'<link rel="canonical"[^>]*>', tag, content)
    else:
        # Insert
        print(f"Adding canonical for {rel_path}")
        # Try to insert after <title> or <head>
        if '</title>' in content:
            content = content.replace('</title>', f'</title>\n    {tag}')
        elif '<head>' in content:
            content = content.replace('<head>', f'<head>\n    {tag}')
        else:
             print(f"Warning: No <head> or </title> found in {rel_path}")
             return
             
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    base_dir = '/Users/ishwarjoshi/Ishwar Joshi/work/traindays'
    
    # 1. Root index.html
    add_canonical_tag(os.path.join(base_dir, 'index.html'), 'index.html')
    
    # 2. Pages directory
    pages_dir = os.path.join(base_dir, 'pages')
    if os.path.exists(pages_dir):
        for root, dirs, files in os.walk(pages_dir):
            for file in files:
                if file.endswith('.html'):
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, base_dir)
                    add_canonical_tag(file_path, rel_path)
    
    print("Canonical tags updated.")

if __name__ == "__main__":
    main()
