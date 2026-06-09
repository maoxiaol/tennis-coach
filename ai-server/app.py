"""
网球 AI 动作分析服务
启动: python app.py
默认端口: 5000

支持模型（通过环境变量 AI_PROVIDER 切换）:
  qwen    - 通义千问 (qwen-vl-plus)  推荐！视觉能力强
  deepseek - DeepSeek (deepseek-chat)
  openai   - OpenAI (gpt-4o)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

# ====== 配置 ======
PROVIDER = os.environ.get('AI_PROVIDER', 'qwen')  # 默认千问

CONFIG = {
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
API_URL = cfg['url']
MODEL = cfg['model']
API_KEY = cfg['key']

PROMPT_TEMPLATE = """你是专业网球教练。分析这个挥拍视频的关键帧，从以下维度评价（1-10分制）：

1. 准备姿势与握拍
2. 转体与重心转移
3. 挥拍轨迹
4. 击球点位置
5. 随挥动作
6. 身体协调性

请用中文回复，简洁专业，最后给出总体评价和改进建议。"""


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
            return jsonify({'error': f'未设置 {PROVIDER} 的 API Key'}), 500

        resp = requests.post(
            API_URL,
            headers={
                'Authorization': f'Bearer {API_KEY}',
                'Content-Type': 'application/json'
            },
            json={'model': MODEL, 'messages': [{'role': 'user', 'content': content}]},
            timeout=60
        )

        if resp.status_code != 200:
            return jsonify({'error': f'AI API 错误: {resp.status_code}'}), 500

        result = resp.json()
        analysis = result['choices'][0]['message']['content']

        return jsonify({'analysis': analysis})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/')
def index():
    return jsonify({'status': 'ok', 'message': '网球AI分析服务运行中'})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
