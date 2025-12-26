"""
FastAPI 后端服务
作为前端和AI API之间的代理服务器
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List, Dict, Any, AsyncGenerator
import httpx
import logging
import os
import json
import time
import sys
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

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

# 获取项目根目录和dist目录
BACKEND_DIR = Path(__file__).parent
PROJECT_ROOT = BACKEND_DIR.parent
DIST_DIR = PROJECT_ROOT / "dist"
ASSETS_DIR = PROJECT_ROOT / "assets"

logger.info(f"[Server] 项目根目录: {PROJECT_ROOT}")
logger.info(f"[Server] 前端构建目录: {DIST_DIR}")
logger.info(f"[Server] 资源目录: {ASSETS_DIR}")
logger.info(f"[Server] dist目录是否存在: {DIST_DIR.exists()}")

# 创建FastAPI应用
app = FastAPI(
    title="Word AI助手服务",
    description="Word/WPS AI助手插件的完整服务（API + 前端）",
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

# 注意：静态文件挂载将在所有API路由定义之后进行
# 这样可以确保API路由（如 /api/process）优先匹配，不会被静态文件路由拦截

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


async def call_ai_api_with_progress(
    prompt: str,
    api_key: str,
    api_url: str,
    model_name: str
) -> AsyncGenerator[tuple[str, int, int, float], None]:
    """
    调用AI API并流式返回内容
    
    Yields:
        (content_chunk, chunk_count, content_length, elapsed_time)
    """
    """
    调用AI API并流式返回内容，支持进度回调
    
    Args:
        prompt: 提示词
        api_key: API密钥
        api_url: API URL
        model_name: 模型名称
        progress_callback: 进度回调函数 (chunk_count, content_length, elapsed_time)
    
    Yields:
        内容块字符串
    """
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
        "max_tokens": 8000,
        "stream": True
    }
    
    logger.info("调用AI API (流式): %s, 模型: %s", api_url, model_name)
    
    timeout_config = httpx.Timeout(
        connect=10.0,
        read=300.0,
        write=10.0,
        pool=10.0
    )
    
    try:
        async with httpx.AsyncClient(timeout=timeout_config) as client:
            async with client.stream("POST", api_url, headers=headers, json=request_body) as response:
                if response.status_code != 200:
                    error_text = ""
                    try:
                        error_bytes = await response.aread()
                        error_text = error_bytes.decode('utf-8', errors='ignore')
                    except Exception:
                        pass
                    
                    error_detail = f"AI API调用失败 (状态码: {response.status_code})"
                    if error_text:
                        error_detail += f". 错误信息: {error_text[:500]}"
                    
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=error_detail
                    )
                
                content_parts: List[str] = []
                chunk_count = 0
                start_time = time.time()
                
                try:
                    async for line in response.aiter_lines():
                        if not line.strip():
                            continue
                        
                        if line.startswith("data: "):
                            data_str = line[6:]
                            
                            if data_str.strip() == "[DONE]":
                                logger.info("[SSE] 收到 [DONE] 标记，流式响应正常结束")
                                break
                            
                            try:
                                chunk_data = json.loads(data_str)
                                chunk_count += 1
                                
                                choices = chunk_data.get("choices", [])
                                if choices and len(choices) > 0:
                                    choice = choices[0]
                                    finish_reason = choice.get("finish_reason")
                                    if finish_reason in ["stop", "length"]:
                                        logger.info(f"[SSE] 收到 finish_reason: {finish_reason}，流式响应正常结束")
                                        break
                                    
                                    delta = choice.get("delta", {})
                                    chunk_content = delta.get("content", "")
                                    if chunk_content:
                                        content_parts.append(chunk_content)
                                        current_time = time.time()
                                        elapsed_time = current_time - start_time
                                        content_length = sum(len(p) for p in content_parts)
                                        
                                        yield (chunk_content, chunk_count, content_length, elapsed_time)
                            except (json.JSONDecodeError, Exception) as e:
                                logger.debug(f"[SSE] 解析数据块失败: {e}")
                                continue
                
                except httpx.RemoteProtocolError as e:
                    # 连接在流式传输过程中被关闭
                    error_msg = str(e)
                    logger.warning(f"[SSE] 流式传输过程中连接被关闭: {error_msg}")
                    logger.warning(f"[SSE] 已接收 {chunk_count} 个数据块，内容长度: {sum(len(p) for p in content_parts)} 字符")
                    
                    # 如果已经接收到部分内容，记录警告但继续处理
                    if content_parts:
                        logger.warning("[SSE] 连接中断但已接收到部分内容，将使用已接收的内容继续处理")
                    else:
                        # 如果没有接收到任何内容，抛出异常
                        logger.error("[SSE] 连接中断且未接收到任何内容")
                        raise HTTPException(
                            status_code=503,
                            detail=f"AI API连接中断: {error_msg} (连接在传输过程中被关闭，可能是服务器端问题或网络中断)"
                        )
                except Exception as e:
                    # 其他流式读取错误
                    error_msg = str(e)
                    logger.error(f"[SSE] 流式读取时发生错误: {type(e).__name__}: {error_msg}", exc_info=True)
                    
                    # 如果已经接收到部分内容，记录警告但继续处理
                    if content_parts:
                        logger.warning(f"[SSE] 读取错误但已接收到部分内容 ({len(content_parts)} 块)，将使用已接收的内容继续处理")
                    else:
                        # 如果没有接收到任何内容，抛出异常
                        logger.error("[SSE] 读取错误且未接收到任何内容")
                        raise HTTPException(
                            status_code=500,
                            detail=f"读取AI API流式响应失败: {error_msg}"
                        )
                
                # 最终内容已通过yield返回
                    
    except httpx.TimeoutException as e:
        logger.error(f"AI API调用超时: {e}", exc_info=True)
        raise HTTPException(status_code=504, detail=f"AI API调用超时: {str(e)}")
    except httpx.RequestError as e:
        logger.error(f"AI API请求错误: {type(e).__name__}: {e}", exc_info=True)
        error_detail = f"AI API请求错误: {str(e)}"
        if "peer closed connection" in str(e) or "incomplete chunked read" in str(e):
            error_detail += " (连接在传输过程中被关闭，可能是服务器端问题或网络中断)"
        raise HTTPException(status_code=503, detail=error_detail)
    except Exception as e:
        logger.error(f"AI API调用时发生未知错误: {type(e).__name__}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"AI API调用失败: {str(e)}")


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
    """根路径，返回服务信息或前端页面"""
    # 如果dist目录存在且有taskpane.html，返回前端页面
    taskpane_html = DIST_DIR / "taskpane.html"
    if taskpane_html.exists():
        logger.info("[Server] 返回前端页面: taskpane.html")
        return FileResponse(str(taskpane_html))
    else:
        # 否则返回API信息
        return {
            "service": "Word AI助手服务",
            "version": "1.0.0",
            "status": "running",
            "note": "前端文件未找到，请先运行 'npm run build' 构建前端代码"
        }


@app.get("/taskpane.html")
async def taskpane_html():
    """返回taskpane.html页面"""
    taskpane_file = DIST_DIR / "taskpane.html"
    if taskpane_file.exists():
        logger.info("[Server] 返回taskpane.html")
        return FileResponse(str(taskpane_file))
    else:
        logger.error("[Server] taskpane.html不存在: %s", taskpane_file)
        raise HTTPException(status_code=404, detail="taskpane.html not found. Please run 'npm run build' first.")


@app.get("/commands.html")
async def commands_html():
    """返回commands.html页面"""
    commands_file = DIST_DIR / "commands.html"
    if commands_file.exists():
        logger.info("[Server] 返回commands.html")
        return FileResponse(str(commands_file))
    else:
        logger.error("[Server] commands.html不存在: %s", commands_file)
        raise HTTPException(status_code=404, detail="commands.html not found. Please run 'npm run build' first.")


@app.get("/health")
async def health_check():
    """健康检查"""
    dist_exists = DIST_DIR.exists()
    taskpane_exists = (DIST_DIR / "taskpane.html").exists() if dist_exists else False
    return {
        "status": "healthy",
        "frontend_built": dist_exists,
        "taskpane_available": taskpane_exists
    }


# 添加静态文件路由（在mount之前，作为显式路由）
@app.get("/taskpane.js")
async def serve_taskpane_js():
    """返回taskpane.js文件"""
    js_file = DIST_DIR / "taskpane.js"
    if js_file.exists():
        logger.debug("[Server] 返回taskpane.js")
        return FileResponse(str(js_file), media_type="application/javascript")
    raise HTTPException(status_code=404, detail="taskpane.js not found")


@app.get("/commands.js")
async def serve_commands_js():
    """返回commands.js文件"""
    js_file = DIST_DIR / "commands.js"
    if js_file.exists():
        logger.debug("[Server] 返回commands.js")
        return FileResponse(str(js_file), media_type="application/javascript")
    raise HTTPException(status_code=404, detail="commands.js not found")


async def process_request_stream(request: ProcessRequest) -> AsyncGenerator[str, None]:
    """
    流式处理用户请求，通过SSE发送进度更新和最终结果
    """
    logger.info(f"[SSE] 开始处理请求: {request.user_request[:50]}...")
    logger.info(f"[SSE] API URL: {request.api_url}, Model: {request.model_name}")
    
    # 检查API密钥
    api_key = request.api_key
    if not api_key or not api_key.strip():
        logger.warning("[SSE] API密钥未配置，返回模拟响应")
        mock_response = get_mock_response(request.user_request)
        result_event = f"data: {json.dumps({'type': 'result', 'data': mock_response.model_dump()})}\n\n"
        logger.info(f"[SSE] 发送模拟响应事件: {len(result_event)} 字节")
        yield result_event
        logger.info("[SSE] 模拟响应发送完成")
        return
    
    # 使用请求中的配置
    api_url = request.api_url or DEFAULT_API_URL
    model_name = request.model_name or DEFAULT_MODEL_NAME
    
    try:
        # 发送开始事件
        start_event = {'type': 'start', 'message': '开始处理请求...'}
        start_event_str = f"data: {json.dumps(start_event)}\n\n"
        logger.info(f"[SSE] 发送开始事件: {start_event_str.strip()}")
        yield start_event_str
        logger.info("[SSE] 开始事件已发送")
        
        # 构建提示词
        logger.info("[SSE] 构建提示词...")
        prompt = build_prompt(request.user_request, request.document_content)
        logger.info(f"[SSE] 提示词长度: {len(prompt)} 字符")
        
        # 收集所有内容块
        content_parts: List[str] = []
        last_progress_time = time.time()
        chunk_received_count = 0
        
        logger.info("[SSE] 开始调用AI API...")
        # 调用AI API并流式接收
        async for chunk_content, chunk_count, content_length, elapsed_time in call_ai_api_with_progress(prompt, api_key, api_url, model_name):
            chunk_received_count += 1
            content_parts.append(chunk_content)
            current_time = time.time()
            
            logger.debug(f"[SSE] 收到内容块 #{chunk_received_count}: {len(chunk_content)} 字符, 累计: {content_length} 字符, 耗时: {elapsed_time:.2f} 秒")
            
            # 每5秒发送一次进度更新
            if current_time - last_progress_time >= 5.0:
                progress_data = {
                    'type': 'progress',
                    'chunk_count': chunk_count,
                    'content_length': content_length,
                    'elapsed_time': round(elapsed_time, 2)
                }
                progress_event_str = f"data: {json.dumps(progress_data)}\n\n"
                logger.info(f"[SSE] 发送进度更新: chunk_count={chunk_count}, content_length={content_length}, elapsed_time={elapsed_time:.2f}秒")
                logger.debug(f"[SSE] 进度事件内容: {progress_event_str.strip()}")
                yield progress_event_str
                logger.info("[SSE] 进度更新已发送")
                last_progress_time = current_time
        
        logger.info(f"[SSE] AI API调用完成，共接收 {chunk_received_count} 个内容块")
        
        # 合并所有内容
        ai_response_text = "".join(content_parts)
        logger.info(f"[SSE] 合并内容完成，总长度: {len(ai_response_text)} 字符")
        
        # 解析响应
        logger.info("[SSE] 开始解析AI响应...")
        ai_response = parse_ai_response(ai_response_text)
        logger.info(f"[SSE] 解析完成，编辑操作数量: {len(ai_response.edits)}")
        
        # 发送最终结果
        result_data = {
            'type': 'result',
            'data': ai_response.model_dump()
        }
        result_event_str = f"data: {json.dumps(result_data)}\n\n"
        logger.info(f"[SSE] 准备发送最终结果，事件大小: {len(result_event_str)} 字节")
        logger.debug(f"[SSE] 结果事件内容: {result_event_str[:500]}...")
        yield result_event_str
        logger.info("[SSE] 最终结果已发送")
        
        logger.info(f"[SSE] 成功处理请求: {request.user_request[:50]}...")
        
    except HTTPException as e:
        logger.error(f"[SSE] HTTP异常: 状态码={e.status_code}, 详情={e.detail}")
        error_data = {
            'type': 'error',
            'status_code': e.status_code,
            'detail': e.detail
        }
        error_event_str = f"data: {json.dumps(error_data)}\n\n"
        logger.error(f"[SSE] 发送错误事件: {error_event_str.strip()}")
        yield error_event_str
        logger.error("[SSE] 错误事件已发送")
    except Exception as e:
        logger.error(f"[SSE] 处理请求时出错: {e}", exc_info=True)
        error_data = {
            'type': 'error',
            'status_code': 500,
            'detail': str(e)
        }
        error_event_str = f"data: {json.dumps(error_data)}\n\n"
        logger.error(f"[SSE] 发送错误事件: {error_event_str.strip()}")
        yield error_event_str
        logger.error("[SSE] 错误事件已发送")


@app.post("/api/process")
async def process_request(request: ProcessRequest):
    """
    处理用户请求（SSE流式响应）
    
    接收前端请求，调用AI API，通过SSE流式返回进度更新和最终结果
    """
    logger.info("[API] 收到请求: %s...", request.user_request[:50])
    logger.info("[API] 请求头检查: Content-Type应该为application/json")
    logger.info("[API] 请求时间: %s", time.time())
    
    # 创建一个包装函数，确保立即发送响应头
    async def stream_with_immediate_response():
        try:
            logger.info("[API] StreamingResponse generator开始执行")
            # 立即发送一个初始事件，确保响应头被发送
            initial_event = {'type': 'start', 'message': '连接已建立，开始处理...'}
            initial_event_str = f"data: {json.dumps(initial_event)}\n\n"
            logger.info(f"[API] 立即发送初始事件: {initial_event_str.strip()}")
            yield initial_event_str
            logger.info("[API] 初始事件已发送，响应头应该已经发送到客户端")
            
            # 然后继续处理请求流
            async for chunk in process_request_stream(request):
                yield chunk
        except Exception as e:
            logger.error(f"[API] Stream generator出错: {e}", exc_info=True)
            error_event = {'type': 'error', 'status_code': 500, 'detail': str(e)}
            yield f"data: {json.dumps(error_event)}\n\n"
    
    response = StreamingResponse(
        stream_with_immediate_response(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # 禁用nginx缓冲
            "Access-Control-Allow-Origin": "*",  # CORS支持
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    )
    
    logger.info("[API] 返回StreamingResponse，媒体类型: text/event-stream")
    logger.info("[API] 响应头已设置，应该立即发送到客户端")
    return response


# 在所有API路由定义之后，挂载静态文件目录
# 这样可以确保API路由优先匹配，静态文件作为后备
if DIST_DIR.exists():
    # 挂载到根路径，这样HTML中的相对路径引用（如taskpane.js）能正常工作
    # html=True 表示对于目录请求，返回index.html（如果有）
    app.mount("/", StaticFiles(directory=str(DIST_DIR), html=True), name="static")
    logger.info("[Server] 已挂载静态文件目录到根路径: %s", DIST_DIR)
else:
    logger.warning("[Server] 警告: dist目录不存在，静态文件服务将不可用")
    logger.warning("[Server] 请先运行 'npm run build' 构建前端代码")

# 挂载资源目录（图标等）
if ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(ASSETS_DIR)), name="assets")
    logger.info("[Server] 已挂载资源目录: %s", ASSETS_DIR)
else:
    logger.warning("[Server] 警告: assets目录不存在")


if __name__ == "__main__":
    import uvicorn
    import ssl
    
    # 尝试加载HTTPS证书（Office Add-ins要求HTTPS）
    cert_path = Path.home() / ".office-addin-dev-certs" / "localhost.crt"
    key_path = Path.home() / ".office-addin-dev-certs" / "localhost.key"
    
    ssl_context = None
    if cert_path.exists() and key_path.exists():
        try:
            ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            ssl_context.load_cert_chain(str(cert_path), str(key_path))
            logger.info("[Server] 已加载HTTPS证书: %s", cert_path)
        except Exception as e:
            logger.warning("[Server] 加载HTTPS证书失败: %s", e)
            logger.warning("[Server] 将使用HTTP（Office Add-ins可能需要HTTPS）")
            ssl_context = None
    else:
        logger.warning("[Server] 未找到HTTPS证书: %s", cert_path)
        logger.warning("[Server] 将使用HTTP（Office Add-ins可能需要HTTPS）")
        logger.warning("[Server] 提示: 运行 'npm run setup-certs' 生成证书")
    
    # 启动服务器
    port = 3000
    if ssl_context:
        logger.info("[Server] 启动HTTPS服务器: https://localhost:%d", port)
        uvicorn.run(app, host="0.0.0.0", port=port, ssl_keyfile=str(key_path), ssl_certfile=str(cert_path))
    else:
        logger.info("[Server] 启动HTTP服务器: http://localhost:%d", port)
        logger.warning("[Server] 注意: Office Add-ins要求HTTPS，请配置证书或使用反向代理")
        uvicorn.run(app, host="0.0.0.0", port=port)

