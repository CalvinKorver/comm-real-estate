import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function TestStylesPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-foreground">Style Test Page</h1>

        <Card>
          <CardHeader>
            <CardTitle>Card Component Test</CardTitle>
            <CardDescription>
              This card should have proper background and text colors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Input Test
              </label>
              <Input placeholder="This input should have proper styling" />
            </div>

            <div className="flex gap-4">
              <Button variant="default">Default Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="destructive">Destructive Button</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg bg-card text-card-foreground">
            <h3 className="font-semibold mb-2">Card Background Test</h3>
            <p className="text-muted-foreground">
              This should have card background
            </p>
          </div>

          <div className="p-4 border rounded-lg bg-popover text-popover-foreground">
            <h3 className="font-semibold mb-2">Popover Background Test</h3>
            <p className="text-muted-foreground">
              This should have popover background
            </p>
          </div>
        </div>

        <div className="p-4 bg-muted text-muted-foreground rounded-lg">
          <h3 className="font-semibold mb-2">Muted Background Test</h3>
          <p>This should have muted background and text</p>
        </div>
      </div>
    </div>
  )
}
