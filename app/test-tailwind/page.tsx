export default function TestTailwindPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-card-foreground mb-4">
          Tailwind CSS v4 Test
        </h1>
        <p className="text-muted-foreground mb-6">
          If you can see this styled content, Tailwind CSS v4 is working correctly!
        </p>
        <div className="space-y-4">
          <div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-3 rounded">
            <strong>Success!</strong> Tailwind CSS v4 is properly configured.
          </div>
          <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded">
            <strong>Colors:</strong> Blue, purple, green, and gray are working.
          </div>
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-700 px-4 py-3 rounded">
            <strong>Layout:</strong> Flexbox, spacing, and shadows are working.
          </div>
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
            <strong>v4 Features:</strong> New engine and improved performance.
          </div>
        </div>
        <button className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors">
          Test Button (Hover me!)
        </button>
        
        {/* Test some v4 specific features */}
        <div className="mt-6 p-4 bg-muted rounded">
          <h3 className="font-semibold text-foreground mb-2">v4 Features Test:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-card p-2 rounded border">Grid Layout</div>
            <div className="bg-card p-2 rounded border">Responsive</div>
            <div className="bg-card p-2 rounded border">Custom Colors</div>
            <div className="bg-card p-2 rounded border">CSS Variables</div>
          </div>
        </div>
      </div>
    </div>
  )
} 