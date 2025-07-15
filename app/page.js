import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Rocket, CheckCircle, BarChart3 } from "lucide-react"
import UnifiedHeader from "@/components/UnifiedHeader"

export default function HomePage() {
  return (
    <div className="min-h-screen dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 bg-gradient-to-br from-white via-gray-100 to-white">
      <UnifiedHeader />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">ডিসিপ্লিন প্রি (Starter + Hard)</h1>
        <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
          Embark on a life-changing journey to forge unbreakable habits, cultivate deep focus, and build the mental
          fortitude to achieve your goals. One day at a time.
        </p>
        <Link href="/dashboard">
          <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white px-8 py-3">
            View Your Dashboard
          </Button>
        </Link>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-slate-300 text-lg">A simple, powerful, 3-step process to a new you.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">1. Join the Challenge</h3>
              <p className="text-slate-300">
                Sign up for free and commit to the challenge. Your journey starts with a single step.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">2. Complete Daily Tasks</h3>
              <p className="text-slate-300">
                Follow the daily checklist based on proven habit-forming rules. Each task is a win.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">3. Track Your Progress</h3>
              <p className="text-slate-300">
                Visualize your success on the calendar, monitor your streaks, and stay motivated.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Your Transformation Awaits</h2>
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          The only thing standing between you and your goals is discipline. Are you ready to build the bridge?
        </p>
        <Link href="/register">
          <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white px-8 py-3">
            I'm Ready, Let's Go!
          </Button>
        </Link>
      </section>

  
    </div>
  )
}
