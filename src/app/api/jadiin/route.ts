import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    const filePath = path.join(process.cwd(), 'testfile.txt');
    const content = 'Romi Ganteng Banget..';

    try {
        fs.writeFileSync(filePath, content);
        return NextResponse.json({ message: 'File created successfully', content: content });
    } catch (error) {
        console.error('Error writing file:', error);
        return NextResponse.json({ error: 'Failed to create file' }, { status: 500 });
    }
}
