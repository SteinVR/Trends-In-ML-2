from pathlib import Path
import re
p=Path('output/poster-narrative-3/layout-v4/index.html');s=p.read_text()
s=s.replace('</style></head>','''
.hyp-result{display:block;padding:10px 13px}.hyp-result h3{font-size:24pt;margin-bottom:6px}.hyp-result p{line-height:1.05}.takeaways{margin-top:11px}.unexpected{margin-top:10px!important;padding-top:8px}.main-takeaway{padding:14px 16px}.eval-grid{margin-top:11px}.eval-grid>div{padding:10px}.conclusion .content{padding-top:11px;padding-bottom:11px}
</style></head>''')
# Tighten blank chart space, preserve plot scale and values.
a=s.index('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 375"')
b=s.index('</svg>',a)+6
chart=s[a:b]
chart=chart.replace('viewBox="0 0 960 375"','viewBox="0 0 960 340"')
# Shift all coordinates below the plot's old top upward with a compressed y axis.
def yy(y):
 y=float(y)
 return y if y<100 else 101+(y-117)*.9
chart=re.sub(r'(?<= y=")([0-9.]+)',lambda m:f'{yy(m.group()):.2f}',chart)
chart=re.sub(r'(?<= cy=")([0-9.]+)',lambda m:f'{yy(m.group()):.2f}',chart)
chart=re.sub(r'points="([^"]+)"',lambda m:'points="'+' '.join(f'{v.split(",")[0]},{yy(v.split(",")[1]):.2f}' for v in m[1].split())+'"',chart)
chart=re.sub(r'd="M([0-9.]+) ([0-9.]+)H',lambda m:f'd="M{m[1]} {yy(m[2]):.2f}H',chart)
# Alternate the flat plateau labels so that adjacent values remain distinct.
chart=re.sub(r'<text x="250\.0" y="([0-9.]+)" class="val"',lambda m:f'<text x="250.0" y="{float(m[1])+47}" class="val"',chart)
chart=re.sub(r'<text x="896\.0" y="([0-9.]+)" class="val"',lambda m:f'<text x="896.0" y="{float(m[1])+47}" class="val"',chart)
s=s[:a]+chart+s[b:]
p.write_text(s)
