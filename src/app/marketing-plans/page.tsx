
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const plans = [
    {
        name: "Tradinta Lift",
        subtitle: "Starter Plan",
        fee: "KES 15,000 – 25,000/month",
        goal: "Get your first traction — fast visibility and verified leads.",
        channels: "1 Platform (Google Search or Meta Ads) + Internal Shop Boosts",
        includes: [
            "1 external ad campaign setup (Google Search or Meta Conversion).",
            "Internal Home Page Boost (product appears in featured sections).",
            "Basic pixel and conversion tracking setup.",
            "Audience targeting & basic keyword research.",
            "Monthly performance report.",
        ],
        metricFocus: "Cost per conversion, verified inquiry count.",
    },
    {
        name: "Tradinta Flow",
        subtitle: "Growth Starter",
        fee: "KES 30,000 – 50,000/month",
        goal: "Build awareness and remarketing loop.",
        channels: "Google + Meta + Tradinta Shop Highlights",
        includes: [
            "Up to 3 external campaigns (Google Search + Meta Retargeting).",
            "Featured Shop Badge on Tradinta.",
            "1 Sponsored Product or Category Placement.",
            "Basic influencer repost via Tradinta Ambassadors.",
            "A/B testing on creatives & copy.",
            "Bi-weekly optimization sessions.",
        ],
        metricFocus: "Return on Ad Spend (ROAS) & Lead Volume.",
    },
    {
        name: "Tradinta Surge",
        subtitle: "Accelerator Plan",
        fee: "KES 60,000 – 100,000/month",
        goal: "Scale visibility, dominate key categories, and expand audience reach.",
        channels: "Google + Meta + TikTok + Tradinta Premium Boosts",
        includes: [
            "Up to 5 campaigns across platforms.",
            "Outdoor & print media support.",
            "Sponsored Slot on Tradinta Search Results.",
            "Tradinta Boost Points for internal promotions.",
            "Dedicated creative testing and video strategy.",
            "Weekly optimization with a dedicated account manager.",
        ],
        metricFocus: "Cost per Acquisition (CPA) and Funnel Retention.",
    },
    {
        name: "Tradinta Apex",
        subtitle: "Strategic Partner",
        fee: "KES 120,000 – 200,000/month",
        goal: "Achieve full-market penetration and continuous creative evolution.",
        channels: "Google, Meta, TikTok + Tradinta Internal Domination Pack",
        includes: [
            "Omnichannel advertising with premium formats.",
            "Mass media & out-of-home (billboards, newspapers).",
            "Homepage or Category Page banner takeovers.",
            "Influencer boost collaboration with verified ambassadors.",
            "Advanced analytics & competitor benchmarking.",
            "Bi-weekly strategy & creative reviews.",
        ],
        metricFocus: "Lifetime Customer Value (LTV), Market Share, and Creative ROI.",
    },
    {
        name: "Tradinta Infinity",
        subtitle: "Enterprise Tier",
        fee: "Custom (starting KES 250,000+ or 10–12% of Ad Spend)",
        goal: "Integrate marketing end-to-end and dominate your category.",
        channels: "All platforms + Tradinta VIP Marketing Suite",
        includes: [
            "CRM & Sales Data Integration for full attribution.",
            "High-impact media (TV spots, high-traffic billboards).",
            "Custom enterprise analytics dashboard with quarterly reports.",
            "Guaranteed site dominance with homepage takeovers.",
            "Dedicated 'Influencer Fleet' for continuous promotion.",
            "Performance-based bonus options and priority support.",
        ],
        metricFocus: "Profit Margin, Forecast Accuracy, and End-to-End ROI.",
    }
];

export default function MarketingPlansPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">Tradinta Integrated Growth Packages</h1>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Combine external digital advertising with internal marketplace visibility to grow your business on and off Tradinta.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                {plans.map((plan, index) => (
                    <Card key={plan.name} className={`flex flex-col h-full ${index === 2 ? 'lg:scale-105 lg:shadow-2xl z-10' : ''}`}>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
                            <CardDescription className="font-semibold text-primary">{plan.subtitle}</CardDescription>
                            <p className="text-xl font-bold">{plan.fee}</p>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="font-semibold mb-2">Goal:</p>
                            <p className="text-muted-foreground mb-4">{plan.goal}</p>

                            <p className="font-semibold mb-2">Channels:</p>
                            <p className="text-muted-foreground mb-4">{plan.channels}</p>

                            <ul className="space-y-2">
                                {plan.includes.map(item => (
                                    <li key={item} className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                                        <span className="text-sm text-muted-foreground">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            
                            <div className="mt-4">
                              <p className="font-semibold text-sm">Metric Focus:</p>
                              <p className="text-sm text-muted-foreground">{plan.metricFocus}</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">Choose Plan</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
