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
        'model': 'qwen-vl-plus',
        'key': os.environ.get('QWEN_KEY', ''),
    },
}

cfg = CONFIG[PROVIDER]
API_KEY = cfg['key']

PROMPT_TEMPLATE = """你是专业网球教练。分析这个网球训练视频的关键帧。

按以下JSON格式回复（不要markdown代码块，只返回纯JSON，不要任何额外文字）：

{
  "action_type": "正手击球/反手击球/发球/截击/高压球/其他",
  "ratings": {
    "forehand": 0,
    "backhand": 0,
    "serve": 0,
    "volley": 0,
    "footwork": 0,
    "fitness": 0
  },
  "summary": "整体评价",
  "details": "各维度详细技术分析",
  "suggestions": ["具体改进建议1", "具体改进建议2"]
}

要求：
1. 先判断动作类型
2. 只对视频中实际出现的动作维度评分(1-10)，未出现的维度填0
3. 评分要有分析依据，写在details里
4. 建议要具体可执行
5. 如果判断是发球，重点关注serve维度
6. 如果判断是正手/反手，重点关注对应维度
7. 必须返回纯JSON，不要任何其他文字"""


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
            # Gemini 格式不同
            parts = [{'text': PROMPT_TEMPLATE}]
            for f in frames[:6]:
                parts.append({'inlineData': {'mimeType': 'image/jpeg', 'data': f.split(',')[1] if ',' in f else f}})
            body = {'contents': [{'parts': parts}]}
            resp = requests.post(f"{cfg['url']}?key={API_KEY}", json=body, timeout=60)
        else:
            # OpenAI 兼容格式
            content = [{'type': 'text', 'text': PROMPT_TEMPLATE}]
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

        # Try to parse JSON from AI response
        try:
            # Strip markdown code blocks
            cleaned = analysis.strip()
            if cleaned.startswith('\`\`\`'):
                cleaned = cleaned.split('\n', 1)[1] if '\n' in cleaned else cleaned
                if '\`\`\`' in cleaned:
                    cleaned = cleaned.rsplit('\`\`\`', 1)[0]
            cleaned = cleaned.strip()

            parsed = json.loads(cleaned)
            # Validate structure
            if isinstance(parsed, dict) and 'ratings' in parsed:
                return jsonify({
                    'ratings': parsed.get('ratings', {}),
                    'summary': parsed.get('summary', ''),
                    'details': parsed.get('details', analysis),
                    'suggestions': parsed.get('suggestions', []),
                    'action_type': parsed.get('action_type', '')
                })
        except (json.JSONDecodeError, Exception):
            pass

        # Fallback: return raw text
        return jsonify({
            'ratings': None,
            'summary': analysis[:200],
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
