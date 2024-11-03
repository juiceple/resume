import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('PDF 생성 요청 받음');

  try {
    const { html, css, inlineStyles, computedStyles } = await request.json();

    if (!html) {
      console.log('HTML 내용 누락');
      return NextResponse.json({ message: 'HTML 내용이 필요합니다' }, { status: 400 });
    }

    console.log('PDF 생성 API 호출 준비 중');

    // pdf-generator-api의 URL
    const apiUrl = 'http://localhost:3001/api/generate-pdf';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html,
        css,
        inlineStyles,
        computedStyles,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PDF 생성 API 오류: ${response.status} ${errorText}`);
    }

    console.log('PDF 생성 완료');

    // PDF 데이터 받아오기
    const pdfBuffer = Buffer.from(await response.arrayBuffer());

    // PDF 응답 전송
    console.log('PDF 응답 전송 중');
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=document.pdf',
      },
    });
  } catch (error) {
    console.error('PDF 생성 오류:', error);
    return NextResponse.json({ 
      message: `PDF 생성 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
