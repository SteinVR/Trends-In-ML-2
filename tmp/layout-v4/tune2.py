from pathlib import Path
p=Path('output/poster-narrative-3/layout-v4/index.html');s=p.read_text()
s=s.replace('</style></head>','''
/* A1 density pass: retain 24 pt body text and the reference's three-column structure. */
.columns{grid-template-rows:minmax(0,1fr)}.col{min-height:0}section{flex-shrink:0}
.baseline{position:relative}.baseline>h3{margin-bottom:14px}.baseline .dense{position:absolute;right:14px;top:12px;margin:0}.flow .icon{width:40px;height:40px}.flow{gap:24px}.flow>div{gap:8px}.flow>div:not(:last-child)::after{right:-25px}.flow strong{font-size:24pt}.stage .icon{width:44px;height:44px;margin:8px auto}.stage{min-height:330px}.stage h3{min-height:90px}.phase{padding:7px 3px}.fixed{margin-top:11px;padding-top:10px}
#s13 li{font-size:18pt;line-height:1.05;margin-bottom:6px}#s13 .content{padding:12px 14px}.bar-row>span{font-size:22pt;margin-bottom:4px}.bar-row{margin-bottom:10px}.track{height:20px}.ocr-bars{margin:13px 0}.track strong{font-size:23pt;top:-6px}#s9 h3{font-size:24pt}.right .content{padding-top:11px;padding-bottom:11px}
</style></head>''')
p.write_text(s)
