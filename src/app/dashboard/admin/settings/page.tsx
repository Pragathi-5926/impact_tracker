import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminSettingsPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8 max-w-2xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings & Permissions</h1>
        <p className="text-muted-foreground">
          Manage application settings and user permissions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>
            Global settings for the CampusConnect SDG app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appName">Application Name</Label>
            <Input id="appName" defaultValue="CampusConnect SDG" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="term">Current Academic Term</Label>
            <Input id="term" defaultValue="Fall 2024" />
          </div>
          <Button>Save Settings</Button>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>Database Tools</CardTitle>
          <CardDescription>
            Perform administrative database operations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
                <h3 className="font-semibold">Recalculate All Points</h3>
                <p className="text-sm text-muted-foreground">Run a script to recalculate all student and department points.</p>
            </div>
            <Button variant="outline">Run Script</Button>
          </div>
           <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
                <h3 className="font-semibold">Export All Data</h3>
                <p className="text-sm text-muted-foreground">Download a CSV of all activities and user data.</p>
            </div>
            <Button variant="outline">Export Data</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
