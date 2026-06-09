"""
网球 AI 动作分析服务
启动: python app.py
默认端口: 5000
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

# ====== 配置 ======
# 用哪个 AI API（选一个，填 key）
OPENAI_KEY = os.environ.get('OPENAI_KEY', 'sk-your-key-here')
OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
MODEL = 'gpt-4o'

# 如果你有其他兼容 API（如 DeepSeek、通义千问等），改这里
# OPENAI_URL = 'https://api.deepseek.com/v1/chat/completions'
# MODEL = 'deepseek-chat'

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

        resp = requests.post(
            OPENAI_URL,
            headers={
                'Authorization': f'Bearer {OPENAI_KEY}',
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
