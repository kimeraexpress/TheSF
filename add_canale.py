import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]
tg_icon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z"/></svg>'
tg_icon_large = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z"/></svg>'

details_pattern = r'(<a href="[^"]+" target="_blank" rel="noopener noreferrer" class="btn-quick-top btn-quick-signal"[^>]*>.*?</a>)'
details_canale = f'\\1\n        <a href="https://t.me/+C-LbGVph_EZiOGVk" target="_blank" rel="noopener noreferrer" class="btn-quick-top btn-quick-tg" aria-label="Canale Telegram">\n          {tg_icon_large}\n          Canale\n        </a>'

chip_pattern = r'(<a href="[^"]+" target="_blank" rel="noopener noreferrer" class="btn-chip-chat btn-chip-signal"[^>]*>.*?</a>)'
chip_canale = f'\\1\n        <a href="https://t.me/+C-LbGVph_EZiOGVk" target="_blank" rel="noopener noreferrer" class="btn-chip-chat btn-chip-tg" aria-label="Canale Telegram">\n          {tg_icon}\n          Canale\n        </a>'

for fname in html_files:
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '>Canale<' in content:
        continue
        
    if fname == 'details.html':
        content = re.sub(details_pattern, details_canale, content, flags=re.DOTALL)
    else:
        content = re.sub(chip_pattern, chip_canale, content, flags=re.DOTALL)
        
    with open(fname, 'w', encoding='utf-8') as f:
        f.write(content)

print("Added Canale buttons.")
