#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
状态管理工具
用于添加、更新和删除系统状态
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

STATUS_FILE = Path(__file__).parent / 'public' / 'statuses.json'

def ensure_data_directory():
    """确保数据目录存在"""
    public_dir = Path(__file__).parent / 'public'
    public_dir.mkdir(exist_ok=True)

def read_statuses():
    """读取状态文件"""
    ensure_data_directory()
    if not STATUS_FILE.exists():
        return []
    try:
        with open(STATUS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"读取状态文件失败: {e}", file=sys.stderr)
        return []

def write_statuses(statuses):
    """写入状态文件"""
    ensure_data_directory()
    try:
        with open(STATUS_FILE, 'w', encoding='utf-8') as f:
            json.dump(statuses, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"写入状态文件失败: {e}", file=sys.stderr)
        return False

def add_status(id, name, status):
    """添加或更新状态"""
    statuses = read_statuses()
    now = datetime.now().isoformat()
    
    existing_index = None
    for i, s in enumerate(statuses):
        if s['id'] == id:
            existing_index = i
            break
    
    if existing_index is not None:
        statuses[existing_index].update({
            'name': name,
            'status': status,
            'lastUpdated': now
        })
        print(f"已更新状态: {name}")
    else:
        statuses.append({
            'id': id,
            'name': name,
            'status': status,
            'uptime': 0,
            'lastUpdated': now
        })
        print(f"已添加状态: {name}")
    
    if write_statuses(statuses):
        print(f"当前时间: {now}")
        return True
    return False

def delete_status(id):
    """删除状态"""
    statuses = read_statuses()
    original_count = len(statuses)
    statuses = [s for s in statuses if s['id'] != id]
    
    if len(statuses) < original_count:
        if write_statuses(statuses):
            print(f"已删除状态 ID: {id}")
            return True
    else:
        print(f"未找到状态 ID: {id}")
    return False

def list_statuses():
    """列出所有状态"""
    statuses = read_statuses()
    if not statuses:
        print("暂无状态数据")
        return
    
    print("\n当前状态列表:")
    print("-" * 80)
    for s in statuses:
        status_text = {
            'operational': '正常运行',
            'degraded': '性能下降',
            'down': '服务中断'
        }.get(s['status'], '未知')
        
        print(f"ID: {s['id']}")
        print(f"名称: {s['name']}")
        print(f"状态: {status_text}")
        print(f"最后更新: {s['lastUpdated']}")
        print("-" * 80)

def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("状态管理工具")
        print("\n用法:")
        print("  添加/更新状态:")
        print("    python addstatus.py <id> <name> <status>")
        print("    状态可选值: operational, degraded, down")
        print("\n  删除状态:")
        print("    python addstatus.py delete <id>")
        print("\n  列出所有状态:")
        print("    python addstatus.py list")
        print("\n示例:")
        print("  python addstatus.py web-server Web服务器 operational")
        print("  python addstatus.py database 数据库 operational")
        print("  python addstatus.py delete web-server")
        print("  python addstatus.py list")
        return
    
    command = sys.argv[1].lower()
    
    if command == 'list':
        list_statuses()
    elif command == 'delete':
        if len(sys.argv) < 3:
            print("错误: 请提供要删除的状态 ID")
            print("用法: python addstatus.py delete <id>")
            return
        delete_status(sys.argv[2])
    elif command in ['operational', 'degraded', 'down']:
        print("错误: 请提供状态 ID 和名称")
        print("用法: python addstatus.py <id> <name> <status>")
        return
    else:
        if len(sys.argv) < 4:
            print("错误: 参数不足")
            print("用法: python addstatus.py <id> <name> <status>")
            print("状态可选值: operational, degraded, down")
            return
        
        id = sys.argv[1]
        name = sys.argv[2]
        status = sys.argv[3].lower()
        
        if status not in ['operational', 'degraded', 'down']:
            print("错误: 状态值无效")
            print("状态可选值: operational, degraded, down")
            return
        
        add_status(id, name, status)

if __name__ == '__main__':
    main()
