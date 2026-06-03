import re
import sys

def convert_style(match):
    style_str = match.group(1)
    rules = style_str.split(';')
    result = []
    for r in rules:
        r = r.strip()
        if not r: continue
        if ':' not in r: continue
        parts = r.split(':', 1)
        k = parts[0].strip()
        v = parts[1].strip()
        # camelCase the key
        k = re.sub(r'-([a-z])', lambda m: m.group(1).upper(), k)
        # Handle quotes inside value
        v = v.replace('"', "'")
        result.append(f"{k}: \"{v}\"")
    return "style={{" + ", ".join(result) + "}}"

def html_to_jsx(html):
    # class to className
    html = html.replace('class="', 'className="')
    # for to htmlFor
    html = html.replace('for="', 'htmlFor="')
    
    # inline styles
    html = re.sub(r'style="([^"]*)"', convert_style, html)
    
    # self-closing tags (simple heuristic)
    html = re.sub(r'<(img|input|br|hr)([^>]*)>', lambda m: f"<{m.group(1)}{m.group(2)}{'/' if not m.group(2).endswith('/') else ''}>", html)
    
    # Remove HTML comments if they contain special chars? Let's leave them, JSX comments are {/* */}
    # Simple comment replacement
    html = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', html, flags=re.DOTALL)

    return html

def convert_file(in_path, out_path, component_name, start_tag="<body", end_tag="</body>"):
    with open(in_path, 'r') as f:
        content = f.read()
    
    start_idx = content.find(start_tag)
    if start_idx == -1:
        start_idx = 0
    else:
        start_idx = content.find('>', start_idx) + 1
        
    end_idx = content.rfind(end_tag)
    if end_idx == -1:
        end_idx = len(content)
        
    body_content = content[start_idx:end_idx]
    
    # Also strip script tags
    body_content = re.sub(r'<script.*?>.*?</script>', '', body_content, flags=re.DOTALL)
    
    jsx = html_to_jsx(body_content)
    
    with open(out_path, 'w') as f:
        f.write(f"import React from 'react';\n\nexport default function {component_name}() {{\n  return (\n    <>\n{jsx}\n    </>\n  );\n}}\n")

convert_file("referance/index.html", "src/src/pages/Home.jsx", "Home")
convert_file("referance/chat.html", "src/src/pages/Chat.jsx", "Chat")
convert_file("referance/dashboard.html", "src/src/pages/Dashboard.jsx", "Dashboard")
convert_file("referance/onboarding.html", "src/src/pages/Onboarding.jsx", "Onboarding")
