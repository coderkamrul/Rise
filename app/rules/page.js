import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TASKS } from "@/lib/tasks"
import UnifiedHeader from "@/components/UnifiedHeader"

export default function RulesPage() {
  const starterTasks = TASKS.filter((task) => task.category === "starter")
  const hardTasks = TASKS.filter((task) => task.category === "hard")

  return (
    <div className="min-h-screen bg-slate-900">
      <UnifiedHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Challenge Rules</h1>
          <p className="text-slate-400 text-lg">Understand the commitment. Follow the path.</p>
        </div>

        {/* Starter Mode */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-2">
            Starter Mode (Rules 1-4)
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {starterTasks.map((task) => (
              <Card key={task.id} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3">
                    <span className="text-2xl">{task.icon}</span>
                    {task.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 mb-4">{task.description}</p>
                  <div className="bg-slate-700 p-3 rounded-lg">
                    <p className="text-sm text-slate-400">
                      <strong>Purpose:</strong> {task.purpose}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Hard Mode */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-2">Hard Mode (Rules 5-8)</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {hardTasks.map((task) => (
              <Card key={task.id} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3">
                    <span className="text-2xl">{task.icon}</span>
                    {task.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 mb-4">{task.description}</p>
                  <div className="bg-slate-700 p-3 rounded-lg">
                    <p className="text-sm text-slate-400">
                      <strong>Purpose:</strong> {task.purpose}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

    
    </div>
  )
}
