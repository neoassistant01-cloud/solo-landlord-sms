import { NextResponse } from 'next/server';
import fs from 'fs';

const SMS_LOG_PATH = '/tmp/sms-log.json';

interface SmsLog {
  id: string;
  to: string;
  message: string;
  sentAt: string;
  status: 'queued' | 'sent';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, message } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, message' },
        { status: 400 }
      );
    }

    const smsLog: SmsLog = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      to,
      message,
      sentAt: new Date().toISOString(),
      status: 'queued'
    };

    // Load existing logs or create empty array
    let logs: SmsLog[] = [];
    if (fs.existsSync(SMS_LOG_PATH)) {
      try {
        const content = fs.readFileSync(SMS_LOG_PATH, 'utf-8');
        logs = JSON.parse(content);
      } catch {
        logs = [];
      }
    }

    logs.push(smsLog);
    fs.writeFileSync(SMS_LOG_PATH, JSON.stringify(logs, null, 2));

    console.log('📱 SMS Queued:', smsLog);

    return NextResponse.json({ 
      success: true, 
      message: 'SMS queued for delivery',
      smsId: smsLog.id
    });
  } catch {
    console.error('SMS API Error');
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (!fs.existsSync(SMS_LOG_PATH)) {
    return NextResponse.json({ logs: [] });
  }
  try {
    const content = fs.readFileSync(SMS_LOG_PATH, 'utf-8');
    const logs = JSON.parse(content);
    return NextResponse.json({ logs });
  } catch {
    return NextResponse.json({ logs: [] });
  }
}
