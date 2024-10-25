import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Twitter } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <div className="flex items-center space-x-2">
            <Twitter className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
              X Activity Companion
            </h1>
          </div>
          
          <p className="max-w-[600px] text-muted-foreground text-lg">
            Organize and understand your X activity with AI-powered themes. Connect your account to get started.
          </p>

          <Button size="lg" className="mt-8">
            <Twitter className="mr-2 h-4 w-4" />
            Connect with X
          </Button>

          <div className="grid gap-8 mt-16 md:grid-cols-3">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Smart Categorization</h3>
              <p className="text-muted-foreground">
                AI-powered theme detection automatically organizes your activity
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Insightful Analytics</h3>
              <p className="text-muted-foreground">
                Understand your interests and engagement patterns
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Privacy First</h3>
              <p className="text-muted-foreground">
                Your data is encrypted and secure at all times
              </p>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}