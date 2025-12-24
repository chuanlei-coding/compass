#!/bin/bash
# 查看后端服务日志的脚本

LOG_DIR="$(cd "$(dirname "$0")" && pwd)/logs"
LATEST_LOG=$(ls -t "$LOG_DIR"/*.log 2>/dev/null | head -1)

if [ -z "$LATEST_LOG" ]; then
    echo "❌ 未找到日志文件"
    echo "日志目录: $LOG_DIR"
    echo ""
    echo "提示: 确保后端服务正在运行"
    exit 1
fi

echo "📋 查看后端服务日志"
echo "日志文件: $LATEST_LOG"
echo "按 Ctrl+C 退出"
echo "----------------------------------------"
echo ""

# 实时查看日志（最后50行）
tail -f -n 50 "$LATEST_LOG"

