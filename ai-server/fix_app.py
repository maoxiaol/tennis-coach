# -*- coding: utf-8 -*-
import sys
p = "C:/Users/75624/tennis-coach/ai-server/app.py"
raw = open(p, "rb").read()
t = raw.decode("utf-8")
lines = t.split(chr(10))

D = chr(34) * 3
SQ = chr(39)

# 1. PROMPT
s = None; e = None
for i, l in enumerate(lines):
    if "PROMPT_TEMPLATE" in l and "=" in l: s = i
    if s is not None and "@app.route" in l: e = i; break

lines = lines[:s] + [
    "PROMPT_TEMPLATE = " + D + "你是专业网球教练。请分析这段训练视频，用中文回复。",
    "", "必须严格按照以下格式（每个部分都要有）：", "",
    "【动作类型】判断这是什么动作（正手/反手/发球/截击/高压/对拉）", "",
    "【评分】", "评分格式必须为每行一个维度：",
    "正手：X分", "反手：X分", "发球：X分", "截击：X分", "步伐：X分", "体能：X分",
    "（只列出视频中出现的动作维度，不出现的不要写）", "",
    "【详细分析】", "各维度具体评价", "",
    "【改进建议】", "2-3条可执行的建议", "",
    "【总结】", "一句话总结" + D,
] + lines[e:]

# 2. Fix regex
for i, l in enumerate(lines):
    if "rating_pattern" in l:
        lines[i] = "        rating_pattern = re.compile(r" + SQ + "(\u6b63\u624b|\u53cd\u624b|\u53d1\u7403|\u622a\u51fb|\u6b65\u4f10|\u4f53\u80fd|\u9ad8\u538b|\u5bf9\u62c9)[\uff1a\\s]+(\\d+)" + SQ + ")"
        break

# 3. dim_map
for i, l in enumerate(lines):
    if "dim_map" in l and "forehand" in l and "\u9ad8\u538b" not in l:
        idx = l.rfind("}")
        lines[i] = l[:idx] + ", " + SQ + "\u9ad8\u538b" + SQ + ": " + SQ + "smash" + SQ + ", " + SQ + "\u5bf9\u62c9" + SQ + ": " + SQ + "rally" + SQ + "}"
        break

# 4. Fallback - find the CORRECT return jsonify (the one that has 'ratings' in it)
# Search for return jsonify that appears AFTER the rating_pattern loop
target = None
for i, l in enumerate(lines):
    if l.strip().startswith("return jsonify(") and i > 110:
        target = i
        break

if target:
    fb = [
        "",
        "        # Fallback: try flexible parsing if nothing found",
        "        if not ratings:",
        "            flex = re.findall(r" + SQ + "(\u6b63\u624b|\u53cd\u624b|\u53d1\u7403|\u622a\u51fb|\u6b65\u4f10|\u4f53\u80fd|\u9ad8\u538b|\u5bf9\u62c9)[^\\d]*(\\d+)" + SQ + ", analysis)",
        "            for m in flex:",
        '                dm = {"\u6b63\u624b": "forehand", "\u53cd\u624b": "backhand", "\u53d1\u7403": "serve", "\u622a\u51fb": "volley", "\u9ad8\u538b": "smash", "\u5bf9\u62c9": "rally", "\u6b65\u4f10": "footwork", "\u4f53\u80fd": "fitness"}',
        "                ratings[dm.get(m[0], m[0])] = int(m[1])",
    ]
    lines = lines[:target] + fb + lines[target:]

open(p, "wb").write((chr(10).join(lines)).encode("utf-8"))
print("Done")
