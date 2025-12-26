#!/usr/bin/env python3
"""
启动统一的服务（前端 + 后端）
"""
import subprocess
import sys
import os
from pathlib import Path

def main():
    # 检查dist目录是否存在
    project_root = Path(__file__).parent
    dist_dir = project_root / "dist"
    
    if not dist_dir.exists():
        print("⚠️  警告: dist目录不存在，正在构建前端...")
        print("运行: npm run build")
        result = subprocess.run(["npm", "run", "build"], cwd=project_root)
        if result.returncode != 0:
            print("❌ 前端构建失败，请检查错误信息")
            sys.exit(1)
        print("✅ 前端构建完成")
    
    # 启动Python服务
    backend_dir = project_root / "backend"
    print(f"🚀 启动统一服务（前端 + 后端）...")
    print(f"📁 项目根目录: {project_root}")
    print(f"📁 后端目录: {backend_dir}")
    print(f"📁 前端构建目录: {dist_dir}")
    print(f"🌐 服务地址: https://localhost:3000 (如果配置了HTTPS证书)")
    print(f"🌐 服务地址: http://localhost:3000 (如果没有HTTPS证书)")
    print()
    
    os.chdir(backend_dir)
    sys.path.insert(0, str(backend_dir))
    
    # 直接运行main.py
    import main
    # main.py的if __name__ == "__main__"块会自动执行

if __name__ == "__main__":
    main()

