import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const STATUS_FILE = path.join(process.cwd(), 'data', 'statuses.json')

interface StatusItem {
  id: string
  name: string
  status: 'operational' | 'degraded' | 'down'
  uptime: number
  lastUpdated: string
}

function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

function readStatuses(): StatusItem[] {
  ensureDataDirectory()
  if (!fs.existsSync(STATUS_FILE)) {
    return []
  }
  try {
    const data = fs.readFileSync(STATUS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('读取状态文件失败:', error)
    return []
  }
}

function writeStatuses(statuses: StatusItem[]): boolean {
  ensureDataDirectory()
  try {
    fs.writeFileSync(STATUS_FILE, JSON.stringify(statuses, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('写入状态文件失败:', error)
    return false
  }
}

export async function GET() {
  const statuses = readStatuses()
  return NextResponse.json(statuses)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, status } = body

    if (!id || !name || !status) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const statuses = readStatuses()
    const now = new Date().toISOString()
    
    const existingIndex = statuses.findIndex(s => s.id === id)
    
    if (existingIndex >= 0) {
      statuses[existingIndex] = {
        ...statuses[existingIndex],
        name,
        status,
        lastUpdated: now
      }
    } else {
      statuses.push({
        id,
        name,
        status,
        uptime: 0,
        lastUpdated: now
      })
    }

    const success = writeStatuses(statuses)
    
    if (success) {
      return NextResponse.json({ success: true, statuses })
    } else {
      return NextResponse.json(
        { error: '保存状态失败' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('处理请求失败:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: '缺少 id 参数' },
        { status: 400 }
      )
    }

    const statuses = readStatuses()
    const filteredStatuses = statuses.filter(s => s.id !== id)
    
    const success = writeStatuses(filteredStatuses)
    
    if (success) {
      return NextResponse.json({ success: true, statuses: filteredStatuses })
    } else {
      return NextResponse.json(
        { error: '删除状态失败' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('删除请求失败:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
