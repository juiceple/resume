import { NextRequest, NextResponse } from 'next/server';
import chromium from 'chrome-aws-lambda';
import { Page } from 'puppeteer-core';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export async function POST(request: NextRequest) {
  console.log('PDF 생성 요청 받음');

  let browser;
  try {
    const { html, cssRules, inlineStyles, computedStyles } = await request.json();

    if (!html) {
      console.log('HTML 내용 누락');
      return NextResponse.json({ message: 'HTML 내용이 필요합니다' }, { status: 400 });
    }

    console.log('Chrome 실행 중');
    browser = await chromium.puppeteer.launch({
      args: [...chromium.args, '--no-sandbox'],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page: Page = await browser.newPage();

    console.log('페이지 내용 설정 중');
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

    await page.setContent(styledHtml, { 
      waitUntil: ['networkidle0', 'load', 'domcontentloaded']
    });

    console.log('애니메이션 대기 중');
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));

    console.log('PDF 생성 중');
    const pdf = await page.pdf({
      format: 'letter',
      printBackground: true,
      margin: { top: '48px', right: '48px', bottom: '48px', left: '48px' },
      preferCSSPageSize: true,
    });

    console.log('PDF 응답 전송 중');
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=document.pdf',
      },
    });
  } catch (error) {
    console.error('PDF 생성 오류:', error);
    return NextResponse.json({ message: `PDF 생성 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}` }, { status: 500 });
  } finally {
    if (browser) {
      console.log('브라우저 종료 중');
      await browser.close();
    }
  }
}