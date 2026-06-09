"""
网球 AI 动作分析服务
启动: python app.py
默认端口: 5000

支持模型（通过环境变量 AI_PROVIDER 切换）:
  gemini   - Google Gemini (免费！)  推荐！
  qwen     - 通义千问 (qwen-vl-plus)
  deepseek - DeepSeek (deepseek-chat)
  openai   - OpenAI (gpt-4o)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import requests
import os

app = Flask(__name__)
CORS(app)

# ====== 配置 ======
PROVIDER = os.environ.get('AI_PROVIDER', 'qwen')  # 默认千问

CONFIG = {
    'gemini': {
        'url': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        'model': 'gemini-2.0-flash',
        'key': os.environ.get('GEMINI_KEY', ''),
    },
    'openai': {
        'url': 'https://api.openai.com/v1/chat/completions',
        'model': 'gpt-4o',
        'key': os.environ.get('OPENAI_KEY', ''),
    },
    'deepseek': {
        'url': 'https://api.deepseek.com/v1/chat/completions',
        'model': 'deepseek-chat',
        'key': os.environ.get('DEEPSEEK_KEY', ''),
    },
    'qwen': {
        'url': 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
        'model': 'qwen-vl-max',
        'key': os.environ.get('QWEN_KEY', ''),
    },
}

cfg = CONFIG[PROVIDER]
API_KEY = cfg['key']

PROMPT_TEMPLATE = """你是资深网球教练。你面前是同一个人的一段训练视频的连续关键帧。请仔细观察每帧画面的细节差异——身体角度、拍头位置、重心变化等。

不要给出模板化回答。根据你实际看到的画面内容，给出针对性的分析。如果看不清楚，诚实说明。

用中文回复，格式：
【动作类型】你在画面中实际看到什么动作
【关键观察】描述你从帧序列中观察到的2-3个具体技术细节（如：第3帧击球点时拍头滞后、转体角度约45度等）
【评分】只评画面中看到的维度（1-10分）
【改进建议】2条具体可操作的建议
【总结】一句话"""


@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json
        frames = data.get('frames', [])

        if not frames:
            return jsonify({'error': '没有收到视频帧'}), 400

        # 构建 OpenAI Vision 请求
        content = [{'type': 'text', 'text': PROMPT_TEMPLATE}]
        for f in frames[:6]:  # 最多6帧
            content.append({'type': 'image_url', 'image_url': {'url': f}})

        if not API_KEY:
            return jsonify({'error': f'未设置 {PROVIDER} 的 API Key，请配置环境变量'}), 500

        if PROVIDER == 'gemini':
            import time
            # Gemini 格式不同
            parts = [{'text': PROMPT_TEMPLATE + f"\n[分析ID: {int(time.time()*1000)}]"}]
            for f in frames[:6]:
                parts.append({'inlineData': {'mimeType': 'image/jpeg', 'data': f.split(',')[1] if ',' in f else f}})
            body = {'contents': [{'parts': parts}]}
            resp = requests.post(f"{cfg['url']}?key={API_KEY}", json=body, timeout=60)
        else:
            import time
            # OpenAI 兼容格式
            content = [{'type': 'text', 'text': PROMPT_TEMPLATE + f"\n[分析ID: {int(time.time()*1000)}]"}]
            for f in frames[:6]:
                content.append({'type': 'image_url', 'image_url': {'url': f}})
            body = {'model': cfg['model'], 'messages': [{'role': 'user', 'content': content}]}
            resp = requests.post(cfg['url'], headers={
                'Authorization': f'Bearer {API_KEY}', 'Content-Type': 'application/json'
            }, json=body, timeout=60)

        if resp.status_code != 200:
            err_msg = resp.text[:300]
            print(f"AI API Error: {resp.status_code} - {err_msg}", flush=True)
            return jsonify({'error': f'AI API {resp.status_code}: {err_msg}'}), 500

        result = resp.json()
        if PROVIDER == 'gemini':
            analysis = result['candidates'][0]['content']['parts'][0]['text']
        else:
            analysis = result['choices'][0]['message']['content']

        # Parse structured text response
        ratings = {}
        import re
        rating_pattern = re.compile(r'(正手|反手|发球|截击|步伐|体能)[：:]\s*(\d+)')
        for m in rating_pattern.finditer(analysis):
            dim_map = {'正手': 'forehand', '反手': 'backhand', '发球': 'serve', '截击': 'volley', '步伐': 'footwork', '体能': 'fitness'}
            ratings[dim_map.get(m.group(1), m.group(1))] = int(m.group(2))

        return jsonify({
            'ratings': ratings if ratings else None,
            'summary': analysis[:300],
            'details': analysis,
            'suggestions': [],
            'action_type': ''
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/')
def index():
    return jsonify({'status': 'ok', 'message': '网球AI分析服务运行中'})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
