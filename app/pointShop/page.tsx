'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import DocsHeader from '@/components/docs/DocsHeader';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

const PointShop = () => {
    const [user, setUser] = useState<User | null>(null);
    const [bulletPoints, setBulletPoints] = useState<number | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchUserAndBulletPoints = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                const { data, error } = await supabase
                    .from('profiles')
                    .select('BulletPoint')
                    .eq('user_id', user.id)
                    .single();
                if (error) {
                    console.error('Error fetching BulletPoints:', error);
                } else {
                    setBulletPoints(data?.BulletPoint || 0);
                }
            }
        };
        fetchUserAndBulletPoints();
    }, []);

    const handlePurchase = async (pointsToAdd: number) => {
        if (!user || bulletPoints === null) return;
        
        const { data, error } = await supabase
            .from('profiles')
            .update({ BulletPoint: bulletPoints + pointsToAdd })
            .eq('user_id', user.id)
            .select();

        if (error) {
            console.error('Error updating BulletPoints:', error);
            alert('구매 중 오류가 발생했습니다.');
        } else {
            setBulletPoints(data[0].BulletPoint);
            alert('구매가 완료되었습니다.');
        }
    };

    return (
        <div className="w-full min-h-screen flex flex-col bg-[#EBEEF1] py-12">
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

                    </CardContent>
                </Card>
                <Card className="mb-6">
                    <CardContent className='flex flex-col items-center justify-center py-4'>
                        <div className='flex items-center justify-center'>
                           <p>{user?.email || '로딩 중...'}님이 보유하신 Bullet Point는 {bulletPoints !== null ? bulletPoints : '로딩 중...'}Point 입니다.</p> 
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { title: 'Bullet Point', points: 75, price: "5000" },
                        { title: 'Bullet Point', points: 120, price: "10000" },
                        { title: 'Bullet Point', points: 150, price: "15000" },
                    ].map((item, index) => (
                        <Card key={index}>
                            <CardContent className="p-4">
                                <h3 className="font-semibold mb-2">{item.title}</h3>
                                <p className="text-lg font-bold mb-4">{item.points} Points</p>
                                <p className="text-lg font-bold mb-4">{item.price} ₩</p>
                                <Button 
                                    className="w-full"
                                    onClick={() => handlePurchase(item.points)}
                                >
                                    구매하기
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PointShop;