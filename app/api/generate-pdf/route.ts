import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright-core';

export async function POST(request: NextRequest) {
  try {
    const { html, cssRules, inlineStyles, computedStyles } = await request.json();

    if (!html) {
      return NextResponse.json({ message: 'HTML 내용이 필요합니다' }, { status: 400 });
    }

    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();

    const styledHtml = `
      <style>
        ${cssRules}
        body {
          font-family: ${computedStyles.fontFamily};
          font-size: ${computedStyles.fontSize};
          color: ${computedStyles.color};
          background-color: ${computedStyles.backgroundColor};
        }
        .doc {
          ${inlineStyles}
          line-height: ${computedStyles.lineHeight};
        }
      </style>
      ${html}
    `;

    await page.setContent(styledHtml, { waitUntil: 'networkidle' });
    const pdfBuffer = await page.pdf({
      format: 'letter',
      printBackground: true,
      margin: { top: '48px', right: '48px', bottom: '48px', left: '48px' },
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=document.pdf',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: `PDF 생성 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
