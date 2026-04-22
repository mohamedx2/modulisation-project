import { Users, Ticket, CreditCard, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { name: 'Total Tickets', value: '12', icon: Ticket, change: '+2.5%', changeType: 'positive' },
  { name: 'Pending Payments', value: '$2,400', icon: CreditCard, change: '-4.1%', changeType: 'negative' },
  { name: 'Active Mechanics', value: '4', icon: Users, change: '+0%', changeType: 'neutral' },
  { name: 'System Health', value: '98.9%', icon: Activity, change: '+1.2%', changeType: 'positive' },
];

export default function DashboardOverview() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Overview</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A high-level view of your Renault Axis operations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.name} className="shadow-sm rounded-2xl border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">{item.name}</CardTitle>
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <item.icon className="h-4 w-4" aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{item.value}</div>
              <p className={`text-xs font-medium mt-1 ${
                item.changeType === 'positive' ? 'text-green-600' : item.changeType === 'negative' ? 'text-red-500' : 'text-muted-foreground'
              }`}>
                {item.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm rounded-2xl border-border/50">
        <CardHeader className="border-b bg-muted/40">
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-12 text-center text-sm text-muted-foreground font-medium">
          No recent activity to display. Connect your APIs to populate this feed.
        </CardContent>
      </Card>
    </div>
  );
}