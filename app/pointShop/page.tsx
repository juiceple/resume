'use client'
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import Image from 'next/image';
import DocsHeader from '@/components/docs/DocsHeader';

const PointShop = () => {
    return (
        <div className="w-full mx-auto p-4">
            <header className="fixed top-0 left-0 right-0 z-10 bg-white shadow-md">
                <DocsHeader />
            </header>
            <div className='mt-[100px] mx-24'>
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Info className="mr-2" />
                            Bullet Point Tip!
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5">
                            <li className="text-orange-500">강의평가 작성 시 30P를 획득할 수 있습니다.</li>
                            <li className="text-blue-500">강의평가 삭제 시 획득한 30P가 차감됩니다.</li>
                        </ul>
                    </CardContent>
                </Card>
                <Card className="mb-6">
                    <CardContent className='flex flex-col items-center justify-center'>
                        <div>
                           <p>{/*이름 자리*/}님이 보유하신 포인트는 {/* 포인트 자리 */} 입니다.</p> 
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { title: '강의평가 열람권 (30일)', points: 75, price: "5000" },
                        { title: '강의평가 열람권 (90일)', points: 120,price: "10000"  },
                        { title: '강의평가 열람권 (180일)', points: 150, price: "15000"  },
                    ].map((item, index) => (
                        <Card key={index}>
                            <CardContent className="p-4">
                                <h3 className="font-semibold mb-2">{item.title}</h3>
                                <p className="text-lg font-bold mb-4">{item.points}P</p>
                                <p className="text-lg font-bold mb-4">{item.price} ₩</p>
                                <Button className="w-full">구매하기</Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PointShop;