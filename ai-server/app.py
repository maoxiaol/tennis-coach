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
        'url': 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
        'model': 'qwen-vl-plus',
        'key': os.environ.get('QWEN_KEY', ''),
    },
}

cfg = CONFIG[PROVIDER]
API_KEY = cfg['key']

PROMPT_TEMPLATE = """你是专业网球教练。请分两步分析这个网球训练视频的关键帧：

第一步：先判断这是什么动作类型
- 正手击球 / 反手击球 / 发球 / 截击 / 高压球 / 切削球 / 对拉 / 其他
- 说明判断依据

第二步：根据动作类型，针对性分析技术要点（1-10分）：

发球动作侧重：
1. 抛球位置与高度
2.  trophy pose（奖杯姿势）
3. 腿部蹬地发力
4. 拍头速度与内旋
5. 击球点高度
6. 落地与平衡

正手/反手击球侧重：
1. 准备姿势与转体
2. 重心转移
3. 挥拍轨迹
4. 击球点位置
5. 随挥动作
6. 回位步伐

截击/高压侧重：
1. 准备与反应速度
2. 拍面角度
3. 击球点
4. 脚下移动

请用中文回复，格式如下：
【动作识别】XXX
【分析评分】各维度评分及说明
【总体评价】一句话总结
【改进建议】2-3条具体建议"""


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

        return jsonify({'analysis': analysis})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/')
def index():
    return jsonify({'status': 'ok', 'message': '网球AI分析服务运行中'})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
