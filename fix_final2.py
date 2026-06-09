import sys
p = "C:/Users/75624/tennis-coach/index.html"
raw = open(p, "rb").read()
t = raw.decode("utf-8-sig")
lines = t.split(chr(10))
SQ = chr(39)
DQ = chr(34)
BT = chr(96)
DL = chr(36)

# Find the line with inline onclick
for i, l in enumerate(lines):
    if "selectAiVideo" in l and "v.url" in l and "onclick" in l:
        # Build new line using chr() to avoid any special char issues
        parts = []
        parts.append("      return ")
        parts.append(BT)  # backtick
        # <div class="card" style="..." onclick="clickVideo(this)"
        parts.append("<div class=")
        parts.append(DQ)
        parts.append("card")
        parts.append(DQ)
        parts.append(" style=")
        parts.append(DQ)
        parts.append("cursor:pointer;padding:10px;margin-bottom:4px;")
        parts.append(DQ)
        parts.append(" onclick=")
        parts.append(DQ)
        parts.append("clickVideo(this)")
        parts.append(DQ)
        # data-vid="${v.id}"
        parts.append(" data-vid=")
        parts.append(DQ)
        parts.append(DL + "{v.id}")
        parts.append(DQ)
        # data-url="${v.url.replace(/'/g,'')}"
        parts.append(" data-url=")
        parts.append(DQ)
        parts.append(DL + "{v.url.replace(/" + SQ + "/g," + SQ + SQ + ")}")
        parts.append(DQ)
        # data-note="${(v.note||"").replace(/"/g,"")}"
        parts.append(" data-note=")
        parts.append(DQ)
        parts.append(DL + "{(v.note" + chr(124) + chr(124) + SQ + SQ + ").replace(/\\" + DQ + "/g," + SQ + SQ + ")}")
        parts.append(DQ)
        parts.append(">")
        parts.append(BT)  # backtick close
        parts.append("  +")
        lines[i] = "".join(parts)
        print("Fixed line " + str(i+1))
        break

# Add clickVideo helper
for i, l in enumerate(lines):
    if "function selectAiVideo" in l:
        lines.insert(i, "")
        lines.insert(i, "function clickVideo(el) { selectAiVideo(el.dataset.url, el.dataset.vid, el.dataset.note " + chr(124) + chr(124) + " " + SQ + SQ + "); }")
        print("Added clickVideo at " + str(i+1))
        break

open(p, "wb").write((chr(10).join(lines)).encode("utf-8-sig"))
print("Done")
