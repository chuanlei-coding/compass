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
import sys
from datetime import datetime

# 创建日志目录
log_dir = os.path.join(os.path.dirname(__file__), 'logs')
os.makedirs(log_dir, exist_ok=True)

# 日志文件名（带日期）
log_file = os.path.join(log_dir, f'backend_{datetime.now().strftime("%Y%m%d")}.log')

# 配置日志：同时输出到文件和控制台
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file, encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)
logger.info(f"日志文件: {log_file}")

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
    type: str  # insert|replace|format|delete|addParagraph|insertTable|setHeading
    content: Optional[str] = None
    position: Optional[str] = None  # start|end|数字
    searchText: Optional[str] = None
    replaceText: Optional[str] = None
    format: Optional[Dict[str, Any]] = None
    # 表格相关参数
    tableRows: Optional[int] = None
    tableColumns: Optional[int] = None
    tableData: Optional[List[List[str]]] = None  # 表格数据，二维数组，第一行通常是表头
    # 段落样式相关参数
    style: Optional[str] = None  # 段落样式，如 "Heading1", "Heading2", "Heading3", "Normal"


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
      "type": "insert|replace|format|delete|addParagraph|insertTable|setHeading",
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
      }},
      "tableRows": 行数（仅当type为insertTable时）,
      "tableColumns": 列数（仅当type为insertTable时）,
      "tableData": [["表头1", "表头2", ...], ["数据1", "数据2", ...], ...]（表格数据，二维数组，第一行是表头）,
      "style": "Heading1|Heading2|Heading3|Normal"（段落样式，用于标题或段落）
    }}
  ]
}}

支持的编辑操作类型：
- insert: 插入文本
- replace: 替换文本
- format: 格式化文本
- delete: 删除文本
- addParagraph: 添加段落（可以指定style设置为标题）
- insertTable: 插入表格（需要指定tableRows和tableColumns，以及tableData）
- setHeading: 设置段落为标题样式（需要指定searchText或content，以及style）

段落样式说明：
- "Heading1": 一级标题（H1）
- "Heading2": 二级标题（H2）
- "Heading3": 三级标题（H3）
- "Normal": 正文样式

示例1：如果用户要求"在文档末尾插入三行四列的表格"，应返回：
{{
  "message": "已在文档末尾插入三行四列的表格",
  "edits": [
    {{
      "type": "insertTable",
      "tableRows": 3,
      "tableColumns": 4
    }}
  ]
}}

示例2：如果用户要求"用表格的形式整理南宋的最后七位皇帝,需要包含以下信息:称号、名字、生卒年月、在位时间、主要辅佐的宰相、与崖山之战的关系、去世的年纪"，应返回：
{{
  "message": "已在文档末尾插入包含南宋最后七位皇帝信息的表格",
  "edits": [
    {{
      "type": "insertTable",
      "tableRows": 8,
      "tableColumns": 7,
      "tableData": [
        ["称号", "名字", "生卒年月", "在位时间", "主要辅佐的宰相", "与崖山之战的关系", "去世的年纪"],
        ["宋高宗", "赵构", "1107-1187", "1127-1162", "秦桧", "无关", "81"],
        ["宋孝宗", "赵昚", "1127-1194", "1162-1189", "虞允文", "无关", "68"],
        ["宋光宗", "赵惇", "1147-1200", "1189-1194", "留正", "无关", "54"],
        ["宋宁宗", "赵扩", "1168-1224", "1194-1224", "韩侂胄、史弥远", "无关", "57"],
        ["宋理宗", "赵昀", "1205-1264", "1224-1264", "贾似道", "无关", "60"],
        ["宋度宗", "赵禥", "1240-1274", "1264-1274", "贾似道", "无关", "35"],
        ["宋恭帝", "赵㬎", "1271-1323", "1274-1276", "陈宜中", "1279年崖山之战前已退位", "53"]
      ]
    }}
  ]
}}

注意：
1. tableData的第一行必须是表头，后续行是数据行。tableRows应该等于tableData的行数，tableColumns应该等于tableData每行的列数。
2. 当需要创建标题时，使用addParagraph类型，并在style字段中指定"Heading1"或"Heading2"。例如：如果用户要求"将以下内容作为段落标题"或"生成小说章节标题"，应该使用addParagraph + style="Heading2"（章节标题通常用H2，主标题用H1）。
3. 如果用户明确要求"一级标题"或"主标题"，使用style="Heading1"；如果要求"二级标题"、"章节标题"或"段落标题"，使用style="Heading2"。

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
        "max_tokens": 10000
    }
    
    logger.info(f"调用AI API: {api_url}, 模型: {model_name}")
    
    # AI API调用可能需要较长时间，特别是大模型
    # 设置超时时间为300秒（5分钟），与前端proxy超时时间保持一致
    timeout_config = httpx.Timeout(
        connect=10.0,  # 连接超时：10秒
        read=300.0,    # 读取超时：300秒（5分钟）
        write=10.0,    # 写入超时：10秒
        pool=10.0      # 连接池超时：10秒
    )
    
    try:
        async with httpx.AsyncClient(timeout=timeout_config) as client:
            response = await client.post(
                api_url,
                headers=headers,
                json=request_body
            )
            
            if response.status_code != 200:
                # 尝试获取错误文本
                try:
                    error_text = response.text
                    error_json = None
                    try:
                        error_json = response.json()
                    except:
                        pass
                except Exception as e:
                    error_text = f"无法读取错误响应: {str(e)}"
                    error_json = None
                
                # 详细记录错误信息
                logger.error(f"AI API调用失败: 状态码={response.status_code}")
                logger.error(f"错误响应文本: {error_text[:1000] if error_text else '(空)'}")
                if error_json:
                    logger.error(f"错误响应JSON: {error_json}")
                logger.error(f"响应头: {dict(response.headers)}")
                
                # 构建详细的错误信息
                error_detail = f"AI API调用失败 (状态码: {response.status_code})"
                if error_text:
                    error_detail += f". 错误信息: {error_text[:500]}"
                elif error_json:
                    error_detail += f". 错误详情: {str(error_json)[:500]}"
                
                raise HTTPException(
                    status_code=response.status_code,
                    detail=error_detail
                )
            
            data = response.json()
            
            # 详细记录响应数据，便于调试
            logger.debug(f"AI API响应数据: {data}")
            
            # 检查响应结构
            choices = data.get("choices", [])
            if not choices:
                logger.error(f"AI API响应中没有choices: {data}")
                raise HTTPException(
                    status_code=500, 
                    detail=f"AI API响应格式错误：没有choices字段。响应数据: {str(data)[:500]}"
                )
            
            message = choices[0].get("message", {})
            if not message:
                logger.error(f"AI API响应中choices[0]没有message: {data}")
                raise HTTPException(
                    status_code=500, 
                    detail=f"AI API响应格式错误：choices[0]中没有message字段。响应数据: {str(data)[:500]}"
                )
            
            content = message.get("content", "")
            
            if not content:
                logger.error(f"AI API响应中没有content字段")
                logger.error(f"完整响应数据: {data}")
                logger.error(f"响应结构: choices数量={len(choices)}, message={message}, content={repr(content)}")
                raise HTTPException(
                    status_code=500, 
                    detail=f"AI API响应中没有内容。响应结构: {str(data)[:1000]}"
                )
            
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
        
    except HTTPException as e:
        # 记录HTTP异常的详细信息
        logger.error(f"HTTP异常: 状态码={e.status_code}, 详情={e.detail}")
        logger.error(f"请求信息: user_request={request.user_request[:100]}, api_url={request.api_url}, model={request.model_name}")
        # 重新抛出HTTP异常
        raise
    except Exception as e:
        logger.error(f"处理请求时出错: {e}", exc_info=True)
        logger.error(f"请求信息: user_request={request.user_request[:100]}, api_url={request.api_url}, model={request.model_name}")
        # 发生错误时返回模拟响应
        logger.warning("返回模拟响应作为降级方案")
        return get_mock_response(request.user_request)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

