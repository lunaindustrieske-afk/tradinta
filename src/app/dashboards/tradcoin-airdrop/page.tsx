'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import AirdropOverview from '@/components/tradcoin-admin/AirdropOverview';
import PointsRulesManager from '@/components/tradcoin-admin/PointsRulesManager';
import UserPointsManager from '@/components/tradcoin-admin/UserPointsManager';


const NavLink = ({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md w-full text-left",
            active ? "bg-muted text-primary" : "hover:bg-muted/50"
        )}
    >
        {children}
        <ChevronRight className={cn("h-4 w-4 transition-transform", active ? "transform translate-x-1" : "")} />
    </button>
);


export default function TradCoinAirdropDashboard() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';
    
    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(window.location.search);
        params.set('tab', value);
        router.push(`${pathname}?${params.toString()}`);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'points':
                return <PointsRulesManager />;
            case 'claim-codes':
                return <UserPointsManager />;
            case 'overview':
            default:
                return <AirdropOverview />;
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Coins className="w-6 h-6 text-primary" />TradCoin & Points Management</CardTitle>
                    <CardDescription>Oversee the TradCoin airdrop, define points earning rules, and manage the overall rewards economy.</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid md:grid-cols-4 gap-6 items-start">
                <div className="md:col-span-1">
                    <Card>
                        <CardContent className="p-4">
                             <nav className="space-y-1">
                                <NavLink active={activeTab === 'overview'} onClick={() => handleTabChange('overview')}>Airdrop Overview</NavLink>
                                <NavLink active={activeTab === 'points'} onClick={() => handleTabChange('points')}>Points Earning Rules</NavLink>
                                <NavLink active={activeTab === 'claim-codes'} onClick={() => handleTabChange('claim-codes')}>User &amp; Code Management</NavLink>
                            </nav>
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-3">
                    {renderContent()}
                </div>
            </div>

        </div>
    );
}
