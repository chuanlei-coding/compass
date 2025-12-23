"""
FastAPI 后端服务
作为前端和AI API之间的代理服务器
"""
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import httpx
import logging
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 创建FastAPI应用
app = FastAPI(
    title="Word AI助手后端服务",
    description="Word/WPS AI助手插件的后端API服务",
    version="1.0.0"
)

# 配置CORS（允许前端跨域请求）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应该指定具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 请求模型
class ProcessRequest(BaseModel):
    """处理请求的模型"""
    user_request: str
    document_content: str
    api_key: Optional[str] = None
    api_url: Optional[str] = None
    model_name: Optional[str] = None


class EditOperation(BaseModel):
    """编辑操作模型"""
    type: str  # insert|replace|format|delete|addParagraph
    content: Optional[str] = None
    position: Optional[str] = None  # start|end|数字
    searchText: Optional[str] = None
    replaceText: Optional[str] = None
    format: Optional[Dict[str, Any]] = None


class AIResponse(BaseModel):
    """AI响应模型"""
    message: str
    edits: List[EditOperation]


# 默认配置（从环境变量读取，如果没有则使用默认值）
DEFAULT_API_URL = os.getenv("DEFAULT_API_URL", "https://api.openai.com/v1/chat/completions")
DEFAULT_MODEL_NAME = os.getenv("DEFAULT_MODEL_NAME", "gpt-3.5-turbo")


def build_prompt(user_request: str, document_content: str) -> str:
    """构建AI提示词"""
    # 限制文档内容长度
    doc_preview = document_content[:2000]
    if len(document_content) > 2000:
        doc_preview += "..."
    
    return f"""你是一个Word文档编辑助手。用户想要对文档进行编辑，请根据用户需求生成编辑操作。

当前文档内容：
{doc_preview}

用户需求：{user_request}

请以JSON格式返回编辑操作，格式如下：
{{
  "message": "操作说明",
  "edits": [
    {{
      "type": "insert|replace|format|delete|addParagraph",
      "content": "文本内容（如果需要）",
      "position": "start|end|数字",
      "searchText": "要搜索的文本（如果需要）",
      "replaceText": "替换的文本（如果需要）",
      "format": {{
        "bold": true/false,
        "italic": true/false,
        "underline": true/false,
        "fontSize": 数字,
        "fontColor": "颜色代码"
      }}
    }}
  ]
}}

只返回JSON，不要其他内容。"""


async def call_ai_api(
    prompt: str,
    api_key: str,
    api_url: str = DEFAULT_API_URL,
    model_name: str = DEFAULT_MODEL_NAME
) -> str:
    """调用AI API"""
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    request_body = {
        "model": model_name,
        "messages": [
            {
                "role": "system",
                "content": "你是一个专业的Word文档编辑助手，能够理解用户需求并生成准确的编辑操作。"
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.7,
        "max_tokens": 1000
    }
    
    logger.info(f"调用AI API: {api_url}, 模型: {model_name}")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                api_url,
                headers=headers,
                json=request_body
            )
            
            if response.status_code != 200:
                error_text = response.text
                logger.error(f"AI API调用失败: {response.status_code}, {error_text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"AI API调用失败: {response.status_code} - {error_text[:200]}"
                )
            
            data = response.json()
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            
            if not content:
                logger.warning("AI API响应中没有内容")
                raise HTTPException(status_code=500, detail="AI API响应中没有内容")
            
            return content
            
    except httpx.TimeoutException:
        logger.error("AI API调用超时")
        raise HTTPException(status_code=504, detail="AI API调用超时")
    except httpx.RequestError as e:
        logger.error(f"AI API请求错误: {e}")
        raise HTTPException(status_code=503, detail=f"AI API请求错误: {str(e)}")


def parse_ai_response(response_text: str) -> AIResponse:
    """解析AI响应"""
    import json
    import re
    
    try:
        # 尝试提取JSON
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            parsed = json.loads(json_match.group())
            return AIResponse(
                message=parsed.get("message", "操作完成"),
                edits=[EditOperation(**edit) for edit in parsed.get("edits", [])]
            )
        raise ValueError("无法从响应中提取JSON")
    except (json.JSONDecodeError, ValueError) as e:
        logger.error(f"解析AI响应失败: {e}")
        logger.error(f"响应内容: {response_text[:500]}")
        raise HTTPException(status_code=500, detail=f"AI响应格式错误: {str(e)}")


def get_mock_response(user_request: str) -> AIResponse:
    """获取模拟响应（用于测试）"""
    user_request_lower = user_request.lower()
    edits = []
    
    if "加粗" in user_request_lower or "粗体" in user_request_lower:
        edits.append(EditOperation(
            type="format",
            searchText="第一段",
            format={"bold": True}
        ))
    
    if "添加" in user_request_lower and "末尾" in user_request_lower:
        edits.append(EditOperation(
            type="addParagraph",
            content="这是根据您的要求添加的内容。"
        ))
    
    if "替换" in user_request_lower:
        edits.append(EditOperation(
            type="replace",
            searchText="旧文本",
            replaceText="新文本"
        ))
    
    message = (
        "已根据您的要求完成编辑操作。"
        if edits
        else "抱歉，我无法理解您的需求。请尝试更具体的描述，例如：\"将第一段加粗\"或\"在文档末尾添加一段文字\"。"
    )
    
    return AIResponse(message=message, edits=edits)


@app.get("/")
async def root():
    """根路径，返回服务信息"""
    return {
        "service": "Word AI助手后端服务",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy"}


@app.post("/api/process", response_model=AIResponse)
async def process_request(request: ProcessRequest):
    """
    处理用户请求
    
    接收前端请求，调用AI API，返回编辑操作
    """
    # 检查API密钥
    api_key = request.api_key
    if not api_key or not api_key.strip():
        logger.warning("API密钥未配置，返回模拟响应")
        return get_mock_response(request.user_request)
    
    # 使用请求中的配置，如果没有则使用默认值
    api_url = request.api_url or DEFAULT_API_URL
    model_name = request.model_name or DEFAULT_MODEL_NAME
    
    try:
        # 构建提示词
        prompt = build_prompt(request.user_request, request.document_content)
        
        # 调用AI API
        ai_response_text = await call_ai_api(prompt, api_key, api_url, model_name)
        
        # 解析响应
        ai_response = parse_ai_response(ai_response_text)
        
        logger.info(f"成功处理请求: {request.user_request[:50]}...")
        return ai_response
        
    except HTTPException:
        # 重新抛出HTTP异常
        raise
    except Exception as e:
        logger.error(f"处理请求时出错: {e}", exc_info=True)
        # 发生错误时返回模拟响应
        logger.warning("返回模拟响应作为降级方案")
        return get_mock_response(request.user_request)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

